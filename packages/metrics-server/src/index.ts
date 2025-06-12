import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { rateLimit } from "express-rate-limit";
import { randomUUID } from "crypto";
import nodemailer from "nodemailer";

// Types
interface UserDocument extends mongoose.Document {
  email: string;
  apiKey: string;
  createdAt: Date;
  settings: {
    pingInterval: number;
    alertEnabled: boolean;
    alertThreshold: number;
    alertEmail: string;
  };
}

interface PingLogDocument extends mongoose.Document {
  apiKey: string;
  endpoint: string;
  timestamp: Date;
  status: number;
  responseTime: number;
  error?: string;
}

interface AuthenticatedRequest extends Request {
  user?: UserDocument;
  isAdmin?: boolean;
}

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
    alertEnabled: { type: Boolean, default: false },
    alertThreshold: { type: Number, default: 500 }, // Alert if response time > 500ms
    alertEmail: { type: String }
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
const User = mongoose.model<UserDocument>("User", userSchema);
const PingLog = mongoose.model<PingLogDocument>("PingLog", logSchema);

// Email setup for alerts
const setupMailTransport = () => {
  if (!process.env.SMTP_HOST) return null;
  
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_PORT === "465",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

const mailTransport = setupMailTransport();

// Send alert email
const sendAlertEmail = async (email: string, endpoint: string, status: number, responseTime: number) => {
  if (!mailTransport) return;
  
  try {
    await mailTransport.sendMail({
      from: process.env.FROM_EMAIL || "alerts@ping-me.com",
      to: email,
      subject: `🚨 Alert: ${endpoint} is experiencing issues`,
      html: `
        <h1>Ping-Me Alert</h1>
        <p>Your endpoint <strong>${endpoint}</strong> is experiencing issues:</p>
        <ul>
          <li>Status code: ${status}</li>
          <li>Response time: ${responseTime}ms</li>
          <li>Time: ${new Date().toLocaleString()}</li>
        </ul>
        <p>Please check your service.</p>
      `
    });
    console.log(`Alert email sent to ${email} for ${endpoint}`);
  } catch (error) {
    console.error("Failed to send alert email:", error);
  }
};

// Middleware to validate API key
const validateApiKey = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const apiKey = req.headers.authorization?.split("Bearer ")[1];
  
  if (!apiKey) {
    return res.status(401).json({ error: "API key is required" });
  }
  
  try {
    // Check if this is the admin API key
    if (process.env.ADMIN_API_KEY && apiKey === process.env.ADMIN_API_KEY) {
      req.isAdmin = true;
      return next();
    }
    
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

// Admin middleware
const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.isAdmin) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

// API routes
app.get("/api/health", (_, res: Response) => {
  // Enhanced health check with system info
  const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
    uptime: process.uptime(),
    database: {
      status: dbStatus,
      name: mongoose.connection.name
    },
    environment: process.env.NODE_ENV || "development",
    alertsEnabled: !!mailTransport
  });
});

// Log a ping
app.post("/api/log", validateApiKey, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { endpoint, status, responseTime, timestamp, error } = req.body;
    const apiKey = req.user?.apiKey;
    
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
    
    // Check if alert should be sent
    if (req.user?.settings.alertEnabled && req.user.settings.alertEmail) {
      const shouldAlert = 
        (status >= 400 || responseTime > req.user.settings.alertThreshold);
      
      if (shouldAlert) {
        await sendAlertEmail(
          req.user.settings.alertEmail,
          endpoint,
          status,
          responseTime
        );
      }
    }
    
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
app.get("/api/metrics", validateApiKey, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const apiKey = req.user?.apiKey;
    const { endpoint, limit = 100, since } = req.query;
    
    const query: any = { apiKey };
    
    // Filter by endpoint if provided
    if (endpoint) {
      query.endpoint = endpoint;
    }
    
    // Filter by time range if provided
    if (since) {
      query.timestamp = { $gte: new Date(since as string) };
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
app.get("/api/settings", validateApiKey, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    res.json({ settings: user?.settings });
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/settings", validateApiKey, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { pingInterval, alertEnabled, alertThreshold, alertEmail } = req.body;
    const user = req.user;
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Update settings
    if (pingInterval !== undefined) {
      user.settings.pingInterval = pingInterval;
    }
    
    if (alertEnabled !== undefined) {
      user.settings.alertEnabled = alertEnabled;
    }
    
    if (alertThreshold !== undefined) {
      user.settings.alertThreshold = alertThreshold;
    }
    
    if (alertEmail !== undefined) {
      user.settings.alertEmail = alertEmail;
    }
    
    await user.save();
    
    res.json({ success: true, settings: user.settings });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create a new API key (requires a unique email)
app.post("/api/users", async (req: Request, res: Response) => {
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
        alertEnabled: false,
        alertThreshold: 500
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
app.post("/api/regenerate-key", validateApiKey, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const newApiKey = randomUUID();
    
    user.apiKey = newApiKey;
    await user.save();
    
    res.json({ apiKey: newApiKey });
  } catch (error) {
    console.error("Error regenerating API key:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete user (admin only)
app.delete("/api/users/:email", validateApiKey, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email } = req.params;
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Delete all logs for this user
    await PingLog.deleteMany({ apiKey: user.apiKey });
    
    // Delete the user
    await user.deleteOne();
    
    res.json({ success: true, message: "User and all associated data deleted" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all users (admin only)
app.get("/api/users", validateApiKey, requireAdmin, async (_: Request, res: Response) => {
  try {
    const users = await User.find({}, { apiKey: 0 });
    res.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Metrics server running on http://localhost:${PORT}`);
});
