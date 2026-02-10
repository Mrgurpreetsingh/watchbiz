import { Metadata } from 'next';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { ContactForm } from '@/components/contact/contact-form';
import { PageTransition } from '@/components/animations/page-transition';

export const metadata: Metadata = {
  title: 'Contact - WatchBiz',
  description: 'Contactez-nous pour toute question sur nos montres de luxe. Notre équipe d\'experts est à votre disposition 7j/7.',
};

export default function ContactPage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-white dark:bg-slate-900">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-luxury-black to-onyx text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-6">
                Contactez-nous
              </h1>
              <p className="text-lg md:text-xl text-slate-300 leading-relaxed">
                Notre équipe d'experts est à votre disposition pour répondre à toutes vos questions
              </p>
            </div>
          </div>
        </section>

        {/* Contact Info + Form */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-5 gap-12">
              {/* Contact Information */}
              <div className="lg:col-span-2 space-y-8">
                <div>
                  <h2 className="font-heading text-3xl text-slate-900 dark:text-white mb-6">
                    Restons en contact
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
                    Que vous ayez une question sur nos produits, que vous souhaitiez un conseil personnalisé
                    ou que vous ayez besoin d'assistance, notre équipe est là pour vous aider.
                  </p>
                </div>

                {/* Contact Cards */}
                <div className="space-y-6">
                  {/* Email */}
                  <div className="flex items-start gap-4 p-6 bg-slate-50 dark:bg-slate-800 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gold-champagne/10 rounded-full flex items-center justify-center">
                        <Mail className="w-6 h-6 text-gold-champagne" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white mb-1">Email</h3>
                      <a
                        href="mailto:contact@watchbiz.com"
                        className="text-slate-600 dark:text-slate-300 hover:text-gold-champagne transition"
                      >
                        contact@watchbiz.com
                      </a>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Réponse sous 24h
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-4 p-6 bg-slate-50 dark:bg-slate-800 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gold-champagne/10 rounded-full flex items-center justify-center">
                        <Phone className="w-6 h-6 text-gold-champagne" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white mb-1">Téléphone</h3>
                      <a
                        href="tel:+33123456789"
                        className="text-slate-600 dark:text-slate-300 hover:text-gold-champagne transition"
                      >
                        +33 1 23 45 67 89
                      </a>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Lun-Dim 9h-20h
                      </p>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-4 p-6 bg-slate-50 dark:bg-slate-800 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gold-champagne/10 rounded-full flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-gold-champagne" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white mb-1">Adresse</h3>
                      <p className="text-slate-600 dark:text-slate-300">
                        123 Avenue des Champs-Élysées<br />
                        75008 Paris, France
                      </p>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="flex items-start gap-4 p-6 bg-slate-50 dark:bg-slate-800 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gold-champagne/10 rounded-full flex items-center justify-center">
                        <Clock className="w-6 h-6 text-gold-champagne" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white mb-1">Horaires</h3>
                      <div className="text-slate-600 dark:text-slate-300 text-sm space-y-1">
                        <p>Lundi - Vendredi: 9h - 20h</p>
                        <p>Samedi - Dimanche: 10h - 19h</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-3">
                <div className="bg-slate-50 dark:bg-slate-800 p-8 md:p-10 rounded-lg">
                  <h2 className="font-heading text-2xl text-slate-900 dark:text-white mb-6">
                    Envoyez-nous un message
                  </h2>
                  <ContactForm />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-slate-50 dark:bg-slate-800 py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl md:text-4xl text-slate-900 dark:text-white mb-4">
                Questions Fréquentes
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                Trouvez rapidement des réponses à vos questions
              </p>
            </div>

            <div className="space-y-6">
              <details className="bg-white dark:bg-slate-800 p-6 rounded-lg hover:shadow-md transition-shadow group">
                <summary className="font-medium text-slate-900 dark:text-white cursor-pointer list-none flex justify-between items-center">
                  <span>Comment puis-je être sûr de l'authenticité des montres ?</span>
                  <span className="text-gold-champagne group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-4 text-slate-600 dark:text-slate-300 leading-relaxed">
                  Toutes nos montres sont 100% authentiques et proviennent directement des manufactures officielles
                  ou de revendeurs agréés. Chaque montre est accompagnée de son certificat d'authenticité,
                  de sa garantie internationale et de tous ses documents d'origine.
                </p>
              </details>

              <details className="bg-white dark:bg-slate-800 p-6 rounded-lg hover:shadow-md transition-shadow group">
                <summary className="font-medium text-slate-900 dark:text-white cursor-pointer list-none flex justify-between items-center">
                  <span>Quels sont les délais de livraison ?</span>
                  <span className="text-gold-champagne group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-4 text-slate-600 dark:text-slate-300 leading-relaxed">
                  Nous expédions sous 24-48h ouvrées. La livraison en France métropolitaine prend généralement 2-3 jours ouvrés.
                  Pour l'international, comptez 5-7 jours ouvrés. Toutes nos livraisons sont assurées et suivies.
                </p>
              </details>

              <details className="bg-white dark:bg-slate-800 p-6 rounded-lg hover:shadow-md transition-shadow group">
                <summary className="font-medium text-slate-900 dark:text-white cursor-pointer list-none flex justify-between items-center">
                  <span>Puis-je retourner ma montre si elle ne me convient pas ?</span>
                  <span className="text-gold-champagne group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-4 text-slate-600 dark:text-slate-300 leading-relaxed">
                  Oui, vous disposez d'un délai de 14 jours pour retourner votre montre si elle ne vous convient pas,
                  conformément à la législation en vigueur. La montre doit être dans son état d'origine, non portée,
                  avec tous ses accessoires et documents.
                </p>
              </details>

              <details className="bg-white dark:bg-slate-800 p-6 rounded-lg hover:shadow-md transition-shadow group">
                <summary className="font-medium text-slate-900 dark:text-white cursor-pointer list-none flex justify-between items-center">
                  <span>Proposez-vous un service après-vente ?</span>
                  <span className="text-gold-champagne group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-4 text-slate-600 dark:text-slate-300 leading-relaxed">
                  Absolument. Nous travaillons en partenariat avec des horlogers certifiés pour assurer l'entretien
                  et la réparation de votre montre. Toutes nos montres bénéficient également de la garantie internationale
                  du fabricant (généralement 2 à 5 ans selon les marques).
                </p>
              </details>

              <details className="bg-white dark:bg-slate-800 p-6 rounded-lg hover:shadow-md transition-shadow group">
                <summary className="font-medium text-slate-900 dark:text-white cursor-pointer list-none flex justify-between items-center">
                  <span>Acceptez-vous les paiements en plusieurs fois ?</span>
                  <span className="text-gold-champagne group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-4 text-slate-600 dark:text-slate-300 leading-relaxed">
                  Oui, nous proposons des solutions de paiement en 3x ou 4x sans frais pour les commandes éligibles.
                  Cette option est disponible directement lors du processus de paiement via notre partenaire sécurisé.
                </p>
              </details>
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
