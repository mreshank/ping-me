import { PingMe } from '@ping-me/core';
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

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

/**
 * Create a ping endpoint response handler
 */
function createPingEndpoint(options: { message: string }) {
  return {
    handler() {
      return {
        status: 'ok',
        message: options.message,
        timestamp: new Date().toISOString(),
      };
    }
  };
}

/**
 * Fastify plugin for ping-me
 * Adds a ping endpoint and optionally starts pinging it
 */
export function withPingMe(
  app: FastifyInstance,
  options: PingMeFastifyOptions = {}
) {
  const {
    route = '/ping-me',
    interval = 300000, // 5 minutes
    log = true,
    message = 'Ping-Me: Fastify server is up and running',
    autoStart = true,
    apiKey = '',
    apiEndpoint,
    baseUrl,
  } = options;

  // Create the ping endpoint
  app.get(route, async (_req: FastifyRequest, reply: FastifyReply) => {
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
      // Default to localhost:3000 if no baseUrl provided
      pingUrl = `http://localhost:3000${route}`;
    }
    
    // Start pinging
    const pingMe = new PingMe({
      urls: [pingUrl],
      interval,
      onPing: log ? console.log : () => {},
      apiKey,
      apiEndpoint,
    });
    
    pingMe.start();
    
    return {
      stopPinging: () => pingMe.stop(),
      pingUrl,
    };
  }
  
  return {
    stopPinging: () => {},
    pingUrl: baseUrl ? `${baseUrl.replace(/\/$/, '')}${route}` : `http://localhost:3000${route}`,
  };
}

// Alias for backward compatibility
export const withPingMeFastify = withPingMe; 