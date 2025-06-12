#!/usr/bin/env node

// Don't show the message in CI environments or when installed as a dependency
if (process.env.CI || process.env.NODE_ENV === 'production') {
  process.exit(0);
}

console.log(`
🚀 Thanks for installing keepwake!

💡 This is an alias package for ping-me. You can also install it directly using:
   npm install ping-me

   Other available aliases:
   - keep-server-alive
   - keepawake

📚 Documentation: https://ping-me.eshank.tech/docs
🐛 Issues: https://github.com/mreshank/ping-me/issues
💬 Support: https://github.com/mreshank/ping-me/discussions

To get started, import the package in your code:

const keepwake = require('keepwake');
// or 
import keepwake from 'keepwake';

keepwake.initialize({
  apiKey: 'your-api-key',
  endpoints: ['https://your-app.com/api']
});

Happy pinging! 🎉
`); 