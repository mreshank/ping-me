import { Express, Request, Response, NextFunction } from 'express';
import { PingMe, PingMeOptions } from '@ping-me/client';

export interface ExpressPingMeOptions extends PingMeOptions {
  /**
   * The route path for the ping endpoint (default: '/ping')
   */
  route?: string;
  
  /**
   * Whether to automatically register the current service (default: true)
   */
  registerSelf?: boolean;
  
  /**
   * A list of additional endpoints to monitor
   */
  endpoints?: string[];
}

/**
 * Add Ping-Me to an Express application
 */
export function withPingMe(app: Express, options: ExpressPingMeOptions): PingMe {
  const {
    route = '/ping',
    registerSelf = true,
    endpoints = [],
    ...pingMeOptions
  } = options;
  
  // Create a new PingMe instance
  const pingMe = new PingMe(pingMeOptions);
  
  // Register the ping endpoint
  app.get(route, (req: Request, res: Response) => {
    const handler = pingMe.createPingHandler();
    handler(req, res);
  });
  
  // Register this service if enabled
  if (registerSelf) {
    pingMe.registerSelf(route);
  }
  
  // Register additional endpoints
  if (endpoints.length > 0) {
    pingMe.register(endpoints);
  }
  
  // Start pinging
  pingMe.start();
  
  // Add the ping-me instance to the app for later reference
  (app as any).pingMe = pingMe;
  
  return pingMe;
}

/**
 * Middleware to add ping-me headers to responses
 */
export function pingMeHeaders(req: Request, res: Response, next: NextFunction): void {
  res.setHeader('X-Powered-By', 'Ping-Me');
  res.setHeader('X-Ping-Me-Version', '0.1.0');
  next();
}

/**
 * Create a ping middleware for Express
 */
export function createPingMiddleware(options: ExpressPingMeOptions = { apiKey: '' }): (req: Request, res: Response) => void {
  const pingMe = new PingMe(options);
  return pingMe.createPingHandler();
}

export { PingMe };
export default withPingMe;
