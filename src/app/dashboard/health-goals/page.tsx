'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Target, Flame, Trophy, Moon, Droplets, Dumbbell,
  Check, Download, Trash2, AlertTriangle,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { getHealthGoals, saveHealthGoals, getHealthStreak, getHealthLogs, exportHealthData } from '@/lib/health-storage';
import { seedHealthData } from '@/lib/health-seed';
import { HealthGoals, DEFAULT_HEALTH_GOALS, StreakInfo, DailyHealthLog, MOOD_EMOJIS } from '@/lib/health-types';
import { cn } from '@/lib/utils';

const BADGES = [
  { id: 'first-log', icon: '🎯', label: 'First Log', desc: 'Logged your first day', check: (logs: DailyHealthLog[]) => logs.length >= 1 },
  { id: 'week-streak', icon: '🔥', label: '7-Day Streak', desc: 'Logged 7 days in a row', check: (_: DailyHealthLog[], streak: StreakInfo) => streak.longest >= 7 },
  { id: 'two-week', icon: '⭐', label: '14-Day Streak', desc: 'Logged 14 days in a row', check: (_: DailyHealthLog[], streak: StreakInfo) => streak.longest >= 14 },
  { id: 'month', icon: '🏆', label: 'Monthly Champion', desc: 'Logged 30 days in a row', check: (_: DailyHealthLog[], streak: StreakInfo) => streak.longest >= 30 },
  { id: 'hydrated', icon: '💧', label: 'Hydration Hero', desc: 'Hit water goal 7+ days', check: (logs: DailyHealthLog[]) => logs.filter((l) => l.water && l.water.glasses >= 8).length >= 7 },
  { id: 'athlete', icon: '🏃', label: 'Active Athlete', desc: 'Exercised 20+ days', check: (logs: DailyHealthLog[]) => logs.filter((l) => l.exercise).length >= 20 },
  { id: 'sleeper', icon: '🌙', label: 'Sleep Master', desc: '8+ hours sleep for 7 days', check: (logs: DailyHealthLog[]) => logs.filter((l) => l.sleep && l.sleep.hours >= 8).length >= 7 },
  { id: 'happy', icon: '😊', label: 'Good Vibes', desc: 'Mood 4+ for 10 days', check: (logs: DailyHealthLog[]) => logs.filter((l) => l.mood && l.mood.level >= 4).length >= 10 },
];

export default function HealthGoalsPage() {
  const [goals, setGoals] = useState<HealthGoals>(DEFAULT_HEALTH_GOALS);
  const [streak, setStreak] = useState<StreakInfo>({ current: 0, longest: 0, lastLogDate: null });
  const [logs, setLogs] = useState<DailyHealthLog[]>([]);
  const [mounted, setMounted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    setMounted(true);
    seedHealthData(30);
    setGoals(getHealthGoals());
    setStreak(getHealthStreak());
    setLogs(getHealthLogs());
  }, []);

  function handleGoalChange(newGoals: HealthGoals) {
    setGoals(newGoals);
    saveHealthGoals(newGoals);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  function handleExport(format: 'csv' | 'json') {
    const data = exportHealthData(format);
    const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health-data.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleClear() {
    localStorage.removeItem('aihealthassist_health_logs');
    localStorage.removeItem('aihealthassist_health_goals');
    setShowClearConfirm(false);
    window.location.reload();
  }

  if (!mounted) return null;

  const earnedBadges = BADGES.filter((b) => b.check(logs, streak));

  return (
    <AppShell>
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight">Goals & Streaks</h1>
          <p className="text-muted-foreground mt-1">Set targets, track streaks, and earn achievement badges.</p>
        </motion.div>

        {/* Streak Banner */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-primary/10 via-accent/10 to-chart-4/10 border border-border rounded-2xl p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center shrink-0">
            <Flame className="w-8 h-8 text-accent" />
          </div>
          <div className="flex-1">
            <p className="font-display font-extrabold text-3xl">{streak.current}-day streak</p>
            <p className="text-sm text-muted-foreground mt-1">
              {streak.current > 0
                ? `Keep going! Your longest streak is ${streak.longest} days.`
                : 'Start logging today to build your streak!'}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-muted-foreground">
            <Trophy className="w-6 h-6 text-accent" />
            <div className="text-right">
              <p className="text-xl font-bold font-display">{streak.longest}d</p>
              <p className="text-[10px]">Best streak</p>
            </div>
          </div>
        </motion.div>

        {/* Goals */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Target className="w-4.5 h-4.5 text-primary" />
            </div>
            <h2 className="font-display font-semibold">Daily Goals</h2>
          </div>
          <div className="space-y-5">
            <GoalSlider icon={Moon} label="Sleep Goal" value={goals.sleepHours} min={4} max={12} step={0.5} unit="hours" color="text-chart-1"
              onChange={(v) => handleGoalChange({ ...goals, sleepHours: v })} />
            <GoalSlider icon={Droplets} label="Water Goal" value={goals.waterGlasses} min={2} max={16} step={1} unit="glasses" color="text-chart-3"
              onChange={(v) => handleGoalChange({ ...goals, waterGlasses: v })} />
            <GoalSlider icon={Dumbbell} label="Exercise Duration" value={goals.exerciseMinutes} min={10} max={120} step={5} unit="min/day" color="text-chart-2"
              onChange={(v) => handleGoalChange({ ...goals, exerciseMinutes: v })} />
            <GoalSlider icon={Dumbbell} label="Exercise Days/Week" value={goals.exerciseDaysPerWeek} min={1} max={7} step={1} unit="days" color="text-chart-2"
              onChange={(v) => handleGoalChange({ ...goals, exerciseDaysPerWeek: v })} />
          </div>
        </motion.div>

        {/* Achievement Badges */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
              <Trophy className="w-4.5 h-4.5 text-accent" />
            </div>
            <h2 className="font-display font-semibold">Achievement Badges</h2>
            <span className="text-xs text-muted-foreground ml-auto">{earnedBadges.length}/{BADGES.length} earned</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {BADGES.map((badge) => {
              const earned = badge.check(logs, streak);
              return (
                <div key={badge.id} className={cn(
                  'flex flex-col items-center p-4 rounded-xl border text-center transition-all',
                  earned ? 'bg-accent/5 border-accent/30' : 'border-border opacity-40'
                )}>
                  <span className="text-3xl mb-2">{badge.icon}</span>
                  <p className="text-xs font-semibold">{badge.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{badge.desc}</p>
                  {earned && <Check className="w-4 h-4 text-accent mt-1" />}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Data Management */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-chart-1/10 flex items-center justify-center">
              <Download className="w-4.5 h-4.5 text-chart-1" />
            </div>
            <h2 className="font-display font-semibold">Health Data</h2>
          </div>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{logs.length} entries recorded</p>
            <div className="flex gap-3">
              <button onClick={() => handleExport('csv')}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-border hover:bg-muted transition text-sm font-medium">
                <Download className="w-4 h-4" /> Export CSV
              </button>
              <button onClick={() => handleExport('json')}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-border hover:bg-muted transition text-sm font-medium">
                <Download className="w-4 h-4" /> Export JSON
              </button>
            </div>
            {showClearConfirm ? (
              <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  <p className="text-sm font-semibold text-destructive">Delete all health data?</p>
                </div>
                <p className="text-xs text-muted-foreground mb-3">This cannot be undone.</p>
                <div className="flex gap-2">
                  <button onClick={handleClear} className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-xs font-medium hover:opacity-90">Yes, Delete</button>
                  <button onClick={() => setShowClearConfirm(false)} className="px-4 py-2 border border-border rounded-lg text-xs font-medium hover:bg-muted">Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowClearConfirm(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-destructive/30 text-destructive hover:bg-destructive/5 transition text-sm font-medium">
                <Trash2 className="w-4 h-4" /> Clear Health Data
              </button>
            )}
          </div>
        </motion.div>

        {saved && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-6 right-6 bg-chart-3 text-primary-foreground px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 z-50">
            <Check className="w-4 h-4" /> <span className="text-sm font-medium">Goals saved</span>
          </motion.div>
        )}
      </div>
    </AppShell>
  );
}

function GoalSlider({ icon: Icon, label, value, min, max, step, unit, color, onChange }: {
  icon: React.ComponentType<{ className?: string }>; label: string; value: number; min: number; max: number; step: number; unit: string; color: string; onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className={cn('w-4 h-4', color)} />
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
        <span className="text-sm font-bold font-display">{value} {unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full accent-[var(--primary)]" />
      <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
        <span>{min} {unit}</span><span>{max} {unit}</span>
      </div>
    </div>
  );
}
