#!/usr/bin/env node

// Don't show the message in CI environments or when installed as a dependency
if (process.env.CI || process.env.NODE_ENV === 'production') {
  process.exit(0);
}

// Detect which package name was used for installation
const packageName = process.env.npm_package_name;

console.log(`
🚀 Thanks for installing ${packageName || 'our package'}!

💡 Did you know? This package is available under multiple names:
   - ping-me (main package)
   - keep-server-alive
   - keepwake
   - keepawake

   They all provide the same functionality, so you can use whichever name you prefer.

📚 Documentation: https://ping-me.eshank.tech/docs
🐛 Issues: https://github.com/mreshank/ping-me/issues
💬 Support: https://github.com/mreshank/ping-me/discussions

To get started, import the package in your code:

const pingMe = require('${packageName || 'ping-me'}');
// or 
import pingMe from '${packageName || 'ping-me'}';

pingMe.initialize({
  apiKey: 'your-api-key',
  endpoints: ['https://your-app.com/api']
});

Happy pinging! 🎉
`); 