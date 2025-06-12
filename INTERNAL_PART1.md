# Ping-Me: Internal Documentation - Part 1

## Project Overview & Architecture

### Introduction

Ping-Me is a comprehensive solution designed to prevent free-tier backend services from going to sleep by automatically pinging them at regular intervals. The project addresses a common problem faced by developers using free-tier hosting services like Heroku, Render, Railway, and others, where applications are put to sleep after periods of inactivity to conserve resources.

### Core Problem Statement

Free-tier hosting services typically implement an idle timeout mechanism:
1. When a service receives no incoming traffic for a certain period (often 15-30 minutes)
2. The service is put into a "sleep" state to conserve resources
3. When a new request arrives, the service needs to "wake up," causing:
   - Cold start delays (5-30 seconds)
   - Poor user experience
   - Potential timeouts for time-sensitive operations

### Solution Architecture

Ping-Me solves this problem through a modular, framework-agnostic architecture:

```
┌───────────────────────────────────────────────────────────────────┐
│                        ping-me (Main Package)                      │
└───────────────────────────────────────────────────────────────────┘
                │                 │                 │
    ┌───────────┴───────┐ ┌──────┴───────┐ ┌───────┴───────────┐
    │                   │ │              │ │                   │
┌───▼───────────┐ ┌────▼────────┐ ┌─────▼─────┐ ┌─────────────▼─────┐
│ @ping-me/core │ │ Framework   │ │ Framework │ │ @ping-me/metrics- │
│ (Core Engine) │ │ Adapters    │ │ Aliases   │ │ server (Optional) │
└───────────────┘ └─────────────┘ └───────────┘ └───────────────────┘
                     │     │     │
             ┌───────┘     │     └────────┐
      ┌──────▼─────┐ ┌────▼────┐ ┌───────▼────┐
      │ Express    │ │ Next.js │ │ Fastify    │
      └────────────┘ └─────────┘ └────────────┘
             │             │            │
      ┌──────▼─────┐ ┌────▼────┐ ┌─────▼──────┐
      │ Koa        │ │ Hono    │ │ (Future    │
      └────────────┘ └─────────┘ │ Adapters)  │
                                 └────────────┘
```

### Key Components

1. **Core Engine** (`@ping-me/core`): 
   - Provides the fundamental pinging mechanism
   - Framework-agnostic implementation
   - Handles scheduling, HTTP requests, and error handling

2. **Framework Adapters**:
   - Express (`@ping-me/express`)
   - Next.js (`@ping-me/next`)
   - Fastify (`@ping-me/fastify`)
   - Koa (`@ping-me/koa`)
   - Hono (`@ping-me/hono`)

3. **Main Package** (`ping-me`):
   - Umbrella package that auto-detects frameworks
   - Provides CLI functionality
   - Simplifies usage through automatic configuration

4. **Framework Aliases**:
   - `keep-server-alive`
   - `keepwake`
   - `keepawake`
   - Provide backward compatibility and alternative entry points

5. **Metrics Server** (`@ping-me/metrics-server`):
   - Optional component for monitoring and analytics
   - Collects ping data, response times, and status codes
   - Provides alerting capabilities

## Core Concepts & Functionality

### Ping Mechanism

The core pinging mechanism works through the following process:

1. **Endpoint Creation**:
   - Each framework adapter creates a dedicated health endpoint (e.g., `/ping-me`)
   - The endpoint returns a standardized response with status and timestamp

2. **Ping Scheduling**:
   - A timer is established to make HTTP requests to the endpoint at regular intervals
   - Default interval is 5 minutes (300,000ms), configurable by the user

3. **Request Handling**:
   - HTTP requests are made using `node-fetch` or native `fetch` when available
   - Response times are measured
   - Status codes and errors are captured

4. **Metrics Collection** (optional):
   - When an API key is provided, ping results are sent to the metrics server
   - Metrics include response time, status code, and error information

### Framework Detection

The main package implements automatic framework detection:

1. The `initialize` function checks for the presence of framework packages in the user's environment
2. It attempts to load the corresponding adapter package
3. If successful, it returns the appropriate adapter functions
4. If no framework is detected, it falls back to the core functionality

```javascript
// Simplified framework detection logic
function detectFramework(name) {
  try {
    require.resolve(name);
    return true;
  } catch (e) {
    return false;
  }
}

// Framework detection flags
export const frameworks = {
  express: detectFramework('express'),
  next: detectFramework('next'),
  fastify: detectFramework('fastify'),
  koa: detectFramework('koa'),
  hono: detectFramework('hono')
};
```

### CLI Functionality

The CLI provides a command-line interface for users who want to ping endpoints without integrating the library into their code:

1. **Command Parsing**:
   - Parses arguments using a simple custom parser or Commander.js
   - Supports options like `--url`, `--interval`, `--apiKey`

2. **Environment Variable Support**:
   - Can load endpoints from environment variables
   - Supports custom prefixes (e.g., `PING_ME_ENDPOINT_*`)

3. **Multiple Endpoints**:
   - Can ping multiple endpoints simultaneously
   - Each endpoint is tracked independently

4. **Process Management**:
   - Keeps the Node.js process alive using `process.stdin.resume()`
   - Handles graceful shutdown with signal handlers

### Auto-Start Mechanism

Most framework adapters implement an auto-start feature:

1. When the adapter is initialized, it automatically:
   - Creates the ping endpoint
   - Determines the full URL to ping
   - Starts the pinging process
   
2. This behavior can be disabled with `autoStart: false`

3. The URL determination logic varies by framework:
   - Some frameworks require explicit `baseUrl` configuration
   - Others can infer the URL from the server configuration

## Core Package Deep Dive

### Package Structure

```
packages/core/
├── src/
│   ├── index.ts         # Main entry point & exports
│   ├── ping.ts          # Core pinging functionality
│   ├── endpoint.ts      # Endpoint creation utilities
│   ├── types.ts         # TypeScript type definitions
│   └── utils.ts         # Helper functions
├── test/
│   └── [test files]     # Unit tests
├── package.json         # Package metadata & dependencies
└── tsconfig.json        # TypeScript configuration
```

### Core API

The core package exposes two primary functions:

1. **`pingMe`**: Initiates pinging of a specified URL
   ```typescript
   function pingMe(options: PingMeOptions): {
     stopPinging: () => void;
     pingUrl: string;
   }
   ```

2. **`createPingEndpoint`**: Creates a handler for ping requests
   ```typescript
   function createPingEndpoint(options?: CreatePingEndpointOptions): {
     handler: () => PingResponse;
   }
   ```

### Ping Implementation

The pinging mechanism is implemented using:

1. **Interval-based scheduling**:
   ```typescript
   const interval = setInterval(async () => {
     try {
       const startTime = Date.now();
       const response = await fetch(url, { method: 'GET' });
       const responseTime = Date.now() - startTime;
       
       // Process response...
     } catch (error) {
       // Handle error...
     }
   }, options.interval || 300000);
   ```

2. **Fetch API** for HTTP requests:
   - Uses `node-fetch` in Node.js environments
   - Falls back to global `fetch` when available
   - Implements timeout handling

3. **Error handling**:
   - Network errors
   - Timeout errors
   - HTTP error status codes

4. **Metrics reporting** (when API key is provided):
   ```typescript
   if (options.apiKey) {
     try {
       await fetch(options.apiEndpoint || DEFAULT_API_ENDPOINT, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${options.apiKey}`
         },
         body: JSON.stringify({
           endpoint: url,
           status: response.status,
           responseTime,
           timestamp: new Date().toISOString(),
           error: errorMessage
         })
       });
     } catch (reportError) {
       // Handle reporting error...
     }
   }
   ```

### Endpoint Creation

The endpoint creation utility provides:

1. **Standardized response format**:
   ```typescript
   {
     status: 'ok',
     timestamp: '2023-08-01T12:00:00.000Z',
     message: 'Server is up and running'
   }
   ```

2. **Customizable messages**:
   - Default message can be overridden
   - Can return plain text or JSON

3. **Framework-agnostic handler**:
   - Returns a plain object that can be adapted by framework-specific code
   - No dependencies on request/response objects

## Build System & Development Workflow

### Monorepo Structure

The project uses a monorepo structure managed with:

1. **pnpm Workspaces**:
   - Defined in `pnpm-workspace.yaml`
   - Enables sharing of dependencies across packages
   - Simplifies versioning and publishing

2. **Turborepo**:
   - Configured in `turbo.json`
   - Provides build caching and pipeline optimization
   - Manages task dependencies across packages

### Build Process

Each package is built using:

1. **tsup**:
   - TypeScript-first bundler
   - Configured to output CommonJS and ESM formats
   - Generates type definitions

2. **TypeScript**:
   - Strict type checking
   - Consistent configuration across packages
   - Type definitions for public APIs

3. **Build Scripts**:
   ```json
   {
     "scripts": {
       "build": "tsup src/index.ts --format cjs,esm --dts",
       "dev": "tsup src/index.ts --format cjs,esm --dts --watch"
     }
   }
   ```

### Development Workflow

The development workflow includes:

1. **Local Package Linking**:
   - Packages reference each other using workspace references
   - Changes in one package immediately affect dependent packages

2. **Watch Mode**:
   - `pnpm dev` starts watch mode for incremental compilation
   - Changes are automatically recompiled

3. **Testing**:
   - Unit tests with Vitest
   - Integration tests for framework adapters
   - End-to-end tests for the complete flow

4. **Linting & Formatting**:
   - ESLint for code quality
   - Prettier for consistent formatting
   - Pre-commit hooks with Husky

### Versioning & Publishing

The project implements:

1. **Semantic Versioning**:
   - Major version for breaking changes
   - Minor version for new features
   - Patch version for bug fixes

2. **Changesets**:
   - Tracks changes across packages
   - Automates version bumping
   - Generates changelogs

3. **Publishing Process**:
   - Builds all packages
   - Runs tests
   - Updates versions
   - Publishes to npm 