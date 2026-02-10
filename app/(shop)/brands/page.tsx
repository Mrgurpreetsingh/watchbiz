import { Metadata } from 'next';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { Tag } from 'lucide-react';
import { PageTransition } from '@/components/animations/page-transition';

export const metadata: Metadata = {
  title: 'Nos Marques - WatchBiz',
  description: 'Découvrez notre sélection exclusive de marques horlogères prestigieuses. Les plus grandes manufactures de montres de luxe.',
};

export default async function BrandsPage() {
  // Récupérer toutes les marques avec le nombre de produits
  const brands = await prisma.brand.findMany({
    where: {
      products: {
        some: {
          isActive: true, // Seulement les marques avec produits actifs
        },
      },
    },
    include: {
      _count: {
        select: {
          products: {
            where: { isActive: true },
          },
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  return (
    <PageTransition>
      <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-luxury-black to-onyx text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-6">
              Nos Marques
            </h1>
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed">
              Découvrez notre sélection exclusive des plus grandes manufactures horlogères mondiales.
              Chaque marque représente l'excellence, le savoir-faire et l'héritage de l'horlogerie de luxe.
            </p>
          </div>
        </div>
      </section>

      {/* Brands Grid */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {brands.length === 0 ? (
            <div className="text-center py-16">
              <Tag className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="font-heading text-2xl text-slate-900 mb-2">
                Aucune marque disponible
              </h3>
              <p className="text-slate-600">
                Revenez bientôt pour découvrir notre collection
              </p>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="text-center mb-12">
                <p className="text-slate-600">
                  <span className="text-3xl font-bold text-gold-champagne">{brands.length}</span> marques prestigieuses
                </p>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                {brands.map((brand) => (
                  <Link
                    key={brand.id}
                    href={`/products?brand=${brand.slug}`}
                    className="group bg-slate-50 rounded-lg p-6 md:p-8 hover:shadow-lg hover:bg-white transition-all text-center"
                  >
                    {/* Logo */}
                    {brand.logo ? (
                      <div className="mb-6 flex items-center justify-center h-24">
                        <img
                          src={brand.logo}
                          alt={brand.name}
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                        />
                      </div>
                    ) : (
                      <div className="h-24 flex items-center justify-center mb-6">
                        <div className="w-20 h-20 bg-gold-champagne/10 rounded-full flex items-center justify-center group-hover:bg-gold-champagne/20 transition-colors">
                          <Tag className="w-8 h-8 text-gold-champagne" />
                        </div>
                      </div>
                    )}

                    {/* Nom */}
                    <h3 className="font-heading text-lg md:text-xl text-slate-900 mb-2 group-hover:text-gold-champagne transition-colors">
                      {brand.name}
                    </h3>

                    {/* Nombre de produits */}
                    <p className="text-sm text-slate-600">
                      {brand._count.products} {brand._count.products > 1 ? 'montres' : 'montre'}
                    </p>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl md:text-4xl text-slate-900 mb-6">
            Explorez notre collection complète
          </h2>
          <p className="text-slate-600 mb-8 text-lg">
            Découvrez toutes nos montres de luxe soigneusement sélectionnées
          </p>
          <Link
            href="/products"
            className="inline-block bg-gradient-to-r from-gold-champagne to-gold-dark text-luxury-black px-8 py-3 rounded-md font-medium hover:shadow-lg transition-all"
          >
            Voir toutes les montres
          </Link>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl text-slate-900 mb-4">
              L'Excellence Horlogère
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Chaque marque présente dans notre catalogue a été soigneusement sélectionnée
              pour son histoire, son savoir-faire et son engagement envers l'excellence.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="font-heading text-xl text-slate-900 mb-2">
                Authenticité Garantie
              </h3>
              <p className="text-sm text-slate-600">
                Toutes nos montres sont 100% authentiques et accompagnées de leurs certificats d'origine
              </p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-4">⚙️</div>
              <h3 className="font-heading text-xl text-slate-900 mb-2">
                Savoir-Faire Ancestral
              </h3>
              <p className="text-sm text-slate-600">
                Des manufactures réputées pour leur expertise et leur héritage horloger unique
              </p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-4">💎</div>
              <h3 className="font-heading text-xl text-slate-900 mb-2">
                Qualité Premium
              </h3>
              <p className="text-sm text-slate-600">
                Sélection rigoureuse des plus belles créations de l'horlogerie de luxe
              </p>
            </div>
          </div>
        </div>
      </section>
      </div>
    </PageTransition>
  );
}
