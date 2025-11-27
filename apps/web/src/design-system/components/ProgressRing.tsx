import { useEffect, useState } from 'react'
import clsx from 'clsx'

export interface ProgressRingProps {
  value: number
  size?: number
  strokeWidth?: number
  gradientColors?: [string, string]
  showLabel?: boolean
  animated?: boolean
  className?: string
  labelClassName?: string
}

export function ProgressRing({
  value,
  size = 120,
  strokeWidth = 12,
  gradientColors = ['#FF6B35', '#FDB833'],
  showLabel = true,
  animated = true,
  className,
  labelClassName,
}: ProgressRingProps) {
  const [displayValue, setDisplayValue] = useState(animated ? 0 : value)
  const gradientId = `progress-gradient-${Math.random().toString(36).slice(2, 9)}`
  
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (displayValue / 100) * circumference
  const center = size / 2

  useEffect(() => {
    if (!animated) {
      setDisplayValue(value)
      return
    }

    const duration = 1000
    const startTime = performance.now()
    const startValue = displayValue

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = 1 - Math.pow(1 - progress, 3) // easeOutCubic
      
      const currentValue = startValue + (value - startValue) * easedProgress
      setDisplayValue(currentValue)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [value, animated]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={clsx('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradientColors[0]} />
            <stop offset="100%" stopColor={gradientColors[1]} />
          </linearGradient>
        </defs>
        
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-gray-700"
        />
        
        {/* Progress circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-300 ease-out"
          style={{
            filter: 'drop-shadow(0 0 6px rgba(255, 107, 53, 0.4))',
          }}
        />
      </svg>
      
      {showLabel && (
        <div 
          className={clsx(
            'absolute inset-0 flex flex-col items-center justify-center',
            labelClassName
          )}
        >
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {Math.round(displayValue)}%
          </span>
        </div>
      )}
    </div>
  )
}

export default ProgressRing
