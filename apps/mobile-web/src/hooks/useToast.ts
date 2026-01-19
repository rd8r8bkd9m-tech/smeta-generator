import { create } from 'zustand'
import { useCallback, useMemo } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

interface ToastStore {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  clearToasts: () => void
}

// Счетчик для гарантированно уникальных ID
let toastCounter = 0

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],

  addToast: (toast) => {
    // Уникальный ID: счетчик + timestamp + random (тройная защита)
    toastCounter += 1
    const id = `toast-${toastCounter}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    const duration = toast.duration ?? 4000
    
    const newToast: Toast = {
      ...toast,
      id,
      duration,
    }

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }))

    // Автоматическое удаление через duration
    if (duration > 0) {
      setTimeout(() => {
        // Проверяем, существует ли еще этот тост перед удалением
        const currentToasts = get().toasts
        if (currentToasts.some(t => t.id === id)) {
          set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
          }))
        }
      }, duration)
    }
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }))
  },

  clearToasts: () => {
    set({ toasts: [] })
  },
}))

// Hook для использования в компонентах
export const useToast = () => {
  const addToast = useToastStore((state) => state.addToast)
  const removeToast = useToastStore((state) => state.removeToast)
  const clearToasts = useToastStore((state) => state.clearToasts)

  // Оборачиваем методы в useCallback для стабильности
  const success = useCallback((title: string, message?: string) => 
    addToast({ type: 'success', title, message }), [addToast])
  
  const error = useCallback((title: string, message?: string) => 
    addToast({ type: 'error', title, message }), [addToast])
  
  const warning = useCallback((title: string, message?: string) => 
    addToast({ type: 'warning', title, message }), [addToast])
  
  const info = useCallback((title: string, message?: string) => 
    addToast({ type: 'info', title, message }), [addToast])

  const toast = useMemo(() => ({
    success,
    error,
    warning,
    info,
  }), [success, error, warning, info])

  return {
    toast,
    removeToast,
    clearToasts,
  }
}
