import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, MessageCircle, UserPlus, AtSign, MoreHorizontal } from 'lucide-react'
import { GlassCard } from '../components/GlassCard'
import { SegmentedControl } from '../components/SegmentedControl'
import { mockInboxItems } from '../mock/data'

export const InboxPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'all' | 'unread'>('all')

  const filteredItems = selectedTab === 'unread'
    ? mockInboxItems.filter(item => !item.isRead)
    : mockInboxItems

  const getIcon = (type: string) => {
    switch (type) {
      case 'reaction': return Heart
      case 'reply': return MessageCircle
      case 'follow': return UserPlus
      case 'mention': return AtSign
      default: return MessageCircle
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'reaction': return 'Поставил реакцию'
      case 'reply': return 'Ответил на статус'
      case 'follow': return 'Подписался на вас'
      case 'mention': return 'Упомянул вас'
      default: return 'Новое уведомление'
    }
  }

  return (
    <div className="min-h-full pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 py-6"
      >
        <h1 className="text-xl font-bold">Входящие</h1>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="px-6 mb-6"
      >
        <SegmentedControl
          options={[
            { value: 'all', label: `Все (${mockInboxItems.length})` },
            { value: 'unread', label: `Непрочитанные (${mockInboxItems.filter(item => !item.isRead).length})` },
          ]}
          value={selectedTab}
          onChange={(value) => setSelectedTab(value as 'all' | 'unread')}
        />
      </motion.div>

      {/* Inbox items */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="px-6"
      >
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle size={24} className="text-textTertiary" />
            </div>
            <p className="text-textSecondary">Новых уведомлений нет</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item, index) => {
              const Icon = getIcon(item.type)

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <GlassCard className={`p-4 ${!item.isRead ? 'border-l-4 border-l-accent' : ''}`}>
                    <div className="flex items-start gap-3">
                      <img
                        src={item.user.avatar}
                        alt={item.user.name}
                        className="w-10 h-10 rounded-full"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium truncate">{item.user.name}</p>
                          <div className={`w-2 h-2 rounded-full ${
                            item.user.isOnline ? 'bg-accent' : 'bg-textTertiary'
                          }`} />
                        </div>

                        <p className="text-sm text-textSecondary mb-2">
                          {getTypeText(item.type)}
                        </p>

                        {item.content && (
                          <p className="text-sm bg-surface/50 rounded-lg p-2 mb-2">
                            {item.content}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <p className="text-xs text-textTertiary">
                            {Math.floor((Date.now() - new Date(item.createdAt).getTime()) / (1000 * 60))} мин назад
                          </p>

                          <button className="p-1 rounded-full hover:bg-surface/50 transition-colors">
                            <MoreHorizontal size={16} className="text-textTertiary" />
                          </button>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                          <Icon size={16} className="text-accent" />
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>
    </div>
  )
}