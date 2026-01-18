import React from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

interface StatChipProps {
  label: string
  value?: string | number
  icon?: React.ReactNode
  selected?: boolean
  onClick?: () => void
  variant?: 'default' | 'outline' | 'filled'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const variantClasses = {
  default: 'bg-surface hover:bg-surfaceHover border-stroke',
  outline: 'bg-transparent hover:bg-surface border-stroke hover:border-accent',
  filled: 'bg-accent hover:bg-accentHover border-accent text-white',
}

const sizeClasses = {
  sm: 'px-3 py-1 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export const StatChip: React.FC<StatChipProps> = ({
  label,
  value,
  icon,
  selected = false,
  onClick,
  variant = 'default',
  size = 'md',
  className,
}) => {
  const Component = onClick ? motion.button : motion.div

  return (
    <Component
      className={clsx(
        'inline-flex items-center gap-2 rounded-full border transition-all duration-200',
        variantClasses[variant],
        sizeClasses[size],
        selected && 'ring-2 ring-accent/50',
        onClick && 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/50',
        className
      )}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.05 } : undefined}
      whileTap={onClick ? { scale: 0.95 } : undefined}
      aria-pressed={selected}
    >
      {icon && (
        <span className="flex-shrink-0">
          {icon}
        </span>
      )}

      <span className="font-medium">
        {label}
      </span>

      {value !== undefined && (
        <span className={clsx(
          'px-2 py-0.5 rounded-full text-xs font-bold',
          selected || variant === 'filled'
            ? 'bg-white/20'
            : 'bg-accent/10 text-accent'
        )}>
          {value}
        </span>
      )}
    </Component>
  )
}