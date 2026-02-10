import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { verifyResetToken } from '@/actions/auth-reset'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'
import { PageTransition } from '@/components/animations/page-transition'

export const metadata: Metadata = {
  title: 'Réinitialiser le mot de passe - WatchBiz',
  description: 'Choisissez un nouveau mot de passe',
}

interface ResetPasswordPageProps {
  params: Promise<{
    token: string
  }>
}

/**
 * 🔑 Page Réinitialisation Mot de Passe
 *
 * Formulaire pour définir un nouveau mot de passe via token
 */
export default async function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  const { token } = await params

  // Vérifier la validité du token
  const result = await verifyResetToken(token)

  if (!result.success || !result.data) {
    return (
      <PageTransition>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Lien invalide ou expiré
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            {result.error || 'Ce lien de réinitialisation n\'est plus valide.'}
          </p>
          <Link
            href="/forgot-password"
            className="inline-block px-6 py-3 bg-gradient-to-r from-gold-champagne to-gold-dark text-luxury-black rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Faire une nouvelle demande
          </Link>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 max-w-md mx-auto">
        {/* Titre */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Nouveau mot de passe
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm">
            Choisissez un nouveau mot de passe pour <span className="font-semibold">{result.data.email}</span>
          </p>
        </div>

        {/* Formulaire */}
        <ResetPasswordForm token={token} />
      </div>
    </PageTransition>
  )
}
