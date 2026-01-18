import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { X, Type, Image, Zap } from 'lucide-react'
import { GlassCard } from '../components/GlassCard'

export const CreatePage: React.FC = () => {
  const navigate = useNavigate()

  const options = [
    {
      id: 'text',
      icon: Type,
      title: 'Текст',
      description: 'Создайте красивый текстовый статус',
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
      route: '/create-text'
    },
    {
      id: 'media',
      icon: Image,
      title: 'Фото/Видео',
      description: 'Загрузите медиафайл',
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
      route: '/create' // placeholder
    },
    {
      id: 'signal',
      icon: Zap,
      title: 'Сигнал',
      description: 'Быстрое обновление статуса',
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
      route: '/create' // placeholder
    }
  ]

  return (
    <div className="min-h-full flex flex-col px-6 py-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <h1 className="text-xl font-bold">Создать статус</h1>
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-full bg-surface hover:bg-surfaceHover transition-colors flex items-center justify-center"
        >
          <X size={20} />
        </button>
      </motion.div>

      {/* Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        {options.map((option, index) => {
          const Icon = option.icon
          return (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <GlassCard
                onClick={() => navigate(option.route)}
                hover
                className="p-6 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${option.bgColor} rounded-xl flex items-center justify-center`}>
                    <Icon size={24} className={option.color} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{option.title}</h3>
                    <p className="text-sm text-textSecondary">{option.description}</p>
                  </div>
                  <div className="text-textTertiary">
                    →
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8"
      >
        <h2 className="text-lg font-semibold mb-4">Быстрые действия</h2>

        <div className="grid grid-cols-2 gap-3">
          {[
            { emoji: '😊', label: 'Отлично!' },
            { emoji: '🚀', label: 'В работе' },
            { emoji: '🏖️', label: 'На отдыхе' },
            { emoji: '📚', label: 'Учусь' }
          ].map((action, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              whileTap={{ scale: 0.95 }}
              className="glass-card p-4 text-center hover:bg-surfaceHover transition-colors"
            >
              <div className="text-2xl mb-2">{action.emoji}</div>
              <div className="text-sm font-medium">{action.label}</div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}