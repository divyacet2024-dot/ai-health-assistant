'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BookOpen, FileText, Video, Search, ExternalLink, Filter } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { cn } from '@/lib/utils';
import { STUDY_NOTES } from '@/lib/mock-data';

const TYPE_CONFIG = {
  notes: { icon: BookOpen, label: 'Notes', color: 'bg-chart-2/10 text-chart-2' },
  paper: { icon: FileText, label: 'Paper', color: 'bg-chart-4/10 text-chart-4' },
  video: { icon: Video, label: 'Video', color: 'bg-chart-3/10 text-chart-3' },
};

export default function ResourcesPage() {
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const subjects = [...new Set(STUDY_NOTES.map((n) => n.subject))];

  const filtered = STUDY_NOTES.filter((n) => {
    const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.subject.toLowerCase().includes(search.toLowerCase()) || n.description.toLowerCase().includes(search.toLowerCase());
    const matchSubject = !subjectFilter || n.subject === subjectFilter;
    const matchType = !typeFilter || n.type === typeFilter;
    return matchSearch && matchSubject && matchType;
  });

  if (!mounted) return null;

  return (
    <AppShell>
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Study Resources</h1>
          <p className="text-muted-foreground mt-1">Notes, previous year papers, and video lectures organized by subject.</p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search resources..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:ring-2 focus:ring-primary/30 outline-none"
            />
          </div>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:ring-2 focus:ring-primary/30 outline-none"
          >
            <option value="">All Subjects</option>
            {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="flex gap-1 bg-muted rounded-xl p-1">
            {['', 'notes', 'paper', 'video'].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  typeFilter === t ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {t === '' ? 'All' : t === 'notes' ? 'Notes' : t === 'paper' ? 'Papers' : 'Videos'}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="grid md:grid-cols-2 gap-3">
          {filtered.map((note, i) => {
            const config = TYPE_CONFIG[note.type];
            const Icon = config.icon;
            return (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', config.color)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm">{note.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">{note.subject}</span>
                      <span className="text-[10px] text-muted-foreground">{note.year}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed line-clamp-2">{note.description}</p>
                    {note.type === 'video' && note.url && (
                      <a
                        href={note.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-2 text-xs text-primary hover:underline"
                      >
                        Watch on YouTube <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-display font-medium">No resources found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
