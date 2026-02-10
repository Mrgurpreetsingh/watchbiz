import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

/**
 * 🔐 Middleware Next.js
 *
 * Équivalent des middlewares Express :
 * - app.use(cors())
 * - app.use(isAuthenticated)
 * - app.use(rateLimiter)
 *
 * S'exécute AVANT chaque requête
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 🔐 Récupérer la session
  const session = await auth()

  // 🔒 1. Protéger les routes admin
  if (pathname.startsWith('/admin')) {
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // 🔒 2. Protéger les API admin
  if (pathname.startsWith('/api/admin')) {
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  // 🔒 3. Protéger la route /checkout (require auth)
  if (pathname.startsWith('/checkout')) {
    if (!session) {
      const callbackUrl = encodeURIComponent(pathname)
      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${callbackUrl}`, request.url)
      )
    }
  }

  // 🔒 4. Rediriger si déjà connecté sur /login ou /register
  if (pathname === '/login' || pathname === '/register') {
    if (session) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // 📊 5. Logging (optionnel)
  if (process.env.NODE_ENV === 'development') {
    const user = session?.user?.email || 'guest'
    console.log(`[${new Date().toISOString()}] ${request.method} ${pathname} (${user})`)
  }

  // ✅ Continuer la requête
  return NextResponse.next()
}

/**
 * Configuration : sur quelles routes le middleware s'applique
 *
 * On n'applique le middleware que sur les routes qui en ont besoin
 * pour optimiser les performances
 */
export const config = {
  matcher: [
    '/admin/:path*',      // Routes admin
    '/api/admin/:path*',  // API admin
    '/checkout/:path*',   // Route checkout (require auth)
    '/login',             // Redirection si déjà connecté
    '/register',          // Redirection si déjà connecté
  ],
}
