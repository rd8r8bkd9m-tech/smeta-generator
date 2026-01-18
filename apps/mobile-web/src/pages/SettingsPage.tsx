import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, Bell, Shield, Palette, Globe, HelpCircle, LogOut, Moon, Sun } from 'lucide-react'
import { GlassCard } from '../components/GlassCard'
import { useTheme } from '../hooks/useTheme'

export const SettingsPage: React.FC = () => {
  const [notifications, setNotifications] = useState(true)
  const { isDark, toggleTheme } = useTheme()

  const settingsSections = [
    {
      title: 'Уведомления',
      items: [
        {
          icon: Bell,
          label: 'Push-уведомления',
          type: 'toggle' as const,
          value: notifications,
          onChange: setNotifications,
        },
      ],
    },
    {
      title: 'Внешний вид',
      items: [
        {
          icon: isDark ? Moon : Sun,
          label: isDark ? 'Тёмная тема' : 'Светлая тема',
          type: 'toggle' as const,
          value: isDark,
          onChange: toggleTheme,
        },
      ],
    },
    {
      title: 'Приватность и безопасность',
      items: [
        {
          icon: Shield,
          label: 'Конфиденциальность',
          type: 'link' as const,
          route: '/settings/privacy',
        },
        {
          icon: Globe,
          label: 'Активные сессии',
          type: 'link' as const,
          route: '/settings/sessions',
        },
      ],
    },
    {
      title: 'Поддержка',
      items: [
        {
          icon: HelpCircle,
          label: 'Справка',
          type: 'link' as const,
          route: '/help',
        },
      ],
    },
  ]

  return (
    <div className="min-h-full pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 py-6"
      >
        <h1 className="text-xl font-bold">Настройки</h1>
      </motion.div>

      {/* Settings sections */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="px-6 space-y-8"
      >
        {settingsSections.map((section, sectionIndex) => (
          <div key={section.title}>
            <h2 className="text-sm font-semibold text-textSecondary uppercase tracking-wider mb-4">
              {section.title}
            </h2>

            <div className="space-y-2">
              {section.items.map((item, itemIndex) => {
                const Icon = item.icon

                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + sectionIndex * 0.1 + itemIndex * 0.05 }}
                  >
                    {item.type === 'toggle' ? (
                      <GlassCard className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                              <Icon size={16} className="text-accent" />
                            </div>
                            <span className="font-medium">{item.label}</span>
                          </div>

                          <button
                            onClick={() => item.onChange(!item.value)}
                            className={`relative w-11 h-6 rounded-full transition-colors ${
                              item.value ? 'bg-accent' : 'bg-surface'
                            }`}
                          >
                            <div
                              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                                item.value ? 'translate-x-6' : 'translate-x-0.5'
                              }`}
                            />
                          </button>
                        </div>
                      </GlassCard>
                    ) : (
                      <GlassCard
                        hover
                        className="p-4 cursor-pointer"
                        onClick={() => console.log('Navigate to', item.route)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                              <Icon size={16} className="text-accent" />
                            </div>
                            <span className="font-medium">{item.label}</span>
                          </div>
                          <ChevronRight size={16} className="text-textTertiary" />
                        </div>
                      </GlassCard>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>
        ))}

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="pt-8 border-t border-stroke"
        >
          <GlassCard
            hover
            className="p-4 cursor-pointer border-red-500/20"
            onClick={() => console.log('Logout')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center">
                  <LogOut size={16} className="text-red-500" />
                </div>
                <span className="font-medium text-red-500">Выйти из аккаунта</span>
              </div>
              <ChevronRight size={16} className="text-red-500" />
            </div>
          </GlassCard>
        </motion.div>

        {/* App info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center py-8"
        >
          <p className="text-xs text-textTertiary mb-2">Status App v1.0.0</p>
          <p className="text-xs text-textTertiary">
            © 2025 Status. Все права защищены.
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}