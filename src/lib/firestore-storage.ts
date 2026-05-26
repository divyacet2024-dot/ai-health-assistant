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

/**
 * Save a health log to Firestore
 */
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

/**
 * Get a specific health log by date
 */
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

/**
 * Get all health logs, optionally filtered by date range
 */
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
    return snapshot.docs
      .map((doc) => doc.data() as DailyHealthLog)
      .sort((a, b) => b.date.localeCompare(a.date));
  } catch (error) {
    console.error('Error fetching health logs:', error);
    return [];
  }
}

/**
 * Save health goals to Firestore
 */
export async function saveHealthGoals(goals: HealthGoals): Promise<void> {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const docRef = doc(
      db,
      USER_PROFILES_COLLECTION,
      userId,
      HEALTH_GOALS_COLLECTION,
      'current'
    );

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

/**
 * Get health goals from Firestore
 */
export async function getHealthGoals(): Promise<HealthGoals> {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) return DEFAULT_HEALTH_GOALS;

    const docRef = doc(
      db,
      USER_PROFILES_COLLECTION,
      userId,
      HEALTH_GOALS_COLLECTION,
      'current'
    );
    const snap = await getDoc(docRef);

    return snap.exists() ? (snap.data() as HealthGoals) : DEFAULT_HEALTH_GOALS;
  } catch (error) {
    console.error('Error fetching health goals:', error);
    return DEFAULT_HEALTH_GOALS;
  }
}

/**
 * Delete a health log
 */
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

/**
 * Export health data as JSON or CSV
 */
export async function exportHealthData(format: 'json' | 'csv'): Promise<string> {
  try {
    const logs = await getHealthLogs();

    if (format === 'json') {
      return JSON.stringify(logs, null, 2);
    }

    // CSV format
    const headers = [
      'Date',
      'Sleep Hours',
      'Sleep Quality',
      'Mood Level',
      'Mood Note',
      'Water Glasses',
      'Exercise Type',
      'Exercise Duration',
      'Exercise Intensity',
      'Breakfast',
      'Lunch',
      'Dinner',
      'Symptoms',
      'Symptom Severity',
    ];

    const rows = logs.map((log) => [
      log.date,
      log.sleep?.hours ?? '',
      log.sleep?.quality ?? '',
      log.mood?.level ?? '',
      log.mood?.note ?? '',
      log.water?.glasses ?? '',
      log.exercise?.type ?? '',
      log.exercise?.durationMinutes ?? '',
      log.exercise?.intensity ?? '',
      log.nutrition?.breakfast ?? '',
      log.nutrition?.lunch ?? '',
      log.nutrition?.dinner ?? '',
      log.symptoms?.symptoms?.join('; ') ?? '',
      log.symptoms?.severity ?? '',
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    return csv;
  } catch (error) {
    console.error('Error exporting health data:', error);
    throw error;
  }
}

/**
 * Calculate health streak from logs
 */
export async function getHealthStreak(): Promise<{
  current: number;
  longest: number;
  lastLogDate: string | null;
}> {
  try {
    const logs = await getHealthLogs();

    if (logs.length === 0) {
      return { current: 0, longest: 0, lastLogDate: null };
    }

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
  } catch (error) {
    console.error('Error calculating streak:', error);
    return { current: 0, longest: 0, lastLogDate: null };
  }
}

/**
 * Get health logs within a date range
 */
export async function getHealthLogsInRange(
  startDate: string,
  endDate: string
): Promise<DailyHealthLog[]> {
  try {
    return await getHealthLogs(startDate, endDate);
  } catch (error) {
    console.error('Error fetching logs in range:', error);
    return [];
  }
}
