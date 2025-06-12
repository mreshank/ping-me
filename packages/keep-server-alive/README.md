# keep-server-alive

An alias package for [ping-me](https://www.npmjs.com/package/ping-me) to keep your free tier backends alive with auto-pinging and monitoring.

[![npm version](https://img.shields.io/npm/v/keep-server-alive)](https://www.npmjs.com/package/keep-server-alive)
[![License](https://img.shields.io/github/license/mreshank/ping-me)](https://github.com/mreshank/ping-me/blob/main/LICENSE)

## Overview

`keep-server-alive` is an alias package that redirects to the main `ping-me` package. It provides the same functionality to prevent free-tier backend services from going to sleep by automatically pinging them at regular intervals.

## Installation

```bash
npm install keep-server-alive

# or with yarn
yarn add keep-server-alive

# or with pnpm
pnpm add keep-server-alive
```

## Usage

### In Your Code

```javascript
// Import the package
const keepServerAlive = require('keep-server-alive');

// Use it just like ping-me
const { stopPinging } = keepServerAlive.pingMe({
  url: 'https://your-app.example.com',
  interval: 60000 // 1 minute
});

// Stop pinging when needed
process.on('SIGINT', () => {
  stopPinging();
  process.exit(0);
});
```

### Command Line

The package also provides a CLI tool:

```bash
# Basic usage
npx keep-server-alive --url https://your-app.example.com

# Multiple endpoints
npx keep-server-alive --url https://api1.example.com --url https://api2.example.com

# Custom interval (in milliseconds)
npx keep-server-alive --url https://your-app.example.com --interval 60000
```

## Why This Package?

This package exists for historical reasons and backward compatibility. It's recommended to use the main `ping-me` package directly for new projects.

## Other Aliases

There are other alias packages available:
- `keepwake`
- `keepawake`

## Documentation

For complete documentation, please visit the [ping-me documentation](https://ping-me.eshank.tech/docs).

## License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details. 