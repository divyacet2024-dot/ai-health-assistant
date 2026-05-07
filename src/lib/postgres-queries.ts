import prisma from './postgres-db';
import { Appointment, Prescription, Payment, User } from '@prisma/client';

/**
 * PostgreSQL Database Queries
 * Handles relational data: users, appointments, prescriptions, payments
 */

// ===== User Operations =====

export async function createUser(data: {
  email: string;
  password: string;
  name: string;
  role: 'PATIENT' | 'STUDENT' | 'DOCTOR' | 'PROFESSOR' | 'ADMIN';
  firebaseUid?: string;
  phone?: string;
  address?: string;
}): Promise<User> {
  return prisma.user.create({ data });
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function getUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { id },
  });
}

export async function getUserByFirebaseUid(firebaseUid: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { firebaseUid },
  });
}

export async function updateUser(
  id: string,
  data: Partial<User>
): Promise<User> {
  return prisma.user.update({
    where: { id },
    data,
  });
}

// ===== Appointment Operations =====

export async function createAppointment(data: {
  userId: string;
  doctorId?: string;
  departmentId?: string;
  date: Date;
  time: string;
  reason?: string;
}): Promise<Appointment> {
  return prisma.appointment.create({
    data,
  });
}

export async function getAppointmentsByUser(userId: string): Promise<Appointment[]> {
  return prisma.appointment.findMany({
    where: { userId },
    include: { doctor: true, department: true },
    orderBy: { date: 'desc' },
  });
}

export async function getAppointmentsByDoctor(doctorId: string): Promise<Appointment[]> {
  return prisma.appointment.findMany({
    where: { doctorId },
    include: { user: true, department: true },
    orderBy: { date: 'desc' },
  });
}

export async function getAppointmentById(id: string): Promise<Appointment | null> {
  return prisma.appointment.findUnique({
    where: { id },
    include: { doctor: true, department: true, user: true },
  });
}

export async function updateAppointmentStatus(
  id: string,
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED'
): Promise<Appointment> {
  return prisma.appointment.update({
    where: { id },
    data: { status, updatedAt: new Date() },
  });
}

export async function deleteAppointment(id: string): Promise<Appointment> {
  return prisma.appointment.delete({
    where: { id },
  });
}

export async function getAvailableAppointments(
  doctorId: string,
  date: Date
): Promise<Appointment[]> {
  return prisma.appointment.findMany({
    where: {
      doctorId,
      date: {
        gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
      },
      status: { in: ['SCHEDULED', 'CONFIRMED'] },
    },
  });
}

// ===== Prescription Operations =====

export async function createPrescription(data: {
  userId: string;
  medicineId: string;
  dosage: string;
  frequency: string;
  duration: string;
  startDate: Date;
  endDate?: Date;
  notes?: string;
}): Promise<Prescription> {
  return prisma.prescription.create({
    data,
  });
}

export async function getPrescriptionsByUser(userId: string): Promise<Prescription[]> {
  return prisma.prescription.findMany({
    where: { userId },
    include: { medicine: true },
    orderBy: { startDate: 'desc' },
  });
}

export async function getActivePrescriptions(userId: string): Promise<Prescription[]> {
  const today = new Date();
  return prisma.prescription.findMany({
    where: {
      userId,
      startDate: { lte: today },
      OR: [
        { endDate: null },
        { endDate: { gte: today } },
      ],
    },
    include: { medicine: true },
    orderBy: { startDate: 'desc' },
  });
}

export async function getPrescriptionById(id: string): Promise<Prescription | null> {
  return prisma.prescription.findUnique({
    where: { id },
    include: { medicine: true, user: true },
  });
}

export async function updatePrescription(
  id: string,
  data: Partial<Prescription>
): Promise<Prescription> {
  return prisma.prescription.update({
    where: { id },
    data: { ...data, updatedAt: new Date() },
  });
}

// ===== Payment Operations =====

export async function createPayment(data: {
  userId: string;
  appointmentId?: string;
  amount: number;
  method: 'UPI' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'CASH';
  notes?: string;
}): Promise<Payment> {
  return prisma.payment.create({
    data,
  });
}

export async function getPaymentsByUser(userId: string): Promise<Payment[]> {
  return prisma.payment.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getPaymentById(id: string): Promise<Payment | null> {
  return prisma.payment.findUnique({
    where: { id },
  });
}

export async function updatePaymentStatus(
  id: string,
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
): Promise<Payment> {
  return prisma.payment.update({
    where: { id },
    data: { status, updatedAt: new Date() },
  });
}

export async function getCompletedPayments(userId: string): Promise<Payment[]> {
  return prisma.payment.findMany({
    where: {
      userId,
      status: 'COMPLETED',
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getTotalRevenue(): Promise<number> {
  const result = await prisma.payment.aggregate({
    where: { status: 'COMPLETED' },
    _sum: { amount: true },
  });
  return result._sum.amount || 0;
}

// ===== Department Operations =====

export async function getAllDepartments() {
  return prisma.department.findMany({
    orderBy: { name: 'asc' },
  });
}

export async function getDepartmentById(id: string) {
  return prisma.department.findUnique({
    where: { id },
  });
}

export async function createDepartment(data: {
  name: string;
  description?: string;
  imageUrl?: string;
}) {
  return prisma.department.create({ data });
}

// ===== Medicine Operations =====

export async function getAllMedicines() {
  return prisma.medicine.findMany({
    where: { inStock: true },
    orderBy: { name: 'asc' },
  });
}

export async function getMedicineById(id: string) {
  return prisma.medicine.findUnique({
    where: { id },
  });
}

export async function searchMedicines(query: string) {
  return prisma.medicine.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { genericName: { contains: query, mode: 'insensitive' } },
        { category: { contains: query, mode: 'insensitive' } },
      ],
    },
    orderBy: { name: 'asc' },
  });
}

export async function createMedicine(data: {
  name: string;
  genericName: string;
  category: string;
  manufacturer?: string;
  usage: string;
  dosage: string;
  sideEffects: string[];
  warnings: string[];
  price: number;
}) {
  return prisma.medicine.create({ data });
}

// ===== Utility Functions =====

export async function getAppointmentStats(userId: string) {
  return prisma.appointment.groupBy({
    by: ['status'],
    where: { userId },
    _count: true,
  });
}

export async function getMonthlyRevenue(year: number, month: number) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  return prisma.payment.aggregate({
    where: {
      status: 'COMPLETED',
      createdAt: {
        gte: startDate,
        lt: endDate,
      },
    },
    _sum: { amount: true },
  });
}
