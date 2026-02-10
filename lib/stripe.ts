/**
 * 💳 Stripe SDK Configuration
 *
 * Initialise le client Stripe côté serveur
 */

import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables')
}

/**
 * Client Stripe (singleton)
 *
 * Version API : 2024-12-18.acacia (dernière stable)
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true
})

/**
 * Webhook secret pour vérifier les signatures
 */
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || ''
