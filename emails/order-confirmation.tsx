import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Hr
} from '@react-email/components'

/**
 * 📧 Order Confirmation Email Template
 *
 * Email envoyé après paiement réussi d'une commande
 */

interface OrderConfirmationEmailProps {
  orderNumber: string
  customerName: string
  orderDate: string
  items: Array<{
    name: string
    quantity: number
    price: number
    image: string
  }>
  subtotal: number
  shipping: number
  tax: number
  total: number
  shippingAddress: {
    fullName: string
    street: string
    city: string
    postalCode: string
    country: string
  }
  orderDetailsUrl: string
}

export default function OrderConfirmationEmail({
  orderNumber = 'WB-001',
  customerName = 'Client',
  orderDate = new Date().toLocaleDateString('fr-FR'),
  items = [],
  subtotal = 0,
  shipping = 0,
  tax = 0,
  total = 0,
  shippingAddress = {
    fullName: 'Client',
    street: '123 Rue Example',
    city: 'Paris',
    postalCode: '75001',
    country: 'France'
  },
  orderDetailsUrl = 'https://watchbiz.com/account/orders/123'
}: OrderConfirmationEmailProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  return (
    <Html>
      <Head />
      <Preview>Votre commande {orderNumber} a été confirmée</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logo}>WatchBiz</Text>
            <Text style={tagline}>Montres de Luxe</Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Heading style={h1}>Merci pour votre commande !</Heading>
            <Text style={paragraph}>
              Bonjour {customerName},
            </Text>
            <Text style={paragraph}>
              Nous avons bien reçu votre commande <strong>{orderNumber}</strong> du{' '}
              {orderDate}. Votre paiement a été confirmé et votre commande est en cours de
              traitement.
            </Text>

            {/* Order Summary */}
            <Section style={box}>
              <Heading as="h2" style={h2}>
                Résumé de la commande
              </Heading>

              {/* Items */}
              {items.map((item, index) => (
                <Section key={index} style={itemRow}>
                  <table style={itemTable}>
                    <tr>
                      <td style={itemImageCell}>
                        <Img
                          src={item.image}
                          width="80"
                          height="80"
                          alt={item.name}
                          style={itemImage}
                        />
                      </td>
                      <td style={itemInfoCell}>
                        <Text style={itemName}>{item.name}</Text>
                        <Text style={itemQty}>Quantité : {item.quantity}</Text>
                      </td>
                      <td style={itemPriceCell}>
                        <Text style={itemPrice}>{formatPrice(item.price * item.quantity)}</Text>
                      </td>
                    </tr>
                  </table>
                  {index < items.length - 1 && <Hr style={itemDivider} />}
                </Section>
              ))}

              {/* Totals */}
              <Hr style={totalDivider} />
              <table style={totalTable}>
                <tr>
                  <td style={totalLabel}>Sous-total</td>
                  <td style={totalValue}>{formatPrice(subtotal)}</td>
                </tr>
                <tr>
                  <td style={totalLabel}>Livraison</td>
                  <td style={totalValue}>{formatPrice(shipping)}</td>
                </tr>
                <tr>
                  <td style={totalLabel}>TVA (20%)</td>
                  <td style={totalValue}>{formatPrice(tax)}</td>
                </tr>
                <tr>
                  <td style={totalLabelFinal}>Total</td>
                  <td style={totalValueFinal}>{formatPrice(total)}</td>
                </tr>
              </table>
            </Section>

            {/* Shipping Address */}
            <Section style={box}>
              <Heading as="h2" style={h2}>
                Adresse de livraison
              </Heading>
              <Text style={address}>
                {shippingAddress.fullName}
                <br />
                {shippingAddress.street}
                <br />
                {shippingAddress.postalCode} {shippingAddress.city}
                <br />
                {shippingAddress.country}
              </Text>
            </Section>

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Link href={orderDetailsUrl} style={button}>
                Voir les détails de ma commande
              </Link>
            </Section>

            <Text style={paragraph}>
              Vous recevrez un email de confirmation d'expédition avec un numéro de suivi dès
              que votre commande sera envoyée.
            </Text>

            <Text style={paragraph}>
              Si vous avez des questions, n'hésitez pas à nous contacter à{' '}
              <Link href="mailto:support@watchbiz.com" style={link}>
                support@watchbiz.com
              </Link>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} WatchBiz. Tous droits réservés.
            </Text>
            <Text style={footerText}>
              <Link href="https://watchbiz.com" style={footerLink}>
                Site web
              </Link>
              {' • '}
              <Link href="https://watchbiz.com/contact" style={footerLink}>
                Contact
              </Link>
              {' • '}
              <Link href="https://watchbiz.com/legal" style={footerLink}>
                Mentions légales
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: '#f6f6f6',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
}

const container = {
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '600px'
}

const header = {
  textAlign: 'center' as const,
  marginBottom: '40px'
}

const logo = {
  fontSize: '32px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: '0',
  fontFamily: 'Georgia, "Times New Roman", serif'
}

const tagline = {
  fontSize: '14px',
  color: '#666',
  margin: '4px 0 0',
  letterSpacing: '2px',
  textTransform: 'uppercase' as const
}

const content = {
  backgroundColor: '#ffffff',
  padding: '40px',
  borderRadius: '8px'
}

const h1 = {
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: '0 0 24px',
  textAlign: 'center' as const
}

const h2 = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: '0 0 16px'
}

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#333',
  margin: '0 0 16px'
}

const box = {
  backgroundColor: '#f9f9f9',
  padding: '24px',
  borderRadius: '8px',
  marginBottom: '24px'
}

const itemRow = {
  marginBottom: '0'
}

const itemTable = {
  width: '100%',
  borderCollapse: 'collapse' as const
}

const itemImageCell = {
  width: '80px',
  paddingRight: '16px',
  verticalAlign: 'top' as const
}

const itemImage = {
  borderRadius: '4px',
  objectFit: 'cover' as const
}

const itemInfoCell = {
  verticalAlign: 'top' as const
}

const itemName = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: '0 0 4px'
}

const itemQty = {
  fontSize: '14px',
  color: '#666',
  margin: '0'
}

const itemPriceCell = {
  textAlign: 'right' as const,
  verticalAlign: 'top' as const,
  whiteSpace: 'nowrap' as const
}

const itemPrice = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: '0'
}

const itemDivider = {
  borderColor: '#e0e0e0',
  margin: '16px 0'
}

const totalDivider = {
  borderColor: '#ccc',
  margin: '20px 0'
}

const totalTable = {
  width: '100%',
  fontSize: '16px'
}

const totalLabel = {
  color: '#666',
  padding: '8px 0',
  textAlign: 'left' as const
}

const totalValue = {
  color: '#1a1a1a',
  padding: '8px 0',
  textAlign: 'right' as const
}

const totalLabelFinal = {
  color: '#1a1a1a',
  fontWeight: 'bold',
  fontSize: '18px',
  padding: '12px 0 0',
  textAlign: 'left' as const
}

const totalValueFinal = {
  color: '#d4af37',
  fontWeight: 'bold',
  fontSize: '20px',
  padding: '12px 0 0',
  textAlign: 'right' as const
}

const address = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#333',
  margin: '0'
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0'
}

const button = {
  backgroundColor: '#d4af37',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
  borderRadius: '8px'
}

const link = {
  color: '#d4af37',
  textDecoration: 'underline'
}

const footer = {
  textAlign: 'center' as const,
  marginTop: '40px'
}

const footerText = {
  fontSize: '14px',
  color: '#999',
  margin: '8px 0'
}

const footerLink = {
  color: '#999',
  textDecoration: 'underline'
}
