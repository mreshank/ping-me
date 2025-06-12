# @ping-me/hono

Hono middleware for Ping-Me to keep your Hono applications alive and monitor their health.

[![npm version](https://img.shields.io/npm/v/@ping-me/hono)](https://www.npmjs.com/package/@ping-me/hono)
[![License](https://img.shields.io/github/license/mreshank/ping-me)](https://github.com/mreshank/ping-me/blob/main/LICENSE)

## Overview

`@ping-me/hono` provides seamless integration of Ping-Me with [Hono](https://hono.dev) applications. This package:

- Adds a dedicated ping endpoint to your Hono app
- Automatically registers your service with the Ping-Me monitoring system
- Provides easy configuration options for monitoring settings
- Keeps your free-tier backend services alive by preventing sleep cycles

## Installation

```bash
npm install @ping-me/hono

# or with yarn
yarn add @ping-me/hono

# or with pnpm
pnpm add @ping-me/hono
```

## Basic Usage

```javascript
import { Hono } from 'hono';
import { withPingMe } from '@ping-me/hono';

const app = new Hono();

// Add Ping-Me to your app with default settings
withPingMe(app, {
  apiKey: 'your-api-key-here',
  baseUrl: 'https://your-app.example.com' // Required for auto-pinging
});

app.get('/', (c) => c.text('Hello Hono!'));

export default app;
```

With TypeScript (which Hono fully supports):

```typescript
import { Hono } from 'hono';
import { withPingMe, PingMeHonoOptions } from '@ping-me/hono';

const app = new Hono();

const pingMeOptions: PingMeHonoOptions = {
  apiKey: 'your-api-key-here',
  baseUrl: 'https://your-app.example.com',
  route: '/health'
};

withPingMe(app, pingMeOptions);

app.get('/', (c) => c.text('Hello Hono!'));

export default app;
```

## Configuration Options

The `withPingMe` function accepts the following options:

```typescript
interface PingMeHonoOptions {
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
   * (default: 'Ping-Me: Hono server is up and running')
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
   * Base URL of your application (required for auto-pinging)
   */
  baseUrl?: string;
}
```

### Example with All Options

```javascript
import { Hono } from 'hono';
import { withPingMe } from '@ping-me/hono';

const app = new Hono();

withPingMe(app, {
  apiKey: 'your-api-key-here',
  route: '/health-check',
  interval: 60000, // 1 minute
  log: true,
  message: 'Service is healthy',
  autoStart: true,
  baseUrl: 'https://your-app-domain.com',
  apiEndpoint: 'https://custom-ping-me-api.example.com' // Optional custom API endpoint
});

export default app;
```

## API Reference

### `withPingMe(app, options)`

Adds Ping-Me functionality to a Hono application.

#### Parameters

- `app`: A Hono application instance
- `options`: Configuration options for Ping-Me (see [Configuration Options](#configuration-options))

#### Returns

The function returns an object with the following properties:

- `stopPinging`: A function that stops the pinging when called
- `pingUrl`: The full URL that will be pinged

### `withPingMeHono`

This is an alias for `withPingMe` for backward compatibility.

## Usage with Different Environments

### Cloudflare Workers

```typescript
import { Hono } from 'hono';
import { withPingMe } from '@ping-me/hono';

const app = new Hono();

// Add a ping endpoint
withPingMe(app, {
  apiKey: 'your-api-key-here',
  baseUrl: 'https://your-worker.your-subdomain.workers.dev',
  route: '/health'
});

app.get('/', (c) => c.text('Hello from Cloudflare Workers!'));

export default app;
```

### Deno

```typescript
import { Hono } from 'https://deno.land/x/hono/mod.ts';
import { withPingMe } from 'npm:@ping-me/hono';

const app = new Hono();

withPingMe(app, {
  apiKey: 'your-api-key-here',
  baseUrl: 'https://your-deno-app.deno.dev',
  route: '/health'
});

app.get('/', (c) => c.text('Hello from Deno!'));

Deno.serve(app.fetch);
```

### Bun

```typescript
import { Hono } from 'hono';
import { withPingMe } from '@ping-me/hono';
import { serve } from 'bun';

const app = new Hono();

withPingMe(app, {
  apiKey: 'your-api-key-here',
  baseUrl: 'https://your-bun-app.example.com',
  route: '/health'
});

app.get('/', (c) => c.text('Hello from Bun!'));

serve({
  fetch: app.fetch,
  port: 3000
});
```

## Advanced Usage Examples

### Custom Response Format

You can customize the ping endpoint response:

```javascript
import { Hono } from 'hono';
import { withPingMe } from '@ping-me/hono';

const app = new Hono();

withPingMe(app, {
  apiKey: 'your-api-key-here',
  baseUrl: 'https://your-app.example.com',
  message: JSON.stringify({
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  })
});

export default app;
```

### Custom Health Check Handler

If you want to implement a more sophisticated health check:

```javascript
import { Hono } from 'hono';
import { withPingMe } from '@ping-me/hono';

const app = new Hono();

// Define a custom health route
app.get('/health', async (c) => {
  try {
    // Check database connection (example)
    // Replace with your actual health checks
    const dbStatus = await checkDatabaseConnection();
    
    // Get memory usage if available in your environment
    const memoryInfo = getSystemInfo();
    
    return c.json({
      status: 'healthy',
      services: {
        database: dbStatus ? 'connected' : 'disconnected'
      },
      system: memoryInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    c.status(500);
    return c.json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// Use withPingMe with the custom health route
withPingMe(app, {
  apiKey: 'your-api-key-here',
  baseUrl: 'https://your-app.example.com',
  route: '/health' // Same as our custom health route
});

// Mock functions for the example
async function checkDatabaseConnection() {
  // Your database check logic
  return true;
}

function getSystemInfo() {
  // Your system info logic
  return {
    environment: process.env.NODE_ENV || 'development'
  };
}

export default app;
```

### Using with Environment Variables

```javascript
import { Hono } from 'hono';
import { withPingMe } from '@ping-me/hono';

const app = new Hono();

// Get configuration from environment variables
const pingMeOptions = {
  apiKey: process.env.PING_ME_API_KEY,
  route: process.env.PING_ME_ROUTE || '/health',
  interval: parseInt(process.env.PING_ME_INTERVAL || '300000', 10),
  log: process.env.PING_ME_LOG !== 'false',
  autoStart: process.env.PING_ME_AUTO_START !== 'false',
  baseUrl: process.env.BASE_URL || 'http://localhost:3000'
};

// Only add Ping-Me if API key is provided
if (pingMeOptions.apiKey) {
  withPingMe(app, pingMeOptions);
  console.log(`Ping-Me initialized with route: ${pingMeOptions.route}`);
} else {
  console.warn('Ping-Me API key not provided. Ping-Me is disabled.');
}

app.get('/', (c) => c.text('Hello Hono!'));

export default app;
```

### With Middlewares and Routes Groups

Hono allows grouping routes, which works well with Ping-Me:

```javascript
import { Hono } from 'hono';
import { withPingMe } from '@ping-me/hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';

const app = new Hono();

// Apply global middlewares
app.use('*', logger());
app.use('*', cors());

// API routes
const api = new Hono();
api.get('/users', (c) => c.json({ users: [] }));
api.get('/products', (c) => c.json({ products: [] }));

// Mount API routes under /api
app.route('/api', api);

// Add Ping-Me with a health route
withPingMe(app, {
  apiKey: 'your-api-key-here',
  baseUrl: 'https://your-app.example.com',
  route: '/health'
});

export default app;
```

### Stopping the Ping Service

You might want to stop the ping service at some point:

```javascript
import { Hono } from 'hono';
import { withPingMe } from '@ping-me/hono';

const app = new Hono();

// Initialize Ping-Me and get the control functions
const { stopPinging, pingUrl } = withPingMe(app, {
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

// In Node.js environments, handle process signals
if (typeof process !== 'undefined') {
  process.on('SIGINT', handleShutdown);
  process.on('SIGTERM', handleShutdown);
}

export default app;
```

## Integration with Hono Middleware

### With Rate Limiting

```javascript
import { Hono } from 'hono';
import { withPingMe } from '@ping-me/hono';
import { RateLimiterMemory } from 'rate-limiter-flexible';

const app = new Hono();

// Define the ping route
const PING_ROUTE = '/ping';

// Create a rate limiter
const rateLimiter = new RateLimiterMemory({
  points: 10, // Number of points
  duration: 1, // Per second
});

// Add rate limiting middleware (exclude ping route)
app.use('*', async (c, next) => {
  // Skip rate limiting for ping endpoint
  if (c.req.path === PING_ROUTE) {
    return next();
  }
  
  try {
    // Get client IP
    const ip = c.req.header('x-forwarded-for') || 'unknown';
    await rateLimiter.consume(ip);
    return next();
  } catch (error) {
    c.status(429);
    return c.text('Too Many Requests');
  }
});

// Add Ping-Me
withPingMe(app, {
  apiKey: 'your-api-key-here',
  baseUrl: 'https://your-app.example.com',
  route: PING_ROUTE
});

export default app;
```

### With JWT Authentication

```javascript
import { Hono } from 'hono';
import { withPingMe } from '@ping-me/hono';
import { verify } from 'hono/jwt';

const app = new Hono();

// Define the ping route
const PING_ROUTE = '/ping';

// JWT middleware
app.use('*', async (c, next) => {
  // Skip authentication for ping endpoint
  if (c.req.path === PING_ROUTE) {
    return next();
  }
  
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    c.status(401);
    return c.text('Unauthorized');
  }
  
  const token = authHeader.split(' ')[1];
  try {
    const payload = await verify(token, 'your-secret-key');
    c.set('user', payload);
    return next();
  } catch (error) {
    c.status(401);
    return c.text('Invalid token');
  }
});

// Add Ping-Me
withPingMe(app, {
  apiKey: 'your-api-key-here',
  baseUrl: 'https://your-app.example.com',
  route: PING_ROUTE
});

// Protected route
app.get('/protected', (c) => {
  const user = c.get('user');
  return c.json({ message: 'Protected data', user });
});

export default app;
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

#### Auto-Pinging Not Working

If auto-pinging is not working:

1. Make sure you provided a `baseUrl` option, which is required for auto-pinging
2. Check that the constructed ping URL (`${baseUrl}${route}`) is accessible
3. Verify that your API key is correct
4. Check the console for warnings or errors related to Ping-Me

#### Service Not Being Monitored

If your service isn't being monitored:

1. Verify that your API key is correct
2. Check that the ping endpoint is accessible from the internet
3. Verify that the ping interval is appropriate (not too long)
4. Check the Ping-Me dashboard for any alerts or errors

#### Working with Different Environments

Hono works in various JavaScript environments, which can sometimes lead to issues:

- **Cloudflare Workers**: Make sure your worker has the necessary permissions and is not hitting CPU limits
- **Deno**: Use the correct import syntax for Deno (`import from 'npm:@ping-me/hono'`)
- **Bun**: Make sure you're using the latest version of Bun, which has better compatibility

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
- **Graceful Shutdown**: If possible, stop the ping service gracefully when shutting down your application.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details. 