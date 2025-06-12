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
    
    // Connect to database
    const client = await connectToDatabase();
    const db = client.db();
    
    // Get all unique endpoints from logs for this user
    const apiKey = user.apiKey;
    
    // Find all unique endpoints for this user
    const uniqueEndpoints = await db.collection('logs')
      .aggregate([
        { $match: { apiKey } },
        { $group: { _id: "$endpoint" } },
        { $project: { _id: 0, url: "$_id" } }
      ])
      .toArray();
    
    // For each endpoint, get the latest status
    const endpoints = await Promise.all(
      uniqueEndpoints.map(async (endpoint) => {
        const latestLog = await db.collection('logs')
          .find({ apiKey, endpoint: endpoint.url })
          .sort({ timestamp: -1 })
          .limit(1)
          .toArray();
        
        const status = latestLog.length > 0 && latestLog[0].status < 400 ? 'up' : 'down';
        
        return {
          id: `ep_${Math.random().toString(36).substring(2, 9)}`,
          url: endpoint.url,
          status,
          lastPing: latestLog.length > 0 ? latestLog[0].timestamp : null
        };
      })
    );
    
    // Return endpoints
    res.status(200).json({ 
      endpoints,
      // Cache data size for frontend info
      cachedSize: `${JSON.stringify(endpoints).length / 1024}KB`
    });
  } catch (error) {
    console.error('Error fetching endpoints:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 