import { useState, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import clsx from 'clsx'

export interface ToastProps {
  id: string
  type?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
  onClose: (id: string) => void
}

const typeStyles = {
  success: {
    bg: 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20',
    border: 'border-emerald-500/30',
    icon: CheckCircle,
    iconColor: 'text-emerald-500',
  },
  error: {
    bg: 'bg-gradient-to-r from-rose-500/10 to-red-500/10 dark:from-rose-500/20 dark:to-red-500/20',
    border: 'border-rose-500/30',
    icon: AlertCircle,
    iconColor: 'text-rose-500',
  },
  warning: {
    bg: 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20',
    border: 'border-amber-500/30',
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
  },
  info: {
    bg: 'bg-gradient-to-r from-sky-500/10 to-blue-500/10 dark:from-sky-500/20 dark:to-blue-500/20',
    border: 'border-sky-500/30',
    icon: Info,
    iconColor: 'text-sky-500',
  },
}

export function Toast({ id, type = 'info', title, message, duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  
  const typeStyle = typeStyles[type]
  const Icon = typeStyle.icon

  useEffect(() => {
    // Animate in
    requestAnimationFrame(() => setIsVisible(true))

    // Auto dismiss
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsLeaving(true)
        setTimeout(() => onClose(id), 300)
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, id, onClose])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(() => onClose(id), 300)
  }

  return (
    <div
      className={clsx(
        'flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-xl',
        'transition-all duration-300 ease-out',
        typeStyle.bg,
        typeStyle.border,
        isVisible && !isLeaving ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
      )}
      role="alert"
    >
      <Icon className={clsx('w-5 h-5 flex-shrink-0 mt-0.5', typeStyle.iconColor)} />
      
      <div className="flex-1 min-w-0">
        {title && (
          <p className="font-semibold text-gray-900 dark:text-white">{title}</p>
        )}
        <p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>
      </div>
      
      <button
        onClick={handleClose}
        className="flex-shrink-0 p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export interface ToastContainerProps {
  toasts: Array<{
    id: string
    type?: 'success' | 'error' | 'warning' | 'info'
    title?: string
    message: string
    duration?: number
  }>
  onRemove: (id: string) => void
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          duration={toast.duration}
          onClose={onRemove}
        />
      ))}
    </div>
  )
}

export default Toast
