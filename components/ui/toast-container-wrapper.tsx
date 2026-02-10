'use client'

import { useToast } from '@/lib/hooks/use-toast'
import { ToastContainer } from './toast-container'

/**
 * 🍞 Toast Container Wrapper
 *
 * Client Component wrapper pour utiliser useToast dans le layout
 */

export function ToastContainerWrapper() {
  const { toasts, removeToast } = useToast()

  return <ToastContainer toasts={toasts} removeToast={removeToast} />
}
