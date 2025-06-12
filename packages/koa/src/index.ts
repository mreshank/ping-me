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

/**
 * Koa middleware for ping-me
 * Adds a ping endpoint and optionally starts pinging it
 */
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
      pingUrl = `http://localhost:3000${route}`;
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
    pingUrl: baseUrl ? `${baseUrl.replace(/\/$/, '')}${route}` : `http://localhost:3000${route}`,
  };
}

// Alias for backward compatibility
export const withPingMeKoa = withPingMe;