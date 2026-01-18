import React from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { Loader2 } from 'lucide-react'

interface PrimaryButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  onClick,
  disabled = false,
  loading = false,
  size = 'md',
  fullWidth = false,
  className,
}) => {
  return (
    <motion.button
      className={clsx(
        'btn-primary font-medium rounded-xl transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 focus:ring-offset-bg0',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center justify-center gap-2">
        {loading && <Loader2 size={16} className="animate-spin" />}
        {children}
      </div>
    </motion.button>
  )
}