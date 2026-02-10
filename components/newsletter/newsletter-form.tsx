'use client'

/**
 * 📧 Newsletter Form - Formulaire d'inscription newsletter
 *
 * Features:
 * - Validation email en temps réel
 * - Animations GSAP (focus, success, error)
 * - États de chargement (useTransition)
 * - Messages de feedback animés
 * - Design luxe cohérent
 */

import { useState, useRef, useTransition } from 'react'
import { Mail, Send, Check, X } from 'lucide-react'
import { subscribeNewsletter } from '@/actions/newsletter'
import { Button } from '@/components/ui/button'
import gsap from 'gsap'

interface NewsletterFormProps {
  variant?: 'default' | 'compact'
  className?: string
}

export function NewsletterForm({ variant = 'default', className = '' }: NewsletterFormProps) {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)
  const [isPending, startTransition] = useTransition()

  const inputRef = useRef<HTMLInputElement>(null)
  const messageRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Animation au focus de l'input
  const handleFocus = () => {
    if (inputRef.current) {
      gsap.to(inputRef.current, {
        scale: 1.02,
        duration: 0.2,
        ease: 'power2.out',
      })
    }
  }

  const handleBlur = () => {
    if (inputRef.current) {
      gsap.to(inputRef.current, {
        scale: 1,
        duration: 0.2,
        ease: 'power2.out',
      })
    }
  }

  // Animation du message (fade in + slide up)
  const animateMessage = (type: 'success' | 'error') => {
    if (messageRef.current) {
      gsap.fromTo(
        messageRef.current,
        {
          opacity: 0,
          y: 10,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: 'power2.out',
        }
      )
    }

    // Animation du bouton
    if (buttonRef.current) {
      if (type === 'success') {
        gsap.to(buttonRef.current, {
          scale: 1.1,
          duration: 0.2,
          ease: 'back.out(2)',
          yoyo: true,
          repeat: 1,
        })
      } else {
        gsap.to(buttonRef.current, {
          x: -5,
          duration: 0.1,
          yoyo: true,
          repeat: 3,
          ease: 'power2.inOut',
        })
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (!email.trim()) {
      setMessage({
        type: 'error',
        text: 'Veuillez saisir votre adresse email.',
      })
      animateMessage('error')
      return
    }

    startTransition(async () => {
      const result = await subscribeNewsletter(email)

      if (result.success) {
        setMessage({
          type: 'success',
          text: result.message || 'Merci pour votre inscription !',
        })
        setEmail('') // Reset input
        animateMessage('success')
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'Une erreur est survenue.',
        })
        animateMessage('error')
      }
    })
  }

  const isCompact = variant === 'compact'

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Input + Button */}
        <div className={`flex ${isCompact ? 'gap-2' : 'gap-3'}`}>
          {/* Email Input */}
          <div className="relative flex-1">
            <Mail
              className={`absolute left-3 top-1/2 -translate-y-1/2 text-slate-mid ${
                isCompact ? 'h-4 w-4' : 'h-5 w-5'
              }`}
            />
            <input
              ref={inputRef}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder="Votre email"
              disabled={isPending}
              className={`w-full border border-slate-300 bg-white text-luxury-black placeholder:text-slate-mid
                focus:border-gold-champagne focus:outline-none focus:ring-2 focus:ring-gold-champagne/20
                disabled:cursor-not-allowed disabled:opacity-60 transition-all
                ${isCompact ? 'pl-9 pr-3 py-2 text-sm rounded-lg' : 'pl-11 pr-4 py-3 rounded-xl'}
              `}
            />
          </div>

          {/* Submit Button */}
          <Button
            ref={buttonRef}
            type="submit"
            disabled={isPending}
            className={`flex-shrink-0 bg-gold-champagne hover:bg-gold-dark text-luxury-black font-semibold
              transition-colors disabled:opacity-60 disabled:cursor-not-allowed
              ${isCompact ? 'px-4 py-2 text-sm rounded-lg' : 'px-6 py-3 rounded-xl'}
            `}
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-luxury-black border-t-transparent" />
                {!isCompact && 'Envoi...'}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Send className={isCompact ? 'h-4 w-4' : 'h-5 w-5'} />
                {!isCompact && "S'inscrire"}
              </span>
            )}
          </Button>
        </div>

        {/* Message (Success / Error) */}
        {message && (
          <div
            ref={messageRef}
            className={`flex items-start gap-2 p-3 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {message.type === 'success' ? (
              <Check className="h-5 w-5 flex-shrink-0 mt-0.5" />
            ) : (
              <X className="h-5 w-5 flex-shrink-0 mt-0.5" />
            )}
            <p className={`${isCompact ? 'text-xs' : 'text-sm'} leading-relaxed`}>
              {message.text}
            </p>
          </div>
        )}
      </form>

      {/* RGPD Notice */}
      {!isCompact && (
        <p className="mt-3 text-xs text-slate-mid leading-relaxed">
          En vous inscrivant, vous acceptez de recevoir nos newsletters. Vous pouvez vous désabonner à tout moment.
          Consultez notre{' '}
          <a href="/privacy" className="underline hover:text-gold-champagne transition-colors">
            politique de confidentialité
          </a>
          .
        </p>
      )}
    </div>
  )
}
