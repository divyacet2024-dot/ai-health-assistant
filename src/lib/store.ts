import { UserRole, Language, ChatMessage, Appointment, LabReport } from './types';

const ROLE_KEY = 'aihealthassist_role';
const LANG_KEY = 'aihealthassist_lang';
const CHAT_KEY = 'aihealthassist_chat';
const APPOINTMENTS_KEY = 'aihealthassist_appointments';
const TOKEN_KEY = 'aihealthassist_token';

// Role
export function getRole(): UserRole | null {
  if (typeof window === 'undefined') return null;
  return (localStorage.getItem(ROLE_KEY) as UserRole) || null;
}
export function setRole(role: UserRole): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ROLE_KEY, role);
}
export function clearRole(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ROLE_KEY);
}

// Language
export function getLang(): Language {
  if (typeof window === 'undefined') return 'en';
  return (localStorage.getItem(LANG_KEY) as Language) || 'en';
}
export function setLang(lang: Language): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LANG_KEY, lang);
}

// Chat
export function getChatHistory(role: UserRole): ChatMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`${CHAT_KEY}_${role}`);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
export function saveChatHistory(role: UserRole, messages: ChatMessage[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`${CHAT_KEY}_${role}`, JSON.stringify(messages));
}
export function clearChatHistory(role: UserRole): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(`${CHAT_KEY}_${role}`);
}

// Appointments
export function getAppointments(): Appointment[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(APPOINTMENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
export function saveAppointments(appts: Appointment[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appts));
}

// Token Counter
export function getNextToken(): number {
  if (typeof window === 'undefined') return 1;
  const current = parseInt(localStorage.getItem(TOKEN_KEY) || '0', 10);
  const next = current + 1;
  localStorage.setItem(TOKEN_KEY, next.toString());
  return next;
}
