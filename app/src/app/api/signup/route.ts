import { NextRequest, NextResponse } from 'next/server';
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, company } = body;
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    // Connect to database
    const client = await connectToDatabase();
    const db = client.db();
    
    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
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
    return NextResponse.json({
      apiKey,
      settings: {
        pingInterval: 300000,
        alertEnabled: false
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 