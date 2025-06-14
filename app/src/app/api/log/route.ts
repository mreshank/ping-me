import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { rateLimit } from 'express-rate-limit';

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

// Simple rate limiting implementation for API routes
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100; // limit each IP to 100 requests per minute

const ipRequestCounts = new Map<string, { count: number, resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = ipRequestCounts.get(ip);
  
  if (!record) {
    ipRequestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  
  if (now > record.resetTime) {
    // Reset the counter if the window has passed
    record.count = 1;
    record.resetTime = now + RATE_LIMIT_WINDOW_MS;
    return true;
  }
  
  if (record.count >= MAX_REQUESTS) {
    return false;
  }
  
  record.count += 1;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const ip = request.ip || '127.0.0.1';
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Too many requests, please try again later.' }, { status: 429 });
    }

    // Get API key from Authorization header
    const apiKey = request.headers.get('authorization')?.split('Bearer ')[1];
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API key is required' }, { status: 401 });
    }

    // Get request body
    const body = await request.json();
    const { endpoint, status, responseTime, timestamp, error } = body;

    // Validate required fields
    if (!endpoint || status === undefined || responseTime === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Connect to database
    const client = await connectToDatabase();
    const db = client.db();

    // Check if user exists
    const user = await db.collection('users').findOne({ apiKey });
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
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

    return NextResponse.json({ success: true, id: log.insertedId }, { status: 201 });
  } catch (error) {
    console.error('Error logging ping:', error);
 