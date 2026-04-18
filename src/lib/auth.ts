import { UserRole } from './types';

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

export interface AuthSession {
  userId: string;
  name: string;
  email: string;
  role: UserRole | 'admin';
  status: string;
  loginAt: string;
}

const USERS_KEY = 'aihealthassist_users';
const SESSION_KEY = 'aihealthassist_session';
const DATA_VERSION_KEY = 'aihealthassist_data_version';
const CURRENT_DATA_VERSION = '3'; // Bump this to force re-seed

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

const DEMO_EMAILS = new Set(DEMO_USERS.map((u) => u.email));

// ========== CORE ==========
function getRawUsers(): RegisteredUser[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveUsers(users: RegisteredUser[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Check if data version matches — if not, nuke demo users and re-seed
function ensureDataVersion(): void {
  if (typeof window === 'undefined') return;
  const storedVersion = localStorage.getItem(DATA_VERSION_KEY);
  if (storedVersion === CURRENT_DATA_VERSION) return;

  // Version mismatch — remove all demo users and re-seed fresh
  const rawUsers = getRawUsers();
  // Keep only non-demo, non-admin user-created accounts
  const userCreated = rawUsers.filter(
    (u) => !DEMO_EMAILS.has(u.email) && u.email !== 'admin@aihealthassist.com'
  );
  // Build fresh list: admin + demo + user-created
  const freshUsers = [DEFAULT_ADMIN, ...DEMO_USERS, ...userCreated];
  saveUsers(freshUsers);
  localStorage.setItem(DATA_VERSION_KEY, CURRENT_DATA_VERSION);
}

export function getAllUsers(): RegisteredUser[] {
  if (typeof window === 'undefined') return [];
  ensureDataVersion();
  const users = getRawUsers();
  if (users.length === 0) {
    // First ever load
    const initial = [DEFAULT_ADMIN, ...DEMO_USERS];
    saveUsers(initial);
    localStorage.setItem(DATA_VERSION_KEY, CURRENT_DATA_VERSION);
    return initial;
  }
  // Ensure admin exists
  if (!users.find((u) => u.role === 'admin')) {
    users.push(DEFAULT_ADMIN);
    saveUsers(users);
  }
  return users;
}

// ========== AUTH ==========
export function registerUser(userData: Omit<RegisteredUser, 'id' | 'status' | 'createdAt'>): { success: boolean; error?: string; user?: RegisteredUser } {
  const users = getAllUsers();

  if (users.find((u) => u.email.toLowerCase() === userData.email.toLowerCase())) {
    return { success: false, error: 'An account with this email already exists.' };
  }

  const newUser: RegisteredUser = {
    ...userData,
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    status: userData.role === 'patient' || userData.role === 'student' ? 'active' : 'pending',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);
  return { success: true, user: newUser };
}

export function loginUser(email: string, password: string, role: UserRole | 'admin'): { success: boolean; error?: string; session?: AuthSession } {
  // Ensure data is current before login
  ensureDataVersion();

  const users = getAllUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.role === role);

  if (!user) {
    return { success: false, error: 'No account found with this email for the selected role.' };
  }
  if (user.password !== password) {
    return { success: false, error: 'Incorrect password. Please try again.' };
  }
  if (user.status === 'blocked') {
    return { success: false, error: 'Your account has been blocked. Contact the administrator.' };
  }
  if (user.status === 'pending') {
    return { success: false, error: 'Your account is pending admin approval. Please wait for activation.' };
  }

  // Update last login
  const idx = users.findIndex((u) => u.id === user.id);
  if (idx >= 0) {
    users[idx].lastLogin = new Date().toISOString();
    saveUsers(users);
  }

  const session: AuthSession = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    loginAt: new Date().toISOString(),
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { success: true, session };
}

export function getSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function logout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
}

export function isAuthenticated(): boolean {
  return getSession() !== null;
}

// ========== ADMIN FUNCTIONS ==========
export function getUsersByRole(role?: string): RegisteredUser[] {
  const users = getAllUsers();
  if (!role || role === 'all') return users.filter((u) => u.role !== 'admin');
  return users.filter((u) => u.role === role);
}

export function updateUserStatus(userId: string, status: 'active' | 'pending' | 'blocked'): boolean {
  const users = getAllUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx < 0) return false;
  users[idx].status = status;
  saveUsers(users);
  return true;
}

export function deleteUser(userId: string): boolean {
  const users = getAllUsers();
  const filtered = users.filter((u) => u.id !== userId);
  if (filtered.length === users.length) return false;
  saveUsers(filtered);
  return true;
}

export function getAdminStats(): { total: number; byRole: Record<string, number>; byStatus: Record<string, number>; recentRegistrations: RegisteredUser[] } {
  const users = getAllUsers().filter((u) => u.role !== 'admin');
  const byRole: Record<string, number> = {};
  const byStatus: Record<string, number> = {};

  users.forEach((u) => {
    byRole[u.role] = (byRole[u.role] ?? 0) + 1;
    byStatus[u.status] = (byStatus[u.status] ?? 0) + 1;
  });

  const recentRegistrations = [...users].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 10);
  return { total: users.length, byRole, byStatus, recentRegistrations };
}

// seedDemoUsers — now just calls ensureDataVersion which handles everything
export function seedDemoUsers(): void {
  ensureDataVersion();
  // Trigger getAllUsers to create initial data if needed
  getAllUsers();
}
