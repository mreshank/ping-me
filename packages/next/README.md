# @ping-me/next

Next.js integration for Ping-Me to keep your Next.js applications alive and monitor their health.

[![npm version](https://img.shields.io/npm/v/@ping-me/next)](https://www.npmjs.com/package/@ping-me/next)
[![License](https://img.shields.io/github/license/mreshank/ping-me)](https://github.com/mreshank/ping-me/blob/main/LICENSE)

## Overview

`@ping-me/next` provides seamless integration of Ping-Me with Next.js applications. This package:

- Adds a dedicated ping endpoint to your Next.js app
- Automatically registers your service with the Ping-Me monitoring system
- Provides easy configuration options for monitoring settings
- Keeps your free-tier backend services alive by preventing sleep cycles
- Works with all Next.js versions including App Router and Pages Router

## Installation

```bash
npm install @ping-me/next

# or with yarn
yarn add @ping-me/next

# or with pnpm
pnpm add @ping-me/next
```

## Basic Usage

### Pages Router (Next.js 9-13)

#### API Route

Create a new file at `pages/api/ping.js`:

```javascript
import { createPingHandler } from '@ping-me/next';

export default createPingHandler({
  apiKey: process.env.PING_ME_API_KEY
});
```

#### Initialize in _app.js

In your `pages/_app.js` file:

```javascript
import { AppProps } from 'next/app';
import { useEffect } from 'react';
import { initPingMe } from '@ping-me/next';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Initialize Ping-Me
    const pingMe = initPingMe({
      apiKey: process.env.PING_ME_API_KEY
    });
    
    // Register the current service
    pingMe.registerSelf();
    
    // Start pinging
    pingMe.start();
    
    // Clean up on unmount
    return () => {
      pingMe.stop();
    };
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
```

### App Router (Next.js 13+)

#### API Route

Create a new file at `app/api/ping/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { createAppRouterPingHandler } from '@ping-me/next';

export const GET = createAppRouterPingHandler({
  apiKey: process.env.PING_ME_API_KEY
});
```

#### Initialize in layout.tsx

In your `app/layout.tsx` file:

```typescript
import { initPingMe } from '@ping-me/next';

// Server component initialization (runs once during build)
const pingMe = initPingMe({
  apiKey: process.env.PING_ME_API_KEY,
  autoStart: true // Automatically start pinging
});

// Register self for pinging
pingMe.registerSelf();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

## Configuration Options

The Ping-Me Next.js integration accepts the following options:

```typescript
interface PingMeNextOptions {
  /**
   * Your Ping-Me API key
   */
  apiKey: string;
  
  /**
   * Ping interval in milliseconds (default: 5 minutes)
   */
  pingInterval?: number;
  
  /**
   * Whether to log ping events to the console (default: false)
   */
  log?: boolean;
  
  /**
   * Custom message to return on the ping endpoint (default: 'OK')
   */
  message?: string;
  
  /**
   * Whether to automatically start pinging (default: false)
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

## API Reference

### `createPingHandler(options)`

Creates a Next.js API route handler for the Pages Router that responds to ping requests.

#### Parameters

- `options`: Configuration options for Ping-Me (see [Configuration Options](#configuration-options))

#### Returns

A Next.js API route handler function.

### `createAppRouterPingHandler(options)`

Creates a Next.js App Router route handler that responds to ping requests.

#### Parameters

- `options`: Configuration options for Ping-Me (see [Configuration Options](#configuration-options))

#### Returns

A Next.js App Router route handler function.

### `initPingMe(options)`

Initializes the Ping-Me service for your Next.js application.

#### Parameters

- `options`: Configuration options for Ping-Me (see [Configuration Options](#configuration-options))

#### Returns

An initialized `PingMe` instance.

### `getInstance()`

Gets the singleton instance of the Ping-Me service. This is useful for accessing the Ping-Me instance across different parts of your application.

#### Returns

The singleton `PingMe` instance, or `undefined` if it hasn't been initialized yet.

## Advanced Usage Examples

### Custom Response Message

You can customize the response returned by the ping endpoint:

```javascript
// pages/api/ping.js
import { createPingHandler } from '@ping-me/next';

export default createPingHandler({
  apiKey: process.env.PING_ME_API_KEY,
  message: JSON.stringify({
    status: 'healthy',
    version: process.env.npm_package_version,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  })
});
```

### Ping Multiple Services

If your Next.js app depends on other services, you can monitor them as well:

```javascript
// pages/_app.js
import { useEffect } from 'react';
import { initPingMe } from '@ping-me/next';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    const pingMe = initPingMe({
      apiKey: process.env.PING_ME_API_KEY
    });
    
    // Register the current service
    pingMe.registerSelf();
    
    // Register additional services
    pingMe.register([
      'https://api.example.com',
      'https://auth.example.com',
      'https://db.example.com'
    ]);
    
    pingMe.start();
    
    return () => pingMe.stop();
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
```

### Environment-Specific Configuration

You can configure Ping-Me differently based on the environment:

```javascript
// pages/_app.js
import { useEffect } from 'react';
import { initPingMe } from '@ping-me/next';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Only enable Ping-Me in production
    if (process.env.NODE_ENV === 'production') {
      const pingMe = initPingMe({
        apiKey: process.env.PING_ME_API_KEY,
        pingInterval: 60000 // 1 minute in production
      });
      
      pingMe.registerSelf();
      pingMe.start();
      
      return () => pingMe.stop();
    }
    
    // In development, we might want a longer interval or none at all
    if (process.env.NODE_ENV === 'development' && process.env.ENABLE_PING_ME === 'true') {
      const pingMe = initPingMe({
        apiKey: process.env.PING_ME_API_KEY,
        pingInterval: 300000 // 5 minutes in development
      });
      
      pingMe.registerSelf();
      pingMe.start();
      
      return () => pingMe.stop();
    }
    
    // No Ping-Me in test environment
    return undefined;
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
```

### Health Check with Database Status

Create a more comprehensive health check endpoint:

```javascript
// pages/api/health.js
import { PrismaClient } from '@prisma/client';
import { getInstance } from '@ping-me/next';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    // Check database connection
    let dbStatus = 'unknown';
    try {
      // Simple query to check if database is responding
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    } catch (dbError) {
      console.error('Database check failed:', dbError);
      dbStatus = 'disconnected';
    }
    
    // Get the Ping-Me instance to check its status
    const pingMe = getInstance();
    const pingMeStatus = pingMe ? pingMe.getStatus() : { isActive: false };
    
    // Get memory usage
    const memoryUsage = process.memoryUsage();
    
    // Return comprehensive health information
    res.status(200).json({
      status: dbStatus === 'connected' ? 'healthy' : 'degraded',
      uptime: process.uptime(),
      database: dbStatus,
      pingMe: {
        active: pingMeStatus.isActive,
        endpoints: pingMeStatus.endpoints || [],
        interval: pingMeStatus.pingInterval
      },
      memory: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024) + 'MB',
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB'
      },
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Register this endpoint with Ping-Me
if (process.env.NODE_ENV === 'production') {
  const pingMe = getInstance();
  if (pingMe) {
    // Use the /api/health endpoint instead of /api/ping
    pingMe.register(['/api/health']);
  }
}
```

### With Next.js Middleware

If you're using Next.js middleware, you might want to exclude the ping endpoint from certain processing:

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Skip middleware processing for ping endpoint
  if (request.nextUrl.pathname === '/api/ping') {
    return NextResponse.next();
  }
  
  // Your middleware logic here
  // ...
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/ping (ping endpoint)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/ping).*)',
  ],
};
```

### With Edge Runtime

For Next.js Edge Runtime:

```typescript
// app/api/ping/route.ts
import { createAppRouterPingHandler } from '@ping-me/next';

export const runtime = 'edge';

export const GET = createAppRouterPingHandler({
  apiKey: process.env.PING_ME_API_KEY,
  message: JSON.stringify({
    status: 'healthy',
    runtime: 'edge',
    timestamp: new Date().toISOString()
  })
});
```

## Integration with Next.js Features

### With Internationalized Routing (i18n)

If you're using Next.js internationalized routing:

```javascript
// next.config.js
module.exports = {
  i18n: {
    locales: ['en', 'fr', 'de'],
    defaultLocale: 'en',
  },
}

// pages/api/ping.js - This will work across all locales
import { createPingHandler } from '@ping-me/next';

export default createPingHandler({
  apiKey: process.env.PING_ME_API_KEY
});
```

### With Next.js API Routes Authorization

If you have API route authorization:

```javascript
// pages/api/ping.js
import { createPingHandler } from '@ping-me/next';

// The ping endpoint should be publicly accessible, so we bypass authorization
export default function handler(req, res) {
  // Use the Ping-Me handler directly without authorization middleware
  return createPingHandler({
    apiKey: process.env.PING_ME_API_KEY
  })(req, res);
}

// Other API routes with authorization
// pages/api/protected.js
import { withAuth } from '../lib/auth';

function protectedHandler(req, res) {
  // Protected route logic
  res.status(200).json({ message: 'Protected data' });
}

export default withAuth(protectedHandler);
```

## Troubleshooting

### Common Issues and Solutions

#### Ping Endpoint Not Responding

If the ping endpoint isn't responding:

1. Verify the API route exists and is correctly implemented
2. Check that the route is accessible from outside your network
3. Ensure no middleware is blocking the route
4. For the App Router, make sure you're using the correct export format

#### Service Not Being Monitored

If your service isn't being monitored:

1. Verify that your API key is correct
2. Check that the ping endpoint is accessible from the internet
3. Confirm that `initPingMe` is called and `pingMe.start()` is executed
4. Check the Ping-Me dashboard for any alerts or errors

#### Multiple Instances Problem

If you're seeing multiple instances of Ping-Me running:

1. Make sure you're only calling `initPingMe` once in your application
2. Use `getInstance()` to access the Ping-Me instance elsewhere
3. In development mode with hot reloading, you might need to check if an instance already exists before creating a new one

```javascript
// pages/_app.js
import { useEffect } from 'react';
import { initPingMe, getInstance } from '@ping-me/next';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Check if an instance already exists before creating a new one
    let pingMe = getInstance();
    
    if (!pingMe) {
      pingMe = initPingMe({
        apiKey: process.env.PING_ME_API_KEY
      });
    }
    
    pingMe.registerSelf();
    
    if (!pingMe.getStatus().isActive) {
      pingMe.start();
    }
    
    return () => {
      // Only stop if this effect created the instance
      if (pingMe && pingMe.getStatus().isActive) {
        pingMe.stop();
      }
    };
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
```

#### Environment Variable Issues

If you're having trouble with environment variables:

1. Make sure your `.env` or `.env.local` file contains the `PING_ME_API_KEY`
2. For Next.js, ensure environment variables that should be available on the client side are prefixed with `NEXT_PUBLIC_`
3. Verify that your environment variables are properly loaded in your deployment environment

## Best Practices

### Security

- **API Key Protection**: Store your API key in environment variables, never hardcode it
- **Public Access**: The ping endpoint is designed to be publicly accessible, but don't put sensitive information in the response
- **Rate Limiting**: Consider implementing rate limiting for the ping endpoint to prevent abuse

### Performance

- **Lightweight Endpoint**: Keep your ping endpoint lightweight to avoid unnecessary resource usage
- **Appropriate Interval**: Choose a ping interval that balances keeping your service alive with minimizing unnecessary traffic
- **Edge Runtime**: Consider using Edge Runtime for the ping endpoint for faster response times

### Reliability

- **Error Handling**: Implement robust error handling in your application to ensure it remains stable even if there are issues with the ping service
- **Logging**: Enable logging to help diagnose any issues with the ping service
- **Graceful Shutdown**: Ensure proper cleanup by stopping the ping service when your application is shutting down

## Deployment Considerations

### Vercel

When deploying to Vercel:

1. Add your `PING_ME_API_KEY` to the Environment Variables section in your project settings
2. For Serverless Functions, the ping endpoint works out of the box
3. For Edge Functions, make sure to use the Edge Runtime compatible handler

### Other Providers

For other hosting providers:

1. Ensure your API key is set in the environment
2. Verify that the ping endpoint is accessible from the internet
3. Check if the provider has any specific requirements for API routes

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details. 