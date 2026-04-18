'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CreditCard, Ticket, Check, IndianRupee, Building, User,
  Smartphone, Banknote, QrCode, Receipt, Download, Clock,
  ChevronDown, Printer, ArrowLeft,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { cn } from '@/lib/utils';
import { DEPARTMENTS } from '@/lib/mock-data';

const PAYMENT_HISTORY_KEY = 'aihealthassist_payment_history';

interface PaymentRecord {
  id: string;
  patientName: string;
  department: string;
  feeType: string;
  amount: number;
  method: string;
  tokenNumber: number;
  date: string;
  time: string;
  transactionId: string;
}

const FEE_TYPES = [
  { id: 'consultation', label: 'Consultation Fee', amount: 500, icon: '🩺' },
  { id: 'registration', label: 'Registration Fee', amount: 200, icon: '📋' },
  { id: 'lab', label: 'Lab Test Fee', amount: 800, icon: '🧪' },
  { id: 'pharmacy', label: 'Pharmacy Bill', amount: 350, icon: '💊' },
  { id: 'admission', label: 'Admission Deposit', amount: 5000, icon: '🏥' },
  { id: 'xray', label: 'X-Ray / Imaging', amount: 1200, icon: '📷' },
];

const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI / Google Pay', icon: Smartphone, desc: 'Pay via UPI ID' },
  { id: 'card', label: 'Debit / Credit Card', icon: CreditCard, desc: 'Visa, Mastercard, RuPay' },
  { id: 'cash', label: 'Cash at Counter', icon: Banknote, desc: 'Pay at reception' },
  { id: 'qr', label: 'Scan QR Code', icon: QrCode, desc: 'Scan & pay instantly' },
];

function getPaymentHistory(): PaymentRecord[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(PAYMENT_HISTORY_KEY) || '[]'); } catch { return []; }
}

function savePaymentHistory(records: PaymentRecord[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PAYMENT_HISTORY_KEY, JSON.stringify(records));
}

function getNextPaymentToken(): number {
  if (typeof window === 'undefined') return 1;
  const key = 'aihealthassist_payment_token_counter';
  const current = parseInt(localStorage.getItem(key) || '100', 10);
  const next = current + 1;
  localStorage.setItem(key, next.toString());
  return next;
}

function generateTransactionId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'TXN';
  for (let i = 0; i < 10; i++) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

function downloadReceipt(record: PaymentRecord) {
  const receipt = `
═══════════════════════════════════════════
          AI HEALTH ASSIST
       PAYMENT RECEIPT
═══════════════════════════════════════════

Transaction ID:  ${record.transactionId}
Date:            ${record.date}
Time:            ${record.time}

───────────────────────────────────────────
PATIENT DETAILS
───────────────────────────────────────────
Name:            ${record.patientName}
Department:      ${record.department || 'General'}

───────────────────────────────────────────
PAYMENT DETAILS
───────────────────────────────────────────
Fee Type:        ${record.feeType}
Payment Method:  ${record.method}
Amount Paid:     ₹${record.amount.toLocaleString()}

───────────────────────────────────────────
QUEUE TOKEN
───────────────────────────────────────────

         *** TOKEN #${record.tokenNumber} ***

Show this token at the reception counter.
No waiting in queue required!

═══════════════════════════════════════════
   Thank you for choosing AI Health Assist
═══════════════════════════════════════════
`.trim();

  const blob = new Blob([receipt], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `receipt-${record.transactionId}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function PaymentPage() {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');
  const [selectedFee, setSelectedFee] = useState('');
  const [dept, setDept] = useState('');
  const [patientName, setPatientName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [currentRecord, setCurrentRecord] = useState<PaymentRecord | null>(null);
  const [history, setHistory] = useState<PaymentRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setMounted(true);
    setHistory(getPaymentHistory());
  }, []);

  function handlePay() {
    if (!selectedFee || !patientName || !paymentMethod) return;

    setStep('processing');
    setProgress(0);

    // Simulate payment processing with progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);

      const fee = FEE_TYPES.find((f) => f.id === selectedFee)!;
      const now = new Date();
      const record: PaymentRecord = {
        id: `pay-${Date.now()}`,
        patientName,
        department: dept || 'General',
        feeType: fee.label,
        amount: fee.amount,
        method: PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label || paymentMethod,
        tokenNumber: getNextPaymentToken(),
        date: now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        transactionId: generateTransactionId(),
      };

      setCurrentRecord(record);
      const updated = [record, ...history];
      setHistory(updated);
      savePaymentHistory(updated);
      setStep('success');
    }, 2500);
  }

  function resetForm() {
    setStep('form');
    setSelectedFee('');
    setDept('');
    setPatientName('');
    setPaymentMethod('');
    setCurrentRecord(null);
    setProgress(0);
  }

  if (!mounted) return null;

  return (
    <AppShell>
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">Payment & Token</h1>
            <p className="text-muted-foreground mt-1">Pay hospital fees online and get your queue token instantly.</p>
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-muted transition text-sm font-medium"
          >
            <Receipt className="w-4 h-4" />
            History ({history.length})
          </button>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* ====== FORM STEP ====== */}
          {step === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-card border border-border rounded-2xl p-6 space-y-6"
            >
              {/* Patient Name */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Patient Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Enter patient full name"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Department</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <select value={dept} onChange={(e) => setDept(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/30 outline-none appearance-none">
                    <option value="">Select department (optional)</option>
                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Fee Type */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Fee Type *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {FEE_TYPES.map((fee) => (
                    <button key={fee.id} onClick={() => setSelectedFee(fee.id)}
                      className={cn(
                        'flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all',
                        selectedFee === fee.id
                          ? 'bg-primary/10 border-primary shadow-sm ring-1 ring-primary/20'
                          : 'border-border hover:bg-muted hover:border-muted-foreground/20'
                      )}>
                      <span className="text-xl">{fee.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{fee.label}</p>
                        <p className="text-xs font-bold text-primary flex items-center gap-0.5 mt-0.5">
                          <IndianRupee className="w-3 h-3" />{fee.amount.toLocaleString()}
                        </p>
                      </div>
                      {selectedFee === fee.id && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Payment Method *</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {PAYMENT_METHODS.map((method) => (
                    <button key={method.id} onClick={() => setPaymentMethod(method.id)}
                      className={cn(
                        'flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all',
                        paymentMethod === method.id
                          ? 'bg-primary/10 border-primary shadow-sm ring-1 ring-primary/20'
                          : 'border-border hover:bg-muted'
                      )}>
                      <method.icon className={cn('w-6 h-6', paymentMethod === method.id ? 'text-primary' : 'text-muted-foreground')} />
                      <div>
                        <p className="text-xs font-semibold">{method.label}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{method.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              {selectedFee && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-muted/50 border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Fee Type</span>
                    <span className="text-sm font-medium">{FEE_TYPES.find((f) => f.id === selectedFee)?.label}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">GST (0%)</span>
                    <span className="text-sm font-medium">₹0</span>
                  </div>
                  <div className="border-t border-border my-2" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Total Amount</span>
                    <span className="text-xl font-bold font-display text-primary flex items-center gap-0.5">
                      <IndianRupee className="w-4 h-4" />
                      {FEE_TYPES.find((f) => f.id === selectedFee)?.amount.toLocaleString()}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Pay Button */}
              <button
                onClick={handlePay}
                disabled={!selectedFee || !patientName || !paymentMethod}
                className={cn(
                  'w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg',
                  !selectedFee || !patientName || !paymentMethod
                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                    : 'bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.99]'
                )}
              >
                <CreditCard className="w-5 h-5" />
                Pay ₹{selectedFee ? FEE_TYPES.find((f) => f.id === selectedFee)?.amount.toLocaleString() : '0'} & Get Token
              </button>
            </motion.div>
          )}

          {/* ====== PROCESSING STEP ====== */}
          {step === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border rounded-2xl p-10 text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 relative">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="35" fill="none" stroke="var(--border)" strokeWidth="4" />
                  <circle cx="40" cy="40" r="35" fill="none" stroke="var(--primary)" strokeWidth="4"
                    strokeDasharray={`${Math.min(progress, 100) * 2.2} 220`}
                    strokeLinecap="round" className="transition-all duration-300" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <CreditCard className="w-8 h-8 text-primary animate-pulse" />
                </div>
              </div>
              <h2 className="font-display font-bold text-xl">Processing Payment...</h2>
              <p className="text-muted-foreground text-sm mt-2">Please wait while we process your transaction.</p>
              <div className="mt-6 max-w-xs mx-auto">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    animate={{ width: `${Math.min(progress, 100)}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">{Math.min(Math.round(progress), 100)}% complete</p>
              </div>
              <div className="mt-6 space-y-2 text-xs text-muted-foreground">
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: progress > 10 ? 1 : 0 }}>Verifying details...</motion.p>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: progress > 40 ? 1 : 0 }}>Connecting to payment gateway...</motion.p>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: progress > 70 ? 1 : 0 }}>Confirming transaction...</motion.p>
              </div>
            </motion.div>
          )}

          {/* ====== SUCCESS STEP ====== */}
          {step === 'success' && currentRecord && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border rounded-2xl overflow-hidden"
            >
              {/* Green Banner */}
              <div className="bg-gradient-to-r from-chart-3/20 to-accent/20 p-6 text-center border-b border-border">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 10, stiffness: 200, delay: 0.2 }}
                  className="w-16 h-16 rounded-full bg-chart-3/20 flex items-center justify-center mx-auto mb-3"
                >
                  <Check className="w-8 h-8 text-chart-3" />
                </motion.div>
                <h2 className="font-display font-bold text-xl text-chart-3">Payment Successful!</h2>
                <p className="text-sm text-muted-foreground mt-1">Transaction ID: {currentRecord.transactionId}</p>
              </div>

              {/* Token */}
              <div className="p-6 text-center border-b border-border">
                <p className="text-xs text-muted-foreground mb-2">Your Queue Token Number</p>
                <motion.p
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4, type: 'spring', damping: 10 }}
                  className="text-6xl font-display font-extrabold text-primary"
                >
                  #{currentRecord.tokenNumber}
                </motion.p>
                <p className="text-xs text-muted-foreground mt-2">Show this token at the reception — skip the queue!</p>
              </div>

              {/* Receipt Details */}
              <div className="p-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Patient</span>
                  <span className="font-medium">{currentRecord.patientName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Department</span>
                  <span className="font-medium">{currentRecord.department}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fee Type</span>
                  <span className="font-medium">{currentRecord.feeType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="font-medium">{currentRecord.method}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Date & Time</span>
                  <span className="font-medium">{currentRecord.date}, {currentRecord.time}</span>
                </div>
                <div className="border-t border-border my-2" />
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">Amount Paid</span>
                  <span className="text-lg font-bold text-primary flex items-center gap-0.5">
                    <IndianRupee className="w-4 h-4" />{currentRecord.amount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 pt-0 flex flex-col sm:flex-row gap-3">
                <button onClick={() => downloadReceipt(currentRecord)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition shadow-md">
                  <Download className="w-4 h-4" /> Download Receipt
                </button>
                <button onClick={resetForm}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-border hover:bg-muted transition text-sm font-medium">
                  <ArrowLeft className="w-4 h-4" /> Make Another Payment
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ====== PAYMENT HISTORY ====== */}
        <AnimatePresence>
          {showHistory && history.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-card border border-border rounded-2xl">
                <div className="px-5 py-4 border-b border-border flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-display font-semibold text-sm">Payment History</h3>
                </div>
                <div className="divide-y divide-border">
                  {history.map((record) => (
                    <div key={record.id} className="px-5 py-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-chart-3/10 flex items-center justify-center shrink-0">
                        <Check className="w-5 h-5 text-chart-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{record.feeType}</p>
                        <p className="text-xs text-muted-foreground">{record.patientName} · {record.date} · Token #{record.tokenNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold flex items-center gap-0.5 justify-end">
                          <IndianRupee className="w-3 h-3" />{record.amount.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{record.transactionId}</p>
                      </div>
                      <button onClick={() => downloadReceipt(record)}
                        className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition"
                        title="Download Receipt">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {showHistory && history.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Receipt className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No payment history yet. Make your first payment above!</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
