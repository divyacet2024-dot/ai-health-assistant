import { auth } from '@/app/api/auth/[...nextauth]/route'
import { NextResponse } from 'next/server'
import { UserRole } from '@prisma/client'

export default auth((req) => {
  const pathname = req.nextUrl.pathname
  const role = req.auth?.user?.role as UserRole | undefined

  const publicRoutes = ['/select-role', '/auth/signin', '/auth/error']
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return
  }

  if (!role) {
    return NextResponse.redirect(new URL('/select-role', req.url))
  }

  if (pathname.startsWith('/admin') && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  if (pathname.startsWith('/doctor') && !['DOCTOR', 'ADMIN'].includes(role)) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}