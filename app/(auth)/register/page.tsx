/**
 * 📝 Page d'Inscription
 *
 * Formulaire d'inscription avec nom, email, mot de passe
 * Crée un nouveau compte utilisateur dans la DB
 */

import { RegisterForm } from '@/components/auth/register-form'
import Link from 'next/link'
import { Metadata } from 'next'
import { PageTransition } from '@/components/animations/page-transition'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'Créer un compte - WatchBiz',
  description: 'Créez votre compte WatchBiz pour découvrir notre collection exclusive de montres de luxe et profiter d\'une expérience d\'achat personnalisée.',
  alternates: {
    canonical: `${baseUrl}/register`,
  },
  openGraph: {
    title: 'Créer un compte - WatchBiz',
    description: 'Rejoignez WatchBiz pour découvrir nos montres de luxe',
    type: 'website',
    url: `${baseUrl}/register`,
  },
};

export default function RegisterPage() {
  return (
    <PageTransition>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
      {/* Titre */}
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
        Créer un compte
      </h2>
      <p className="text-slate-600 dark:text-slate-300 mb-6">
        Rejoignez WatchBiz pour découvrir nos montres de luxe
      </p>

      {/* Formulaire d'inscription */}
      <RegisterForm />

      {/* Lien vers connexion */}
      <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
        Vous avez déjà un compte ?{' '}
        <Link
          href="/login"
          className="font-medium text-slate-900 dark:text-white hover:underline"
        >
          Se connecter
        </Link>
      </div>
    </PageTransition>
  )
}
