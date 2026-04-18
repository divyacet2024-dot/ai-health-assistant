'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Lightbulb, TrendingUp, TrendingDown, Minus, Trophy,
  AlertTriangle, Sparkles, Brain, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { getHealthGoals } from '@/lib/health-storage';
import { seedHealthData } from '@/lib/health-seed';
import { getRecentHealthInsights, generateWeeklyHealthReport } from '@/lib/health-insights';
import { HealthInsight, WeeklyHealthReport } from '@/lib/health-types';
import { cn } from '@/lib/utils';

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  correlation: Brain, trend: TrendingUp, achievement: Trophy, warning: AlertTriangle, tip: Sparkles,
};
const typeColors: Record<string, string> = {
  correlation: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
  trend: 'bg-chart-1/10 text-chart-1 border-chart-1/20',
  achievement: 'bg-accent/10 text-accent border-accent/20',
  warning: 'bg-destructive/10 text-destructive border-destructive/20',
  tip: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
};

function ComparisonBadge({ value, label }: { value: number; label: string }) {
  const isPositive = value > 0;
  const isNeutral = Math.abs(value) < 1;
  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <div className="flex items-center gap-2">
        {isNeutral ? <Minus className="w-4 h-4 text-muted-foreground" /> : isPositive ? <TrendingUp className="w-4 h-4 text-chart-3" /> : <TrendingDown className="w-4 h-4 text-destructive" />}
        <span className={cn('text-lg font-bold font-display', isNeutral ? 'text-muted-foreground' : isPositive ? 'text-chart-3' : 'text-destructive')}>
          {isPositive ? '+' : ''}{value.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

export default function HealthInsightsPage() {
  const [insights, setInsights] = useState<HealthInsight[]>([]);
  const [report, setReport] = useState<WeeklyHealthReport | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    setMounted(true);
    seedHealthData(30);
    const goals = getHealthGoals();
    setInsights(getRecentHealthInsights(goals));
    setReport(generateWeeklyHealthReport(0, goals));
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const goals = getHealthGoals();
    setReport(generateWeeklyHealthReport(weekOffset, goals));
  }, [weekOffset, mounted]);

  if (!mounted) return null;

  const categories = ['all', ...new Set(insights.map((i) => i.category))];
  const filteredInsights = filter === 'all' ? insights : insights.filter((i) => i.category === filter);

  return (
    <AppShell>
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight">Health Insights</h1>
          <p className="text-muted-foreground mt-1">AI-powered patterns and actionable suggestions from your health data.</p>
        </motion.div>

        {/* Filter */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setFilter(cat)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium capitalize border transition whitespace-nowrap',
                filter === cat ? 'bg-primary/10 border-primary/20 text-primary' : 'border-border text-muted-foreground hover:bg-muted'
              )}>{cat}</button>
          ))}
        </div>

        {/* Insight Cards */}
        {filteredInsights.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-display font-medium">No insights yet</p>
            <p className="text-sm mt-1">Keep logging your habits — insights appear after a few days of data.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filteredInsights.map((insight, i) => {
              const Icon = typeIcons[insight.type] ?? Lightbulb;
              const colorClass = typeColors[insight.type] ?? '';
              return (
                <motion.div key={insight.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center border', colorClass)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{insight.icon}</span>
                        <h3 className="font-semibold text-sm">{insight.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{insight.description}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <span className={cn('text-[10px] px-2 py-0.5 rounded-full capitalize font-medium',
                          insight.priority === 'high' ? 'bg-destructive/10 text-destructive' :
                          insight.priority === 'medium' ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground'
                        )}>{insight.priority} priority</span>
                        <span className="text-[10px] text-muted-foreground capitalize">{insight.category}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Weekly Report */}
        {report && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-display font-bold">Weekly Health Report</h2>
                <p className="text-sm text-muted-foreground">
                  {new Date(report.weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {new Date(report.weekEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setWeekOffset((w) => w + 1)} className="p-2 rounded-lg hover:bg-muted"><ChevronLeft className="w-4 h-4" /></button>
                <button onClick={() => setWeekOffset((w) => Math.max(0, w - 1))} disabled={weekOffset === 0} className="p-2 rounded-lg hover:bg-muted disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="bg-muted/50 rounded-xl p-4 text-center">
                <p className="text-xs text-muted-foreground">Avg Sleep</p>
                <p className="text-2xl font-bold font-display">{report.avgSleep.toFixed(1)}h</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-4 text-center">
                <p className="text-xs text-muted-foreground">Avg Mood</p>
                <p className="text-2xl font-bold font-display">{report.avgMood.toFixed(1)}/5</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-4 text-center">
                <p className="text-xs text-muted-foreground">Avg Water</p>
                <p className="text-2xl font-bold font-display">{report.avgWater.toFixed(1)}</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-4 text-center">
                <p className="text-xs text-muted-foreground">Exercise</p>
                <p className="text-2xl font-bold font-display">{report.exerciseDays}d</p>
              </div>
            </div>

            <h3 className="font-display font-semibold mb-3">Compared to Last Week</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <ComparisonBadge value={report.comparedToLastWeek.sleep} label="Sleep" />
              <ComparisonBadge value={report.comparedToLastWeek.mood} label="Mood" />
              <ComparisonBadge value={report.comparedToLastWeek.water} label="Water" />
              <ComparisonBadge value={report.comparedToLastWeek.exercise} label="Exercise" />
            </div>

            {report.topSymptoms.length > 0 && (
              <div className="mb-6">
                <h3 className="font-display font-semibold mb-3">Top Symptoms This Week</h3>
                <div className="flex flex-wrap gap-2">
                  {report.topSymptoms.map((s) => (
                    <span key={s.name} className="px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-medium">
                      {s.name} ({s.count}x)
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="font-display font-semibold mb-3">Meal Quality</h3>
              <div className="flex gap-4">
                {Object.entries(report.mealQualityBreakdown).map(([key, val]) => (
                  <div key={key} className="flex items-center gap-2">
                    <div className={cn('w-3 h-3 rounded-full',
                      key === 'healthy' ? 'bg-chart-3' : key === 'moderate' ? 'bg-chart-2' : 'bg-destructive'
                    )} />
                    <span className="text-sm capitalize">{key}: {val}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </AppShell>
  );
}
