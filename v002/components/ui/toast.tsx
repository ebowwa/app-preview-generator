'use client'

import * as React from "react"
import { X } from "lucide-react"

export interface ToastProps {
  id?: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive' | 'success' | 'warning'
  duration?: number
  onClose?: () => void
}

const toastVariants = {
  default: 'bg-white border-gray-200',
  destructive: 'bg-red-50 border-red-200',
  success: 'bg-green-50 border-green-200',
  warning: 'bg-yellow-50 border-yellow-200'
}

const iconVariants = {
  default: 'text-gray-600',
  destructive: 'text-red-600',
  success: 'text-green-600',
  warning: 'text-yellow-600'
}

export function Toast({
  title,
  description,
  variant = 'default',
  onClose
}: ToastProps) {
  return (
    <div className={`pointer-events-auto flex w-full max-w-md rounded-lg shadow-lg border p-4 ${toastVariants[variant]}`}>
      <div className="flex-1">
        {title && (
          <div className={`text-sm font-semibold ${iconVariants[variant]}`}>
            {title}
          </div>
        )}
        {description && (
          <div className="mt-1 text-sm text-gray-600 whitespace-pre-line">
            {description}
          </div>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={`ml-4 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${iconVariants[variant]} hover:opacity-70`}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

interface ToastContextType {
  toast: (props: ToastProps) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const toast = React.useCallback((props: ToastProps) => {
    const id = props.id || Date.now().toString()
    const duration = props.duration || 5000

    setToasts((prev) => [...prev, { ...props, id }])

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, duration)
    }
  }, [])

  const closeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-0 right-0 z-50 flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-md">
        {toasts.map((toastProps) => (
          <div key={toastProps.id} className="mt-2">
            <Toast
              {...toastProps}
              onClose={() => closeToast(toastProps.id!)}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}