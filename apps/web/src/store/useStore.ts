import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  name: string
}

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  timestamp: number
}

interface AppState {
  // Auth
  user: User | null
  token: string | null
  isAuthenticated: boolean
  
  // UI
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  notifications: Notification[]
  
  // Actions
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  logout: () => void
  toggleSidebar: () => void
  setTheme: (theme: 'light' | 'dark') => void
  addNotification: (type: Notification['type'], message: string) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      sidebarOpen: true,
      theme: 'light',
      notifications: [],

      // Auth actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setToken: (token) => {
        if (token) {
          localStorage.setItem('token', token)
        } else {
          localStorage.removeItem('token')
        }
        set({ token })
      },
      
      logout: () => {
        localStorage.removeItem('token')
        set({ user: null, token: null, isAuthenticated: false })
      },

      // UI actions
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      setTheme: (theme) => set({ theme }),
      
      addNotification: (type, message) => {
        const notification: Notification = {
          id: Date.now().toString(),
          type,
          message,
          timestamp: Date.now(),
        }
        set((state) => ({
          notifications: [...state.notifications, notification].slice(-5),
        }))
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
          get().removeNotification(notification.id)
        }, 5000)
      },
      
      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }))
      },
      
      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: 'smeta-pro-storage',
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
)
