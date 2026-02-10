'use server'

/**
 * 📊 Server Actions pour Export CSV Admin
 *
 * Permet d'exporter les données en CSV pour reporting/comptabilité
 */

import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string }

/**
 * 📥 Export des commandes en CSV
 *
 * Génère un CSV avec toutes les commandes pour Excel/comptabilité
 */
export async function exportOrdersCSV(): Promise<ActionResult<{ csv: string }>> {
  try {
    // Vérifier que l'utilisateur est admin
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Non autorisé' }
    }

    // Récupérer toutes les commandes avec relations
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        shippingAddress: true,
        items: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Générer le CSV
    const headers = [
      'Numéro Commande',
      'Date',
      'Client',
      'Email',
      'Statut',
      'Statut Paiement',
      'Produits',
      'Quantité Totale',
      'Sous-total',
      'Livraison',
      'Taxes',
      'Total',
      'Adresse Livraison',
    ]

    const rows = orders.map((order) => {
      const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0)
      const products = order.items
        .map((item) => `${item.product.name} (x${item.quantity})`)
        .join('; ')

      const address = order.shippingAddress
        ? `${order.shippingAddress.street}, ${order.shippingAddress.postalCode} ${order.shippingAddress.city}, ${order.shippingAddress.country}`
        : 'N/A'

      return [
        order.orderNumber,
        new Date(order.createdAt).toLocaleDateString('fr-FR'),
        order.user.name || 'N/A',
        order.user.email,
        order.status,
        order.paymentStatus,
        products,
        totalQuantity.toString(),
        order.subtotal.toFixed(2),
        order.shipping.toFixed(2),
        order.tax.toFixed(2),
        order.total.toFixed(2),
        address,
      ]
    })

    // Construire le CSV
    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n')

    // Ajouter BOM UTF-8 pour Excel
    const csv = '\uFEFF' + csvContent

    return { success: true, data: { csv } }
  } catch (error) {
    console.error('exportOrdersCSV error:', error)
    return { success: false, error: 'Erreur lors de l\'export' }
  }
}
