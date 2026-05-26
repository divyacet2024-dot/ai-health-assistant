import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import type { UserRole } from "@prisma/client";

/**
 * Minimal auth helper for App Router middleware.
 * Returns a request-scoped auth object containing the JWT payload.
 */
export async function auth(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  return {
    user: {
      id: (token as any)?.sub,
      role: (token as any)?.role as UserRole | undefined,
    },
    token,
  };
}

