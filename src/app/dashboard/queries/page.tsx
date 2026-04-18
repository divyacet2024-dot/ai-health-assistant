'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, Clock, CheckCircle, X } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { cn } from '@/lib/utils';
import { StudentQuery } from '@/lib/types';
import { STUDENT_QUERIES } from '@/lib/mock-data';

const STORAGE_KEY = 'aihealthassist_queries';

export default function QueriesPage() {
  const [queries, setQueries] = useState<StudentQuery[]>([]);
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      setQueries(saved ? JSON.parse(saved) : STUDENT_QUERIES);
    } catch {
      setQueries(STUDENT_QUERIES);
    }
  }, []);

  function save(updated: StudentQuery[]) {
    setQueries(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  function handleAnswer(id: string) {
    if (!answerText.trim()) return;
    save(queries.map((q) => q.id === id ? { ...q, status: 'answered' as const, answer: answerText.trim() } : q));
    setAnsweringId(null);
    setAnswerText('');
  }

  if (!mounted) return null;

  const pending = queries.filter((q) => q.status === 'pending');
  const answered = queries.filter((q) => q.status === 'answered');

  return (
    <AppShell>
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Student Queries</h1>
          <p className="text-muted-foreground mt-1">Review and answer questions from students.</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-chart-5/10 border border-chart-5/20 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold font-display text-chart-5">{pending.length}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
          <div className="bg-chart-3/10 border border-chart-3/20 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold font-display text-chart-3">{answered.length}</p>
            <p className="text-xs text-muted-foreground">Answered</p>
          </div>
        </div>

        {/* Pending Queries */}
        {pending.length > 0 && (
          <div>
            <h2 className="font-display font-semibold text-sm mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-chart-5" /> Pending Queries
            </h2>
            <div className="space-y-3">
              {pending.map((query) => (
                <motion.div key={query.id} layout className="bg-card border border-border rounded-2xl p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-chart-5/10 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-4.5 h-4.5 text-chart-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{query.studentName}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{query.subject}</span>
                        <span className="text-[10px] text-muted-foreground ml-auto">{query.date}</span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{query.question}</p>

                      {answeringId === query.id ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 space-y-2">
                          <textarea
                            value={answerText}
                            onChange={(e) => setAnswerText(e.target.value)}
                            placeholder="Type your answer..."
                            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm resize-none focus:ring-2 focus:ring-primary/30 outline-none"
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <button onClick={() => handleAnswer(query.id)} disabled={!answerText.trim()} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-medium hover:opacity-90 transition disabled:opacity-40">
                              <Send className="w-3.5 h-3.5" /> Submit Answer
                            </button>
                            <button onClick={() => { setAnsweringId(null); setAnswerText(''); }} className="px-4 py-2 border border-border rounded-xl text-xs font-medium hover:bg-muted transition">
                              Cancel
                            </button>
                          </div>
                        </motion.div>
                      ) : (
                        <button onClick={() => setAnsweringId(query.id)} className="mt-2 text-xs text-primary hover:underline font-medium">
                          Answer this query →
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Answered Queries */}
        {answered.length > 0 && (
          <div>
            <h2 className="font-display font-semibold text-sm mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-chart-3" /> Answered
            </h2>
            <div className="space-y-3">
              {answered.map((query) => (
                <div key={query.id} className="bg-card border border-border rounded-2xl p-5 opacity-80">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-chart-3/10 flex items-center justify-center shrink-0">
                      <CheckCircle className="w-4.5 h-4.5 text-chart-3" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{query.studentName}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{query.subject}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{query.question}</p>
                      {query.answer && (
                        <div className="mt-2 p-3 rounded-xl bg-chart-3/5 border border-chart-3/20 text-sm">
                          <p className="text-xs font-semibold text-chart-3 mb-1">Your Answer:</p>
                          <p className="text-muted-foreground">{query.answer}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
