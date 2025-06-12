import { PingMe as CorePingMe, PingMeOptions, PingMeStatus, PingResult } from '@ping-me/core';

// Re-export the core types
export type { PingMeOptions, PingMeStatus, PingResult };

/**
 * PingMe Client - A wrapper around the core PingMe functionality with additional features
 */
export class PingMe extends CorePingMe {
  /**
   * Create a new PingMe client instance
   */
  constructor(options: PingMeOptions) {
    super(options);
  }

  /**
   * Register endpoints based on environment variables
   * 
   * Looks for environment variables in the format:
   * - PING_ME_ENDPOINT_1=https://example.com
   * - PING_ME_ENDPOINT_2=https://api.example.com
   */
  registerFromEnv(prefix = 'PING_ME_ENDPOINT_'): this {
    if (typeof process === 'undefined' || !process.env) {
      console.warn('Environment variables are not available in this environment');
      return this;
    }

    const endpoints: string[] = [];

    Object.keys(process.env)
      .filter(key => key.startsWith(prefix))
      .forEach(key => {
        const endpoint = process.env[key];
        if (endpoint) {
          endpoints.push(endpoint);
        }
      });

    if (endpoints.length > 0) {
      this.register(endpoints);
      console.log(`Registered ${endpoints.length} endpoints from environment variables`);
    } else {
      console.log(`No endpoints found with prefix ${prefix} in environment variables`);
    }

    return this;
  }

  /**
   * Register the current host as an endpoint
   * 
   * @param path Optional path to ping (default: '/')
   * @param port Optional port override
   */
  registerSelf(path = '/', port?: number): this {
    if (typeof window === 'undefined') {
      // Node.js environment
      const host = process.env.HOST || 'localhost';
      const serverPort = port || process.env.PORT || 3000;
      const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
      
      const endpoint = `${protocol}://${host}:${serverPort}${path}`;
      this.register(endpoint);
      console.log(`Registered self as ${endpoint}`);
    } else {
      // Browser environment
      const location = window.location;
      const endpoint = `${location.protocol}//${location.host}${path}`;
      this.register(endpoint);
      console.log(`Registered self as ${endpoint}`);
    }

    return this;
  }

  /**
   * Create a simple ping endpoint handler for Express/Node.js
   */
  createPingHandler(): (req: any, res: any) => void {
    return (_req: any, res: any) => {
      const response = {
        status: 'ok',
        message: 'Ping-Me: Service is up and running',
        timestamp: new Date().toISOString(),
        version: process.version,
      };

      res.status(200).json(response);
    };
  }
}

// Export a singleton instance for simple usage
let defaultInstance: PingMe | null = null;

/**
 * Initialize the default PingMe instance
 */
export function init(options: PingMeOptions): PingMe {
  if (defaultInstance) {
    defaultInstance.stop();
  }
  
  defaultInstance = new PingMe(options);
  return defaultInstance;
}

/**
 * Get the default PingMe instance
 * 
 * @throws Error if init() has not been called first
 */
export function getInstance(): PingMe {
  if (!defaultInstance) {
    throw new Error('PingMe has not been initialized. Call init() first.');
  }
  
  return defaultInstance;
} 