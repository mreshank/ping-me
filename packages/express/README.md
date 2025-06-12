# @ping-me/express

Express middleware for Ping-Me to keep your Express.js applications alive and monitor their health.

[![npm version](https://img.shields.io/npm/v/@ping-me/express)](https://www.npmjs.com/package/@ping-me/express)
[![License](https://img.shields.io/github/license/mreshank/ping-me)](https://github.com/mreshank/ping-me/blob/main/LICENSE)

## Overview

`@ping-me/express` provides seamless integration of Ping-Me with Express.js applications. This package:

- Adds a dedicated ping endpoint to your Express app
- Automatically registers your service with the Ping-Me monitoring system
- Provides easy configuration options for monitoring settings
- Keeps your free-tier backend services alive by preventing sleep cycles

## Installation

```bash
npm install @ping-me/express

# or with yarn
yarn add @ping-me/express

# or with pnpm
pnpm add @ping-me/express
```

## Basic Usage

```javascript
const express = require('express');
const { withPingMe } = require('@ping-me/express');

const app = express();

// Add Ping-Me to your app with default settings
withPingMe(app, {
  apiKey: 'your-api-key-here'
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
```

With TypeScript:

```typescript
import express from 'express';
import { withPingMe } from '@ping-me/express';

const app = express();

withPingMe(app, {
  apiKey: 'your-api-key-here'
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
```

## Configuration Options

The `withPingMe` function accepts the following options:

```typescript
interface PingMeExpressOptions {
  /**
   * Your Ping-Me API key
   */
  apiKey: string;
  
  /**
   * The route to use for the ping endpoint (default: '/ping')
   */
  route?: string;
  
  /**
   * Ping interval in milliseconds (default: 5 minutes)
   */
  interval?: number;
  
  /**
   * Whether to log ping events to the console (default: false)
   */
  log?: boolean;
  
  /**
   * Custom message to return on the ping endpoint (default: 'OK')
   */
  message?: string;
  
  /**
   * Whether to automatically start pinging (default: true)
   */
  autoStart?: boolean;
  
  /**
   * Custom API endpoint URL (advanced usage)
   */
  apiEndpoint?: string;
  
  /**
   * Base URL of your application (will be auto-detected if not provided)
   */
  baseUrl?: string;
}
```

### Example with All Options

```javascript
const express = require('express');
const { withPingMe } = require('@ping-me/express');

const app = express();

withPingMe(app, {
  apiKey: 'your-api-key-here',
  route: '/health-check',
  interval: 60000, // 1 minute
  log: true,
  message: 'Service is healthy',
  autoStart: true,
  baseUrl: 'https://your-app-domain.com'
});

app.listen(3000);
```

## API Reference

### `withPingMe(app, options)`

Adds Ping-Me functionality to an Express application.

#### Parameters

- `app`: An Express application instance
- `options`: Configuration options for Ping-Me (see [Configuration Options](#configuration-options))

#### Returns

The function returns the Express application instance for chaining.

### `createPingMiddleware(options)`

Creates an Express middleware that responds to ping requests.

#### Parameters

- `options`: Configuration options for the middleware

#### Returns

An Express middleware function that handles ping requests.

### Advanced Usage Examples

#### Custom Ping Response

If you want to provide a custom response for the ping endpoint:

```javascript
const express = require('express');
const { withPingMe } = require('@ping-me/express');

const app = express();

withPingMe(app, {
  apiKey: 'your-api-key-here',
  message: JSON.stringify({
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  })
});

app.listen(3000);
```

#### Health Check with Additional Information

You can customize the ping endpoint to include additional health information:

```javascript
const express = require('express');
const { createPingMiddleware } = require('@ping-me/express');
const db = require('./db'); // Your database connection

const app = express();

// Create a custom health check route
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    const dbStatus = await db.ping();
    
    // Get memory usage
    const memoryUsage = process.memoryUsage();
    
    // Return health information
    res.json({
      status: 'healthy',
      uptime: process.uptime(),
      database: dbStatus ? 'connected' : 'disconnected',
      memory: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024) + 'MB',
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// Set up Ping-Me with the custom health route
withPingMe(app, {
  apiKey: 'your-api-key-here',
  route: '/health' // Use the same route we defined above
});

app.listen(3000);
```

#### Using with Environment Variables

```javascript
const express = require('express');
const { withPingMe } = require('@ping-me/express');
require('dotenv').config();

const app = express();

// Get configuration from environment variables
const pingMeOptions = {
  apiKey: process.env.PING_ME_API_KEY,
  route: process.env.PING_ME_ROUTE || '/ping',
  interval: parseInt(process.env.PING_ME_INTERVAL || '300000', 10),
  log: process.env.PING_ME_LOG === 'true',
  autoStart: process.env.PING_ME_AUTO_START !== 'false'
};

// Only add Ping-Me if API key is provided
if (pingMeOptions.apiKey) {
  withPingMe(app, pingMeOptions);
  console.log(`Ping-Me initialized with route: ${pingMeOptions.route}`);
} else {
  console.warn('Ping-Me API key not provided. Ping-Me is disabled.');
}

app.listen(3000);
```

#### Multiple Applications on Different Ports

If you're running multiple Express applications on different ports:

```javascript
const express = require('express');
const { withPingMe } = require('@ping-me/express');

// API server
const apiApp = express();
withPingMe(apiApp, {
  apiKey: 'your-api-key-here',
  baseUrl: 'https://api.example.com',
  route: '/health'
});
apiApp.listen(3000);

// Admin server
const adminApp = express();
withPingMe(adminApp, {
  apiKey: 'your-api-key-here',
  baseUrl: 'https://admin.example.com',
  route: '/health'
});
adminApp.listen(3001);
```

#### With Express Router

You can also use Ping-Me with Express Router:

```javascript
const express = require('express');
const { createPingMiddleware } = require('@ping-me/express');

const app = express();
const router = express.Router();

// Add the ping middleware to a router
router.get('/health', createPingMiddleware({
  message: 'API router is healthy'
}));

// Add other routes to the router
router.get('/users', (req, res) => {
  res.json({ users: [] });
});

// Use the router with a path prefix
app.use('/api', router);

// Initialize Ping-Me for the main app
withPingMe(app, {
  apiKey: 'your-api-key-here',
  route: '/api/health' // Match the router path + health endpoint
});

app.listen(3000);
```

## Integration with Other Middleware

### Rate Limiting

When using rate limiting middleware, make sure to exclude the ping endpoint:

```javascript
const express = require('express');
const { withPingMe } = require('@ping-me/express');
const rateLimit = require('express-rate-limit');

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  skip: (req) => req.path === '/ping' // Skip rate limiting for ping endpoint
});

// Apply rate limiting to all requests
app.use(limiter);

// Add Ping-Me
withPingMe(app, {
  apiKey: 'your-api-key-here'
});

app.listen(3000);
```

### Authentication

If your app uses authentication, make sure to exclude the ping endpoint:

```javascript
const express = require('express');
const { withPingMe } = require('@ping-me/express');
const jwt = require('express-jwt');

const app = express();

// JWT authentication middleware
const authenticate = jwt({
  secret: 'your-secret',
  algorithms: ['HS256']
}).unless({
  path: ['/ping'] // Exclude ping endpoint from authentication
});

// Apply authentication to all routes
app.use(authenticate);

// Add Ping-Me
withPingMe(app, {
  apiKey: 'your-api-key-here'
});

app.listen(3000);
```

## Troubleshooting

### Common Issues and Solutions

#### Ping Endpoint Not Responding

If the ping endpoint isn't responding:

1. Check that the route is accessible from outside your network
2. Verify that no middleware is blocking the route
3. Check your server logs for errors
4. Try accessing the ping endpoint manually in a browser or with curl

```bash
curl http://localhost:3000/ping
```

#### Service Not Being Monitored

If your service isn't being monitored:

1. Verify that your API key is correct
2. Check that the ping endpoint is accessible from the internet
3. Verify that the ping interval is appropriate (not too long)
4. Check the Ping-Me dashboard for any alerts or errors

#### High CPU or Memory Usage

If the ping service is using too much CPU or memory:

1. Increase the ping interval to reduce frequency
2. Check for other issues in your application that might be causing high resource usage
3. Ensure you're not making unnecessary database queries or API calls in your ping endpoint

## Best Practices

### Security

- **Public Access**: The ping endpoint is designed to be publicly accessible. Don't put sensitive information in the response.
- **Rate Limiting**: Consider applying rate limiting to the ping endpoint to prevent abuse, but make sure it doesn't block legitimate ping requests.
- **SSL/TLS**: Always use HTTPS in production to ensure secure communication.

### Performance

- **Lightweight Endpoint**: Keep your ping endpoint lightweight. Avoid heavy database queries or external API calls.
- **Appropriate Interval**: Choose a ping interval that balances keeping your service alive with minimizing unnecessary traffic.
- **Monitoring**: Use the Ping-Me dashboard to monitor the performance of your ping endpoint.

### Reliability

- **Error Handling**: Implement robust error handling in your application to ensure it remains stable even if there are issues with the ping service.
- **Logging**: Enable logging to help diagnose any issues with the ping service.
- **Graceful Shutdown**: Ensure your application handles shutdown gracefully to avoid issues with the ping service.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details. 