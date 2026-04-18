export type MoodLevel = 1 | 2 | 3 | 4 | 5;
export type MealQuality = 'healthy' | 'moderate' | 'unhealthy';
export type ExerciseIntensity = 'light' | 'moderate' | 'intense';

export interface SleepEntry {
  hours: number;
  quality: MoodLevel;
}

export interface MoodEntry {
  level: MoodLevel;
  note?: string;
}

export interface WaterEntry {
  glasses: number;
}

export interface ExerciseEntry {
  type: string;
  durationMinutes: number;
  intensity: ExerciseIntensity;
}

export interface MealEntry {
  breakfast: MealQuality;
  lunch: MealQuality;
  dinner: MealQuality;
}

export interface SymptomEntry {
  symptoms: string[];
  severity: MoodLevel;
  note?: string;
}

export interface DailyHealthLog {
  id: string;
  date: string; // YYYY-MM-DD
  sleep?: SleepEntry;
  mood?: MoodEntry;
  water?: WaterEntry;
  exercise?: ExerciseEntry;
  nutrition?: MealEntry;
  symptoms?: SymptomEntry;
  createdAt: string;
  updatedAt: string;
}

export interface HealthGoals {
  sleepHours: number;
  waterGlasses: number;
  exerciseMinutes: number;
  exerciseDaysPerWeek: number;
}

export interface HealthInsight {
  id: string;
  type: 'correlation' | 'trend' | 'achievement' | 'warning' | 'tip';
  title: string;
  description: string;
  icon: string;
  category: 'sleep' | 'mood' | 'water' | 'exercise' | 'nutrition' | 'symptoms' | 'general';
  priority: 'high' | 'medium' | 'low';
  date: string;
}

export interface WeeklyHealthReport {
  weekStart: string;
  weekEnd: string;
  avgSleep: number;
  avgMood: number;
  avgWater: number;
  totalExerciseMinutes: number;
  exerciseDays: number;
  topSymptoms: { name: string; count: number }[];
  mealQualityBreakdown: { healthy: number; moderate: number; unhealthy: number };
  comparedToLastWeek: {
    sleep: number;
    mood: number;
    water: number;
    exercise: number;
  };
  insights: HealthInsight[];
}

export interface StreakInfo {
  current: number;
  longest: number;
  lastLogDate: string | null;
}

export const SYMPTOM_OPTIONS = [
  'Headache', 'Fatigue', 'Stress', 'Anxiety', 'Back Pain',
  'Nausea', 'Insomnia', 'Sore Throat', 'Dizziness', 'Bloating',
  'Joint Pain', 'Muscle Ache', 'Brain Fog', 'Allergies', 'Cramps',
  'Eye Strain', 'Low Energy', 'Irritability',
] as const;

export const EXERCISE_TYPES = [
  'Walking', 'Running', 'Cycling', 'Swimming', 'Yoga',
  'Weight Training', 'HIIT', 'Stretching', 'Dance', 'Sports',
  'Hiking', 'Pilates', 'Martial Arts', 'Other',
] as const;

export const MOOD_EMOJIS: Record<MoodLevel, { emoji: string; label: string }> = {
  1: { emoji: '😢', label: 'Terrible' },
  2: { emoji: '😔', label: 'Bad' },
  3: { emoji: '😐', label: 'Okay' },
  4: { emoji: '😊', label: 'Good' },
  5: { emoji: '🤩', label: 'Great' },
};

export const DEFAULT_HEALTH_GOALS: HealthGoals = {
  sleepHours: 8,
  waterGlasses: 8,
  exerciseMinutes: 30,
  exerciseDaysPerWeek: 5,
};
