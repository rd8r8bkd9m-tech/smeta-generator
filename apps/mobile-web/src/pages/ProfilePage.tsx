import React from 'react'
import { motion } from 'framer-motion'
import { Settings, Edit, Eye, Heart, MessageCircle } from 'lucide-react'
import { GlassCard } from '../components/GlassCard'
import { StoryRing } from '../components/StoryRing'
import { mockStories, currentUser } from '../mock/data'

export const ProfilePage: React.FC = () => {
  // Мои статусы
  const myStories = mockStories.filter(story => story.userId === 'current')

  // Статистика
  const totalViews = myStories.reduce((sum, story) => sum + story.views, 0)
  const totalReactions = myStories.reduce((sum, story) => sum + story.reactions.length, 0)

  return (
    <div className="min-h-full pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 py-6"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Профиль</h1>
          <Settings size={20} className="text-textSecondary" />
        </div>
      </motion.div>

      {/* Profile info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="px-6 mb-8"
      >
        <GlassCard className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-16 h-16 rounded-full"
            />
            <div className="flex-1">
              <h2 className="text-lg font-bold">{currentUser.name}</h2>
              <p className="text-textSecondary">@{currentUser.username}</p>
            </div>
            <button className="p-2 rounded-full bg-surface hover:bg-surfaceHover transition-colors">
              <Edit size={16} />
            </button>
          </div>

          <p className="text-textSecondary text-sm mb-4">
            Люблю создавать красивые статусы и делиться моментами жизни ✨
          </p>

          {/* Stats */}
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-lg font-bold">{myStories.length}</div>
              <div className="text-xs text-textSecondary">статусов</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{totalViews}</div>
              <div className="text-xs text-textSecondary">просмотров</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{totalReactions}</div>
              <div className="text-xs text-textSecondary">реакций</div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* My stories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="px-6 mb-8"
      >
        <h2 className="text-lg font-semibold mb-4">Мои статусы</h2>

        <div className="flex gap-4 overflow-x-auto pb-2">
          {/* Create new */}
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
              </div>
              <p className="text-xs text-textSecondary">Создать</p>
            </div>
          </motion.div>

          {/* Existing stories */}
          {myStories.map((story, index) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="flex-shrink-0"
            >
              <div className="text-center">
                <StoryRing
                  size={64}
                  hasUnseen={false}
                  imageUrl={story.user.avatar}
                  className="mb-2"
                />
                <p className="text-xs text-textSecondary">
                  {story.type === 'text' ? 'Текст' :
                   story.type === 'image' ? 'Фото' : 'Видео'}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="px-6"
      >
        <h2 className="text-lg font-semibold mb-4">Недавняя активность</h2>

        <div className="space-y-4">
          {mockStories.slice(0, 3).map((story, index) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <GlassCard className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                    {story.type === 'text' ? '📝' :
                     story.type === 'image' ? '📸' : '🎥'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">
                      {story.type === 'text' ? 'Опубликовали текстовый статус' :
                       story.type === 'image' ? 'Поделились фото' : 'Опубликовали видео'}
                    </p>
                    <p className="text-sm text-textSecondary">
                      {Math.floor((Date.now() - new Date(story.createdAt).getTime()) / (1000 * 60))} мин назад
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-textSecondary">
                  <div className="flex items-center gap-1">
                    <Eye size={14} />
                    {story.views}
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart size={14} />
                    {story.reactions.length}
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