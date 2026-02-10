import Link from 'next/link';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';
import { NewsletterForm } from '@/components/newsletter/newsletter-form';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-luxury-black to-onyx text-white">
      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-gold-champagne/10 to-gold-dark/10 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="max-w-2xl mx-auto text-center">
            {/* Header */}
            <div className="mb-8">
              <h3 className="font-heading text-3xl md:text-4xl font-bold mb-3 text-gold-champagne">
                Restez Informé
              </h3>
              <p className="text-slate-300 text-base md:text-lg leading-relaxed">
                Recevez en exclusivité nos dernières nouveautés, offres spéciales et conseils d'experts
                directement dans votre boîte mail.
              </p>
            </div>

            {/* Newsletter Form */}
            <NewsletterForm variant="default" />
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Brand Column */}
          <div>
            <h3 className="font-heading text-2xl font-bold mb-4 text-gold-champagne">
              WatchBiz
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              Votre destination de confiance pour les montres de luxe.
              Excellence, authenticité et service client irréprochable.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-gold-champagne/20 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-gold-champagne/20 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-gold-champagne/20 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-gold-champagne/20 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Shop Column */}
          <div>
            <h4 className="font-heading text-lg font-semibold mb-4 text-gold-champagne">
              Boutique
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/products"
                  className="text-slate-300 hover:text-gold-champagne transition-colors text-sm"
                >
                  Toutes les montres
                </Link>
              </li>
              <li>
                <Link
                  href="/brands"
                  className="text-slate-300 hover:text-gold-champagne transition-colors text-sm"
                >
                  Nos marques
                </Link>
              </li>
              <li>
                <Link
                  href="/products?featured=true"
                  className="text-slate-300 hover:text-gold-champagne transition-colors text-sm"
                >
                  Nouveautés
                </Link>
              </li>
              <li>
                <Link
                  href="/products?sort=price-asc"
                  className="text-slate-300 hover:text-gold-champagne transition-colors text-sm"
                >
                  Meilleures offres
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="font-heading text-lg font-semibold mb-4 text-gold-champagne">
              Entreprise
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-slate-300 hover:text-gold-champagne transition-colors text-sm"
                >
                  À propos
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-slate-300 hover:text-gold-champagne transition-colors text-sm"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/account/orders"
                  className="text-slate-300 hover:text-gold-champagne transition-colors text-sm"
                >
                  Suivre ma commande
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-slate-300 hover:text-gold-champagne transition-colors text-sm"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="font-heading text-lg font-semibold mb-4 text-gold-champagne">
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm">
                <Mail className="w-5 h-5 text-gold-champagne flex-shrink-0 mt-0.5" />
                <a
                  href="mailto:contact@watchbiz.com"
                  className="text-slate-300 hover:text-gold-champagne transition-colors"
                >
                  contact@watchbiz.com
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Phone className="w-5 h-5 text-gold-champagne flex-shrink-0 mt-0.5" />
                <a
                  href="tel:+33123456789"
                  className="text-slate-300 hover:text-gold-champagne transition-colors"
                >
                  +33 1 23 45 67 89
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <MapPin className="w-5 h-5 text-gold-champagne flex-shrink-0 mt-0.5" />
                <span className="text-slate-300">
                  123 Avenue des Champs-Élysées<br />
                  75008 Paris, France
                </span>
              </li>
            </ul>
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-xs text-slate-400">
                Lun-Dim: 9h - 20h
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <p className="text-sm text-slate-400 text-center md:text-left">
              © {currentYear} WatchBiz. Tous droits réservés.
            </p>

            {/* Legal Links */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm">
              <Link
                href="/legal/terms"
                className="text-slate-400 hover:text-gold-champagne transition-colors"
              >
                CGV
              </Link>
              <Link
                href="/legal/privacy"
                className="text-slate-400 hover:text-gold-champagne transition-colors"
              >
                Confidentialité
              </Link>
              <Link
                href="/legal/mentions"
                className="text-slate-400 hover:text-gold-champagne transition-colors"
              >
                Mentions légales
              </Link>
              <Link
                href="/legal/cookies"
                className="text-slate-400 hover:text-gold-champagne transition-colors"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
