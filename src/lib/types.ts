export type UserRole = 'patient' | 'student' | 'doctor' | 'professor';

export interface RoleInfo {
  id: UserRole;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  description: string;
  features: string[];
}

export const ROLES: Record<UserRole, RoleInfo> = {
  patient: {
    id: 'patient',
    label: 'Patient',
    icon: '🏥',
    color: 'text-chart-1',
    bgColor: 'bg-chart-1/10',
    description: 'Access health services, book appointments, view lab reports',
    features: ['AI Health Chat', 'Book Appointments', 'Medicine Info', 'Lab Reports', 'Fee Payment', 'Reminders'],
  },
  student: {
    id: 'student',
    label: 'Medical Student',
    icon: '🎓',
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
    description: 'Study tools, AI tutoring, notes and resources',
    features: ['AI Study Tutor', 'Notes & Papers', 'Video Lectures', 'Study Planner', 'Doubt Resolver'],
  },
  doctor: {
    id: 'doctor',
    label: 'Doctor',
    icon: '👨‍⚕️',
    color: 'text-chart-3',
    bgColor: 'bg-chart-3/10',
    description: 'Manage patients, appointments and digital reports',
    features: ['Appointments', 'Patient List', 'Digital Reports', 'Schedule', 'AI Assistant'],
  },
  professor: {
    id: 'professor',
    label: 'Professor',
    icon: '👩‍🏫',
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10',
    description: 'Teaching tools, share materials, manage student queries',
    features: ['Teaching Tools', 'Share Materials', 'Student Queries', 'Class Schedule', 'Resources'],
  },
};

export type Language = 'en' | 'hi' | 'te' | 'ta' | 'kn' | 'ml';
export const LANGUAGES: Record<Language, string> = {
  en: 'English',
  hi: 'हिन्दी',
  te: 'తెలుగు',
  ta: 'தமிழ்',
  kn: 'ಕನ್ನಡ',
  ml: 'മലയാളം',
};

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Appointment {
  id: string;
  patientName: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  tokenNumber: number;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  category: string;
  usage: string;
  dosage: string;
  sideEffects: string[];
  warnings: string[];
  price: string;
}

export interface LabReport {
  id: string;
  patientName: string;
  testName: string;
  date: string;
  status: 'completed' | 'pending' | 'processing';
  results: { parameter: string; value: string; normalRange: string; status: 'normal' | 'high' | 'low' }[];
}

export interface StudyNote {
  id: string;
  subject: string;
  title: string;
  year: string;
  type: 'notes' | 'paper' | 'video';
  url?: string;
  description: string;
}

export interface StudentQuery {
  id: string;
  studentName: string;
  subject: string;
  question: string;
  date: string;
  status: 'pending' | 'answered';
  answer?: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  condition: string;
  lastVisit: string;
  nextAppointment: string;
  status: 'active' | 'discharged' | 'follow-up';
}
