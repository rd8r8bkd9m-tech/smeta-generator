import { ReactNode } from 'react'
import clsx from 'clsx'

export interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'gradient' | 'premium' | 'purple' | 'outline'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  pulse?: boolean
  glow?: boolean
  icon?: ReactNode
  className?: string
}

const variantStyles = {
  default: [
    'bg-zinc-100 text-zinc-700',
    'dark:bg-zinc-800 dark:text-zinc-300',
    'border border-zinc-200/50 dark:border-zinc-700/50',
  ],
  success: [
    'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700',
    'dark:from-emerald-900/30 dark:to-teal-900/30 dark:text-emerald-400',
    'border border-emerald-200/50 dark:border-emerald-700/50',
  ],
  warning: [
    'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700',
    'dark:from-amber-900/30 dark:to-yellow-900/30 dark:text-amber-400',
    'border border-amber-200/50 dark:border-amber-700/50',
  ],
  error: [
    'bg-gradient-to-r from-rose-50 to-red-50 text-rose-700',
    'dark:from-rose-900/30 dark:to-red-900/30 dark:text-rose-400',
    'border border-rose-200/50 dark:border-rose-700/50',
  ],
  info: [
    'bg-gradient-to-r from-sky-50 to-blue-50 text-sky-700',
    'dark:from-sky-900/30 dark:to-blue-900/30 dark:text-sky-400',
    'border border-sky-200/50 dark:border-sky-700/50',
  ],
  gradient: [
    'bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white',
    'shadow-[0_2px_8px_rgba(249,115,22,0.35)]',
  ],
  premium: [
    'bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 text-white',
    'shadow-[0_2px_8px_rgba(139,92,246,0.35)]',
  ],
  purple: [
    'bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700',
    'dark:from-violet-900/30 dark:to-purple-900/30 dark:text-violet-400',
    'border border-violet-200/50 dark:border-violet-700/50',
  ],
  outline: [
    'bg-transparent text-zinc-600 dark:text-zinc-400',
    'border border-zinc-300 dark:border-zinc-600',
    'hover:bg-zinc-100 dark:hover:bg-zinc-800',
  ],
}

const sizeStyles = {
  xs: 'px-1.5 py-0.5 text-[10px] leading-tight',
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3.5 py-1.5 text-sm font-semibold',
}

const glowStyles = {
  default: '',
  success: 'shadow-[0_0_12px_rgba(16,185,129,0.4)]',
  warning: 'shadow-[0_0_12px_rgba(245,158,11,0.4)]',
  error: 'shadow-[0_0_12px_rgba(244,63,94,0.4)]',
  info: 'shadow-[0_0_12px_rgba(14,165,233,0.4)]',
  gradient: 'shadow-[0_0_16px_rgba(249,115,22,0.5)]',
  premium: 'shadow-[0_0_16px_rgba(139,92,246,0.5)]',
  purple: 'shadow-[0_0_12px_rgba(139,92,246,0.4)]',
  outline: '',
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  pulse = false,
  glow = false,
  icon,
  className,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        // Base styles
        'inline-flex items-center gap-1 font-medium rounded-full',
        'transition-all duration-200',
        
        // Variant styles
        variantStyles[variant],
        
        // Size styles
        sizeStyles[size],
        
        // Glow effect
        glow && glowStyles[variant],
        
        // Pulse animation
        pulse && 'animate-pulse-soft',
        
        className
      )}
    >
      {/* Pulse indicator dot */}
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
        </span>
      )}
      
      {/* Icon */}
      {icon && <span className="flex-shrink-0">{icon}</span>}
      
      {/* Content */}
      {children}
    </span>
  )
}

export default Badge
