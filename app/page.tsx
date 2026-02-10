import Link from 'next/link';
import { Metadata } from 'next';
import { Award, Shield, Truck, Clock } from 'lucide-react';
import prisma from '@/lib/prisma';
import { ProductCard } from '@/components/products/product-card';
import { RecentlyViewed } from '@/components/products/recently-viewed';
import { PageTransition } from '@/components/animations/page-transition';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'WatchBiz - Montres de Luxe | Collection Exclusive',
  description: 'Découvrez notre collection exclusive de montres de luxe : Rolex, Omega, TAG Heuer et plus encore. Authenticité garantie, expertise reconnue.',
  alternates: {
    canonical: baseUrl,
  },
  openGraph: {
    title: 'WatchBiz - Montres de Luxe | Collection Exclusive',
    description: 'Découvrez notre collection exclusive de montres de luxe : Rolex, Omega, TAG Heuer et plus encore.',
    type: 'website',
    url: baseUrl,
  },
};

// ISR - Revalidate toutes les 30 minutes (1800 secondes)
export const revalidate = 1800;

export default async function HomePage() {
  // Récupérer les produits phares (featured) et actifs
  const featuredProducts = await prisma.product.findMany({
    where: {
      isActive: true,
      isFeatured: true,
    },
    include: {
      brand: true,
      category: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 4,
  });

  // Récupérer les marques principales
  const topBrands = await prisma.brand.findMany({
    where: {
      products: {
        some: { isActive: true },
      },
    },
    include: {
      _count: {
        select: {
          products: { where: { isActive: true } },
        },
      },
    },
    orderBy: {
      products: {
        _count: 'desc',
      },
    },
    take: 6,
  });

  // JSON-LD Structured Data pour SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://watchbiz.com/#organization',
        name: 'WatchBiz',
        url: baseUrl,
        logo: `${baseUrl}/logo.png`,
        description: 'Boutique de montres de luxe - Authenticité garantie et expertise reconnue',
      },
      {
        '@type': 'WebSite',
        '@id': 'https://watchbiz.com/#website',
        url: baseUrl,
        name: 'WatchBiz',
        description: 'Collection exclusive de montres de luxe',
        publisher: {
          '@id': 'https://watchbiz.com/#organization',
        },
      },
    ],
  };

  return (
    <PageTransition>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-luxury-black via-onyx to-luxury-black text-white overflow-hidden">
        {/* Effet de fond */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(212,175,55,0.1),transparent_50%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="font-heading text-4xl sm:text-5xl md:text-7xl font-bold mb-6 text-balance">
              L'Excellence Horlogère
              <span className="block text-gold-champagne mt-2">À Votre Poignet</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-10 text-balance max-w-2xl mx-auto leading-relaxed">
              Découvrez notre collection exclusive de montres de luxe.
              Authenticité garantie, expertise reconnue, service d'exception.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/products"
                className="px-8 py-4 bg-gradient-to-r from-gold-champagne to-gold-dark text-luxury-black rounded-lg font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                Découvrir la Collection
              </Link>
              <Link
                href="/brands"
                className="px-8 py-4 border-2 border-gold-champagne text-gold-champagne rounded-lg font-semibold hover:bg-gold-champagne/10 transition-all duration-300"
              >
                Nos Marques
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Produits Phares */}
      {featuredProducts.length > 0 && (
        <section className="py-16 md:py-24 bg-white dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-luxury-black dark:text-white mb-4">
                Collection Phare
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-lg max-w-2xl mx-auto">
                Nos montres d'exception, sélectionnées pour leur prestige et leur savoir-faire
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                href="/products"
                className="inline-block px-8 py-3 border-2 border-luxury-black dark:border-slate-700 text-luxury-black dark:text-white rounded-lg font-semibold hover:bg-luxury-black dark:hover:bg-slate-700 hover:text-white transition-all duration-300"
              >
                Voir toute la collection
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Marques Prestigieuses */}
      {topBrands.length > 0 && (
        <section className="py-16 md:py-24 bg-slate-50 dark:bg-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-luxury-black dark:text-white mb-4">
                Marques Prestigieuses
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-lg max-w-2xl mx-auto">
                Les plus grandes maisons horlogères dans notre collection
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {topBrands.map((brand) => (
                <Link
                  key={brand.id}
                  href={`/products?brand=${brand.slug}`}
                  className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-gold-champagne hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center group"
                >
                  {brand.logo ? (
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="h-12 w-auto object-contain mb-3 grayscale group-hover:grayscale-0 transition-all"
                    />
                  ) : (
                    <span className="font-heading text-xl font-bold text-luxury-black dark:text-white mb-3">
                      {brand.name}
                    </span>
                  )}
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {brand._count.products} montre{brand._count.products > 1 ? 's' : ''}
                  </span>
                </Link>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                href="/brands"
                className="inline-block px-8 py-3 border-2 border-luxury-black dark:border-slate-700 text-luxury-black dark:text-white rounded-lg font-semibold hover:bg-luxury-black dark:hover:bg-slate-700 hover:text-white transition-all duration-300"
              >
                Toutes nos marques
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Recently Viewed Products */}
      <RecentlyViewed maxItems={4} className="bg-slate-light/50" />

      {/* Nos Valeurs */}
      <section className="py-16 md:py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-luxury-black dark:text-white mb-4">
              Pourquoi Choisir WatchBiz
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-lg max-w-2xl mx-auto">
              L'excellence à chaque étape de votre expérience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gold-champagne/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-gold-champagne/20 transition-colors">
                <Shield className="w-8 h-8 text-gold-champagne" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-luxury-black dark:text-white mb-2">
                Authenticité Garantie
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Chaque montre est certifiée authentique avec certificat d'origine
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gold-champagne/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-gold-champagne/20 transition-colors">
                <Award className="w-8 h-8 text-gold-champagne" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-luxury-black dark:text-white mb-2">
                Expertise Reconnue
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Plus de 15 ans d'expérience dans l'horlogerie de luxe
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gold-champagne/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-gold-champagne/20 transition-colors">
                <Truck className="w-8 h-8 text-gold-champagne" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-luxury-black dark:text-white mb-2">
                Livraison Sécurisée
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Livraison assurée et suivie dans toute la France
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gold-champagne/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-gold-champagne/20 transition-colors">
                <Clock className="w-8 h-8 text-gold-champagne" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-luxury-black dark:text-white mb-2">
                Garantie 2 Ans
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Service après-vente et garantie internationale
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-luxury-black to-onyx text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            Prêt à Découvrir Votre Prochaine Montre ?
          </h2>
          <p className="text-slate-300 text-lg mb-8">
            Explorez notre collection exclusive et trouvez la montre de vos rêves
          </p>
          <Link
            href="/products"
            className="inline-block px-10 py-4 bg-gradient-to-r from-gold-champagne to-gold-dark text-luxury-black rounded-lg font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            Explorer la Collection
          </Link>
        </div>
      </section>
    </PageTransition>
  );
}
