'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Plus, Download, X, Check, Calendar, Pill, User, Stethoscope } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { cn } from '@/lib/utils';
import { getRole } from '@/lib/store';
import { getSession } from '@/lib/auth';
import { UserRole } from '@/lib/types';
import { getPrescriptions, addPrescription, Prescription, seedCommunicationData } from '@/lib/communication';

export default function PrescriptionsPage() {
  const [role, setRoleState] = useState<UserRole | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [selected, setSelected] = useState<Prescription | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Create form
  const [patientName, setPatientName] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', duration: '', notes: '' }]);
  const [advice, setAdvice] = useState('');
  const [followUp, setFollowUp] = useState('');

  useEffect(() => {
    setMounted(true);
    seedCommunicationData();
    const r = getRole();
    setRoleState(r);
    setPrescriptions(getPrescriptions());
  }, []);

  function refresh() { setPrescriptions(getPrescriptions()); }

  function addMedicineLine() {
    setMedicines([...medicines, { name: '', dosage: '', duration: '', notes: '' }]);
  }

  function updateMedicine(idx: number, field: string, value: string) {
    const updated = [...medicines];
    (updated[idx] as any)[field] = value;
    setMedicines(updated);
  }

  function removeMedicine(idx: number) {
    if (medicines.length > 1) setMedicines(medicines.filter((_, i) => i !== idx));
  }

  function handleCreate() {
    if (!patientName || !diagnosis || !medicines[0].name) return;
    const session = getSession();
    addPrescription({
      doctorName: session?.name || 'Doctor',
      doctorId: session?.userId || 'unknown',
      patientName,
      patientId: 'patient',
      diagnosis,
      medicines: medicines.filter((m) => m.name),
      advice: advice.split('\n').filter((a) => a.trim()),
      followUpDate: followUp,
    });
    setPatientName(''); setDiagnosis(''); setMedicines([{ name: '', dosage: '', duration: '', notes: '' }]); setAdvice(''); setFollowUp('');
    setShowCreate(false);
    refresh();
  }

  function downloadPrescription(rx: Prescription) {
    const lines = [
      '═══════════════════════════════════════════════',
      '          AI HEALTH ASSIST',
      '       MEDICAL PRESCRIPTION',
      '═══════════════════════════════════════════════',
      '',
      `Doctor:    ${rx.doctorName}`,
      `Patient:   ${rx.patientName}`,
      `Date:      ${rx.date}`,
      `Diagnosis: ${rx.diagnosis}`,
      '',
      '───────────────────────────────────────────────',
      'MEDICINES',
      '───────────────────────────────────────────────',
      '',
      ...rx.medicines.map((m, i) => `${i + 1}. ${m.name}\n   Dosage: ${m.dosage}\n   Duration: ${m.duration}${m.notes ? `\n   Notes: ${m.notes}` : ''}\n`),
      '───────────────────────────────────────────────',
      'ADVICE',
      '───────────────────────────────────────────────',
      '',
      ...rx.advice.map((a) => `• ${a}`),
      '',
      rx.followUpDate ? `Follow-up: ${rx.followUpDate}` : '',
      '',
      '═══════════════════════════════════════════════',
      '       This is a computer-generated prescription.',
      '═══════════════════════════════════════════════',
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `prescription-${rx.patientName.replace(/\s/g, '-')}-${rx.date}.txt`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  }

  if (!mounted || !role) return null;
  const isDoctor = role === 'doctor';

  return (
    <AppShell>
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">Prescriptions</h1>
            <p className="text-muted-foreground mt-1">{isDoctor ? 'Write and manage prescriptions for patients' : 'View prescriptions from your doctor'}</p>
          </div>
          {isDoctor && (
            <button onClick={() => setShowCreate(!showCreate)}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition shadow-md">
              <Plus className="w-4 h-4" /> Write Prescription
            </button>
          )}
        </motion.div>

        {/* Create Prescription Form (Doctor only) */}
        <AnimatePresence>
          {showCreate && isDoctor && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <h2 className="font-display font-semibold text-lg">New Prescription</h2>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Patient Name *</label>
                  <input type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="Enter patient name"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Diagnosis *</label>
                  <input type="text" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="e.g., Type 2 Diabetes Mellitus"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Medicines *</label>
                {medicines.map((med, idx) => (
                  <div key={idx} className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-2">
                    <input type="text" value={med.name} onChange={(e) => updateMedicine(idx, 'name', e.target.value)} placeholder="Medicine name"
                      className="px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none col-span-2 md:col-span-1" />
                    <input type="text" value={med.dosage} onChange={(e) => updateMedicine(idx, 'dosage', e.target.value)} placeholder="Dosage"
                      className="px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none" />
                    <input type="text" value={med.duration} onChange={(e) => updateMedicine(idx, 'duration', e.target.value)} placeholder="Duration"
                      className="px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none" />
                    <input type="text" value={med.notes} onChange={(e) => updateMedicine(idx, 'notes', e.target.value)} placeholder="Notes"
                      className="px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none" />
                    <button onClick={() => removeMedicine(idx)} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition self-center">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button onClick={addMedicineLine} className="text-xs text-primary hover:underline font-medium mt-1">+ Add another medicine</button>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Advice (one per line)</label>
                <textarea value={advice} onChange={(e) => setAdvice(e.target.value)} placeholder="Monitor blood sugar daily&#10;Low salt diet&#10;30 min walk daily"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none resize-none focus:ring-2 focus:ring-primary/30" rows={3} />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Follow-up Date</label>
                <input type="date" value={followUp} onChange={(e) => setFollowUp(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none" />
              </div>

              <button onClick={handleCreate} disabled={!patientName || !diagnosis || !medicines[0].name}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition disabled:opacity-40 shadow-md">
                <Check className="w-4 h-4" /> Issue Prescription
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Prescriptions List */}
        <div className="space-y-3">
          {prescriptions.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-display font-medium">No prescriptions yet</p>
            </div>
          ) : prescriptions.map((rx, i) => (
            <motion.div key={rx.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelected(rx)}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-chart-3/10 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-chart-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm">{rx.diagnosis}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Stethoscope className="w-3 h-3" /> {rx.doctorName}</span>
                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {rx.patientName}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {rx.date}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {rx.medicines.slice(0, 3).map((m, j) => (
                      <span key={j} className="text-[10px] px-2 py-0.5 rounded-full bg-chart-3/10 text-chart-3 font-medium flex items-center gap-0.5">
                        <Pill className="w-2.5 h-2.5" /> {m.name}
                      </span>
                    ))}
                    {rx.medicines.length > 3 && <span className="text-[10px] text-muted-foreground">+{rx.medicines.length - 3} more</span>}
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); downloadPrescription(rx); }}
                  className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition" title="Download">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

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
                    <h2 className="font-display font-bold text-lg">Prescription</h2>
                    <p className="text-xs text-muted-foreground mt-1">{selected.doctorName} · {selected.date}</p>
                  </div>
                  <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
                </div>
                <div className="bg-muted/50 rounded-xl p-3 mb-4 space-y-1">
                  <p className="text-sm"><strong>Patient:</strong> {selected.patientName}</p>
                  <p className="text-sm"><strong>Diagnosis:</strong> {selected.diagnosis}</p>
                  {selected.followUpDate && <p className="text-sm"><strong>Follow-up:</strong> {selected.followUpDate}</p>}
                </div>
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><Pill className="w-4 h-4 text-chart-3" /> Medicines</h3>
                <div className="space-y-2 mb-4">
                  {selected.medicines.map((m, i) => (
                    <div key={i} className="bg-chart-3/5 border border-chart-3/20 rounded-xl p-3">
                      <p className="text-sm font-semibold">{i + 1}. {m.name}</p>
                      <p className="text-xs text-muted-foreground">Dosage: {m.dosage} · Duration: {m.duration}</p>
                      {m.notes && <p className="text-xs text-muted-foreground mt-0.5">Note: {m.notes}</p>}
                    </div>
                  ))}
                </div>
                {selected.advice.length > 0 && (
                  <>
                    <h3 className="font-semibold text-sm mb-2">Advice</h3>
                    <ul className="space-y-1 mb-4">
                      {selected.advice.map((a, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-chart-3 mt-0.5">•</span> {a}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                <button onClick={() => downloadPrescription(selected)}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition flex items-center justify-center gap-2 shadow-md">
                  <Download className="w-4 h-4" /> Download Prescription
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
