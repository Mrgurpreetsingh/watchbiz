import { Metadata } from 'next';
import { Watch, Award, Shield, TrendingUp } from 'lucide-react';
import { PageTransition } from '@/components/animations/page-transition';

export const metadata: Metadata = {
  title: 'À propos - WatchBiz',
  description: 'Découvrez l\'histoire de WatchBiz, votre destination pour les montres de luxe. Excellence, authenticité et service client irréprochable.',
};

export default function AboutPage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-white dark:bg-slate-900">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-luxury-black to-onyx text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-6">
              Notre Histoire
            </h1>
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed">
              Depuis notre création, WatchBiz s'est imposé comme la référence en matière de montres de luxe en ligne,
              alliant expertise horlogère et excellence du service client.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-heading text-3xl md:text-4xl text-slate-900 dark:text-white mb-6">
                Notre Mission
              </h2>
              <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
                <p>
                  Chez WatchBiz, nous croyons que chaque montre raconte une histoire.
                  Notre mission est de rendre accessible l'excellence horlogère à tous les passionnés,
                  en proposant une sélection rigoureuse des plus belles créations des manufactures prestigieuses.
                </p>
                <p>
                  Nous nous engageons à offrir une expérience d'achat exceptionnelle,
                  où l'authenticité, la transparence et le conseil personnalisé sont au cœur de notre démarche.
                </p>
                <p>
                  Chaque pièce de notre catalogue est soigneusement sélectionnée pour sa qualité,
                  son histoire et son savoir-faire unique.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg text-center">
                <div className="text-4xl font-bold text-gold-champagne mb-2">500+</div>
                <div className="text-sm text-slate-600 dark:text-slate-300">Montres de luxe</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg text-center">
                <div className="text-4xl font-bold text-gold-champagne mb-2">50+</div>
                <div className="text-sm text-slate-600 dark:text-slate-300">Marques prestigieuses</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg text-center">
                <div className="text-4xl font-bold text-gold-champagne mb-2">10K+</div>
                <div className="text-sm text-slate-600 dark:text-slate-300">Clients satisfaits</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg text-center">
                <div className="text-4xl font-bold text-gold-champagne mb-2">99%</div>
                <div className="text-sm text-slate-600 dark:text-slate-300">Satisfaction client</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-slate-50 dark:bg-slate-800 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl text-slate-900 dark:text-white mb-4">
              Nos Valeurs
            </h2>
            <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Les principes qui guident chacune de nos actions et décisions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Authenticité */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-lg text-center hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gold-champagne/10 rounded-full mb-6">
                <Shield className="w-8 h-8 text-gold-champagne" />
              </div>
              <h3 className="font-heading text-xl text-slate-900 dark:text-white mb-3">
                Authenticité
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                Toutes nos montres sont 100% authentiques et accompagnées de leur certificat d'origine.
              </p>
            </div>

            {/* Excellence */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-lg text-center hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gold-champagne/10 rounded-full mb-6">
                <Award className="w-8 h-8 text-gold-champagne" />
              </div>
              <h3 className="font-heading text-xl text-slate-900 dark:text-white mb-3">
                Excellence
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                Nous sélectionnons uniquement les meilleures pièces horlogères pour notre collection.
              </p>
            </div>

            {/* Expertise */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-lg text-center hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gold-champagne/10 rounded-full mb-6">
                <Watch className="w-8 h-8 text-gold-champagne" />
              </div>
              <h3 className="font-heading text-xl text-slate-900 dark:text-white mb-3">
                Expertise
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                Notre équipe d'experts horlogers vous accompagne dans votre choix avec passion.
              </p>
            </div>

            {/* Innovation */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-lg text-center hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gold-champagne/10 rounded-full mb-6">
                <TrendingUp className="w-8 h-8 text-gold-champagne" />
              </div>
              <h3 className="font-heading text-xl text-slate-900 dark:text-white mb-3">
                Innovation
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                Une expérience d'achat moderne et sécurisée, à la pointe de la technologie.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl text-slate-900 dark:text-white mb-4">
              Notre Engagement
            </h2>
            <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Un service client d'exception pour une expérience d'achat inoubliable
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mb-4">
                <div className="text-5xl mb-2">🚚</div>
              </div>
              <h3 className="font-heading text-xl text-slate-900 dark:text-white mb-2">
                Livraison Sécurisée
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Livraison assurée et suivie dans le monde entier avec emballage premium
              </p>
            </div>

            <div className="text-center">
              <div className="mb-4">
                <div className="text-5xl mb-2">🛡️</div>
              </div>
              <h3 className="font-heading text-xl text-slate-900 dark:text-white mb-2">
                Garantie Officielle
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Toutes nos montres bénéficient de la garantie internationale du fabricant
              </p>
            </div>

            <div className="text-center">
              <div className="mb-4">
                <div className="text-5xl mb-2">💬</div>
              </div>
              <h3 className="font-heading text-xl text-slate-900 dark:text-white mb-2">
                Support Expert
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Notre équipe d'horlogers vous conseille et vous accompagne 7j/7
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-luxury-black to-onyx text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl md:text-4xl mb-6">
            Prêt à découvrir votre prochaine montre ?
          </h2>
          <p className="text-slate-300 mb-8 text-lg">
            Explorez notre collection exclusive de montres de luxe
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="/products"
              className="bg-gold-champagne text-luxury-black px-8 py-3 rounded-md font-medium hover:bg-gold-light transition"
            >
              Voir la collection
            </a>
            <a
              href="/contact"
              className="bg-white/10 backdrop-blur text-white border border-white/20 px-8 py-3 rounded-md font-medium hover:bg-white/20 transition"
            >
              Nous contacter
            </a>
          </div>
        </div>
      </section>
      </div>
    </PageTransition>
  );
}
