/* Log API route for storing ping metrics */
import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';
import { rateLimit } from 'express-rate-limit';

// Initialize rate limiter
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

// Apply rate limiting middleware
const applyMiddleware = (req: NextApiRequest, res: NextApiResponse) => {
  return new Promise((resolve, reject) => {
    limiter(req as any, res as any, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Apply rate limiting
    await applyMiddleware(req, res);

    // Get API key from Authorization header
    const apiKey = req.headers.authorization?.split('Bearer ')[1];
    
    if (!apiKey) {
      return res.status(401).json({ error: 'API key is required' });
    }

    // Get request body
    const { endpoint, status, responseTime, timestamp, error } = req.body;

    // Validate required fields
    if (!endpoint || status === undefined || responseTime === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Connect to database
    const client = await connectToDatabase();
    const db = client.db();

    // Check if user exists
    const user = await db.collection('users').findOne({ apiKey });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    // Create a new log entry
    const log = await db.collection('logs').insertOne({
      apiKey,
      endpoint,
      status,
      responseTime,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      error
    });

    // Delete old logs if there are too many for this user and endpoint
    const MAX_LOGS_PER_ENDPOINT = process.env.MAX_LOGS_PER_ENDPOINT || 1000;
    const count = await db.collection('logs').countDocuments({ apiKey, endpoint });
    
    if (count > Number(MAX_LOGS_PER_ENDPOINT)) {
      // Remove oldest logs beyond the limit
      const toRemove = count - Number(MAX_LOGS_PER_ENDPOINT);
      
      const oldestLogs = await db.collection('logs')
        .find({ apiKey, endpoint })
        .sort({ timestamp: 1 })
        .limit(toRemove)
        .toArray();
      
      if (oldestLogs.length > 0) {
        await db.collection('logs').deleteMany({ 
          _id: { $in: oldestLogs.map(log => log._id) } 
        });
      }
    }

    res.status(201).json({ success: true, id: log.insertedId });
  } catch (error) {
    console.error('Error logging ping:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}