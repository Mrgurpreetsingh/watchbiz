import { Address, Order, OrderItem, Product } from '@prisma/client'

/**
 * 🚚 Méthodes de livraison disponibles
 */
export enum ShippingMethod {
  STANDARD = 'STANDARD',
  EXPRESS = 'EXPRESS',
  PREMIUM = 'PREMIUM'
}

/**
 * 📦 Options de livraison avec prix et délai
 */
export interface ShippingOption {
  method: ShippingMethod
  label: string
  price: number
  estimatedDays: string
  description: string
}

/**
 * 🏠 Données formulaire adresse (validation Zod)
 */
export interface AddressFormData {
  fullName: string
  phone: string
  street: string
  city: string
  state: string
  postalCode: string
  country: string
  isDefault?: boolean
}

/**
 * 🛒 Item panier (Zustand CartStore)
 */
export interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  image: string
  slug: string
}

/**
 * 📝 Données formulaire checkout complet
 */
export interface CheckoutFormData {
  addressId: string
  shippingMethod: ShippingMethod
  items: CartItem[]
}

/**
 * 📋 Order avec ses items et adresse inclus (type étendu Prisma)
 */
export type OrderWithItems = Order & {
  items: (OrderItem & {
    product: Product
  })[]
  shippingAddress: Address | null
}

/**
 * 🏠 Adresse avec user inclus (type étendu Prisma)
 */
export type AddressWithUser = Address & {
  user: {
    id: string
    name: string | null
    email: string
  }
}

/**
 * 💳 Session Stripe Checkout Metadata
 */
export interface StripeCheckoutMetadata {
  userId: string
  addressId: string
  shippingMethod: ShippingMethod
  items: string // JSON stringified CartItem[]
}

/**
 * ✅ Résultat création session Stripe
 */
export interface CreateCheckoutSessionResult {
  url: string
  sessionId: string
}

/**
 * 📊 Configuration des options de livraison
 */
export const SHIPPING_OPTIONS: ShippingOption[] = [
  {
    method: ShippingMethod.STANDARD,
    label: 'Livraison Standard',
    price: 5,
    estimatedDays: '5-7 jours',
    description: 'Livraison par Colissimo'
  },
  {
    method: ShippingMethod.EXPRESS,
    label: 'Livraison Express',
    price: 10,
    estimatedDays: '2-3 jours',
    description: 'Livraison prioritaire Chronopost'
  },
  {
    method: ShippingMethod.PREMIUM,
    label: 'Livraison Premium',
    price: 15,
    estimatedDays: '24-48h',
    description: 'Livraison express avec signature'
  }
]

/**
 * 💰 Seuil livraison gratuite (en euros)
 */
export const FREE_SHIPPING_THRESHOLD = 200

/**
 * 💵 Taux TVA France
 */
export const TAX_RATE = 0.20
