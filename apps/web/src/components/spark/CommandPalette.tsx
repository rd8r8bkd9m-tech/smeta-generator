/**
 * Spark-style Command Palette
 * Quick access to AI features, actions, and navigation
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  Search,
  Sparkles,
  Calculator,
  FileText,
  FolderOpen,
  Users,
  Settings,
  Brain,
  Wand2,
  TrendingUp,
  DollarSign,
  Mic,
  Camera,
  BarChart2,
  Command,
  ArrowRight,
  Zap,
  Plus,
} from 'lucide-react'
import clsx from 'clsx'

interface CommandItem {
  id: string
  title: string
  subtitle?: string
  icon: typeof Search
  category: 'ai' | 'navigation' | 'action' | 'recent'
  shortcut?: string
  action: () => void
  gradient?: string
  badge?: string
}

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onNavigate?: (path: string) => void
  onAIAction?: (action: string) => void
}

export default function CommandPalette({
  isOpen,
  onClose,
  onNavigate,
  onAIAction,
}: CommandPaletteProps) {
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const commands: CommandItem[] = [
    // AI Commands
    {
      id: 'ai-generate',
      title: 'Создать смету с AI',
      subtitle: 'Опишите работы голосом или текстом',
      icon: Wand2,
      category: 'ai',
      shortcut: '⌘G',
      gradient: 'from-violet-500 to-purple-500',
      badge: 'AI',
      action: () => onAIAction?.('generate'),
    },
    {
      id: 'ai-analyze',
      title: 'Анализировать смету',
      subtitle: 'ML-анализ аномалий и оптимизации',
      icon: Brain,
      category: 'ai',
      shortcut: '⌘A',
      gradient: 'from-indigo-500 to-blue-500',
      badge: 'ML',
      action: () => onAIAction?.('analyze'),
    },
    {
      id: 'ai-predict',
      title: 'Прогноз цен',
      subtitle: 'Предсказание изменения цен',
      icon: TrendingUp,
      category: 'ai',
      gradient: 'from-emerald-500 to-teal-500',
      action: () => onAIAction?.('predict'),
    },
    {
      id: 'ai-optimize',
      title: 'Оптимизировать стоимость',
      subtitle: 'Найти экономию без потери качества',
      icon: DollarSign,
      category: 'ai',
      gradient: 'from-amber-500 to-orange-500',
      action: () => onAIAction?.('optimize'),
    },
    {
      id: 'ai-voice',
      title: 'Голосовой ввод',
      subtitle: 'Диктуйте описание работ',
      icon: Mic,
      category: 'ai',
      shortcut: '⌘M',
      gradient: 'from-rose-500 to-pink-500',
      action: () => onAIAction?.('voice'),
    },
    {
      id: 'ai-scan',
      title: 'Сканировать чертёж',
      subtitle: 'Распознать комнаты с плана',
      icon: Camera,
      category: 'ai',
      gradient: 'from-cyan-500 to-blue-500',
      action: () => onAIAction?.('scan'),
    },
    // Navigation
    {
      id: 'nav-calculator',
      title: 'Калькулятор',
      subtitle: 'Расчёт смет',
      icon: Calculator,
      category: 'navigation',
      shortcut: '⌘1',
      action: () => onNavigate?.('/calculator'),
    },
    {
      id: 'nav-projects',
      title: 'Проекты',
      subtitle: 'Управление проектами',
      icon: FolderOpen,
      category: 'navigation',
      shortcut: '⌘2',
      action: () => onNavigate?.('/projects'),
    },
    {
      id: 'nav-clients',
      title: 'Клиенты',
      subtitle: 'CRM система',
      icon: Users,
      category: 'navigation',
      shortcut: '⌘3',
      action: () => onNavigate?.('/clients'),
    },
    {
      id: 'nav-analytics',
      title: 'Аналитика',
      subtitle: 'Отчёты и графики',
      icon: BarChart2,
      category: 'navigation',
      action: () => onNavigate?.('/analytics'),
    },
    // Actions
    {
      id: 'action-new-project',
      title: 'Новый проект',
      subtitle: 'Создать проект',
      icon: Plus,
      category: 'action',
      shortcut: '⌘N',
      action: () => onAIAction?.('new-project'),
    },
    {
      id: 'action-export',
      title: 'Экспорт документов',
      subtitle: 'КС-2, КС-3, Excel',
      icon: FileText,
      category: 'action',
      action: () => onAIAction?.('export'),
    },
    {
      id: 'action-settings',
      title: 'Настройки',
      subtitle: 'Параметры приложения',
      icon: Settings,
      category: 'action',
      shortcut: '⌘,',
      action: () => onNavigate?.('/settings'),
    },
  ]

  const filteredCommands = commands.filter((cmd) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      cmd.title.toLowerCase().includes(searchLower) ||
      cmd.subtitle?.toLowerCase().includes(searchLower)
    )
  })

  const groupedCommands = {
    ai: filteredCommands.filter((c) => c.category === 'ai'),
    navigation: filteredCommands.filter((c) => c.category === 'navigation'),
    action: filteredCommands.filter((c) => c.category === 'action'),
  }

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((i) => Math.min(i + 1, filteredCommands.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((i) => Math.max(i - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action()
            onClose()
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedIndex, filteredCommands, onClose])

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setSearch('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Scroll selected item into view
  useEffect(() => {
    const listEl = listRef.current
    if (!listEl) return
    const selectedEl = listEl.querySelector(`[data-index="${selectedIndex}"]`)
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  const handleCommandClick = useCallback(
    (cmd: CommandItem) => {
      cmd.action()
      onClose()
    },
    [onClose]
  )

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Palette */}
      <div className="relative w-full max-w-2xl mx-4 animate-fade-in-scale">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          {/* Search Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500">
              <Command className="w-4 h-4 text-white" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setSelectedIndex(0)
              }}
              placeholder="Поиск команд, AI-функций, навигации..."
              className="flex-1 bg-transparent text-zinc-900 dark:text-white placeholder-zinc-400 outline-none text-base"
            />
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 rounded">
              ESC
            </kbd>
          </div>

          {/* Commands List */}
          <div ref={listRef} className="max-h-[400px] overflow-y-auto p-2">
            {filteredCommands.length === 0 ? (
              <div className="py-8 text-center">
                <Search className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-600 mb-3" />
                <p className="text-zinc-500 dark:text-zinc-400">Ничего не найдено</p>
              </div>
            ) : (
              <>
                {/* AI Section */}
                {groupedCommands.ai.length > 0 && (
                  <div className="mb-2">
                    <div className="flex items-center gap-2 px-3 py-2">
                      <Sparkles className="w-4 h-4 text-violet-500" />
                      <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                        AI & ML функции
                      </span>
                    </div>
                    {groupedCommands.ai.map((cmd) => {
                      const globalIdx = filteredCommands.indexOf(cmd)
                      return (
                        <CommandRow
                          key={cmd.id}
                          command={cmd}
                          isSelected={globalIdx === selectedIndex}
                          dataIndex={globalIdx}
                          onClick={() => handleCommandClick(cmd)}
                        />
                      )
                    })}
                  </div>
                )}

                {/* Navigation Section */}
                {groupedCommands.navigation.length > 0 && (
                  <div className="mb-2">
                    <div className="flex items-center gap-2 px-3 py-2">
                      <ArrowRight className="w-4 h-4 text-blue-500" />
                      <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                        Навигация
                      </span>
                    </div>
                    {groupedCommands.navigation.map((cmd) => {
                      const globalIdx = filteredCommands.indexOf(cmd)
                      return (
                        <CommandRow
                          key={cmd.id}
                          command={cmd}
                          isSelected={globalIdx === selectedIndex}
                          dataIndex={globalIdx}
                          onClick={() => handleCommandClick(cmd)}
                        />
                      )
                    })}
                  </div>
                )}

                {/* Actions Section */}
                {groupedCommands.action.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 px-3 py-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                        Быстрые действия
                      </span>
                    </div>
                    {groupedCommands.action.map((cmd) => {
                      const globalIdx = filteredCommands.indexOf(cmd)
                      return (
                        <CommandRow
                          key={cmd.id}
                          command={cmd}
                          isSelected={globalIdx === selectedIndex}
                          dataIndex={globalIdx}
                          onClick={() => handleCommandClick(cmd)}
                        />
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-4 text-xs text-zinc-500">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-700 rounded text-[10px]">↑↓</kbd>
                навигация
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-700 rounded text-[10px]">↵</kbd>
                выбрать
              </span>
            </div>
            <span className="text-xs text-zinc-400">
              ⌘K для открытия
            </span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

// Command Row Component
function CommandRow({
  command,
  isSelected,
  dataIndex,
  onClick,
}: {
  command: CommandItem
  isSelected: boolean
  dataIndex: number
  onClick: () => void
}) {
  const Icon = command.icon

  return (
    <button
      data-index={dataIndex}
      onClick={onClick}
      className={clsx(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all',
        isSelected
          ? 'bg-violet-50 dark:bg-violet-900/20 ring-1 ring-violet-200 dark:ring-violet-800'
          : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
      )}
    >
      <div
        className={clsx(
          'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
          command.gradient
            ? `bg-gradient-to-br ${command.gradient}`
            : 'bg-zinc-100 dark:bg-zinc-800'
        )}
      >
        <Icon className={clsx('w-5 h-5', command.gradient ? 'text-white' : 'text-zinc-500 dark:text-zinc-400')} />
      </div>

      <div className="flex-1 text-left min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-zinc-900 dark:text-white truncate">
            {command.title}
          </span>
          {command.badge && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-gradient-to-r from-violet-500 to-purple-500 text-white">
              {command.badge}
            </span>
          )}
        </div>
        {command.subtitle && (
          <span className="text-sm text-zinc-500 dark:text-zinc-400 truncate block">
            {command.subtitle}
          </span>
        )}
      </div>

      {command.shortcut && (
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-1 text-xs font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 rounded">
          {command.shortcut}
        </kbd>
      )}
    </button>
  )
}
