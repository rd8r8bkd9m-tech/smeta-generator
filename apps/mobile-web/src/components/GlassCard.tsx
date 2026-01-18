import React from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg' | 'none'
  hover?: boolean
  onClick?: () => void
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  padding = 'md',
  hover = false,
  onClick,
}) => {
  const Component = onClick ? motion.button : motion.div

  return (
    <Component
      className={clsx(
        'glass-card',
        paddingClasses[padding],
        hover && 'hover:bg-surfaceHover transition-colors duration-200',
        onClick && 'cursor-pointer active:scale-98 transition-transform',
        className
      )}
      onClick={onClick}
      whileHover={hover ? { scale: 1.02 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
    >
      {children}
    </Component>
  )
}