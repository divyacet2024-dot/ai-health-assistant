'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Stethoscope, AlertTriangle, Heart, X, Filter, ChevronDown } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { cn } from '@/lib/utils';
import { DISEASES, DISEASE_CATEGORIES, Disease, getDiseaseCount } from '@/lib/disease-db';

const SEVERITY_COLORS = {
  mild: 'bg-chart-3/10 text-chart-3',
  moderate: 'bg-chart-5/10 text-chart-5',
  severe: 'bg-destructive/10 text-destructive',
  critical: 'bg-destructive/20 text-destructive',
};

export default function DiseasesPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [severity, setSeverity] = useState('');
  const [selected, setSelected] = useState<Disease | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const filtered = useMemo(() => {
    const lower = search.toLowerCase();
    return DISEASES.filter((d) => {
      const matchSearch = !search || d.name.toLowerCase().includes(lower) || d.description.toLowerCase().includes(lower) || d.symptoms.some((s) => s.toLowerCase().includes(lower)) || d.category.toLowerCase().includes(lower);
      const matchCat = !category || d.category === category;
      const matchSev = !severity || d.severity === severity;
      return matchSearch && matchCat && matchSev;
    }).slice(0, 100); // Show max 100 results for performance
  }, [search, category, severity]);

  if (!mounted) return null;

  return (
    <AppShell>
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Disease Encyclopedia</h1>
          <p className="text-muted-foreground mt-1">{getDiseaseCount()}+ diseases with symptoms, treatments, and recommended medicines.</p>
        </motion.div>

        {/* Search + Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search diseases by name, symptoms, or category..."
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-border bg-card text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none shadow-sm" />
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted transition">
              <Filter className="w-3.5 h-3.5" /> Filters <ChevronDown className={cn('w-3 h-3 transition-transform', showFilters && 'rotate-180')} />
            </button>
            {category && (
              <button onClick={() => setCategory('')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium">
                {category} <X className="w-3 h-3" />
              </button>
            )}
            {severity && (
              <button onClick={() => setSeverity('')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium">
                {severity} <X className="w-3 h-3" />
              </button>
            )}
            <span className="text-xs text-muted-foreground self-center ml-auto">{filtered.length} results</span>
          </div>
          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden">
                <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">Category</label>
                    <div className="flex flex-wrap gap-1.5">
                      {DISEASE_CATEGORIES.map((c) => (
                        <button key={c} onClick={() => setCategory(category === c ? '' : c)}
                          className={cn('px-2.5 py-1 rounded-lg text-[10px] font-medium border transition',
                            category === c ? 'bg-primary/10 border-primary text-primary' : 'border-border hover:bg-muted'
                          )}>{c}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">Severity</label>
                    <div className="flex gap-2">
                      {(['mild', 'moderate', 'severe', 'critical'] as const).map((s) => (
                        <button key={s} onClick={() => setSeverity(severity === s ? '' : s)}
                          className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border capitalize transition',
                            severity === s ? 'bg-primary/10 border-primary text-primary' : 'border-border hover:bg-muted'
                          )}>{s}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results */}
        <div className="grid md:grid-cols-2 gap-3">
          {filtered.map((disease, i) => (
            <motion.button key={disease.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.5) }}
              onClick={() => setSelected(disease)}
              className="bg-card border border-border rounded-2xl p-5 text-left hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{disease.name}</h3>
                <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium capitalize', SEVERITY_COLORS[disease.severity])}>
                  {disease.severity}
                </span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{disease.description}</p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">{disease.category}</span>
                <span className="text-[10px] text-muted-foreground">{disease.specialist}</span>
              </div>
            </motion.button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Stethoscope className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-display font-medium">No diseases found</p>
            <p className="text-sm mt-1">Try a different search term or filter</p>
          </div>
        )}

        {/* Detail Modal */}
        <AnimatePresence>
          {selected && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setSelected(null)}>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="font-display font-bold text-lg">{selected.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{selected.category}</span>
                      <span className={cn('text-xs px-2 py-0.5 rounded-full capitalize', SEVERITY_COLORS[selected.severity])}>{selected.severity}</span>
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
                </div>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{selected.description}</p>

                <div className="space-y-4">
                  <Section title="Symptoms" items={selected.symptoms} color="text-destructive" />
                  <Section title="Causes" items={selected.causes} color="text-chart-5" />
                  <Section title="Treatments" items={selected.treatments} color="text-chart-3" />
                  <Section title="Recommended Medicines" items={selected.medicines} color="text-primary" />
                  <Section title="Prevention" items={selected.prevention} color="text-chart-2" />

                  <div className="bg-muted/50 rounded-xl p-3">
                    <p className="text-xs text-muted-foreground">
                      <strong>Specialist:</strong> {selected.specialist}
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}

function Section({ title, items, color }: { title: string; items: string[]; color: string }) {
  return (
    <div>
      <h3 className={cn('text-xs font-semibold mb-2', color)}>{title}</h3>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, i) => (
          <span key={i} className="text-[10px] px-2 py-1 rounded-lg bg-muted text-muted-foreground">{item}</span>
        ))}
      </div>
    </div>
  );
}
