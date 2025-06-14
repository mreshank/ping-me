import { NextRequest, NextResponse } from 'next/server';
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
async function validateApiKey(request: NextRequest) {
  const apiKey = request.headers.get('authorization')?.split('Bearer ')[1];
  
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

export async function GET(request: NextRequest) {
  try {
    // Validate API key
    const user = await validateApiKey(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid or missing API key' }, { status: 401 });
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
    return NextResponse.json({ 
      endpoints,
      // Cache data size for frontend info
      cachedSize: `${JSON.stringify(endpoints).length / 1024}KB`
    });
  } catch (error) {
    console.error('Error fetching endpoints:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 