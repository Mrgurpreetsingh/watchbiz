import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Package, MapPin, ShoppingBag, Clock } from 'lucide-react';
import { PageTransition } from '@/components/animations/page-transition';

export const metadata: Metadata = {
  title: 'Mon Compte - WatchBiz',
  description: 'Tableau de bord de votre compte client',
};

export default async function AccountDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/account');
  }

  // Récupérer les statistiques de l'utilisateur
  const [ordersCount, recentOrders, addressesCount] = await Promise.all([
    // Nombre total de commandes
    prisma.order.count({
      where: { userId: session.user.id },
    }),
    // 3 commandes les plus récentes
    prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
    // Nombre d'adresses
    prisma.address.count({
      where: { userId: session.user.id },
    }),
  ]);

  // Calculer le montant total dépensé
  const totalSpent = recentOrders.reduce((sum, order) => sum + order.total, 0);

  // Statut de la dernière commande
  const lastOrder = recentOrders[0];

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    PROCESSING: 'bg-blue-100 text-blue-800',
    SHIPPED: 'bg-purple-100 text-purple-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };

  const statusLabels = {
    PENDING: 'En attente',
    PROCESSING: 'En traitement',
    SHIPPED: 'Expédiée',
    DELIVERED: 'Livrée',
    CANCELLED: 'Annulée',
  };

  return (
    <PageTransition>
      <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-luxury-black to-onyx text-white rounded-lg shadow-lg p-6 md:p-8">
        <h2 className="font-heading text-2xl md:text-3xl font-bold mb-2">
          Bienvenue, {session.user.name || 'Client'} ! 👋
        </h2>
        <p className="text-slate-300">
          Gérez vos commandes, adresses et paramètres de compte depuis votre tableau de bord
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Commandes */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gold-champagne/10 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-gold-champagne" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-luxury-black dark:text-white mb-1">{ordersCount}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">Commande{ordersCount > 1 ? 's' : ''}</p>
        </div>

        {/* Total Dépensé */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
              <Package className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-luxury-black dark:text-white mb-1">
            {totalSpent.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">Total dépensé</p>
        </div>

        {/* Adresses */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-luxury-black mb-1">{addressesCount}</h3>
          <p className="text-sm text-slate-600">Adresse{addressesCount > 1 ? 's' : ''}</p>
        </div>

        {/* Dernière Commande */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-luxury-black mb-1">
            {lastOrder ? statusLabels[lastOrder.status] : 'Aucune'}
          </h3>
          <p className="text-sm text-slate-600">Dernière commande</p>
        </div>
      </div>

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-heading text-xl font-bold text-luxury-black dark:text-white">
              Commandes Récentes
            </h3>
            <Link
              href="/account/orders"
              className="text-sm text-gold-champagne hover:text-gold-dark font-medium"
            >
              Voir tout →
            </Link>
          </div>

          <div className="space-y-4">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="block border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:border-gold-champagne hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-luxury-black dark:text-white mb-1">
                      Commande #{order.orderNumber}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-luxury-black dark:text-white mb-1">
                      {order.total.toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                      })}
                    </p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        statusColors[order.status]
                      }`}
                    >
                      {statusLabels[order.status]}
                    </span>
                  </div>
                </div>

                <div className="text-sm text-slate-600 dark:text-slate-300">
                  {order.items.length} article{order.items.length > 1 ? 's' : ''}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="font-heading text-xl font-bold text-luxury-black mb-4">
          Accès Rapide
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/account/orders"
            className="flex items-center gap-4 p-4 border-2 border-slate-200 dark:border-slate-700 rounded-lg hover:border-gold-champagne hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-gold-champagne/10 rounded-full flex items-center justify-center group-hover:bg-gold-champagne/20 transition-colors">
              <Package className="w-6 h-6 text-gold-champagne" />
            </div>
            <div>
              <p className="font-semibold text-luxury-black dark:text-white">Mes Commandes</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">Suivez vos achats</p>
            </div>
          </Link>

          <Link
            href="/account/addresses"
            className="flex items-center gap-4 p-4 border-2 border-slate-200 dark:border-slate-700 rounded-lg hover:border-gold-champagne hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-luxury-black dark:text-white">Mes Adresses</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">Gérez vos adresses</p>
            </div>
          </Link>
        </div>
      </div>

      {/* No Orders State */}
      {ordersCount === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 text-slate-400 dark:text-slate-300" />
          </div>
          <h3 className="font-heading text-xl font-bold text-luxury-black dark:text-white mb-2">
            Aucune commande pour le moment
          </h3>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            Découvrez notre collection exclusive de montres de luxe
          </p>
          <Link
            href="/products"
            className="inline-block px-6 py-3 bg-gradient-to-r from-gold-champagne to-gold-dark text-luxury-black rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Découvrir la Collection
          </Link>
        </div>
      )}
    </PageTransition>
  );
}
