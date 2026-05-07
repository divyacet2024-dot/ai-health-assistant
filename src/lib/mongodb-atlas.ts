import { MongoClient, Db, Collection } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_health_assistant';
const DB_NAME = 'ai_health_assistant';

interface CachedConnection {
  client: MongoClient | null;
  db: Db | null;
}

let cached: CachedConnection = {
  client: null,
  db: null,
};

/**
 * Connect to MongoDB Atlas
 */
export async function connectToMongoDB(): Promise<Db> {
  if (cached.db) {
    return cached.db;
  }

  try {
    const client = await MongoClient.connect(MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      retryWrites: true,
      w: 'majority',
    });

    const db = client.db(DB_NAME);

    // Verify connection
    await db.admin().ping();

    cached.client = client;
    cached.db = db;

    console.log('✅ Connected to MongoDB Atlas');
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error('Failed to connect to MongoDB Atlas');
  }
}

/**
 * Get a specific collection
 */
export async function getMongoCollection<T>(collectionName: string): Promise<Collection<T>> {
  const db = await connectToMongoDB();
  return db.collection<T>(collectionName);
}

/**
 * Close MongoDB connection
 */
export async function closeMongoConnection(): Promise<void> {
  if (cached.client) {
    await cached.client.close();
    cached = { client: null, db: null };
    console.log('✅ Disconnected from MongoDB');
  }
}

/**
 * Create indexes for better performance
 */
export async function ensureMongoIndexes(): Promise<void> {
  try {
    const db = await connectToMongoDB();

    // Chat history indexes
    await db.collection('chat_history').createIndex({ userId: 1, createdAt: -1 });
    await db.collection('chat_history').createIndex({ conversationId: 1 });

    // Medical records indexes
    await db.collection('medical_records').createIndex({ userId: 1 });
    await db.collection('medical_records').createIndex({ recordType: 1 });

    // AI responses indexes
    await db.collection('ai_responses').createIndex({ userId: 1, timestamp: -1 });

    // TTL index for automatic deletion after 90 days
    await db.collection('temporary_data').createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: 7776000 }
    );

    console.log('✅ MongoDB indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
}

/**
 * Health check
 */
export async function checkMongoConnection(): Promise<boolean> {
  try {
    const db = await connectToMongoDB();
    await db.admin().ping();
    return true;
  } catch (error) {
    console.error('MongoDB health check failed:', error);
    return false;
  }
}
