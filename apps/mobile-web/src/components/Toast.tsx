import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { ToastType } from '../hooks/useToast'
import { useToastStore } from '../hooks/useToast'

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const toastColors = {
  success: 'text-green-400 bg-green-400/10 border-green-400/20',
  error: 'text-red-400 bg-red-400/10 border-red-400/20',
  warning: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  info: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
}

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore()

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none safe-area-top">
      <div className="flex flex-col items-center px-4 py-4 space-y-2">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <ToastItem
              key={toast.id}
              toast={toast}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

interface ToastItemProps {
  toast: {
    id: string
    type: ToastType
    title: string
    message?: string
  }
  onClose: () => void
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  const Icon = toastIcons[toast.type]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.8 }}
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 30,
      }}
      className={`pointer-events-auto max-w-sm w-full glass-card border p-4 ${toastColors[toast.type]}`}
    >
      <div className="flex items-start gap-3">
        <Icon size={20} className="flex-shrink-0 mt-0.5" />

        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm">{toast.title}</h4>
          {toast.message && (
            <p className="text-xs text-textSecondary mt-1">{toast.message}</p>
          )}
        </div>

        <button
          onClick={onClose}
          className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    </motion.div>
  )
}