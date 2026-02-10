import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Authentification | WatchBiz',
  description: 'Connexion et inscription à WatchBiz',
}

/**
 * 🔐 Layout pour les pages d'authentification
 *
 * Groupe de routes (auth) : Les parenthèses excluent "auth" de l'URL
 * - /login (et non /auth/login)
 * - /register (et non /auth/register)
 *
 * Layout centré avec un fond élégant pour les pages de connexion/inscription
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Container centré */}
      <div className="w-full max-w-md px-6">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">WatchBiz</h1>
          <p className="text-slate-600 mt-2">Montres de luxe</p>
        </div>

        {/* Contenu (login ou register) */}
        {children}
      </div>
    </div>
  )
}
