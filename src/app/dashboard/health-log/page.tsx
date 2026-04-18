'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Moon, Smile, Droplets, Dumbbell, Apple, Stethoscope,
  ChevronLeft, ChevronRight, Check, Save,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { getHealthLogByDate, saveHealthLog, getHealthGoals } from '@/lib/health-storage';
import { seedHealthData } from '@/lib/health-seed';
import {
  DailyHealthLog, MoodLevel, MealQuality, ExerciseIntensity,
  MOOD_EMOJIS, SYMPTOM_OPTIONS, EXERCISE_TYPES,
} from '@/lib/health-types';
import { cn } from '@/lib/utils';

function formatDate(d: Date): string { return d.toISOString().split('T')[0]; }

function dateLabel(dateStr: string): string {
  const today = formatDate(new Date());
  const yesterday = formatDate(new Date(Date.now() - 86400000));
  if (dateStr === today) return 'Today';
  if (dateStr === yesterday) return 'Yesterday';
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function HealthLogPage() {
  const [date, setDate] = useState(formatDate(new Date()));
  const [mounted, setMounted] = useState(false);
  const [saved, setSaved] = useState(false);

  const [sleepHours, setSleepHours] = useState(7);
  const [sleepQuality, setSleepQuality] = useState<MoodLevel>(3);
  const [moodLevel, setMoodLevel] = useState<MoodLevel>(3);
  const [moodNote, setMoodNote] = useState('');
  const [waterGlasses, setWaterGlasses] = useState(4);
  const [exerciseType, setExerciseType] = useState<string>(EXERCISE_TYPES[0]);
  const [exerciseDuration, setExerciseDuration] = useState(30);
  const [exerciseIntensity, setExerciseIntensity] = useState<ExerciseIntensity>('moderate');
  const [didExercise, setDidExercise] = useState(false);
  const [breakfast, setBreakfast] = useState<MealQuality>('moderate');
  const [lunch, setLunch] = useState<MealQuality>('moderate');
  const [dinner, setDinner] = useState<MealQuality>('moderate');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [symptomSeverity, setSymptomSeverity] = useState<MoodLevel>(2);
  const [symptomNote, setSymptomNote] = useState('');

  useEffect(() => {
    setMounted(true);
    seedHealthData(30);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const existing = getHealthLogByDate(date);
    if (existing) {
      setSleepHours(existing.sleep?.hours ?? 7);
      setSleepQuality(existing.sleep?.quality ?? 3);
      setMoodLevel(existing.mood?.level ?? 3);
      setMoodNote(existing.mood?.note ?? '');
      setWaterGlasses(existing.water?.glasses ?? 4);
      setDidExercise(!!existing.exercise);
      setExerciseType(existing.exercise?.type ?? EXERCISE_TYPES[0]);
      setExerciseDuration(existing.exercise?.durationMinutes ?? 30);
      setExerciseIntensity(existing.exercise?.intensity ?? 'moderate');
      setBreakfast(existing.nutrition?.breakfast ?? 'moderate');
      setLunch(existing.nutrition?.lunch ?? 'moderate');
      setDinner(existing.nutrition?.dinner ?? 'moderate');
      setSelectedSymptoms(existing.symptoms?.symptoms ?? []);
      setSymptomSeverity(existing.symptoms?.severity ?? 2);
      setSymptomNote(existing.symptoms?.note ?? '');
    } else {
      setSleepHours(7); setSleepQuality(3); setMoodLevel(3); setMoodNote('');
      setWaterGlasses(4); setDidExercise(false); setExerciseType(EXERCISE_TYPES[0]);
      setExerciseDuration(30); setExerciseIntensity('moderate');
      setBreakfast('moderate'); setLunch('moderate'); setDinner('moderate');
      setSelectedSymptoms([]); setSymptomSeverity(2); setSymptomNote('');
    }
    setSaved(false);
  }, [date, mounted]);

  function handleSave() {
    const log: DailyHealthLog = {
      id: `hlog-${date}`, date,
      sleep: { hours: sleepHours, quality: sleepQuality },
      mood: { level: moodLevel, note: moodNote },
      water: { glasses: waterGlasses },
      exercise: didExercise ? { type: exerciseType, durationMinutes: exerciseDuration, intensity: exerciseIntensity } : undefined,
      nutrition: { breakfast, lunch, dinner },
      symptoms: selectedSymptoms.length > 0 ? { symptoms: selectedSymptoms, severity: symptomSeverity, note: symptomNote } : undefined,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    saveHealthLog(log);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function changeDate(offset: number) {
    const d = new Date(date); d.setDate(d.getDate() + offset);
    if (d <= new Date()) setDate(formatDate(d));
  }

  function toggleSymptom(s: string) {
    setSelectedSymptoms((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  }

  if (!mounted) return null;
  const goals = getHealthGoals();

  return (
    <AppShell>
      <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-5">
        {/* Date Navigation */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between">
          <button onClick={() => changeDate(-1)} className="p-2 rounded-xl hover:bg-muted transition">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h1 className="text-2xl font-display font-bold">{dateLabel(date)}</h1>
            <p className="text-sm text-muted-foreground">
              {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <button onClick={() => changeDate(1)} disabled={date >= formatDate(new Date())} className="p-2 rounded-xl hover:bg-muted transition disabled:opacity-30">
            <ChevronRight className="w-5 h-5" />
          </button>
        </motion.div>

        {/* Sleep */}
        <Section icon={Moon} title="Sleep" color="text-chart-1" bgColor="bg-chart-1/10">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Hours slept</span>
                <span className="text-lg font-bold font-display">{sleepHours}h</span>
              </div>
              <input type="range" min={0} max={14} step={0.5} value={sleepHours}
                onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                className="w-full accent-[var(--chart-1)]" />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>0h</span><span className="text-chart-1">Goal: {goals.sleepHours}h</span><span>14h</span>
              </div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground mb-2 block">Sleep quality</span>
              <div className="flex gap-2">
                {([1, 2, 3, 4, 5] as MoodLevel[]).map((q) => (
                  <button key={q} onClick={() => setSleepQuality(q)}
                    className={cn('flex-1 py-2 rounded-xl text-sm font-medium border transition-all',
                      sleepQuality === q ? 'bg-chart-1/20 border-chart-1 text-foreground' : 'border-border hover:bg-muted'
                    )}>{'⭐'.repeat(q)}</button>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* Mood */}
        <Section icon={Smile} title="Mood" color="text-chart-4" bgColor="bg-chart-4/10">
          <div className="space-y-4">
            <div className="flex gap-2">
              {([1, 2, 3, 4, 5] as MoodLevel[]).map((level) => (
                <button key={level} onClick={() => setMoodLevel(level)}
                  className={cn('flex-1 flex flex-col items-center py-3 rounded-xl border transition-all',
                    moodLevel === level ? 'bg-chart-4/15 border-chart-4 shadow-sm' : 'border-border hover:bg-muted'
                  )}>
                  <span className="text-2xl">{MOOD_EMOJIS[level].emoji}</span>
                  <span className="text-[10px] mt-1 text-muted-foreground">{MOOD_EMOJIS[level].label}</span>
                </button>
              ))}
            </div>
            <textarea placeholder="How are you feeling? (optional)" value={moodNote}
              onChange={(e) => setMoodNote(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm resize-none focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" rows={2} />
          </div>
        </Section>

        {/* Water */}
        <Section icon={Droplets} title="Water Intake" color="text-chart-3" bgColor="bg-chart-3/10">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Glasses of water</span>
              <span className="text-lg font-bold font-display">{waterGlasses} / {goals.waterGlasses}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 16 }, (_, i) => i + 1).map((g) => (
                <button key={g} onClick={() => setWaterGlasses(g)}
                  className={cn('w-10 h-10 rounded-xl text-sm font-medium border transition-all',
                    g <= waterGlasses ? 'bg-chart-3/20 border-chart-3 text-foreground' : 'border-border hover:bg-muted text-muted-foreground'
                  )}>{g}</button>
              ))}
            </div>
            <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-chart-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (waterGlasses / goals.waterGlasses) * 100)}%` }} />
            </div>
          </div>
        </Section>

        {/* Exercise */}
        <Section icon={Dumbbell} title="Exercise" color="text-chart-2" bgColor="bg-chart-2/10">
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={didExercise} onChange={(e) => setDidExercise(e.target.checked)}
                className="w-5 h-5 rounded accent-[var(--chart-2)]" />
              <span className="text-sm font-medium">I exercised today</span>
            </label>
            <AnimatePresence>
              {didExercise && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden">
                  <div>
                    <span className="text-sm text-muted-foreground mb-2 block">Type</span>
                    <div className="flex flex-wrap gap-2">
                      {EXERCISE_TYPES.map((t) => (
                        <button key={t} onClick={() => setExerciseType(t)}
                          className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition',
                            exerciseType === t ? 'bg-chart-2/20 border-chart-2' : 'border-border hover:bg-muted'
                          )}>{t}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Duration</span>
                      <span className="font-bold font-display">{exerciseDuration} min</span>
                    </div>
                    <input type="range" min={5} max={180} step={5} value={exerciseDuration}
                      onChange={(e) => setExerciseDuration(parseInt(e.target.value))}
                      className="w-full accent-[var(--chart-2)]" />
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground mb-2 block">Intensity</span>
                    <div className="flex gap-2">
                      {(['light', 'moderate', 'intense'] as ExerciseIntensity[]).map((i) => (
                        <button key={i} onClick={() => setExerciseIntensity(i)}
                          className={cn('flex-1 py-2 rounded-xl text-sm capitalize border transition',
                            exerciseIntensity === i ? 'bg-chart-2/20 border-chart-2' : 'border-border hover:bg-muted'
                          )}>{i}</button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Section>

        {/* Nutrition */}
        <Section icon={Apple} title="Nutrition" color="text-chart-5" bgColor="bg-chart-5/10">
          <div className="space-y-3">
            {(['breakfast', 'lunch', 'dinner'] as const).map((meal) => {
              const val = meal === 'breakfast' ? breakfast : meal === 'lunch' ? lunch : dinner;
              const setter = meal === 'breakfast' ? setBreakfast : meal === 'lunch' ? setLunch : setDinner;
              return (
                <div key={meal} className="flex items-center gap-4">
                  <span className="text-sm capitalize w-20">{meal}</span>
                  <div className="flex gap-2 flex-1">
                    {(['healthy', 'moderate', 'unhealthy'] as MealQuality[]).map((q) => (
                      <button key={q} onClick={() => setter(q)}
                        className={cn('flex-1 py-2 rounded-lg text-xs font-medium border capitalize transition',
                          val === q ? q === 'healthy' ? 'bg-chart-3/20 border-chart-3' : q === 'moderate' ? 'bg-accent/20 border-accent' : 'bg-destructive/15 border-destructive' : 'border-border hover:bg-muted'
                        )}>{q === 'healthy' ? '🥗' : q === 'moderate' ? '🍽️' : '🍔'} {q}</button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* Symptoms */}
        <Section icon={Stethoscope} title="Symptoms" color="text-destructive" bgColor="bg-destructive/10">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {SYMPTOM_OPTIONS.map((s) => (
                <button key={s} onClick={() => toggleSymptom(s)}
                  className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition',
                    selectedSymptoms.includes(s) ? 'bg-destructive/15 border-destructive text-foreground' : 'border-border hover:bg-muted text-muted-foreground'
                  )}>{s}</button>
              ))}
            </div>
            {selectedSymptoms.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                <div>
                  <span className="text-sm text-muted-foreground mb-2 block">Severity</span>
                  <div className="flex gap-2">
                    {([1, 2, 3, 4, 5] as MoodLevel[]).map((s) => (
                      <button key={s} onClick={() => setSymptomSeverity(s)}
                        className={cn('flex-1 py-2 rounded-xl text-sm border transition',
                          symptomSeverity === s ? 'bg-destructive/15 border-destructive' : 'border-border hover:bg-muted'
                        )}>{s}</button>
                    ))}
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>Mild</span><span>Severe</span></div>
                </div>
                <textarea placeholder="Additional notes (optional)" value={symptomNote}
                  onChange={(e) => setSymptomNote(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm resize-none focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" rows={2} />
              </motion.div>
            )}
          </div>
        </Section>

        {/* Save */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="sticky bottom-4 z-20">
          <button onClick={handleSave}
            className={cn('w-full py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg',
              saved ? 'bg-chart-3 text-primary-foreground' : 'bg-primary text-primary-foreground hover:opacity-90'
            )}>
            {saved ? <><Check className="w-5 h-5" /> Saved!</> : <><Save className="w-5 h-5" /> Save Entry</>}
          </button>
        </motion.div>
      </div>
    </AppShell>
  );
}

function Section({ icon: Icon, title, color, bgColor, children }: {
  icon: React.ComponentType<{ className?: string }>; title: string; color: string; bgColor: string; children: React.ReactNode;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', bgColor)}>
          <Icon className={cn('w-4.5 h-4.5', color)} />
        </div>
        <h2 className="font-display font-semibold">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}
