import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getUserProfile } from '@/actions/profile';
import { ProfileForm } from '@/components/account/profile-form';

export const metadata: Metadata = {
  title: 'Mon Profil - WatchBiz',
  description: 'Gérez vos informations personnelles',
};

/**
 * 👤 Page Profil Utilisateur
 *
 * Affiche et permet de modifier les informations personnelles
 */
export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/account/profile');
  }

  // Fetch user profile
  const result = await getUserProfile();

  if (!result.success || !result.data) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <p className="text-red-600">Erreur lors du chargement du profil.</p>
      </div>
    );
  }

  const user = result.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="font-heading text-2xl font-bold text-luxury-black mb-2">
          Informations Personnelles
        </h2>
        <p className="text-slate-mid text-sm">
          Modifiez vos informations de profil et votre avatar
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <ProfileForm user={user} />
      </div>

      {/* Account Info */}
      <div className="bg-slate-light/30 rounded-lg p-6">
        <h3 className="font-medium text-luxury-black mb-4">Informations du compte</h3>
        <dl className="grid gap-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-mid">ID Utilisateur</dt>
            <dd className="font-mono text-xs text-luxury-black">{user.id}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-mid">Rôle</dt>
            <dd className="font-semibold text-luxury-black">
              {user.role === 'ADMIN' ? '👑 Administrateur' : '👤 Client'}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-mid">Membre depuis</dt>
            <dd className="text-luxury-black">
              {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
