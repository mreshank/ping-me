<!-- ![npm version](https://img.shields.io/npm/v/@ping-me/core)
![build](https://github.com/mreshank/ping-me/actions/workflows/ci.yml/badge.svg)
![license](https://img.shields.io/github/license/mreshank/ping-me)
![stars](https://img.shields.io/github/stars/mreshank/ping-me?style=social)
![contributors](https://img.shields.io/github/contributors/mreshank/ping-me)
![issues](https://img.shields.io/github/issues/mreshank/ping-me)
![PRs](https://img.shields.io/github/issues-pr/mreshank/ping-me) -->

# 🚀 Ping-Me

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

## 📦 Installation

### Simple Installation (Auto-Detects Your Framework)

```bash
# Install the main package
npm install ping-me
```

That's it! The `ping-me` package automatically detects which framework you're using and provides the appropriate adapters.

### Framework-Specific Installation

If you prefer to explicitly use a specific adapter:

```bash
# Install the core library
npm install @ping-me/core

# Or use the framework-specific adapter
npm install @ping-me/express
# npm install @ping-me/next
# npm install @ping-me/fastify
# npm install @ping-me/koa
# npm install @ping-me/hono
```

### CLI Setup

```bash
npx ping-me init
npx ping-me add express
```

## 🧰 Usage

### Auto-Detected Framework

```javascript
// Simply import ping-me and it auto-detects your framework
const pingMe = require('ping-me');

// For Express apps
const app = require('express')();
pingMe.withPingMe(app);

// Or use the core functionality directly
pingMe.pingMe({
  url: 'https://my-api.com/ping'
});
```

### Express

```javascript
const express = require('express');
const { withPingMe } = require('@ping-me/express');

const app = express();

// Add ping-me to your app
withPingMe(app, {
  route: '/ping-me',          // Custom route (default: /ping-me)
  interval: 300000,           // 5 minutes
  baseUrl: 'https://my-api.com', // Optional: specify exact URL
  apiKey: 'your-api-key'      // Optional: for dashboard metrics
});

app.listen(3000);
```

### Next.js

```javascript
// pages/api/ping-me.js
import { createPingMeHandler } from '@ping-me/next';

export default createPingMeHandler();

// In your _app.js or a component
import { usePingMe } from '@ping-me/next';

function MyApp({ Component, pageProps }) {
  // This will auto-ping your endpoint
  const status = usePingMe({
    interval: 300000, // 5 minutes
    apiKey: process.env.PING_ME_API_KEY // Optional
  });
  
  return <Component {...pageProps} />;
}
```

### Core Usage

```javascript
import { pingMe } from '@ping-me/core';

// Start pinging
const stopPinging = pingMe({
  url: 'https://my-api.com/ping',
  interval: 300000, // 5 minutes
  apiKey: 'your-api-key', // Optional
  log: console.log     // Optional custom logger
});

// Stop pinging later if needed
stopPinging();
```

## 📊 Dashboard

A beautiful Next.js dashboard is available to monitor your backend services:

- 📈 **Uptime Charts**: See your uptime over time
- ⏱️ **Response Times**: Track latency trends
- 💬 **Status Logs**: View ping history and errors
- 🔔 **Alert Settings**: Configure notification preferences

**[Try the Dashboard →](https://ping-me-dashboard.vercel.app)**

## 🧑‍💻 API

Track your metrics with the Ping-Me API:

```bash
# Ping Logging Endpoint
POST https://ping-me-api.vercel.app/api/log
Authorization: Bearer your-api-key
{
  "endpoint": "https://my-api.com",
  "status": 200,
  "responseTime": 123
}

# Get Metrics
GET https://ping-me-api.vercel.app/api/metrics
Authorization: Bearer your-api-key
```

## 🛠️ Project Structure

This is a monorepo built with Turborepo and PNPM:

```
ping-me/
├── apps/
│   ├── dashboard/     ← Next.js 14 + Tailwind CSS dashboard
│   ├── examples/      ← Example usage of ping-me
│   └── api/           ← Serverless API routes
├── packages/
│   ├── ping-me/       ← Main package with auto-detection
│   ├── core/          ← Framework-agnostic ping logic
│   ├── cli/           ← CLI: npx ping-me init
│   ├── express/       ← Express adapter
│   ├── fastify/       ← Fastify adapter
│   ├── next/          ← Next.js adapter
│   ├── koa/           ← Koa adapter
│   ├── hono/          ← Hono adapter
│   └── metrics-server/ ← Metrics Server
```

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Install dependencies: `pnpm install`
4. Make your changes
5. Run tests: `pnpm test`
6. Commit your changes: `git commit -m 'Add some amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 💖 Sponsorship

If you find Ping-Me useful, please consider sponsoring the project:

[![GitHub Sponsors](https://img.shields.io/badge/Sponsor-GitHub-ea4aaa.svg?style=for-the-badge&logo=github)](https://github.com/sponsors/mreshank)
[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-Support-yellow.svg?style=for-the-badge&logo=buy-me-a-coffee)](https://www.buymeacoffee.com/mreshank)

---

Made with ❤️ by [@mreshank](https://github.com/mreshank)

## ❓ FAQ

### Can we install and use this from npm?

Yes! All packages are designed to be published to npm. Once published, you can install them using npm, yarn, or pnpm:

```bash
# Install the main package (auto-detects your framework)
npm install ping-me

# Or install specific packages
npm install @ping-me/core
npm install @ping-me/express
```

### Can we use it simply with npm i ping-me?

Yes! We've created a main `ping-me` package that automatically detects which framework you're using and provides the appropriate adapters. Simply install with:

```bash
npm install ping-me
```

And then import it in your code:

```javascript
// It auto-detects your framework
const pingMe = require('ping-me');

// Use with Express
const app = require('express')();
pingMe.withPingMe(app);

// Or use directly
pingMe.pingMe({ url: 'https://my-api.com' });
```

### Which frameworks are supported?

Currently, we support:
- Express
- Next.js
- Fastify
- Koa (coming soon)
- Hono (coming soon)
- Metrics Server (coming soon)

But the core package works with any HTTP server!