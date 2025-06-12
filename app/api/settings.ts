import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';
import { randomUUID } from 'crypto';

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
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return handleGet(req, res);
    case 'POST':
      return handlePost(req, res);
    case 'PUT':
      return handlePut(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// GET: Retrieve settings
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = await validateApiKey(req);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid or missing API key' });
    }
    
    res.status(200).json({ 
      settings: user.settings || {
        pingInterval: 300000,
        alertEnabled: false
      }
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// POST: Create a new user with API key
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const client = await connectToDatabase();
    const db = client.db();
    
    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }
    
    // Create a new user with a random API key
    const apiKey = randomUUID();
    
    const user = await db.collection('users').insertOne({
      email,
      apiKey,
      createdAt: new Date(),
      settings: {
        pingInterval: 300000,
        alertEnabled: false
      }
    });
    
    res.status(201).json({
      apiKey,
      settings: {
        pingInterval: 300000,
        alertEnabled: false
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// PUT: Update settings
async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = await validateApiKey(req);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid or missing API key' });
    }
    
    const { pingInterval, alertEnabled } = req.body;
    
    // Validate settings
    if (pingInterval !== undefined && (typeof pingInterval !== 'number' || pingInterval < 10000)) {
      return res.status(400).json({ error: 'pingInterval must be a number greater than 10000ms (10 seconds)' });
    }
    
    if (alertEnabled !== undefined && typeof alertEnabled !== 'boolean') {
      return res.status(400).json({ error: 'alertEnabled must be a boolean' });
    }
    
    // Initialize settings if they don't exist
    const settings = user.settings || {
      pingInterval: 300000,
      alertEnabled: false
    };
    
    // Update settings
    if (pingInterval !== undefined) {
      settings.pingInterval = pingInterval;
    }
    
    if (alertEnabled !== undefined) {
      settings.alertEnabled = alertEnabled;
    }
    
    // Save to database
    const client = await connectToDatabase();
    const db = client.db();
    
    await db.collection('users').updateOne(
      { apiKey: user.apiKey },
      { $set: { settings } }
    );
    
    res.status(200).json({ success: true, settings });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
