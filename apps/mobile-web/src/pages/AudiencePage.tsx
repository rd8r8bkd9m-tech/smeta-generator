import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { X, Users, User, Lock, Check } from 'lucide-react'
import { PrimaryButton } from '../components/PrimaryButton'
import { GlassCard } from '../components/GlassCard'
import { mockUsers } from '../mock/data'

type AudienceType = 'all' | 'friends' | 'only_me'

export const AudiencePage: React.FC = () => {
  const navigate = useNavigate()
  const [selectedAudience, setSelectedAudience] = useState<AudienceType>('all')
  const [excludedUsers, setExcludedUsers] = useState<string[]>([])

  const audiences = [
    {
      id: 'all' as AudienceType,
      icon: Users,
      title: 'Все',
      description: 'Виден всем пользователям',
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10'
    },
    {
      id: 'friends' as AudienceType,
      icon: User,
      title: 'Друзья',
      description: 'Только для друзей',
      color: 'text-green-400',
      bgColor: 'bg-green-400/10'
    },
    {
      id: 'only_me' as AudienceType,
      icon: Lock,
      title: 'Только я',
      description: 'Личный статус',
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10'
    }
  ]

  const toggleUserExclusion = (userId: string) => {
    setExcludedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  return (
    <div className="min-h-full flex flex-col px-6 py-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <h1 className="text-xl font-bold">Кому показать</h1>
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-full bg-surface hover:bg-surfaceHover transition-colors flex items-center justify-center"
        >
          <X size={20} />
        </button>
      </motion.div>

      {/* Audience options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-3 mb-8"
      >
        {audiences.map((audience, index) => {
          const Icon = audience.icon
          const isSelected = selectedAudience === audience.id

          return (
            <motion.div
              key={audience.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <GlassCard
                onClick={() => setSelectedAudience(audience.id)}
                hover
                className="p-4 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 ${audience.bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon size={20} className={audience.color} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{audience.title}</h3>
                    <p className="text-sm text-textSecondary">{audience.description}</p>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                      <Check size={14} className="text-white" />
                    </div>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Friends list (only for 'friends' option) */}
      {selectedAudience === 'friends' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold mb-4">Исключить из списка</h2>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {mockUsers.slice(0, 8).map((user, index) => {
              const isExcluded = excludedUsers.includes(user.id)

              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                >
                  <GlassCard
                    onClick={() => toggleUserExclusion(user.id)}
                    hover
                    className="p-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{user.name}</p>
                      </div>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        isExcluded
                          ? 'bg-accent border-accent'
                          : 'border-stroke'
                      }`}>
                        {isExcluded && (
                          <Check size={12} className="text-white" />
                        )}
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Action button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-auto"
      >
        <PrimaryButton
          onClick={() => navigate('/success')}
          fullWidth
          size="lg"
        >
          Опубликовать
        </PrimaryButton>
      </motion.div>
    </div>
  )
}