// RBAC Permissions for HIPAA Compliance
import type { UserRole } from '@prisma/client'

export type Permission = 
  | 'read:own-data'
  | 'read:patient-data'
  | 'write:appointments'
  | 'write:prescriptions'
  | 'admin:manage-users'
  | 'audit:view-logs'

const rolePermissions: Record<UserRole, Permission[]> = {
  PATIENT: ['read:own-data', 'write:appointments'],
  STUDENT: ['read:own-data'],
  DOCTOR: ['read:patient-data', 'read:own-data', 'write:appointments', 'write:prescriptions'],
  PROFESSOR: ['read:own-data', 'write:appointments'],
  ADMIN: ['admin:manage-users', 'read:patient-data', 'audit:view-logs']
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) || false
}

export function canAccessPatientData(role: UserRole): boolean {
  return ['DOCTOR', 'ADMIN'].includes(role)
}

export function isAdmin(role: UserRole): boolean {
  return role === 'ADMIN'
}

export function getAllowedRoles(permission: Permission): UserRole[] {
  return Object.entries(rolePermissions)
    .filter(([, perms]) => perms.includes(permission))
    .map(([role]) => role as UserRole)
}

