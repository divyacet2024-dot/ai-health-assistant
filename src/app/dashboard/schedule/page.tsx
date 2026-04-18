'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, MapPin, Users, Plus, Trash2 } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { cn } from '@/lib/utils';

interface ClassSlot {
  id: string;
  subject: string;
  topic: string;
  day: string;
  time: string;
  room: string;
  batch: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DEFAULT_SCHEDULE: ClassSlot[] = [
  { id: 'cs1', subject: 'Anatomy', topic: 'Upper Limb Practicals', day: 'Monday', time: '9:00 AM - 11:00 AM', room: 'Dissection Hall A', batch: '1st Year MBBS' },
  { id: 'cs2', subject: 'Anatomy', topic: 'Head & Neck Lecture', day: 'Monday', time: '2:00 PM - 3:00 PM', room: 'Lecture Hall 1', batch: '1st Year MBBS' },
  { id: 'cs3', subject: 'Anatomy', topic: 'Lower Limb Tutorial', day: 'Wednesday', time: '10:00 AM - 11:00 AM', room: 'Tutorial Room 3', batch: '1st Year MBBS' },
  { id: 'cs4', subject: 'Anatomy', topic: 'Thorax Lecture', day: 'Thursday', time: '9:00 AM - 10:00 AM', room: 'Lecture Hall 1', batch: '1st Year MBBS' },
  { id: 'cs5', subject: 'Anatomy', topic: 'Abdomen Practicals', day: 'Friday', time: '9:00 AM - 11:00 AM', room: 'Dissection Hall A', batch: '1st Year MBBS' },
  { id: 'cs6', subject: 'Anatomy', topic: 'Revision Class', day: 'Saturday', time: '10:00 AM - 12:00 PM', room: 'Lecture Hall 2', batch: '1st Year MBBS' },
];

const STORAGE_KEY = 'aihealthassist_schedule';

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<ClassSlot[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newDay, setNewDay] = useState('Monday');
  const [newTime, setNewTime] = useState('');
  const [newRoom, setNewRoom] = useState('');
  const [newBatch, setNewBatch] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      setSchedule(saved ? JSON.parse(saved) : DEFAULT_SCHEDULE);
    } catch {
      setSchedule(DEFAULT_SCHEDULE);
    }
  }, []);

  function save(updated: ClassSlot[]) {
    setSchedule(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  function addClass() {
    if (!newSubject || !newTopic || !newDay || !newTime) return;
    const slot: ClassSlot = { id: `cs-${Date.now()}`, subject: newSubject, topic: newTopic, day: newDay, time: newTime, room: newRoom, batch: newBatch };
    save([...schedule, slot]);
    setNewSubject(''); setNewTopic(''); setNewTime(''); setNewRoom(''); setNewBatch('');
    setShowAdd(false);
  }

  function deleteClass(id: string) {
    save(schedule.filter((s) => s.id !== id));
  }

  if (!mounted) return null;

  return (
    <AppShell>
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">Class Schedule</h1>
            <p className="text-muted-foreground mt-1">Manage your weekly teaching schedule.</p>
          </div>
          <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition">
            <Plus className="w-4 h-4" /> Add Class
          </button>
        </motion.div>

        {showAdd && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input type="text" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} placeholder="Subject" className="px-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none" />
              <input type="text" value={newTopic} onChange={(e) => setNewTopic(e.target.value)} placeholder="Topic" className="px-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none" />
              <select value={newDay} onChange={(e) => setNewDay(e.target.value)} className="px-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none">
                {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <input type="text" value={newTime} onChange={(e) => setNewTime(e.target.value)} placeholder="Time (e.g., 9:00 AM - 10:00 AM)" className="px-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none" />
              <input type="text" value={newRoom} onChange={(e) => setNewRoom(e.target.value)} placeholder="Room" className="px-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none" />
              <input type="text" value={newBatch} onChange={(e) => setNewBatch(e.target.value)} placeholder="Batch" className="px-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none" />
            </div>
            <button onClick={addClass} disabled={!newSubject || !newTopic || !newTime} className="px-5 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition disabled:opacity-40">
              Add to Schedule
            </button>
          </motion.div>
        )}

        {/* Schedule by Day */}
        {DAYS.map((day) => {
          const dayClasses = schedule.filter((s) => s.day === day);
          if (dayClasses.length === 0) return null;
          return (
            <div key={day}>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-primary" />
                <h3 className="font-display font-semibold text-sm">{day}</h3>
                <span className="text-[10px] text-muted-foreground">({dayClasses.length} classes)</span>
              </div>
              <div className="space-y-2">
                {dayClasses.map((cls) => (
                  <motion.div
                    key={cls.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-card border border-border rounded-xl p-4 flex items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm">{cls.topic}</h4>
                      <p className="text-xs text-muted-foreground">{cls.subject}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{cls.time}</span>
                        {cls.room && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{cls.room}</span>}
                        {cls.batch && <span className="flex items-center gap-1"><Users className="w-3 h-3" />{cls.batch}</span>}
                      </div>
                    </div>
                    <button onClick={() => deleteClass(cls.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition shrink-0">
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
