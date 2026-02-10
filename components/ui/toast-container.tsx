'use client'

import * as React from 'react'
import { Toast, ToastProps } from './toast'

/**
 * 🍞 Toast Container
 *
 * Container pour afficher les toasts en haut à droite de l'écran
 */

interface ToastContainerProps {
  toasts: ToastProps[]
  removeToast: (id: string) => void
}

export function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  return (
    <div
      className="fixed top-0 right-0 z-[100] flex flex-col gap-2 p-4 pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={removeToast} />
      ))}
    </div>
  )
}
