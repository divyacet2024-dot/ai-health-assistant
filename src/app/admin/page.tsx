'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  Users, Shield, CheckCircle, XCircle, Clock, Trash2,
  Heart, LogOut, Search, UserCheck, UserX, BarChart3,
  GraduationCap, Stethoscope, BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeSwitcher } from '@/components/theme-switcher';
import {
  getSession, logout, getUsersByRole, updateUserStatus,
  deleteUser, getAdminStats, seedDemoUsers, RegisteredUser,
} from '@/lib/auth';

const ROLE_ICONS: Record<string, { icon: string; color: string }> = {
  patient: { icon: '🏥', color: 'bg-blue-500/10 text-blue-600' },
  student: { icon: '🎓', color: 'bg-emerald-500/10 text-emerald-600' },
  doctor: { icon: '👨‍⚕️', color: 'bg-green-500/10 text-green-600' },
  professor: { icon: '👩‍🏫', color: 'bg-purple-500/10 text-purple-600' },
};

const STATUS_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; label: string }> = {
  active: { icon: CheckCircle, color: 'bg-chart-3/10 text-chart-3', label: 'Active' },
  pending: { icon: Clock, color: 'bg-chart-5/10 text-chart-5', label: 'Pending' },
  blocked: { icon: XCircle, color: 'bg-destructive/10 text-destructive', label: 'Blocked' },
};

export default function AdminDashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState<ReturnType<typeof getAdminStats> | null>(null);

  useEffect(() => {
    setMounted(true);
    seedDemoUsers();
    const session = getSession();
    if (!session || session.role !== 'admin') {
      router.push('/auth/admin');
      return;
    }
    refreshData();
  }, [router]);

  function refreshData() {
    setUsers(getUsersByRole(roleFilter));
    setStats(getAdminStats());
  }

  useEffect(() => {
    if (mounted) setUsers(getUsersByRole(roleFilter));
  }, [roleFilter, mounted]);

  function handleStatusChange(userId: string, status: 'active' | 'pending' | 'blocked') {
    updateUserStatus(userId, status);
    refreshData();
  }

  function handleDelete(userId: string) {
    if (confirm('Are you sure you want to delete this user?')) {
      deleteUser(userId);
      refreshData();
    }
  }

  function handleLogout() {
    logout();
    router.push('/auth/admin');
  }

  if (!mounted) return null;

  const session = getSession();
  if (!session || session.role !== 'admin') return null;

  const filteredUsers = users.filter((u) => {
    const matchSearch = !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || u.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Heart className="w-4.5 h-4.5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-sm">Admin Panel</h1>
              <p className="text-[10px] text-muted-foreground">AI Health Assist</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-semibold">
              <Shield className="w-3.5 h-3.5" /> Admin
            </div>
            <ThemeSwitcher />
            <button onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-muted transition">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage users, approve registrations, and monitor platform activity.</p>
        </motion.div>

        {/* Stats */}
        {stats && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            <div className="bg-card border border-border rounded-2xl p-4 col-span-1">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                <Users className="w-4.5 h-4.5 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold font-display">{stats.total}</p>
            </div>
            {Object.entries(stats.byRole).map(([role, count]) => (
              <div key={role} className="bg-card border border-border rounded-2xl p-4">
                <span className="text-2xl">{ROLE_ICONS[role]?.icon ?? '👤'}</span>
                <p className="text-xs text-muted-foreground mt-1 capitalize">{role}s</p>
                <p className="text-xl font-bold font-display">{count}</p>
              </div>
            ))}
            <div className="bg-chart-5/5 border border-chart-5/20 rounded-2xl p-4">
              <Clock className="w-5 h-5 text-chart-5 mb-1" />
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-xl font-bold font-display text-chart-5">{stats.byStatus.pending ?? 0}</p>
            </div>
            <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-4">
              <XCircle className="w-5 h-5 text-destructive mb-1" />
              <p className="text-xs text-muted-foreground">Blocked</p>
              <p className="text-xl font-bold font-display text-destructive">{stats.byStatus.blocked ?? 0}</p>
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:ring-2 focus:ring-primary/30 outline-none" />
          </div>
          <div className="flex gap-1 bg-muted rounded-xl p-1">
            {['all', 'patient', 'student', 'doctor', 'professor'].map((r) => (
              <button key={r} onClick={() => setRoleFilter(r)}
                className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize',
                  roleFilter === r ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}>{r}</button>
            ))}
          </div>
          <div className="flex gap-1 bg-muted rounded-xl p-1">
            {['', 'active', 'pending', 'blocked'].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize',
                  statusFilter === s ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}>{s || 'All'}</button>
            ))}
          </div>
        </motion.div>

        {/* Users Table */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left text-xs font-semibold px-5 py-3">User</th>
                  <th className="text-left text-xs font-semibold px-5 py-3 hidden md:table-cell">Email</th>
                  <th className="text-left text-xs font-semibold px-5 py-3">Role</th>
                  <th className="text-left text-xs font-semibold px-5 py-3 hidden lg:table-cell">Details</th>
                  <th className="text-left text-xs font-semibold px-5 py-3">Status</th>
                  <th className="text-left text-xs font-semibold px-5 py-3 hidden sm:table-cell">Registered</th>
                  <th className="text-right text-xs font-semibold px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, i) => {
                  const roleInfo = ROLE_ICONS[user.role] ?? { icon: '👤', color: 'bg-muted text-muted-foreground' };
                  const statusInfo = STATUS_CONFIG[user.status] ?? STATUS_CONFIG.active;
                  const StatusIcon = statusInfo.icon;
                  return (
                    <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                      className="border-b border-border last:border-0 hover:bg-muted/20 transition">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center text-lg', roleInfo.color)}>
                            {roleInfo.icon}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-[10px] text-muted-foreground md:hidden">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground hidden md:table-cell">{user.email}</td>
                      <td className="px-5 py-3.5">
                        <span className={cn('text-[10px] px-2 py-1 rounded-full font-medium capitalize', roleInfo.color)}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-muted-foreground hidden lg:table-cell">
                        {user.department && <span>{user.department}</span>}
                        {user.specialization && <span> · {user.specialization}</span>}
                        {user.studentId && <span>ID: {user.studentId}</span>}
                        {user.year && <span> · {user.year}</span>}
                        {!user.department && !user.specialization && !user.studentId && <span>—</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className={cn('inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full font-medium', statusInfo.color)}>
                          <StatusIcon className="w-3 h-3" /> {statusInfo.label}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-muted-foreground hidden sm:table-cell">
                        {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          {user.status === 'pending' && (
                            <button onClick={() => handleStatusChange(user.id, 'active')}
                              className="p-1.5 rounded-lg bg-chart-3/10 text-chart-3 hover:bg-chart-3/20 transition"
                              title="Approve">
                              <UserCheck className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {user.status === 'active' && (
                            <button onClick={() => handleStatusChange(user.id, 'blocked')}
                              className="p-1.5 rounded-lg bg-chart-5/10 text-chart-5 hover:bg-chart-5/20 transition"
                              title="Block">
                              <UserX className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {user.status === 'blocked' && (
                            <button onClick={() => handleStatusChange(user.id, 'active')}
                              className="p-1.5 rounded-lg bg-chart-3/10 text-chart-3 hover:bg-chart-3/20 transition"
                              title="Unblock">
                              <UserCheck className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button onClick={() => handleDelete(user.id)}
                            className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition"
                            title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No users found matching your filters.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
