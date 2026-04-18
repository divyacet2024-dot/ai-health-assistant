import { DailyHealthLog, MoodLevel, MealQuality, ExerciseIntensity, EXERCISE_TYPES, SYMPTOM_OPTIONS } from './health-types';
import { saveHealthLogs, getHealthLogs } from './health-storage';

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(arr: readonly T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

function generateLog(dateStr: string): DailyHealthLog {
  const dayOfWeek = new Date(dateStr).getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  const sleepHours = isWeekend ? 6 + Math.random() * 3 : 5 + Math.random() * 3.5;
  const sleepQuality = sleepHours > 7 ? randomInt(3, 5) : randomInt(1, 3);
  const exercised = Math.random() > 0.3;
  const exerciseMinutes = exercised ? randomInt(15, 90) : 0;
  const moodBase = sleepHours > 7 ? 3 : 2;
  const exerciseBoost = exercised ? 1 : 0;
  const moodLevel = Math.min(5, Math.max(1, moodBase + exerciseBoost + randomInt(-1, 1))) as MoodLevel;
  const waterGlasses = randomInt(3, 12);
  const symptomChance = sleepHours < 6 ? 0.6 : 0.2;
  const hasSymptoms = Math.random() < symptomChance;
  const symptomCount = hasSymptoms ? randomInt(1, 3) : 0;
  const symptoms: string[] = [];
  for (let i = 0; i < symptomCount; i++) {
    const s = randomChoice(SYMPTOM_OPTIONS);
    if (!symptoms.includes(s)) symptoms.push(s);
  }
  const mealQualityOptions: MealQuality[] = ['healthy', 'moderate', 'unhealthy'];
  const mealBias = moodLevel >= 4 ? 0 : moodLevel >= 3 ? 1 : 2;

  return {
    id: `hlog-${dateStr}`,
    date: dateStr,
    sleep: { hours: Math.round(sleepHours * 10) / 10, quality: sleepQuality as MoodLevel },
    mood: { level: moodLevel, note: '' },
    water: { glasses: waterGlasses },
    exercise: exercised
      ? { type: randomChoice(EXERCISE_TYPES), durationMinutes: exerciseMinutes, intensity: randomChoice<ExerciseIntensity>(['light', 'moderate', 'intense']) }
      : undefined,
    nutrition: {
      breakfast: mealQualityOptions[Math.min(2, Math.max(0, mealBias + randomInt(-1, 1)))] ?? 'moderate',
      lunch: mealQualityOptions[Math.min(2, randomInt(0, 2))] ?? 'moderate',
      dinner: mealQualityOptions[Math.min(2, Math.max(0, mealBias + randomInt(0, 1)))] ?? 'moderate',
    },
    symptoms: hasSymptoms ? { symptoms, severity: randomInt(1, 3) as MoodLevel, note: '' } : undefined,
    createdAt: new Date(dateStr).toISOString(),
    updatedAt: new Date(dateStr).toISOString(),
  };
}

export function seedHealthData(days: number = 30): void {
  const existing = getHealthLogs();
  if (existing.length > 0) return;
  const logs: DailyHealthLog[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    if (Math.random() > 0.1) logs.push(generateLog(dateStr));
  }
  saveHealthLogs(logs);
}
