/**
 * Spark-style Feature Card
 * Premium feature showcase with animations
 */

import { ReactNode } from 'react'
import { ArrowRight, Zap } from 'lucide-react'
import clsx from 'clsx'

interface FeatureCardProps {
  title: string
  description: string
  icon: ReactNode
  gradient: string
  badge?: 'new' | 'ai' | 'popular' | 'pro'
  features?: string[]
  action?: {
    label: string
    onClick: () => void
  }
  size?: 'default' | 'large'
  className?: string
}

const badgeConfig = {
  new: {
    label: 'Новое',
    className: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  },
  ai: {
    label: 'AI',
    className: 'bg-gradient-to-r from-violet-500 to-purple-500 text-white',
  },
  popular: {
    label: 'Популярное',
    className: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  },
  pro: {
    label: 'PRO',
    className: 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white',
  },
}

export default function FeatureCard({
  title,
  description,
  icon,
  gradient,
  badge,
  features,
  action,
  size = 'default',
  className,
}: FeatureCardProps) {
  return (
    <div
      className={clsx(
        'group relative overflow-hidden rounded-2xl transition-all duration-300',
        'bg-white dark:bg-zinc-900',
        'border border-zinc-200 dark:border-zinc-800',
        'hover:border-zinc-300 dark:hover:border-zinc-700',
        'hover:shadow-2xl hover:shadow-zinc-200/50 dark:hover:shadow-zinc-900/50',
        size === 'large' && 'md:col-span-2',
        className
      )}
    >
      {/* Background Gradient */}
      <div
        className={clsx(
          'absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20',
          'group-hover:opacity-30 transition-opacity duration-500',
          `bg-gradient-to-br ${gradient}`
        )}
      />

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div
            className={clsx(
              'w-12 h-12 rounded-2xl flex items-center justify-center',
              'shadow-lg group-hover:scale-110 transition-transform duration-300',
              `bg-gradient-to-br ${gradient}`
            )}
          >
            {icon}
          </div>
          {badge && (
            <span
              className={clsx(
                'px-2 py-1 text-xs font-bold rounded-full',
                badgeConfig[badge].className
              )}
            >
              {badgeConfig[badge].label}
            </span>
          )}
        </div>

        {/* Content */}
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 leading-relaxed">
          {description}
        </p>

        {/* Features List */}
        {features && features.length > 0 && (
          <ul className="space-y-2 mb-4">
            {features.map((feature, index) => (
              <li
                key={index}
                className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        )}

        {/* Action */}
        {action && (
          <button
            onClick={action.onClick}
            className={clsx(
              'inline-flex items-center gap-2 text-sm font-medium',
              'text-violet-600 dark:text-violet-400',
              'hover:text-violet-700 dark:hover:text-violet-300',
              'transition-colors group/btn'
            )}
          >
            {action.label}
            <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
          </button>
        )}
      </div>

      {/* Hover Border Effect */}
      <div
        className={clsx(
          'absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300',
          'pointer-events-none',
          'bg-gradient-to-br from-transparent via-transparent to-transparent',
          'group-hover:bg-gradient-to-br group-hover:from-violet-500/5 group-hover:via-transparent group-hover:to-purple-500/5'
        )}
      />
    </div>
  )
}
