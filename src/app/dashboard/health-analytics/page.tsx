'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Moon, Smile, Droplets, Dumbbell, Apple, Stethoscope } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { getHealthLogs } from '@/lib/health-storage';
import { seedHealthData } from '@/lib/health-seed';
import { DailyHealthLog, MOOD_EMOJIS } from '@/lib/health-types';
import { cn } from '@/lib/utils';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid,
  Tooltip as ReTooltip, Legend,
} from 'recharts';

type TimeRange = 7 | 14 | 30;
type HabitTab = 'sleep' | 'mood' | 'water' | 'exercise' | 'nutrition' | 'symptoms';

const tabs: { id: HabitTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'sleep', label: 'Sleep', icon: Moon },
  { id: 'mood', label: 'Mood', icon: Smile },
  { id: 'water', label: 'Water', icon: Droplets },
  { id: 'exercise', label: 'Exercise', icon: Dumbbell },
  { id: 'nutrition', label: 'Nutrition', icon: Apple },
  { id: 'symptoms', label: 'Symptoms', icon: Stethoscope },
];

function getDateNDaysAgo(n: number): string {
  const d = new Date(); d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

export default function HealthAnalyticsPage() {
  const [logs, setLogs] = useState<DailyHealthLog[]>([]);
  const [range, setRange] = useState<TimeRange>(14);
  const [activeTab, setActiveTab] = useState<HabitTab>('sleep');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    seedHealthData(30);
    setLogs(getHealthLogs());
  }, []);

  const filteredLogs = useMemo(() => {
    const cutoff = getDateNDaysAgo(range);
    return logs.filter((l) => l.date >= cutoff).sort((a, b) => a.date.localeCompare(b.date));
  }, [logs, range]);

  if (!mounted) return null;

  return (
    <AppShell>
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight">Health Analytics</h1>
          <p className="text-muted-foreground mt-1">Visualize patterns in your daily health habits.</p>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="flex gap-1 bg-muted rounded-xl p-1">
            {([7, 14, 30] as TimeRange[]).map((r) => (
              <button key={r} onClick={() => setRange(r)}
                className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  range === r ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}>{r}D</button>
            ))}
          </div>
          <div className="flex gap-1 overflow-x-auto pb-1">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={cn('flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap',
                  activeTab === tab.id ? 'bg-primary/10 text-primary border border-primary/20' : 'text-muted-foreground hover:bg-muted border border-transparent'
                )}>
                <tab.icon className="w-4 h-4" />{tab.label}
              </button>
            ))}
          </div>
        </div>

        <motion.div key={`${activeTab}-${range}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-5">
          {activeTab === 'sleep' && <SleepChart logs={filteredLogs} />}
          {activeTab === 'mood' && <MoodChart logs={filteredLogs} />}
          {activeTab === 'water' && <WaterChart logs={filteredLogs} />}
          {activeTab === 'exercise' && <ExerciseChart logs={filteredLogs} />}
          {activeTab === 'nutrition' && <NutritionChart logs={filteredLogs} />}
          {activeTab === 'symptoms' && <SymptomsView logs={filteredLogs} />}
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <SummaryStats logs={filteredLogs} activeTab={activeTab} />
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-display font-semibold mb-4">Logging Heatmap (12 weeks)</h3>
          <Heatmap logs={logs} />
        </motion.div>
      </div>
    </AppShell>
  );
}

function SleepChart({ logs }: { logs: DailyHealthLog[] }) {
  const data = logs.filter((l) => l.sleep).map((l) => ({ date: l.date.slice(5), hours: l.sleep!.hours, quality: l.sleep!.quality }));
  return (
    <div>
      <h3 className="font-display font-semibold mb-4">Sleep Duration & Quality</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
            <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
            <ReTooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12 }} />
            <Legend />
            <Area type="monotone" dataKey="hours" stroke="var(--chart-1)" fill="url(#sleepGrad)" strokeWidth={2} name="Hours" />
            <Line type="monotone" dataKey="quality" stroke="var(--chart-4)" strokeWidth={2} dot={{ r: 3 }} name="Quality (1-5)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function MoodChart({ logs }: { logs: DailyHealthLog[] }) {
  const data = logs.filter((l) => l.mood).map((l) => ({ date: l.date.slice(5), mood: l.mood!.level }));
  return (
    <div>
      <h3 className="font-display font-semibold mb-4">Mood Over Time</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
            <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
            <ReTooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12 }} />
            <Line type="monotone" dataKey="mood" stroke="var(--chart-4)" strokeWidth={2.5} dot={{ r: 4, fill: 'var(--chart-4)' }} name="Mood Level" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function WaterChart({ logs }: { logs: DailyHealthLog[] }) {
  const data = logs.filter((l) => l.water).map((l) => ({ date: l.date.slice(5), glasses: l.water!.glasses }));
  return (
    <div>
      <h3 className="font-display font-semibold mb-4">Daily Water Intake</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
            <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
            <ReTooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12 }} />
            <Bar dataKey="glasses" fill="var(--chart-3)" radius={[6, 6, 0, 0]} name="Glasses" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ExerciseChart({ logs }: { logs: DailyHealthLog[] }) {
  const data = logs.map((l) => ({ date: l.date.slice(5), minutes: l.exercise?.durationMinutes ?? 0 }));
  return (
    <div>
      <h3 className="font-display font-semibold mb-4">Exercise Duration</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
            <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
            <ReTooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12 }} />
            <Bar dataKey="minutes" fill="var(--chart-2)" radius={[6, 6, 0, 0]} name="Minutes" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function NutritionChart({ logs }: { logs: DailyHealthLog[] }) {
  const data = logs.filter((l) => l.nutrition).map((l) => {
    const n = l.nutrition!;
    const meals = [n.breakfast, n.lunch, n.dinner];
    return { date: l.date.slice(5), healthy: meals.filter((m) => m === 'healthy').length, moderate: meals.filter((m) => m === 'moderate').length, unhealthy: meals.filter((m) => m === 'unhealthy').length };
  });
  return (
    <div>
      <h3 className="font-display font-semibold mb-4">Meal Quality Breakdown</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
            <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
            <ReTooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12 }} />
            <Legend />
            <Bar dataKey="healthy" stackId="a" fill="var(--chart-3)" name="Healthy" />
            <Bar dataKey="moderate" stackId="a" fill="var(--chart-2)" name="Moderate" />
            <Bar dataKey="unhealthy" stackId="a" fill="var(--destructive)" name="Unhealthy" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function SymptomsView({ logs }: { logs: DailyHealthLog[] }) {
  const symptomMap: Record<string, number> = {};
  logs.forEach((l) => { l.symptoms?.symptoms?.forEach((s) => { symptomMap[s] = (symptomMap[s] ?? 0) + 1; }); });
  const sorted = Object.entries(symptomMap).sort((a, b) => b[1] - a[1]);
  const maxCount = sorted.length > 0 ? sorted[0][1] : 1;

  return (
    <div>
      <h3 className="font-display font-semibold mb-4">Symptom Frequency</h3>
      {sorted.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Stethoscope className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No symptoms recorded in this period.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.slice(0, 10).map(([name, count]) => (
            <div key={name} className="flex items-center gap-3">
              <span className="text-sm w-28 truncate">{name}</span>
              <div className="flex-1 h-8 bg-muted rounded-lg overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${(count / maxCount) * 100}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="h-full bg-destructive/60 rounded-lg flex items-center justify-end pr-2">
                  <span className="text-xs font-medium">{count}x</span>
                </motion.div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SummaryStats({ logs, activeTab }: { logs: DailyHealthLog[]; activeTab: HabitTab }) {
  const stats = useMemo(() => {
    switch (activeTab) {
      case 'sleep': {
        const sl = logs.filter((l) => l.sleep);
        const avg = sl.length > 0 ? sl.reduce((s, l) => s + l.sleep!.hours, 0) / sl.length : 0;
        const best = sl.length > 0 ? Math.max(...sl.map((l) => l.sleep!.hours)) : 0;
        const worst = sl.length > 0 ? Math.min(...sl.map((l) => l.sleep!.hours)) : 0;
        return [{ label: 'Average', value: `${avg.toFixed(1)}h` }, { label: 'Best Night', value: `${best}h` }, { label: 'Worst Night', value: `${worst}h` }, { label: 'Days Logged', value: `${sl.length}` }];
      }
      case 'mood': {
        const ml = logs.filter((l) => l.mood);
        const avg = ml.length > 0 ? ml.reduce((s, l) => s + l.mood!.level, 0) / ml.length : 0;
        const good = ml.filter((l) => l.mood!.level >= 4).length;
        return [{ label: 'Average', value: `${avg.toFixed(1)}/5` }, { label: 'Good Days', value: `${good}` }, { label: 'Most Common', value: avg >= 3.5 ? '😊 Good' : avg >= 2.5 ? '😐 Okay' : '😔 Low' }, { label: 'Days Logged', value: `${ml.length}` }];
      }
      case 'water': {
        const wl = logs.filter((l) => l.water);
        const avg = wl.length > 0 ? wl.reduce((s, l) => s + l.water!.glasses, 0) / wl.length : 0;
        const goalMet = wl.filter((l) => l.water!.glasses >= 8).length;
        return [{ label: 'Average', value: `${avg.toFixed(1)} glasses` }, { label: 'Goal Met (8+)', value: `${goalMet} days` }, { label: 'Total', value: `${wl.reduce((s, l) => s + l.water!.glasses, 0)}` }, { label: 'Days Logged', value: `${wl.length}` }];
      }
      case 'exercise': {
        const el = logs.filter((l) => l.exercise);
        const total = el.reduce((s, l) => s + l.exercise!.durationMinutes, 0);
        const avgMin = el.length > 0 ? total / el.length : 0;
        return [{ label: 'Active Days', value: `${el.length}` }, { label: 'Avg Duration', value: `${avgMin.toFixed(0)} min` }, { label: 'Total', value: `${Math.round(total / 60)}h ${total % 60}m` }, { label: 'Rest Days', value: `${logs.length - el.length}` }];
      }
      case 'nutrition': {
        const nl = logs.filter((l) => l.nutrition);
        let h = 0, m = 0, u = 0;
        nl.forEach((l) => { const n = l.nutrition!; [n.breakfast, n.lunch, n.dinner].forEach((q) => { if (q === 'healthy') h++; else if (q === 'moderate') m++; else u++; }); });
        const t = h + m + u;
        return [{ label: 'Healthy', value: `${t > 0 ? ((h / t) * 100).toFixed(0) : 0}%` }, { label: 'Moderate', value: `${t > 0 ? ((m / t) * 100).toFixed(0) : 0}%` }, { label: 'Unhealthy', value: `${t > 0 ? ((u / t) * 100).toFixed(0) : 0}%` }, { label: 'Total Meals', value: `${t}` }];
      }
      case 'symptoms': {
        const symLogs = logs.filter((l) => l.symptoms && l.symptoms.symptoms.length > 0);
        const totalSym = symLogs.reduce((s, l) => s + (l.symptoms?.symptoms?.length ?? 0), 0);
        return [{ label: 'Days w/ Symptoms', value: `${symLogs.length}` }, { label: 'Total', value: `${totalSym}` }, { label: 'Symptom-Free', value: `${logs.length - symLogs.length}` }, { label: 'Avg/Day', value: symLogs.length > 0 ? `${(totalSym / symLogs.length).toFixed(1)}` : '0' }];
      }
    }
  }, [logs, activeTab]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat, i) => (
        <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
          className="bg-card border border-border rounded-2xl p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
          <p className="text-xl font-bold font-display">{stat.value}</p>
        </motion.div>
      ))}
    </div>
  );
}

function Heatmap({ logs }: { logs: DailyHealthLog[] }) {
  const logDates = new Set(logs.map((l) => l.date));
  const weeks: string[][] = [];
  const today = new Date();
  for (let w = 11; w >= 0; w--) {
    const week: string[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() - (w * 7 + (6 - d)));
      week.push(date.toISOString().split('T')[0]);
    }
    weeks.push(week);
  }
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1 min-w-fit">
        <div className="flex flex-col gap-1 mr-1">
          {dayLabels.map((d, i) => (
            <div key={i} className="w-4 h-4 flex items-center justify-center text-[9px] text-muted-foreground">
              {i % 2 === 1 ? d : ''}
            </div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((date) => (
              <div key={date}
                className={cn('w-4 h-4 rounded-sm transition-colors',
                  logDates.has(date) ? 'bg-primary/70 hover:bg-primary' : date <= today.toISOString().split('T')[0] ? 'bg-muted hover:bg-muted-foreground/20' : 'bg-transparent'
                )} title={`${date}${logDates.has(date) ? ' ✓' : ''}`} />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 text-[10px] text-muted-foreground">
        <span>Less</span>
        <div className="w-3 h-3 rounded-sm bg-muted" />
        <div className="w-3 h-3 rounded-sm bg-primary/40" />
        <div className="w-3 h-3 rounded-sm bg-primary/70" />
        <div className="w-3 h-3 rounded-sm bg-primary" />
        <span>More</span>
      </div>
    </div>
  );
}
