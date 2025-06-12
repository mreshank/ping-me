import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ping-me';
let cachedClient: MongoClient | null = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  cachedClient = client;
  return client;
}

// Middleware to validate API key
async function validateApiKey(req: NextApiRequest) {
  const apiKey = req.headers.authorization?.split('Bearer ')[1];
  
  if (!apiKey) {
    return null;
  }
  
  try {
    const client = await connectToDatabase();
    const db = client.db();
    const user = await db.collection('users').findOne({ apiKey });
    
    return user;
  } catch (error) {
    console.error('Error validating API key:', error);
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate API key
    const user = await validateApiKey(req);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid or missing API key' });
    }
    
    // Get query parameters
    const { endpoint, timeRange = '24h' } = req.query;
    
    // Calculate the time range
    const now = new Date();
    let startTime = new Date();
    
    switch (timeRange) {
      case '1h':
        startTime.setHours(now.getHours() - 1);
        break;
      case '24h':
        startTime.setDate(now.getDate() - 1);
        break;
      case '7d':
        startTime.setDate(now.getDate() - 7);
        break;
      case '30d':
        startTime.setDate(now.getDate() - 30);
        break;
      default:
        startTime.setDate(now.getDate() - 1); // Default to 24h
    }
    
    // Connect to database
    const client = await connectToDatabase();
    const db = client.db();
    
    // Build query
    const query: any = {
      apiKey: user.apiKey,
      timestamp: { $gte: startTime }
    };
    
    // Add endpoint filter if provided
    if (endpoint && endpoint !== 'all') {
      query.endpoint = endpoint;
    }
    
    // Get logs for the specified time range
    const logs = await db.collection('logs')
      .find(query)
      .sort({ timestamp: 1 })
      .toArray();
    
    // Calculate metrics
    const totalLogs = logs.length;
    
    // Calculate uptime percentage
    const successfulRequests = logs.filter(log => log.status < 400).length;
    const uptime = totalLogs > 0 ? (successfulRequests / totalLogs) * 100 : 100;
    
    // Calculate average response time
    const totalResponseTime = logs.reduce((sum, log) => sum + log.responseTime, 0);
    const avgResponseTime = totalLogs > 0 ? totalResponseTime / totalLogs : 0;
    
    // Calculate error rate
    const errorRate = totalLogs > 0 ? ((totalLogs - successfulRequests) / totalLogs) * 100 : 0;
    
    // Count status codes
    const statusCodes: Record<number, number> = {};
    logs.forEach(log => {
      statusCodes[log.status] = (statusCodes[log.status] || 0) + 1;
    });
    
    // Prepare time series data for charts
    const timePoints: string[] = [];
    const responseTimes: number[] = [];
    
    // Group logs by time intervals
    const intervalMinutes = timeRange === '1h' ? 5 : timeRange === '24h' ? 60 : timeRange === '7d' ? 360 : 1440;
    const groupedLogs: Record<string, number[]> = {};
    
    logs.forEach(log => {
      const timestamp = new Date(log.timestamp);
      timestamp.setMinutes(Math.floor(timestamp.getMinutes() / intervalMinutes) * intervalMinutes);
      timestamp.setSeconds(0);
      timestamp.setMilliseconds(0);
      
      const timeKey = timestamp.toISOString();
      
      if (!groupedLogs[timeKey]) {
        groupedLogs[timeKey] = [];
      }
      
      groupedLogs[timeKey].push(log.responseTime);
    });
    
    // Calculate average response time for each time interval
    Object.keys(groupedLogs).sort().forEach(timeKey => {
      const avgTime = groupedLogs[timeKey].reduce((sum, time) => sum + time, 0) / groupedLogs[timeKey].length;
      
      timePoints.push(timeKey);
      responseTimes.push(Math.round(avgTime));
    });
    
    // Return metrics
    res.status(200).json({
      uptime: uptime.toFixed(2),
      avgResponseTime: avgResponseTime.toFixed(2),
      totalRequests: totalLogs,
      errorRate: errorRate.toFixed(2),
      statusCodes,
      timePoints,
      responseTimes,
      // Limited caching (last 100kb of data max)
      dataSizeKb: JSON.stringify(logs).length / 1024,
      dataLimited: JSON.stringify(logs).length > 100 * 1024
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 