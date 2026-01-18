import React from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

interface SegmentedControlOption {
  value: string
  label: string
  icon?: React.ReactNode
}

interface SegmentedControlProps {
  options: SegmentedControlOption[]
  value: string
  onChange: (value: string) => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-3 text-base',
  lg: 'px-6 py-4 text-lg',
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  value,
  onChange,
  size = 'md',
  className,
}) => {
  const selectedIndex = options.findIndex(option => option.value === value)

  return (
    <div
      className={clsx(
        'relative flex bg-surface rounded-xl p-1',
        className
      )}
      role="tablist"
      aria-label="Segmented control"
    >
      {/* Animated background */}
      <motion.div
        className="absolute top-1 left-1 h-[calc(100%-8px)] bg-accent rounded-lg"
        animate={{
          width: `${100 / options.length}%`,
          x: `${(100 / options.length) * selectedIndex}%`,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
      />

      {options.map((option, index) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={clsx(
            'relative flex-1 flex items-center justify-center gap-2 rounded-lg transition-colors z-10',
            sizeClasses[size],
            'focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 focus:ring-offset-bg0',
            selectedIndex === index
              ? 'text-white'
              : 'text-textSecondary hover:text-textPrimary'
          )}
          role="tab"
          aria-selected={selectedIndex === index}
          aria-controls={`panel-${option.value}`}
          id={`tab-${option.value}`}
        >
          {option.icon}
          <span className="font-medium">{option.label}</span>
        </button>
      ))}
    </div>
  )
}