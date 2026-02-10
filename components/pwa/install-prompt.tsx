'use client'

/**
 * 📱 PWA Install Prompt
 *
 * Affiche un banner pour inviter l'utilisateur à installer l'application PWA
 * Gère l'événement beforeinstallprompt et le localStorage pour ne pas afficher trop souvent
 */

import { useState, useEffect } from 'react'
import { X, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà fermé le prompt
    const promptDismissed = localStorage.getItem('pwa-install-dismissed')
    const dismissedAt = promptDismissed ? parseInt(promptDismissed) : 0
    const daysSinceDismiss = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24)

    // Ne pas afficher si déjà installé ou fermé il y a moins de 7 jours
    if (window.matchMedia('(display-mode: standalone)').matches || daysSinceDismiss < 7) {
      return
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      const promptEvent = e as BeforeInstallPromptEvent
      setDeferredPrompt(promptEvent)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // Afficher le prompt d'installation
    await deferredPrompt.prompt()

    // Attendre la réponse de l'utilisateur
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
    }

    // Réinitialiser
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-md z-50 animate-slide-up">
      <div className="bg-white rounded-lg shadow-2xl border border-gold-champagne/20 p-5 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gold-champagne/10 to-transparent rounded-bl-full" />

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Fermer"
        >
          <X className="w-4 h-4 text-slate-400" />
        </button>

        {/* Content */}
        <div className="relative pr-6">
          <div className="flex items-start gap-4 mb-3">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-gold-champagne to-gold-champagne/70 rounded-xl flex items-center justify-center">
              <Download className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-semibold text-luxury-black mb-1">
                Installer WatchBiz
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Accédez rapidement à notre collection de montres de luxe depuis votre écran d'accueil.
              </p>
            </div>
          </div>

          {/* Features */}
          <ul className="text-xs text-slate-500 space-y-1 mb-4 ml-16">
            <li>⚡ Accès rapide</li>
            <li>📱 Fonctionne hors ligne</li>
            <li>🔔 Notifications des nouvelles collections</li>
          </ul>

          {/* Actions */}
          <div className="flex gap-3 ml-16">
            <Button
              onClick={handleInstallClick}
              className="flex-1 bg-gradient-to-r from-gold-champagne to-gold-champagne/80 hover:from-gold-champagne/90 hover:to-gold-champagne/70 text-white border-none"
            >
              Installer
            </Button>
            <Button
              onClick={handleDismiss}
              variant="outline"
              className="px-4"
            >
              Plus tard
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
