import { useState, useRef, useEffect } from 'react'
import clsx from 'clsx'
import { LucideIcon } from 'lucide-react'

export interface FABAction {
  icon: LucideIcon
  label: string
  onClick: () => void
  gradient?: string
}

export interface FABProps {
  icon: LucideIcon
  actions?: FABAction[]
  expandDirection?: 'up' | 'down'
  className?: string
  onClick?: () => void
}

export function FAB({
  icon: MainIcon,
  actions = [],
  expandDirection = 'up',
  className,
  onClick,
}: FABProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMainClick = () => {
    if (actions.length > 0) {
      setIsExpanded(!isExpanded)
    } else {
      onClick?.()
    }
  }

  const handleActionClick = (action: FABAction) => {
    action.onClick()
    setIsExpanded(false)
  }

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false)
      }
    }

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isExpanded])

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsExpanded(false)
      }
    }

    if (isExpanded) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isExpanded])

  const actionPositions = expandDirection === 'up' 
    ? actions.map((_, i) => ({ bottom: `${(i + 1) * 64}px` }))
    : actions.map((_, i) => ({ top: `${(i + 1) * 64}px` }))

  return (
    <div ref={containerRef} className={clsx('relative', className)}>
      {/* Action buttons */}
      {actions.map((action, index) => {
        const ActionIcon = action.icon
        return (
          <div
            key={index}
            className={clsx(
              'absolute left-1/2 -translate-x-1/2 transition-all duration-300 ease-out',
              isExpanded ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'
            )}
            style={{
              ...actionPositions[index],
              transitionDelay: isExpanded ? `${index * 50}ms` : '0ms',
            }}
          >
            <button
              onClick={() => handleActionClick(action)}
              className={clsx(
                'group flex items-center gap-3 rounded-full pr-4 pl-3 py-2',
                'bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl',
                'border border-gray-200 dark:border-gray-700',
                'transition-all duration-200',
                'hover:scale-105'
              )}
              aria-label={action.label}
            >
              <div className={clsx(
                'w-10 h-10 rounded-full flex items-center justify-center',
                'bg-gradient-to-br from-orange-500 to-amber-500 text-white',
              )}>
                <ActionIcon className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap">
                {action.label}
              </span>
            </button>
          </div>
        )
      })}

      {/* Main FAB button */}
      <button
        onClick={handleMainClick}
        className={clsx(
          'relative w-14 h-14 rounded-full shadow-lg',
          'bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400',
          'text-white flex items-center justify-center',
          'transition-all duration-300 ease-out',
          'hover:shadow-xl hover:scale-110',
          'active:scale-95',
          'focus:outline-none focus:ring-4 focus:ring-orange-500/30',
          isExpanded && 'rotate-45'
        )}
        aria-label={isExpanded ? 'Close menu' : 'Open menu'}
        aria-expanded={isExpanded}
      >
        <MainIcon className="w-6 h-6 transition-transform duration-300" />
        
        {/* Glow effect */}
        <div className={clsx(
          'absolute inset-0 rounded-full',
          'bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400',
          'opacity-40 blur-xl -z-10',
          'transition-opacity duration-300',
          isExpanded && 'opacity-60'
        )} />
      </button>
    </div>
  )
}

export default FAB
