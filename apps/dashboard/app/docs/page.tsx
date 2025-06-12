'use client';

import { useState } from 'react';
import Link from 'next/link';
import Footer from '../components/Footer';
import SponsorBanner from '../components/SponsorBanner';

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
      { title: 'Next.js', id: 'nextjs' }
    ]
  },
  {
    category: 'Advanced',
    items: [
      { title: 'Custom Configurations', id: 'custom-configurations' },
      { title: 'Webhooks', id: 'webhooks' },
      { title: 'Troubleshooting', id: 'troubleshooting' }
    ]
  }
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('introduction');
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Documentation</h1>
          <nav className="flex space-x-4">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              Home
            </Link>
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
              Dashboard
            </Link>
            <Link href="/pricing" className="text-gray-500 hover:text-gray-700">
              Pricing
            </Link>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row">
          {/* Sidebar */}
          <div className="w-full lg:w-64 flex-none lg:mr-8 mb-8 lg:mb-0">
            <div className="bg-white rounded-lg shadow overflow-hidden sticky top-6">
              <nav className="p-4 space-y-8">
                {sidebarItems.map((category) => (
                  <div key={category.category} className="space-y-2">
                    <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wider">
                      {category.category}
                    </h3>
                    <ul className="space-y-1">
                      {category.items.map((item) => (
                        <li key={item.id}>
                          <button
                            onClick={() => setActiveSection(item.id)}
                            className={`w-full text-left px-2 py-1 text-sm rounded-md ${
                              activeSection === item.id
                                ? 'bg-blue-100 text-blue-700 font-medium'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
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
              
              {/* Sponsor banner in sidebar */}
              <div className="px-4 pb-4">
                <SponsorBanner />
              </div>
            </div>
          </div>

          {/* Main content area */}
          <div className="flex-1 bg-white rounded-lg shadow p-6">
            {activeSection === 'introduction' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction to Ping-Me</h2>
                <p className="text-gray-600 mb-4">
                  Ping-Me is a lightweight service that helps keep your web applications and APIs running smoothly by preventing them from going to sleep due to inactivity.
                </p>
                <p className="text-gray-600 mb-4">
                  Many hosting providers, especially those offering free tiers, will put your application to sleep after a period of inactivity to save resources. This can lead to slow startup times when a user visits your site after it has been inactive.
                </p>
                <p className="text-gray-600 mb-4">
                  Ping-Me solves this problem by periodically sending HTTP requests to your endpoints, keeping them awake and responsive at all times.
                </p>
                
                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Key Features</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Customizable ping intervals (from every 1 minute to every hour)</li>
                  <li>Monitor multiple endpoints across different projects</li>
                  <li>Email notifications when endpoints go down</li>
                  <li>Webhook and Slack integrations for alerts</li>
                  <li>Simple API for easy integration with any application</li>
                  <li>Dashboard for monitoring endpoint status and uptime</li>
                  <li>Detailed logs and analytics</li>
                </ul>
                
                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Who Should Use Ping-Me?</h3>
                <p className="text-gray-600 mb-4">
                  Ping-Me is ideal for:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Developers with applications on free hosting tiers (Render, Heroku, etc.)</li>
                  <li>Side projects that don't receive constant traffic</li>
                  <li>API endpoints that need to remain responsive</li>
                  <li>Anyone who wants to avoid the "cold start" problem in serverless applications</li>
                </ul>
                
                <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <h4 className="text-lg font-medium text-blue-800 mb-2">Ready to get started?</h4>
                  <p className="text-blue-700 mb-3">
                    Check out the installation guide to set up Ping-Me for your project in just a few minutes.
                  </p>
                  <button 
                    onClick={() => setActiveSection('installation')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Go to Installation Guide
                  </button>
                </div>
              </div>
            )}
            
            {activeSection === 'installation' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Installation</h2>
                <p className="text-gray-600 mb-6">
                  Getting started with Ping-Me is simple. Choose your preferred installation method below.
                </p>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Option 1: NPM Package</h3>
                <p className="text-gray-600 mb-4">
                  Install the Ping-Me client package in your Node.js project:
                </p>
                <div className="bg-gray-800 rounded-md p-4 mb-6">
                  <code className="text-sm text-gray-200 font-mono">npm install @ping-me/client</code>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Option 2: Yarn</h3>
                <div className="bg-gray-800 rounded-md p-4 mb-6">
                  <code className="text-sm text-gray-200 font-mono">yarn add @ping-me/client</code>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Option 3: Direct API Integration</h3>
                <p className="text-gray-600 mb-4">
                  If you prefer not to add a dependency to your project, you can register your endpoints directly through our dashboard or API.
                </p>
                <ol className="list-decimal pl-6 space-y-2 text-gray-600 mb-6">
                  <li>Sign up for an account at ping-me.app</li>
                  <li>Navigate to the dashboard and add your endpoints</li>
                  <li>Configure your ping intervals and notification preferences</li>
                </ol>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Next Steps</h3>
                <p className="text-gray-600 mb-4">
                  After installation, you'll need to configure Ping-Me with your API key and endpoints. See the Quick Start guide for details.
                </p>
                <button 
                  onClick={() => setActiveSection('quick-start')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  Continue to Quick Start
                </button>
              </div>
            )}
            
            {activeSection === 'quick-start' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Start</h2>
                <p className="text-gray-600 mb-6">
                  Get Ping-Me up and running in your application in just a few steps.
                </p>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Step 1: Get Your API Key</h3>
                <p className="text-gray-600 mb-4">
                  Sign up or log in to your Ping-Me account and copy your API key from the dashboard.
                </p>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Step 2: Basic Usage</h3>
                <p className="text-gray-600 mb-4">
                  Import and initialize the Ping-Me client in your application:
                </p>
                <div className="bg-gray-800 rounded-md p-4 mb-6">
                  <code className="text-sm text-gray-200 font-mono whitespace-pre">
{`// ES Module syntax
import { PingMe } from '@ping-me/client';

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
pingMe.start();`}
                  </code>
                </div>
                
                <p className="text-gray-600 mb-4">
                  For CommonJS environments:
                </p>
                <div className="bg-gray-800 rounded-md p-4 mb-6">
                  <code className="text-sm text-gray-200 font-mono whitespace-pre">
{`// CommonJS syntax
const { PingMe } = require('@ping-me/client');

// Same initialization as above
const pingMe = new PingMe({
  apiKey: 'your-api-key-here',
});

pingMe.register([
  'https://your-api.example.com',
]);

pingMe.start();`}
                  </code>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Step 3: Configuration Options</h3>
                <p className="text-gray-600 mb-4">
                  Customize your Ping-Me instance with these options:
                </p>
                <div className="bg-gray-800 rounded-md p-4 mb-6">
                  <code className="text-sm text-gray-200 font-mono whitespace-pre">
{`const pingMe = new PingMe({
  apiKey: 'your-api-key-here',
  pingInterval: 300000, // 5 minutes in milliseconds (default)
  onError: (error, endpoint) => {
    console.error(\`Error pinging \${endpoint}: \${error.message}\`);
  },
  onSuccess: (endpoint, responseTime) => {
    console.log(\`Successfully pinged \${endpoint} in \${responseTime}ms\`);
  }
});`}
                  </code>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Step 4: Verify Setup</h3>
                <p className="text-gray-600 mb-4">
                  Once configured, you can verify that Ping-Me is working by checking:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600 mb-6">
                  <li>Your application logs for successful ping messages</li>
                  <li>The Ping-Me dashboard for endpoint status</li>
                  <li>Your application's hosting provider to confirm it stays active</li>
                </ul>
                
                <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-100">
                  <h4 className="text-lg font-medium text-green-800 mb-2">🎉 You're all set!</h4>
                  <p className="text-green-700 mb-3">
                    Your endpoints are now being monitored by Ping-Me and will stay awake. For more advanced usage, check out the other documentation sections.
                  </p>
                  <button 
                    onClick={() => setActiveSection('how-it-works')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                  >
                    Learn How Ping-Me Works
                  </button>
                </div>
              </div>
            )}
            
            {/* Add more content sections for other documentation topics */}
            {activeSection !== 'introduction' && 
             activeSection !== 'installation' && 
             activeSection !== 'quick-start' && (
              <div className="text-center py-16">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  This documentation section is coming soon!
                </h3>
                <p className="text-gray-500 mb-6">
                  We're working on completing our documentation. Check back soon!
                </p>
                <button
                  onClick={() => setActiveSection('introduction')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Return to Introduction
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
} 