# ping-me

The main package for Ping-Me - Keep your free tier backends alive with auto-pinging and monitoring.

[![npm version](https://img.shields.io/npm/v/ping-me)](https://www.npmjs.com/package/ping-me)
[![License](https://img.shields.io/github/license/mreshank/ping-me)](https://github.com/mreshank/ping-me/blob/main/LICENSE)

## Overview

`ping-me` is an all-in-one package that bundles the core functionality and framework-specific adapters to keep your free-tier backend services alive. It prevents sleep cycles by automatically pinging your endpoints at regular intervals.

Key features:

- **Framework Auto-Detection**: Automatically detects and uses the appropriate adapter for your framework
- **Multiple Adapters**: Supports Express, Next.js, Fastify, Koa, and Hono
- **CLI Tool**: Includes a command-line interface for standalone usage
- **Monitoring**: Optional integration with the Ping-Me monitoring system
- **Flexible Configuration**: Customizable ping intervals, endpoints, and more

## Installation

```bash
npm install ping-me

# or with yarn
yarn add ping-me

# or with pnpm
pnpm add ping-me
```

## Basic Usage

### Auto-Detection

The package automatically detects which framework you're using and provides the appropriate integration:

```javascript
const { withPingMe } = require('ping-me');

// For Express
const app = require('express')();
withPingMe(app);

// For Next.js
// In pages/api/ping.js
export default withPingMe();

// For Fastify
const fastify = require('fastify')();
withPingMe(fastify);

// For Koa
const Koa = require('koa');
const Router = require('koa-router');
const app = new Koa();
const router = new Router();
withPingMe(app, router);

// For Hono
const { Hono } = require('hono');
const app = new Hono();
withPingMe(app);
```

### Explicit Import

If you prefer to explicitly import the adapter for your framework:

```javascript
// Express
const { withPingMe } = require('@ping-me/express');
const app = require('express')();
withPingMe(app);

// Next.js
const { createPingMeHandler } = require('@ping-me/next');
export default createPingMeHandler();

// Fastify
const { withPingMe } = require('@ping-me/fastify');
const fastify = require('fastify')();
withPingMe(fastify);

// Koa
const { withPingMe } = require('@ping-me/koa');
const Koa = require('koa');
const Router = require('koa-router');
const app = new Koa();
const router = new Router();
withPingMe(app, router);

// Hono
const { withPingMe } = require('@ping-me/hono');
const { Hono } = require('hono');
const app = new Hono();
withPingMe(app);
```

### Command-Line Interface

You can also use the CLI to ping your endpoints:

```bash
# Basic usage
npx ping-me --url https://your-app.example.com

# Multiple endpoints
npx ping-me --url https://api1.example.com --url https://api2.example.com

# Custom interval (in milliseconds)
npx ping-me --url https://your-app.example.com --interval 60000

# With API key for monitoring
npx ping-me --url https://your-app.example.com --apiKey your-api-key
```

The CLI also provides aliases for backward compatibility:

```bash
npx keep-server-alive --url https://your-app.example.com
npx keepwake --url https://your-app.example.com
npx keepawake --url https://your-app.example.com
```

## Configuration Options

The `ping-me` package accepts the following options:

```typescript
interface PingMeOptions {
  /**
   * Your Ping-Me API key for monitoring
   */
  apiKey?: string;
  
  /**
   * The route to use for the ping endpoint (default varies by framework)
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
   */
  message?: string;
  
  /**
   * Whether to automatically start pinging (default: true)
   */
  autoStart?: boolean;
  
  /**
   * Custom API endpoint URL for the monitoring system
   */
  apiEndpoint?: string;
  
  /**
   * Base URL of your application (required for some frameworks)
   */
  baseUrl?: string;
  
  /**
   * URL(s) to ping (CLI only, can be a string or array of strings)
   */
  url?: string | string[];
  
  /**
   * Environment variable prefix for loading endpoints (CLI only)
   */
  env?: string;
}
```

## Advanced Usage

### Framework-Specific Initialization

For more control, you can use the `initialize` function to get framework-specific adapters:

```javascript
const { initialize } = require('ping-me');

const pingMe = initialize({
  apiKey: 'your-api-key',
  interval: 60000
});

console.log(`Detected framework: ${pingMe.framework}`);

// Use the appropriate adapter
if (pingMe.framework === 'express') {
  const app = require('express')();
  pingMe.withPingMe(app);
} else if (pingMe.framework === 'next') {
  // Use Next.js specific functions
  const handler = pingMe.createPingMeHandler();
} else {
  // Use core functionality
  const { stopPinging } = pingMe.pingMe({
    url: 'https://your-app.example.com'
  });
}
```

### Environment Variables for CLI

You can define endpoints in environment variables and load them with the CLI:

```bash
# Define endpoints
export PING_ME_ENDPOINT_1=https://api1.example.com
export PING_ME_ENDPOINT_2=https://api2.example.com

# Load them with the default prefix
npx ping-me --env PING_ME_ENDPOINT_

# Or with a custom prefix
export MY_APP_API=https://api.myapp.com
export MY_APP_WEB=https://myapp.com
npx ping-me --env MY_APP_
```

### Custom Ping Handler

You can create a custom ping handler for more complex scenarios:

```javascript
const { pingMe, createPingEndpoint } = require('ping-me');

// Create a custom ping endpoint
const pingHandler = createPingEndpoint({
  message: JSON.stringify({
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  })
});

// Use it in your application
app.get('/health', (req, res) => {
  const response = pingHandler.handler();
  res.json(response);
});

// Start pinging it
const { stopPinging } = pingMe({
  url: 'https://your-app.example.com/health',
  interval: 60000,
  apiKey: 'your-api-key'
});

// Stop pinging when needed
process.on('SIGINT', () => {
  stopPinging();
  process.exit(0);
});
```

## Framework-Specific Features

### Express

```javascript
const express = require('express');
const { withPingMe } = require('ping-me');

const app = express();

withPingMe(app, {
  route: '/health',
  interval: 60000
});

app.listen(3000);
```

### Next.js

```javascript
// pages/api/ping.js
import { createPingMeHandler } from 'ping-me';

export default createPingMeHandler({
  message: 'Next.js server is alive'
});

// In your _app.js (for client-side pinging)
import { usePingMe } from 'ping-me';

function MyApp({ Component, pageProps }) {
  // This will ping the server from the client
  usePingMe({
    interval: 60000
  });
  
  return <Component {...pageProps} />;
}

export default MyApp;
```

### Fastify

```javascript
const fastify = require('fastify')();
const { withPingMe } = require('ping-me');

withPingMe(fastify, {
  route: '/health',
  interval: 60000
});

fastify.listen({ port: 3000 });
```

### Koa

```javascript
const Koa = require('koa');
const Router = require('koa-router');
const { withPingMe } = require('ping-me');

const app = new Koa();
const router = new Router();

withPingMe(app, router, {
  route: '/health',
  interval: 60000
});

app.listen(3000);
```

### Hono

```javascript
const { Hono } = require('hono');
const { withPingMe } = require('ping-me');

const app = new Hono();

withPingMe(app, {
  route: '/health',
  interval: 60000,
  baseUrl: 'https://your-app.example.com'
});

export default app;
```

## CLI Options

The CLI tool supports the following options:

| Option | Alias | Description | Default |
| --- | --- | --- | --- |
| `--apiKey` | `-k` | Your Ping-Me API key | - |
| `--interval` | `-i` | Ping interval in milliseconds | 300000 (5 minutes) |
| `--url` | `-u` | URL to ping (can be used multiple times) | - |
| `--env` | `-e` | Load endpoints from environment variables with this prefix | PING_ME_ENDPOINT_ |
| `--help` | `-h` | Show help message | - |

## Monitoring Integration

To enable monitoring of your endpoints, sign up for a Ping-Me API key and include it in your configuration:

```javascript
withPingMe(app, {
  apiKey: 'your-api-key',
  // other options
});
```

With monitoring enabled, you'll get:
- Uptime tracking
- Response time metrics
- Downtime alerts
- Performance analytics

## Troubleshooting

### Common Issues

#### Framework Not Detected

If your framework isn't being detected automatically:

1. Make sure the framework package is installed
2. Try using the explicit import for your framework
3. Use the core functionality directly

```javascript
const { pingMe } = require('@ping-me/core');

const { stopPinging } = pingMe({
  url: 'https://your-app.example.com'
});
```

#### Multiple Frameworks Detected

If you have multiple frameworks installed, the package will use the first one it finds. To use a specific framework, import it directly:

```javascript
const { withPingMe } = require('@ping-me/express');
```

#### CLI Not Working

If the CLI isn't working:

1. Make sure you're using the correct command: `npx ping-me`
2. Check that the URL is accessible
3. Try with the verbose flag: `npx ping-me --url https://example.com --verbose`

## Best Practices

### Security

- **Public Endpoint**: The ping endpoint is designed to be publicly accessible. Don't put sensitive information in the response.
- **Rate Limiting**: Consider applying rate limiting to the ping endpoint to prevent abuse.
- **HTTPS**: Always use HTTPS in production to ensure secure communication.

### Performance

- **Appropriate Interval**: Choose a ping interval that balances keeping your service alive with minimizing unnecessary traffic.
- **Lightweight Endpoint**: Keep your ping endpoint lightweight to minimize resource usage.

### Reliability

- **Error Handling**: Implement robust error handling to ensure your application remains stable.
- **Logging**: Enable logging to help diagnose any issues with the ping service.
- **Graceful Shutdown**: Stop the ping service gracefully when shutting down your application.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details. 