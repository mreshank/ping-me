'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { ThemeToggle } from '../components/theme-toggle';
import Footer from '../components/Footer';

// Define sidebar categories and items
const sidebarItems = [
  {
    category: 'Getting Started',
    items: [
      { title: 'Introduction', id: 'introduction' },
      { title: 'Installation', id: 'installation' },
      { title: 'Quick Start', id: 'quick-start' }
    ]
  },
  {
    category: 'Core Concepts',
    items: [
      { title: 'How Ping-Me Works', id: 'how-it-works' },
      { title: 'Ping Intervals', id: 'ping-intervals' },
      { title: 'Monitoring', id: 'monitoring' }
    ]
  },
  {
    category: 'API Reference',
    items: [
      { title: 'Authentication', id: 'authentication' },
      { title: 'Endpoints', id: 'endpoints' },
      { title: 'Rate Limits', id: 'rate-limits' }
    ]
  },
  {
    category: 'Integrations',
    items: [
      { title: 'Node.js', id: 'nodejs' },
      { title: 'React', id: 'react' },
      { title: 'Express', id: 'express' },
      { title: 'Next.js', id: 'nextjs' },
      { title: 'Fastify', id: 'fastify' },
      { title: 'Hono', id: 'hono' },
      { title: 'Koa', id: 'koa' }
    ]
  },
  {
    category: 'Advanced',
    items: [
      { title: 'Custom Configurations', id: 'custom-configurations' },
      { title: 'Webhooks', id: 'webhooks' },
      { title: 'Troubleshooting', id: 'troubleshooting' },
      { title: 'Keep Server Alive', id: 'keep-server-alive' },
      { title: 'Metrics Server', id: 'metrics-server' }
    ]
  }
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('introduction');
  const { theme } = useTheme();
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <span className="font-bold text-xl">Ping-Me</span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="/features" className="transition-colors hover:text-foreground/80 text-foreground/60">
                Features
              </Link>
              <Link href="/pricing" className="transition-colors hover:text-foreground/80 text-foreground/60">
                Pricing
              </Link>
              <Link href="/docs" className="text-foreground">
                Documentation
              </Link>
              <Link href="/dashboard" className="transition-colors hover:text-foreground/80 text-foreground/60">
                Dashboard
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <button className="inline-flex items-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground px-4 py-2 relative h-9 w-full justify-between text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64">
                <span className="hidden lg:inline-flex">Search documentation...</span>
                <span className="inline-flex lg:hidden">Search...</span>
                <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </button>
            </div>
            <nav className="flex items-center">
              <ThemeToggle />
              <div className="flex items-center gap-2 ml-4">
                <Link href="/login" className="text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60">
                  Log in
                </Link>
                <Link href="/signup" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
                  Sign up
                </Link>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="container py-8 flex flex-col lg:flex-row">
        {/* Sidebar */}
        <div className="w-full lg:w-64 flex-none lg:mr-8 mb-8 lg:mb-0">
          <div className="sticky top-20 bg-card rounded-lg shadow overflow-hidden">
            <nav className="p-4 space-y-8">
              {sidebarItems.map((category) => (
                <div key={category.category} className="space-y-2">
                  <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider">
                    {category.category}
                  </h3>
                  <ul className="space-y-1">
                    {category.items.map((item) => (
                      <li key={item.id}>
                        <button
                          onClick={() => setActiveSection(item.id)}
                          className={`w-full text-left px-2 py-1.5 text-sm rounded-md transition-colors ${
                            activeSection === item.id
                              ? 'bg-primary/10 text-primary font-medium'
                              : 'text-foreground/70 hover:text-foreground hover:bg-secondary/50'
                          }`}
                        >
                          {item.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 bg-card rounded-lg shadow p-6 docs-content">
          {activeSection === 'introduction' && (
            <div>
              <h1 className="text-3xl font-bold mb-6">Introduction to Ping-Me</h1>
              <p className="mb-4">
                Ping-Me is a lightweight service that helps keep your web applications and APIs running smoothly by preventing them from going to sleep due to inactivity.
              </p>
              <p className="mb-4">
                Many hosting providers, especially those offering free tiers, will put your application to sleep after a period of inactivity to save resources. This can lead to slow startup times when a user visits your site after it has been inactive.
              </p>
              <p className="mb-4">
                Ping-Me solves this problem by periodically sending HTTP requests to your endpoints, keeping them awake and responsive at all times.
              </p>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">Key Features</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Customizable ping intervals (from every 1 minute to every hour)</li>
                <li>Monitor multiple endpoints across different projects</li>
                <li>Email notifications when endpoints go down</li>
                <li>Webhook and Slack integrations for alerts</li>
                <li>Simple API for easy integration with any application</li>
                <li>Dashboard for monitoring endpoint status and uptime</li>
                <li>Detailed logs and analytics</li>
              </ul>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">Who Should Use Ping-Me?</h2>
              <p className="mb-4">
                Ping-Me is ideal for:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Developers with applications on free hosting tiers (Render, Heroku, etc.)</li>
                <li>Side projects that don't receive constant traffic</li>
                <li>API endpoints that need to remain responsive</li>
                <li>Anyone who wants to avoid the "cold start" problem in serverless applications</li>
              </ul>
              
              <div className="mt-8 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <h3 className="text-lg font-medium text-primary mb-2">Ready to get started?</h3>
                <p className="mb-3">
                  Check out the installation guide to set up Ping-Me for your project in just a few minutes.
                </p>
                <button 
                  onClick={() => setActiveSection('installation')}
                  className="inline-flex items-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
                >
                  Go to Installation Guide
                </button>
              </div>
            </div>
          )}
          
          {activeSection === 'installation' && (
            <div>
              <h1 className="text-3xl font-bold mb-6">Installation</h1>
              <p className="mb-6">
                Getting started with Ping-Me is simple. Choose your preferred installation method below.
              </p>
              
              <h2 className="text-2xl font-semibold mb-4">Option 1: NPM Package</h2>
              <p className="mb-4">
                Install the Ping-Me client package in your Node.js project:
              </p>
              <pre className="bg-muted p-4 rounded-md mb-6">
                <code>npm install @ping-me/client</code>
              </pre>
              
              <h2 className="text-2xl font-semibold mb-4">Option 2: Yarn</h2>
              <pre className="bg-muted p-4 rounded-md mb-6">
                <code>yarn add @ping-me/client</code>
              </pre>
              
              <h2 className="text-2xl font-semibold mb-4">Option 3: Direct API Integration</h2>
              <p className="mb-4">
                If you prefer not to add a dependency to your project, you can register your endpoints directly through our dashboard or API.
              </p>
              <ol className="list-decimal pl-6 space-y-2 mb-6">
                <li>Sign up for an account at ping-me.eshank.tech</li>
                <li>Navigate to the dashboard and add your endpoints</li>
                <li>Configure your ping intervals and notification preferences</li>
              </ol>
              
              <h2 className="text-2xl font-semibold mb-4">Next Steps</h2>
              <p className="mb-4">
                After installation, you'll need to configure Ping-Me with your API key and endpoints. See the Quick Start guide for details.
              </p>
              <button 
                onClick={() => setActiveSection('quick-start')}
                className="inline-flex items-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
              >
                Continue to Quick Start
              </button>
            </div>
          )}

          {activeSection === 'express' && (
            <div>
              <h1 className="text-3xl font-bold mb-6">Express Integration</h1>
              <p className="mb-4">
                The Ping-Me Express integration provides a simple middleware that you can add to your Express applications to keep them awake.
              </p>
              
              <h2 className="text-2xl font-semibold mb-4">Installation</h2>
              <pre className="bg-muted p-4 rounded-md mb-6">
                <code>npm install @ping-me/express</code>
              </pre>
              
              <h2 className="text-2xl font-semibold mb-4">Basic Usage</h2>
              <p className="mb-4">
                Add the Ping-Me middleware to your Express application:
              </p>
              <pre className="bg-muted p-4 rounded-md mb-6">
                <code>{`const express = require('express');
const { pingMeMiddleware } = require('@ping-me/express');

const app = express();

// Add the Ping-Me middleware
app.use(pingMeMiddleware({
  apiKey: 'your-api-key',
  projectId: 'your-project-id'
}));

// Your routes
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});`}</code>
              </pre>
              
              <h2 className="text-2xl font-semibold mb-4">Configuration Options</h2>
              <p className="mb-4">
                The Ping-Me Express middleware accepts the following configuration options:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li><strong>apiKey</strong>: Your Ping-Me API key</li>
                <li><strong>projectId</strong>: Your Ping-Me project ID</li>
                <li><strong>interval</strong>: Ping interval in minutes (default: 5)</li>
                <li><strong>endpoint</strong>: The endpoint to ping (default: '/')</li>
                <li><strong>onError</strong>: Callback function to handle ping errors</li>
              </ul>
              
              <h2 className="text-2xl font-semibold mb-4">Advanced Usage</h2>
              <p className="mb-4">
                You can customize the Ping-Me middleware to fit your specific needs:
              </p>
              <pre className="bg-muted p-4 rounded-md mb-6">
                <code>{`app.use(pingMeMiddleware({
  apiKey: 'your-api-key',
  projectId: 'your-project-id',
  interval: 10, // Ping every 10 minutes
  endpoint: '/health', // Ping the /health endpoint
  onError: (err) => {
    console.error('Ping-Me error:', err);
    // Send notification, log to monitoring service, etc.
  }
}));`}</code>
              </pre>
              
              <h2 className="text-2xl font-semibold mb-4">Health Check Endpoint</h2>
              <p className="mb-4">
                It's recommended to create a dedicated health check endpoint for Ping-Me to ping:
              </p>
              <pre className="bg-muted p-4 rounded-md mb-6">
                <code>{`app.get('/health', (req, res) => {
  // Perform health checks
  const isHealthy = checkDatabaseConnection() && checkRedisConnection();
  
  if (isHealthy) {
    res.status(200).json({ status: 'ok' });
  } else {
    res.status(500).json({ status: 'error' });
  }
});`}</code>
              </pre>
              
              <div className="mt-8 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <h3 className="text-lg font-medium text-primary mb-2">Need help?</h3>
                <p className="mb-3">
                  If you're having trouble with the Express integration, check out our troubleshooting guide or contact support.
                </p>
                <button 
                  onClick={() => setActiveSection('troubleshooting')}
                  className="inline-flex items-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
                >
                  Go to Troubleshooting
                </button>
              </div>
            </div>
          )}
          
          {activeSection === 'fastify' && (
            <div>
              <h1 className="text-3xl font-bold mb-6">Fastify Integration</h1>
              <p className="mb-4">
                The Ping-Me Fastify plugin provides a simple way to keep your Fastify applications awake.
              </p>
              
              <h2 className="text-2xl font-semibold mb-4">Installation</h2>
              <pre className="bg-muted p-4 rounded-md mb-6">
                <code>npm install @ping-me/fastify</code>
              </pre>
              
              <h2 className="text-2xl font-semibold mb-4">Basic Usage</h2>
              <p className="mb-4">
                Register the Ping-Me plugin with your Fastify application:
              </p>
              <pre className="bg-muted p-4 rounded-md mb-6">
                <code>{`const fastify = require('fastify')();
const pingMeFastify = require('@ping-me/fastify');

// Register the Ping-Me plugin
fastify.register(pingMeFastify, {
  apiKey: 'your-api-key',
  projectId: 'your-project-id'
});

// Your routes
fastify.get('/', async (request, reply) => {
  return { hello: 'world' };
});

fastify.listen({ port: 3000 }, (err) => {
  if (err) throw err;
  console.log('Server is running on port 3000');
});`}</code>
              </pre>
              
              <h2 className="text-2xl font-semibold mb-4">Configuration Options</h2>
              <p className="mb-4">
                The Ping-Me Fastify plugin accepts the following configuration options:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li><strong>apiKey</strong>: Your Ping-Me API key</li>
                <li><strong>projectId</strong>: Your Ping-Me project ID</li>
                <li><strong>interval</strong>: Ping interval in minutes (default: 5)</li>
                <li><strong>endpoint</strong>: The endpoint to ping (default: '/')</li>
                <li><strong>onError</strong>: Callback function to handle ping errors</li>
              </ul>
              
              <h2 className="text-2xl font-semibold mb-4">Health Check Route</h2>
              <p className="mb-4">
                It's a good practice to create a dedicated health check endpoint:
              </p>
              <pre className="bg-muted p-4 rounded-md mb-6">
                <code>{`fastify.get('/health', async (request, reply) => {
  // Perform health checks
  const isHealthy = await checkDatabaseConnection() && await checkCacheService();
  
  if (isHealthy) {
    return { status: 'ok' };
  } else {
    reply.code(500);
    return { status: 'error' };
  }
});`}</code>
              </pre>
              
              <div className="mt-8 p-4 bg-primary/10 rounded-lg border border-primary/20 glass">
                <h3 className="text-lg font-medium text-primary mb-2">Advanced Configuration</h3>
                <p className="mb-3">
                  For more advanced configuration options and examples, check out the complete Fastify integration documentation.
                </p>
                <button 
                  onClick={() => setActiveSection('custom-configurations')}
                  className="inline-flex items-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
                >
                  View Advanced Configuration
                </button>
              </div>
            </div>
          )}
          
          {/* Add more sections for other documentation pages */}
        </div>
      </div>

      <Footer />
    </div>
  );
} 