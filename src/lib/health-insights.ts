import { DailyHealthLog, HealthInsight, WeeklyHealthReport, HealthGoals } from './health-types';
import { getHealthLogsInRange } from './health-storage';

function fmt(d: Date): string { return d.toISOString().split('T')[0]; }

function getDateRange(days: number): { start: string; end: string } {
  const end = new Date(); const start = new Date();
  start.setDate(start.getDate() - days);
  return { start: fmt(start), end: fmt(end) };
}

export function generateHealthInsights(logs: DailyHealthLog[], goals: HealthGoals): HealthInsight[] {
  const insights: HealthInsight[] = [];
  if (logs.length < 3) return insights;

  const recent = logs.slice(-14);
  const sleepLogs = recent.filter((l) => l.sleep);
  const moodLogs = recent.filter((l) => l.mood);
  const waterLogs = recent.filter((l) => l.water);
  const avgSleep = sleepLogs.length > 0 ? sleepLogs.reduce((s, l) => s + (l.sleep?.hours ?? 0), 0) / sleepLogs.length : 0;
  const avgMood = moodLogs.length > 0 ? moodLogs.reduce((s, l) => s + (l.mood?.level ?? 0), 0) / moodLogs.length : 0;
  const avgWater = waterLogs.length > 0 ? waterLogs.reduce((s, l) => s + (l.water?.glasses ?? 0), 0) / waterLogs.length : 0;

  // Sleep-mood correlation
  const goodSleepDays = recent.filter((l) => l.sleep && l.sleep.hours >= 7 && l.mood);
  const badSleepDays = recent.filter((l) => l.sleep && l.sleep.hours < 6 && l.mood);
  if (goodSleepDays.length > 2 && badSleepDays.length > 1) {
    const goodMood = goodSleepDays.reduce((s, l) => s + (l.mood?.level ?? 0), 0) / goodSleepDays.length;
    const badMood = badSleepDays.reduce((s, l) => s + (l.mood?.level ?? 0), 0) / badSleepDays.length;
    if (goodMood - badMood > 0.5) {
      insights.push({ id: 'sleep-mood-corr', type: 'correlation', title: 'Sleep boosts your mood',
        description: `When you sleep 7+ hours, your mood averages ${goodMood.toFixed(1)}/5 vs ${badMood.toFixed(1)}/5 on shorter nights. Prioritize sleep tonight!`,
        icon: '🌙', category: 'sleep', priority: 'high', date: fmt(new Date()) });
    }
  }

  // Exercise-mood correlation
  const exerciseDays = recent.filter((l) => l.exercise && l.mood);
  const noExerciseDays = recent.filter((l) => !l.exercise && l.mood);
  if (exerciseDays.length > 2 && noExerciseDays.length > 1) {
    const exMood = exerciseDays.reduce((s, l) => s + (l.mood?.level ?? 0), 0) / exerciseDays.length;
    const noExMood = noExerciseDays.reduce((s, l) => s + (l.mood?.level ?? 0), 0) / noExerciseDays.length;
    if (exMood - noExMood > 0.3) {
      insights.push({ id: 'exercise-mood-corr', type: 'correlation', title: 'Exercise lifts your spirits',
        description: `Your mood is ${((exMood - noExMood) * 20).toFixed(0)}% higher on days you exercise. Even a short walk helps!`,
        icon: '🏃', category: 'exercise', priority: 'high', date: fmt(new Date()) });
    }
  }

  // Water-symptom correlation
  const lowWaterDays = recent.filter((l) => l.water && l.water.glasses < 5 && l.symptoms);
  const goodWaterDays = recent.filter((l) => l.water && l.water.glasses >= 7 && l.symptoms);
  if (lowWaterDays.length > 1) {
    const lowRate = lowWaterDays.filter((l) => (l.symptoms?.symptoms?.length ?? 0) > 0).length / lowWaterDays.length;
    const goodRate = goodWaterDays.length > 0 ? goodWaterDays.filter((l) => (l.symptoms?.symptoms?.length ?? 0) > 0).length / goodWaterDays.length : 0;
    if (lowRate > goodRate + 0.2) {
      insights.push({ id: 'water-symptoms-corr', type: 'correlation', title: 'Hydration reduces symptoms',
        description: `You report more symptoms on low-water days. Try to drink at least ${goals.waterGlasses} glasses daily.`,
        icon: '💧', category: 'water', priority: 'medium', date: fmt(new Date()) });
    }
  }

  // Sleep trend
  if (avgSleep < goals.sleepHours - 1) {
    insights.push({ id: 'sleep-below-goal', type: 'warning', title: 'Sleep is below your goal',
      description: `You're averaging ${avgSleep.toFixed(1)} hours, but your goal is ${goals.sleepHours}h. Try winding down 30 min earlier.`,
      icon: '⚠️', category: 'sleep', priority: 'high', date: fmt(new Date()) });
  } else if (avgSleep >= goals.sleepHours) {
    insights.push({ id: 'sleep-on-track', type: 'achievement', title: 'Sleep goal on track!',
      description: `Great work! You're averaging ${avgSleep.toFixed(1)} hours of sleep, meeting your ${goals.sleepHours}h goal.`,
      icon: '🎉', category: 'sleep', priority: 'low', date: fmt(new Date()) });
  }

  // Water trend
  if (avgWater < goals.waterGlasses - 2) {
    insights.push({ id: 'water-below-goal', type: 'warning', title: 'Drink more water',
      description: `You're averaging ${avgWater.toFixed(1)} glasses/day. Your goal is ${goals.waterGlasses}. Keep a water bottle nearby.`,
      icon: '💧', category: 'water', priority: 'medium', date: fmt(new Date()) });
  }

  // Top symptoms
  const symptomMap: Record<string, number> = {};
  recent.forEach((l) => { l.symptoms?.symptoms?.forEach((s) => { symptomMap[s] = (symptomMap[s] ?? 0) + 1; }); });
  const topSymptom = Object.entries(symptomMap).sort((a, b) => b[1] - a[1])[0];
  if (topSymptom && topSymptom[1] >= 3) {
    insights.push({ id: 'recurring-symptom', type: 'warning', title: `Recurring: ${topSymptom[0]}`,
      description: `${topSymptom[0]} appeared ${topSymptom[1]} times in the last 2 weeks. Consider discussing with your healthcare provider.`,
      icon: '🩺', category: 'symptoms', priority: 'high', date: fmt(new Date()) });
  }

  // Nutrition quality
  const mealLogs = recent.filter((l) => l.nutrition);
  if (mealLogs.length > 3) {
    let healthyCount = 0; let totalMeals = 0;
    mealLogs.forEach((l) => {
      if (l.nutrition) {
        (['breakfast', 'lunch', 'dinner'] as const).forEach((m) => { totalMeals++; if (l.nutrition![m] === 'healthy') healthyCount++; });
      }
    });
    const healthyPct = (healthyCount / totalMeals) * 100;
    if (healthyPct >= 60) {
      insights.push({ id: 'nutrition-good', type: 'achievement', title: 'Eating well!',
        description: `${healthyPct.toFixed(0)}% of your meals are rated healthy. Keep it up!`,
        icon: '🥗', category: 'nutrition', priority: 'low', date: fmt(new Date()) });
    } else if (healthyPct < 30) {
      insights.push({ id: 'nutrition-low', type: 'tip', title: 'Nutrition could improve',
        description: `Only ${healthyPct.toFixed(0)}% of your meals are rated healthy. Try adding one healthy meal per day.`,
        icon: '🍎', category: 'nutrition', priority: 'medium', date: fmt(new Date()) });
    }
  }

  // Mood trend
  if (avgMood >= 4) {
    insights.push({ id: 'mood-positive', type: 'achievement', title: 'Positive mood streak!',
      description: `Your average mood is ${avgMood.toFixed(1)}/5 — you're doing great! Keep up the healthy routines.`,
      icon: '☀️', category: 'mood', priority: 'low', date: fmt(new Date()) });
  } else if (avgMood < 2.5) {
    insights.push({ id: 'mood-low', type: 'tip', title: 'Low mood detected',
      description: `Your mood has been trending low (${avgMood.toFixed(1)}/5). Consider talking to someone or trying a mood-lifting activity.`,
      icon: '💛', category: 'mood', priority: 'high', date: fmt(new Date()) });
  }

  // Exercise consistency
  const exerciseCount = recent.filter((l) => l.exercise).length;
  const exercisePct = (exerciseCount / recent.length) * 7;
  if (exercisePct >= goals.exerciseDaysPerWeek) {
    insights.push({ id: 'exercise-consistent', type: 'achievement', title: 'Exercise consistency!',
      description: `You're hitting about ${exercisePct.toFixed(1)} exercise days/week — matching your ${goals.exerciseDaysPerWeek}-day goal!`,
      icon: '💪', category: 'exercise', priority: 'low', date: fmt(new Date()) });
  }

  return insights;
}

export function generateWeeklyHealthReport(weekOffset: number = 0, goals: HealthGoals): WeeklyHealthReport {
  const now = new Date();
  const weekEnd = new Date(now); weekEnd.setDate(weekEnd.getDate() - weekOffset * 7);
  const weekStart = new Date(weekEnd); weekStart.setDate(weekStart.getDate() - 6);
  const prevWeekEnd = new Date(weekStart); prevWeekEnd.setDate(prevWeekEnd.getDate() - 1);
  const prevWeekStart = new Date(prevWeekEnd); prevWeekStart.setDate(prevWeekStart.getDate() - 6);

  const currentLogs = getHealthLogsInRange(fmt(weekStart), fmt(weekEnd));
  const prevLogs = getHealthLogsInRange(fmt(prevWeekStart), fmt(prevWeekEnd));

  function avg(logs: DailyHealthLog[], fn: (l: DailyHealthLog) => number | undefined): number {
    const vals = logs.map(fn).filter((v) => v !== undefined) as number[];
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  }

  const avgSleep = avg(currentLogs, (l) => l.sleep?.hours);
  const avgMood = avg(currentLogs, (l) => l.mood?.level);
  const avgWater = avg(currentLogs, (l) => l.water?.glasses);
  const totalExMin = currentLogs.reduce((s, l) => s + (l.exercise?.durationMinutes ?? 0), 0);
  const exDays = currentLogs.filter((l) => l.exercise).length;
  const prevAvgSleep = avg(prevLogs, (l) => l.sleep?.hours);
  const prevAvgMood = avg(prevLogs, (l) => l.mood?.level);
  const prevAvgWater = avg(prevLogs, (l) => l.water?.glasses);
  const prevTotalExMin = prevLogs.reduce((s, l) => s + (l.exercise?.durationMinutes ?? 0), 0);

  const symptomMap: Record<string, number> = {};
  currentLogs.forEach((l) => { l.symptoms?.symptoms?.forEach((s) => { symptomMap[s] = (symptomMap[s] ?? 0) + 1; }); });
  const topSymptoms = Object.entries(symptomMap).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }));

  let healthy = 0, moderate = 0, unhealthy = 0;
  currentLogs.forEach((l) => {
    if (l.nutrition) {
      (['breakfast', 'lunch', 'dinner'] as const).forEach((m) => {
        const val = l.nutrition![m]; if (val === 'healthy') healthy++; else if (val === 'moderate') moderate++; else unhealthy++;
      });
    }
  });

  return {
    weekStart: fmt(weekStart), weekEnd: fmt(weekEnd), avgSleep, avgMood, avgWater,
    totalExerciseMinutes: totalExMin, exerciseDays: exDays, topSymptoms,
    mealQualityBreakdown: { healthy, moderate, unhealthy },
    comparedToLastWeek: {
      sleep: prevAvgSleep > 0 ? ((avgSleep - prevAvgSleep) / prevAvgSleep) * 100 : 0,
      mood: prevAvgMood > 0 ? ((avgMood - prevAvgMood) / prevAvgMood) * 100 : 0,
      water: prevAvgWater > 0 ? ((avgWater - prevAvgWater) / prevAvgWater) * 100 : 0,
      exercise: prevTotalExMin > 0 ? ((totalExMin - prevTotalExMin) / prevTotalExMin) * 100 : 0,
    },
    insights: generateHealthInsights(currentLogs, goals),
  };
}

export function getRecentHealthInsights(goals: HealthGoals): HealthInsight[] {
  const { start, end } = getDateRange(14);
  const logs = getHealthLogsInRange(start, end);
  return generateHealthInsights(logs, goals);
}
