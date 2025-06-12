# @ping-me/fastify

Fastify plugin for Ping-Me to keep your Fastify applications alive and monitor their health.

[![npm version](https://img.shields.io/npm/v/@ping-me/fastify)](https://www.npmjs.com/package/@ping-me/fastify)
[![License](https://img.shields.io/github/license/mreshank/ping-me)](https://github.com/mreshank/ping-me/blob/main/LICENSE)

## Overview

`@ping-me/fastify` provides seamless integration of Ping-Me with Fastify applications. This package:

- Adds a dedicated ping endpoint to your Fastify app
- Automatically registers your service with the Ping-Me monitoring system
- Provides easy configuration options for monitoring settings
- Keeps your free-tier backend services alive by preventing sleep cycles

## Installation

```bash
npm install @ping-me/fastify

# or with yarn
yarn add @ping-me/fastify

# or with pnpm
pnpm add @ping-me/fastify
```

## Basic Usage

```javascript
const fastify = require('fastify')();
const { withPingMe } = require('@ping-me/fastify');

// Add Ping-Me to your app with default settings
withPingMe(fastify, {
  apiKey: 'your-api-key-here'
});

fastify.get('/', async (request, reply) => {
  return { hello: 'world' };
});

fastify.listen({ port: 3000 }, (err) => {
  if (err) throw err;
  console.log('Server is running on port 3000');
});
```

With TypeScript:

```typescript
import Fastify from 'fastify';
import { withPingMe } from '@ping-me/fastify';

const fastify = Fastify();

withPingMe(fastify, {
  apiKey: 'your-api-key-here'
});

fastify.get('/', async (request, reply) => {
  return { hello: 'world' };
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    console.log('Server is running on port 3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
```

## Configuration Options

The `withPingMe` function accepts the following options:

```typescript
interface PingMeFastifyOptions {
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
const fastify = require('fastify')();
const { withPingMe } = require('@ping-me/fastify');

withPingMe(fastify, {
  apiKey: 'your-api-key-here',
  route: '/health-check',
  interval: 60000, // 1 minute
  log: true,
  message: 'Service is healthy',
  autoStart: true,
  baseUrl: 'https://your-app-domain.com'
});

fastify.listen({ port: 3000 });
```

## API Reference

### `withPingMe(app, options)`

Adds Ping-Me functionality to a Fastify application.

#### Parameters

- `app`: A Fastify instance
- `options`: Configuration options for Ping-Me (see [Configuration Options](#configuration-options))

#### Returns

The function returns the Fastify instance for chaining.

## Advanced Usage Examples

### Custom Ping Response Schema

Fastify excels at schema validation, so let's use that for our ping endpoint:

```javascript
const fastify = require('fastify')();
const { withPingMe } = require('@ping-me/fastify');

// Define a schema for the ping response
const pingResponseSchema = {
  schema: {
    response: {
      200: {
        type: 'object',
        properties: {
          status: { type: 'string' },
          version: { type: 'string' },
          timestamp: { type: 'string', format: 'date-time' },
          uptime: { type: 'number' }
        }
      }
    }
  }
};

// Create a custom handler
fastify.get('/health', pingResponseSchema, async () => {
  return {
    status: 'healthy',
    version: process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  };
});

// Add Ping-Me with the custom route
withPingMe(fastify, {
  apiKey: 'your-api-key-here',
  route: '/health'
});

fastify.listen({ port: 3000 });
```

### Health Check with Additional Information

You can extend the ping endpoint to include additional health information:

```javascript
const fastify = require('fastify')();
const { withPingMe } = require('@ping-me/fastify');

// Add a custom health check route
fastify.get('/health', async (request, reply) => {
  try {
    // Check database connection (example)
    let dbStatus = 'unknown';
    try {
      // This is just an example, replace with your actual DB check
      const db = fastify.mongo.db;
      await db.command({ ping: 1 });
      dbStatus = 'connected';
    } catch (dbError) {
      fastify.log.error(dbError);
      dbStatus = 'disconnected';
    }
    
    // Get memory usage
    const memoryUsage = process.memoryUsage();
    
    // Return health information
    return {
      status: 'healthy',
      uptime: process.uptime(),
      database: dbStatus,
      memory: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024) + 'MB',
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB'
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    // Log the error
    request.log.error(error);
    
    // Return an error response
    reply.status(500);
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
});

// Set up Ping-Me with the custom health route
withPingMe(fastify, {
  apiKey: 'your-api-key-here',
  route: '/health'
});

fastify.listen({ port: 3000 });
```

### Using with Environment Variables

```javascript
const fastify = require('fastify')();
const { withPingMe } = require('@ping-me/fastify');
require('dotenv').config();

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
  withPingMe(fastify, pingMeOptions);
  fastify.log.info(`Ping-Me initialized with route: ${pingMeOptions.route}`);
} else {
  fastify.log.warn('Ping-Me API key not provided. Ping-Me is disabled.');
}

fastify.listen({ port: 3000 });
```

### With Prefix

If you're using Fastify's `prefix` option to group routes:

```javascript
const fastify = require('fastify')();
const { withPingMe } = require('@ping-me/fastify');

// Create a plugin with a prefix
const apiPlugin = async (fastify, options) => {
  fastify.get('/', async () => {
    return { api: 'v1' };
  });
  
  fastify.get('/users', async () => {
    return { users: [] };
  });
  
  // You can add a ping endpoint here that will be prefixed
  fastify.get('/health', async () => {
    return { status: 'healthy' };
  });
};

// Register the plugin with a prefix
fastify.register(apiPlugin, { prefix: '/api/v1' });

// Add Ping-Me with the prefixed route
withPingMe(fastify, {
  apiKey: 'your-api-key-here',
  route: '/api/v1/health' // Match the prefixed route
});

fastify.listen({ port: 3000 });
```

### Multiple Services

For managing multiple services in a microservices architecture:

```javascript
const fastify = require('fastify')();
const { withPingMe } = require('@ping-me/fastify');

// Add service identification to the ping response
fastify.get('/health', async () => {
  return {
    service: 'user-service',
    version: '1.0.0',
    status: 'healthy',
    timestamp: new Date().toISOString()
  };
});

withPingMe(fastify, {
  apiKey: 'your-api-key-here',
  route: '/health',
  // Use a service-specific base URL for proper identification in the dashboard
  baseUrl: process.env.SERVICE_URL || 'https://user-service.example.com'
});

fastify.listen({ port: 3000 });
```

## Integration with Fastify Plugins

### With Helmet Security

When using `fastify-helmet` for security headers:

```javascript
const fastify = require('fastify')();
const { withPingMe } = require('@ping-me/fastify');
const helmet = require('@fastify/helmet');

// Register helmet
await fastify.register(helmet, {
  // Configure helmet
});

// Add Ping-Me
withPingMe(fastify, {
  apiKey: 'your-api-key-here'
});

fastify.listen({ port: 3000 });
```

### With Rate Limiting

When using rate limiting with `@fastify/rate-limit`:

```javascript
const fastify = require('fastify')();
const { withPingMe } = require('@ping-me/fastify');
const rateLimit = require('@fastify/rate-limit');

// Define the ping route path for exclusion
const PING_ROUTE = '/ping';

// Register rate limit plugin with ping route excluded
await fastify.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
  skipOnError: true,
  // Skip rate limiting for the ping route
  skip: (request) => request.url === PING_ROUTE
});

// Add Ping-Me
withPingMe(fastify, {
  apiKey: 'your-api-key-here',
  route: PING_ROUTE
});

fastify.listen({ port: 3000 });
```

### With Authentication

If you're using `@fastify/auth` for authentication:

```javascript
const fastify = require('fastify')();
const { withPingMe } = require('@ping-me/fastify');
const fastifyAuth = require('@fastify/auth');

// Register the auth plugin
await fastify.register(fastifyAuth);

// Define authentication function
fastify.decorate('authenticate', async (request, reply) => {
  if (!request.headers.authorization) {
    throw new Error('Missing token header');
  }
  // Authenticate the request
  // ...
});

// Apply authentication to all routes except /ping
fastify.addHook('onRequest', (request, reply, done) => {
  if (request.url === '/ping') {
    done();
    return;
  }
  
  fastify.authenticate(request, reply, done);
});

// Add Ping-Me
withPingMe(fastify, {
  apiKey: 'your-api-key-here'
});

fastify.listen({ port: 3000 });
```

## Troubleshooting

### Common Issues and Solutions

#### Ping Endpoint Not Responding

If the ping endpoint isn't responding:

1. Check that the route is accessible from outside your network
2. Verify that no hooks or plugins are blocking the route
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

#### Route Conflicts

If there's a route conflict:

1. Check if another plugin has registered the same route
2. Change the ping route to something unique using the `route` option
3. Ensure that you don't have any route conflicts with your prefixed routes

#### Server Startup Issues

If you're having issues with server startup:

1. Ensure that Ping-Me is initialized before the server starts listening
2. Check for any errors in the Fastify startup logs
3. Verify that all plugin registrations are properly awaited if using async/await

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