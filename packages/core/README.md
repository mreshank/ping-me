# @ping-me/core

The foundational package for Ping-Me, providing the core functionality to keep your services alive and monitor their health.

[![npm version](https://img.shields.io/npm/v/@ping-me/core)](https://www.npmjs.com/package/@ping-me/core)
[![License](https://img.shields.io/github/license/mreshank/ping-me)](https://github.com/mreshank/ping-me/blob/main/LICENSE)

## Overview

`@ping-me/core` is the heart of the Ping-Me ecosystem, providing the fundamental capabilities to:

- Keep your free-tier backend services alive by preventing sleep cycles
- Monitor service health and response times
- Collect and report metrics
- Trigger notifications when services go down
- Support custom ping intervals and configurations

This package can be used directly, but most users will prefer the framework-specific packages like `@ping-me/express` or `@ping-me/next`.

## Installation

```bash
npm install @ping-me/core

# or with yarn
yarn add @ping-me/core

# or with pnpm
pnpm add @ping-me/core
```

## Basic Usage

```typescript
import { PingMe } from '@ping-me/core';

// Initialize with your API key
const pingMe = new PingMe({
  apiKey: 'your-api-key-here',
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

## Configuration Options

The `PingMe` constructor accepts the following options:

```typescript
interface PingMeOptions {
  /**
   * Your Ping-Me API key (required)
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

### Example with all options

```typescript
import { PingMe } from '@ping-me/core';

const pingMe = new PingMe({
  apiKey: 'your-api-key-here',
  pingInterval: 60000, // 1 minute
  onSuccess: (endpoint, responseTime) => {
    console.log(`Successfully pinged ${endpoint} in ${responseTime}ms`);
  },
  onError: (error, endpoint) => {
    console.error(`Failed to ping ${endpoint}: ${error.message}`);
    // You could send an alert or notification here
  },
  autoStart: true // Automatically start pinging
});

pingMe.register([
  'https://your-api.example.com',
]);
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

Returns a `PingMeStatus` object with the following structure:

```typescript
interface PingMeStatus {
  /**
   * Whether the ping service is currently active
   */
  isActive: boolean;
  
  /**
   * The registered endpoints
   */
  endpoints: string[];
  
  /**
   * The current ping interval in milliseconds
   */
  pingInterval: number;
  
  /**
   * The timestamp of the last ping (if any)
   */
  lastPingTimestamp?: number;
  
  /**
   * The results of the last ping by endpoint
   */
  lastPingResults: Record<string, PingResult>;
}
```

##### `pingAll(): Promise<Record<string, PingResult>>`

Manually ping all registered endpoints immediately.

```typescript
const results = await pingMe.pingAll();
console.log(results);
```

Returns a promise that resolves to an object mapping endpoint URLs to their ping results.

##### `ping(endpoint: string): Promise<PingResult>`

Manually ping a specific endpoint immediately.

```typescript
const result = await pingMe.ping('https://api.example.com');
console.log(result);
```

Returns a promise that resolves to the ping result.

### `pingMe` Function

A simplified API for cases where you just want to ping a single URL.

```typescript
import { pingMe } from '@ping-me/core';

const stopPinging = pingMe({
  apiKey: 'your-api-key-here',
  url: 'https://api.example.com',
  pingInterval: 60000, // 1 minute
});

// Later, to stop pinging
stopPinging();
```

### Types

#### `PingResult`

Represents the result of a ping operation.

```typescript
interface PingResult {
  /**
   * Whether the ping was successful
   */
  success: boolean;
  
  /**
   * Response time in milliseconds (if successful)
   */
  responseTime?: number;
  
  /**
   * Error message (if failed)
   */
  error?: string;
  
  /**
   * Timestamp of when the ping was performed
   */
  timestamp: number;
}
```

## Advanced Usage

### Custom Ping Intervals Based on Time

If you want to ping more frequently during business hours and less frequently during off-hours:

```typescript
import { PingMe } from '@ping-me/core';

const pingMe = new PingMe({
  apiKey: 'your-api-key-here',
});

pingMe.register('https://api.example.com');

// Start with default interval
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

### Custom Error Handling and Retries

```typescript
import { PingMe } from '@ping-me/core';

// Keep track of consecutive failures
const failureCount = {};
const MAX_FAILURES = 3;

const pingMe = new PingMe({
  apiKey: 'your-api-key-here',
  onSuccess: (endpoint) => {
    // Reset failure count on success
    failureCount[endpoint] = 0;
  },
  onError: async (error, endpoint) => {
    // Increment failure count
    failureCount[endpoint] = (failureCount[endpoint] || 0) + 1;
    
    console.error(`Failed to ping ${endpoint}: ${error.message}`);
    
    // If we've failed too many times, take action
    if (failureCount[endpoint] >= MAX_FAILURES) {
      console.error(`${endpoint} has failed ${failureCount[endpoint]} times in a row. Taking action...`);
      
      // Example: Send a notification
      await sendNotification(`${endpoint} is down: ${error.message}`);
      
      // Example: Try an immediate retry
      try {
        console.log(`Attempting immediate retry for ${endpoint}...`);
        const result = await pingMe.ping(endpoint);
        if (result.success) {
          console.log(`Retry succeeded for ${endpoint}`);
          failureCount[endpoint] = 0;
        }
      } catch (retryError) {
        console.error(`Retry also failed for ${endpoint}: ${retryError.message}`);
      }
    }
  }
});

pingMe.register(['https://api.example.com']);
pingMe.start();

async function sendNotification(message) {
  // Implement your notification logic here
  // e.g., send an email, Slack message, etc.
  console.log(`NOTIFICATION: ${message}`);
}
```

### Using with Environment Variables

```typescript
import { PingMe } from '@ping-me/core';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const API_KEY = process.env.PING_ME_API_KEY;
if (!API_KEY) {
  throw new Error('PING_ME_API_KEY environment variable is required');
}

// Parse comma-separated list of endpoints
const endpointsStr = process.env.PING_ME_ENDPOINTS || '';
const endpoints = endpointsStr.split(',').filter(url => url.trim());

if (endpoints.length === 0) {
  throw new Error('No endpoints specified in PING_ME_ENDPOINTS');
}

// Parse ping interval (default to 5 minutes)
const pingInterval = parseInt(process.env.PING_ME_INTERVAL || '300000', 10);

const pingMe = new PingMe({
  apiKey: API_KEY,
  pingInterval,
  onError: (error, endpoint) => {
    console.error(`Failed to ping ${endpoint}: ${error.message}`);
  }
});

pingMe.register(endpoints);
pingMe.start();

// Handle process shutdown
process.on('SIGINT', () => {
  console.log('Stopping ping service...');
  pingMe.stop();
  process.exit(0);
});
```

### Handling Different Response Status Codes

```typescript
import { PingMe } from '@ping-me/core';
import fetch from 'node-fetch';

const pingMe = new PingMe({
  apiKey: 'your-api-key-here',
});

// Start regular pinging
pingMe.register(['https://api.example.com']);
pingMe.start();

// Custom ping function that checks for specific status codes
async function customPing(url) {
  try {
    const startTime = Date.now();
    const response = await fetch(url);
    const responseTime = Date.now() - startTime;
    
    if (response.status >= 200 && response.status < 300) {
      console.log(`✅ ${url} responded with ${response.status} in ${responseTime}ms`);
      return;
    }
    
    if (response.status >= 300 && response.status < 400) {
      console.warn(`⚠️ ${url} returned a redirect (${response.status}) in ${responseTime}ms`);
      return;
    }
    
    if (response.status === 401 || response.status === 403) {
      console.error(`🔒 ${url} returned authentication error (${response.status}) in ${responseTime}ms`);
      // Maybe credentials need to be updated
      await sendAuthAlert(url, response.status);
      return;
    }
    
    if (response.status >= 500) {
      console.error(`🚨 ${url} returned server error (${response.status}) in ${responseTime}ms`);
      await sendServerErrorAlert(url, response.status);
      return;
    }
    
    console.warn(`❓ ${url} returned unexpected status (${response.status}) in ${responseTime}ms`);
  } catch (error) {
    console.error(`❌ Failed to ping ${url}: ${error.message}`);
    await sendConnectionErrorAlert(url, error.message);
  }
}

// Run custom ping check every 10 minutes
setInterval(() => {
  pingMe.getStatus().endpoints.forEach(customPing);
}, 10 * 60 * 1000);

async function sendAuthAlert(url, status) {
  // Implement authentication alert
}

async function sendServerErrorAlert(url, status) {
  // Implement server error alert
}

async function sendConnectionErrorAlert(url, error) {
  // Implement connection error alert
}
```

## Troubleshooting

### API Key Issues

If you're having problems with your API key:

1. Make sure your API key is valid and correctly formatted
2. Check that your API key has the necessary permissions
3. Verify that your account is active and in good standing
4. Try generating a new API key from the dashboard

### Connection Issues

If the ping service is failing to connect to your endpoints:

1. Check that the endpoints are accessible from the environment where ping-me is running
2. Verify that there are no network restrictions or firewalls blocking the connections
3. Check if the endpoints require authentication or special headers
4. Try pinging the endpoints manually to confirm they're reachable

```typescript
import fetch from 'node-fetch';

async function testEndpoint(url) {
  try {
    const response = await fetch(url);
    console.log(`Status: ${response.status}`);
    console.log(`Headers:`, response.headers);
    const text = await response.text();
    console.log(`Body: ${text.substring(0, 100)}...`);
  } catch (error) {
    console.error(`Error connecting to ${url}: ${error.message}`);
  }
}

testEndpoint('https://your-endpoint.example.com');
```

### High CPU or Memory Usage

If the ping service is using too much CPU or memory:

1. Reduce the number of endpoints being monitored
2. Increase the ping interval to reduce frequency
3. Simplify any custom logic in the `onSuccess` and `onError` handlers
4. Check for memory leaks in your application

### Logging Issues

To debug issues with the ping service, you can implement detailed logging:

```typescript
import { PingMe } from '@ping-me/core';
import fs from 'fs';

// Set up a log file
const logStream = fs.createWriteStream('ping-me.log', { flags: 'a' });

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  logStream.write(logMessage);
  console.log(message);
}

const pingMe = new PingMe({
  apiKey: 'your-api-key-here',
  onSuccess: (endpoint, responseTime) => {
    log(`Success: ${endpoint} responded in ${responseTime}ms`);
  },
  onError: (error, endpoint) => {
    log(`Error: Failed to ping ${endpoint}: ${error.message}`);
  }
});

pingMe.register(['https://api.example.com']);

log('Starting ping service...');
pingMe.start();

// Log status periodically
setInterval(() => {
  const status = pingMe.getStatus();
  log(`Status: active=${status.isActive}, endpoints=${status.endpoints.length}, interval=${status.pingInterval}ms`);
  
  for (const [endpoint, result] of Object.entries(status.lastPingResults)) {
    if (result.success) {
      log(`Last ping for ${endpoint}: success, ${result.responseTime}ms, at ${new Date(result.timestamp).toISOString()}`);
    } else {
      log(`Last ping for ${endpoint}: failed, "${result.error}", at ${new Date(result.timestamp).toISOString()}`);
    }
  }
}, 60000); // Log every minute
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