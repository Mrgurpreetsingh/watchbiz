/**
 * 🔐 Configuration NextAuth v5 (Auth.js)
 *
 * NextAuth v5 est la nouvelle version (beta) avec une architecture améliorée
 * Équivalent de server/config/passport.js dans Express
 */

import NextAuth, { NextAuthConfig } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { UserRole } from '@prisma/client'

/**
 * Configuration principale de NextAuth
 *
 * Providers : Comment les users se connectent
 * - Credentials : Email/Password classique
 * - OAuth : Google, GitHub (à ajouter plus tard)
 *
 * NOTE: On n'utilise PAS le Prisma Adapter car:
 * - On utilise JWT (pas de database sessions)
 * - Le middleware Edge Runtime ne supporte pas Prisma
 * - On utilise Prisma uniquement dans authorize() pour vérifier les credentials
 */
export const authConfig: NextAuthConfig = {
  // Pages personnalisées (au lieu des pages par défaut NextAuth)
  pages: {
    signIn: '/login',
    // signUp: '/register', // Pas supporté nativement, on fait une page custom
    error: '/login', // Redirect en cas d'erreur
  },

  // Session : JWT (JSON Web Token) - Compatible Edge Runtime
  session: {
    strategy: 'jwt', // Plus rapide et compatible Edge
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },

  // Providers : Méthodes de connexion
  providers: [
    /**
     * 🔐 Provider Credentials : Email/Password
     *
     * Équivalent de passport-local dans Express
     */
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },

      // Fonction d'authentification
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email et mot de passe requis')
        }

        // Import dynamique de Prisma et bcrypt pour éviter les problèmes Edge Runtime
        // Ces imports ne s'exécutent que lors de l'appel (Node Runtime), pas au chargement du module
        const { default: prisma } = await import('./prisma')
        const { compare } = await import('bcryptjs')

        // 1. Chercher l'utilisateur par email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.password) {
          throw new Error('Identifiants invalides')
        }

        // 2. Vérifier le mot de passe avec bcrypt
        const isPasswordValid = await compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error('Identifiants invalides')
        }

        // 3. Retourner l'utilisateur (sans le password)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        }
      },
    }),

    // TODO: Ajouter Google OAuth
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID!,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    // }),

    // TODO: Ajouter GitHub OAuth
    // GitHubProvider({
    //   clientId: process.env.GITHUB_CLIENT_ID!,
    //   clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    // }),
  ],

  /**
   * Callbacks : Modifier les données de session et JWT
   *
   * Équivalent de serializeUser/deserializeUser dans Passport.js
   */
  callbacks: {
    /**
     * JWT Callback : Modifier le token JWT
     *
     * Ce callback est appelé quand un JWT est créé ou mis à jour
     * On ajoute le role et l'id au token
     */
    async jwt({ token, user }) {
      if (user) {
        // Premier login : ajouter les infos user au token
        token.id = user.id
        token.role = user.role as UserRole
      }
      return token
    },

    /**
     * Session Callback : Modifier la session côté client
     *
     * Ce callback est appelé quand getServerSession() ou useSession() est appelé
     * On ajoute le role et l'id à la session
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
      }
      return session
    },
  },

  /**
   * Events : Logger les événements d'authentification
   *
   * Utile pour le debugging et la sécurité
   */
  events: {
    async signIn({ user }) {
      console.log(`✅ User signed in: ${user.email}`)
    },
    async signOut(message) {
      // Type guard to check if token exists in message
      if ('token' in message && message.token) {
        console.log(`👋 User signed out: ${message.token.email}`)
      }
    },
  },

  /**
   * Debug : Activer les logs en développement
   */
  debug: process.env.NODE_ENV === 'development',
}

/**
 * Exports pour utiliser NextAuth dans l'application
 *
 * - auth : Récupérer la session côté serveur (Server Components, API Routes)
 * - signIn : Se connecter côté serveur
 * - signOut : Se déconnecter côté serveur
 */
export const { auth, signIn, signOut } = NextAuth(authConfig)
