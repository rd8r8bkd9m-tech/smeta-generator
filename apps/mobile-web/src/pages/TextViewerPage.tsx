import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart, Share, MoreHorizontal } from 'lucide-react'
import { StoryProgress } from '../components/StoryProgress'
import { mockStories } from '../mock/data'

export const TextViewerPage: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [showReactions, setShowReactions] = useState(false)

  const story = mockStories.find(s => s.id === id)
  const segments = story ? [story] : []

  useEffect(() => {
    if (!story) return

    const duration = 5000
    const interval = 50

    if (!isPaused) {
      const timer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 1) {
            if (currentIndex < segments.length - 1) {
              setCurrentIndex(currentIndex + 1)
              return 0
            } else {
              navigate(-1)
              return 0
            }
          }
          return prev + (interval / duration)
        })
      }, interval)

      return () => clearInterval(timer)
    }
  }, [currentIndex, isPaused, segments.length, navigate])

  if (!story) {
    return <div>Статус не найден</div>
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background: story.background || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      />

      {/* Progress bar */}
      <StoryProgress
        segments={segments.length}
        currentIndex={currentIndex}
        progress={progress}
      />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-6 pt-16">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={story.user.avatar}
              alt={story.user.name}
              className="w-8 h-8 rounded-full border border-white/30"
            />
            <div>
              <p className="font-medium text-white">{story.user.name}</p>
              <p className="text-xs text-white/70">
                {Math.floor((Date.now() - new Date(story.createdAt).getTime()) / (1000 * 60))} мин назад
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center"
          >
            <X size={20} className="text-white" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex items-center justify-center h-full px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md"
        >
          <p className="text-2xl font-bold text-white leading-relaxed">
            {story.content}
          </p>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-6 pb-safe-bottom">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowReactions(!showReactions)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm"
            >
              <Heart size={20} className="text-white" />
              <span className="text-white text-sm">{story.reactions.length}</span>
            </motion.button>
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center"
          >
            <Share size={20} className="text-white" />
          </motion.button>
        </div>
      </div>

      {/* Reactions overlay */}
      <AnimatePresence>
        {showReactions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm z-20"
            onClick={() => setShowReactions(false)}
          >
            <div className="flex items-end justify-center h-full pb-32">
              <motion.div
                initial={{ scale: 0.8, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 50 }}
                className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 mx-6"
              >
                <h3 className="text-white font-medium mb-4 text-center">Реакции</h3>
                <div className="flex gap-4">
                  {['❤️', '🔥', '👍', '😮', '😂'].map((emoji) => (
                    <motion.button
                      key={emoji}
                      whileTap={{ scale: 0.9 }}
                      className="text-2xl"
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}