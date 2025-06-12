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

/**
 * Hono middleware for ping-me
 * Adds a ping endpoint and optionally starts pinging it
 */
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