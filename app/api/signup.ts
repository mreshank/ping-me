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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, name, company } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    // Connect to database
    const client = await connectToDatabase();
    const db = client.db();
    
    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }
    
    // Generate API key with pm_ prefix
    const apiKey = `pm_${randomUUID().replace(/-/g, '')}`;
    
    // Create user
    await db.collection('users').insertOne({
      email,
      name,
      company,
      apiKey,
      createdAt: new Date(),
      settings: {
        pingInterval: 300000, // 5 minutes
        alertEnabled: false
      }
    });
    
    // Create default notification settings
    await db.collection('notifications').insertOne({
      apiKey,
      email: {
        enabled: true,
        address: email
      },
      webhook: {
        enabled: false,
        url: null
      },
      createdAt: new Date()
    });
    
    // Return API key to user
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