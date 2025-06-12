<!-- ![npm version](https://img.shields.io/npm/v/@ping-me/core)
![build](https://github.com/mreshank/ping-me/actions/workflows/ci.yml/badge.svg)
![license](https://img.shields.io/github/license/mreshank/ping-me)
![stars](https://img.shields.io/github/stars/mreshank/ping-me?style=social)
![contributors](https://img.shields.io/github/contributors/mreshank/ping-me)
![issues](https://img.shields.io/github/issues/mreshank/ping-me)
![PRs](https://img.shields.io/github/issues-pr/mreshank/ping-me) -->

# 🚀 Ping-Me

<div align="center">
  <h3>Keep Your Services Alive and Responsive</h3>
  <p>A lightweight service to prevent your web applications from going to sleep due to inactivity.</p>
</div>

<p align="center">
  <a href="https://github.com/mreshank/ping-me">
    <img alt="GitHub stars" src="https://img.shields.io/github/stars/mreshank/ping-me?style=social">
  </a>
  <a href="https://github.com/mreshank/ping-me/actions">
    <img alt="Build Status" src="https://github.com/mreshank/ping-me/actions/workflows/ci.yml/badge.svg">
  </a>
  <a href="https://www.npmjs.com/package/@ping-me/core">
    <img alt="NPM Version" src="https://img.shields.io/npm/v/@ping-me/core">
  </a>
  <a href="https://github.com/mreshank/ping-me/blob/main/LICENSE">
    <img alt="License" src="https://img.shields.io/github/license/mreshank/ping-me">
  </a>
  <a href="https://github.com/mreshank/ping-me/issues">
    <img alt="Issues" src="https://img.shields.io/github/issues/mreshank/ping-me">
  </a>
  <a href="https://github.com/mreshank/ping-me/discussions">
    <img alt="Discussions" src="https://img.shields.io/github/discussions/mreshank/ping-me?color=purple">
  </a>
</p>

**Keep your free tier backends alive, responsive, and observable!**

Ping-Me is a full-stack open-source infrastructure utility that prevents automatic sleep cycles on free hosting platforms like Render, Railway, Cyclic, Glitch, and Vercel Functions.

## 🔥 The Problem

Free-tier backend hosts are amazing — until they're not:

- 🔌 Your server goes to sleep after minutes of inactivity
- 🐢 First requests are cold, taking seconds to start
- 😬 It times out if you don't keep it warm
- 🧪 When demoing or testing, your APIs break unpredictably

## ✅ The Solution

Ping-Me makes sure your backend never sleeps, and if it tries, you know about it:

- 🔁 **Keep-alive Pinging**: Automatically pings your endpoint on intervals
- ⚙️ **Framework Adapters**: Plug into Express, Fastify, Koa, Next.js, Hono
- 🧪 **Dashboard UI**: View uptime %, ping latency, error codes, logs
- 🔑 **API Key Access**: Each user gets a unique key to isolate metrics
- 🛡️ **Abuse Protection**: Rate limiting, IP filtering, data-size capping
- 🧩 **CLI Tool**: Bootstrap your server with pings instantly

## 🌟 Features

- **Prevent Cold Starts**: Keep your services warm and responsive by preventing them from going to sleep
- **Customizable Intervals**: Set ping intervals from 1 minute to 1 hour
- **Downtime Alerts**: Get notified when your services go down via email, Slack, or webhooks
- **Performance Metrics**: Track response times and uptime metrics
- **Simple Integration**: Easy integration with Node.js, Express, Next.js, and more
- **Multi-Project Support**: Monitor multiple applications from one account

## 📦 Installation

### NPM

```bash
# Install using main package name
npm install ping-me

# Or use one of our alternative package names
npm install keep-server-alive
npm install keepwake
npm install keepawake
```

### Yarn

```bash
yarn add ping-me
# or
yarn add keep-server-alive
# or
yarn add keepwake
# or
yarn add keepawake
```

### pnpm

```bash
pnpm add ping-me
# or
pnpm add keep-server-alive
# or
pnpm add keepwake
# or
pnpm add keepawake
```

> **Note**: `ping-me`, `keep-server-alive`, `keepwake`, and `keepawake` are identical packages. Feel free to use whichever name you prefer!

### Framework-specific packages

```bash
# If you need specific framework adapters
npm install @ping-me/core
npm install @ping-me/express
npm install @ping-me/next
# etc.
```

## 🚀 Quick Start

```javascript
import { PingMe } from 'ping-me';
// OR
import { PingMe } from 'keep-server-alive';
// OR
import { PingMe } from 'keepwake';
// OR
import { PingMe } from 'keepawake';

// Initialize with your API key
const pingMe = new PingMe({
  apiKey: 'your-api-key-here',
});

// Register endpoints to keep alive
pingMe.register([
  'https://your-api.example.com',
  'https://your-app.example.com',
]);

// Start the ping service
pingMe.start();
```

## 🧩 Framework Integrations

### Express.js

```javascript
const express = require('express');
const { PingMe } = require('ping-me'); // or 'keep-server-alive' or 'keepwake' or 'keepawake'

const app = express();
const pingMe = new PingMe({
  apiKey: 'your-api-key-here',
});

// Register the current service
pingMe.registerSelf();

// Create a ping endpoint
app.get('/ping', pingMe.createPingHandler());

// Start pinging
pingMe.start();

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### Next.js

```javascript
// pages/api/ping.js
import { getInstance } from 'ping-me'; // or 'keep-server-alive' or 'keepwake' or 'keepawake'

export default function handler(req, res) {
  const pingMe = getInstance();
  return pingMe.createPingHandler()(req, res);
}

// pages/_app.js
import { init } from 'ping-me'; // or 'keep-server-alive' or 'keepwake' or 'keepawake'
import { useEffect } from 'react';

export default function MyApp({ Component, pageProps }) {
  useEffect(() => {
    const pingMe = init({
      apiKey: process.env.PING_ME_API_KEY,
    });

    pingMe.registerSelf();
    pingMe.start();

    return () => pingMe.stop();
  }, []);

  return <Component {...pageProps} />;
}
```

## ⚙️ Configuration Options

```javascript
const pingMe = new PingMe({
  // Your API key (required)
  apiKey: 'your-api-key-here',
  
  // Ping interval in milliseconds (default: 5 minutes)
  pingInterval: 300000,
  
  // Callback when a ping succeeds
  onSuccess: (endpoint, responseTime) => {
    console.log(`Successfully pinged ${endpoint} in ${responseTime}ms`);
  },
  
  // Callback when a ping fails
  onError: (error, endpoint) => {
    console.error(`Error pinging ${endpoint}: ${error.message}`);
  },
  
  // Whether to automatically start pinging (default: false)
  autoStart: false
});
```

## 🏗️ Project Structure

```
ping-me/
├── apps/
│   └── dashboard/        # Web dashboard (Next.js)
├── packages/
│   ├── core/             # Core ping functionality
│   ├── client/           # Client library with simplified API
│   ├── express/          # Express.js integration
│   └── nextjs/           # Next.js integration
│   ├── ping-me/          # Main package (auto-detects framework)
│   ├── keep-server-alive/ # Alias package for ping-me
│   └── keepwake/         # Alias package for ping-me
└── README.md
```

## 💻 Development

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/mreshank/ping-me.git
   cd ping-me
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Build all packages:
   ```bash
   pnpm run build
   ```

4. Start the development server:
   ```bash
   pnpm run dev
   ```

### Running Tests

```bash
pnpm run test
```

## 🚢 Deployment

### NPM Packages

The packages are deployed to NPM using GitHub Actions CI/CD pipeline.

### Dashboard

The dashboard is deployed to Vercel using GitHub Actions:

1. Set up required secrets in your GitHub repository:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`

2. Push to the main branch to trigger deployment.

### Backend API

The backend API can be deployed to any platform of your choice. We recommend:

- [Render](https://render.com/)
- [Railway](https://railway.app/)
- [Vercel](https://vercel.com/)

## 🤝 Contributing

Contributions are welcome! Please check out our [Contributing Guide](CONTRIBUTING.md) for details.

## 💖 Support

If you find this project useful, please consider supporting it:

- [GitHub Sponsors](https://github.com/sponsors/mreshank)
- [Buy Me a Coffee](https://www.buymeacoffee.com/mreshank)
- Star the repository ⭐

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💖 Sponsorship

If you find Ping-Me useful, please consider sponsoring the project:

[![GitHub Sponsors](https://img.shields.io/badge/Sponsor-GitHub-ea4aaa.svg?style=for-the-badge&logo=github)](https://github.com/sponsors/mreshank)
[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-Support-yellow.svg?style=for-the-badge&logo=buy-me-a-coffee)](https://www.buymeacoffee.com/mreshank)

---

Made with ❤️ by [@mreshank](https://github.com/mreshank)

## ❓ FAQ

### Can we install and use this from npm?

Yes! All packages are designed to be published to npm. You can install them using npm, yarn, or pnpm:

```bash
# Install the main package (auto-detects your framework)
npm install ping-me
# OR one of our alternative package names
npm install keep-server-alive
npm install keepwake
npm install keepawake

# Or install specific framework adapters
npm install @ping-me/core
npm install @ping-me/express
```

### Which package name should I use?

We provide four identical packages with different names:
- `ping-me`: Our primary package name
- `keep-server-alive`: A more descriptive alternative
- `keepwake`: A short and sweet alternative
- `keepawake`: Another concise alternative

All four packages provide the exact same functionality, so you can choose whichever name best fits your project or personal preference!

### Which frameworks are supported?

Currently, we support:
- Express
- Next.js
- Fastify
- Koa (coming soon)
- Hono (coming soon)
- Metrics Server (coming soon)

But the core package works with any HTTP server!