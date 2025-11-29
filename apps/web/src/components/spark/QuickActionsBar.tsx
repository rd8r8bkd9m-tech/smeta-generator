/**
 * Spark-style Quick Actions Bar
 * Floating action bar with AI shortcuts
 */

import { useState } from 'react'
import {
  Sparkles,
  Wand2,
  Mic,
  Camera,
  DollarSign,
  Brain,
  ChevronUp,
  ChevronDown,
  Command,
} from 'lucide-react'
import clsx from 'clsx'

interface QuickAction {
  id: string
  label: string
  icon: typeof Sparkles
  gradient: string
  shortcut?: string
  badge?: string
}

interface QuickActionsBarProps {
  onAction: (actionId: string) => void
  onCommandPalette: () => void
  position?: 'bottom-left' | 'bottom-center' | 'bottom-right'
  className?: string
}

const quickActions: QuickAction[] = [
  {
    id: 'generate',
    label: 'AI Смета',
    icon: Wand2,
    gradient: 'from-violet-500 to-purple-500',
    badge: 'AI',
  },
  {
    id: 'voice',
    label: 'Голос',
    icon: Mic,
    gradient: 'from-rose-500 to-pink-500',
  },
  {
    id: 'scan',
    label: 'Скан',
    icon: Camera,
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    id: 'analyze',
    label: 'Анализ',
    icon: Brain,
    gradient: 'from-indigo-500 to-blue-500',
    badge: 'ML',
  },
  {
    id: 'optimize',
    label: 'Экономия',
    icon: DollarSign,
    gradient: 'from-emerald-500 to-teal-500',
  },
]

export default function QuickActionsBar({
  onAction,
  onCommandPalette,
  position = 'bottom-center',
  className,
}: QuickActionsBarProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [hoveredAction, setHoveredAction] = useState<string | null>(null)

  const positionClasses = {
    'bottom-left': 'left-4 bottom-4',
    'bottom-center': 'left-1/2 -translate-x-1/2 bottom-4',
    'bottom-right': 'right-4 bottom-4',
  }

  return (
    <div
      className={clsx(
        'fixed z-40',
        positionClasses[position],
        className
      )}
    >
      <div className="relative">
        {/* Main Bar */}
        <div
          className={clsx(
            'flex items-center gap-1 p-1.5 rounded-2xl',
            'bg-white/80 dark:bg-zinc-900/80',
            'backdrop-blur-xl',
            'border border-zinc-200/50 dark:border-zinc-800/50',
            'shadow-2xl shadow-black/10',
            'transition-all duration-300',
            !isExpanded && 'opacity-90'
          )}
        >
          {/* Command Palette Trigger */}
          <button
            onClick={onCommandPalette}
            data-onboarding="quick-actions"
            className={clsx(
              'flex items-center justify-center w-11 h-11 rounded-xl transition-all',
              'bg-gradient-to-br from-violet-500 to-purple-500',
              'text-white shadow-lg shadow-violet-500/30',
              'hover:scale-105 hover:shadow-violet-500/40',
              'active:scale-95'
            )}
          >
            <Command className="w-5 h-5" />
          </button>

          {/* Divider */}
          <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-700 mx-1" />

          {/* Quick Actions */}
          {isExpanded && (
            <div className="flex items-center gap-1">
              {quickActions.map((action) => {
                const Icon = action.icon
                const isHovered = hoveredAction === action.id

                return (
                  <div key={action.id} className="relative">
                    <button
                      onClick={() => onAction(action.id)}
                      onMouseEnter={() => setHoveredAction(action.id)}
                      onMouseLeave={() => setHoveredAction(null)}
                      className={clsx(
                        'relative flex items-center justify-center w-11 h-11 rounded-xl transition-all',
                        `bg-gradient-to-br ${action.gradient}`,
                        'text-white',
                        'hover:scale-105 hover:shadow-lg',
                        'active:scale-95'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      {action.badge && (
                        <span className="absolute -top-1 -right-1 px-1 text-[9px] font-bold rounded bg-white dark:bg-zinc-900 text-violet-600 dark:text-violet-400 shadow">
                          {action.badge}
                        </span>
                      )}
                    </button>

                    {/* Tooltip */}
                    {isHovered && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap">
                        <div className="px-2 py-1 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-medium shadow-lg">
                          {action.label}
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-zinc-900 dark:border-t-zinc-100" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Expand/Collapse Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={clsx(
              'flex items-center justify-center w-8 h-8 rounded-lg',
              'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300',
              'hover:bg-zinc-100 dark:hover:bg-zinc-800',
              'transition-all'
            )}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Keyboard shortcut hint */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-zinc-400 whitespace-nowrap">
          Нажмите <kbd className="px-1 py-0.5 bg-zinc-200 dark:bg-zinc-700 rounded">⌘K</kbd> для поиска
        </div>
      </div>
    </div>
  )
}
