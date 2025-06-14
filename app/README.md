# Ping-Me

Keep your web services and APIs awake and responsive with automatic pinging.

## Overview

Ping-Me is a service that helps keep your web applications and APIs awake by sending regular requests to prevent them from going idle. This is particularly useful for applications hosted on free tiers of platforms like Heroku, Render, Railway, or Vercel, which often put services to sleep after periods of inactivity.

## Features

- **Automatic Pinging**: Schedule regular pings to keep your services active
- **Uptime Monitoring**: Track the uptime and performance of your web services
- **Instant Alerts**: Get notified when your services go down
- **Dashboard**: Monitor all your endpoints in one place
- **API**: Integrate with your existing tools and workflows

## Project Structure

```
ping-me/
├── src/
│   ├── app/               # Next.js app directory
│   │   ├── api/           # API routes
│   │   ├── dashboard/     # Dashboard page
│   │   ├── docs/          # Documentation page
│   │   ├── pricing/       # Pricing page
│   │   ├── settings/      # Settings page
│   │   ├── signup/        # Signup page
│   │   ├── layout.tsx     # Root layout
│   │   ├── page.tsx       # Home page
│   │   └── globals.css    # Global styles
│   ├── components/        # Reusable components
│   └── lib/               # Utility functions and shared code
├── public/                # Static assets
├── next.config.js         # Next.js configuration
├── package.json           # Project dependencies
├── postcss.config.mjs     # PostCSS configuration
└── tailwind.config.ts     # Tailwind CSS configuration
```

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or pnpm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ping-me.git
cd ping-me
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Create a `.env.local` file based on the example:
```bash
cp example.env.local .env.local
```

4. Start the development server:
```bash
npm run dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Reference

The API documentation is available at [http://localhost:3000/docs](http://localhost:3000/docs) when running the development server.

## Contributing

Please read [CONTRIBUTING.md](../CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.
