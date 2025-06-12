/**
 * Example client for the Ping-Me metrics server
 * 
 * This example shows how to integrate with the metrics server directly
 * without using any of the Ping-Me client libraries.
 */

const axios = require('axios');

// Configuration
const API_KEY = 'your-api-key';
const METRICS_SERVER = 'http://localhost:5000';
const ENDPOINT_TO_MONITOR = 'https://api.example.com/products';

/**
 * Sends a ping to the metrics server
 */
async function sendPing(endpoint, status, responseTime, error = null) {
  try {
    await axios.post(`${METRICS_SERVER}/api/log`, {
      endpoint,
      status,
      responseTime,
      timestamp: new Date().toISOString(),
      error
    }, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    console.log(`✅ Ping logged for ${endpoint}`);
  } catch (err) {
    console.error(`❌ Failed to log ping: ${err.message}`);
  }
}

/**
 * Monitors an endpoint and sends ping data to the metrics server
 */
async function monitorEndpoint(url) {
  console.log(`🔍 Monitoring endpoint: ${url}`);
  
  try {
    const startTime = Date.now();
    const response = await axios.get(url);
    const responseTime = Date.now() - startTime;
    
    await sendPing(url, response.status, responseTime);
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const status = error.response?.status || 500;
    const errorMessage = error.message || 'Unknown error';
    
    await sendPing(url, status, responseTime, errorMessage);
  }
}

/**
 * Gets metrics from the server
 */
async function getMetrics() {
  try {
    const response = await axios.get(`${METRICS_SERVER}/api/metrics`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    });
    
    console.log('📊 Latest metrics:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error(`❌ Failed to get metrics: ${error.message}`);
  }
}

/**
 * Main function
 */
async function main() {
  // Monitor the endpoint every 30 seconds
  setInterval(() => monitorEndpoint(ENDPOINT_TO_MONITOR), 30000);
  
  // Monitor immediately on startup
  await monitorEndpoint(ENDPOINT_TO_MONITOR);
  
  // Get metrics after 5 seconds
  setTimeout(getMetrics, 5000);
}

// Run the example
main().catch(console.error); 