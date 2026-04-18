'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar, Clock, User, Check, Plus, Ticket,
  X, ChevronDown, Ban, CheckCircle,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { cn } from '@/lib/utils';
import { UserRole, Appointment } from '@/lib/types';
import { getRole } from '@/lib/store';
import { getSession } from '@/lib/auth';
import { MOCK_APPOINTMENTS, DEPARTMENTS, DOCTORS } from '@/lib/mock-data';

// Use API with localStorage fallback
async function loadAppointmentsFromAPI(): Promise<Appointment[]> {
  try {
    const res = await fetch('/api/appointments');
    const json = await res.json();
    if (json.success && json.data?.length > 0) return json.data;
  } catch {}
  // Fallback
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('aihealthassist_appointments_v2');
    if (raw) return JSON.parse(raw);
    localStorage.setItem('aihealthassist_appointments_v2', JSON.stringify(MOCK_APPOINTMENTS));
    return MOCK_APPOINTMENTS;
  } catch { return MOCK_APPOINTMENTS; }
}

function persistLocal(appts: Appointment[]) {
  if (typeof window !== 'undefined') localStorage.setItem('aihealthassist_appointments_v2', JSON.stringify(appts));
}

async function createAppointmentAPI(appt: Omit<Appointment, 'id' | 'tokenNumber' | 'status'>) {
  try {
    const res = await fetch('/api/appointments', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appt),
    });
    const json = await res.json();
    if (json.success) return json.data;
  } catch {}
  return null;
}

function getNextApptToken(): number {
  if (typeof window === 'undefined') return 1;
  const key = 'aihealthassist_appt_token';
  const current = parseInt(localStorage.getItem(key) || '50', 10);
  const next = current + 1;
  localStorage.setItem(key, next.toString());
  return next;
}

export default function AppointmentsPage() {
  const [role, setRoleState] = useState<UserRole | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showBooking, setShowBooking] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const [patientName, setPatientName] = useState('');
  const [dept, setDept] = useState('');
  const [doctor, setDoctor] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [booked, setBooked] = useState<{ token: number; doctor: string; date: string; time: string } | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setRoleState(getRole());
    const session = getSession();
    if (session) setPatientName(session.name);
    loadAppointmentsFromAPI().then(setAppointments);
  }, []);

  const filteredDoctors = DOCTORS.filter((d) => !dept || d.department === dept);
  const selectedDoctor = DOCTORS.find((d) => d.name === doctor);
  const filteredAppointments = appointments.filter((a) => !statusFilter || a.status === statusFilter);

  async function handleBook() {
    if (!dept || !doctor || !date || !time || !patientName) return;

    // Try API first
    const apiResult = await createAppointmentAPI({ patientName, doctorName: doctor, department: dept, date, time });

    let token: number;
    let newAppt: Appointment;

    if (apiResult) {
      token = apiResult.tokenNumber;
      newAppt = apiResult;
    } else {
      token = getNextApptToken();
      newAppt = { id: `a-${Date.now()}`, patientName, doctorName: doctor, department: dept, date, time, tokenNumber: token, status: 'scheduled' };
    }

    const updated = [newAppt, ...appointments];
    setAppointments(updated);
    persistLocal(updated);
    setBooked({ token, doctor, date, time });
    setShowBooking(false);
    setDept(''); setDoctor(''); setDate(''); setTime('');
  }

  function handleCancel(id: string) {
    const updated = appointments.map((a) => a.id === id ? { ...a, status: 'cancelled' as const } : a);
    setAppointments(updated);
    persistLocal(updated);
    setCancelConfirm(null);
    // Fire-and-forget API update
    fetch('/api/appointments', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: 'cancelled' }) }).catch(() => {});
  }

  function handleComplete(id: string) {
    const updated = appointments.map((a) => a.id === id ? { ...a, status: 'completed' as const } : a);
    setAppointments(updated);
    persistLocal(updated);
    fetch('/api/appointments', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: 'completed' }) }).catch(() => {});
  }

  if (!mounted || !role) return null;
  const isPatient = role === 'patient';
  const isDoctor = role === 'doctor';
  const scheduledCount = appointments.filter((a) => a.status === 'scheduled').length;
  const completedCount = appointments.filter((a) => a.status === 'completed').length;
  const cancelledCount = appointments.filter((a) => a.status === 'cancelled').length;

  return (
    <AppShell>
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">Appointments</h1>
            <p className="text-muted-foreground mt-1">{isPatient ? 'Book and manage your appointments' : 'View and manage patient appointments'}</p>
          </div>
          {isPatient && (
            <button onClick={() => { setShowBooking(!showBooking); setBooked(null); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition shadow-md">
              <Plus className="w-4 h-4" /> Book New
            </button>
          )}
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold font-display text-primary">{scheduledCount}</p>
            <p className="text-xs text-muted-foreground">Scheduled</p>
          </div>
          <div className="bg-chart-3/5 border border-chart-3/20 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold font-display text-chart-3">{completedCount}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold font-display text-destructive">{cancelledCount}</p>
            <p className="text-xs text-muted-foreground">Cancelled</p>
          </div>
        </div>

        {/* Token Confirmation */}
        <AnimatePresence>
          {booked && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-chart-3/10 border border-chart-3/30 rounded-2xl p-6 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 10, delay: 0.2 }}
                className="w-16 h-16 rounded-full bg-chart-3/20 flex items-center justify-center mx-auto mb-4">
                <Ticket className="w-8 h-8 text-chart-3" />
              </motion.div>
              <h3 className="font-display font-bold text-xl text-chart-3">Appointment Booked!</h3>
              <motion.p initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring', damping: 10 }}
                className="text-4xl font-display font-extrabold text-primary mt-3">Token #{booked.token}</motion.p>
              <p className="text-sm text-muted-foreground mt-3">With <strong>{booked.doctor}</strong> on <strong>{booked.date}</strong> at <strong>{booked.time}</strong></p>
              <p className="text-xs text-muted-foreground mt-1">Show this token at the reception — no queue needed!</p>
              <button onClick={() => setBooked(null)} className="mt-4 px-5 py-2 text-xs rounded-xl bg-card border border-border hover:bg-muted transition font-medium">Got it</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Booking Form */}
        <AnimatePresence>
          {showBooking && isPatient && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="bg-card border border-border rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-semibold text-lg">Book an Appointment</h2>
                <button onClick={() => setShowBooking(false)} className="p-2 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Patient Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="Enter patient name"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/30 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Department *</label>
                  <div className="relative">
                    <select value={dept} onChange={(e) => { setDept(e.target.value); setDoctor(''); setTime(''); }}
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/30 outline-none appearance-none">
                      <option value="">Select department</option>
                      {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Doctor *</label>
                  <div className="relative">
                    <select value={doctor} onChange={(e) => { setDoctor(e.target.value); setTime(''); }}
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/30 outline-none appearance-none" disabled={!dept}>
                      <option value="">{dept ? 'Select doctor' : 'Select department first'}</option>
                      {filteredDoctors.map((d) => <option key={d.name} value={d.name}>{d.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Date *</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/30 outline-none" />
                </div>
              </div>
              {selectedDoctor && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">Available Time Slots *</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedDoctor.available.map((t) => (
                      <button key={t} onClick={() => setTime(t)}
                        className={cn('px-4 py-2 rounded-xl text-sm font-medium border transition-all',
                          time === t ? 'bg-primary/10 border-primary text-primary ring-1 ring-primary/20' : 'border-border hover:bg-muted'
                        )}><Clock className="w-3 h-3 inline mr-1.5" />{t}</button>
                    ))}
                  </div>
                </div>
              )}
              {dept && doctor && date && time && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-muted/50 border border-border rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Patient</span><span className="font-medium">{patientName}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Doctor</span><span className="font-medium">{doctor}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Date & Time</span><span className="font-medium">{date} at {time}</span></div>
                </motion.div>
              )}
              <button onClick={handleBook} disabled={!dept || !doctor || !date || !time || !patientName}
                className={cn('w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md',
                  !dept || !doctor || !date || !time || !patientName ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-primary text-primary-foreground hover:opacity-90'
                )}><Check className="w-4 h-4" /> Confirm & Get Token</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter */}
        <div className="flex gap-1 bg-muted rounded-xl p-1">
          {['', 'scheduled', 'completed', 'cancelled'].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={cn('flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all capitalize',
                statusFilter === s ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}>{s || 'All'} ({s === '' ? appointments.length : appointments.filter((a) => a.status === s).length})</button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-3">
          {filteredAppointments.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="text-sm">No appointments found.</p>
            </div>
          )}
          {filteredAppointments.map((appt, i) => (
            <motion.div key={appt.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className={cn('bg-card border border-border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4', appt.status === 'cancelled' && 'opacity-60')}>
              <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
                appt.status === 'scheduled' ? 'bg-primary/10' : appt.status === 'completed' ? 'bg-chart-3/10' : 'bg-destructive/10')}>
                {appt.status === 'scheduled' ? <Calendar className="w-5 h-5 text-primary" /> :
                 appt.status === 'completed' ? <CheckCircle className="w-5 h-5 text-chart-3" /> :
                 <Ban className="w-5 h-5 text-destructive" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{isPatient ? appt.doctorName : appt.patientName}</p>
                <p className="text-xs text-muted-foreground">{appt.department}</p>
                <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{appt.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{appt.time}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground">Token</p>
                  <p className="text-lg font-bold font-display text-primary">#{appt.tokenNumber}</p>
                </div>
                <span className={cn('text-[10px] px-2.5 py-1 rounded-full font-medium capitalize',
                  appt.status === 'scheduled' ? 'bg-primary/10 text-primary' : appt.status === 'completed' ? 'bg-chart-3/10 text-chart-3' : 'bg-destructive/10 text-destructive'
                )}>{appt.status}</span>
                {appt.status === 'scheduled' && (
                  <div className="flex items-center gap-1">
                    {isDoctor && (
                      <button onClick={() => handleComplete(appt.id)} className="p-1.5 rounded-lg bg-chart-3/10 text-chart-3 hover:bg-chart-3/20 transition" title="Complete">
                        <CheckCircle className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {cancelConfirm === appt.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleCancel(appt.id)} className="px-2 py-1 text-[10px] rounded-lg bg-destructive text-destructive-foreground font-medium">Yes</button>
                        <button onClick={() => setCancelConfirm(null)} className="px-2 py-1 text-[10px] rounded-lg border border-border font-medium hover:bg-muted">No</button>
                      </div>
                    ) : (
                      <button onClick={() => setCancelConfirm(appt.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition" title="Cancel">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
