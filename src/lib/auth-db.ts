import type { UserRole } from '@/lib/types';

export interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole | 'admin';
  phone?: string;
  specialization?: string;
  department?: string;
  studentId?: string;
  year?: string;
  employeeId?: string;
  status: 'active' | 'pending' | 'blocked';
  createdAt: string;
  lastLogin?: string;
}

const DEFAULT_ADMIN: RegisteredUser = {
  id: 'admin-001',
  name: 'Admin',
  email: 'admin@aihealthassist.com',
  password: 'admin123',
  role: 'admin',
  status: 'active',
  createdAt: '2026-01-01T00:00:00.000Z',
};

const DEMO_USERS: RegisteredUser[] = [
  { id: 'demo-p1', name: 'Rahul Sharma', email: 'rahul@patient.com', password: 'pass123', role: 'patient', phone: '9876543210', status: 'active', createdAt: '2026-03-01T00:00:00.000Z' },
  { id: 'demo-p2', name: 'Priya Devi', email: 'priya@patient.com', password: 'pass123', role: 'patient', phone: '9876543211', status: 'active', createdAt: '2026-03-05T00:00:00.000Z' },
  { id: 'demo-s1', name: 'Arjun Patel', email: 'arjun@student.com', password: 'pass123', role: 'student', studentId: 'MBBS2024001', year: '2nd Year', status: 'active', createdAt: '2026-03-02T00:00:00.000Z' },
  { id: 'demo-s2', name: 'Sneha Reddy', email: 'sneha@student.com', password: 'pass123', role: 'student', studentId: 'MBBS2024002', year: '1st Year', status: 'active', createdAt: '2026-03-06T00:00:00.000Z' },
  { id: 'demo-d1', name: 'Dr. Anil Mehta', email: 'anil@doctor.com', password: 'pass123', role: 'doctor', department: 'General Medicine', employeeId: 'DOC001', specialization: 'Internal Medicine', status: 'active', createdAt: '2026-02-15T00:00:00.000Z' },
  { id: 'demo-d2', name: 'Dr. Sunita Verma', email: 'sunita@doctor.com', password: 'pass123', role: 'doctor', department: 'Endocrinology', employeeId: 'DOC002', specialization: 'Endocrinology', status: 'pending', createdAt: '2026-04-01T00:00:00.000Z' },
  { id: 'demo-pr1', name: 'Prof. Ramesh Iyer', email: 'ramesh@professor.com', password: 'pass123', role: 'professor', department: 'Anatomy', employeeId: 'PROF001', status: 'active', createdAt: '2026-02-10T00:00:00.000Z' },
  { id: 'demo-pr2', name: 'Prof. Kavita Nair', email: 'kavita@professor.com', password: 'pass123', role: 'professor', department: 'Pharmacology', employeeId: 'PROF002', status: 'pending', createdAt: '2026-04-02T00:00:00.000Z' },
];

const DEMO_EMAILS = new Set(DEMO_USERS.map((user) => user.email));
let userStore: RegisteredUser[] | null = null;

function ensureUserStore() {
  if (userStore) return;
  userStore = [DEFAULT_ADMIN, ...DEMO_USERS];
}

export function getAllUsers(): RegisteredUser[] {
  ensureUserStore();
  return userStore!;
}

export function findUserByEmailAndRole(email: string, role: UserRole | 'admin'): RegisteredUser | undefined {
  ensureUserStore();
  return userStore!.find((user) => user.email.toLowerCase() === email.toLowerCase() && user.role === role);
}

export function findUserById(id: string): RegisteredUser | undefined {
  ensureUserStore();
  return userStore!.find((user) => user.id === id);
}

export function registerUser(userData: Omit<RegisteredUser, 'id' | 'status' | 'createdAt'>): { success: boolean; error?: string; user?: RegisteredUser } {
  ensureUserStore();

  if (userStore!.find((user) => user.email.toLowerCase() === userData.email.toLowerCase())) {
    return { success: false, error: 'An account with this email already exists.' };
  }

  const newUser: RegisteredUser = {
    ...userData,
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    status: userData.role === 'patient' || userData.role === 'student' ? 'active' : 'pending',
    createdAt: new Date().toISOString(),
  };

  userStore!.push(newUser);
  return { success: true, user: newUser };
}

export function getUsersByRole(role?: string): RegisteredUser[] {
  ensureUserStore();
  if (!role || role === 'all') return userStore!.filter((user) => user.role !== 'admin');
  return userStore!.filter((user) => user.role === role);
}

export function updateUserStatus(userId: string, status: 'active' | 'pending' | 'blocked'): boolean {
  ensureUserStore();
  const index = userStore!.findIndex((user) => user.id === userId);
  if (index < 0) return false;
  userStore![index].status = status;
  return true;
}

export function deleteUser(userId: string): boolean {
  ensureUserStore();
  const originalLength = userStore!.length;
  userStore = userStore!.filter((user) => user.id !== userId);
  return userStore!.length !== originalLength;
}

export function getAdminStats(): { total: number; byRole: Record<string, number>; byStatus: Record<string, number>; recentRegistrations: RegisteredUser[] } {
  ensureUserStore();
  const users = userStore!.filter((user) => user.role !== 'admin');
  const byRole: Record<string, number> = {};
  const byStatus: Record<string, number> = {};

  users.forEach((user) => {
    byRole[user.role] = (byRole[user.role] ?? 0) + 1;
    byStatus[user.status] = (byStatus[user.status] ?? 0) + 1;
  });

  const recentRegistrations = [...users].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 10);
  return { total: users.length, byRole, byStatus, recentRegistrations };
}
