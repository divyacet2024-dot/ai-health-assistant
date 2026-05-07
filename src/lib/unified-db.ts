import { db as firestoreDb, auth } from './firebase-client';
import prisma from './postgres-db';
import { connectToMongoDB } from './mongodb-atlas';
import { DailyHealthLog, HealthGoals, DEFAULT_HEALTH_GOALS } from './health-types';
import {
  createAppointment,
  getAppointmentsByUser,
  createPayment,
  getPaymentsByUser,
} from './postgres-queries';
import { Timestamp } from 'firebase/firestore';

/**
 * Unified Database Access Layer
 * Routes data to the appropriate database based on data type
 *
 * Database Distribution:
 * - Firestore: User profiles, health logs, real-time data
 * - PostgreSQL: Appointments, prescriptions, payments, structured data
 * - MongoDB: Chat history, AI responses, unstructured data
 */

export class UnifiedDB {
  /**
   * ===== FIRESTORE OPERATIONS =====
   * Real-time user data, health metrics, preferences
   */

  static async saveHealthLog(log: DailyHealthLog): Promise<void> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      const { collection, doc, setDoc } = await import('firebase/firestore');

      const docRef = doc(
        firestoreDb,
        `user_profiles/${userId}/health_logs`,
        log.date
      );

      await setDoc(docRef, {
        ...log,
        updatedAt: Timestamp.now(),
        userId,
      });

      console.log('✅ Health log saved to Firestore:', log.date);
    } catch (error) {
      console.error('Error saving to Firestore:', error);
      throw error;
    }
  }

  static async getHealthLogs(startDate?: string, endDate?: string): Promise<DailyHealthLog[]> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return [];

      const { collection, query, where, getDocs } = await import('firebase/firestore');

      const logsRef = collection(firestoreDb, `user_profiles/${userId}/health_logs`);

      let q = query(logsRef);
      if (startDate || endDate) {
        const constraints = [];
        if (startDate) constraints.push(where('date', '>=', startDate));
        if (endDate) constraints.push(where('date', '<=', endDate));
        q = query(logsRef, ...constraints);
      }

      const snapshot = await getDocs(q);
      return snapshot.docs
        .map((doc) => doc.data() as DailyHealthLog)
        .sort((a, b) => b.date.localeCompare(a.date));
    } catch (error) {
      console.error('Error fetching health logs:', error);
      return [];
    }
  }

  static async saveHealthGoals(goals: HealthGoals): Promise<void> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      const { doc, setDoc } = await import('firebase/firestore');

      const docRef = doc(firestoreDb, `user_profiles/${userId}/health_goals`, 'current');

      await setDoc(docRef, {
        ...goals,
        updatedAt: Timestamp.now(),
        userId,
      });

      console.log('✅ Health goals saved to Firestore');
    } catch (error) {
      console.error('Error saving health goals:', error);
      throw error;
    }
  }

  static async getHealthGoals(): Promise<HealthGoals> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return DEFAULT_HEALTH_GOALS;

      const { doc, getDoc } = await import('firebase/firestore');

      const docRef = doc(firestoreDb, `user_profiles/${userId}/health_goals`, 'current');
      const snap = await getDoc(docRef);

      return snap.exists() ? (snap.data() as HealthGoals) : DEFAULT_HEALTH_GOALS;
    } catch (error) {
      console.error('Error fetching health goals:', error);
      return DEFAULT_HEALTH_GOALS;
    }
  }

  /**
   * ===== POSTGRESQL OPERATIONS =====
   * Relational data with ACID compliance
   */

  static async createAppointment(appointmentData: {
    userId: string;
    doctorId?: string;
    departmentId?: string;
    date: Date;
    time: string;
    reason?: string;
  }) {
    try {
      const appointment = await createAppointment(appointmentData);
      console.log('✅ Appointment created in PostgreSQL:', appointment.id);
      return appointment;
    } catch (error) {
      console.error('Error creating appointment in PostgreSQL:', error);
      throw error;
    }
  }

  static async getAppointmentsByUser(userId: string) {
    try {
      const appointments = await getAppointmentsByUser(userId);
      console.log(`✅ Fetched ${appointments.length} appointments from PostgreSQL`);
      return appointments;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return [];
    }
  }

  static async createPayment(paymentData: {
    userId: string;
    amount: number;
    method: 'UPI' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'CASH';
    notes?: string;
  }) {
    try {
      const payment = await createPayment(paymentData);
      console.log('✅ Payment created in PostgreSQL:', payment.id);
      return payment;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  static async getPaymentsByUser(userId: string) {
    try {
      const payments = await getPaymentsByUser(userId);
      console.log(`✅ Fetched ${payments.length} payments from PostgreSQL`);
      return payments;
    } catch (error) {
      console.error('Error fetching payments:', error);
      return [];
    }
  }

  /**
   * ===== MONGODB OPERATIONS =====
   * Flexible schema for unstructured data
   */

  static async saveChatHistory(conversationData: {
    userId: string;
    message: string;
    role: 'user' | 'assistant';
    conversationId?: string;
  }) {
    try {
      const db = await connectToMongoDB();
      const collection = db.collection('chat_history');

      const result = await collection.insertOne({
        ...conversationData,
        createdAt: new Date(),
      });

      console.log('✅ Chat message saved to MongoDB:', result.insertedId);
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

      const history = await collection
        .find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();

      console.log(`✅ Fetched ${history.length} chat messages from MongoDB`);
      return history;
    } catch (error) {
      console.error('Error fetching chat history:', error);
      return [];
    }
  }

  static async saveAIResponse(responseData: {
    userId: string;
    prompt: string;
    response: string;
    model?: string;
    tokens?: number;
  }) {
    try {
      const db = await connectToMongoDB();
      const collection = db.collection('ai_responses');

      const result = await collection.insertOne({
        ...responseData,
        timestamp: new Date(),
      });

      console.log('✅ AI response saved to MongoDB:', result.insertedId);
      return result;
    } catch (error) {
      console.error('Error saving AI response:', error);
      throw error;
    }
  }

  static async saveMedicalRecord(recordData: {
    userId: string;
    recordType: 'lab_report' | 'prescription' | 'scan' | 'diagnosis' | 'other';
    data: Record<string, any>;
  }) {
    try {
      const db = await connectToMongoDB();
      const collection = db.collection('medical_records');

      const result = await collection.insertOne({
        ...recordData,
        createdAt: new Date(),
      });

      console.log('✅ Medical record saved to MongoDB:', result.insertedId);
      return result;
    } catch (error) {
      console.error('Error saving medical record:', error);
      throw error;
    }
  }

  static async getUserMedicalRecords(userId: string) {
    try {
      const db = await connectToMongoDB();
      const collection = db.collection('medical_records');

      const records = await collection
        .find({ userId })
        .sort({ createdAt: -1 })
        .toArray();

      console.log(`✅ Fetched ${records.length} medical records from MongoDB`);
      return records;
    } catch (error) {
      console.error('Error fetching medical records:', error);
      return [];
    }
  }

  /**
   * ===== HEALTH CHECK & UTILITIES =====
   */

  static async checkDatabaseHealth(): Promise<{
    firestore: boolean;
    postgresql: boolean;
    mongodb: boolean;
  }> {
    const health = {
      firestore: false,
      postgresql: false,
      mongodb: false,
    };

    // Check Firestore
    try {
      const { collection, getDocs, query, limit } = await import('firebase/firestore');
      const q = query(collection(firestoreDb, 'health_goals'), limit(1));
      await getDocs(q);
      health.firestore = true;
    } catch (error) {
      console.warn('Firestore health check failed');
    }

    // Check PostgreSQL
    try {
      await prisma.$queryRaw`SELECT 1`;
      health.postgresql = true;
    } catch (error) {
      console.warn('PostgreSQL health check failed');
    }

    // Check MongoDB
    try {
      const db = await connectToMongoDB();
      await db.admin().ping();
      health.mongodb = true;
    } catch (error) {
      console.warn('MongoDB health check failed');
    }

    return health;
  }

  static async logDatabaseMetrics(): Promise<void> {
    console.log('\n📊 Database Metrics:');
    const health = await this.checkDatabaseHealth();
    console.log('├─ Firestore:', health.firestore ? '✅ Online' : '❌ Offline');
    console.log('├─ PostgreSQL:', health.postgresql ? '✅ Online' : '❌ Offline');
    console.log('└─ MongoDB:', health.mongodb ? '✅ Online' : '❌ Offline');
  }
}

export default UnifiedDB;
