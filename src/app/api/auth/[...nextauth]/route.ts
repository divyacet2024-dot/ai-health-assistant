import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { findUserByEmailAndRole } from '@/lib/auth-db';
import type { UserRole } from '@/lib/types';

const providers = [
  CredentialsProvider({
    name: 'Credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
      role: { label: 'Role', type: 'text' },
    },
    async authorize(credentials) {
      type Credentials = { email: string; password: string; role: string };
      const typedCredentials = credentials as Credentials | undefined;

      if (!typedCredentials?.email || !typedCredentials?.password || !typedCredentials?.role) {
        return null;
      }

      const user = findUserByEmailAndRole(
        typedCredentials.email,
        typedCredentials.role as UserRole | 'admin',
      );
      if (!user) {
        return null;
      }
      if (user.password !== typedCredentials.password) {
        return null;
      }
      if (user.status === 'blocked') {
        throw new Error('Your account has been blocked. Contact the administrator.');
      }
      if (user.status === 'pending') {
        throw new Error('Your account is pending approval.');
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      };
    },
  }),
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? [
        GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
      ]
    : []),
  ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
    ? [
        GitHubProvider({
          clientId: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
        }),
      ]
    : []),
];

const trustHost =
  process.env.NEXTAUTH_TRUST_HOST === 'true' ||
  process.env.AUTH_TRUST_HOST === 'true' ||
  process.env.NODE_ENV !== 'production' ||
  /^(?:https?:\/\/localhost|https?:\/\/127\.0\.0\.1)/.test(
    process.env.NEXTAUTH_URL ?? process.env.AUTH_URL ?? ''
  );

export const authOptions = {
  providers,
  secret: process.env.NEXTAUTH_SECRET,
  trustHost,
  debug: process.env.NODE_ENV !== 'production',
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.status = (user as any).status;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
        session.user.role = token.role as string | undefined;
        session.user.status = token.status as string | undefined;
      }
      return session;
    },
  },
};

const nextAuth = NextAuth(authOptions);
const GET = typeof nextAuth === 'function' ? nextAuth : nextAuth.handlers.GET;
const POST = typeof nextAuth === 'function' ? nextAuth : nextAuth.handlers.POST;

export { GET, POST };



