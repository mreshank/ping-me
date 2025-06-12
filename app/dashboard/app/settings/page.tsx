'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Settings() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [settings, setSettings] = useState({
    pingInterval: 300000, // 5 minutes
    alertEnabled: false,
    emailNotifications: {
      enabled: false,
      address: ''
    },
    webhookNotifications: {
      enabled: false,
      url: ''
    },
    slackNotifications: {
      enabled: false,
      webhook: ''
    },
    endpoints: [] as string[]
  });

  // Check for stored API key on component mount
  useEffect(() => {
    const storedApiKey = localStorage.getItem('pingMeApiKey');
    if (storedApiKey) {
      setApiKey(storedApiKey);
      fetchSettings(storedApiKey);
    } else {
      router.push('/dashboard');
    }
  }, []);

  const fetchSettings = async (key: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      // In a real app, this would make a real API call
      // For demo purposes, we'll simulate a successful response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock settings data
      setSettings({
        pingInterval: 300000,
        alertEnabled: true,
        emailNotifications: {
          enabled: true,
          address: 'user@example.com'
        },
        webhookNotifications: {
          enabled: false,
          url: ''
        },
        slackNotifications: {
          enabled: false,
          webhook: ''
        },
        endpoints: [
          'https://myapi.render.com',
          'https://myfastapi.cyclic.app'
        ]
      });
      
    } catch (err: any) {
      console.error('Error fetching settings:', err);
      setError(err.message || 'Failed to fetch settings');
      
      if (err.message?.includes('Unauthorized') || err.message?.includes('Invalid API key')) {
        localStorage.removeItem('pingMeApiKey');
        router.push('/dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      // Handle nested properties
      const [parent, child] = name.split('.');
      setSettings(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      // Handle top-level properties
      setSettings(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess(false);
    
    try {
      // In a real app, this would call an API to save settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful save
      setSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setError(err.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (!apiKey) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">You need to log in to access settings.</p>
          <Link href="/dashboard" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <nav className="flex space-x-4">
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
              Dashboard
            </Link>
            <Link href="/docs" className="text-gray-500 hover:text-gray-700">
              Documentation
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem('pingMeApiKey');
                router.push('/dashboard');
              }}
              className="text-red-600 hover:text-red-800"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">Loading settings...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* API Key Section */}
              <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                <div className="md:grid md:grid-cols-3 md:gap-6">
                  <div className="md:col-span-1">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">API Key</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Your API key for authentication with Ping-Me services.
                    </p>
                  </div>
                  <div className="mt-5 md:mt-0 md:col-span-2">
                    <div>
                      <div className="flex items-center">
                        <span className="font-mono text-sm bg-gray-100 p-2 rounded flex-1">
                          {apiKey.substring(0, 8)}...{apiKey.substring(apiKey.length - 4)}
                        </span>
                        <button
                          type="button"
                          className="ml-3 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          onClick={() => {
                            navigator.clipboard.writeText(apiKey);
                            alert('API key copied to clipboard!');
                          }}
                        >
                          Copy
                        </button>
                        <button
                          type="button"
                          className="ml-3 inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          onClick={() => {
                            if (confirm('Are you sure you want to regenerate your API key? This will invalidate your current key.')) {
                              // In a real app, this would call an API to regenerate the key
                              alert('API key regeneration would happen here');
                            }
                          }}
                        >
                          Regenerate
                        </button>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        Keep this key secret. If compromised, regenerate it immediately.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ping Settings Section */}
              <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                <div className="md:grid md:grid-cols-3 md:gap-6">
                  <div className="md:col-span-1">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Ping Settings</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Configure how often your endpoints are pinged.
                    </p>
                  </div>
                  <div className="mt-5 md:mt-0 md:col-span-2">
                    <div className="grid grid-cols-6 gap-6">
                      <div className="col-span-6 sm:col-span-4">
                        <label htmlFor="pingInterval" className="block text-sm font-medium text-gray-700">
                          Ping Interval (milliseconds)
                        </label>
                        <select
                          id="pingInterval"
                          name="pingInterval"
                          value={settings.pingInterval}
                          onChange={handleChange}
                          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                          <option value={60000}>Every minute (60,000 ms)</option>
                          <option value={300000}>Every 5 minutes (300,000 ms)</option>
                          <option value={600000}>Every 10 minutes (600,000 ms)</option>
                          <option value={1800000}>Every 30 minutes (1,800,000 ms)</option>
                          <option value={3600000}>Every hour (3,600,000 ms)</option>
                        </select>
                        <p className="mt-2 text-sm text-gray-500">
                          How frequently your endpoints should be pinged to keep them awake.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Alert Settings Section */}
              <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                <div className="md:grid md:grid-cols-3 md:gap-6">
                  <div className="md:col-span-1">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Alert Settings</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Configure notifications for when your endpoints go down.
                    </p>
                  </div>
                  <div className="mt-5 md:mt-0 md:col-span-2">
                    <div className="space-y-6">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="alertEnabled"
                            name="alertEnabled"
                            type="checkbox"
                            checked={settings.alertEnabled}
                            onChange={handleChange}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="alertEnabled" className="font-medium text-gray-700">
                            Enable Alerts
                          </label>
                          <p className="text-gray-500">Get notified when your endpoints go down or recover.</p>
                        </div>
                      </div>

                      {settings.alertEnabled && (
                        <div className="space-y-6">
                          {/* Email Notifications */}
                          <div className="space-y-4">
                            <div className="flex items-start">
                              <div className="flex items-center h-5">
                                <input
                                  id="emailNotifications.enabled"
                                  name="emailNotifications.enabled"
                                  type="checkbox"
                                  checked={settings.emailNotifications.enabled}
                                  onChange={handleChange}
                                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                />
                              </div>
                              <div className="ml-3 text-sm">
                                <label htmlFor="emailNotifications.enabled" className="font-medium text-gray-700">
                                  Email Notifications
                                </label>
                              </div>
                            </div>
                            
                            {settings.emailNotifications.enabled && (
                              <div className="ml-7">
                                <label htmlFor="emailNotifications.address" className="block text-sm font-medium text-gray-700">
                                  Email Address
                                </label>
                                <input
                                  type="email"
                                  name="emailNotifications.address"
                                  id="emailNotifications.address"
                                  value={settings.emailNotifications.address}
                                  onChange={handleChange}
                                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                />
                              </div>
                            )}
                          </div>
                          
                          {/* Webhook Notifications */}
                          <div className="space-y-4">
                            <div className="flex items-start">
                              <div className="flex items-center h-5">
                                <input
                                  id="webhookNotifications.enabled"
                                  name="webhookNotifications.enabled"
                                  type="checkbox"
                                  checked={settings.webhookNotifications.enabled}
                                  onChange={handleChange}
                                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                />
                              </div>
                              <div className="ml-3 text-sm">
                                <label htmlFor="webhookNotifications.enabled" className="font-medium text-gray-700">
                                  Webhook Notifications
                                </label>
                              </div>
                            </div>
                            
                            {settings.webhookNotifications.enabled && (
                              <div className="ml-7">
                                <label htmlFor="webhookNotifications.url" className="block text-sm font-medium text-gray-700">
                                  Webhook URL
                                </label>
                                <input
                                  type="url"
                                  name="webhookNotifications.url"
                                  id="webhookNotifications.url"
                                  value={settings.webhookNotifications.url}
                                  onChange={handleChange}
                                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                  placeholder="https://example.com/webhook"
                                />
                              </div>
                            )}
                          </div>
                          
                          {/* Slack Notifications */}
                          <div className="space-y-4">
                            <div className="flex items-start">
                              <div className="flex items-center h-5">
                                <input
                                  id="slackNotifications.enabled"
                                  name="slackNotifications.enabled"
                                  type="checkbox"
                                  checked={settings.slackNotifications.enabled}
                                  onChange={handleChange}
                                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                />
                              </div>
                              <div className="ml-3 text-sm">
                                <label htmlFor="slackNotifications.enabled" className="font-medium text-gray-700">
                                  Slack Notifications
                                </label>
                              </div>
                            </div>
                            
                            {settings.slackNotifications.enabled && (
                              <div className="ml-7">
                                <label htmlFor="slackNotifications.webhook" className="block text-sm font-medium text-gray-700">
                                  Slack Webhook URL
                                </label>
                                <input
                                  type="url"
                                  name="slackNotifications.webhook"
                                  id="slackNotifications.webhook"
                                  value={settings.slackNotifications.webhook}
                                  onChange={handleChange}
                                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                  placeholder="https://hooks.slack.com/services/..."
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Endpoints Section */}
              <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                <div className="md:grid md:grid-cols-3 md:gap-6">
                  <div className="md:col-span-1">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Managed Endpoints</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      View and manage your monitored endpoints.
                    </p>
                  </div>
                  <div className="mt-5 md:mt-0 md:col-span-2">
                    <div className="space-y-6">
                      <p className="text-sm text-gray-500">
                        Your Ping-Me service is currently monitoring the following endpoints:
                      </p>
                      
                      {settings.endpoints.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                          {settings.endpoints.map((endpoint, index) => (
                            <li key={index} className="py-4 flex items-center justify-between">
                              <div className="flex items-center">
                                <span className="h-2 w-2 bg-green-400 rounded-full mr-2"></span>
                                <span className="text-sm font-medium text-gray-900">{endpoint}</span>
                              </div>
                              <button
                                type="button"
                                className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                onClick={() => {
                                  if (confirm(`Are you sure you want to remove ${endpoint} from monitoring?`)) {
                                    // In a real app, this would call an API
                                    setSettings(prev => ({
                                      ...prev,
                                      endpoints: prev.endpoints.filter((_, i) => i !== index)
                                    }));
                                  }
                                }}
                              >
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500 italic">
                          No endpoints are currently being monitored. Start using Ping-Me in your applications to see them appear here.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end">
                {error && (
                  <div className="mr-4 text-sm text-red-600">
                    {error}
                  </div>
                )}
                
                {success && (
                  <div className="mr-4 text-sm text-green-600">
                    Settings saved successfully!
                  </div>
                )}
                
                <button
                  type="button"
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => router.push('/dashboard')}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {isSaving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
} 