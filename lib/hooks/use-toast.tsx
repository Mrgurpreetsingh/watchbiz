'use client'

import * as React from 'react'
import type { ToastProps, ToastVariant } from '@/components/ui/toast'

/**
 * 🍞 useToast Hook
 *
 * Hook pour gérer les notifications toast depuis n'importe quel composant
 */

interface ToastContextType {
  toasts: ToastProps[]
  addToast: (toast: Omit<ToastProps, 'id' | 'onClose'>) => void
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const addToast = React.useCallback((toast: Omit<ToastProps, 'id' | 'onClose'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast: ToastProps = {
      ...toast,
      id,
      onClose: (id) => removeToast(id)
    }
    setToasts((prev) => [...prev, newToast])
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }

  // Helper methods
  const toast = React.useCallback(
    (props: Omit<ToastProps, 'id' | 'onClose'>) => {
      context.addToast(props)
    },
    [context]
  )

  const success = React.useCallback(
    (title: string, description?: string) => {
      context.addToast({ title, description, variant: 'success' })
    },
    [context]
  )

  const error = React.useCallback(
    (title: string, description?: string) => {
      context.addToast({ title, description, variant: 'error' })
    },
    [context]
  )

  const warning = React.useCallback(
    (title: string, description?: string) => {
      context.addToast({ title, description, variant: 'warning' })
    },
    [context]
  )

  const info = React.useCallback(
    (title: string, description?: string) => {
      context.addToast({ title, description, variant: 'info' })
    },
    [context]
  )

  return {
    toast,
    success,
    error,
    warning,
    info,
    toasts: context.toasts,
    removeToast: context.removeToast
  }
}
