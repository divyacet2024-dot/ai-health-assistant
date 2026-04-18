/**
 * Communication system — Doctor-Patient & Professor-Student messaging
 * Includes prescriptions, notifications, todo lists, and wishlist
 */

// ========== MESSAGES ==========
export interface Message {
  id: string;
  fromId: string;
  fromName: string;
  fromRole: string;
  toId: string;
  toName: string;
  toRole: string;
  subject: string;
  content: string;
  type: 'message' | 'prescription' | 'assignment' | 'announcement' | 'report' | 'grade';
  attachments?: { name: string; type: string; url: string }[];
  read: boolean;
  createdAt: string;
}

// ========== PRESCRIPTIONS ==========
export interface Prescription {
  id: string;
  doctorName: string;
  doctorId: string;
  patientName: string;
  patientId: string;
  diagnosis: string;
  medicines: { name: string; dosage: string; duration: string; notes: string }[];
  advice: string[];
  followUpDate: string;
  date: string;
}

// ========== TODO / TASKS ==========
export interface TodoItem {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  dueDate?: string;
  role: string;
  createdAt: string;
}

// ========== NOTIFICATIONS ==========
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'prescription' | 'assignment' | 'announcement';
  fromName?: string;
  fromRole?: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

// ========== WISHLIST / CART ==========
export interface CartItem {
  medicineId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

// ========== ASSIGNMENTS (Professor-Student) ==========
export interface Assignment {
  id: string;
  title: string;
  subject: string;
  description: string;
  dueDate: string;
  professorName: string;
  professorId: string;
  maxMarks: number;
  submissions: { studentId: string; studentName: string; submittedAt: string; grade?: number; feedback?: string }[];
  attachments: string[];
  createdAt: string;
}

// ========== STORAGE KEYS ==========
const MESSAGES_KEY = 'aihealthassist_messages';
const PRESCRIPTIONS_KEY = 'aihealthassist_prescriptions';
const TODOS_KEY = 'aihealthassist_todos';
const NOTIFICATIONS_KEY = 'aihealthassist_notifications';
const CART_KEY = 'aihealthassist_cart';
const ASSIGNMENTS_KEY = 'aihealthassist_assignments';
const FILES_KEY = 'aihealthassist_uploaded_files';

// ========== GENERIC HELPERS ==========
function getStore<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
}
function setStore<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

// ========== MESSAGES ==========
export function getMessages(userId?: string, role?: string): Message[] {
  const all = getStore<Message>(MESSAGES_KEY);
  if (!userId && !role) return all;
  return all.filter((m) => m.toRole === role || m.fromRole === role || m.toId === userId || m.fromId === userId);
}
export function getInbox(role: string): Message[] {
  return getStore<Message>(MESSAGES_KEY).filter((m) => m.toRole === role).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export function getSentMessages(role: string): Message[] {
  return getStore<Message>(MESSAGES_KEY).filter((m) => m.fromRole === role).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export function sendMessage(msg: Omit<Message, 'id' | 'read' | 'createdAt'>): Message {
  const messages = getStore<Message>(MESSAGES_KEY);
  const newMsg: Message = { ...msg, id: `msg-${Date.now()}`, read: false, createdAt: new Date().toISOString() };
  messages.unshift(newMsg);
  setStore(MESSAGES_KEY, messages);
  // Also create notification
  addNotification({
    title: msg.type === 'prescription' ? 'New Prescription' : msg.type === 'assignment' ? 'New Assignment' : `Message from ${msg.fromName}`,
    message: msg.subject,
    type: msg.type === 'prescription' ? 'prescription' : msg.type === 'assignment' ? 'assignment' : 'info',
    fromName: msg.fromName,
    fromRole: msg.fromRole,
    actionUrl: '/dashboard/messages',
  });
  return newMsg;
}
export function markMessageRead(id: string): void {
  const messages = getStore<Message>(MESSAGES_KEY);
  const idx = messages.findIndex((m) => m.id === id);
  if (idx >= 0) { messages[idx].read = true; setStore(MESSAGES_KEY, messages); }
}

// ========== PRESCRIPTIONS ==========
export function getPrescriptions(patientId?: string): Prescription[] {
  const all = getStore<Prescription>(PRESCRIPTIONS_KEY);
  if (!patientId) return all;
  return all.filter((p) => p.patientId === patientId || !patientId);
}
export function addPrescription(rx: Omit<Prescription, 'id' | 'date'>): Prescription {
  const prescriptions = getStore<Prescription>(PRESCRIPTIONS_KEY);
  const newRx: Prescription = { ...rx, id: `rx-${Date.now()}`, date: new Date().toISOString().split('T')[0] };
  prescriptions.unshift(newRx);
  setStore(PRESCRIPTIONS_KEY, prescriptions);
  addNotification({
    title: 'New Prescription',
    message: `Dr. ${rx.doctorName} has issued a prescription for ${rx.diagnosis}`,
    type: 'prescription',
    fromName: rx.doctorName,
    fromRole: 'doctor',
    actionUrl: '/dashboard/prescriptions',
  });
  return newRx;
}

// ========== TODOS ==========
export function getTodos(role?: string): TodoItem[] {
  const all = getStore<TodoItem>(TODOS_KEY);
  if (!role) return all;
  return all.filter((t) => t.role === role);
}
export function addTodo(todo: Omit<TodoItem, 'id' | 'completed' | 'createdAt'>): TodoItem {
  const todos = getStore<TodoItem>(TODOS_KEY);
  const newTodo: TodoItem = { ...todo, id: `todo-${Date.now()}`, completed: false, createdAt: new Date().toISOString() };
  todos.unshift(newTodo);
  setStore(TODOS_KEY, todos);
  return newTodo;
}
export function toggleTodo(id: string): void {
  const todos = getStore<TodoItem>(TODOS_KEY);
  const idx = todos.findIndex((t) => t.id === id);
  if (idx >= 0) { todos[idx].completed = !todos[idx].completed; setStore(TODOS_KEY, todos); }
}
export function deleteTodo(id: string): void {
  setStore(TODOS_KEY, getStore<TodoItem>(TODOS_KEY).filter((t) => t.id !== id));
}

// ========== NOTIFICATIONS ==========
export function getNotifications(): Notification[] {
  return getStore<Notification>(NOTIFICATIONS_KEY).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export function getUnreadCount(): number {
  return getStore<Notification>(NOTIFICATIONS_KEY).filter((n) => !n.read).length;
}
export function addNotification(n: Omit<Notification, 'id' | 'read' | 'createdAt'>): void {
  const notifications = getStore<Notification>(NOTIFICATIONS_KEY);
  notifications.unshift({ ...n, id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, read: false, createdAt: new Date().toISOString() });
  setStore(NOTIFICATIONS_KEY, notifications);
}
export function markNotificationRead(id: string): void {
  const ns = getStore<Notification>(NOTIFICATIONS_KEY);
  const idx = ns.findIndex((n) => n.id === id);
  if (idx >= 0) { ns[idx].read = true; setStore(NOTIFICATIONS_KEY, ns); }
}
export function markAllRead(): void {
  const ns = getStore<Notification>(NOTIFICATIONS_KEY);
  ns.forEach((n) => { n.read = true; });
  setStore(NOTIFICATIONS_KEY, ns);
}

// ========== CART / WISHLIST ==========
export function getCart(): CartItem[] {
  return getStore<CartItem>(CART_KEY);
}
export function addToCart(item: CartItem): void {
  const cart = getStore<CartItem>(CART_KEY);
  const existing = cart.findIndex((c) => c.medicineId === item.medicineId);
  if (existing >= 0) {
    cart[existing].quantity += item.quantity;
  } else {
    cart.push(item);
  }
  setStore(CART_KEY, cart);
}
export function updateCartQuantity(medicineId: string, quantity: number): void {
  const cart = getStore<CartItem>(CART_KEY);
  const idx = cart.findIndex((c) => c.medicineId === medicineId);
  if (idx >= 0) {
    if (quantity <= 0) { cart.splice(idx, 1); } else { cart[idx].quantity = quantity; }
    setStore(CART_KEY, cart);
  }
}
export function removeFromCart(medicineId: string): void {
  setStore(CART_KEY, getStore<CartItem>(CART_KEY).filter((c) => c.medicineId !== medicineId));
}
export function clearCart(): void {
  setStore(CART_KEY, []);
}
export function getCartTotal(): number {
  return getStore<CartItem>(CART_KEY).reduce((sum, c) => sum + c.price * c.quantity, 0);
}

// ========== ASSIGNMENTS ==========
export function getAssignments(): Assignment[] {
  return getStore<Assignment>(ASSIGNMENTS_KEY).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export function addAssignment(a: Omit<Assignment, 'id' | 'submissions' | 'createdAt'>): Assignment {
  const assignments = getStore<Assignment>(ASSIGNMENTS_KEY);
  const newA: Assignment = { ...a, id: `asgn-${Date.now()}`, submissions: [], createdAt: new Date().toISOString() };
  assignments.unshift(newA);
  setStore(ASSIGNMENTS_KEY, assignments);
  addNotification({
    title: 'New Assignment',
    message: `Prof. ${a.professorName} posted: ${a.title}`,
    type: 'assignment',
    fromName: a.professorName,
    fromRole: 'professor',
    actionUrl: '/dashboard/assignments',
  });
  return newA;
}
export function submitAssignment(assignmentId: string, studentId: string, studentName: string): void {
  const assignments = getStore<Assignment>(ASSIGNMENTS_KEY);
  const idx = assignments.findIndex((a) => a.id === assignmentId);
  if (idx >= 0) {
    assignments[idx].submissions.push({ studentId, studentName, submittedAt: new Date().toISOString() });
    setStore(ASSIGNMENTS_KEY, assignments);
  }
}
export function gradeAssignment(assignmentId: string, studentId: string, grade: number, feedback: string): void {
  const assignments = getStore<Assignment>(ASSIGNMENTS_KEY);
  const idx = assignments.findIndex((a) => a.id === assignmentId);
  if (idx >= 0) {
    const subIdx = assignments[idx].submissions.findIndex((s) => s.studentId === studentId);
    if (subIdx >= 0) {
      assignments[idx].submissions[subIdx].grade = grade;
      assignments[idx].submissions[subIdx].feedback = feedback;
      setStore(ASSIGNMENTS_KEY, assignments);
    }
  }
}

// ========== UPLOADED FILES ==========
export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  category: string;
  uploadedBy: string;
  uploadedByRole: string;
  description: string;
  downloadUrl: string;
  createdAt: string;
}
export function getUploadedFiles(category?: string): UploadedFile[] {
  const all = getStore<UploadedFile>(FILES_KEY);
  if (!category) return all;
  return all.filter((f) => f.category === category);
}
export function addUploadedFile(file: Omit<UploadedFile, 'id' | 'createdAt'>): UploadedFile {
  const files = getStore<UploadedFile>(FILES_KEY);
  const newFile: UploadedFile = { ...file, id: `file-${Date.now()}`, createdAt: new Date().toISOString() };
  files.unshift(newFile);
  setStore(FILES_KEY, files);
  return newFile;
}
export function deleteUploadedFile(id: string): void {
  setStore(FILES_KEY, getStore<UploadedFile>(FILES_KEY).filter((f) => f.id !== id));
}

// ========== SEED DEMO DATA ==========
export function seedCommunicationData(): void {
  if (typeof window === 'undefined') return;
  const VERSION_KEY = 'aihealthassist_comm_version';
  if (localStorage.getItem(VERSION_KEY) === '2') return;

  // Demo prescriptions
  const prescriptions: Prescription[] = [
    {
      id: 'rx-demo-1', doctorName: 'Dr. Anil Mehta', doctorId: 'demo-d1', patientName: 'Rahul Sharma', patientId: 'demo-p1',
      diagnosis: 'Type 2 Diabetes Mellitus with Hypertension',
      medicines: [
        { name: 'Metformin 500mg', dosage: '1 tablet twice daily', duration: '3 months', notes: 'Take with meals' },
        { name: 'Amlodipine 5mg', dosage: '1 tablet daily', duration: '3 months', notes: 'Take in the morning' },
        { name: 'Atorvastatin 10mg', dosage: '1 tablet at bedtime', duration: '3 months', notes: '' },
      ],
      advice: ['Monitor blood sugar daily', 'Low salt, low sugar diet', '30 min walk daily', 'Follow-up in 3 months'],
      followUpDate: '2026-07-10', date: '2026-04-08',
    },
    {
      id: 'rx-demo-2', doctorName: 'Dr. Anil Mehta', doctorId: 'demo-d1', patientName: 'Priya Devi', patientId: 'demo-p2',
      diagnosis: 'Acute Upper Respiratory Infection',
      medicines: [
        { name: 'Azithromycin 500mg', dosage: '1 tablet daily', duration: '5 days', notes: 'Day 1: 500mg, Day 2-5: 250mg' },
        { name: 'Cetirizine 10mg', dosage: '1 tablet at night', duration: '5 days', notes: '' },
        { name: 'Paracetamol 500mg', dosage: '1 tablet every 6 hours if fever', duration: 'As needed', notes: 'Max 4 tablets/day' },
      ],
      advice: ['Rest for 3 days', 'Drink warm fluids', 'Steam inhalation twice daily', 'Follow-up if not better in 5 days'],
      followUpDate: '2026-04-15', date: '2026-04-09',
    },
  ];
  setStore(PRESCRIPTIONS_KEY, prescriptions);

  // Demo messages
  const messages: Message[] = [
    { id: 'msg-demo-1', fromId: 'demo-d1', fromName: 'Dr. Anil Mehta', fromRole: 'doctor', toId: 'demo-p1', toName: 'Rahul Sharma', toRole: 'patient', subject: 'Your lab results are ready', content: 'Dear Rahul, your recent blood test results are available. Your HbA1c has improved to 7.2% from 8.1%. Keep up the good work with diet and medication! Please continue the same treatment. Next follow-up in 3 months.', type: 'message', read: false, createdAt: '2026-04-08T10:30:00Z' },
    { id: 'msg-demo-2', fromId: 'demo-d1', fromName: 'Dr. Anil Mehta', fromRole: 'doctor', toId: 'demo-p2', toName: 'Priya Devi', toRole: 'patient', subject: 'Prescription for URI', content: 'Dear Priya, I have prescribed antibiotics and supportive care for your upper respiratory infection. Please complete the full course of antibiotics. Rest well and stay hydrated. If symptoms worsen, visit immediately.', type: 'prescription', read: false, createdAt: '2026-04-09T14:00:00Z' },
    { id: 'msg-demo-3', fromId: 'demo-pr1', fromName: 'Prof. Ramesh Iyer', fromRole: 'professor', toId: 'all-students', toName: 'All Students', toRole: 'student', subject: 'Anatomy Practical Exam Schedule', content: 'Dear Students, the Anatomy practical exam is scheduled for April 20th. Topics: Upper limb, Lower limb, and Head & Neck. Bring your dissection kits. Viva will follow the practical. Best of luck!', type: 'announcement', read: false, createdAt: '2026-04-07T09:00:00Z' },
    { id: 'msg-demo-4', fromId: 'demo-pr1', fromName: 'Prof. Ramesh Iyer', fromRole: 'professor', toId: 'demo-s1', toName: 'Arjun Patel', toRole: 'student', subject: 'Assignment Feedback', content: 'Arjun, your assignment on Brachial Plexus was well-written. Good clinical correlations. Score: 18/20. Keep up the excellent work!', type: 'grade', read: false, createdAt: '2026-04-06T16:00:00Z' },
  ];
  setStore(MESSAGES_KEY, messages);

  // Demo notifications
  const notifications: Notification[] = [
    { id: 'notif-demo-1', title: 'Lab Results Available', message: 'Your blood test results are ready to view', type: 'info', fromName: 'Dr. Anil Mehta', fromRole: 'doctor', read: false, actionUrl: '/dashboard/messages', createdAt: '2026-04-08T10:30:00Z' },
    { id: 'notif-demo-2', title: 'New Prescription', message: 'Dr. Anil Mehta has issued a new prescription', type: 'prescription', fromName: 'Dr. Anil Mehta', fromRole: 'doctor', read: false, actionUrl: '/dashboard/prescriptions', createdAt: '2026-04-09T14:00:00Z' },
    { id: 'notif-demo-3', title: 'Exam Schedule', message: 'Anatomy practical exam on April 20th', type: 'announcement', fromName: 'Prof. Ramesh Iyer', fromRole: 'professor', read: false, actionUrl: '/dashboard/messages', createdAt: '2026-04-07T09:00:00Z' },
    { id: 'notif-demo-4', title: 'Appointment Reminder', message: 'You have an appointment tomorrow at 10:00 AM', type: 'warning', read: false, actionUrl: '/dashboard/appointments', createdAt: '2026-04-10T18:00:00Z' },
    { id: 'notif-demo-5', title: 'Medicine Reminder', message: 'Time to take Metformin 500mg', type: 'info', read: false, createdAt: '2026-04-11T08:00:00Z' },
  ];
  setStore(NOTIFICATIONS_KEY, notifications);

  // Demo todos
  const todos: TodoItem[] = [
    { id: 'todo-d1', title: 'Follow up with Rahul Sharma', description: 'Check HbA1c results and adjust medication', category: 'Patient Follow-up', priority: 'high', completed: false, dueDate: '2026-04-15', role: 'doctor', createdAt: '2026-04-08T00:00:00Z' },
    { id: 'todo-d2', title: 'Review Priya Devi lab reports', description: 'Thyroid function test results pending', category: 'Lab Review', priority: 'medium', completed: false, dueDate: '2026-04-12', role: 'doctor', createdAt: '2026-04-07T00:00:00Z' },
    { id: 'todo-p1', title: 'Take Metformin', description: '500mg with breakfast and dinner', category: 'Medicine Reminder', priority: 'high', completed: false, role: 'patient', createdAt: '2026-04-11T00:00:00Z' },
    { id: 'todo-p2', title: 'Blood sugar check', description: 'Fasting blood sugar before breakfast', category: 'Health Check', priority: 'high', completed: false, role: 'patient', createdAt: '2026-04-11T00:00:00Z' },
    { id: 'todo-p3', title: 'Walk 30 minutes', description: 'Evening walk for diabetes management', category: 'Exercise', priority: 'medium', completed: false, role: 'patient', createdAt: '2026-04-11T00:00:00Z' },
    { id: 'todo-s1', title: 'Study Brachial Plexus', description: 'Complete notes and draw diagrams', category: 'Study', priority: 'high', completed: false, dueDate: '2026-04-15', role: 'student', createdAt: '2026-04-09T00:00:00Z' },
    { id: 'todo-s2', title: 'Solve Pharmacology MCQs', description: 'Chapter 5: Autonomic drugs - 50 MCQs', category: 'Practice', priority: 'medium', completed: false, dueDate: '2026-04-13', role: 'student', createdAt: '2026-04-09T00:00:00Z' },
    { id: 'todo-pr1', title: 'Grade Anatomy assignments', description: '45 assignments pending from 1st year', category: 'Grading', priority: 'high', completed: false, dueDate: '2026-04-14', role: 'professor', createdAt: '2026-04-08T00:00:00Z' },
    { id: 'todo-pr2', title: 'Prepare practical exam questions', description: 'Upper limb and Head & Neck spotters', category: 'Assessment', priority: 'high', completed: false, dueDate: '2026-04-18', role: 'professor', createdAt: '2026-04-08T00:00:00Z' },
  ];
  setStore(TODOS_KEY, todos);

  // Demo assignments
  const assignments: Assignment[] = [
    {
      id: 'asgn-demo-1', title: 'Brachial Plexus — Detailed Notes with Diagrams', subject: 'Anatomy',
      description: 'Write comprehensive notes on the brachial plexus covering roots, trunks, divisions, cords, and branches. Include labeled diagrams and at least 3 clinical correlations.',
      dueDate: '2026-04-20', professorName: 'Prof. Ramesh Iyer', professorId: 'demo-pr1', maxMarks: 20,
      submissions: [
        { studentId: 'demo-s1', studentName: 'Arjun Patel', submittedAt: '2026-04-06T15:00:00Z', grade: 18, feedback: 'Excellent work! Great clinical correlations.' },
      ],
      attachments: [], createdAt: '2026-04-01T00:00:00Z',
    },
    {
      id: 'asgn-demo-2', title: 'Pharmacology Case Study — Diabetes Management', subject: 'Pharmacology',
      description: 'Analyze the given case study of a 55-year-old male with Type 2 DM. Discuss drug selection, mechanism, side effects, and monitoring parameters.',
      dueDate: '2026-04-25', professorName: 'Prof. Ramesh Iyer', professorId: 'demo-pr1', maxMarks: 25,
      submissions: [],
      attachments: [], createdAt: '2026-04-05T00:00:00Z',
    },
  ];
  setStore(ASSIGNMENTS_KEY, assignments);

  // Demo uploaded files
  const files: UploadedFile[] = [
    { id: 'file-demo-1', name: 'Anatomy_Upper_Limb_Notes.pdf', type: 'application/pdf', size: 2500000, category: 'Anatomy', uploadedBy: 'Prof. Ramesh Iyer', uploadedByRole: 'professor', description: 'Complete upper limb anatomy notes with diagrams', downloadUrl: '#', createdAt: '2026-04-01T00:00:00Z' },
    { id: 'file-demo-2', name: 'Pharmacology_Drug_Chart.pdf', type: 'application/pdf', size: 1800000, category: 'Pharmacology', uploadedBy: 'Prof. Ramesh Iyer', uploadedByRole: 'professor', description: 'Quick reference drug classification chart', downloadUrl: '#', createdAt: '2026-04-03T00:00:00Z' },
    { id: 'file-demo-3', name: 'Pathology_Previous_Year_2025.pdf', type: 'application/pdf', size: 3200000, category: 'Pathology', uploadedBy: 'Prof. Ramesh Iyer', uploadedByRole: 'professor', description: 'Previous year university exam paper 2025', downloadUrl: '#', createdAt: '2026-04-05T00:00:00Z' },
  ];
  setStore(FILES_KEY, files);

  localStorage.setItem(VERSION_KEY, '2');
}
