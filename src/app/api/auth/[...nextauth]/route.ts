import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import prisma from '@/lib/postgres-db'
import bcrypt from 'bcryptjs'

const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        totp: { label: 'TOTP Code', type: 'text', optional: true }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password || !await bcrypt.compare(credentials.password, user.password)) {
          throw new Error('Invalid credentials')
        }

        const { password, totpSecret, ...safeUser } = user
        return safeUser
      }
    })
  ],
  session: { 
    strategy: 'jwt',
    maxAge: 6 * 60 * 60
  },
  jwt: {
    maxAge: 6 * 60 * 60
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.userId = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.role && token.userId) {
        session.user.role = token.role
        session.user.id = token.userId
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  debug: process.env.NODE_ENV === 'development'
})

export const GET = handlers.GET
export const POST = handlers.POST
export { auth, signIn, signOut }