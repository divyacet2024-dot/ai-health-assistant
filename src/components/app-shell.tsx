'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, MessageSquare, Calendar, Pill, FileText,
  CreditCard, BookOpen, Video, ClipboardList, Users,
  GraduationCap, Stethoscope, Menu, X, LogOut, Globe,
  Heart, ChevronDown, PenLine, BarChart3, Lightbulb, Target,
  Bell, CheckSquare, Mail, ShoppingCart, FolderOpen, Search,
  Camera, Siren,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { UserRole, ROLES, LANGUAGES, Language } from '@/lib/types';
import { getRole, setRole, clearRole, getLang, setLang } from '@/lib/store';
import { getSession, logout } from '@/lib/auth';

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };

const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  patient: [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/health-log', label: 'Health Log', icon: PenLine },
    { href: '/dashboard/health-analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/dashboard/health-insights', label: 'Insights', icon: Lightbulb },
    { href: '/dashboard/health-goals', label: 'Goals & Streaks', icon: Target },
    { href: '/dashboard/chat', label: 'AI Health Chat', icon: MessageSquare },
    { href: '/dashboard/scan', label: 'Scan Medicine', icon: Camera },
    { href: '/dashboard/emergency', label: 'Emergency Mode', icon: Siren },
    { href: '/dashboard/diseases', label: 'Disease Info', icon: Search },
    { href: '/dashboard/pharmacy', label: 'Pharmacy', icon: ShoppingCart },
    { href: '/dashboard/appointments', label: 'Appointments', icon: Calendar },
    { href: '/dashboard/prescriptions', label: 'Prescriptions', icon: FileText },
    { href: '/dashboard/reports', label: 'Lab Reports', icon: FileText },
    { href: '/dashboard/payment', label: 'Payment & Token', icon: CreditCard },
    { href: '/dashboard/messages', label: 'Messages', icon: Mail },
    { href: '/dashboard/todos', label: 'To-Do List', icon: CheckSquare },
    { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  ],
  student: [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/chat', label: 'AI Tutor', icon: MessageSquare },
    { href: '/dashboard/scan', label: 'Scan Medicine', icon: Camera },
    { href: '/dashboard/emergency', label: 'Emergency Mode', icon: Siren },
    { href: '/dashboard/resources', label: 'Study Resources', icon: BookOpen },
    { href: '/dashboard/files', label: 'Study Materials', icon: FolderOpen },
    { href: '/dashboard/videos', label: 'Video Lectures', icon: Video },
    { href: '/dashboard/planner', label: 'Study Planner', icon: ClipboardList },
    { href: '/dashboard/diseases', label: 'Disease Info', icon: Search },
    { href: '/dashboard/pharmacy', label: 'Pharmacy', icon: ShoppingCart },
    { href: '/dashboard/messages', label: 'Messages', icon: Mail },
    { href: '/dashboard/todos', label: 'To-Do List', icon: CheckSquare },
    { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  ],
  doctor: [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/chat', label: 'AI Assistant', icon: MessageSquare },
    { href: '/dashboard/scan', label: 'Scan Medicine', icon: Camera },
    { href: '/dashboard/emergency', label: 'Emergency Mode', icon: Siren },
    { href: '/dashboard/appointments', label: 'Appointments', icon: Calendar },
    { href: '/dashboard/patients', label: 'Patient List', icon: Users },
    { href: '/dashboard/prescriptions', label: 'Prescriptions', icon: FileText },
    { href: '/dashboard/messages', label: 'Messages', icon: Mail },
    { href: '/dashboard/reports', label: 'Digital Reports', icon: FileText },
    { href: '/dashboard/diseases', label: 'Disease Info', icon: Search },
    { href: '/dashboard/todos', label: 'To-Do List', icon: CheckSquare },
    { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  ],
  professor: [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/chat', label: 'AI Assistant', icon: MessageSquare },
    { href: '/dashboard/scan', label: 'Scan Medicine', icon: Camera },
    { href: '/dashboard/emergency', label: 'Emergency Mode', icon: Siren },
    { href: '/dashboard/queries', label: 'Student Queries', icon: MessageSquare },
    { href: '/dashboard/files', label: 'Upload Materials', icon: FolderOpen },
    { href: '/dashboard/materials', label: 'Shared Materials', icon: BookOpen },
    { href: '/dashboard/messages', label: 'Messages', icon: Mail },
    { href: '/dashboard/schedule', label: 'Class Schedule', icon: Calendar },
    { href: '/dashboard/todos', label: 'To-Do List', icon: CheckSquare },
    { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  ],
};

const ROLE_ICONS: Record<UserRole, React.ComponentType<{ className?: string }>> = {
  patient: Heart,
  student: GraduationCap,
  doctor: Stethoscope,
  professor: BookOpen,
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRoleState] = useState<UserRole | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const session = getSession();
    const r = getRole();
    if (!session && !r) { router.push('/select-role'); return; }
    if (session && !r && session.role !== 'admin') {
      // Session exists but role not set in store — sync it
      setRole(session.role as UserRole);
      setRoleState(session.role as UserRole);
    } else if (r) {
      setRoleState(r);
    }
    setCurrentLang(getLang());
  }, [router]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  if (!mounted || !role) return null;

  const navItems = NAV_ITEMS[role];
  const roleInfo = ROLES[role];
  const RoleIcon = ROLE_ICONS[role];

  function handleSwitchRole() {
    logout();
    clearRole();
    router.push('/select-role');
  }

  function handleLangChange(lang: Language) {
    setLang(lang);
    setCurrentLang(lang);
    setLangOpen(false);
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-sidebar fixed h-full z-30 border-r border-sidebar-border">
        <div className="p-5 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
              <Heart className="w-5 h-5 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-sm text-sidebar-foreground">AI Health Assist</h1>
              <p className="text-[10px] text-sidebar-foreground/60">Healthcare Platform</p>
            </div>
          </Link>
        </div>

        {/* Role Badge */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-sidebar-accent">
            <RoleIcon className="w-4 h-4 text-sidebar-primary" />
            <span className="text-xs font-semibold text-sidebar-foreground">{roleInfo.label}</span>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-foreground'
                    : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                )}
              >
                <item.icon className="w-[18px] h-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 space-y-2 border-t border-sidebar-border">
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-sidebar-foreground/60 hover:bg-sidebar-accent/50 transition"
            >
              <Globe className="w-4 h-4" />
              <span>{LANGUAGES[currentLang]}</span>
              <ChevronDown className="w-3 h-3 ml-auto" />
            </button>
            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="absolute bottom-full left-0 right-0 mb-1 bg-sidebar border border-sidebar-border rounded-lg overflow-hidden shadow-lg z-50"
                >
                  {(Object.entries(LANGUAGES) as [Language, string][]).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => handleLangChange(key)}
                      className={cn(
                        'w-full text-left px-3 py-2 text-xs transition',
                        currentLang === key
                          ? 'bg-sidebar-accent text-sidebar-foreground'
                          : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/50'
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <ThemeSwitcher />
          <button
            onClick={handleSwitchRole}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-sidebar-foreground/60 hover:bg-sidebar-accent/50 transition"
          >
            <LogOut className="w-4 h-4" />
            Switch Role
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Heart className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-sm">AI Health Assist</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary text-xs font-medium">
              <RoleIcon className="w-3.5 h-3.5" />
              {roleInfo.label}
            </div>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-muted">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          >
            <motion.nav
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute left-0 top-0 h-full w-72 bg-sidebar p-5 pt-18 space-y-1"
              onClick={(e) => e.stopPropagation()}
            >
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition',
                      isActive ? 'bg-sidebar-accent text-sidebar-foreground' : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/50'
                    )}
                  >
                    <item.icon className="w-[18px] h-[18px]" />
                    {item.label}
                  </Link>
                );
              })}
              <div className="pt-4 border-t border-sidebar-border mt-4">
                <button onClick={handleSwitchRole} className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-xs text-sidebar-foreground/60 hover:bg-sidebar-accent/50 transition">
                  <LogOut className="w-4 h-4" /> Switch Role
                </button>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main */}
      <main className="flex-1 lg:ml-64 min-h-screen">
        <div className="pt-14 lg:pt-0">{children}</div>
      </main>
    </div>
  );
}
