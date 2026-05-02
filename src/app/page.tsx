'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  Heart, ArrowRight, MessageSquare, Calendar, Pill, BookOpen,
  Stethoscope, GraduationCap, Users, Shield, Globe, Sparkles,
  Zap, Brain, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeSwitcher } from '@/components/theme-switcher';

const ROLES_PREVIEW = [
  { icon: '🏥', label: 'Patient', color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30', text: 'text-blue-600 dark:text-blue-400', features: ['AI Health Chat', 'Book Appointments', 'Medicine Info', 'Lab Reports'] },
  { icon: '🎓', label: 'Medical Student', color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30', text: 'text-emerald-600 dark:text-emerald-400', features: ['AI Tutor', 'Study Notes', 'Video Lectures', 'Previous Papers'] },
  { icon: '👨‍⚕️', label: 'Doctor', color: 'from-green-500/20 to-lime-500/20 border-green-500/30', text: 'text-green-600 dark:text-green-400', features: ['Patient Management', 'Appointments', 'Digital Reports', 'AI Assistant'] },
  { icon: '👩‍🏫', label: 'Professor', color: 'from-purple-500/20 to-violet-500/20 border-purple-500/30', text: 'text-purple-600 dark:text-purple-400', features: ['Teaching Tools', 'Student Queries', 'Materials', 'AI Aide'] },
];

const FEATURES = [
  { icon: Brain, label: 'AI-Powered Assistance', desc: 'Context-aware AI chatbot for every role — health queries, study help, clinical support, teaching aide.' },
  { icon: Calendar, label: 'Smart Appointments', desc: 'Book appointments, get queue tokens, skip waiting lines. Doctors manage schedules digitally.' },
  { icon: Pill, label: 'Medicine Scanner', desc: 'Search any medicine for usage, dosage, side effects, warnings, and pricing information.' },
  { icon: BookOpen, label: 'Study Resources', desc: 'Comprehensive notes, previous year papers, and curated video lectures for medical students.' },
  { icon: Shield, label: 'Secure & Private', desc: 'All data stored locally on your device. No cloud, no tracking, complete privacy.' },
  { icon: Globe, label: 'Multi-Language', desc: 'Support for English, Hindi, Telugu, Tamil, Kannada, and Malayalam.' },
];

const STATS = [
  { value: '4', label: 'User Roles' },
  { value: '10+', label: 'AI Features' },
  { value: '6', label: 'Languages' },
  { value: '50+', label: 'Medicine DB' },
];

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Heart className="w-4.5 h-4.5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg">AI Health Assist</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            <Link
              href="/select-role"
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition shadow-md"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-6"
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Healthcare & Education Platform
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight leading-[1.1]"
            >
              One Platform for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-chart-3">
                Healthcare & Learning
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              A unified AI platform connecting patients, medical students, doctors, and professors.
              Personalized dashboards, smart AI assistance, and seamless healthcare access — all in one place.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
            >
              <Link
                href="/ai-assistant"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:opacity-90 transition shadow-lg shadow-primary/25"
              >
                <Zap className="w-4.5 h-4.5" />
                Launch AI Assistant
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 px-8 py-3.5 border border-border rounded-xl text-sm font-semibold hover:bg-muted transition"
              >
                Explore Features <ChevronRight className="w-4 h-4" />
              </a>
            </motion.div>
          </div>

          {/* Role Preview Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {ROLES_PREVIEW.map((role, i) => (
              <motion.div
                key={role.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className={cn(
                  'relative p-5 rounded-2xl border bg-gradient-to-br backdrop-blur-sm hover:scale-[1.02] transition-transform cursor-default',
                  role.color
                )}
              >
                <div className="text-3xl mb-3">{role.icon}</div>
                <h3 className={cn('font-display font-bold text-sm mb-2', role.text)}>{role.label}</h3>
                <ul className="space-y-1.5">
                  {role.features.map((f) => (
                    <li key={f} className="text-xs text-muted-foreground flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl md:text-4xl font-display font-extrabold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-display font-extrabold">Everything You Need</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Comprehensive features designed for every user in the healthcare ecosystem.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feat, i) => (
              <motion.div
                key={feat.label}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feat.icon className="w-5.5 h-5.5 text-primary" />
                </div>
                <h3 className="font-display font-bold text-sm mb-2">{feat.label}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem/Solution */}
      <section className="py-20 px-4 sm:px-6 bg-muted/30 border-y border-border">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-sm font-bold text-destructive uppercase tracking-wider mb-4">The Problem</h3>
              <ul className="space-y-3">
                {[
                  'Healthcare systems are slow and crowded',
                  'Students lack centralized learning tools',
                  'No single platform connects patients + doctors + students',
                  'Language barriers in healthcare access',
                ].map((p) => (
                  <li key={p} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="text-destructive mt-0.5">✗</span>
                    {p}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-sm font-bold text-chart-3 uppercase tracking-wider mb-4">Our Solution</h3>
              <ul className="space-y-3">
                {[
                  'AI-powered instant health assistance & appointment booking',
                  'Comprehensive study resources, notes & AI tutoring',
                  'Unified platform for all healthcare stakeholders',
                  'Multi-language support for 6+ Indian languages',
                ].map((s) => (
                  <li key={s} className="flex items-start gap-3 text-sm text-foreground">
                    <span className="text-chart-3 mt-0.5">✓</span>
                    {s}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-3xl font-display font-extrabold mb-4">Ready to Experience the Future of Healthcare?</h2>
          <p className="text-muted-foreground mb-8">Choose your role and explore personalized AI-powered features.</p>
          <Link
            href="/select-role"
            className="inline-flex items-center gap-2 px-10 py-4 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:opacity-90 transition shadow-lg shadow-primary/25"
          >
            Select Your Role <ArrowRight className="w-4.5 h-4.5" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-primary" />
            <span>AI Health Assist — Multi-Role Healthcare Platform</span>
          </div>
          <p>Built for Hackathon 2026</p>
        </div>
      </footer>
    </div>
  );
}
