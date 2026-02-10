'use client'

/**
 * 🔐 Session Provider
 *
 * Wrapper pour NextAuth SessionProvider
 * Permet d'utiliser useSession() dans les Client Components
 */

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
}
