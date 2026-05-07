 'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from '@/app/providers/theme-provider'

export function Providers({ 
  children, 
  ...props 
}: ThemeProviderProps) {
  return (
    <SessionProvider>
      <NextThemesProvider {...props}>
        {children}
      </NextThemesProvider>
    </SessionProvider>
  )
}

