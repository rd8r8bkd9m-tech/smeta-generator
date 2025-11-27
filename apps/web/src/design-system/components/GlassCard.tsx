import { ReactNode, forwardRef } from 'react'
import clsx from 'clsx'

export interface GlassCardProps {
  children: ReactNode
  variant?: 'light' | 'medium' | 'strong'
  gradient?: 'primary' | 'secondary' | 'accent' | 'success' | 'analytics' | 'none'
  hoverable?: boolean
  pressable?: boolean
  className?: string
  onClick?: () => void
}

const variantStyles = {
  light: 'bg-white/15 backdrop-blur-lg backdrop-saturate-150',
  medium: 'bg-white/25 backdrop-blur-xl backdrop-saturate-180',
  strong: 'bg-white/35 backdrop-blur-2xl backdrop-saturate-200',
}

const gradientBorderStyles = {
  primary: 'before:bg-gradient-to-br before:from-orange-500 before:via-amber-500 before:to-yellow-400',
  secondary: 'before:bg-gradient-to-br before:from-rose-500 before:via-pink-500 before:to-fuchsia-500',
  accent: 'before:bg-gradient-to-br before:from-indigo-500 before:via-purple-500 before:to-pink-400',
  success: 'before:bg-gradient-to-br before:from-teal-500 before:to-emerald-400',
  analytics: 'before:bg-gradient-to-br before:from-cyan-400 before:to-sky-400',
  none: '',
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, variant = 'medium', gradient = 'none', hoverable = false, pressable = false, className, onClick }, ref) => {
    const hasGradient = gradient !== 'none'
    
    return (
      <div
        ref={ref}
        onClick={onClick}
        className={clsx(
          // Base styles
          'relative rounded-2xl border border-white/20 shadow-lg',
          variantStyles[variant],
          
          // Gradient border (using pseudo-element)
          hasGradient && [
            'before:absolute before:inset-0 before:rounded-2xl before:p-[1px]',
            'before:-z-10 before:opacity-50',
            gradientBorderStyles[gradient],
          ],
          
          // Interactive states
          hoverable && [
            'transition-all duration-200 ease-out',
            'hover:shadow-xl hover:scale-[1.02] hover:border-white/30',
            'hover:-translate-y-1',
          ],
          
          pressable && [
            'cursor-pointer active:scale-[0.98] active:shadow-md',
            'transition-transform duration-100',
          ],
          
          // Dark mode adjustments
          'dark:bg-slate-800/50 dark:border-slate-700/50',
          
          className
        )}
      >
        {children}
      </div>
    )
  }
)

GlassCard.displayName = 'GlassCard'

export default GlassCard
