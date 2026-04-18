/**
 * MongoDB Collection Names and Types
 * Using native mongodb driver (no mongoose) for lighter builds.
 */

export const COLLECTIONS = {
  users: 'users',
  appointments: 'appointments',
  chatMessages: 'chat_messages',
  studyTasks: 'study_tasks',
  materials: 'materials',
  studentQueries: 'student_queries',
  classSchedule: 'class_schedule',
  payments: 'payments',
  tokenCounters: 'token_counters',
} as const;
