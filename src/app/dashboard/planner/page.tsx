'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ClipboardList, Plus, Check, Trash2, Calendar } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { cn } from '@/lib/utils';

interface StudyTask {
  id: string;
  subject: string;
  topic: string;
  day: string;
  completed: boolean;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SUBJECTS = ['Anatomy', 'Physiology', 'Biochemistry', 'Pharmacology', 'Pathology', 'Microbiology', 'Medicine', 'Surgery', 'Forensic Medicine'];

const DEFAULT_TASKS: StudyTask[] = [
  { id: 't1', subject: 'Anatomy', topic: 'Upper limb — Brachial plexus', day: 'Monday', completed: true },
  { id: 't2', subject: 'Physiology', topic: 'Cardiovascular system — Cardiac cycle', day: 'Monday', completed: false },
  { id: 't3', subject: 'Biochemistry', topic: 'Carbohydrate metabolism', day: 'Tuesday', completed: false },
  { id: 't4', subject: 'Pharmacology', topic: 'Autonomic nervous system drugs', day: 'Wednesday', completed: false },
  { id: 't5', subject: 'Pathology', topic: 'Inflammation and healing', day: 'Thursday', completed: false },
  { id: 't6', subject: 'Microbiology', topic: 'Gram positive bacteria', day: 'Friday', completed: false },
  { id: 't7', subject: 'Medicine', topic: 'Diabetes mellitus — Types and management', day: 'Saturday', completed: false },
  { id: 't8', subject: 'Anatomy', topic: 'Head & Neck — Cranial nerves', day: 'Saturday', completed: false },
];

const STORAGE_KEY = 'aihealthassist_studyplan';

export default function PlannerPage() {
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newDay, setNewDay] = useState('Monday');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      setTasks(saved ? JSON.parse(saved) : DEFAULT_TASKS);
    } catch {
      setTasks(DEFAULT_TASKS);
    }
  }, []);

  function save(updated: StudyTask[]) {
    setTasks(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  function toggleTask(id: string) {
    save(tasks.map((t) => t.id === id ? { ...t, completed: !t.completed } : t));
  }

  function deleteTask(id: string) {
    save(tasks.filter((t) => t.id !== id));
  }

  function addTask() {
    if (!newSubject || !newTopic) return;
    const task: StudyTask = { id: `t-${Date.now()}`, subject: newSubject, topic: newTopic, day: newDay, completed: false };
    save([...tasks, task]);
    setNewSubject('');
    setNewTopic('');
    setShowAdd(false);
  }

  if (!mounted) return null;

  const completed = tasks.filter((t) => t.completed).length;
  const total = tasks.length;

  return (
    <AppShell>
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">Study Planner</h1>
            <p className="text-muted-foreground mt-1">Organize your weekly study schedule.</p>
          </div>
          <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition">
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </motion.div>

        {/* Progress */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Weekly Progress</span>
            <span className="text-sm font-bold font-display">{completed}/{total}</span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }} />
          </div>
        </div>

        {/* Add Form */}
        {showAdd && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select value={newSubject} onChange={(e) => setNewSubject(e.target.value)} className="px-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none">
                <option value="">Subject</option>
                {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <input type="text" value={newTopic} onChange={(e) => setNewTopic(e.target.value)} placeholder="Topic" className="px-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none" />
              <select value={newDay} onChange={(e) => setNewDay(e.target.value)} className="px-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none">
                {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <button onClick={addTask} disabled={!newSubject || !newTopic} className="px-5 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition disabled:opacity-40">
              Add to Plan
            </button>
          </motion.div>
        )}

        {/* Tasks by Day */}
        {DAYS.map((day) => {
          const dayTasks = tasks.filter((t) => t.day === day);
          if (dayTasks.length === 0) return null;
          return (
            <div key={day}>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-primary" />
                <h3 className="font-display font-semibold text-sm">{day}</h3>
                <span className="text-[10px] text-muted-foreground">({dayTasks.filter((t) => t.completed).length}/{dayTasks.length} done)</span>
              </div>
              <div className="space-y-2">
                {dayTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={cn(
                      'flex items-center gap-3 p-3.5 bg-card border border-border rounded-xl transition-all',
                      task.completed && 'opacity-60'
                    )}
                  >
                    <button onClick={() => toggleTask(task.id)} className={cn(
                      'w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition',
                      task.completed ? 'bg-primary border-primary' : 'border-border hover:border-primary'
                    )}>
                      {task.completed && <Check className="w-3 h-3 text-primary-foreground" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm font-medium', task.completed && 'line-through')}>{task.topic}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">{task.subject}</span>
                    </div>
                    <button onClick={() => deleteTask(task.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
