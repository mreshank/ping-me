'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';

type Tab = 'overview' | 'endpoints' | 'analytics' | 'settings';

interface Endpoint {
  id: number;
  url: string;
  status: 'up' | 'down';
  responseTime: string;
  uptime: string;
  lastPing: string;
}

export default function DashboardPage(): React.ReactElement {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  
  // Mock data for the dashboard
  const endpoints: Endpoint[] = [
    { id: 1, url: 'https://api.example.com/users', status: 'up', responseTime: '124ms', uptime: '99.98%', lastPing: '2 minutes ago' },
    { id: 2, url: 'https://api.example.com/products', status: 'up', responseTime: '156ms', uptime: '99.95%', lastPing: '1 minute ago' },
    { id: 3, url: 'https://api.example.com/orders', status: 'down', responseTime: '0ms', uptime: '98.72%', lastPing: '5 minutes ago' },
    { id: 4, url: 'https://api.example.com/payments', status: 'up', responseTime: '189ms', uptime: '99.90%', lastPing: '3 minutes ago' },
  ];

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
              <Link href="/docs" className="transition-colors hover:text-foreground/80 text-foreground/60">
                Documentation
              </Link>
              <Link href="/dashboard" className="text-foreground">
                Dashboard
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <button className="inline-flex items-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground px-4 py-2 relative h-9 w-full justify-between text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64">
                <span className="hidden lg:inline-flex">Search endpoints...</span>
                <span className="inline-flex lg:hidden">Search...</span>
                <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </button>
            </div>
            <nav className="flex items-center">
              <div className="flex items-center gap-2 ml-4">
                <span className="text-sm font-medium text-foreground">
                  user@example.com
                </span>
                <button className="inline-flex items-center justify-center rounded-full w-8 h-8 bg-primary text-primary-foreground">
                  U
                </button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="container py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-none">
            <div className="sticky top-20 bg-card rounded-lg shadow overflow-hidden">
              <nav className="p-4 space-y-2">
                <button 
                  onClick={() => setActiveTab('overview')}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                    activeTab === 'overview' 
                      ? 'bg-primary/10 text-primary font-medium' 
                      : 'text-foreground/70 hover:text-foreground hover:bg-secondary/50'
                  }`}
                >
                  Overview
                </button>
                <button 
                  onClick={() => setActiveTab('endpoints')}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                    activeTab === 'endpoints' 
                      ? 'bg-primary/10 text-primary font-medium' 
                      : 'text-foreground/70 hover:text-foreground hover:bg-secondary/50'
                  }`}
                >
                  Endpoints
                </button>
                <button 
                  onClick={() => setActiveTab('analytics')}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                    activeTab === 'analytics' 
                      ? 'bg-primary/10 text-primary font-medium' 
                      : 'text-foreground/70 hover:text-foreground hover:bg-secondary/50'
                  }`}
                >
                  Analytics
                </button>
                <button 
                  onClick={() => setActiveTab('settings')}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                    activeTab === 'settings' 
                      ? 'bg-primary/10 text-primary font-medium' 
                      : 'text-foreground/70 hover:text-foreground hover:bg-secondary/50'
                  }`}
                >
                  Settings
                </button>
              </nav>
            </div>
          </div>

          {/* Main content area */}
          <div className="flex-1">
            {activeTab === 'overview' && (
              <div>
                <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>
                
                {/* Stats cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <div className="bg-card text-card-foreground rounded-lg shadow p-6 neomorphism">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Endpoints</h3>
                    <p className="text-2xl font-bold">{endpoints.length}</p>
                  </div>
                  <div className="bg-card text-card-foreground rounded-lg shadow p-6 neomorphism">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Active</h3>
                    <p className="text-2xl font-bold">{endpoints.filter(e => e.status === 'up').length}</p>
                  </div>
                  <div className="bg-card text-card-foreground rounded-lg shadow p-6 neomorphism">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Down</h3>
                    <p className="text-2xl font-bold text-destructive">{endpoints.filter(e => e.status === 'down').length}</p>
                  </div>
                  <div className="bg-card text-card-foreground rounded-lg shadow p-6 neomorphism">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Average Uptime</h3>
                    <p className="text-2xl font-bold">99.64%</p>
                  </div>
                </div>
                
                {/* Recent activity */}
                <div className="bg-card text-card-foreground rounded-lg shadow p-6 mb-8">
                  <h2 className="text-lg font-medium mb-4">Recent Activity</h2>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-3 rounded-md bg-background">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <div>
                        <p className="text-sm font-medium">https://api.example.com/products is up</p>
                        <p className="text-xs text-muted-foreground">2 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 rounded-md bg-background">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <div>
                        <p className="text-sm font-medium">https://api.example.com/orders is down</p>
                        <p className="text-xs text-muted-foreground">5 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 rounded-md bg-background">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <div>
                        <p className="text-sm font-medium">https://api.example.com/users is up</p>
                        <p className="text-xs text-muted-foreground">10 minutes ago</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Quick actions */}
                <div className="bg-card text-card-foreground rounded-lg shadow p-6">
                  <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button className="p-4 rounded-md bg-primary/10 hover:bg-primary/20 transition-colors text-primary font-medium text-sm">
                      Add New Endpoint
                    </button>
                    <button className="p-4 rounded-md bg-secondary hover:bg-secondary/80 transition-colors text-secondary-foreground font-medium text-sm">
                      Generate Report
                    </button>
                    <button className="p-4 rounded-md bg-secondary hover:bg-secondary/80 transition-colors text-secondary-foreground font-medium text-sm">
                      Configure Alerts
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'endpoints' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-3xl font-bold">Endpoints</h1>
                  <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
                    Add Endpoint
                  </button>
                </div>
                
                <div className="bg-card text-card-foreground rounded-lg shadow overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">URL</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Response Time</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Uptime</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Last Ping</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {endpoints.map((endpoint) => (
                          <tr key={endpoint.id} className="hover:bg-muted/50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{endpoint.url}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                endpoint.status === 'up' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                              }`}>
                                {endpoint.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{endpoint.responseTime}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{endpoint.uptime}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{endpoint.lastPing}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <button className="text-primary hover:text-primary/80 mr-2">Edit</button>
                              <button className="text-destructive hover:text-destructive/80">Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'analytics' && (
              <div>
                <h1 className="text-3xl font-bold mb-6">Analytics</h1>
                <div className="bg-card text-card-foreground rounded-lg shadow p-6 mb-8">
                  <h2 className="text-lg font-medium mb-4">Response Time (Last 24 Hours)</h2>
                  <div className="h-64 bg-muted/30 rounded-md flex items-center justify-center">
                    <p className="text-muted-foreground">Chart placeholder</p>
                  </div>
                </div>
                
                <div className="bg-card text-card-foreground rounded-lg shadow p-6">
                  <h2 className="text-lg font-medium mb-4">Uptime (Last 30 Days)</h2>
                  <div className="h-64 bg-muted/30 rounded-md flex items-center justify-center">
                    <p className="text-muted-foreground">Chart placeholder</p>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'settings' && (
              <div>
                <h1 className="text-3xl font-bold mb-6">Settings</h1>
                <div className="bg-card text-card-foreground rounded-lg shadow p-6">
                  <h2 className="text-lg font-medium mb-4">Account Settings</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <input
                        type="email"
                        value="user@example.com"
                        className="w-full rounded-md border-border bg-background px-3 py-2"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">API Key</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="password"
                          value="sk_test_123456789"
                          className="flex-1 rounded-md border-border bg-background px-3 py-2"
                          disabled
                        />
                        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-4 py-2">
                          Regenerate
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              Terms
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
} 