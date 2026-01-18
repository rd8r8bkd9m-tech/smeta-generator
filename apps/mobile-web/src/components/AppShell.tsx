import React from 'react'
import { motion } from 'framer-motion'
import { Outlet } from 'react-router-dom'
import { BottomNavigation } from './BottomNavigation'
import { ToastContainer } from './Toast'

interface AppShellProps {
  children?: React.ReactNode
  showBottomNav?: boolean
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  showBottomNav = true
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-bg0 via-bg1 to-bg0 text-textPrimary">
      {/* Фоновый градиент */}
      <div className="fixed inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent/5 pointer-events-none" />

      {/* Основной контент */}
      <div className="relative min-h-screen flex flex-col safe-area-inset">
        {/* Safe area top */}
        <div className="safe-area-top" />

        {/* Основная область контента */}
        <main className="flex-1 flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex-1"
          >
            {children || <Outlet />}
          </motion.div>
        </main>

        {/* Bottom navigation */}
        {showBottomNav && <BottomNavigation />}

        {/* Safe area bottom */}
        <div className="safe-area-bottom" />

        {/* Toast notifications */}
        <ToastContainer />
      </div>
    </div>
  )
}