'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';

interface Settings {
  pingInterval: number;
  alertEnabled: boolean;
}

interface SettingsResponse {
  settings: Settings;
  error?: string;
}

export default function Settings(): React.ReactElement {
  const [apiKey, setApiKey] = useState<string>('');
  const [settings, setSettings] = useState<Settings>({
    pingInterval: 300000, // 5 minutes in ms
    alertEnabled: false
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Check if we're on the client side
  useEffect(() => {
    // Get API key from local storage
    const storedApiKey = localStorage.getItem('pingme_api_key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
      fetchSettings(storedApiKey);
    }
  }, []);

  // Format the ping interval for display
  const formatPingInterval = (ms: number): string => {
    if (ms < 60000) {
      return `${ms / 1000} seconds`;
    } else if (ms < 3600000) {
      return `${ms / 60000} minutes`;
    } else {
      return `${ms / 3600000} hours`;
    }
  };

  // Fetch settings from API
  const fetchSettings = async (key: string): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings', {
        headers: {
          'Authorization': `Bearer ${key}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }

      const data: SettingsResponse = await response.json();
      setSettings(data.settings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setError('Failed to load settings. Please check your API key.');
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type, checked } = e.target;
    
    // Convert ping interval to milliseconds
    if (name === 'pingInterval') {
      const intervalInMs = parseInt(value) * 60000; // Convert minutes to ms
      setSettings(prev => ({
        ...prev,
        [name]: intervalInMs
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSaved(false);

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error updating settings:', error);
      setError('Failed to update settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
              <Link href="/dashboard" className="transition-colors hover:text-foreground/80 text-foreground/60">
                Dashboard
              </Link>
              <Link href="/docs" className="transition-colors hover:text-foreground/80 text-foreground/60">
                Documentation
              </Link>
              <Link href="/settings" className="text-foreground">
                Settings
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="flex items-center">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        {!apiKey ? (
          <div className="bg-card text-card-foreground rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-medium mb-4">API Key Required</h2>
            <p className="mb-4">Please enter your API key to manage your settings.</p>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 rounded-md border-border bg-background px-3 py-2"
                placeholder="Enter your API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <button
                onClick={() => {
                  localStorage.setItem('pingme_api_key', apiKey);
                  fetchSettings(apiKey);
                }}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
              >
                Submit
              </button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Don't have an API key? <Link href="/signup" className="text-primary hover:underline">Sign up</Link> to get one.
            </p>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-destructive/10 text-destructive rounded-md p-4 mb-6">
                {error}
              </div>
            )}

            {saved && (
              <div className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 rounded-md p-4 mb-6">
                Settings saved successfully!
              </div>
            )}

            <div className="bg-card text-card-foreground rounded-lg shadow p-6 mb-8">
              <h2 className="text-lg font-medium mb-4">General Settings</h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="pingInterval">
                      Ping Interval (minutes)
                    </label>
                    <input
                      type="number"
                      id="pingInterval"
                      name="pingInterval"
                      min="1"
                      max="60"
                      className="w-full rounded-md border-border bg-background px-3 py-2"
                      value={settings.pingInterval / 60000}
                      onChange={handleChange}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Your endpoints will be pinged every {formatPingInterval(settings.pingInterval)}.
                    </p>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="alertEnabled"
                      name="alertEnabled"
                      className="h-4 w-4 rounded border-border"
                      checked={settings.alertEnabled}
                      onChange={handleChange}
                    />
                    <label className="ml-2 block text-sm" htmlFor="alertEnabled">
                      Enable downtime alerts
                    </label>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
                    >
                      {loading ? 'Saving...' : 'Save Settings'}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <div className="bg-card text-card-foreground rounded-lg shadow p-6 mb-8">
              <h2 className="text-lg font-medium mb-4">API Key</h2>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-muted p-3 rounded-md font-mono text-sm overflow-x-auto">
                  {apiKey}
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(apiKey)}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-4 py-2"
                >
                  Copy
                </button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Keep your API key secure. If compromised, you can generate a new one from your dashboard.
              </p>
            </div>

            <div className="bg-card text-card-foreground rounded-lg shadow p-6">
              <h2 className="text-lg font-medium mb-4">Danger Zone</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-destructive">Reset API Key</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    This will invalidate your current API key and generate a new one. All applications using the old key will need to be updated.
                  </p>
                  <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-destructive bg-background text-destructive shadow-sm hover:bg-destructive/10 h-9 px-4 py-2">
                    Reset API Key
                  </button>
                </div>
                <div className="pt-4 border-t border-border">
                  <h3 className="text-sm font-medium text-destructive">Delete Account</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    This will permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground shadow hover:bg-destructive/90 h-9 px-4 py-2">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
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