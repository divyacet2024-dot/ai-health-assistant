import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@/auth';
import type { UserRole } from '@prisma/client';

export async function proxy(req: NextRequest) {
  const { user } = await auth(req);
  const pathname = req.nextUrl.pathname;
  const role = user?.role as UserRole | undefined;

  const publicRoutes = ['/select-role', '/auth'];
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  if (!role) {
    return NextResponse.redirect(new URL('/select-role', req.url));
  }

  if (pathname.startsWith('/admin') && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  if (pathname.startsWith('/doctor') && !['DOCTOR', 'ADMIN'].includes(role)) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};