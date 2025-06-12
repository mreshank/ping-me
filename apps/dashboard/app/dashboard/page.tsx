'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [endpoints, setEndpoints] = useState([]);
  const [selectedEndpoint, setSelectedEndpoint] = useState(null);
  const [timeRange, setTimeRange] = useState('24h');
  const [metrics, setMetrics] = useState({
    uptime: 99.5,
    avgResponseTime: 245,
    totalRequests: 1287,
    errorRate: 1.2
  });

  // Check for stored API key on component mount
  useEffect(() => {
    const storedApiKey = localStorage.getItem('pingMeApiKey');
    if (storedApiKey) {
      setApiKey(storedApiKey);
      fetchDashboardData(storedApiKey);
    }
  }, []);

  // Fetch dashboard data when API key changes or time range changes
  useEffect(() => {
    if (apiKey) {
      fetchDashboardData(apiKey);
    }
  }, [apiKey, timeRange, selectedEndpoint]);

  const fetchDashboardData = async (key) => {
    if (!key) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      // This would normally fetch data from your API
      // For now, we'll use mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful API response with mock data
      const mockEndpoints = [
        { id: 'ep_1', url: 'https://myapi.render.com', status: 'up' },
        { id: 'ep_2', url: 'https://myfastapi.cyclic.app', status: 'down' }
      ];
      
      setEndpoints(mockEndpoints);
      
      if (mockEndpoints.length > 0 && !selectedEndpoint) {
        setSelectedEndpoint(mockEndpoints[0].url);
      }
      
      // Mock metrics data
      setMetrics({
        uptime: Math.random() * 5 + 95, // Between 95% and 100%
        avgResponseTime: Math.floor(Math.random() * 400) + 100, // Between 100ms and 500ms
        totalRequests: Math.floor(Math.random() * 1000) + 500, // Between 500 and 1500
        errorRate: Math.random() * 3 // Between 0% and 3%
      });
      
      // Save valid API key to localStorage
      localStorage.setItem('pingMeApiKey', key);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to fetch dashboard data');
      
      if (err.message?.includes('Unauthorized') || err.message?.includes('Invalid API key')) {
        localStorage.removeItem('pingMeApiKey');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleApiKeySubmit = (e) => {
    e.preventDefault();
    if (apiKey.trim()) {
      fetchDashboardData(apiKey);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('pingMeApiKey');
    setApiKey('');
    setEndpoints([]);
    setSelectedEndpoint(null);
    setMetrics({
      uptime: 0,
      avgResponseTime: 0,
      totalRequests: 0,
      errorRate: 0
    });
  };

  const handleEndpointChange = (e) => {
    setSelectedEndpoint(e.target.value);
  };

  const handleTimeRangeChange = (e) => {
    setTimeRange(e.target.value);
  };

  // If API key is not set, show login form
  if (!apiKey) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Enter your API Key
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            To view your dashboard metrics, please enter your Ping-Me API key
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleApiKeySubmit}>
              <div>
                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
                  API Key
                </label>
                <div className="mt-1">
                  <input
                    id="apiKey"
                    name="apiKey"
                    type="text"
                    required
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="pm_test_xxxxx"
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {isLoading ? 'Loading...' : 'View Dashboard'}
                </button>
              </div>
            </form>
            
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Don't have an API key?
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => router.push('/signup')}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Sign up for Ping-Me
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Ping-Me Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">API Key: {apiKey.substring(0, 8)}...</span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">Loading dashboard data...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Filter controls */}
            <div className="bg-white shadow rounded-lg mb-6 p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="endpoint" className="block text-sm font-medium text-gray-700 mb-1">
                    Endpoint
                  </label>
                  <select
                    id="endpoint"
                    name="endpoint"
                    value={selectedEndpoint || ''}
                    onChange={handleEndpointChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="">All Endpoints</option>
                    {endpoints.map((endpoint) => (
                      <option key={endpoint.id} value={endpoint.url}>
                        {endpoint.url}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="timeRange" className="block text-sm font-medium text-gray-700 mb-1">
                    Time Range
                  </label>
                  <select
                    id="timeRange"
                    name="timeRange"
                    value={timeRange}
                    onChange={handleTimeRangeChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="1h">Last Hour</option>
                    <option value="24h">Last 24 Hours</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="refresh" className="block text-sm font-medium text-gray-700 mb-1">
                    Auto Refresh
                  </label>
                  <select
                    id="refresh"
                    name="refresh"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="0">Off</option>
                    <option value="30">Every 30 seconds</option>
                    <option value="60">Every minute</option>
                    <option value="300">Every 5 minutes</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Metrics overview */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
              {/* Uptime */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                      <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Uptime
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">
                            {metrics.uptime.toFixed(2)}%
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Average Response Time */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                      <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Avg Response Time
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">
                            {metrics.avgResponseTime.toFixed(0)} ms
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Requests */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                      <svg className="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Requests
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">
                            {metrics.totalRequests}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Rate */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                      <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Error Rate
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">
                            {metrics.errorRate.toFixed(2)}%
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Response Time Chart */}
            <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Response Time
                </h3>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Response time chart will appear here</p>
                  <p className="text-gray-400 text-sm ml-2">(requires chart.js integration)</p>
                </div>
              </div>
            </div>

            {/* Recent Logs */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Recent Logs
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Most recent ping activity for your endpoints.
                  </p>
                </div>
                <button
                  onClick={() => fetchDashboardData(apiKey)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Refresh
                </button>
              </div>
              <div className="border-t border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Timestamp
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Endpoint
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Response Time
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Error
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {/* Generate mock log entries */}
                      {endpoints.length > 0 ? (
                        [...Array(5)].map((_, i) => {
                          const endpoint = endpoints[i % endpoints.length];
                          const timestamp = new Date(Date.now() - i * 1000 * 60 * 10).toISOString();
                          const status = Math.random() > 0.1 ? 200 : 500;
                          const responseTime = Math.floor(Math.random() * 500) + 50;
                          const error = status === 200 ? null : 'Connection timed out';
                          
                          return (
                            <tr key={i}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(timestamp).toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {endpoint.url}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status < 400 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  {status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {responseTime} ms
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500">
                                {error || '-'}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                            No log data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Dashboard Settings
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Configure your Ping-Me preferences.
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">API Key</h4>
                    <p className="mt-1 text-sm text-gray-500">
                      Your API key is used to authenticate requests to the Ping-Me API.
                    </p>
                    <div className="mt-2 flex items-center space-x-3">
                      <span className="text-gray-700 font-mono bg-gray-100 px-2 py-1 rounded">
                        {apiKey.substring(0, 8)}...{apiKey.substring(apiKey.length - 4)}
                      </span>
                      <button
                        className="text-sm text-blue-600 hover:text-blue-800"
                        onClick={() => {
                          navigator.clipboard.writeText(apiKey);
                          alert('API key copied to clipboard!');
                        }}
                      >
                        Copy
                      </button>
                      <button
                        className="text-sm text-red-600 hover:text-red-800"
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
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Notifications</h4>
                    <p className="mt-1 text-sm text-gray-500">
                      Configure how you want to be notified about your endpoints.
                    </p>
                    <div className="mt-2 space-y-4">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="email-notifications"
                            name="email-notifications"
                            type="checkbox"
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="email-notifications" className="font-medium text-gray-700">
                            Email notifications
                          </label>
                          <p className="text-gray-500">
                            Get notified when an endpoint goes down or recovers.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="webhook-notifications"
                            name="webhook-notifications"
                            type="checkbox"
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="webhook-notifications" className="font-medium text-gray-700">
                            Webhook notifications
                          </label>
                          <p className="text-gray-500">
                            Send events to a webhook URL.
                          </p>
                          <input
                            type="text"
                            placeholder="https://example.com/webhook"
                            className="mt-1 block w-full sm:w-64 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Ping Interval</h4>
                    <p className="mt-1 text-sm text-gray-500">
                      How often should we ping your endpoints?
                    </p>
                    <div className="mt-2">
                      <select
                        id="ping-interval"
                        name="ping-interval"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option value="60000">Every minute</option>
                        <option value="300000">Every 5 minutes</option>
                        <option value="600000">Every 10 minutes</option>
                        <option value="1800000">Every 30 minutes</option>
                        <option value="3600000">Every hour</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-5">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Save Settings
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
} 