import React from 'react'
import { motion } from 'framer-motion'
import { StoryRing } from '../components/StoryRing'
import { GlassCard } from '../components/GlassCard'
import { mockStories, mockUsers } from '../mock/data'

export const FeedPage: React.FC = () => {
  // Группируем статусы по пользователям и берем самый свежий
  const userStories = mockUsers.map(user => {
    const userStory = mockStories
      .filter(story => story.userId === user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]

    return {
      user,
      story: userStory,
      hasUnseen: userStory && new Date(userStory.createdAt) > new Date(Date.now() - 1000 * 60 * 60 * 24), // Новые за последние 24 часа
    }
  }).filter(item => item.story) // Только пользователи с статусами

  return (
    <div className="min-h-full pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 py-6"
      >
        <h1 className="text-xl font-bold">Статусы</h1>
      </motion.div>

      {/* Stories ring */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="px-6 mb-8"
      >
        <div className="flex gap-4 overflow-x-auto pb-2">
          {/* My status */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex-shrink-0"
          >
            <div className="text-center">
              <div className="relative mb-2">
                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center border-2 border-accent border-dashed">
                  <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">+</span>
                  </div>
                </div>
                {/* Soft glow */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-accent/30 blur-md -z-10"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>
              <p className="text-xs text-textSecondary">Мой</p>
            </div>
          </motion.div>

          {/* Other users */}
          {userStories.map((item, index) => (
            <motion.div
              key={item.user.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="flex-shrink-0"
            >
              <div className="text-center">
                <StoryRing
                  size={64}
                  hasUnseen={item.hasUnseen}
                  imageUrl={item.user.avatar}
                  className="mb-2"
                />
                <p className="text-xs text-textSecondary truncate w-16">
                  {item.user.name.split(' ')[0]}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Promo card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="px-6 mb-8"
      >
        <GlassCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center">
              <span className="text-accent text-xl">✨</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Новая функция!</h3>
              <p className="text-sm text-textSecondary">
                Теперь можно добавлять текстовые статусы с красивыми фонами
              </p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Recent activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="px-6"
      >
        <h2 className="text-lg font-semibold mb-4">Недавние обновления</h2>

        <div className="space-y-4">
          {mockStories.slice(0, 3).map((story, index) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <GlassCard className="p-4">
                <div className="flex items-center gap-3">
                  <img
                    src={story.user.avatar}
                    alt={story.user.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{story.user.name}</p>
                    <p className="text-sm text-textSecondary">
                      {story.type === 'text' ? 'Опубликовал текстовый статус' :
                       story.type === 'image' ? 'Опубликовал фото' : 'Опубликовал видео'}
                    </p>
                  </div>
                  <div className="text-xs text-textTertiary">
                    {Math.floor((Date.now() - new Date(story.createdAt).getTime()) / (1000 * 60))} мин
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}