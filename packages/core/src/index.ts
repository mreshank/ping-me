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
  method?: 'GET' | 'HEAD';
  timeout?: number;
  headers?: Record<string, string>;
  retryCount?: number;
  retryDelay?: number;
  httpAgent?: any;
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
  method = 'HEAD',
  timeout = 10000,
  headers = {},
  retryCount = 2,
  retryDelay = 1000,
  httpAgent = undefined
}: PingMeOptions): () => void {
  const intervalId = setInterval(() => pingOnce(), interval);
  
  log(`[ping-me] Started pinging ${url} every ${interval / 1000}s`);

  async function pingOnce(attemptNumber = 0): Promise<void> {
    const startTime = Date.now();
    let result: PingResult;

    try {
      const fetchOptions: RequestInit = {
        method,
        headers: {
          'Accept': '*/*',
          'Connection': 'keep-alive',
          ...headers
        },
        signal: AbortSignal.timeout(timeout),
        ...(httpAgent ? { agent: httpAgent } : {})
      };

      const response = await fetch(url, fetchOptions);
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
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (attemptNumber < retryCount && isRetryableError(error)) {
        log(`[ping-me] Ping failed, retrying (${attemptNumber + 1}/${retryCount}):`, errorMessage);
        
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        
        return pingOnce(attemptNumber + 1);
      }
      
      result = {
        status: 0,
        responseTime: endTime - startTime,
        timestamp: endTime,
        error: errorMessage,
      };
      
      log(`[ping-me] Ping failed:`, error);
    }

    if (onResult) {
      onResult(result);
    }

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
  }

  pingOnce();
  
  return () => {
    clearInterval(intervalId);
    log(`[ping-me] Stopped pinging ${url}`);
  };
}

function isRetryableError(error: any): boolean {
  if (error instanceof TypeError || error.name === 'AbortError') {
    return true;
  }
  
  return false;
}

export function createPingEndpoint(options: { 
  message?: string;
  includeTimestamp?: boolean;
  includeVersion?: boolean;
  includeMemoryUsage?: boolean;
} = {}) {
  const { 
    message = 'Ping-Me: Service is up and running',
    includeTimestamp = true,
    includeVersion = false,
    includeMemoryUsage = false
  } = options;
  
  const response: Record<string, any> = {
    status: 'ok', 
    message,
  };
  
  if (includeTimestamp) {
    response['timestamp'] = new Date().toISOString();
  }
  
  if (includeVersion && typeof process !== 'undefined') {
    response['version'] = process.version;
  }
  
  if (includeMemoryUsage && typeof process !== 'undefined') {
    try {
      response['memory'] = process.memoryUsage();
    } catch (e) {
      // Ignore if not available (e.g., in browser)
    }
  }
  
  return {
    message,
    
    handler: () => {
      return response;
    },
  };
}
