'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  MessageSquare, Calendar, Pill, FileText, CreditCard,
  BookOpen, Video, ClipboardList, Users, Heart,
  ArrowRight, TrendingUp, TrendingDown, Minus, Clock, Star, Bell,
  Moon, Smile, Droplets, Dumbbell, Apple, Stethoscope,
  PenLine, BarChart3, Lightbulb, Target, Flame, Trophy,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { cn } from '@/lib/utils';
import { UserRole, ROLES } from '@/lib/types';
import { getRole } from '@/lib/store';
import { MOCK_APPOINTMENTS, PATIENTS, STUDENT_QUERIES, STUDY_NOTES } from '@/lib/mock-data';
import { getHealthLogs, getHealthLogByDate, getHealthStreak, getHealthGoals } from '@/lib/health-storage';
import { getRecentHealthInsights } from '@/lib/health-insights';
import { seedHealthData } from '@/lib/health-seed';
import { DailyHealthLog, HealthInsight, StreakInfo, MOOD_EMOJIS } from '@/lib/health-types';
import { LineChart, Line, ResponsiveContainer, XAxis, Tooltip as ReTooltip } from 'recharts';

type QuickAction = { href: string; icon: React.ComponentType<{ className?: string }>; label: string; desc: string; color: string };

const PATIENT_ACTIONS: QuickAction[] = [
  { href: '/dashboard/health-log', icon: PenLine, label: 'Log Today', desc: 'Record health habits', color: 'bg-chart-1/10 text-chart-1' },
  { href: '/dashboard/health-analytics', icon: BarChart3, label: 'Analytics', desc: 'View your trends', color: 'bg-chart-2/10 text-chart-2' },
  { href: '/dashboard/health-insights', icon: Lightbulb, label: 'Insights', desc: 'AI-powered tips', color: 'bg-chart-4/10 text-chart-4' },
  { href: '/dashboard/chat', icon: MessageSquare, label: 'AI Health Chat', desc: 'Ask health questions', color: 'bg-chart-3/10 text-chart-3' },
  { href: '/dashboard/appointments', icon: Calendar, label: 'Appointments', desc: 'Book a visit', color: 'bg-chart-5/10 text-chart-5' },
  { href: '/dashboard/medicine', icon: Pill, label: 'Medicine Info', desc: 'Search medicines', color: 'bg-primary/10 text-primary' },
];

const STUDENT_ACTIONS: QuickAction[] = [
  { href: '/dashboard/chat', icon: MessageSquare, label: 'AI Tutor', desc: 'Ask study doubts', color: 'bg-chart-1/10 text-chart-1' },
  { href: '/dashboard/resources', icon: BookOpen, label: 'Study Notes', desc: 'Notes & papers', color: 'bg-chart-2/10 text-chart-2' },
  { href: '/dashboard/videos', icon: Video, label: 'Video Lectures', desc: 'Watch & learn', color: 'bg-chart-3/10 text-chart-3' },
  { href: '/dashboard/planner', icon: ClipboardList, label: 'Study Planner', desc: 'Plan your week', color: 'bg-chart-4/10 text-chart-4' },
];

const DOCTOR_ACTIONS: QuickAction[] = [
  { href: '/dashboard/chat', icon: MessageSquare, label: 'AI Assistant', desc: 'Clinical queries', color: 'bg-chart-1/10 text-chart-1' },
  { href: '/dashboard/appointments', icon: Calendar, label: 'Appointments', desc: 'Manage schedule', color: 'bg-chart-2/10 text-chart-2' },
  { href: '/dashboard/patients', icon: Users, label: 'Patient List', desc: 'View patients', color: 'bg-chart-3/10 text-chart-3' },
  { href: '/dashboard/reports', icon: FileText, label: 'Reports', desc: 'Digital reports', color: 'bg-chart-4/10 text-chart-4' },
];

const PROFESSOR_ACTIONS: QuickAction[] = [
  { href: '/dashboard/chat', icon: MessageSquare, label: 'AI Assistant', desc: 'Teaching queries', color: 'bg-chart-1/10 text-chart-1' },
  { href: '/dashboard/queries', icon: MessageSquare, label: 'Student Queries', desc: 'Answer doubts', color: 'bg-chart-2/10 text-chart-2' },
  { href: '/dashboard/materials', icon: BookOpen, label: 'Materials', desc: 'Share resources', color: 'bg-chart-3/10 text-chart-3' },
  { href: '/dashboard/schedule', icon: Calendar, label: 'Class Schedule', desc: 'Manage classes', color: 'bg-chart-4/10 text-chart-4' },
];

const ACTIONS_MAP: Record<UserRole, QuickAction[]> = {
  patient: PATIENT_ACTIONS, student: STUDENT_ACTIONS, doctor: DOCTOR_ACTIONS, professor: PROFESSOR_ACTIONS,
};

function SparklineCard({ title, data, color }: { title: string; data: { date: string; value: number }[]; color: string }) {
  const trend = data.length >= 2 ? data[data.length - 1].value - data[data.length - 2].value : 0;
  const avg = data.length > 0 ? data.reduce((s, d) => s + d.value, 0) / data.length : 0;
  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-muted-foreground">{title}</p>
        {trend > 0 ? <TrendingUp className="w-3.5 h-3.5 text-chart-3" /> : trend < 0 ? <TrendingDown className="w-3.5 h-3.5 text-destructive" /> : <Minus className="w-3.5 h-3.5 text-muted-foreground" />}
      </div>
      <p className="text-2xl font-bold font-display mb-1">{avg.toFixed(1)}</p>
      <div className="h-12">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
            <XAxis dataKey="date" hide />
            <ReTooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [role, setRoleState] = useState<UserRole | null>(null);
  const [mounted, setMounted] = useState(false);
  const [todayLog, setTodayLog] = useState<DailyHealthLog | undefined>();
  const [streak, setStreak] = useState<StreakInfo>({ current: 0, longest: 0, lastLogDate: null });
  const [insights, setInsights] = useState<HealthInsight[]>([]);
  const [healthLogs, setHealthLogs] = useState<DailyHealthLog[]>([]);

  useEffect(() => {
    setMounted(true);
    setRoleState(getRole());
    seedHealthData(30);
    const today = new Date().toISOString().split('T')[0];
    setTodayLog(getHealthLogByDate(today));
    setStreak(getHealthStreak());
    const goals = getHealthGoals();
    setInsights(getRecentHealthInsights(goals));
    setHealthLogs(getHealthLogs());
  }, []);

  const sparklineData = useMemo(() => {
    const recent = healthLogs.slice(-7);
    return {
      sleep: recent.filter((l) => l.sleep).map((l) => ({ date: l.date.slice(5), value: l.sleep!.hours })),
      mood: recent.filter((l) => l.mood).map((l) => ({ date: l.date.slice(5), value: l.mood!.level })),
      water: recent.filter((l) => l.water).map((l) => ({ date: l.date.slice(5), value: l.water!.glasses })),
      exercise: recent.filter((l) => l.exercise).map((l) => ({ date: l.date.slice(5), value: l.exercise!.durationMinutes })),
    };
  }, [healthLogs]);

  if (!mounted || !role) return null;

  const roleInfo = ROLES[role];
  const actions = ACTIONS_MAP[role];
  const goals = getHealthGoals();

  return (
    <AppShell>
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{roleInfo.icon}</span>
            <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}
            </h1>
          </div>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} · {roleInfo.label}
          </p>
        </motion.div>

        {/* Patient-only: Health Summary */}
        {role === 'patient' && (
          <>
            {/* Streak */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-gradient-to-r from-primary/10 via-accent/10 to-chart-4/10 border border-border rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                <Flame className="w-6 h-6 text-accent" />
              </div>
              <div className="flex-1">
                <p className="font-display font-bold text-lg">{streak.current}-day streak</p>
                <p className="text-sm text-muted-foreground">
                  {streak.current > 0 ? `Longest: ${streak.longest} days` : 'Log today to start your streak!'}
                </p>
              </div>
              <Link href="/dashboard/health-log" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition shadow-md">
                <PenLine className="w-4 h-4" /> Log Today
              </Link>
            </motion.div>

            {/* Today's Summary */}
            <div>
              <h2 className="text-lg font-display font-semibold mb-3">Today&apos;s Health</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                {[
                  { icon: Moon, label: 'Sleep', value: todayLog?.sleep ? `${todayLog.sleep.hours}h` : '—', goal: `${goals.sleepHours}h`, pct: todayLog?.sleep ? (todayLog.sleep.hours / goals.sleepHours) * 100 : 0, color: 'text-chart-1', bg: 'bg-chart-1/10' },
                  { icon: Smile, label: 'Mood', value: todayLog?.mood ? MOOD_EMOJIS[todayLog.mood.level].emoji : '—', goal: '', pct: todayLog?.mood ? (todayLog.mood.level / 5) * 100 : 0, color: 'text-chart-4', bg: 'bg-chart-4/10' },
                  { icon: Droplets, label: 'Water', value: todayLog?.water ? `${todayLog.water.glasses}` : '—', goal: `${goals.waterGlasses}`, pct: todayLog?.water ? (todayLog.water.glasses / goals.waterGlasses) * 100 : 0, color: 'text-chart-3', bg: 'bg-chart-3/10' },
                  { icon: Dumbbell, label: 'Exercise', value: todayLog?.exercise ? `${todayLog.exercise.durationMinutes}m` : '—', goal: `${goals.exerciseMinutes}m`, pct: todayLog?.exercise ? (todayLog.exercise.durationMinutes / goals.exerciseMinutes) * 100 : 0, color: 'text-chart-2', bg: 'bg-chart-2/10' },
                  { icon: Apple, label: 'Nutrition', value: todayLog?.nutrition ? [todayLog.nutrition.breakfast, todayLog.nutrition.lunch, todayLog.nutrition.dinner].filter((m) => m === 'healthy').length + '/3' : '—', goal: '', pct: todayLog?.nutrition ? ([todayLog.nutrition.breakfast, todayLog.nutrition.lunch, todayLog.nutrition.dinner].filter((m) => m === 'healthy').length / 3) * 100 : 0, color: 'text-chart-5', bg: 'bg-chart-5/10' },
                  { icon: Stethoscope, label: 'Symptoms', value: todayLog?.symptoms ? `${todayLog.symptoms.symptoms.length}` : 'None', goal: '', pct: 0, color: 'text-destructive', bg: 'bg-destructive/10' },
                ].map((item, i) => (
                  <motion.div key={item.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.04 }}
                    className="bg-card border border-border rounded-2xl p-4 hover:shadow-md transition-shadow">
                    <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', item.bg)}>
                      <item.icon className={cn('w-4.5 h-4.5', item.color)} />
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                    <p className="text-lg font-semibold font-display">{item.value}</p>
                    {item.goal && (
                      <div className="mt-2">
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className={cn('h-full rounded-full transition-all duration-700', item.color.replace('text-', 'bg-'))}
                            style={{ width: `${Math.min(100, item.pct)}%` }} />
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">Goal: {item.goal}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* 7-Day Sparklines */}
            <div>
              <h2 className="text-lg font-display font-semibold mb-3">7-Day Trends</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <SparklineCard title="Sleep (hours)" data={sparklineData.sleep} color="var(--chart-1)" />
                <SparklineCard title="Mood (1-5)" data={sparklineData.mood} color="var(--chart-4)" />
                <SparklineCard title="Water (glasses)" data={sparklineData.water} color="var(--chart-3)" />
                <SparklineCard title="Exercise (min)" data={sparklineData.exercise} color="var(--chart-2)" />
              </div>
            </div>

            {/* Top Insights */}
            {insights.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-display font-semibold">Top Insights</h2>
                  <Link href="/dashboard/health-insights" className="text-sm text-primary flex items-center gap-1 hover:underline">
                    View all <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <div className="grid md:grid-cols-3 gap-3">
                  {insights.slice(0, 3).map((insight) => (
                    <div key={insight.id} className={cn('bg-card border border-border rounded-2xl p-4 border-l-4',
                      insight.priority === 'high' ? 'border-l-destructive' : insight.priority === 'medium' ? 'border-l-accent' : 'border-l-chart-3'
                    )}>
                      <div className="flex items-start gap-3">
                        <span className="text-xl">{insight.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm">{insight.title}</p>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">{insight.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Non-patient stats */}
        {role !== 'patient' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {role === 'student' && (
              <>
                <StatCard icon={BookOpen} label="Study Notes" value={STUDY_NOTES.filter((n) => n.type === 'notes').length.toString()} desc="available" color="bg-chart-1/10 text-chart-1" />
                <StatCard icon={FileText} label="Past Papers" value={STUDY_NOTES.filter((n) => n.type === 'paper').length.toString()} desc="available" color="bg-chart-2/10 text-chart-2" />
                <StatCard icon={Video} label="Videos" value={STUDY_NOTES.filter((n) => n.type === 'video').length.toString()} desc="curated" color="bg-chart-3/10 text-chart-3" />
                <StatCard icon={Star} label="Subjects" value="8+" desc="covered" color="bg-chart-4/10 text-chart-4" />
              </>
            )}
            {role === 'doctor' && (
              <>
                <StatCard icon={Calendar} label="Today" value={MOCK_APPOINTMENTS.length.toString()} desc="appointments" color="bg-chart-1/10 text-chart-1" />
                <StatCard icon={Users} label="Active" value={PATIENTS.filter((p) => p.status === 'active').length.toString()} desc="patients" color="bg-chart-2/10 text-chart-2" />
                <StatCard icon={Clock} label="Follow-ups" value={PATIENTS.filter((p) => p.status === 'follow-up').length.toString()} desc="pending" color="bg-chart-3/10 text-chart-3" />
                <StatCard icon={TrendingUp} label="Discharged" value={PATIENTS.filter((p) => p.status === 'discharged').length.toString()} desc="this month" color="bg-chart-4/10 text-chart-4" />
              </>
            )}
            {role === 'professor' && (
              <>
                <StatCard icon={MessageSquare} label="Queries" value={STUDENT_QUERIES.filter((q) => q.status === 'pending').length.toString()} desc="pending" color="bg-chart-1/10 text-chart-1" />
                <StatCard icon={BookOpen} label="Materials" value="12" desc="shared" color="bg-chart-2/10 text-chart-2" />
                <StatCard icon={Users} label="Students" value="180+" desc="enrolled" color="bg-chart-3/10 text-chart-3" />
                <StatCard icon={Calendar} label="Classes" value="6" desc="this week" color="bg-chart-4/10 text-chart-4" />
              </>
            )}
          </motion.div>
        )}

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-display font-semibold mb-3">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {actions.map((action, i) => (
              <motion.div key={action.href} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}>
                <Link href={action.href} className="flex items-start gap-3 p-4 bg-card border border-border rounded-2xl hover:shadow-md transition-shadow group">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', action.color)}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{action.label}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{action.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({ icon: Icon, label, value, desc, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; desc: string; color: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', color)}><Icon className="w-4.5 h-4.5" /></div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-bold font-display">{value}</p>
      <p className="text-[10px] text-muted-foreground">{desc}</p>
    </div>
  );
}
