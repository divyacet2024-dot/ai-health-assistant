import { DailyHealthLog, HealthGoals, DEFAULT_HEALTH_GOALS, StreakInfo } from './health-types';

const LOGS_KEY = 'aihealthassist_health_logs';
const GOALS_KEY = 'aihealthassist_health_goals';

export function getHealthLogs(): DailyHealthLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveHealthLogs(logs: DailyHealthLog[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
}

export function getHealthLogByDate(date: string): DailyHealthLog | undefined {
  return getHealthLogs().find((l) => l.date === date);
}

export function saveHealthLog(log: DailyHealthLog): void {
  const logs = getHealthLogs();
  const idx = logs.findIndex((l) => l.date === log.date);
  if (idx >= 0) {
    logs[idx] = { ...log, updatedAt: new Date().toISOString() };
  } else {
    logs.push(log);
  }
  logs.sort((a, b) => a.date.localeCompare(b.date));
  saveHealthLogs(logs);
}

export function getHealthGoals(): HealthGoals {
  if (typeof window === 'undefined') return DEFAULT_HEALTH_GOALS;
  try {
    const raw = localStorage.getItem(GOALS_KEY);
    return raw ? { ...DEFAULT_HEALTH_GOALS, ...JSON.parse(raw) } : DEFAULT_HEALTH_GOALS;
  } catch { return DEFAULT_HEALTH_GOALS; }
}

export function saveHealthGoals(goals: HealthGoals): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
}

export function getHealthStreak(): StreakInfo {
  const logs = getHealthLogs();
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

export function getHealthLogsInRange(startDate: string, endDate: string): DailyHealthLog[] {
  return getHealthLogs().filter((l) => l.date >= startDate && l.date <= endDate);
}

export function exportHealthData(format: 'csv' | 'json'): string {
  const logs = getHealthLogs();
  if (format === 'json') return JSON.stringify(logs, null, 2);

  const headers = [
    'Date', 'Sleep Hours', 'Sleep Quality', 'Mood Level', 'Mood Note',
    'Water Glasses', 'Exercise Type', 'Exercise Duration', 'Exercise Intensity',
    'Breakfast', 'Lunch', 'Dinner', 'Symptoms', 'Symptom Severity',
  ];
  const rows = logs.map((log) => [
    log.date, log.sleep?.hours ?? '', log.sleep?.quality ?? '',
    log.mood?.level ?? '', log.mood?.note ?? '',
    log.water?.glasses ?? '',
    log.exercise?.type ?? '', log.exercise?.durationMinutes ?? '', log.exercise?.intensity ?? '',
    log.nutrition?.breakfast ?? '', log.nutrition?.lunch ?? '', log.nutrition?.dinner ?? '',
    log.symptoms?.symptoms?.join('; ') ?? '', log.symptoms?.severity ?? '',
  ]);
  return [headers.join(','), ...rows.map((r) => r.map((v) => `"${v}"`).join(','))].join('\n');
}
