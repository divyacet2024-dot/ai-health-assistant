import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function useAuthSession() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // Redirect unauthenticated to auth page
    if (status === 'unauthenticated') {
      router.push('/select-role')
    }
  }, [status, router])

  return {
    session,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    userRole: session?.user?.role as string | undefined,
    userId: session?.user?.id as string | undefined,
    hasSession: !!session
  }
}

export function useRoleGuard(allowedRoles: string[]) {
  const { userRole, isAuthenticated } = useAuthSession()

  const isAuthorized = isAuthenticated && (userRole ? allowedRoles.includes(userRole) : false)

  return {
    isAuthorized,
    userRole
  }
}

// Higher-order guard hook
export function useAdminOnly() {
  return useRoleGuard(['ADMIN'])
}

export function useDoctorOrAdmin() {
  return useRoleGuard(['DOCTOR', 'ADMIN'])
}

