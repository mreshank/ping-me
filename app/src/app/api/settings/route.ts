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
    const user = await validateApiKey(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid or missing API key' }, { status: 401 });
    }
    
    return NextResponse.json({ 
      settings: user.settings || {
        pingInterval: 300000,
        alertEnabled: false
      }
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    const client = await connectToDatabase();
    const db = client.db();
    
    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
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

export async function PUT(request: NextRequest) {
  try {
    const user = await validateApiKey(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid or missing API key' }, { status: 401 });
    }
    
    const body = await request.json();
    const { pingInterval, alertEnabled } = body;
    
    // Validate settings
    if (pingInterval !== undefined && (typeof pingInterval !== 'number' || pingInterval < 10000)) {
      return NextResponse.json({ error: 'pingInterval must be a number greater than 10000ms (10 seconds)' }, { status: 400 });
    }
    
    if (alertEnabled !== undefined && typeof alertEnabled !== 'boolean') {
      return NextResponse.json({ error: 'alertEnabled must be a boolean' }, { status: 400 });
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
    
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 