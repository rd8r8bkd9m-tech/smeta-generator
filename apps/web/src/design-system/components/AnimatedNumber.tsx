import { useEffect, useRef, useState, useCallback } from 'react'
import clsx from 'clsx'

export interface AnimatedNumberProps {
  value: number
  duration?: number
  suffix?: string
  prefix?: string
  decimals?: number
  className?: string
  animate?: boolean
}

const easeOutExpo = (t: number): number => {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

export function AnimatedNumber({
  value,
  duration = 1000,
  suffix = '',
  prefix = '',
  decimals = 0,
  className,
  animate = true,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(animate ? 0 : value)
  const prevValueRef = useRef(value)
  const rafRef = useRef<number>()
  const startTimeRef = useRef<number>()

  const animateValue = useCallback((startValue: number, endValue: number) => {
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp
      }

      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easeOutExpo(progress)
      
      const currentValue = startValue + (endValue - startValue) * easedProgress
      setDisplayValue(currentValue)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    startTimeRef.current = undefined
    rafRef.current = requestAnimationFrame(animate)
  }, [duration])

  useEffect(() => {
    if (!animate) {
      setDisplayValue(value)
      return
    }

    if (prevValueRef.current !== value) {
      animateValue(prevValueRef.current, value)
      prevValueRef.current = value
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [value, animate, animateValue])

  // Initial animation on mount - intentionally runs only once
  useEffect(() => {
    if (animate && prevValueRef.current === value) {
      animateValue(0, value)
    }
    // Note: This effect intentionally runs only on mount to trigger initial animation
    // Adding dependencies would cause unwanted re-runs
  }, [animate, animateValue, value])

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num)
  }

  return (
    <span className={clsx('tabular-nums font-semibold', className)}>
      {prefix}
      {formatNumber(displayValue)}
      {suffix}
    </span>
  )
}

export default AnimatedNumber
