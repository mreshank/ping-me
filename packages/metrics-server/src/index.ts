import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { rateLimit } from "express-rate-limit";
import { randomUUID } from "crypto";
import nodemailer from "nodemailer";

// Load environment variables early
dotenv.config();

// Types definitions
interface UserSettings {
  pingInterval: number;
  alertEnabled: boolean;
  alertThreshold: number;
  alertEmail: string;
}

interface UserDocument extends mongoose.Document {
  email: string;
  apiKey: string;
  createdAt: Date;
  settings: UserSettings;
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

interface QueryParams {
  apiKey: string;
  endpoint?: string;
  timestamp?: { $gte: Date };
}

// Constants
const DEFAULT_PORT = 5000;
const DEFAULT_LOGS_LIMIT = 1000;
const DEFAULT_PING_INTERVAL = 300000; // 5 minutes
const DEFAULT_ALERT_THRESHOLD = 500; // ms

// Initialize Express app
const app = express();

// Apply core middleware
app.use(express.json());
app.use(cors());

// Configure rate limiting
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000"), // Default: 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"), // Default: 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." }
});

// Apply rate limiter to API routes
app.use("/api", apiLimiter as any);

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ping-me";

// Define schemas
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  apiKey: { type: String, required: true, unique: true, index: true },
  createdAt: { type: Date, default: Date.now },
  settings: {
    pingInterval: { type: Number, default: DEFAULT_PING_INTERVAL },
    alertEnabled: { type: Boolean, default: false },
    alertThreshold: { type: Number, default: DEFAULT_ALERT_THRESHOLD },
    alertEmail: { type: String, trim: true, lowercase: true }
  }
});

const logSchema = new mongoose.Schema({
  apiKey: { type: String, required: true, index: true },
  endpoint: { type: String, required: true, index: true },
  timestamp: { type: Date, default: Date.now, index: true },
  status: { type: Number, required: true },
  responseTime: { type: Number, required: true },
  error: { type: String }
});

// Add TTL index to automatically expire old logs (30 days)
logSchema.index({ timestamp: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

// Create models
const User = mongoose.model<UserDocument>("User", userSchema);
const PingLog = mongoose.model<PingLogDocument>("PingLog", logSchema);

// Email configuration
let mailTransport: nodemailer.Transporter | null = null;

// Set up email transport if configured
const setupMailTransport = (): nodemailer.Transporter | null => {
  if (!process.env.SMTP_HOST) {
    return null;
  }
  
  try {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } catch (error) {
    console.error("Failed to create mail transport:", error);
    return null;
  }
};

// Send alert email
const sendAlertEmail = async (email: string, endpoint: string, status: number, responseTime: number): Promise<void> => {
  if (!mailTransport) {
    return;
  }
  
  const subject = `🚨 Alert: ${endpoint} is experiencing issues`;
  const html = `
    <h1>Ping-Me Alert</h1>
    <p>Your endpoint <strong>${endpoint}</strong> is experiencing issues:</p>
    <ul>
      <li>Status code: ${status}</li>
      <li>Response time: ${responseTime}ms</li>
      <li>Time: ${new Date().toLocaleString()}</li>
    </ul>
    <p>Please check your service.</p>
  `;
  
  try {
    await mailTransport.sendMail({
      from: process.env.FROM_EMAIL || "alerts@ping-me.com",
      to: email,
      subject,
      html
    });
    console.log(`Alert email sent to ${email} for ${endpoint}`);
  } catch (error) {
    console.error("Failed to send alert email:", error);
  }
};

// Authentication middleware
const validateApiKey = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  const apiKey = authHeader?.startsWith("Bearer ") 
    ? authHeader.substring(7) 
    : null;
  
  if (!apiKey) {
    res.status(401).json({ error: "API key is required" });
    return;
  }
  
  try {
    // Check for admin API key
    if (process.env.ADMIN_API_KEY && apiKey === process.env.ADMIN_API_KEY) {
      req.isAdmin = true;
      next();
      return;
    }
    
    // Find user by API key
    const user = await User.findOne({ apiKey }).lean().exec();
    
    if (!user) {
      res.status(401).json({ error: "Invalid API key" });
      return;
    }
    
    // Attach user to request
    req.user = user as UserDocument;
    next();
  } catch (error) {
    console.error("Error validating API key:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Admin middleware
const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.isAdmin) {
    res.status(403).json({ error: "Admin access required" });
    return;
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
      res.status(400).json({ error: "Missing required fields" });
      return;
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
    const user = req.user;
    if (user?.settings.alertEnabled && user.settings.alertEmail) {
      const shouldAlert = (
        status >= 400 || 
        responseTime > user.settings.alertThreshold
      );
      
      if (shouldAlert) {
        // Send alert in background, don't wait
        sendAlertEmail(
          user.settings.alertEmail,
          endpoint,
          status,
          responseTime
        ).catch(e => console.error("Alert error:", e));
      }
    }
    
    // Delete old logs if there are too many for this user and endpoint
    const MAX_LOGS = parseInt(process.env.MAX_LOGS_PER_ENDPOINT || String(DEFAULT_LOGS_LIMIT));
    
    // Use a background cleanup process
    PingLog.countDocuments({ apiKey, endpoint })
      .exec()
      .then(count => {
        if (count > MAX_LOGS) {
          const toRemove = count - MAX_LOGS;
          
          PingLog.find({ apiKey, endpoint })
            .sort({ timestamp: 1 })
            .limit(toRemove)
            .deleteMany()
            .exec()
            .catch(err => console.error("Error cleaning up old logs:", err));
        }
      })
      .catch(err => console.error("Error counting logs:", err));
    
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
    if (!apiKey) {
      res.status(400).json({ error: "API key required" });
      return;
    }
    
    const { endpoint } = req.query;
    const limit = parseInt(req.query.limit as string || "100");
    const since = req.query.since as string;
    
    // Build query
    const query: QueryParams = { apiKey };
    
    // Filter by endpoint if provided
    if (endpoint) {
      query.endpoint = endpoint as string;
    }
    
    // Filter by time range if provided
    if (since) {
      query.timestamp = { $gte: new Date(since) };
    }
    
    // Run queries in parallel
    const [logs, stats] = await Promise.all([
      // Get logs with pagination
      PingLog.find(query)
        .sort({ timestamp: -1 })
        .limit(limit)
        .lean()
        .exec(),
      
      // Get statistics
      PingLog.aggregate([
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
      ])
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

// User settings endpoints
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
      res.status(404).json({ error: "User not found" });
      return;
    }
    
    // Update settings - only modify fields that are provided
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
      res.status(400).json({ error: "Email is required" });
      return;
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email }).lean().exec();
    
    if (existingUser) {
      res.status(409).json({ error: "User with this email already exists" });
      return;
    }
    
    // Create a new user with a random API key
    const apiKey = randomUUID();
    
    const user = await User.create({
      email,
      apiKey,
      settings: {
        pingInterval: DEFAULT_PING_INTERVAL,
        alertEnabled: false,
        alertThreshold: DEFAULT_ALERT_THRESHOLD
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
      res.status(404).json({ error: "User not found" });
      return;
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
      res.status(404).json({ error: "User not found" });
      return;
    }
    
    // Delete user and logs in parallel
    await Promise.all([
      // Delete all logs for this user
      PingLog.deleteMany({ apiKey: user.apiKey }),
      
      // Delete the user
      user.deleteOne()
    ]);
    
    res.json({ success: true, message: "User and all associated data deleted" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all users (admin only)
app.get("/api/users", validateApiKey, requireAdmin, async (_: Request, res: Response) => {
  try {
    const users = await User.find({}, { apiKey: 0 }).lean().exec();
    res.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Initialize resources
async function initialize() {
  // Connect to MongoDB
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
  
  // Initialize mail transport
  mailTransport = setupMailTransport();
  if (mailTransport) {
    console.log("✅ Email alerts configured");
  } else {
    console.log("ℹ️ Email alerts not configured");
  }
  
  // Start the server
  const PORT = parseInt(process.env.PORT || String(DEFAULT_PORT));
  
  app.listen(PORT, () => {
    console.log(`✅ Metrics server running on http://localhost:${PORT}`);
  });
}

// Start server
initialize().catch(err => {
  console.error("❌ Failed to initialize server:", err);
  process.exit(1);
});
