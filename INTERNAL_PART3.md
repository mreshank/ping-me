# Ping-Me: Internal Documentation - Part 3

## Metrics Server Architecture & Implementation

### Overview

The `@ping-me/metrics-server` is an optional but powerful component of the Ping-Me ecosystem. It provides a centralized service for collecting, storing, and analyzing ping data from multiple applications and endpoints.

```
┌───────────────────────────────────────────────────────────────────┐
│                     Metrics Server Architecture                    │
└───────────────────────────────────────────────────────────────────┘
                              │
      ┌─────────────┬─────────┴─────────┬─────────────┐
      │             │                   │             │
┌─────▼─────┐ ┌─────▼─────┐       ┌─────▼─────┐ ┌─────▼─────┐
│ Express   │ │ MongoDB   │       │ User      │ │ Alert     │
│ API       │ │ Database  │       │ Management│ │ System    │
└───────────┘ └───────────┘       └───────────┘ └───────────┘
```

### Core Components

1. **Express API Server**:
   - RESTful API for data collection and retrieval
   - Authentication using API keys
   - Rate limiting for security

2. **MongoDB Database**:
   - Stores ping logs, user data, and settings
   - Indexed for efficient querying
   - Automatic cleanup of old data

3. **User Management System**:
   - API key generation and validation
   - User settings and preferences
   - Admin capabilities

4. **Alert System**:
   - Email notifications for downtime or performance issues
   - Configurable thresholds
   - SMTP integration

### Database Schema

The metrics server uses MongoDB with the following schema:

#### User Schema

```typescript
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
```

#### Ping Log Schema

```typescript
interface PingLogDocument extends mongoose.Document {
  apiKey: string;
  endpoint: string;
  timestamp: Date;
  status: number;
  responseTime: number;
  error?: string;
}

const logSchema = new mongoose.Schema({
  apiKey: { type: String, required: true, index: true },
  endpoint: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  status: { type: Number, required: true },
  responseTime: { type: Number, required: true },
  error: { type: String }
});
```

### API Endpoints

The metrics server exposes the following API endpoints:

#### Health Check

```
GET /api/health
```

Returns server health status, database connection, and environment information.

#### Log Ping Data

```
POST /api/log
```

Accepts ping data from clients and stores it in the database. Requires API key authentication.

#### Get Metrics

```
GET /api/metrics
```

Retrieves metrics and statistics for endpoints. Supports filtering by endpoint, time range, and pagination.

#### User Settings

```
GET /api/settings
POST /api/settings
```

Retrieves and updates user settings, including alert configuration.

#### User Management

```
POST /api/users
POST /api/regenerate-key
DELETE /api/users/:email (admin only)
GET /api/users (admin only)
```

Endpoints for user creation, API key management, and user administration.

### Authentication & Authorization

The metrics server implements a multi-layered security approach:

1. **API Key Authentication**:
   ```typescript
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
   ```

2. **Admin Authorization**:
   ```typescript
   const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
     if (!req.isAdmin) {
       return res.status(403).json({ error: "Admin access required" });
     }
     next();
   };
   ```

3. **Rate Limiting**:
   ```typescript
   const apiLimiter = rateLimit({
     windowMs: 60 * 1000, // 1 minute
     max: 100, // limit each IP to 100 requests per windowMs
     standardHeaders: true,
     legacyHeaders: false,
     message: { error: "Too many requests, please try again later." }
   });
   
   app.use("/api", apiLimiter);
   ```

### Alert System

The alert system monitors ping data and sends notifications when issues are detected:

1. **Alert Configuration**:
   - Users can enable/disable alerts
   - Set custom thresholds for response time
   - Configure notification email

2. **Alert Triggers**:
   - HTTP status codes >= 400
   - Response times exceeding threshold
   - Connection failures

3. **Email Notifications**:
   ```typescript
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
   ```

### Data Management

The metrics server implements data management strategies to handle large volumes of ping data:

1. **Automatic Data Cleanup**:
   ```typescript
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
   ```

2. **Aggregation for Statistics**:
   ```typescript
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
   ```

3. **Pagination and Filtering**:
   ```typescript
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
   ```

### Deployment Considerations

The metrics server is designed for flexible deployment:

1. **Environment Variables**:
   - MongoDB connection string
   - Port configuration
   - Security settings (API keys)
   - Email configuration

2. **Containerization**:
   - Docker support
   - Docker Compose for development
   - Kubernetes-ready

3. **Scalability**:
   - Horizontal scaling
   - Database indexing
   - Connection pooling

4. **Monitoring**:
   - Health check endpoint
   - Logging
   - Error reporting

## CLI Tools & Implementation

### Overview

The Ping-Me CLI tools provide command-line interfaces for pinging endpoints without requiring code integration. These tools are implemented in the main `ping-me` package and exposed through various alias packages.

### CLI Architecture

```
┌───────────────────────────────────────────────────────────────────┐
│                        CLI Architecture                            │
└───────────────────────────────────────────────────────────────────┘
                              │
      ┌─────────────┬─────────┴─────────┬─────────────┐
      │             │                   │             │
┌─────▼─────┐ ┌─────▼─────┐       ┌─────▼─────┐ ┌─────▼─────┐
│ Command   │ │ Options   │       │ Endpoint  │ │ Process   │
│ Parser    │ │ Processor │       │ Pinger    │ │ Manager   │
└───────────┘ └───────────┘       └───────────┘ └───────────┘
```

### Implementation Details

The CLI implementation is located in `packages/ping-me/src/cli.ts`:

```typescript
#!/usr/bin/env node

import { initialize } from './index';

// Parse command line arguments
const args = process.argv.slice(2);
const options: Record<string, any> = {};

// Simple argument parsing
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg.startsWith('--')) {
    const key = arg.slice(2);
    const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
    options[key] = value;
    if (value !== true) {
      i++; // Skip the next argument as it's a value
    }
  }
}

// Show help if requested
if (options.help || options.h) {
  console.log(`
  Usage: ping-me [options]
  
  Options:
    --apiKey, -k       Your Ping-Me API key
    --interval, -i     Ping interval in milliseconds (default: 300000)
    --url, -u          URL to ping (can be used multiple times)
    --env, -e          Load endpoints from environment variables with this prefix (default: PING_ME_ENDPOINT_)
    --help, -h         Show this help message
  
  Examples:
    ping-me --apiKey abc123 --url https://myapp.com/api
    ping-me --interval 60000 --env MY_APP_
  `);
  process.exit(0);
}

// Allow for short option names
if (options.k && !options.apiKey) options.apiKey = options.k;
if (options.i && !options.interval) options.interval = options.i;
if (options.u && !options.url) options.url = options.u;
if (options.e && !options.env) options.env = options.e;

// Convert interval to number if provided
if (options.interval && typeof options.interval === 'string') {
  options.interval = parseInt(options.interval, 10);
}

// Initialize the service
const service = initialize({
  ...options,
  autoStart: true
});

console.log(`
🚀 Ping-Me service started
${options.url ? `🔗 Endpoints: ${options.url}` : ''}
⏱️  Interval: ${options.interval || 300000}ms
`);

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping Ping-Me service...');
  service.stop();
  process.exit(0);
});

// Keep the process running
process.stdin.resume(); 
```

### Key Features

1. **Command Parsing**:
   - Custom argument parser for simplicity
   - Support for both long and short option names
   - Help message with examples

2. **Environment Variable Support**:
   - Can load endpoints from environment variables
   - Configurable prefix for grouping

3. **Service Initialization**:
   - Uses the same `initialize` function as the programmatic API
   - Passes CLI options to the core engine

4. **Process Management**:
   - Keeps the Node.js process alive with `process.stdin.resume()`
   - Handles graceful shutdown with SIGINT handler

### Binary Aliases

The CLI is exposed through multiple binary names:

```json
"bin": {
  "ping-me": "./dist/index.js",
  "keep-server-alive": "./dist/cli.js", 
  "keepwake": "./dist/cli.js",
  "keepawake": "./dist/cli.js"
}
```

This allows users to invoke the CLI using any of these commands:

```bash
npx ping-me --url https://example.com
npx keep-server-alive --url https://example.com
npx keepwake --url https://example.com
npx keepawake --url https://example.com
```

### Environment Variable Loading

The CLI can load endpoints from environment variables:

```typescript
// This would be implemented in the core engine
function loadEndpointsFromEnv(prefix = 'PING_ME_ENDPOINT_') {
  const endpoints = [];
  
  for (const [key, value] of Object.entries(process.env)) {
    if (key.startsWith(prefix) && value) {
      endpoints.push(value);
    }
  }
  
  return endpoints;
}
```

This allows for flexible configuration in various environments:

```bash
# Define endpoints
export PING_ME_ENDPOINT_1=https://api1.example.com
export PING_ME_ENDPOINT_2=https://api2.example.com

# Load them with the default prefix
npx ping-me --env PING_ME_ENDPOINT_
```

## Alias Packages

### Overview

Ping-Me includes several alias packages that redirect to the main `ping-me` package. These packages exist for historical reasons and backward compatibility.

```
┌───────────────────────────────────────────────────────────────────┐
│                       Alias Package Structure                      │
└───────────────────────────────────────────────────────────────────┘
                              │
      ┌─────────────┬─────────┴─────────┬─────────────┐
      │             │                   │             │
┌─────▼─────┐ ┌─────▼─────┐       ┌─────▼─────┐ ┌─────▼─────┐
│ index.js  │ │ package   │       │ postinstall│ │ CLI      │
│ (Proxy)   │ │ .json     │       │ .js        │ │ Binaries │
└───────────┘ └───────────┘       └───────────┘ └───────────┘
```

### Alias Packages

1. **keep-server-alive**:
   - Original name of the project
   - Redirects to `ping-me`

2. **keepwake**:
   - Shorter alternative name
   - Redirects to `ping-me`

3. **keepawake**:
   - Alternative spelling
   - Redirects to `ping-me`

### Implementation

Each alias package has a minimal implementation:

#### index.js

```javascript
'use strict';

// This is just a proxy package that redirects to ping-me
module.exports = require('ping-me');
```

#### package.json

```json
{
  "name": "keep-server-alive",
  "version": "1.0.0",
  "description": "Keep your free tier backends alive with auto-pinging and monitoring",
  "main": "index.js",
  "scripts": {
    "postinstall": "node postinstall.js"
  },
  "files": [
    "index.js",
    "postinstall.js"
  ],
  "dependencies": {
    "ping-me": "file:../ping-me"
  },
  "bin": {
    "keep-server-alive": "./node_modules/ping-me/dist/cli.js",
    "ping-me": "./node_modules/ping-me/dist/cli.js",
    "keepwake": "./node_modules/ping-me/dist/cli.js"
  }
}
```

#### postinstall.js

```javascript
#!/usr/bin/env node

// Don't show the message in CI environments or when installed as a dependency
if (process.env.CI || process.env.NODE_ENV === 'production') {
  process.exit(0);
}

console.log(`
🚀 Thanks for installing keep-server-alive!

💡 This is an alias package for ping-me. You can also install it directly using:
   npm install ping-me

   Other available aliases:
   - keepwake
   - keepawake

📚 Documentation: https://ping-me.eshank.tech/docs
🐛 Issues: https://github.com/mreshank/ping-me/issues
💬 Support: https://github.com/mreshank/ping-me/discussions

To get started, import the package in your code:

const keepServerAlive = require('keep-server-alive');
// or 
import keepServerAlive from 'keep-server-alive';

keepServerAlive.initialize({
  apiKey: 'your-api-key',
  endpoints: ['https://your-app.com/api']
});

Happy pinging! 🎉
`);
```

### Binary Forwarding

Each alias package forwards CLI binaries to the main package:

```json
"bin": {
  "keep-server-alive": "./node_modules/ping-me/dist/cli.js",
  "ping-me": "./node_modules/ping-me/dist/cli.js",
  "keepwake": "./node_modules/ping-me/dist/cli.js"
}
```

This allows users to install any of the alias packages and use the CLI with any of the supported command names.

### Postinstall Message

The alias packages include a postinstall script that displays a helpful message to users, explaining:

1. That this is an alias package for `ping-me`
2. How to get started with the package
3. Where to find documentation and support

The message is skipped in CI environments and when installed as a dependency to avoid cluttering build logs. 