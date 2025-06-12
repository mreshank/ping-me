# Ping-Me: Internal Documentation - Part 2

## Framework Adapters In-Depth

### Adapter Architecture Overview

The framework adapters form a critical part of the Ping-Me ecosystem, providing seamless integration with popular Node.js web frameworks. Each adapter follows a consistent pattern while accommodating the unique characteristics of its target framework.

```
┌───────────────────────────────────────────────────────────────────┐
│                     Framework Adapter Pattern                      │
└───────────────────────────────────────────────────────────────────┘
                              │
      ┌─────────────┬─────────┴─────────┬─────────────┐
      │             │                   │             │
┌─────▼─────┐ ┌─────▼─────┐       ┌─────▼─────┐ ┌─────▼─────┐
│ Import    │ │ Create    │       │ Configure │ │ Return    │
│ Core      │ │ Endpoint  │       │ Auto-ping │ │ Control   │
│ Functions │ │ Handler   │       │ Mechanism │ │ Functions │
└───────────┘ └───────────┘       └───────────┘ └───────────┘
```

### Common Adapter Pattern

All framework adapters implement the following pattern:

1. **Import Core Functions**:
   - Import `pingMe` and `createPingEndpoint` from `@ping-me/core`
   - These provide the foundational functionality

2. **Define Options Interface**:
   - Each adapter has a TypeScript interface for its options
   - Extends the core options with framework-specific settings

3. **Create Middleware/Handler Function**:
   - Main function named `withPingMe` or similar
   - Accepts the framework's application instance and options

4. **Register Route/Endpoint**:
   - Creates a ping endpoint using the framework's routing mechanism
   - Uses `createPingEndpoint` to generate the response handler

5. **Configure Auto-Pinging**:
   - If `autoStart` is true (default), begins pinging the endpoint
   - Determines the URL to ping based on the framework's configuration

6. **Return Control Functions**:
   - Returns a `stopPinging` function to halt the pinging process
   - Returns the `pingUrl` for reference

### Express Adapter

The Express adapter (`@ping-me/express`) integrates with the Express.js framework.

#### Implementation Details

```typescript
import { pingMe, createPingEndpoint } from '@ping-me/core';
import express from 'express';

export interface PingMeExpressOptions {
  route?: string;
  interval?: number;
  log?: boolean;
  message?: string;
  autoStart?: boolean;
  apiKey?: string;
  apiEndpoint?: string;
  baseUrl?: string;
}

export function withPingMe(
  app: express.Application,
  options: PingMeExpressOptions = {}
) {
  const {
    route = '/ping-me',
    interval = 300000, // 5 minutes
    log = true,
    message = 'Ping-Me: Express server is up and running',
    autoStart = true,
    apiKey,
    apiEndpoint,
    baseUrl,
  } = options;

  // Create the ping endpoint
  app.get(route, (req, res) => {
    const response = createPingEndpoint({ message }).handler();
    res.json(response);
  });

  if (autoStart) {
    // Determine the full URL to ping
    let pingUrl: string;
    
    if (baseUrl) {
      // Use provided baseUrl
      pingUrl = `${baseUrl.replace(/\/$/, '')}${route}`;
    } else {
      // Default to localhost if no baseUrl provided
      // This is a limitation as Express doesn't expose server info directly
      pingUrl = `http://localhost:${process.env.PORT || 3000}${route}`;
    }
    
    // Start pinging
    const stopPinging = pingMe({
      url: pingUrl,
      interval,
      log: log ? console.log : () => {},
      apiKey,
      apiEndpoint,
    });
    
    return {
      stopPinging,
      pingUrl,
    };
  }
  
  return {
    stopPinging: () => {},
    pingUrl: baseUrl ? `${baseUrl.replace(/\/$/, '')}${route}` : '',
  };
}

// Alias for backward compatibility
export const withPingMeExpress = withPingMe;
```

#### Key Features

1. **Middleware Approach**:
   - Uses Express's middleware system
   - Adds a GET route handler for the ping endpoint

2. **URL Determination**:
   - Requires `baseUrl` for accurate ping URL determination
   - Falls back to localhost with environment port or 3000

3. **Response Format**:
   - Uses Express's `res.json()` method
   - Returns standardized ping response

### Next.js Adapter

The Next.js adapter (`@ping-me/next`) provides integration with the Next.js framework, supporting both API routes and client-side pinging.

#### Implementation Details

```typescript
import { pingMe, createPingEndpoint } from '@ping-me/core';
import { useEffect } from 'react';
import type { NextApiRequest, NextApiResponse } from 'next';

export interface PingMeNextOptions {
  message?: string;
  apiKey?: string;
  apiEndpoint?: string;
}

export interface UsePingMeOptions {
  interval?: number;
  apiPath?: string;
  disabled?: boolean;
}

// API route handler
export function createPingMeHandler(options: PingMeNextOptions = {}) {
  const { message = 'Ping-Me: Next.js server is up and running' } = options;
  
  const pingEndpoint = createPingEndpoint({ message });
  
  return function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const response = pingEndpoint.handler();
    return res.status(200).json(response);
  };
}

// Client-side hook for pinging from the browser
export function usePingMe(options: UsePingMeOptions = {}) {
  const {
    interval = 300000, // 5 minutes
    apiPath = '/api/ping-me',
    disabled = false
  } = options;
  
  useEffect(() => {
    if (disabled) return;
    
    // Don't run during SSR
    if (typeof window === 'undefined') return;
    
    const timer = setInterval(async () => {
      try {
        await fetch(apiPath);
      } catch (error) {
        console.error('Failed to ping server:', error);
      }
    }, interval);
    
    return () => clearInterval(timer);
  }, [interval, apiPath, disabled]);
}

// Legacy function for backward compatibility
export function withPingMeNext(options: PingMeNextOptions = {}) {
  return createPingMeHandler(options);
}
```

#### Key Features

1. **Dual-Mode Operation**:
   - Server-side API route handler (`createPingMeHandler`)
   - Client-side React hook (`usePingMe`)

2. **API Routes Integration**:
   - Creates a Next.js API route handler
   - Handles method validation

3. **React Integration**:
   - Uses React hooks for client-side pinging
   - Safely handles SSR environments

4. **Flexible Configuration**:
   - Can be used in various Next.js project structures
   - Works with both pages router and app router

### Fastify Adapter

The Fastify adapter (`@ping-me/fastify`) integrates with the Fastify framework.

#### Implementation Details

```typescript
import { pingMe, createPingEndpoint } from '@ping-me/core';
import type { FastifyInstance } from 'fastify';

export interface PingMeFastifyOptions {
  route?: string;
  interval?: number;
  log?: boolean;
  message?: string;
  autoStart?: boolean;
  apiKey?: string;
  apiEndpoint?: string;
  baseUrl?: string;
}

export function withPingMe(
  fastify: FastifyInstance,
  options: PingMeFastifyOptions = {}
) {
  const {
    route = '/ping-me',
    interval = 300000, // 5 minutes
    log = true,
    message = 'Ping-Me: Fastify server is up and running',
    autoStart = true,
    apiKey,
    apiEndpoint,
    baseUrl,
  } = options;

  // Create the ping endpoint
  fastify.get(route, (request, reply) => {
    const response = createPingEndpoint({ message }).handler();
    return reply.send(response);
  });

  if (autoStart) {
    // Determine the full URL to ping
    let pingUrl: string;
    
    if (baseUrl) {
      // Use provided baseUrl
      pingUrl = `${baseUrl.replace(/\/$/, '')}${route}`;
    } else {
      // Use Fastify's address info when available
      fastify.ready().then(() => {
        const address = fastify.server.address();
        const host = typeof address === 'object' && address ? 
          `${address.address === '::1' ? 'localhost' : address.address}:${address.port}` : 
          `localhost:${process.env.PORT || 3000}`;
          
        pingUrl = `http://${host}${route}`;
        
        // Start pinging once we have the address
        pingMe({
          url: pingUrl,
          interval,
          log: log ? console.log : () => {},
          apiKey,
          apiEndpoint,
        });
      });
    }
    
    // Return control functions
    return {
      stopPinging: () => {}, // Will be overwritten when pinging starts
      pingUrl: pingUrl || (baseUrl ? `${baseUrl.replace(/\/$/, '')}${route}` : ''),
    };
  }
  
  return {
    stopPinging: () => {},
    pingUrl: baseUrl ? `${baseUrl.replace(/\/$/, '')}${route}` : '',
  };
}

// Alias for backward compatibility
export const withPingMeFastify = withPingMe;
```

#### Key Features

1. **Plugin Architecture**:
   - Follows Fastify's plugin pattern
   - Registers a GET route handler

2. **Server Address Detection**:
   - Uses Fastify's server address information when available
   - Waits for the server to be ready before starting pinging

3. **Response Format**:
   - Uses Fastify's `reply.send()` method
   - Returns standardized ping response

### Koa Adapter

The Koa adapter (`@ping-me/koa`) integrates with the Koa framework and koa-router.

#### Implementation Details

```typescript
import { pingMe, createPingEndpoint } from '@ping-me/core';
import Koa from 'koa';
import Router from 'koa-router';

export interface PingMeKoaOptions {
  route?: string;
  interval?: number;
  log?: boolean;
  message?: string;
  autoStart?: boolean;
  apiKey?: string;
  apiEndpoint?: string;
  baseUrl?: string;
}

export function withPingMe(
  app: Koa,
  router: Router,
  options: PingMeKoaOptions = {}
) {
  const {
    route = '/ping-me',
    interval = 300000, // 5 minutes
    log = true,
    message = 'Ping-Me: Koa server is up and running',
    autoStart = true,
    apiKey,
    apiEndpoint,
    baseUrl,
  } = options;

  // Create the ping endpoint
  router.get(route, ctx => {
    const response = createPingEndpoint({ message }).handler();
    ctx.body = response;
  });

  // Apply router middleware to app
  app.use(router.routes());
  app.use(router.allowedMethods());

  if (autoStart) {
    // Determine the full URL to ping
    let pingUrl: string;
    
    if (baseUrl) {
      // Use provided baseUrl
      pingUrl = `${baseUrl.replace(/\/$/, '')}${route}`;
    } else {
      // Default to localhost:3000 if no baseUrl provided
      pingUrl = `http://localhost:${process.env.PORT || 3000}${route}`;
    }
    
    // Start pinging
    const stopPinging = pingMe({
      url: pingUrl,
      interval,
      log: log ? console.log : () => {},
      apiKey,
      apiEndpoint,
    });
    
    return {
      stopPinging,
      pingUrl,
    };
  }
  
  return {
    stopPinging: () => {},
    pingUrl: baseUrl ? `${baseUrl.replace(/\/$/, '')}${route}` : `http://localhost:${process.env.PORT || 3000}${route}`,
  };
}

// Alias for backward compatibility
export const withPingMeKoa = withPingMe;
```

#### Key Features

1. **Router Integration**:
   - Requires a koa-router instance
   - Applies router middleware to the app

2. **Context-Based Response**:
   - Uses Koa's context (`ctx`) for response handling
   - Sets `ctx.body` to the ping response

3. **Middleware Application**:
   - Applies both `routes()` and `allowedMethods()` middleware
   - Ensures proper HTTP method handling

### Hono Adapter

The Hono adapter (`@ping-me/hono`) integrates with the Hono framework, which is popular for edge computing environments.

#### Implementation Details

```typescript
import { pingMe, createPingEndpoint } from '@ping-me/core';
import { Hono } from 'hono';
import type { Context } from 'hono';

export interface PingMeHonoOptions {
  route?: string;
  interval?: number;
  log?: boolean;
  message?: string;
  autoStart?: boolean;
  apiKey?: string;
  apiEndpoint?: string;
  baseUrl?: string;
}

export function withPingMe(
  app: Hono,
  options: PingMeHonoOptions = {}
) {
  const {
    route = '/ping-me',
    interval = 300000, // 5 minutes
    log = true,
    message = 'Ping-Me: Hono server is up and running',
    autoStart = true,
    apiKey,
    apiEndpoint,
    baseUrl,
  } = options;

  // Create the ping endpoint
  app.get(route, (c: Context) => {
    const response = createPingEndpoint({ message }).handler();
    return c.json(response);
  });

  if (autoStart) {
    if (!baseUrl) {
      console.warn('[ping-me] Hono requires a baseUrl for auto-pinging. Please provide a baseUrl option.');
      return {
        stopPinging: () => {},
        pingUrl: '',
      };
    }
    
    // Determine the full URL to ping
    const pingUrl = `${baseUrl.replace(/\/$/, '')}${route}`;
    
    // Start pinging
    const stopPinging = pingMe({
      url: pingUrl,
      interval,
      log: log ? console.log : () => {},
      apiKey,
      apiEndpoint,
    });
    
    return {
      stopPinging,
      pingUrl,
    };
  }
  
  return {
    stopPinging: () => {},
    pingUrl: baseUrl ? `${baseUrl.replace(/\/$/, '')}${route}` : '',
  };
}

// Alias for backward compatibility
export const withPingMeHono = withPingMe;
```

#### Key Features

1. **Edge Compatibility**:
   - Works in edge computing environments (Cloudflare Workers, Deno, Bun)
   - Minimal dependencies

2. **Context API**:
   - Uses Hono's context (`c`) for response handling
   - Uses `c.json()` for JSON responses

3. **BaseUrl Requirement**:
   - Explicitly requires `baseUrl` for auto-pinging
   - Provides clear warning when missing

### Adapter Comparison

| Feature | Express | Next.js | Fastify | Koa | Hono |
|---------|---------|---------|---------|-----|------|
| **Route Registration** | `app.get()` | API route handler | `fastify.get()` | `router.get()` | `app.get()` |
| **Response Method** | `res.json()` | `res.status().json()` | `reply.send()` | `ctx.body =` | `c.json()` |
| **URL Detection** | Manual | Manual | Server address | Manual | Requires baseUrl |
| **Client-Side Support** | No | Yes (React hook) | No | No | No |
| **Edge Runtime Support** | No | Partial | No | No | Yes |
| **Additional Dependencies** | None | React | None | koa-router | None |

## Framework-Specific Implementation Details

### Express-Specific Details

1. **Middleware Chain Integration**:
   - Can be placed anywhere in the middleware chain
   - Works with other Express middleware

2. **Server Instance Handling**:
   - Does not directly access the HTTP server instance
   - Requires manual `baseUrl` configuration for accurate ping URL

3. **Error Handling**:
   - Uses Express's error handling mechanism
   - Can be wrapped in try/catch blocks

4. **Body Parsing**:
   - Does not require body-parser middleware
   - Only handles GET requests with no body

### Next.js-Specific Details

1. **API Routes**:
   - Designed for `/pages/api/` directory structure
   - Also works with App Router using Route Handlers

2. **Client-Side Hook**:
   - React hook implementation with proper cleanup
   - Safely handles SSR and hydration

3. **Vercel Deployment**:
   - Works with Vercel's serverless functions
   - Handles cold starts effectively

4. **Edge Runtime Support**:
   - API handler works in Edge Runtime
   - Hook works in all React environments

### Fastify-Specific Details

1. **Plugin System**:
   - Compatible with Fastify's plugin architecture
   - Respects encapsulation boundaries

2. **Server Address Detection**:
   - Uses Fastify's `server.address()` method
   - Handles IPv6 addresses correctly

3. **Lifecycle Hooks**:
   - Uses `fastify.ready()` to ensure server is initialized
   - Properly handles asynchronous server startup

4. **Type Safety**:
   - Leverages Fastify's TypeScript support
   - Provides type definitions for all options

### Koa-Specific Details

1. **Router Requirement**:
   - Requires a koa-router instance
   - Applies router middleware to the app

2. **Middleware Context**:
   - Uses Koa's context object
   - Maintains middleware chain

3. **Error Handling**:
   - Compatible with Koa's error handling
   - Can be used with error middleware

4. **Async Support**:
   - Works with Koa's async/await pattern
   - Properly handles asynchronous operations

### Hono-Specific Details

1. **Edge Runtime Support**:
   - Designed for Cloudflare Workers, Deno, and Bun
   - Minimal dependencies for edge compatibility

2. **BaseUrl Requirement**:
   - Explicitly requires `baseUrl` configuration
   - Cannot auto-detect server address in edge environments

3. **Context API**:
   - Uses Hono's context object
   - Maintains Hono's middleware chain

4. **Web Standard Compatibility**:
   - Works with standard Web APIs
   - Compatible with various JavaScript runtimes
``` 