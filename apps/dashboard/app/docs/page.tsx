import Link from 'next/link';

export default function Documentation() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Ping-Me Documentation</h1>
          <nav className="flex space-x-4">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              Home
            </Link>
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
              Dashboard
            </Link>
            <Link href="/signup" className="text-gray-500 hover:text-gray-700">
              Sign Up
            </Link>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900">
              Getting Started with Ping-Me
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Learn how to keep your backends alive with automatic pinging.
            </p>
          </div>
          <div className="border-t border-gray-200">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Step 1: Get Your API Key
              </h3>
              <p className="text-gray-500 mb-4">
                First, <Link href="/signup" className="text-blue-600 hover:text-blue-500">sign up</Link> to get your unique API key. This key will be used to authenticate your requests and associate your endpoints with your account.
              </p>
              
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-8 mb-4">
                Step 2: Choose Your Integration Method
              </h3>
              <p className="text-gray-500 mb-4">
                Ping-Me offers multiple ways to integrate with your backend:
              </p>
              
              <div className="mt-6 space-y-8">
                {/* Express.js */}
                <div className="rounded-md bg-gray-50 p-4">
                  <h4 className="text-md font-medium text-gray-900 mb-2">Express.js</h4>
                  <div className="bg-gray-800 rounded-md p-4 overflow-x-auto">
                    <pre className="text-sm text-white">
                      <code>
{`// Install with npm
npm install @ping-me/express

// Add to your Express app
const express = require('express');
const { withPingMe } = require('@ping-me/express');

const app = express();

// Add ping-me to your app
withPingMe(app, {
  apiKey: 'your_api_key',
  route: '/ping-me',       // Custom route (default: /ping-me)
  interval: 300000,        // 5 minutes
});

app.listen(3000);`}
                      </code>
                    </pre>
                  </div>
                </div>
                
                {/* Next.js */}
                <div className="rounded-md bg-gray-50 p-4">
                  <h4 className="text-md font-medium text-gray-900 mb-2">Next.js</h4>
                  <div className="bg-gray-800 rounded-md p-4 overflow-x-auto">
                    <pre className="text-sm text-white">
                      <code>
{`// Install with npm
npm install @ping-me/next

// Create an API route (pages/api/ping-me.js)
import { createPingMeHandler } from '@ping-me/next';

export default createPingMeHandler({
  apiKey: process.env.PING_ME_API_KEY
});

// In your _app.js or a component
import { usePingMe } from '@ping-me/next';

function MyApp({ Component, pageProps }) {
  // This will auto-ping your endpoint
  usePingMe({
    interval: 300000, // 5 minutes
    apiKey: process.env.PING_ME_API_KEY
  });
  
  return <Component {...pageProps} />;
}`}
                      </code>
                    </pre>
                  </div>
                </div>

                {/* Core Usage */}
                <div className="rounded-md bg-gray-50 p-4">
                  <h4 className="text-md font-medium text-gray-900 mb-2">Core (Any Framework)</h4>
                  <div className="bg-gray-800 rounded-md p-4 overflow-x-auto">
                    <pre className="text-sm text-white">
                      <code>
{`// Install with npm
npm install @ping-me/core

// In your application
import { pingMe } from '@ping-me/core';

// Start pinging
const stopPinging = pingMe({
  url: 'https://my-api.com/ping',
  interval: 300000, // 5 minutes
  apiKey: 'your_api_key'
});

// Stop pinging later if needed
stopPinging();`}
                      </code>
                    </pre>
                  </div>
                </div>
              </div>
              
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-8 mb-4">
                Step 3: Access Your Dashboard
              </h3>
              <p className="text-gray-500 mb-4">
                Once your integration is set up, your endpoints will automatically be pinged at the specified intervals. You can view all your metrics and logs on the <Link href="/dashboard" className="text-blue-600 hover:text-blue-500">Dashboard</Link>.
              </p>
              
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-8 mb-4">
                API Reference
              </h3>
              <p className="text-gray-500 mb-2">
                If you prefer to manually log pings or build a custom integration, you can use our REST API:
              </p>
              
              <div className="mt-4 space-y-6">
                {/* Log API */}
                <div className="rounded-md bg-gray-50 p-4">
                  <h4 className="text-md font-medium text-gray-900 mb-2">Log an Endpoint Ping</h4>
                  <div className="bg-gray-800 rounded-md p-4 overflow-x-auto">
                    <pre className="text-sm text-white">
                      <code>
{`POST https://api.ping-me.dev/log

Headers:
Authorization: Bearer YOUR_API_KEY

Body:
{
  "endpoint": "https://my-api.com",
  "status": 200,
  "responseTime": 123,
  "timestamp": "2023-06-01T12:00:00Z",  // Optional
  "error": "Connection timeout"          // Optional
}`}
                      </code>
                    </pre>
                  </div>
                </div>
                
                {/* Get Metrics API */}
                <div className="rounded-md bg-gray-50 p-4">
                  <h4 className="text-md font-medium text-gray-900 mb-2">Get Metrics</h4>
                  <div className="bg-gray-800 rounded-md p-4 overflow-x-auto">
                    <pre className="text-sm text-white">
                      <code>
{`GET https://api.ping-me.dev/metrics?endpoint=https://my-api.com&timeRange=24h

Headers:
Authorization: Bearer YOUR_API_KEY

Query Parameters:
- endpoint: URL of the endpoint (optional, defaults to all endpoints)
- timeRange: 1h, 24h, 7d, or 30d (optional, defaults to 24h)`}
                      </code>
                    </pre>
                  </div>
                </div>
                
                {/* Update Settings API */}
                <div className="rounded-md bg-gray-50 p-4">
                  <h4 className="text-md font-medium text-gray-900 mb-2">Update Settings</h4>
                  <div className="bg-gray-800 rounded-md p-4 overflow-x-auto">
                    <pre className="text-sm text-white">
                      <code>
{`PUT https://api.ping-me.dev/settings

Headers:
Authorization: Bearer YOUR_API_KEY

Body:
{
  "pingInterval": 600000,    // 10 minutes (in milliseconds)
  "alertEnabled": true
}`}
                      </code>
                    </pre>
                  </div>
                </div>
              </div>
              
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-8 mb-4">
                Need Help?
              </h3>
              <p className="text-gray-500">
                If you have any questions or need assistance, check out our <Link href="/faq" className="text-blue-600 hover:text-blue-500">FAQ</Link> or <a href="https://github.com/mreshank/ping-me/issues" className="text-blue-600 hover:text-blue-500">open an issue</a> on our GitHub repository.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 