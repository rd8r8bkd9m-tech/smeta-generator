import React from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

interface GhostButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
}

export const GhostButton: React.FC<GhostButtonProps> = ({
  children,
  onClick,
  disabled = false,
  size = 'md',
  fullWidth = false,
  className,
}) => {
  return (
    <motion.button
      className={clsx(
        'btn-ghost font-medium rounded-xl transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-bg0',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.button>
  )
}