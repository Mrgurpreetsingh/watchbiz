import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { PasswordForm } from '@/components/account/password-form'
import { Shield, AlertTriangle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Sécurité - WatchBiz',
  description: 'Gérez la sécurité de votre compte. Modifiez votre mot de passe et protégez vos informations personnelles.',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/account/security`,
  },
}

/**
 * 🔐 Page Sécurité
 *
 * Changement de mot de passe
 */
export default async function SecurityPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login?callbackUrl=/account/security')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-start gap-3">
          <Shield className="h-6 w-6 text-gold-champagne flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="font-heading text-2xl font-bold text-luxury-black mb-2">
              Sécurité du Compte
            </h2>
            <p className="text-slate-mid text-sm">
              Modifiez votre mot de passe pour sécuriser votre compte
            </p>
          </div>
        </div>
      </div>

      {/* Password Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="font-medium text-luxury-black mb-6">
          Changer le mot de passe
        </h3>
        <PasswordForm />
      </div>

      {/* Security Tips */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-amber-900 mb-2">
              Conseils de sécurité
            </h4>
            <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
              <li>Utilisez un mot de passe unique pour chaque site</li>
              <li>Activez l'authentification à deux facteurs quand c'est possible</li>
              <li>Ne partagez jamais votre mot de passe</li>
              <li>Changez régulièrement votre mot de passe</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
