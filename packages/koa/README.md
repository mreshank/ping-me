# @ping-me/koa

Koa middleware for Ping-Me to keep your Koa applications alive and monitor their health.

[![npm version](https://img.shields.io/npm/v/@ping-me/koa)](https://www.npmjs.com/package/@ping-me/koa)
[![License](https://img.shields.io/github/license/mreshank/ping-me)](https://github.com/mreshank/ping-me/blob/main/LICENSE)

## Overview

`@ping-me/koa` provides seamless integration of Ping-Me with [Koa](https://koajs.com/) applications. This package:

- Adds a dedicated ping endpoint to your Koa app
- Automatically registers your service with the Ping-Me monitoring system
- Provides easy configuration options for monitoring settings
- Keeps your free-tier backend services alive by preventing sleep cycles

## Installation

```bash
npm install @ping-me/koa koa-router

# or with yarn
yarn add @ping-me/koa koa-router

# or with pnpm
pnpm add @ping-me/koa koa-router
```

Note: This package requires `koa-router` as a peer dependency.

## Basic Usage

```javascript
const Koa = require('koa');
const Router = require('koa-router');
const { withPingMe } = require('@ping-me/koa');

const app = new Koa();
const router = new Router();

// Add routes to the router
router.get('/', ctx => {
  ctx.body = 'Hello Koa!';
});

// Add Ping-Me to your app with default settings
withPingMe(app, router, {
  apiKey: 'your-api-key-here',
  baseUrl: 'https://your-app.example.com' // Optional but recommended
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
```

With TypeScript:

```typescript
import Koa from 'koa';
import Router from 'koa-router';
import { withPingMe, PingMeKoaOptions } from '@ping-me/koa';

const app = new Koa();
const router = new Router();

// Add routes to the router
router.get('/', ctx => {
  ctx.body = 'Hello Koa!';
});

const pingMeOptions: PingMeKoaOptions = {
  apiKey: 'your-api-key-here',
  baseUrl: 'https://your-app.example.com',
  route: '/health'
};

withPingMe(app, router, pingMeOptions);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
```

## Configuration Options

The `withPingMe` function accepts the following options:

```typescript
interface PingMeKoaOptions {
  /**
   * Your Ping-Me API key
   */
  apiKey?: string;
  
  /**
   * The route to use for the ping endpoint (default: '/ping-me')
   */
  route?: string;
  
  /**
   * Ping interval in milliseconds (default: 5 minutes)
   */
  interval?: number;
  
  /**
   * Whether to log ping events to the console (default: true)
   */
  log?: boolean;
  
  /**
   * Custom message to return on the ping endpoint
   * (default: 'Ping-Me: Koa server is up and running')
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
   * Base URL of your application
   * (defaults to http://localhost:3000 if not provided)
   */
  baseUrl?: string;
}
```

### Example with All Options

```javascript
const Koa = require('koa');
const Router = require('koa-router');
const { withPingMe } = require('@ping-me/koa');

const app = new Koa();
const router = new Router();

withPingMe(app, router, {
  apiKey: 'your-api-key-here',
  route: '/health-check',
  interval: 60000, // 1 minute
  log: true,
  message: 'Service is healthy',
  autoStart: true,
  baseUrl: 'https://your-app-domain.com',
  apiEndpoint: 'https://custom-ping-me-api.example.com' // Optional custom API endpoint
});

app.listen(3000);
```

## API Reference

### `withPingMe(app, router, options)`

Adds Ping-Me functionality to a Koa application.

#### Parameters

- `app`: A Koa application instance
- `router`: A koa-router instance
- `options`: Configuration options for Ping-Me (see [Configuration Options](#configuration-options))

#### Returns

The function returns an object with the following properties:

- `stopPinging`: A function that stops the pinging when called
- `pingUrl`: The full URL that will be pinged

### `withPingMeKoa`

This is an alias for `withPingMe` for backward compatibility.

## Advanced Usage Examples

### Custom Health Check Response

You can customize the ping endpoint response:

```javascript
const Koa = require('koa');
const Router = require('koa-router');
const { withPingMe } = require('@ping-me/koa');

const app = new Koa();
const router = new Router();

// Add a custom health check response
const healthCheckMessage = JSON.stringify({
  status: 'ok',
  version: process.env.npm_package_version || '1.0.0',
  timestamp: new Date().toISOString()
});

withPingMe(app, router, {
  apiKey: 'your-api-key-here',
  baseUrl: 'https://your-app.example.com',
  route: '/health',
  message: healthCheckMessage
});

app.listen(3000);
```

### Full Health Check Handler

If you want to implement a more sophisticated health check:

```javascript
const Koa = require('koa');
const Router = require('koa-router');
const { withPingMe } = require('@ping-me/koa');

const app = new Koa();
const router = new Router();

// Create a custom health check endpoint
router.get('/health', async ctx => {
  try {
    // Check database connection (example)
    // Replace with your actual health checks
    const dbStatus = await checkDatabaseConnection();
    
    // Get memory usage
    const memoryUsage = process.memoryUsage();
    
    ctx.body = {
      status: 'healthy',
      uptime: process.uptime(),
      database: dbStatus ? 'connected' : 'disconnected',
      memory: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024) + 'MB',
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB'
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      status: 'unhealthy',
      error: error.message
    };
  }
});

// Use withPingMe with the custom health route
withPingMe(app, router, {
  apiKey: 'your-api-key-here',
  baseUrl: 'https://your-app.example.com',
  route: '/health' // Same as our custom health route
});

// Mock function for the example
async function checkDatabaseConnection() {
  // Your database check logic
  return true;
}

app.listen(3000);
```

### Using with Environment Variables

```javascript
const Koa = require('koa');
const Router = require('koa-router');
const { withPingMe } = require('@ping-me/koa');
require('dotenv').config();

const app = new Koa();
const router = new Router();

// Add routes to the router
router.get('/', ctx => {
  ctx.body = 'Hello Koa!';
});

// Get configuration from environment variables
const pingMeOptions = {
  apiKey: process.env.PING_ME_API_KEY,
  route: process.env.PING_ME_ROUTE || '/health',
  interval: parseInt(process.env.PING_ME_INTERVAL || '300000', 10),
  log: process.env.PING_ME_LOG !== 'false',
  autoStart: process.env.PING_ME_AUTO_START !== 'false',
  baseUrl: process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`
};

// Only add Ping-Me if API key is provided
if (pingMeOptions.apiKey) {
  withPingMe(app, router, pingMeOptions);
  console.log(`Ping-Me initialized with route: ${pingMeOptions.route}`);
} else {
  console.warn('Ping-Me API key not provided. Ping-Me is disabled.');
}

app.listen(3000);
```

### With Multiple Routers

Koa allows using multiple routers, which works well with Ping-Me:

```javascript
const Koa = require('koa');
const Router = require('koa-router');
const { withPingMe } = require('@ping-me/koa');

const app = new Koa();

// Create routers for different parts of your app
const mainRouter = new Router();
const apiRouter = new Router({ prefix: '/api' });

// Set up main routes
mainRouter.get('/', ctx => {
  ctx.body = 'Hello Koa!';
});

// Set up API routes
apiRouter.get('/users', ctx => {
  ctx.body = { users: [] };
});
apiRouter.get('/products', ctx => {
  ctx.body = { products: [] };
});

// Create a dedicated health router
const healthRouter = new Router();

// Add Ping-Me with the health router
withPingMe(app, healthRouter, {
  apiKey: 'your-api-key-here',
  baseUrl: 'https://your-app.example.com',
  route: '/health'
});

// Apply all routers to the app
// Note: order matters here - router middleware is applied in sequence
app.use(mainRouter.routes());
app.use(mainRouter.allowedMethods());
app.use(apiRouter.routes());
app.use(apiRouter.allowedMethods());
// The healthRouter middleware is already applied by withPingMe

app.listen(3000);
```

### Stopping the Ping Service

You might want to stop the ping service at some point:

```javascript
const Koa = require('koa');
const Router = require('koa-router');
const { withPingMe } = require('@ping-me/koa');

const app = new Koa();
const router = new Router();

// Set up routes
router.get('/', ctx => {
  ctx.body = 'Hello Koa!';
});

// Initialize Ping-Me and get the control functions
const { stopPinging, pingUrl } = withPingMe(app, router, {
  apiKey: 'your-api-key-here',
  baseUrl: 'https://your-app.example.com'
});

console.log(`Pinging URL: ${pingUrl}`);

// Later, when you want to stop pinging
// For example, when shutting down the server
function handleShutdown() {
  console.log('Stopping Ping-Me service...');
  stopPinging();
  console.log('Ping-Me service stopped');
}

// Handle process signals
process.on('SIGINT', handleShutdown);
process.on('SIGTERM', handleShutdown);

app.listen(3000);
```

## Integration with Koa Middleware

### With Custom Middleware

```javascript
const Koa = require('koa');
const Router = require('koa-router');
const { withPingMe } = require('@ping-me/koa');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const logger = require('koa-logger');

const app = new Koa();
const router = new Router();

// Apply global middlewares
app.use(logger());
app.use(bodyParser());
app.use(cors());

// Define the ping route
const PING_ROUTE = '/ping';

// Add a custom middleware that executes before all routes
app.use(async (ctx, next) => {
  const startTime = Date.now();
  
  // Add a header to all responses
  ctx.set('X-Powered-By', 'Ping-Me Koa');
  
  // Process the request
  await next();
  
  // Log response time for all routes except ping
  if (ctx.path !== PING_ROUTE) {
    const ms = Date.now() - startTime;
    console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
  }
});

// Set up routes
router.get('/', ctx => {
  ctx.body = 'Hello Koa!';
});

// Add Ping-Me
withPingMe(app, router, {
  apiKey: 'your-api-key-here',
  baseUrl: 'https://your-app.example.com',
  route: PING_ROUTE
});

app.listen(3000);
```

### With JWT Authentication

```javascript
const Koa = require('koa');
const Router = require('koa-router');
const { withPingMe } = require('@ping-me/koa');
const jwt = require('koa-jwt');

const app = new Koa();
const router = new Router();

// Define the ping route
const PING_ROUTE = '/ping';

// Add JWT authentication middleware, but exclude the ping route
app.use(jwt({ secret: 'your-secret-key' }).unless({ path: [PING_ROUTE] }));

// Protected routes
router.get('/protected', ctx => {
  // The JWT middleware adds the user to ctx.state.user
  ctx.body = {
    message: 'This is a protected route',
    user: ctx.state.user
  };
});

// Add Ping-Me
withPingMe(app, router, {
  apiKey: 'your-api-key-here',
  baseUrl: 'https://your-app.example.com',
  route: PING_ROUTE
});

app.listen(3000);
```

### With Rate Limiting

```javascript
const Koa = require('koa');
const Router = require('koa-router');
const { withPingMe } = require('@ping-me/koa');
const ratelimit = require('koa-ratelimit');

const app = new Koa();
const router = new Router();

// Define the ping route
const PING_ROUTE = '/ping';

// Set up rate limiting, but exclude the ping route
const db = new Map();
app.use(async (ctx, next) => {
  // Skip rate limiting for ping endpoint
  if (ctx.path === PING_ROUTE) {
    return next();
  }
  
  // Apply rate limiting for all other routes
  return ratelimit({
    driver: 'memory',
    db: db,
    duration: 60000, // 1 minute
    max: 100, // limit each IP to 100 requests per minute
    id: ctx => ctx.ip
  })(ctx, next);
});

// Set up routes
router.get('/', ctx => {
  ctx.body = 'Hello Koa!';
});

// Add Ping-Me
withPingMe(app, router, {
  apiKey: 'your-api-key-here',
  baseUrl: 'https://your-app.example.com',
  route: PING_ROUTE
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
curl http://localhost:3000/ping-me
```

#### Router Configuration Issues

If you're having issues with the router:

1. Make sure the router is properly initialized and configured
2. Check that the `router.routes()` and `router.allowedMethods()` middleware is applied to the app
3. Verify that there are no route conflicts
4. Check that the router is passed to `withPingMe` before applying it to the app

#### Auto-Pinging Not Working

If auto-pinging is not working:

1. Check that the constructed ping URL is accessible
2. Verify that your API key is correct
3. If you didn't provide a `baseUrl`, it defaults to `http://localhost:3000` - make sure this is correct or provide the appropriate URL
4. Check the console for warnings or errors related to Ping-Me

#### Service Not Being Monitored

If your service isn't being monitored:

1. Verify that your API key is correct
2. Check that the ping endpoint is accessible from the internet
3. Verify that the ping interval is appropriate (not too long)
4. Check the Ping-Me dashboard for any alerts or errors

## Best Practices

### Security

- **Public Access**: The ping endpoint is designed to be publicly accessible. Don't put sensitive information in the response.
- **Authentication**: Make sure to exclude the ping endpoint from any authentication middleware.
- **Rate Limiting**: Consider excluding the ping endpoint from rate limiting to ensure it's always accessible.
- **SSL/TLS**: Always use HTTPS in production to ensure secure communication.

### Performance

- **Lightweight Endpoint**: Keep your ping endpoint lightweight. Avoid heavy database queries or external API calls.
- **Appropriate Interval**: Choose a ping interval that balances keeping your service alive with minimizing unnecessary traffic.
- **Monitoring**: Use the Ping-Me dashboard to monitor the performance of your ping endpoint.

### Reliability

- **Error Handling**: Implement robust error handling in your application to ensure it remains stable even if there are issues with the ping service.
- **Logging**: Enable logging to help diagnose any issues with the ping service.
- **Graceful Shutdown**: If possible, stop the ping service gracefully when shutting down your application.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details. 