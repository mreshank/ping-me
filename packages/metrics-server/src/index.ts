import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { rateLimit } from "express-rate-limit";
import { randomUUID } from "crypto";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." }
});

app.use("/api", apiLimiter);

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ping-me";

mongoose.connect(MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Define schemas
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  apiKey: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  settings: {
    pingInterval: { type: Number, default: 300000 }, // 5 minutes
    alertEnabled: { type: Boolean, default: false }
  }
});

const logSchema = new mongoose.Schema({
  apiKey: { type: String, required: true, index: true },
  endpoint: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  status: { type: Number, required: true },
  responseTime: { type: Number, required: true },
  error: { type: String }
});

// Create models
const User = mongoose.model("User", userSchema);
const PingLog = mongoose.model("PingLog", logSchema);

// Middleware to validate API key
const validateApiKey = async (req, res, next) => {
  const apiKey = req.headers.authorization?.split("Bearer ")[1];
  
  if (!apiKey) {
    return res.status(401).json({ error: "API key is required" });
  }
  
  try {
    const user = await User.findOne({ apiKey });
    
    if (!user) {
      return res.status(401).json({ error: "Invalid API key" });
    }
    
    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error("Error validating API key:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// API routes
app.get("/api/health", (_, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Log a ping
app.post("/api/log", validateApiKey, async (req, res) => {
  try {
    const { endpoint, status, responseTime, timestamp, error } = req.body;
    const apiKey = req.user.apiKey;
    
    // Validate required fields
    if (!endpoint || status === undefined || responseTime === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    // Create a new log entry
    const log = await PingLog.create({
      apiKey,
      endpoint,
      status,
      responseTime,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      error
    });
    
    // Delete old logs if there are too many for this user and endpoint
    const MAX_LOGS_PER_ENDPOINT = process.env.MAX_LOGS_PER_ENDPOINT || 1000;
    const count = await PingLog.countDocuments({ apiKey, endpoint });
    
    if (count > MAX_LOGS_PER_ENDPOINT) {
      // Remove oldest logs beyond the limit
      const toRemove = count - MAX_LOGS_PER_ENDPOINT;
      
      await PingLog.find({ apiKey, endpoint })
        .sort({ timestamp: 1 })
        .limit(toRemove)
        .deleteMany()
        .exec();
    }
    
    res.status(201).json({ success: true, id: log._id });
  } catch (error) {
    console.error("Error logging ping:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get metrics for user
app.get("/api/metrics", validateApiKey, async (req, res) => {
  try {
    const apiKey = req.user.apiKey;
    const { endpoint, limit = 100, since } = req.query;
    
    const query = { apiKey };
    
    // Filter by endpoint if provided
    if (endpoint) {
      query.endpoint = endpoint;
    }
    
    // Filter by time range if provided
    if (since) {
      query.timestamp = { $gte: new Date(since) };
    }
    
    // Get logs with pagination
    const logs = await PingLog.find(query)
      .sort({ timestamp: -1 })
      .limit(Number(limit))
      .exec();
    
    // Get statistics
    const stats = await PingLog.aggregate([
      { $match: query },
      { $group: {
        _id: "$endpoint",
        totalCount: { $sum: 1 },
        avgResponseTime: { $avg: "$responseTime" },
        successCount: { 
          $sum: { 
            $cond: [{ $and: [{ $gte: ["$status", 200] }, { $lt: ["$status", 400] }] }, 1, 0] 
          } 
        },
        failCount: { 
          $sum: { 
            $cond: [{ $or: [{ $lt: ["$status", 200] }, { $gte: ["$status", 400] }] }, 1, 0] 
          } 
        },
        latestTimestamp: { $max: "$timestamp" }
      }}
    ]);
    
    res.json({
      logs,
      stats,
      totalEndpoints: stats.length
    });
  } catch (error) {
    console.error("Error fetching metrics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// User settings
app.get("/api/settings", validateApiKey, async (req, res) => {
  try {
    const user = req.user;
    res.json({ settings: user.settings });
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/settings", validateApiKey, async (req, res) => {
  try {
    const { pingInterval, alertEnabled } = req.body;
    const user = req.user;
    
    // Update settings
    if (pingInterval !== undefined) {
      user.settings.pingInterval = pingInterval;
    }
    
    if (alertEnabled !== undefined) {
      user.settings.alertEnabled = alertEnabled;
    }
    
    await user.save();
    
    res.json({ success: true, settings: user.settings });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create a new API key (requires a unique email)
app.post("/api/users", async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return res.status(409).json({ error: "User with this email already exists" });
    }
    
    // Create a new user with a random API key
    const apiKey = randomUUID();
    
    const user = await User.create({
      email,
      apiKey,
      settings: {
        pingInterval: 300000,
        alertEnabled: false
      }
    });
    
    res.status(201).json({
      apiKey,
      settings: user.settings
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Regenerate API key
app.post("/api/regenerate-key", validateApiKey, async (req, res) => {
  try {
    const user = req.user;
    const newApiKey = randomUUID();
    
    user.apiKey = newApiKey;
    await user.save();
    
    res.json({ apiKey: newApiKey });
  } catch (error) {
    console.error("Error regenerating API key:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Metrics server running on http://localhost:${PORT}`);
});
