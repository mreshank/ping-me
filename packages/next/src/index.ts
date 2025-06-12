import { pingMe, createPingEndpoint } from '@ping-me/core';
import { NextApiRequest, NextApiResponse } from 'next';
import { useEffect, useState } from 'react';

export interface PingMeNextOptions {
  baseUrl?: string;
  route?: string;
  interval?: number;
  log?: boolean;
  message?: string;
  apiKey?: string;
  apiEndpoint?: string;
  enabled?: boolean;
}

/**
 * Next.js API route handler for ping-me
 */
export function createPingMeHandler(options: { message?: string } = {}) {
  const { message = 'Ping-Me: Next.js server is up and running' } = options;
  const pingEndpoint = createPingEndpoint({ message });
  
  return function handler(req: NextApiRequest, res: NextApiResponse) {
    res.status(200).json(pingEndpoint.handler());
  };
}

/**
 * React hook for pinging a Next.js API route
 */
export function usePingMe(options: PingMeNextOptions = {}) {
  const {
    baseUrl = typeof window !== 'undefined' ? window.location.origin : '',
    route = '/api/ping-me',
    interval = 300000,
    log = false,
    apiKey,
    apiEndpoint,
    enabled = true,
  } = options;
  
  const [status, setStatus] = useState<{
    isActive: boolean;
    lastPing: number | null;
    lastStatus: number | null;
    error: string | null;
  }>({
    isActive: false,
    lastPing: null,
    lastStatus: null,
    error: null,
  });
  
  useEffect(() => {
    if (!enabled || !baseUrl) return;
    
    const url = `${baseUrl}${route}`;
    
    const stopPinging = pingMe({
      url,
      interval,
      log: log ? console.log : () => {},
      apiKey,
      apiEndpoint,
      onResult: (result) => {
        setStatus({
          isActive: true,
          lastPing: result.timestamp,
          lastStatus: result.status,
          error: result.error || null,
        });
      },
    });
    
    setStatus(prev => ({ ...prev, isActive: true }));
    
    // Cleanup on unmount
    return () => {
      stopPinging();
      setStatus(prev => ({ ...prev, isActive: false }));
    };
  }, [baseUrl, route, interval, log, apiKey, apiEndpoint, enabled]);
  
  return status;
}

/**
 * Higher-order component for Next.js pages
 */
export function withPingMeNext(options: PingMeNextOptions = {}) {
  const {
    baseUrl,
    route = '/api/ping-me',
    interval = 300000,
    log = false,
    apiKey,
    apiEndpoint,
  } = options;
  
  // If no baseUrl and we're on the server, we can't ping
  if (!baseUrl && typeof window === 'undefined') {
    console.warn('[ping-me] Cannot start pinging without baseUrl in server environment');
    return;
  }
  
  const url = `${baseUrl || ''}${route}`;
  
  // Start pinging
  return pingMe({
    url,
    interval,
    log: log ? console.log : () => {},
    apiKey,
    apiEndpoint,
  });
}