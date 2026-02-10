/**
 * 🔐 API Route NextAuth
 *
 * Cette route gère TOUTES les requêtes d'authentification :
 * - GET  /api/auth/signin      → Page de connexion
 * - POST /api/auth/signin      → Login
 * - GET  /api/auth/signout     → Déconnexion
 * - POST /api/auth/signout     → Déconnexion
 * - GET  /api/auth/session     → Récupérer la session
 * - GET  /api/auth/csrf        → Token CSRF
 * - GET  /api/auth/providers   → Liste des providers
 *
 * Équivalent de app.use('/api/auth', authRoutes) dans Express
 */

import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth'

/**
 * NextAuth Handler
 *
 * NextAuth() retourne un objet avec { handlers, auth, signIn, signOut }
 * - handlers : { GET, POST } pour les API routes
 * - auth : fonction pour vérifier la session (server-side)
 * - signIn : fonction pour se connecter (server-side)
 * - signOut : fonction pour se déconnecter (server-side)
 */
const { handlers } = NextAuth(authConfig)

/**
 * Export des handlers GET et POST
 *
 * Next.js App Router nécessite d'exporter explicitement
 * les méthodes HTTP supportées
 */
export const { GET, POST } = handlers

/**
 * USAGE dans votre code :
 *
 * 1. Server Components (app/page.tsx)
 * ```typescript
 * import { auth } from '@/lib/auth'
 *
 * export default async function Page() {
 *   const session = await auth()
 *   if (!session) return <div>Not logged in</div>
 *   return <div>Hello {session.user.name}</div>
 * }
 * ```
 *
 * 2. Client Components (components/...)
 * ```typescript
 * 'use client'
 * import { useSession, signIn, signOut } from 'next-auth/react'
 *
 * export function Component() {
 *   const { data: session, status } = useSession()
 *
 *   if (status === 'loading') return <div>Loading...</div>
 *   if (!session) return <button onClick={() => signIn()}>Sign in</button>
 *   return <button onClick={() => signOut()}>Sign out</button>
 * }
 * ```
 *
 * 3. API Routes (app/api/route.ts)
 * ```typescript
 * import { auth } from '@/lib/auth'
 *
 * export async function GET(request: Request) {
 *   const session = await auth()
 *   if (!session) {
 *     return Response.json({ error: 'Unauthorized' }, { status: 401 })
 *   }
 *   // ...
 * }
 * ```
 */
