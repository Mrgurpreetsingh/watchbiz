import type { Metadata } from 'next'
import './globals.css'
import { inter, playfair, cormorant } from '@/lib/fonts'
import { SessionProvider } from '@/components/providers/session-provider'
import { ThemeProvider } from '@/providers/theme-provider'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ToastProvider } from '@/lib/hooks/use-toast'
import { ToastContainerWrapper } from '@/components/ui/toast-container-wrapper'
import { PWAInstallPrompt } from '@/components/pwa/install-prompt'
import { PageLoader } from '@/components/ui/page-loader'

export const metadata: Metadata = {
  title: 'WatchBiz - Montres de Luxe',
  description: 'E-commerce de montres haut de gamme',
  keywords: ['montres', 'horlogerie', 'luxe', 'e-commerce'],
  authors: [{ name: 'WatchBiz' }],
  manifest: '/manifest.json',
  themeColor: '#d4af37',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'WatchBiz',
  },
  openGraph: {
    title: 'WatchBiz - Montres de Luxe',
    description: 'E-commerce de montres haut de gamme',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} ${cormorant.variable} font-body antialiased`}>
        <PageLoader />
        <ThemeProvider defaultTheme="system">
          <SessionProvider>
            <ToastProvider>
              <Header />
              <main>{children}</main>
              <Footer />
              <ToastContainerWrapper />
              <PWAInstallPrompt />
            </ToastProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
