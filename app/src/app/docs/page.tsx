"use client";

import { ThemeToggle } from "@/src/components/theme-toggle";
// import { ThemeToggle } from '@/components/theme-toggle';
import Link from "next/link";
// import { ThemeToggle } from '@/components/theme-toggle';
import { useState } from "react";

type Section =
  | "getting-started"
  | "how-it-works"
  | "authentication"
  | "endpoints"
  | "logs"
  | "metrics"
  | "integration"
  | "notifications";

export default function DocsPage(): React.ReactElement {
  const [activeSection, setActiveSection] =
    useState<Section>("getting-started");

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
              <Link
                href="/features"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                Features
              </Link>
              <Link
                href="/pricing"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                Pricing
              </Link>
              <Link href="/docs" className="text-foreground">
                Documentation
              </Link>
              <Link
                href="/dashboard"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                Dashboard
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="flex items-center">
              <ThemeToggle />
              <Link
                href="/signup"
                className="ml-4 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="container py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-none">
            <div className="sticky top-20 bg-card rounded-lg shadow overflow-hidden">
              <nav className="p-4 space-y-1">
                <div className="sidebar-group">
                  <h3 className="sidebar-group-title">Introduction</h3>
                  <div className="space-y-1">
                    <button
                      onClick={() => setActiveSection("getting-started")}
                      className={`sidebar-link w-full text-left ${activeSection === "getting-started" ? "active" : ""}`}
                    >
                      Getting Started
                    </button>
                    <button
                      onClick={() => setActiveSection("how-it-works")}
                      className={`sidebar-link w-full text-left ${activeSection === "how-it-works" ? "active" : ""}`}
                    >
                      How It Works
                    </button>
                  </div>
                </div>
                <div className="sidebar-group">
                  <h3 className="sidebar-group-title">API Reference</h3>
                  <div className="space-y-1">
                    <button
                      onClick={() => setActiveSection("authentication")}
                      className={`sidebar-link w-full text-left ${activeSection === "authentication" ? "active" : ""}`}
                    >
                      Authentication
                    </button>
                    <button
                      onClick={() => setActiveSection("endpoints")}
                      className={`sidebar-link w-full text-left ${activeSection === "endpoints" ? "active" : ""}`}
                    >
                      Endpoints
                    </button>
                    <button
                      onClick={() => setActiveSection("logs")}
                      className={`sidebar-link w-full text-left ${activeSection === "logs" ? "active" : ""}`}
                    >
                      Logs
                    </button>
                    <button
                      onClick={() => setActiveSection("metrics")}
                      className={`sidebar-link w-full text-left ${activeSection === "metrics" ? "active" : ""}`}
                    >
                      Metrics
                    </button>
                  </div>
                </div>
                <div className="sidebar-group">
                  <h3 className="sidebar-group-title">Guides</h3>
                  <div className="space-y-1">
                    <button
                      onClick={() => setActiveSection("integration")}
                      className={`sidebar-link w-full text-left ${activeSection === "integration" ? "active" : ""}`}
                    >
                      Integration Guide
                    </button>
                    <button
                      onClick={() => setActiveSection("notifications")}
                      className={`sidebar-link w-full text-left ${activeSection === "notifications" ? "active" : ""}`}
                    >
                      Setting Up Notifications
                    </button>
                  </div>
                </div>
              </nav>
            </div>
          </div>

          {/* Main content area */}
          <div className="flex-1">
            <div className="docs-content">
              {activeSection === "getting-started" && (
                <div>
                  <h1>Getting Started with Ping-Me</h1>
                  <p>
                    Welcome to the Ping-Me documentation. This guide will help
                    you get started with keeping your web services and APIs
                    awake and responsive.
                  </p>

                  <h2>Installation</h2>
                  <p>You can install the Ping-Me client library using npm:</p>
                  <pre>
                    <code>npm install ping-me</code>
                  </pre>

                  <h2>Quick Start</h2>
                  <p>Here's a simple example to get you started:</p>
                  <pre>
                    <code>{`import pingMe from 'ping-me';

// Initialize with your API key
pingMe.initialize({
  apiKey: 'your-api-key',
  endpoints: ['https://your-app.com/api']
});

// Start pinging
pingMe.start();`}</code>
                  </pre>

                  <h2>Creating an Account</h2>
                  <p>
                    To use Ping-Me, you'll need to{" "}
                    <Link
                      href="/signup"
                      className="text-primary hover:underline"
                    >
                      create an account
                    </Link>{" "}
                    and get an API key.
                  </p>

                  <h2>Next Steps</h2>
                  <p>Once you have your API key, you can:</p>
                  <ul>
                    <li>Configure your endpoints</li>
                    <li>Set up notifications</li>
                    <li>Monitor your services through the dashboard</li>
                  </ul>
                </div>
              )}

              {activeSection === "how-it-works" && (
                <div>
                  <h1>How Ping-Me Works</h1>
                  <p>
                    Ping-Me is designed to keep your web services and APIs awake
                    by sending regular requests to them.
                  </p>

                  <h2>The Problem</h2>
                  <p>
                    Many free hosting services put your applications to sleep
                    after periods of inactivity. This can lead to slow response
                    times when users first access your service after it's been
                    idle.
                  </p>

                  <h2>Our Solution</h2>
                  <p>
                    Ping-Me sends regular HTTP requests to your endpoints to
                    keep them active. This prevents them from going idle and
                    ensures they're always responsive when your users need them.
                  </p>

                  <h2>Architecture</h2>
                  <p>Ping-Me consists of:</p>
                  <ul>
                    <li>
                      <strong>Client Library</strong>: A lightweight JavaScript
                      library that you can integrate into your application.
                    </li>
                    <li>
                      <strong>Cloud Service</strong>: Our servers that send
                      regular pings to your endpoints.
                    </li>
                    <li>
                      <strong>Dashboard</strong>: A web interface where you can
                      monitor your endpoints and configure settings.
                    </li>
                  </ul>

                  <h2>Monitoring and Alerts</h2>
                  <p>
                    In addition to keeping your services awake, Ping-Me also
                    monitors their health and can alert you when they go down.
                  </p>
                </div>
              )}

              {activeSection === "authentication" && (
                <div>
                  <h1>Authentication</h1>
                  <p>
                    All API requests to Ping-Me require authentication using an
                    API key.
                  </p>

                  <h2>Obtaining an API Key</h2>
                  <p>
                    You can get an API key by{" "}
                    <Link
                      href="/signup"
                      className="text-primary hover:underline"
                    >
                      signing up
                    </Link>{" "}
                    for a Ping-Me account.
                  </p>

                  <h2>Using Your API Key</h2>
                  <p>
                    Include your API key in the Authorization header of your
                    requests:
                  </p>
                  <pre>
                    <code>{`Authorization: Bearer your-api-key`}</code>
                  </pre>

                  <h2>API Key Security</h2>
                  <p>
                    Keep your API key secure and never expose it in client-side
                    code. If you suspect your API key has been compromised, you
                    can generate a new one from your dashboard.
                  </p>
                </div>
              )}

              {activeSection === "endpoints" && (
                <div>
                  <h1>Endpoints API</h1>
                  <p>
                    The Endpoints API allows you to manage the URLs that Ping-Me
                    will monitor.
                  </p>

                  <h2>List Endpoints</h2>
                  <pre>
                    <code>{`GET /api/endpoints

Response:
{
  "endpoints": [
    {
      "id": "ep_123abc",
      "url": "https://example.com/api",
      "status": "up",
      "lastPing": "2023-06-15T14:30:00Z"
    }
  ]
}`}</code>
                  </pre>

                  <h2>Add Endpoint</h2>
                  <pre>
                    <code>{`POST /api/endpoints
{
  "url": "https://example.com/api"
}

Response:
{
  "id": "ep_123abc",
  "url": "https://example.com/api",
  "status": "pending"
}`}</code>
                  </pre>

                  <h2>Delete Endpoint</h2>
                  <pre>
                    <code>{`DELETE /api/endpoints/:id

Response:
{
  "success": true
}`}</code>
                  </pre>
                </div>
              )}

              {activeSection === "logs" && (
                <div>
                  <h1>Logs API</h1>
                  <p>
                    The Logs API allows you to record and retrieve ping logs.
                  </p>

                  <h2>Record Log</h2>
                  <pre>
                    <code>{`POST /api/log
{
  "endpoint": "https://example.com/api",
  "status": "success",
  "responseTime": 150,
  "timestamp": "2023-06-15T14:30:00Z"
}`}</code>
                  </pre>

                  <h2>Get Logs</h2>
                  <pre>
                    <code>{`GET /api/logs?endpoint=:endpointId&start=:startDate&end=:endDate

Response:
{
  "logs": [
    {
      "id": "log_123abc",
      "endpoint": "https://example.com/api",
      "status": "success",
      "responseTime": 150,
      "timestamp": "2023-06-15T14:30:00Z"
    }
  ]
}`}</code>
                  </pre>
                </div>
              )}

              {activeSection === "metrics" && (
                <div>
                  <h1>Metrics API</h1>
                  <p>
                    The Metrics API provides insights into your endpoint
                    performance.
                  </p>

                  <h2>Get Metrics</h2>
                  <pre>
                    <code>{`GET /api/metrics?endpoint=:endpointId&period=:period

Response:
{
  "uptime": 99.9,
  "averageResponseTime": 150,
  "totalRequests": 1000,
  "successRate": 99.5
}`}</code>
                  </pre>
                </div>
              )}

              {activeSection === "integration" && (
                <div>
                  <h1>Integration Guide</h1>
                  <p>Learn how to integrate Ping-Me with your application.</p>

                  <h2>Client Library</h2>
                  <p>
                    Our client library makes it easy to integrate Ping-Me with
                    your application:
                  </p>
                  <pre>
                    <code>{`import pingMe from 'ping-me';

// Initialize
pingMe.initialize({
  apiKey: 'your-api-key',
  endpoints: ['https://your-app.com/api']
});

// Start pinging
pingMe.start();

// Stop pinging
pingMe.stop();`}</code>
                  </pre>

                  <h2>Webhooks</h2>
                  <p>
                    You can also receive notifications via webhooks when your
                    endpoints go down:
                  </p>
                  <pre>
                    <code>{`POST /api/webhooks
{
  "url": "https://your-app.com/webhook",
  "events": ["endpoint.down", "endpoint.up"]
}`}</code>
                  </pre>
                </div>
              )}

              {activeSection === "notifications" && (
                <div>
                  <h1>Setting Up Notifications</h1>
                  <p>
                    Configure how you want to be notified about your endpoints.
                  </p>

                  <h2>Notification Channels</h2>
                  <p>Ping-Me supports multiple notification channels:</p>
                  <ul>
                    <li>Email</li>
                    <li>SMS</li>
                    <li>Slack</li>
                    <li>Discord</li>
                    <li>Webhooks</li>
                  </ul>

                  <h2>Configuring Notifications</h2>
                  <p>
                    You can configure notifications through the dashboard or
                    API:
                  </p>
                  <pre>
                    <code>{`POST /api/notifications
{
  "channel": "email",
  "recipient": "user@example.com",
  "events": ["endpoint.down", "endpoint.up"]
}`}</code>
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-12">
        <div className="container py-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Ping-Me. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Terms
            </Link>
            <Link
              href="/contact"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
