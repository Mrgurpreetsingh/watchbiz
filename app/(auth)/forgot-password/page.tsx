import { Metadata } from 'next'
import Link from 'next/link'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'
import { PageTransition } from '@/components/animations/page-transition'

export const metadata: Metadata = {
  title: 'Mot de passe oublié - WatchBiz',
  description: 'Réinitialisez votre mot de passe',
}

/**
 * 🔒 Page Mot de Passe Oublié
 *
 * Formulaire pour demander un email de réinitialisation
 */
export default function ForgotPasswordPage() {
  return (
    <PageTransition>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 max-w-md mx-auto">
        {/* Titre */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Mot de passe oublié ?
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm">
            Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </p>
        </div>

        {/* Formulaire */}
        <ForgotPasswordForm />

        {/* Lien retour connexion */}
        <div className="mt-6 text-center text-sm">
          <Link
            href="/login"
            className="text-gold-champagne hover:text-gold-dark font-medium transition-colors"
          >
            ← Retour à la connexion
          </Link>
        </div>
      </div>
    </PageTransition>
  )
}
