'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'motion/react';
import { Heart, ArrowLeft, ArrowRight, Users, GraduationCap, Stethoscope, BookOpen, Shield } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { UserRole, ROLES } from '@/lib/types';
import { seedDemoUsers } from '@/lib/auth';

const ROLE_ICONS: Record<UserRole, React.ComponentType<{ className?: string }>> = {
  patient: Users,
  student: GraduationCap,
  doctor: Stethoscope,
  professor: BookOpen,
};

const ROLE_GRADIENTS: Record<UserRole, string> = {
  patient: 'from-blue-500 to-cyan-500',
  student: 'from-emerald-500 to-teal-500',
  doctor: 'from-green-500 to-lime-500',
  professor: 'from-purple-500 to-violet-500',
};

const ROLE_BORDERS: Record<UserRole, string> = {
  patient: 'hover:border-blue-500/40',
  student: 'hover:border-emerald-500/40',
  doctor: 'hover:border-green-500/40',
  professor: 'hover:border-purple-500/40',
};

export default function SelectRolePage() {
  const router = useRouter();

  useEffect(() => { seedDemoUsers(); }, []);

  function handleSelect(roleKey: UserRole) {
    router.push(`/auth/${roleKey}`);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <nav className="h-16 border-b border-border flex items-center px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <Heart className="w-4.5 h-4.5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg">AI Health Assist</span>
        </Link>
        <div className="ml-auto flex items-center gap-3">
          <Link href="/auth/admin" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:bg-muted transition">
            <Shield className="w-3.5 h-3.5" /> Admin Login
          </Link>
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="max-w-4xl w-full">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold">Choose Your Role</h1>
            <p className="text-muted-foreground mt-3 max-w-md mx-auto">
              Select your role to login or create a new account. Each role unlocks a personalized dashboard.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {(Object.keys(ROLES) as UserRole[]).map((roleKey, i) => {
              const role = ROLES[roleKey];
              const Icon = ROLE_ICONS[roleKey];
              return (
                <motion.button
                  key={roleKey}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => handleSelect(roleKey)}
                  className={cn(
                    'group relative bg-card border border-border rounded-2xl p-6 text-left hover:shadow-xl transition-all duration-300',
                    ROLE_BORDERS[roleKey]
                  )}
                >
                  <div className={cn(
                    'w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-4',
                    ROLE_GRADIENTS[roleKey]
                  )}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-3xl mb-1">{role.icon}</div>
                  <h3 className="font-display font-bold text-lg">{role.label}</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">{role.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {role.features.map((f) => (
                      <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                        {f}
                      </span>
                    ))}
                  </div>
                  <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-5 h-5 text-primary" />
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Admin link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-8"
          >
            <Link href="/auth/admin" className="text-sm text-muted-foreground hover:text-foreground transition">
              Are you an administrator? <span className="underline font-medium">Login here</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
