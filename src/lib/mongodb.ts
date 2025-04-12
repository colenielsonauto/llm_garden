import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'gardendb'; // Use the specified database name

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  // Check URI within the function scope for type safety
  if (!MONGODB_URI) {
    throw new Error('Missing MONGODB_URI environment variable');
  }

  if (cachedClient && cachedDb) {
    // console.log('Using cached database instance');
    return { client: cachedClient, db: cachedDb };
  }

  // If no connection is cached, create a new one
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    const db = client.db(DB_NAME);
    console.log('Successfully connected to MongoDB database:', DB_NAME);

    // Cache the client and db globally
    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    // Close the client if connection fails
    await client.close();
    throw error; // Re-throw the error after logging and cleanup
  }
} 