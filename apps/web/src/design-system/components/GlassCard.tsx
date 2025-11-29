import { ReactNode, forwardRef } from 'react'
import clsx from 'clsx'

export interface GlassCardProps {
  children: ReactNode
  variant?: 'light' | 'medium' | 'strong' | 'solid' | 'premium'
  gradient?: 'primary' | 'secondary' | 'accent' | 'success' | 'analytics' | 'purple' | 'none'
  hoverable?: boolean
  pressable?: boolean
  glow?: boolean
  animated?: boolean
  className?: string
  onClick?: () => void
}

// Premium variant styles with refined glassmorphism
const variantStyles = {
  light: [
    'bg-white/60 dark:bg-zinc-900/40',
    'backdrop-blur-xl backdrop-saturate-150',
    'border border-white/30 dark:border-white/10',
    'shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
  ],
  medium: [
    'bg-white/75 dark:bg-zinc-900/60',
    'backdrop-blur-2xl backdrop-saturate-180',
    'border border-white/40 dark:border-white/10',
    'shadow-[0_8px_40px_rgba(0,0,0,0.1),0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.5)]',
  ],
  strong: [
    'bg-white/85 dark:bg-zinc-900/75',
    'backdrop-blur-3xl backdrop-saturate-200',
    'border border-white/50 dark:border-white/15',
    'shadow-[0_12px_48px_rgba(0,0,0,0.12),0_6px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_12px_48px_rgba(0,0,0,0.6)]',
  ],
  solid: [
    'bg-white dark:bg-zinc-900',
    'border border-zinc-200/80 dark:border-zinc-800/80',
    'shadow-[0_4px_24px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)]',
  ],
  premium: [
    'bg-gradient-to-br from-white/80 via-white/70 to-white/60',
    'dark:bg-gradient-to-br dark:from-zinc-900/80 dark:via-zinc-900/70 dark:to-zinc-800/60',
    'backdrop-blur-3xl backdrop-saturate-200',
    'border border-white/50 dark:border-white/10',
    'shadow-[0_16px_64px_rgba(0,0,0,0.1),0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.5)]',
    'dark:shadow-[0_16px_64px_rgba(0,0,0,0.5),0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]',
  ],
}

// Gradient border effects using pseudo-elements
const gradientBorderStyles = {
  primary: 'before:bg-gradient-to-br before:from-orange-400 before:via-amber-500 before:to-yellow-400',
  secondary: 'before:bg-gradient-to-br before:from-rose-400 before:via-pink-500 before:to-fuchsia-500',
  accent: 'before:bg-gradient-to-br before:from-indigo-400 before:via-purple-500 before:to-pink-400',
  success: 'before:bg-gradient-to-br before:from-emerald-400 before:via-teal-500 before:to-cyan-400',
  analytics: 'before:bg-gradient-to-br before:from-sky-400 before:via-blue-500 before:to-indigo-400',
  purple: 'before:bg-gradient-to-br before:from-violet-400 before:via-purple-500 before:to-fuchsia-400',
  none: '',
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ 
    children, 
    variant = 'medium', 
    gradient = 'none', 
    hoverable = false, 
    pressable = false, 
    glow = false,
    animated = false,
    className, 
    onClick 
  }, ref) => {
    const hasGradient = gradient !== 'none'
    
    return (
      <div
        ref={ref}
        onClick={onClick}
        className={clsx(
          // Base styles - Premium rounded corners
          'relative rounded-2xl overflow-hidden',
          
          // Variant-specific styles
          variantStyles[variant],
          
          // Gradient border effect (using pseudo-element)
          hasGradient && [
            'before:absolute before:inset-0 before:rounded-2xl before:p-[1px]',
            'before:-z-10 before:opacity-40 before:transition-opacity before:duration-300',
            gradientBorderStyles[gradient],
          ],
          
          // Glow effect
          glow && 'animate-glow-pulse',
          
          // Animated background
          animated && 'animate-shimmer-premium',
          
          // Hoverable - Premium hover states
          hoverable && [
            'transition-all duration-300 ease-out',
            'hover:shadow-[0_20px_60px_rgba(0,0,0,0.15),0_10px_30px_rgba(0,0,0,0.1)]',
            'dark:hover:shadow-[0_20px_60px_rgba(0,0,0,0.6),0_10px_30px_rgba(0,0,0,0.4)]',
            'hover:border-white/60 dark:hover:border-white/20',
            'hover:-translate-y-1 hover:scale-[1.01]',
            hasGradient && 'hover:before:opacity-60',
          ],
          
          // Pressable - Tactile feedback
          pressable && [
            'cursor-pointer',
            'active:scale-[0.98] active:translate-y-0',
            'active:shadow-[0_4px_16px_rgba(0,0,0,0.08)]',
            'transition-transform duration-100',
          ],
          
          // Custom className
          className
        )}
      >
        {/* Inner highlight for depth */}
        <div className="absolute inset-0 rounded-2xl pointer-events-none">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/10" />
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    )
  }
)

GlassCard.displayName = 'GlassCard'

export default GlassCard
