import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Home,
  Plus,
  User,
  Settings,
  MessageCircle
} from 'lucide-react'

const navigationItems = [
  { icon: Home, label: 'Главная', path: '/feed' },
  { icon: MessageCircle, label: 'Входящие', path: '/inbox' },
  { icon: Plus, label: 'Создать', path: '/create', isAction: true },
  { icon: User, label: 'Профиль', path: '/profile' },
  { icon: Settings, label: 'Настройки', path: '/settings' },
]

export const BottomNavigation: React.FC = () => {
  const location = useLocation()

  return (
    <div className="sticky bottom-0 left-0 right-0 z-50">
      {/* Glass background */}
      <div className="absolute inset-0 glass border-t border-stroke -z-10" />

      {/* Navigation */}
      <nav className="relative px-4 py-2 flex items-center justify-around">
        {navigationItems.map((item, index) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon

          if (item.isAction) {
            return (
              <motion.div
                key={item.path}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <Link
                  to={item.path}
                  className="flex flex-col items-center justify-center w-14 h-14 rounded-full bg-accent text-white shadow-lg hover:bg-accentHover transition-colors"
                >
                  <Icon size={24} />
                </Link>
                {/* Soft glow */}
                <div className="absolute inset-0 rounded-full bg-accent/20 blur-md -z-10" />
              </motion.div>
            )
          }

          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={item.path}
                className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-accent bg-accentLight'
                    : 'text-textSecondary hover:text-textPrimary hover:bg-surface'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </Link>
            </motion.div>
          )
        })}
      </nav>
    </div>
  )
}