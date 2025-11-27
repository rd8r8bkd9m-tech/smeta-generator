import { ReactNode } from 'react'
import Navigation from './Navigation'
import { ToastContainer } from '../design-system/components/Toast'
import { useStore } from '../store/useStore'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { notifications, removeNotification, theme } = useStore()

  // Map notifications to toast format
  const toasts = notifications.map(n => ({
    id: n.id,
    type: n.type,
    message: n.message,
  }))

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50/30 dark:from-dark-bg dark:via-dark-bg-secondary dark:to-dark-bg-tertiary">
        <Navigation />
        <main className="container mx-auto px-4 py-8 animate-fade-in-up">
          {children}
        </main>
        <footer className="mt-auto border-t border-secondary-200/50 dark:border-secondary-800/50 py-6 backdrop-blur-sm bg-white/50 dark:bg-dark-bg/50">
          <div className="container mx-auto px-4 text-center text-secondary-500 dark:text-secondary-400 text-sm">
            <p className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-primary-500 to-amber-500 animate-pulse"></span>
              © 2024 SMETA PRO. Все права защищены.
            </p>
          </div>
        </footer>
        
        {/* Toast Notifications */}
        <ToastContainer toasts={toasts} onRemove={removeNotification} />
      </div>
    </div>
  )
}
