/**
 * 🔧 Extension des types NextAuth
 *
 * NextAuth ne connaît pas notre champ 'role' par défaut
 * On étend les types pour ajouter role à User, Session, et JWT
 */

import { UserRole } from '@prisma/client'
import { DefaultSession } from 'next-auth'

/**
 * Module augmentation pour 'next-auth'
 *
 * Permet d'ajouter des champs custom aux types NextAuth
 */
declare module 'next-auth' {
  /**
   * Extension de l'interface User
   *
   * Ajoute le role à l'objet user retourné par authorize()
   */
  interface User {
    id: string
    role: UserRole
  }

  /**
   * Extension de l'interface Session
   *
   * Ajoute id et role à la session accessible côté client
   * session.user.id et session.user.role sont maintenant disponibles
   */
  interface Session {
    user: {
      id: string
      role: UserRole
    } & DefaultSession['user']
  }
}

/**
 * Module augmentation pour 'next-auth/jwt'
 *
 * Ajoute id et role au JWT token
 */
declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: UserRole
  }
}
