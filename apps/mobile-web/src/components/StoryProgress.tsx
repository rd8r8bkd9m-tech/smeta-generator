import React from 'react'
import { motion } from 'framer-motion'

interface StoryProgressProps {
  segments: number
  currentIndex: number
  progress: number // 0-1 for current segment
  className?: string
}

export const StoryProgress: React.FC<StoryProgressProps> = ({
  segments,
  currentIndex,
  progress,
  className,
}) => {
  return (
    <div className={`flex gap-1 px-4 py-3 ${className}`}>
      {Array.from({ length: segments }).map((_, index) => (
        <div
          key={index}
          className="flex-1 h-0.5 bg-white/20 rounded-full overflow-hidden"
        >
          {index < currentIndex ? (
            // Completed segments
            <motion.div
              className="h-full bg-white rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 0.3 }}
            />
          ) : index === currentIndex ? (
            // Current segment with progress
            <motion.div
              className="h-full bg-white rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.1 }}
            />
          ) : (
            // Future segments
            <div className="h-full bg-transparent" />
          )}
        </div>
      ))}
    </div>
  )
}