import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_health_assist';
const DB_NAME = 'ai_health_assist';

let client: MongoClient | null = null;
let db: Db | null = null;
let connectionFailed = false;
let lastAttempt = 0;

export async function connectDB(): Promise<Db> {
  if (db) return db;

  // Don't retry for 30 seconds after a failure
  if (connectionFailed && Date.now() - lastAttempt < 30000) {
    throw new Error('MongoDB unavailable (cached failure)');
  }

  try {
    lastAttempt = Date.now();
    client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 2000, // 2 sec timeout instead of default 30
      connectTimeoutMS: 2000,
    });
    await client.connect();
    db = client.db(DB_NAME);
    connectionFailed = false;
    return db;
  } catch {
    connectionFailed = true;
    throw new Error('MongoDB unavailable');
  }
}

export async function getCollection(name: string) {
  const database = await connectDB();
  return database.collection(name);
}
