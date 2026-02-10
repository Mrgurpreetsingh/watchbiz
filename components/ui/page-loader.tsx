'use client';

import { useEffect, useState } from 'react';
import { gsap } from '@/lib/gsap';

export function PageLoader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let tl: gsap.core.Timeline;

    // Attendre que le DOM soit complètement monté
    const rafId = requestAnimationFrame(() => {
      // Vérifier que les éléments existent avant d'animer
      const logoEl = document.querySelector('.loader-logo');
      const textEl = document.querySelector('.loader-text');
      const barEl = document.querySelector('.loader-bar');
      const loaderEl = document.querySelector('.page-loader');

      if (!logoEl || !textEl || !barEl || !loaderEl) return;

      // Animation d'entrée du loader
      tl = gsap.timeline();

      tl.from(logoEl, {
        scale: 0.5,
        opacity: 0,
        duration: 0.8,
        ease: 'back.out(1.7)',
      })
        .from(textEl, {
          y: 20,
          opacity: 0,
          duration: 0.6,
          ease: 'power2.out',
        }, '-=0.4')
        .to(barEl, {
          scaleX: 1,
          duration: 1.5,
          ease: 'power2.inOut',
        }, '-=0.3');

      // Après 2.5s, masquer le loader
      timer = setTimeout(() => {
        // Animation de sortie
        gsap.to(loaderEl, {
          opacity: 0,
          duration: 0.5,
          ease: 'power2.inOut',
          onComplete: () => {
            setIsLoading(false);
          },
        });
      }, 2500);
    });

    return () => {
      cancelAnimationFrame(rafId);
      if (timer) clearTimeout(timer);
      if (tl) tl.kill();
    };
  }, []);

  if (!isLoading) return null;

  return (
    <div className="page-loader fixed inset-0 z-[9999] bg-gradient-to-br from-luxury-black via-onyx to-luxury-black flex flex-col items-center justify-center">
      {/* Logo animé */}
      <div className="loader-logo mb-8">
        <div className="relative">
          {/* Cercle extérieur tournant */}
          <div className="absolute inset-0 w-24 h-24 border-4 border-gold-champagne/20 rounded-full animate-spin" style={{ animationDuration: '3s' }} />

          {/* Cercle intérieur */}
          <div className="relative w-24 h-24 bg-gradient-to-br from-gold-champagne to-gold-dark rounded-full flex items-center justify-center shadow-2xl shadow-gold-champagne/50">
            <svg
              className="w-12 h-12 text-luxury-black"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="5" r="1" />
              <circle cx="12" cy="19" r="1" />
              <circle cx="5" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <line x1="12" y1="7" x2="12" y2="10" stroke="currentColor" strokeWidth="2" />
              <line x1="12" y1="14" x2="12" y2="17" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>

      {/* Texte */}
      <div className="loader-text text-center mb-8">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-2">
          WatchBiz
        </h2>
        <p className="text-gold-champagne text-sm md:text-base tracking-[0.3em] uppercase">
          L'Excellence Horlogère
        </p>
      </div>

      {/* Barre de progression */}
      <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
        <div
          className="loader-bar h-full bg-gradient-to-r from-gold-champagne to-gold-dark origin-left"
          style={{ transform: 'scaleX(0)' }}
        />
      </div>

      {/* Particles d'ambiance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-gold-champagne/30 rounded-full animate-pulse" style={{ animationDelay: '0s', animationDuration: '2s' }} />
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-gold-champagne/20 rounded-full animate-pulse" style={{ animationDelay: '0.5s', animationDuration: '2.5s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-gold-champagne/25 rounded-full animate-pulse" style={{ animationDelay: '1s', animationDuration: '3s' }} />
        <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-gold-champagne/20 rounded-full animate-pulse" style={{ animationDelay: '1.5s', animationDuration: '2s' }} />
      </div>
    </div>
  );
}
