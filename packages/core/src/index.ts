import fetch from 'node-fetch';
import debug from 'debug';

const log = debug('ping-me:core');

export interface PingMeOptions {
  /**
   * Your Ping-Me API key
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

export interface PingMeStatus {
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

export interface PingResult {
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

/**
 * Main PingMe class to keep your services awake
 */
export class PingMe {
  private apiKey: string;
  private pingInterval: number;
  private onSuccess?: (endpoint: string, responseTime: number) => void;
  private onError?: (error: Error, endpoint: string) => void;
  private endpoints: Set<string> = new Set();
  private intervalId?: NodeJS.Timeout;
  private lastPingTimestamp?: number;
  private lastPingResults: Record<string, PingResult> = {};
  private apiEndpoint = 'https://api.ping-me.app/v1/ping';

  /**
   * Create a new PingMe instance
   */
  constructor(options: PingMeOptions) {
    this.apiKey = options.apiKey;
    this.pingInterval = options.pingInterval || 300000; // Default: 5 minutes
    this.onSuccess = options.onSuccess;
    this.onError = options.onError;
    
    if (options.autoStart) {
      this.start();
    }
  }

  /**
   * Register one or more endpoints to ping
   */
  register(endpoints: string | string[]): this {
    if (Array.isArray(endpoints)) {
      endpoints.forEach(endpoint => this.endpoints.add(endpoint));
    } else {
      this.endpoints.add(endpoints);
    }
    
    log(`Registered endpoints: ${Array.from(this.endpoints).join(', ')}`);
    return this;
  }

  /**
   * Unregister one or more endpoints
   */
  unregister(endpoints: string | string[]): this {
    if (Array.isArray(endpoints)) {
      endpoints.forEach(endpoint => this.endpoints.delete(endpoint));
    } else {
      this.endpoints.delete(endpoints);
    }
    
    log(`Remaining endpoints: ${Array.from(this.endpoints).join(', ')}`);
    return this;
  }

  /**
   * Start pinging the registered endpoints
   */
  start(): this {
    if (this.intervalId) {
      log('Ping service is already running');
      return this;
    }

    if (this.endpoints.size === 0) {
      log('No endpoints registered, not starting ping service');
      return this;
    }

    // Immediately ping once
    this.pingAll();
    
    // Then set up the interval
    this.intervalId = setInterval(() => this.pingAll(), this.pingInterval);
    log(`Started ping service with interval ${this.pingInterval}ms`);
    
    return this;
  }

  /**
   * Stop pinging
   */
  stop(): this {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
      log('Stopped ping service');
    }
    
    return this;
  }

  /**
   * Change the ping interval
   */
  setPingInterval(interval: number): this {
    this.pingInterval = interval;
    
    // Restart the timer if it's already running
    if (this.intervalId) {
      this.stop();
      this.start();
    }
    
    log(`Updated ping interval to ${interval}ms`);
    return this;
  }

  /**
   * Get current status
   */
  getStatus(): PingMeStatus {
    return {
      isActive: !!this.intervalId,
      endpoints: Array.from(this.endpoints),
      pingInterval: this.pingInterval,
      lastPingTimestamp: this.lastPingTimestamp,
      lastPingResults: this.lastPingResults
    };
  }

  /**
   * Manually trigger a ping to all registered endpoints
   */
  async pingAll(): Promise<Record<string, PingResult>> {
    const results: Record<string, PingResult> = {};
    this.lastPingTimestamp = Date.now();
    
    const promises = Array.from(this.endpoints).map(async (endpoint) => {
      try {
        const startTime = Date.now();
        
        // First ping the endpoint directly
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'User-Agent': 'PingMe/0.1.0'
          },
          timeout: 10000 // 10 second timeout
        });
        
        const responseTime = Date.now() - startTime;
        const success = response.ok;
        
        results[endpoint] = {
          success,
          responseTime,
          timestamp: Date.now()
        };
        
        // Then log the ping to our API if the direct ping was successful
        if (success) {
          this.logPing(endpoint, responseTime).catch(err => {
            log(`Failed to log ping for ${endpoint}: ${err.message}`);
          });
          
          if (this.onSuccess) {
            this.onSuccess(endpoint, responseTime);
          }
          
          log(`Successfully pinged ${endpoint} in ${responseTime}ms`);
        } else {
          const error = new Error(`Ping failed with status ${response.status}`);
          
          if (this.onError) {
            this.onError(error, endpoint);
          }
          
          results[endpoint].error = `HTTP ${response.status}`;
          log(`Failed to ping ${endpoint}: HTTP ${response.status}`);
        }
      } catch (error) {
        const err = error as Error;
        
        results[endpoint] = {
          success: false,
          error: err.message,
          timestamp: Date.now()
        };
        
        if (this.onError) {
          this.onError(err, endpoint);
        }
        
        log(`Error pinging ${endpoint}: ${err.message}`);
      }
    });
    
    await Promise.all(promises);
    this.lastPingResults = { ...results };
    
    return results;
  }

  /**
   * Ping a specific endpoint
   */
  async ping(endpoint: string): Promise<PingResult> {
    if (!this.endpoints.has(endpoint)) {
      throw new Error(`Endpoint ${endpoint} is not registered`);
    }
    
    try {
      const startTime = Date.now();
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'User-Agent': 'PingMe/0.1.0'
        },
        timeout: 10000
      });
      
      const responseTime = Date.now() - startTime;
      const success = response.ok;
      
      const result: PingResult = {
        success,
        responseTime,
        timestamp: Date.now()
      };
      
      if (success) {
        this.logPing(endpoint, responseTime).catch(err => {
          log(`Failed to log ping for ${endpoint}: ${err.message}`);
        });
        
        if (this.onSuccess) {
          this.onSuccess(endpoint, responseTime);
        }
        
        log(`Successfully pinged ${endpoint} in ${responseTime}ms`);
      } else {
        const error = new Error(`Ping failed with status ${response.status}`);
        
        if (this.onError) {
          this.onError(error, endpoint);
        }
        
        result.error = `HTTP ${response.status}`;
        log(`Failed to ping ${endpoint}: HTTP ${response.status}`);
      }
      
      this.lastPingResults[endpoint] = result;
      return result;
    } catch (error) {
      const err = error as Error;
      
      const result: PingResult = {
        success: false,
        error: err.message,
        timestamp: Date.now()
      };
      
      if (this.onError) {
        this.onError(err, endpoint);
      }
      
      this.lastPingResults[endpoint] = result;
      log(`Error pinging ${endpoint}: ${err.message}`);
      
      return result;
    }
  }

  /**
   * Log a ping to the Ping-Me API
   */
  private async logPing(endpoint: string, responseTime: number): Promise<void> {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'User-Agent': 'PingMe/0.1.0'
        },
        body: JSON.stringify({
          endpoint,
          status: 200,
          responseTime,
          timestamp: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        const text = await response.text();
        log(`API error logging ping: HTTP ${response.status} - ${text}`);
      }
    } catch (error) {
      const err = error as Error;
      log(`Failed to log ping to API: ${err.message}`);
    }
  }
}

// Export a simplified function for basic usage
export function pingMe(options: PingMeOptions & { url: string }): () => void {
  const { url, ...restOptions } = options;
  const pingMe = new PingMe(restOptions);
  
  pingMe.register(url);
  pingMe.start();
  
  return () => pingMe.stop();
}
