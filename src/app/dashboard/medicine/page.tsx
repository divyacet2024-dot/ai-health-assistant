'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pill, Search, AlertTriangle, Info, X } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { cn } from '@/lib/utils';
import { Medicine } from '@/lib/types';
import { MEDICINES } from '@/lib/mock-data';

export default function MedicinePage() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Medicine | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const filtered = MEDICINES.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.genericName.toLowerCase().includes(search.toLowerCase()) ||
    m.category.toLowerCase().includes(search.toLowerCase())
  );

  if (!mounted) return null;

  return (
    <AppShell>
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Medicine Information</h1>
          <p className="text-muted-foreground mt-1">Search any medicine for usage, dosage, side effects, and warnings.</p>
        </motion.div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by medicine name, generic name, or category..."
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-border bg-card text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none shadow-sm"
          />
        </div>

        {/* Results */}
        <div className="grid md:grid-cols-2 gap-3">
          {filtered.map((med, i) => (
            <motion.button
              key={med.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => setSelected(med)}
              className="bg-card border border-border rounded-2xl p-5 text-left hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-chart-3/10 flex items-center justify-center shrink-0">
                  <Pill className="w-5 h-5 text-chart-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{med.name}</h3>
                  <p className="text-xs text-muted-foreground">{med.genericName}</p>
                  <span className="inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                    {med.category}
                  </span>
                </div>
                <span className="text-sm font-bold text-chart-3">{med.price}</span>
              </div>
            </motion.button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Pill className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-display font-medium">No medicines found</p>
            <p className="text-sm mt-1">Try a different search term</p>
          </div>
        )}

        {/* Detail Modal */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setSelected(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-chart-3/10 flex items-center justify-center">
                      <Pill className="w-6 h-6 text-chart-3" />
                    </div>
                    <div>
                      <h2 className="font-display font-bold text-lg">{selected.name}</h2>
                      <p className="text-sm text-muted-foreground">{selected.genericName}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-muted">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-medium">{selected.category}</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-chart-3/10 text-chart-3 font-bold">{selected.price}</span>
                </div>

                <div className="space-y-4">
                  <Section title="Usage & Indications" icon={Info} color="text-chart-1">
                    <p className="text-sm text-muted-foreground leading-relaxed">{selected.usage}</p>
                  </Section>

                  <Section title="Dosage" icon={Pill} color="text-chart-2">
                    <p className="text-sm text-muted-foreground leading-relaxed">{selected.dosage}</p>
                  </Section>

                  <Section title="Side Effects" icon={AlertTriangle} color="text-chart-5">
                    <div className="flex flex-wrap gap-1.5">
                      {selected.sideEffects.map((se) => (
                        <span key={se} className="text-xs px-2 py-1 rounded-lg bg-chart-5/10 text-chart-5 font-medium">{se}</span>
                      ))}
                    </div>
                  </Section>

                  <Section title="Warnings" icon={AlertTriangle} color="text-destructive">
                    <ul className="space-y-1.5">
                      {selected.warnings.map((w) => (
                        <li key={w} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-destructive mt-0.5 text-xs">⚠️</span>
                          {w}
                        </li>
                      ))}
                    </ul>
                  </Section>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}

function Section({ title, icon: Icon, color, children }: { title: string; icon: React.ComponentType<{ className?: string }>; color: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn('w-4 h-4', color)} />
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      {children}
    </div>
  );
}
