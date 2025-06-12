# @ping-me/client

Client library for Ping-Me to keep your services alive and monitor their health.

[![npm version](https://img.shields.io/npm/v/@ping-me/client)](https://www.npmjs.com/package/@ping-me/client)
[![License](https://img.shields.io/github/license/mreshank/ping-me)](https://github.com/mreshank/ping-me/blob/main/LICENSE)

## Overview

`@ping-me/client` provides a simplified and user-friendly API for Ping-Me, making it easy to:

- Keep your free-tier backend services alive by preventing sleep cycles
- Monitor service health and response times
- Automatically detect your application's framework
- Register and manage multiple endpoints
- Configure ping intervals and other settings
- Get notified about service downtime

This client package automatically detects your framework (Express, Next.js, Fastify, etc.) and provides the appropriate integration, while still allowing manual configuration if needed.

## Installation

```bash
npm install @ping-me/client

# or with yarn
yarn add @ping-me/client

# or with pnpm
pnpm add @ping-me/client
```

## Basic Usage

```javascript
import { PingMe } from '@ping-me/client';

// Initialize with your API key
const pingMe = new PingMe({
  apiKey: 'your-api-key-here'
});

// Register endpoints to keep alive
pingMe.register([
  'https://your-api.example.com',
  'https://your-app.example.com',
]);

// Start the ping service
pingMe.start();

// Later, when your application is shutting down
pingMe.stop();
```

## Automatic Framework Detection

The client automatically detects your framework and provides the appropriate integration:

```javascript
// Express.js
import express from 'express';
import { PingMe } from '@ping-me/client';

const app = express();
const pingMe = new PingMe({
  apiKey: 'your-api-key-here'
});

// This will automatically detect Express and register a ping endpoint
pingMe.registerSelf();

// Start pinging
pingMe.start();

app.listen(3000);
```

## Configuration Options

The `PingMe` constructor accepts the following options:

```typescript
interface PingMeOptions {
  /**
   * Your Ping-Me API key
   */
  apiKey: string;
  
  /**
   * Ping interval in milliseconds (default: 5 minutes)
   */
  pingInterval?: number;
  
  /**
   * Function called when a ping succeeds
   */
  onSuccess?: (endpoint: string, responseTime: number) => void;
  
  /**
   * Function called when a ping fails
   */
  onError?: (error: Error, endpoint: string) => void;
  
  /**
   * Whether to automatically start pinging (default: false)
   */
  autoStart?: boolean;
}
```

## API Reference

### `PingMe` Class

The main class that handles the pinging logic.

#### Constructor

```typescript
constructor(options: PingMeOptions)
```

Creates a new `PingMe` instance.

#### Methods

##### `register(endpoints: string | string[]): this`

Register one or more endpoints to ping.

```typescript
pingMe.register('https://api.example.com');
// or
pingMe.register([
  'https://api.example.com',
  'https://app.example.com'
]);
```

Returns the `PingMe` instance for chaining.

##### `unregister(endpoints: string | string[]): this`

Unregister one or more endpoints.

```typescript
pingMe.unregister('https://api.example.com');
// or
pingMe.unregister([
  'https://api.example.com',
  'https://app.example.com'
]);
```

Returns the `PingMe` instance for chaining.

##### `registerFromEnv(prefix = 'PING_ME_ENDPOINT_'): this`

Register endpoints from environment variables.

```typescript
// With environment variables:
// PING_ME_ENDPOINT_1=https://api.example.com
// PING_ME_ENDPOINT_2=https://app.example.com
pingMe.registerFromEnv();
```

This will register all environment variables that start with the specified prefix as endpoints.

Returns the `PingMe` instance for chaining.

##### `registerSelf(path = '/', port?: number): this`

Register the current application as an endpoint.

```typescript
pingMe.registerSelf();
// or
pingMe.registerSelf('/health', 3000);
```

This will automatically detect the current framework and register the appropriate endpoint.

Returns the `PingMe` instance for chaining.

##### `createPingHandler(): (req: any, res: any) => void`

Create a handler for ping requests.

```typescript
// Express example
app.get('/ping', pingMe.createPingHandler());

// Next.js API route example
// pages/api/ping.js
export default function handler(req, res) {
  return pingMe.createPingHandler()(req, res);
}
```

Returns a function that handles ping requests.

##### `start(): this`

Start the ping service. This will begin pinging the registered endpoints at the configured interval.

```typescript
pingMe.start();
```

Returns the `PingMe` instance for chaining.

##### `stop(): this`

Stop the ping service.

```typescript
pingMe.stop();
```

Returns the `PingMe` instance for chaining.

##### `setPingInterval(interval: number): this`

Change the ping interval. The interval is specified in milliseconds.

```typescript
// Change to ping every 30 seconds
pingMe.setPingInterval(30000);
```

Returns the `PingMe` instance for chaining.

##### `getStatus(): PingMeStatus`

Get the current status of the ping service.

```typescript
const status = pingMe.getStatus();
console.log(status);
```

Returns a `PingMeStatus` object with information about the ping service.

### Utility Functions

#### `init(options: PingMeOptions): PingMe`

Initialize a new `PingMe` instance and store it as a singleton.

```typescript
import { init } from '@ping-me/client';

const pingMe = init({
  apiKey: 'your-api-key-here'
});
```

This is useful when you need to access the same `PingMe` instance across different parts of your application.

#### `getInstance(): PingMe`

Get the singleton instance of `PingMe`.

```typescript
import { getInstance } from '@ping-me/client';

const pingMe = getInstance();
if (pingMe) {
  pingMe.getStatus();
}
```

Returns the singleton `PingMe` instance, or `undefined` if it hasn't been initialized yet.

## Framework Integrations

### Express.js

```javascript
import express from 'express';
import { PingMe } from '@ping-me/client';

const app = express();
const pingMe = new PingMe({
  apiKey: 'your-api-key-here'
});

// Register the current application
pingMe.registerSelf();

// You can also create a custom ping endpoint
app.get('/health', pingMe.createPingHandler());

// Start pinging
pingMe.start();

app.listen(3000);
```

### Next.js

```javascript
// pages/_app.js
import { useEffect } from 'react';
import { init } from '@ping-me/client';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    const pingMe = init({
      apiKey: process.env.PING_ME_API_KEY
    });
    
    pingMe.registerSelf();
    pingMe.start();
    
    return () => pingMe.stop();
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;

// pages/api/ping.js
import { getInstance } from '@ping-me/client';

export default function handler(req, res) {
  const pingMe = getInstance();
  if (pingMe) {
    return pingMe.createPingHandler()(req, res);
  }
  res.status(500).json({ error: 'Ping-Me not initialized' });
}
```

### Fastify

```javascript
import fastify from 'fastify';
import { PingMe } from '@ping-me/client';

const app = fastify();
const pingMe = new PingMe({
  apiKey: 'your-api-key-here'
});

// Register the current application
pingMe.registerSelf();

// Start pinging
pingMe.start();

// Define a custom ping route if desired
app.get('/health', (request, reply) => {
  reply.send({ status: 'healthy' });
});

app.listen({ port: 3000 });
```

### Koa

```javascript
import Koa from 'koa';
import Router from '@koa/router';
import { PingMe } from '@ping-me/client';

const app = new Koa();
const router = new Router();
const pingMe = new PingMe({
  apiKey: 'your-api-key-here'
});

// Register the current application
pingMe.registerSelf();

// Start pinging
pingMe.start();

// Define a custom ping route if desired
router.get('/health', (ctx) => {
  ctx.body = { status: 'healthy' };
});

app.use(router.routes());
app.listen(3000);
```

### Hono

```javascript
import { Hono } from 'hono';
import { PingMe } from '@ping-me/client';

const app = new Hono();
const pingMe = new PingMe({
  apiKey: 'your-api-key-here'
});

// Register the current application
pingMe.registerSelf();

// Start pinging
pingMe.start();

// Define a custom ping route if desired
app.get('/health', (c) => {
  return c.json({ status: 'healthy' });
});

export default app;
```

## Advanced Usage Examples

### Custom Success and Error Handlers

```javascript
import { PingMe } from '@ping-me/client';

const pingMe = new PingMe({
  apiKey: 'your-api-key-here',
  onSuccess: (endpoint, responseTime) => {
    console.log(`✅ Successfully pinged ${endpoint} in ${responseTime}ms`);
    // You could send metrics to your monitoring system
  },
  onError: async (error, endpoint) => {
    console.error(`❌ Failed to ping ${endpoint}: ${error.message}`);
    
    // Send an alert
    await sendAlert(`Endpoint ${endpoint} is down: ${error.message}`);
    
    // Try to restart the service
    await attemptServiceRestart(endpoint);
  }
});

pingMe.register(['https://api.example.com']);
pingMe.start();

async function sendAlert(message) {
  // Your alert logic here
}

async function attemptServiceRestart(endpoint) {
  // Your service restart logic here
}
```

### Dynamic Ping Intervals

```javascript
import { PingMe } from '@ping-me/client';

const pingMe = new PingMe({
  apiKey: 'your-api-key-here'
});

pingMe.register(['https://api.example.com']);
pingMe.start();

// Set up a schedule to change ping intervals
const businessHoursInterval = 60000; // 1 minute
const offHoursInterval = 300000; // 5 minutes

function updatePingInterval() {
  const hour = new Date().getHours();
  // Business hours: 9 AM to 5 PM
  if (hour >= 9 && hour < 17) {
    pingMe.setPingInterval(businessHoursInterval);
  } else {
    pingMe.setPingInterval(offHoursInterval);
  }
}

// Update interval every hour
setInterval(updatePingInterval, 3600000);
// Initial update
updatePingInterval();
```

### Using with Environment Variables

```javascript
import { PingMe } from '@ping-me/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const API_KEY = process.env.PING_ME_API_KEY;
if (!API_KEY) {
  throw new Error('PING_ME_API_KEY environment variable is required');
}

const pingMe = new PingMe({
  apiKey: API_KEY,
  pingInterval: parseInt(process.env.PING_ME_INTERVAL || '300000', 10),
  autoStart: process.env.PING_ME_AUTO_START === 'true'
});

// Register endpoints from environment variables
pingMe.registerFromEnv();

// Register the current application if enabled
if (process.env.PING_ME_REGISTER_SELF === 'true') {
  pingMe.registerSelf();
}

// Start if not auto-started
if (!pingMe.getStatus().isActive) {
  pingMe.start();
}

// Handle process shutdown
process.on('SIGINT', () => {
  console.log('Stopping ping service...');
  pingMe.stop();
  process.exit(0);
});
```

### Custom Ping Handler

```javascript
import express from 'express';
import { PingMe } from '@ping-me/client';

const app = express();
const pingMe = new PingMe({
  apiKey: 'your-api-key-here'
});

// Register and start
pingMe.registerSelf();
pingMe.start();

// Create a custom health check endpoint with additional information
app.get('/health', (req, res) => {
  const memoryUsage = process.memoryUsage();
  
  res.json({
    status: 'healthy',
    ping_me: pingMe.getStatus(),
    uptime: process.uptime(),
    memory: {
      rss: Math.round(memoryUsage.rss / 1024 / 1024) + 'MB',
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB'
    },
    version: process.env.npm_package_version,
    node_version: process.version,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

app.listen(3000);
```

### Monitoring External Services

```javascript
import { PingMe } from '@ping-me/client';

// Initialize Ping-Me
const pingMe = new PingMe({
  apiKey: 'your-api-key-here',
  onError: async (error, endpoint) => {
    console.error(`Service ${endpoint} is down: ${error.message}`);
    
    // Get the service name from the endpoint URL
    const url = new URL(endpoint);
    const serviceName = url.hostname.split('.')[0];
    
    // Send an alert about the service being down
    await sendServiceDownAlert(serviceName, error.message);
  }
});

// Register your own service
pingMe.registerSelf();

// Register external services that your application depends on
pingMe.register([
  'https://auth-service.example.com/health',
  'https://database-service.example.com/health',
  'https://storage-service.example.com/health',
  'https://search-service.example.com/health'
]);

// Start pinging
pingMe.start();

async function sendServiceDownAlert(serviceName, errorMessage) {
  // Your alert logic here
  console.log(`ALERT: ${serviceName} is down - ${errorMessage}`);
}
```

## Troubleshooting

### Common Issues

#### API Key Issues

If you're having problems with your API key:

1. Make sure your API key is valid and correctly formatted
2. Check that your API key has the necessary permissions
3. Verify that your account is active and in good standing
4. Try generating a new API key from the dashboard

#### Connection Issues

If the ping service is failing to connect to your endpoints:

1. Check that the endpoints are accessible from the environment where ping-me is running
2. Verify that there are no network restrictions or firewalls blocking the connections
3. Check if the endpoints require authentication or special headers
4. Try pinging the endpoints manually to confirm they're reachable

#### Framework Detection Issues

If automatic framework detection isn't working:

1. Make sure your framework is supported (Express, Next.js, Fastify, Koa, Hono)
2. Try calling `registerSelf()` after your framework is fully initialized
3. If needed, specify the framework manually: `pingMe.registerSelf('/', 3000, 'express')`

### Debugging

To enable debug mode for more detailed logging:

```javascript
import { PingMe } from '@ping-me/client';

const pingMe = new PingMe({
  apiKey: 'your-api-key-here',
  debug: true // Enable debug mode
});

pingMe.registerSelf();
pingMe.start();
```

## Best Practices

### Security

- **API Key Protection**: Never hardcode your API key in your code. Use environment variables or a secure configuration management system.
- **Limit Access**: Only give the ping service access to the endpoints it needs to monitor.
- **Use HTTPS**: Always use HTTPS URLs for your endpoints to ensure secure communication.

### Performance

- **Optimize Ping Interval**: Choose a ping interval that balances keeping your service alive with minimizing unnecessary network traffic.
- **Use Conditional Pinging**: Consider implementing logic to ping only during certain hours or when your service is likely to be idle.
- **Batch Operations**: If monitoring many endpoints, consider staggering the pings to avoid network congestion.

### Reliability

- **Error Handling**: Implement robust error handling to ensure the ping service continues to function even if some pings fail.
- **Graceful Shutdown**: Always call `stop()` when your application is shutting down to ensure clean termination.
- **Monitoring the Monitor**: Set up a secondary monitoring system to ensure your ping service itself is running correctly.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details. 