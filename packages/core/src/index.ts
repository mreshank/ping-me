type PingResult = {
  status: number;
  responseTime: number;
  timestamp: number;
  error?: string;
};

type LogFunction = (...args: any[]) => void;

export type PingMeOptions = {
  url: string;
  interval?: number;
  log?: LogFunction;
  apiKey?: string;
  apiEndpoint?: string;
  onResult?: (result: PingResult) => void;
};

/**
 * Pings a URL at regular intervals to keep it alive
 * @param options Configuration options for pingMe
 * @returns A function to stop the pinging process
 */
export function pingMe({
  url,
  interval = 5 * 60 * 1000, // 5 minutes by default
  log = console.log,
  apiKey,
  apiEndpoint = 'https://ping-me-api.vercel.app/api/log',
  onResult,
}: PingMeOptions): () => void {
  const intervalId = setInterval(async () => {
    const startTime = Date.now();
    let result: PingResult;

    try {
      const response = await fetch(url);
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      result = {
        status: response.status,
        responseTime,
        timestamp: endTime,
      };
      
      log(`[ping-me] Pinged ${url}: ${response.status} (${responseTime}ms)`);
    } catch (error) {
      const endTime = Date.now();
      
      result = {
        status: 0,
        responseTime: endTime - startTime,
        timestamp: endTime,
        error: error instanceof Error ? error.message : String(error),
      };
      
      log(`[ping-me] Ping failed:`, error);
    }

    // Call the optional onResult handler
    if (onResult) {
      onResult(result);
    }

    // Report to API if apiKey is provided
    if (apiKey && apiEndpoint) {
      try {
        await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            endpoint: url,
            ...result,
          }),
        });
      } catch (error) {
        log(`[ping-me] Failed to report metrics:`, error);
      }
    }
  }, interval);

  log(`[ping-me] Started pinging ${url} every ${interval / 1000}s`);
  
  // Return a cleanup function
  return () => {
    clearInterval(intervalId);
    log(`[ping-me] Stopped pinging ${url}`);
  };
}

/**
 * Creates a ping endpoint handler for various frameworks
 * @param options Configuration options
 * @returns An object with handler functions for different frameworks
 */
export function createPingEndpoint(options: { message?: string } = {}) {
  const { message = 'Ping-Me: Service is up and running' } = options;
  
  return {
    message,
    
    // Generic handler for any framework
    handler: () => {
      return { 
        status: 'ok', 
        message,
        timestamp: new Date().toISOString(),
      };
    },
  };
}
