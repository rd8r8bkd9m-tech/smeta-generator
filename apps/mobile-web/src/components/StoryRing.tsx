import React from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

interface StoryRingProps {
  size?: number
  hasUnseen?: boolean
  progress?: number // 0-1
  imageUrl?: string
  className?: string
  onClick?: () => void
}

export const StoryRing: React.FC<StoryRingProps> = ({
  size = 64,
  hasUnseen = false,
  progress = 0,
  imageUrl,
  className,
  onClick,
}) => {
  const strokeWidth = 3
  const radius = (size - strokeWidth * 2) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (progress * circumference)

  return (
    <motion.div
      className={clsx('relative cursor-pointer', className)}
      style={{ width: size, height: size }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      {/* Gradient ring for unseen stories */}
      {hasUnseen && (
        <svg
          className="absolute inset-0 -rotate-90"
          width={size}
          height={size}
        >
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#gradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>
      )}

      {/* Progress ring for seen stories */}
      {progress > 0 && !hasUnseen && (
        <svg
          className="absolute inset-0 -rotate-90"
          width={size}
          height={size}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>
      )}

      {/* Avatar */}
      <div
        className="absolute inset-0 rounded-full overflow-hidden border-2 border-bg0"
        style={{ padding: strokeWidth }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Avatar"
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-surface flex items-center justify-center">
            <div className="w-6 h-6 bg-textTertiary rounded-full" />
          </div>
        )}
      </div>

      {/* Pulsing indicator for new content */}
      {hasUnseen && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-accent/50"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </motion.div>
  )
}