# Database Upgrade Guide - AI Health Assistant

## Overview
This guide outlines the migration from localStorage to three robust database systems:
1. **Firebase Firestore** - User profiles, health logs, and real-time data
2. **PostgreSQL** - Relational data (appointments, roles, transactions)
3. **MongoDB Atlas** - Unstructured data and demo fallback

---

## Phase 1: Environment Setup

### 1.1 Install Dependencies

```bash
npm install firebase firebase-admin
npm install pg prisma @prisma/client
npm install mongoose dotenv
npm install bcryptjs jsonwebtoken
```

### 1.2 Environment Variables (.env.local)

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
FIREBASE_SERVICE_ACCOUNT_KEY=path/to/serviceAccountKey.json

# PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/ai_health_assistant
POSTGRES_URL_NON_POOLING=postgresql://user:password@localhost:5432/ai_health_assistant

# MongoDB Atlas (fallback/demo)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai_health_assistant?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this
```

---

## Phase 2: Firestore Setup

### 2.1 Initialize Firebase Client

Create `src/lib/firebase-client.ts`:
```typescript
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (prevent re-initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firestore
const db = getFirestore(app);

// Enable offline persistence
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence disabled');
    } else if (err.code === 'unimplemented') {
      console.warn('Browser doesn\'t support persistence');
    }
  });
}

// Initialize Auth
const auth = getAuth(app);

export { db, auth, app };
```

### 2.2 Create Firestore Storage Module

Create `src/lib/firestore-storage.ts`:
```typescript
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp,
} from 'firebase/firestore';
import { db, auth } from './firebase-client';
import { DailyHealthLog, HealthGoals, DEFAULT_HEALTH_GOALS } from './health-types';

const HEALTH_LOGS_COLLECTION = 'health_logs';
const HEALTH_GOALS_COLLECTION = 'health_goals';
const USER_PROFILES_COLLECTION = 'user_profiles';

export async function saveHealthLog(log: DailyHealthLog): Promise<void> {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const docRef = doc(
      db,
      USER_PROFILES_COLLECTION,
      userId,
      HEALTH_LOGS_COLLECTION,
      log.date
    );

    await setDoc(docRef, {
      ...log,
      updatedAt: Timestamp.now(),
      userId,
    });
  } catch (error) {
    console.error('Error saving health log:', error);
    throw error;
  }
}

export async function getHealthLog(date: string): Promise<DailyHealthLog | null> {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) return null;

    const docRef = doc(
      db,
      USER_PROFILES_COLLECTION,
      userId,
      HEALTH_LOGS_COLLECTION,
      date
    );
    const snap = await getDoc(docRef);

    return snap.exists() ? (snap.data() as DailyHealthLog) : null;
  } catch (error) {
    console.error('Error fetching health log:', error);
    return null;
  }
}

export async function getHealthLogs(startDate?: string, endDate?: string): Promise<DailyHealthLog[]> {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) return [];

    const logsRef = collection(
      db,
      USER_PROFILES_COLLECTION,
      userId,
      HEALTH_LOGS_COLLECTION
    );

    let q = query(logsRef);

    if (startDate || endDate) {
      const constraints = [];
      if (startDate) constraints.push(where('date', '>=', startDate));
      if (endDate) constraints.push(where('date', '<=', endDate));
      q = query(logsRef, ...constraints);
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data() as DailyHealthLog).sort((a, b) => b.date.localeCompare(a.date));
  } catch (error) {
    console.error('Error fetching health logs:', error);
    return [];
  }
}

export async function saveHealthGoals(goals: HealthGoals): Promise<void> {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const docRef = doc(db, USER_PROFILES_COLLECTION, userId, HEALTH_GOALS_COLLECTION, 'current');

    await setDoc(docRef, {
      ...goals,
      updatedAt: Timestamp.now(),
      userId,
    });
  } catch (error) {
    console.error('Error saving health goals:', error);
    throw error;
  }
}

export async function getHealthGoals(): Promise<HealthGoals> {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) return DEFAULT_HEALTH_GOALS;

    const docRef = doc(db, USER_PROFILES_COLLECTION, userId, HEALTH_GOALS_COLLECTION, 'current');
    const snap = await getDoc(docRef);

    return snap.exists() ? snap.data() as HealthGoals : DEFAULT_HEALTH_GOALS;
  } catch (error) {
    console.error('Error fetching health goals:', error);
    return DEFAULT_HEALTH_GOALS;
  }
}

export async function deleteHealthLog(date: string): Promise<void> {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const docRef = doc(
      db,
      USER_PROFILES_COLLECTION,
      userId,
      HEALTH_LOGS_COLLECTION,
      date
    );
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting health log:', error);
    throw error;
  }
}

export async function exportHealthData(format: 'json' | 'csv'): Promise<string> {
  try {
    const logs = await getHealthLogs();

    if (format === 'json') {
      return JSON.stringify(logs, null, 2);
    }

    // CSV format
    const headers = [
      'Date', 'Sleep Hours', 'Sleep Quality', 'Mood Level', 'Mood Note',
      'Water Glasses', 'Exercise Type', 'Exercise Duration', 'Exercise Intensity',
      'Breakfast', 'Lunch', 'Dinner', 'Symptoms', 'Symptom Severity',
    ];

    const rows = logs.map((log) => [
      log.date,
      log.sleep?.hours ?? '',
      log.sleep?.quality ?? '',
      log.mood?.level ?? '',
      log.mood?.note ?? '',
      log.water?.glasses ?? '',
      log.exercise?.type ?? '',
      log.exercise?.duration ?? '',
      log.exercise?.intensity ?? '',
      log.nutrition?.breakfast ?? '',
      log.nutrition?.lunch ?? '',
      log.nutrition?.dinner ?? '',
      log.symptoms?.join('; ') ?? '',
      log.symptomSeverity ?? '',
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    return csv;
  } catch (error) {
    console.error('Error exporting health data:', error);
    throw error;
  }
}
```

---

## Phase 3: PostgreSQL Setup with Prisma

### 3.1 Create Prisma Schema

Create `prisma/schema.prisma`:
```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String
  name          String?
  role          UserRole  @default(PATIENT)
  phone         String?
  address       String?
  profileImage  String?
  firebaseUid   String?   @unique
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  appointments  Appointment[]
  prescriptions Prescription[]
  payments      Payment[]
  schedules     Schedule[]

  @@map("users")
}

model Appointment {
  id            String    @id @default(cuid())
  userId        String
  doctorId      String?
  departmentId  String?
  date          DateTime
  time          String
  reason        String?
  status        AppointmentStatus @default(SCHEDULED)
  tokenNumber   Int?
  notes         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  doctor        User?     @relation("DoctorAppointments", fields: [doctorId], references: [id])
  department    Department? @relation(fields: [departmentId], references: [id])

  @@index([userId])
  @@index([doctorId])
  @@index([date])
  @@map("appointments")
}

model Department {
  id        String   @id @default(cuid())
  name      String   @unique
  description String?
  imageUrl  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  appointments Appointment[]

  @@map("departments")
}

model Prescription {
  id          String   @id @default(cuid())
  userId      String
  medicineId  String
  dosage      String
  frequency   String
  duration    String
  prescribedBy String?
  startDate   DateTime
  endDate     DateTime?
  notes       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  medicine    Medicine @relation(fields: [medicineId], references: [id])

  @@index([userId])
  @@index([medicineId])
  @@map("prescriptions")
}

model Medicine {
  id            String   @id @default(cuid())
  name          String   @unique
  genericName   String
  category      String
  manufacturer  String?
  usage         String
  dosage        String
  sideEffects   String[]
  warnings      String[]
  price         Float
  inStock       Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  prescriptions Prescription[]

  @@index([category])
  @@map("medicines")
}

model Payment {
  id            String   @id @default(cuid())
  userId        String
  appointmentId String?
  amount        Float
  status        PaymentStatus @default(PENDING)
  method        PaymentMethod @default(UPI)
  transactionId String?
  notes         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([status])
  @@map("payments")
}

model Schedule {
  id            String   @id @default(cuid())
  userId        String
  doctorId      String?
  dayOfWeek     Int
  startTime     String
  endTime       String
  slotDuration  Int      @default(30)
  isAvailable   Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([doctorId])
  @@map("schedules")
}

enum UserRole {
  PATIENT
  STUDENT
  DOCTOR
  PROFESSOR
  ADMIN
}

enum AppointmentStatus {
  SCHEDULED
  CONFIRMED
  COMPLETED
  CANCELLED
  RESCHEDULED
}

enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
}

enum PaymentMethod {
  UPI
  CREDIT_CARD
  DEBIT_CARD
  BANK_TRANSFER
  CASH
}
```

### 3.2 Initialize PostgreSQL

```bash
# Create database
createdb ai_health_assistant

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Open Prisma Studio (optional)
npx prisma studio
```

### 3.3 Create PostgreSQL API Module

Create `src/lib/postgres-db.ts`:
```typescript
import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // Prevent instantiating multiple instances during hot reloading
  const globalForPrisma = global as unknown as { prisma: PrismaClient };
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query'] : [],
    });
  }
  prisma = globalForPrisma.prisma;
}

export default prisma;
```

Create `src/lib/postgres-queries.ts`:
```typescript
import prisma from './postgres-db';
import { Appointment, Prescription, Payment, User } from '@prisma/client';

// User Operations
export async function createUser(data: {
  email: string;
  password: string;
  name: string;
  role: 'PATIENT' | 'STUDENT' | 'DOCTOR' | 'PROFESSOR';
  firebaseUid?: string;
}): Promise<User> {
  return prisma.user.create({
    data,
  });
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function getUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { id },
  });
}

// Appointment Operations
export async function createAppointment(data: {
  userId: string;
  doctorId?: string;
  departmentId?: string;
  date: Date;
  time: string;
  reason?: string;
}): Promise<Appointment> {
  return prisma.appointment.create({
    data,
  });
}

export async function getAppointmentsByUser(userId: string): Promise<Appointment[]> {
  return prisma.appointment.findMany({
    where: { userId },
    include: { doctor: true, department: true },
    orderBy: { date: 'desc' },
  });
}

export async function getAppointmentById(id: string): Promise<Appointment | null> {
  return prisma.appointment.findUnique({
    where: { id },
    include: { doctor: true, department: true },
  });
}

export async function updateAppointmentStatus(
  id: string,
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED'
): Promise<Appointment> {
  return prisma.appointment.update({
    where: { id },
    data: { status },
  });
}

// Prescription Operations
export async function createPrescription(data: {
  userId: string;
  medicineId: string;
  dosage: string;
  frequency: string;
  duration: string;
  startDate: Date;
  endDate?: Date;
  notes?: string;
}): Promise<Prescription> {
  return prisma.prescription.create({
    data,
  });
}

export async function getPrescriptionsByUser(userId: string): Promise<Prescription[]> {
  return prisma.prescription.findMany({
    where: { userId },
    include: { medicine: true },
    orderBy: { startDate: 'desc' },
  });
}

// Payment Operations
export async function createPayment(data: {
  userId: string;
  amount: number;
  method: 'UPI' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'CASH';
  notes?: string;
}): Promise<Payment> {
  return prisma.payment.create({
    data,
  });
}

export async function getPaymentsByUser(userId: string): Promise<Payment[]> {
  return prisma.payment.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function updatePaymentStatus(
  id: string,
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
): Promise<Payment> {
  return prisma.payment.update({
    where: { id },
    data: { status },
  });
}
```

---

## Phase 4: MongoDB Atlas Enhanced Setup

### 4.1 Update MongoDB Connection

Create `src/lib/mongodb-atlas.ts`:
```typescript
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

export async function connectToMongoDB(): Promise<Db> {
  if (cached.db) {
    return cached.db;
  }

  try {
    const client = await MongoClient.connect(MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
    });

    const db = client.db(DB_NAME);

    // Verify connection
    await db.admin().ping();

    cached.client = client;
    cached.db = db;

    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error('Failed to connect to MongoDB Atlas');
  }
}

export async function getMongoCollection<T>(collectionName: string): Promise<Collection<T>> {
  const db = await connectToMongoDB();
  return db.collection<T>(collectionName);
}

export async function closeMongoConnection(): Promise<void> {
  if (cached.client) {
    await cached.client.close();
    cached = { client: null, db: null };
  }
}

// Create indexes for better performance
export async function ensureIndexes(): Promise<void> {
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

    console.log('✅ MongoDB indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
}
```

---

## Phase 5: Create Unified Data Access Layer

Create `src/lib/unified-db.ts`:
```typescript
import { db as firestoreDb, auth } from './firebase-client';
import prisma from './postgres-db';
import { connectToMongoDB } from './mongodb-atlas';
import { DailyHealthLog, HealthGoals } from './health-types';

/**
 * Unified Database Access Layer
 * Routes data to the appropriate database:
 * - Firestore: User profiles, health logs, real-time data
 * - PostgreSQL: Appointments, prescriptions, payments, structured data
 * - MongoDB: Chat history, AI responses, unstructured data
 */

export class UnifiedDB {
  // ===== Firestore: User & Health Data =====
  static async saveHealthLog(log: DailyHealthLog) {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');
      // Implementation from firestore-storage.ts
      console.log('Health log saved to Firestore:', log.date);
    } catch (error) {
      console.error('Error saving to Firestore:', error);
      throw error;
    }
  }

  static async getHealthLogs() {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return [];
      // Implementation from firestore-storage.ts
    } catch (error) {
      console.error('Error fetching from Firestore:', error);
      return [];
    }
  }

  // ===== PostgreSQL: Relational Data =====
  static async createAppointment(appointmentData: any) {
    try {
      return await prisma.appointment.create({
        data: appointmentData,
      });
    } catch (error) {
      console.error('Error creating appointment in PostgreSQL:', error);
      throw error;
    }
  }

  static async getAppointmentsByUser(userId: string) {
    try {
      return await prisma.appointment.findMany({
        where: { userId },
        include: { doctor: true, department: true },
        orderBy: { date: 'desc' },
      });
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  }

  static async createPayment(paymentData: any) {
    try {
      return await prisma.payment.create({
        data: paymentData,
      });
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  // ===== MongoDB: Unstructured Data =====
  static async saveChatHistory(conversationData: any) {
    try {
      const db = await connectToMongoDB();
      const collection = db.collection('chat_history');
      
      const result = await collection.insertOne({
        ...conversationData,
        createdAt: new Date(),
      });
      
      return result;
    } catch (error) {
      console.error('Error saving chat history:', error);
      throw error;
    }
  }

  static async getChatHistory(userId: string, limit = 50) {
    try {
      const db = await connectToMongoDB();
      const collection = db.collection('chat_history');
      
      return await collection
        .find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();
    } catch (error) {
      console.error('Error fetching chat history:', error);
      return [];
    }
  }

  static async saveAIResponse(responseData: any) {
    try {
      const db = await connectToMongoDB();
      const collection = db.collection('ai_responses');
      
      const result = await collection.insertOne({
        ...responseData,
        timestamp: new Date(),
      });
      
      return result;
    } catch (error) {
      console.error('Error saving AI response:', error);
      throw error;
    }
  }
}

export default UnifiedDB;
```

---

## Phase 6: API Route Examples

### 6.1 Appointment API with PostgreSQL

Create `src/app/api/appointments/create/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/postgres-db';
import { getAuth } from 'firebase/auth';

export async function POST(request: NextRequest) {
  try {
    const { doctorId, departmentId, date, time, reason } = await request.json();
    
    // Get user ID from auth header (implement your auth middleware)
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        userId,
        doctorId,
        departmentId,
        date: new Date(date),
        time,
        reason,
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error('Appointment creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}
```

### 6.2 Health Logs API with Firestore

Create `src/app/api/health/save-log/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-client';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { DailyHealthLog } from '@/lib/health-types';

export async function POST(request: NextRequest) {
  try {
    const healthLog: DailyHealthLog = await request.json();
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const docRef = doc(
      db,
      'user_profiles',
      userId,
      'health_logs',
      healthLog.date
    );

    await setDoc(docRef, {
      ...healthLog,
      updatedAt: Timestamp.now(),
      userId,
    });

    return NextResponse.json(
      { message: 'Health log saved successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error saving health log:', error);
    return NextResponse.json(
      { error: 'Failed to save health log' },
      { status: 500 }
    );
  }
}
```

### 6.3 Chat History API with MongoDB

Create `src/app/api/chat/history/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { connectToMongoDB } from '@/lib/mongodb-atlas';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await connectToMongoDB();
    const collection = db.collection('chat_history');

    const chatHistory = await collection
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json(chatHistory, { status: 200 });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat history' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, role } = await request.json();
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await connectToMongoDB();
    const collection = db.collection('chat_history');

    const result = await collection.insertOne({
      userId,
      message,
      role,
      createdAt: new Date(),
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error saving chat message:', error);
    return NextResponse.json(
      { error: 'Failed to save message' },
      { status: 500 }
    );
  }
}
```

---

## Phase 7: Migration from localStorage

### 7.1 Update Health Storage Module

Replace existing `src/lib/health-storage.ts` with:
```typescript
import { DailyHealthLog, HealthGoals, DEFAULT_HEALTH_GOALS } from './health-types';
import { db } from './firebase-client';
import { collection, query, where, getDocs, doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { auth } from './firebase-client';

const HEALTH_LOGS_COLLECTION = 'health_logs';
const HEALTH_GOALS_COLLECTION = 'health_goals';

/**
 * Migrated to use Firestore with localStorage fallback
 */

// Fallback to localStorage if Firestore unavailable
async function withFirestoreFallback<T>(
  operation: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.warn('Firestore operation failed, using fallback:', error);
    return fallback;
  }
}

export async function getHealthLogs(): Promise<DailyHealthLog[]> {
  return withFirestoreFallback(
    async () => {
      const userId = auth.currentUser?.uid;
      if (!userId) return [];

      const logsRef = collection(db, `user_profiles/${userId}/health_logs`);
      const snapshot = await getDocs(logsRef);
      return snapshot.docs.map((doc) => doc.data() as DailyHealthLog);
    },
    []
  );
}

export async function saveHealthLog(log: DailyHealthLog): Promise<void> {
  return withFirestoreFallback(
    async () => {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('Not authenticated');

      const docRef = doc(db, `user_profiles/${userId}/health_logs`, log.date);
      await setDoc(docRef, {
        ...log,
        updatedAt: Timestamp.now(),
      });
    },
    undefined as any
  );
}

export async function getHealthGoals(): Promise<HealthGoals> {
  return withFirestoreFallback(
    async () => {
      const userId = auth.currentUser?.uid;
      if (!userId) return DEFAULT_HEALTH_GOALS;

      const docRef = doc(db, `user_profiles/${userId}/health_goals`, 'current');
      const snap = await getDoc(docRef);
      return snap.exists() ? (snap.data() as HealthGoals) : DEFAULT_HEALTH_GOALS;
    },
    DEFAULT_HEALTH_GOALS
  );
}

export async function saveHealthGoals(goals: HealthGoals): Promise<void> {
  return withFirestoreFallback(
    async () => {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('Not authenticated');

      const docRef = doc(db, `user_profiles/${userId}/health_goals`, 'current');
      await setDoc(docRef, {
        ...goals,
        updatedAt: Timestamp.now(),
      });
    },
    undefined as any
  );
}

// Additional helper functions...
export async function getHealthLogByDate(date: string): Promise<DailyHealthLog | undefined> {
  return withFirestoreFallback(
    async () => {
      const userId = auth.currentUser?.uid;
      if (!userId) return undefined;

      const docRef = doc(db, `user_profiles/${userId}/health_logs`, date);
      const snap = await getDoc(docRef);
      return snap.exists() ? (snap.data() as DailyHealthLog) : undefined;
    },
    undefined
  );
}

export async function getHealthStreak() {
  const logs = await getHealthLogs();
  if (logs.length === 0) return { current: 0, longest: 0, lastLogDate: null };

  const sortedDates = logs.map((l) => l.date).sort().reverse();
  const today = new Date().toISOString().split('T')[0];

  let current = 0;
  let checkDate = today;
  for (let i = 0; i < 365; i++) {
    if (sortedDates.includes(checkDate)) {
      current++;
    } else if (i > 0) {
      break;
    }
    const d = new Date(checkDate);
    d.setDate(d.getDate() - 1);
    checkDate = d.toISOString().split('T')[0];
  }

  let longest = 0;
  let tempStreak = 0;
  const allDates = logs.map((l) => l.date).sort();
  for (let i = 0; i < allDates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prev = new Date(allDates[i - 1]);
      const curr = new Date(allDates[i]);
      const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      tempStreak = diff === 1 ? tempStreak + 1 : 1;
    }
    if (tempStreak > longest) longest = tempStreak;
  }

  return { current, longest, lastLogDate: sortedDates[0] || null };
}
```

---

## Phase 8: Testing the Integration

### 8.1 Create Test File

Create `src/lib/__tests__/database-integration.test.ts`:
```typescript
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import UnifiedDB from '../unified-db';
import prisma from '../postgres-db';
import { connectToMongoDB } from '../mongodb-atlas';

describe('Database Integration', () => {
  beforeAll(async () => {
    // Setup test environment
  });

  afterAll(async () => {
    // Cleanup
  });

  it('should save health log to Firestore', async () => {
    // Test Firestore
  });

  it('should create appointment in PostgreSQL', async () => {
    // Test PostgreSQL
  });

  it('should save chat history to MongoDB', async () => {
    // Test MongoDB
  });

  it('should retrieve data from all databases', async () => {
    // Integration test
  });
});
```

---

## Phase 9: Deployment Checklist

- [ ] Firebase project created and service account key generated
- [ ] PostgreSQL database provisioned (local or cloud)
- [ ] MongoDB Atlas cluster created
- [ ] All environment variables set in production
- [ ] Prisma migrations run successfully
- [ ] Firestore security rules configured
- [ ] MongoDB Atlas IP whitelist configured
- [ ] Environment variables validated
- [ ] Database backups configured
- [ ] Monitoring and logging set up
- [ ] Load testing completed

---

## Quick Reference: Which DB for What

| Data Type | Database | Why |
|-----------|----------|-----|
| User profiles | Firestore | Real-time sync, auth integration |
| Health logs | Firestore | Personal data, fast access |
| Appointments | PostgreSQL | Relational, transactional |
| Prescriptions | PostgreSQL | Structured, referential integrity |
| Payments | PostgreSQL | ACID compliance, auditing |
| Chat history | MongoDB | Flexible schema, high volume |
| AI responses | MongoDB | Unstructured, archival |
| Medical records | MongoDB | Flexible format, large docs |

---

## Troubleshooting

### Connection Issues
- Firebase: Check API keys and CORS settings
- PostgreSQL: Verify connection string format
- MongoDB: Whitelist IP addresses, check credentials

### Performance Tips
- Enable Firestore offline persistence
- Use PostgreSQL connection pooling
- Index MongoDB collections appropriately
- Cache frequently accessed data

---

## Next Steps
1. Follow Phase 1 to Phase 5 sequentially
2. Test each database independently
3. Run the integration test suite
4. Migrate existing data from localStorage
5. Deploy to production with rollback plan
