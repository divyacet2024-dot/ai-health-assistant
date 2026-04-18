'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Search, Calendar, Activity } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { cn } from '@/lib/utils';
import { PATIENTS } from '@/lib/mock-data';

export default function PatientsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const filtered = PATIENTS.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.condition.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (!mounted) return null;

  return (
    <AppShell>
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Patient List</h1>
          <p className="text-muted-foreground mt-1">View and manage your patients.</p>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patients..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:ring-2 focus:ring-primary/30 outline-none"
            />
          </div>
          <div className="flex gap-1 bg-muted rounded-xl p-1">
            {['', 'active', 'follow-up', 'discharged'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize',
                  statusFilter === s ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {s || 'All'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filtered.map((patient, i) => (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-card border border-border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-chart-3/10 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-chart-3" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">{patient.name}</h3>
                  <span className="text-xs text-muted-foreground">{patient.age}y, {patient.gender}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{patient.condition}</p>
                <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Last: {patient.lastVisit}</span>
                  {patient.nextAppointment && (
                    <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> Next: {patient.nextAppointment}</span>
                  )}
                </div>
              </div>
              <span className={cn(
                'text-[10px] px-2.5 py-1 rounded-full font-medium capitalize self-start sm:self-center',
                patient.status === 'active' ? 'bg-chart-3/10 text-chart-3' :
                patient.status === 'follow-up' ? 'bg-chart-5/10 text-chart-5' :
                'bg-muted text-muted-foreground'
              )}>
                {patient.status}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
