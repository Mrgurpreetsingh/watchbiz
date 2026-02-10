/**
 * Server Action Test Helpers
 *
 * Utilities for testing Next.js Server Actions with mocked authentication.
 */

import { mockAuth } from '../mocks/auth'
import type { Session } from 'next-auth'

/**
 * Execute a Server Action with a mocked authentication context
 *
 * @param action - The Server Action function to execute
 * @param args - Arguments to pass to the action
 * @param session - Optional session to mock (undefined = don't mock, null = unauthenticated)
 * @returns The result from the Server Action
 *
 * @example
 * ```typescript
 * // Execute action as authenticated user
 * const result = await executeServerAction(
 *   createProduct,
 *   [formData],
 *   { user: { id: 'admin_123', role: 'ADMIN' } }
 * )
 *
 * // Execute action as unauthenticated user
 * const result = await executeServerAction(
 *   getOrders,
 *   [],
 *   null
 * )
 * ```
 */
export async function executeServerAction<T>(
  action: (...args: any[]) => Promise<T>,
  args: any[],
  session?: Session | null
): Promise<T> {
  if (session !== undefined) {
    mockAuth.mockResolvedValue(session)
  }

  return await action(...args)
}

/**
 * Create FormData for Server Actions that expect form submissions
 *
 * @param data - Object with key-value pairs to convert to FormData
 * @returns FormData object ready for Server Action
 *
 * @example
 * ```typescript
 * const formData = createFormData({
 *   email: 'test@example.com',
 *   password: 'SecurePass123!',
 *   name: 'Test User'
 * })
 *
 * const result = await registerUser(formData)
 * ```
 */
export function createFormData(data: Record<string, any>): FormData {
  const formData = new FormData()

  Object.entries(data).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      // Skip null/undefined values
      return
    }

    if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof File)) {
      // Stringify objects (except Files and Arrays)
      formData.append(key, JSON.stringify(value))
    } else if (Array.isArray(value)) {
      // Stringify arrays
      formData.append(key, JSON.stringify(value))
    } else {
      // Append primitive values and Files as-is
      formData.append(key, String(value))
    }
  })

  return formData
}

/**
 * Extract form data back to an object (useful for debugging tests)
 *
 * @param formData - FormData to convert
 * @returns Object with key-value pairs
 *
 * @example
 * ```typescript
 * const formData = createFormData({ email: 'test@example.com' })
 * const obj = formDataToObject(formData)
 * // obj = { email: 'test@example.com' }
 * ```
 */
export function formDataToObject(formData: FormData): Record<string, any> {
  const obj: Record<string, any> = {}

  formData.forEach((value, key) => {
    // Try to parse JSON strings back to objects
    if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
      try {
        obj[key] = JSON.parse(value)
      } catch {
        obj[key] = value
      }
    } else {
      obj[key] = value
    }
  })

  return obj
}
