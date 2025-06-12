import { pingMe, createPingEndpoint } from '../src';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock fetch
global.fetch = vi.fn();
global.AbortSignal = {
  timeout: vi.fn().mockReturnValue({}),
} as any;

describe('pingMe', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    // Mock successful fetch by default
    (global.fetch as any).mockResolvedValue({
      status: 200,
      text: () => Promise.resolve('OK')
    });
  });
  
  afterEach(() => {
    vi.useRealTimers();
  });
  
  it('should return a cleanup function', () => {
    const cleanup = pingMe({ url: 'http://example.com', log: () => {} });
    expect(typeof cleanup).toBe('function');
  });
  
  it('should make a fetch request immediately', () => {
    pingMe({ url: 'http://example.com', log: () => {} });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('http://example.com', expect.any(Object));
  });
  
  it('should use HEAD method by default', () => {
    pingMe({ url: 'http://example.com', log: () => {} });
    expect(fetch).toHaveBeenCalledWith('http://example.com', expect.objectContaining({
      method: 'HEAD'
    }));
  });
  
  it('should respect custom method', () => {
    pingMe({ url: 'http://example.com', method: 'GET', log: () => {} });
    expect(fetch).toHaveBeenCalledWith('http://example.com', expect.objectContaining({
      method: 'GET'
    }));
  });
  
  it('should make periodic requests based on interval', async () => {
    pingMe({ url: 'http://example.com', interval: 1000, log: () => {} });
    
    expect(fetch).toHaveBeenCalledTimes(1);
    
    // Advance time and check that more requests were made
    vi.advanceTimersByTime(1000);
    expect(fetch).toHaveBeenCalledTimes(2);
    
    vi.advanceTimersByTime(1000);
    expect(fetch).toHaveBeenCalledTimes(3);
  });
  
  it('should retry failed requests', async () => {
    // First call fails, second succeeds
    (global.fetch as any)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ status: 200, text: () => Promise.resolve('OK') });
    
    pingMe({ 
      url: 'http://example.com', 
      retryCount: 1, 
      retryDelay: 100, 
      log: () => {} 
    });
    
    expect(fetch).toHaveBeenCalledTimes(1);
    
    // Advance time for retry
    vi.advanceTimersByTime(100);
    expect(fetch).toHaveBeenCalledTimes(2);
  });
  
  it('should stop pinging when cleanup function is called', () => {
    const cleanup = pingMe({ url: 'http://example.com', interval: 1000, log: () => {} });
    
    expect(fetch).toHaveBeenCalledTimes(1);
    
    cleanup();
    vi.advanceTimersByTime(1000);
    
    // No additional calls should be made
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

describe('createPingEndpoint', () => {
  it('should return an object with handler function', () => {
    const endpoint = createPingEndpoint();
    expect(typeof endpoint.handler).toBe('function');
  });
  
  it('should include status and message in response', () => {
    const endpoint = createPingEndpoint({ message: 'Test Message' });
    const response = endpoint.handler();
    
    expect(response).toEqual(expect.objectContaining({
      status: 'ok',
      message: 'Test Message'
    }));
  });
  
  it('should include timestamp by default', () => {
    const endpoint = createPingEndpoint();
    const response = endpoint.handler();
    
    expect(response).toHaveProperty('timestamp');
  });
  
  it('should not include timestamp when disabled', () => {
    const endpoint = createPingEndpoint({ includeTimestamp: false });
    const response = endpoint.handler();
    
    expect(response).not.toHaveProperty('timestamp');
  });
});