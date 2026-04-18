'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Heart, Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserRole } from '@/lib/types';
import { registerUser, loginUser } from '@/lib/auth';
import { setRole } from '@/lib/store';

interface FieldConfig {
  name: string;
  label: string;
  type: string;
  placeholder: string;
  required: boolean;
  options?: { value: string; label: string }[];
}

const ROLE_COLORS: Record<string, { gradient: string; accent: string }> = {
  patient: { gradient: 'from-blue-500 to-cyan-500', accent: 'text-blue-600 dark:text-blue-400' },
  student: { gradient: 'from-emerald-500 to-teal-500', accent: 'text-emerald-600 dark:text-emerald-400' },
  doctor: { gradient: 'from-green-500 to-lime-500', accent: 'text-green-600 dark:text-green-400' },
  professor: { gradient: 'from-purple-500 to-violet-500', accent: 'text-purple-600 dark:text-purple-400' },
  admin: { gradient: 'from-red-500 to-orange-500', accent: 'text-red-600 dark:text-red-400' },
};

const ROLE_ICONS: Record<string, string> = {
  patient: '🏥', student: '🎓', doctor: '👨‍⚕️', professor: '👩‍🏫', admin: '🔐',
};

interface AuthFormProps {
  mode: 'login' | 'register';
  role: UserRole | 'admin';
  roleLabel: string;
  extraFields?: FieldConfig[];
}

export function AuthForm({ mode, role, roleLabel, extraFields = [] }: AuthFormProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [extras, setExtras] = useState<Record<string, string>>({});

  const colors = ROLE_COLORS[role] ?? ROLE_COLORS.patient;
  const icon = ROLE_ICONS[role] ?? '🏥';

  function handleExtraChange(fieldName: string, value: string) {
    setExtras((prev) => ({ ...prev, [fieldName]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (mode === 'register') {
      if (!name || !email || !password) {
        setError('Please fill in all required fields.');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        setLoading(false);
        return;
      }

      await new Promise((r) => setTimeout(r, 600));
      const result = registerUser({
        name,
        email,
        password,
        role,
        phone: phone || undefined,
        specialization: extras.specialization || undefined,
        department: extras.department || undefined,
        studentId: extras.studentId || undefined,
        year: extras.year || undefined,
        employeeId: extras.employeeId || undefined,
      });

      if (!result.success) {
        setError(result.error || 'Registration failed.');
        setLoading(false);
        return;
      }

      if (result.user?.status === 'pending') {
        setSuccess('Registration successful! Your account is pending admin approval. You will be notified once approved.');
      } else {
        setSuccess('Registration successful! Redirecting to login...');
        setTimeout(() => {
          router.push(`/auth/${role}?mode=login`);
        }, 1500);
      }
    } else {
      await new Promise((r) => setTimeout(r, 600));
      
      if (!email || !password) {
        setError('Please enter your email and password.');
        setLoading(false);
        return;
      }

      try {
        const result = loginUser(email, password, role);
        if (!result.success) {
          setError(result.error || 'Login failed. Please check your credentials.');
          setLoading(false);
          return;
        }

        if (role !== 'admin') {
          setRole(role as UserRole);
        }

        setSuccess('Login successful! Redirecting...');
        setLoading(false);

        const redirectUrl = role === 'admin' ? '/admin' : '/dashboard';
        window.location.href = redirectUrl;
      } catch (err) {
        setError('An error occurred. Please try again.');
        setLoading(false);
        console.error('Login error:', err);
      }
      return;
    }

    setLoading(false);
  }

  const needsApproval = mode === 'register' && (role === 'doctor' || role === 'professor');

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className={cn('hidden lg:flex lg:w-[45%] bg-gradient-to-br text-white flex-col justify-between p-10', colors.gradient)}>
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg">AI Health Assist</span>
          </Link>
        </div>
        <div>
          <div className="text-6xl mb-6">{icon}</div>
          <h2 className="text-3xl font-display font-extrabold leading-tight">
            {mode === 'login' ? `Welcome Back,` : `Join as`}<br />
            {roleLabel}
          </h2>
          <p className="mt-4 text-white/80 max-w-sm leading-relaxed">
            {role === 'patient' && 'Access AI health chat, book appointments, track your health habits, and manage lab reports.'}
            {role === 'student' && 'Get AI tutoring, study notes, video lectures, and previous year papers — all in one place.'}
            {role === 'doctor' && 'Manage patients, appointments, digital reports, and get AI clinical assistance.'}
            {role === 'professor' && 'Share materials, answer student queries, manage class schedules, and use AI teaching tools.'}
            {role === 'admin' && 'Manage users, approve registrations, monitor platform activity, and maintain system health.'}
          </p>
        </div>
        <p className="text-white/50 text-xs">AI Health Assist — Multi-Role Healthcare Platform</p>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile back + branding */}
          <div className="lg:hidden mb-8">
            <Link href="/select-role" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition mb-6">
              <ArrowLeft className="w-4 h-4" /> Back to role selection
            </Link>
            <div className="flex items-center gap-3">
              <div className={cn('w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center', colors.gradient)}>
                <span className="text-2xl">{icon}</span>
              </div>
              <div>
                <h1 className="font-display font-bold text-xl">{mode === 'login' ? 'Login' : 'Register'}</h1>
                <p className="text-sm text-muted-foreground">{roleLabel}</p>
              </div>
            </div>
          </div>

          {/* Desktop header */}
          <div className="hidden lg:block mb-8">
            <Link href="/select-role" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition mb-4">
              <ArrowLeft className="w-4 h-4" /> Back to role selection
            </Link>
            <h1 className="text-2xl font-display font-bold">
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {mode === 'login'
                ? `Enter your credentials to access your ${roleLabel.toLowerCase()} dashboard.`
                : `Fill in the details below to register as a ${roleLabel.toLowerCase()}.`}
            </p>
          </div>

          {needsApproval && mode === 'register' && (
            <div className="bg-chart-5/10 border border-chart-5/30 rounded-xl p-3 mb-6 text-xs text-chart-5">
              <strong>Note:</strong> {roleLabel} accounts require admin approval before access is granted.
            </div>
          )}

          {/* Error / Success */}
          {error && (
            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
              className="bg-destructive/10 border border-destructive/30 text-destructive rounded-xl p-3 mb-4 text-sm">
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
              className="bg-chart-3/10 border border-chart-3/30 text-chart-3 rounded-xl p-3 mb-4 text-sm">
              {success}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Full Name *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your full name"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" required />
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email Address *</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" required />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Password *</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? 'Min 6 characters' : 'Enter your password'}
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Phone Number</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9876543210"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
              </div>
            )}

            {/* Extra role-specific fields */}
            {mode === 'register' && extraFields.map((field) => (
              <div key={field.name}>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  {field.label} {field.required && '*'}
                </label>
                {field.options ? (
                  <select value={extras[field.name] || ''} onChange={(e) => handleExtraChange(field.name, e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/30 outline-none"
                    required={field.required}>
                    <option value="">{field.placeholder}</option>
                    {field.options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                ) : (
                  <input type={field.type} value={extras[field.name] || ''} onChange={(e) => handleExtraChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                    required={field.required} />
                )}
              </div>
            ))}

            <button type="submit" disabled={loading}
              className={cn('w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md',
                'bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50'
              )}>
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> {mode === 'login' ? 'Signing in...' : 'Creating account...'}</>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          {/* Toggle login/register */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            {mode === 'login' ? (
              <>Don&apos;t have an account?{' '}
                {role !== 'admin' ? (
                  <Link href={`/auth/${role}?mode=register`} className={cn('font-semibold hover:underline', colors.accent)}>
                    Register here
                  </Link>
                ) : (
                  <span className="text-muted-foreground">Contact system administrator</span>
                )}
              </>
            ) : (
              <>Already have an account?{' '}
                <Link href={`/auth/${role}?mode=login`} className={cn('font-semibold hover:underline', colors.accent)}>
                  Sign in
                </Link>
              </>
            )}
          </p>

          {/* Demo credentials for hackathon */}
          {mode === 'login' && (
            <div className="mt-6 bg-muted/50 rounded-xl p-4 text-xs text-muted-foreground">
              <p className="font-semibold mb-1">Demo Credentials:</p>
              {role === 'patient' && <p>Email: <code className="bg-muted px-1 rounded">rahul@patient.com</code> · Pass: <code className="bg-muted px-1 rounded">pass123</code></p>}
              {role === 'student' && <p>Email: <code className="bg-muted px-1 rounded">arjun@student.com</code> · Pass: <code className="bg-muted px-1 rounded">pass123</code></p>}
              {role === 'doctor' && <p>Email: <code className="bg-muted px-1 rounded">anil@doctor.com</code> · Pass: <code className="bg-muted px-1 rounded">pass123</code></p>}
              {role === 'professor' && <p>Email: <code className="bg-muted px-1 rounded">ramesh@professor.com</code> · Pass: <code className="bg-muted px-1 rounded">pass123</code></p>}
              {role === 'admin' && <p>Email: <code className="bg-muted px-1 rounded">admin@aihealthassist.com</code> · Pass: <code className="bg-muted px-1 rounded">admin123</code></p>}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
