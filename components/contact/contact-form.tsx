'use client';

import { useState } from 'react';
import { sendContactMessage } from '@/actions/contact';

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await sendContactMessage(formData);

      if (result.success) {
        setMessage({ type: 'success', text: 'Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.' });
        (e.target as HTMLFormElement).reset();
      } else {
        setMessage({ type: 'error', text: result.error || 'Une erreur est survenue. Veuillez réessayer.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Une erreur est survenue. Veuillez réessayer.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Message de feedback */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-emerald-green/10 text-emerald-green border border-emerald-green/20'
              : 'bg-ruby-red/10 text-ruby-red border border-ruby-red/20'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Nom */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-900 mb-2">
          Nom complet <span className="text-ruby-red">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          className="w-full px-4 py-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-gold-champagne focus:border-transparent transition"
          placeholder="Jean Dupont"
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-900 mb-2">
          Email <span className="text-ruby-red">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className="w-full px-4 py-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-gold-champagne focus:border-transparent transition"
          placeholder="jean.dupont@example.com"
        />
      </div>

      {/* Téléphone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-slate-900 mb-2">
          Téléphone
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          className="w-full px-4 py-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-gold-champagne focus:border-transparent transition"
          placeholder="+33 6 12 34 56 78"
        />
      </div>

      {/* Sujet */}
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-slate-900 mb-2">
          Sujet <span className="text-ruby-red">*</span>
        </label>
        <select
          id="subject"
          name="subject"
          required
          className="w-full px-4 py-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-gold-champagne focus:border-transparent transition"
        >
          <option value="">Sélectionnez un sujet</option>
          <option value="information">Demande d'information</option>
          <option value="conseil">Conseil personnalisé</option>
          <option value="commande">Question sur une commande</option>
          <option value="sav">Service après-vente</option>
          <option value="autre">Autre</option>
        </select>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-slate-900 mb-2">
          Message <span className="text-ruby-red">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          className="w-full px-4 py-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-gold-champagne focus:border-transparent transition resize-none"
          placeholder="Décrivez votre demande en détail..."
        />
      </div>

      {/* Consentement RGPD */}
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="consent"
          name="consent"
          required
          className="mt-1 w-4 h-4 text-gold-champagne border-slate-300 rounded focus:ring-gold-champagne"
        />
        <label htmlFor="consent" className="text-sm text-slate-600">
          J'accepte que mes données personnelles soient utilisées pour traiter ma demande.
          Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression
          de vos données. <span className="text-ruby-red">*</span>
        </label>
      </div>

      {/* Bouton Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-gold-champagne to-gold-dark text-luxury-black font-medium py-3 px-6 rounded-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
      </button>

      <p className="text-xs text-slate-500 text-center">
        <span className="text-ruby-red">*</span> Champs obligatoires
      </p>
    </form>
  );
}
