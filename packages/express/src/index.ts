import { pingMe, createPingEndpoint } from "@ping-me/core";
import type { Express, Request, Response } from "express";

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

/**
 * Express middleware for ping-me
 * Adds a ping endpoint and optionally starts pinging it
 */
export function withPingMe(
  app: Express,
  options: PingMeExpressOptions = {}
) {
  const {
    route = "/ping-me",
    interval = 300000, // 5 minutes
    log = true,
    message = "Ping-Me: Express server is up and running",
    autoStart = true,
    apiKey,
    apiEndpoint,
    baseUrl,
  } = options;

  // Create the ping endpoint
  app.get(route, (_req: Request, res: Response) => {
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
