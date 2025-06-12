#!/usr/bin/env node

import { initialize } from './index';

// Parse command line arguments
const args = process.argv.slice(2);
const options: Record<string, any> = {};

// Simple argument parsing
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg.startsWith('--')) {
    const key = arg.slice(2);
    const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
    options[key] = value;
    if (value !== true) {
      i++; // Skip the next argument as it's a value
    }
  }
}

// Show help if requested
if (options.help || options.h) {
  console.log(`
  Usage: ping-me [options]
  
  Options:
    --apiKey, -k       Your Ping-Me API key
    --interval, -i     Ping interval in milliseconds (default: 300000)
    --url, -u          URL to ping (can be used multiple times)
    --env, -e          Load endpoints from environment variables with this prefix (default: PING_ME_ENDPOINT_)
    --help, -h         Show this help message
  
  Examples:
    ping-me --apiKey abc123 --url https://myapp.com/api
    ping-me --interval 60000 --env MY_APP_
  `);
  process.exit(0);
}

// Allow for short option names
if (options.k && !options.apiKey) options.apiKey = options.k;
if (options.i && !options.interval) options.interval = options.i;
if (options.u && !options.url) options.url = options.u;
if (options.e && !options.env) options.env = options.e;

// Convert interval to number if provided
if (options.interval && typeof options.interval === 'string') {
  options.interval = parseInt(options.interval, 10);
}

// Initialize the service
const service = initialize({
  ...options,
  autoStart: true
});

console.log(`
🚀 Ping-Me service started
${options.url ? `🔗 Endpoints: ${options.url}` : ''}
⏱️  Interval: ${options.interval || 300000}ms
`);

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping Ping-Me service...');
  service.stop();
  process.exit(0);
});

// Keep the process running
process.stdin.resume(); 