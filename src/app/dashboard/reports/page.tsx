'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Clock, CheckCircle, Loader2, X, Download } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { cn } from '@/lib/utils';
import { LabReport } from '@/lib/types';
import { LAB_REPORTS } from '@/lib/mock-data';

const STATUS_CONFIG = {
  completed: { icon: CheckCircle, label: 'Completed', color: 'bg-chart-3/10 text-chart-3' },
  pending: { icon: Clock, label: 'Pending', color: 'bg-chart-5/10 text-chart-5' },
  processing: { icon: Loader2, label: 'Processing', color: 'bg-chart-1/10 text-chart-1' },
};

export default function ReportsPage() {
  const [reports] = useState<LabReport[]>(LAB_REPORTS);
  const [selected, setSelected] = useState<LabReport | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <AppShell>
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Lab Reports</h1>
          <p className="text-muted-foreground mt-1">View and track your laboratory test results.</p>
        </motion.div>

        <div className="space-y-3">
          {reports.map((report, i) => {
            const config = STATUS_CONFIG[report.status];
            const StatusIcon = config.icon;
            return (
              <motion.button
                key={report.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => report.status === 'completed' ? setSelected(report) : null}
                className={cn(
                  'w-full bg-card border border-border rounded-2xl p-5 flex items-center gap-4 text-left transition-shadow',
                  report.status === 'completed' ? 'hover:shadow-md cursor-pointer' : 'opacity-75 cursor-default'
                )}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm">{report.testName}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{report.patientName} · {report.date}</p>
                </div>
                <div className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium', config.color)}>
                  <StatusIcon className={cn('w-3.5 h-3.5', report.status === 'processing' && 'animate-spin')} />
                  {config.label}
                </div>
              </motion.button>
            );
          })}
        </div>

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
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="font-display font-bold text-lg">{selected.testName}</h2>
                    <p className="text-sm text-muted-foreground">{selected.patientName} · {selected.date}</p>
                  </div>
                  <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-muted">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="border border-border rounded-xl overflow-hidden">
                  <div className="grid grid-cols-4 gap-0 bg-muted/50 text-xs font-semibold px-4 py-2.5">
                    <span>Parameter</span>
                    <span>Value</span>
                    <span>Normal Range</span>
                    <span className="text-right">Status</span>
                  </div>
                  {selected.results.map((r) => (
                    <div key={r.parameter} className="grid grid-cols-4 gap-0 px-4 py-3 border-t border-border text-sm">
                      <span className="font-medium">{r.parameter}</span>
                      <span className={cn(
                        'font-semibold',
                        r.status === 'high' ? 'text-destructive' : r.status === 'low' ? 'text-chart-5' : 'text-chart-3'
                      )}>
                        {r.value}
                      </span>
                      <span className="text-muted-foreground">{r.normalRange}</span>
                      <span className="text-right">
                        <span className={cn(
                          'text-[10px] px-2 py-0.5 rounded-full font-medium capitalize',
                          r.status === 'normal' ? 'bg-chart-3/10 text-chart-3' :
                          r.status === 'high' ? 'bg-destructive/10 text-destructive' :
                          'bg-chart-5/10 text-chart-5'
                        )}>
                          {r.status}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    if (!selected) return;
                    const lines = [
                      '═══════════════════════════════════════════',
                      '          AI HEALTH ASSIST',
                      '       LAB REPORT',
                      '═══════════════════════════════════════════',
                      '',
                      `Test:     ${selected.testName}`,
                      `Patient:  ${selected.patientName}`,
                      `Date:     ${selected.date}`,
                      `Status:   ${selected.status.toUpperCase()}`,
                      '',
                      '───────────────────────────────────────────',
                      'RESULTS',
                      '───────────────────────────────────────────',
                      '',
                      ...selected.results.map((r) =>
                        `${r.parameter.padEnd(22)} ${r.value.padEnd(16)} Range: ${r.normalRange.padEnd(14)} [${r.status.toUpperCase()}]`
                      ),
                      '',
                      '═══════════════════════════════════════════',
                      'Note: This report is for informational purposes.',
                      'Please consult your doctor for interpretation.',
                      '═══════════════════════════════════════════',
                    ];
                    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `lab-report-${selected.testName.replace(/\s+/g, '-').toLowerCase()}-${selected.date}.txt`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  className="mt-4 w-full py-2.5 rounded-xl border border-border hover:bg-muted transition text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download Report
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
