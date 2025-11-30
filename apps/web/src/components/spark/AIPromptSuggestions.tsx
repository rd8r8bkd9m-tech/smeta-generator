/**
 * Spark-style AI Prompt Suggestions
 * Contextual prompts and quick actions for AI features
 */

import { useState } from 'react'
import {
  Sparkles,
  Building,
  Home,
  Briefcase,
  Wrench,
  ArrowRight,
  Lightbulb,
  Zap,
  TrendingUp,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import clsx from 'clsx'

interface PromptSuggestion {
  id: string
  text: string
  category: string
  icon: typeof Sparkles
  gradient: string
  popular?: boolean
  new?: boolean
}

interface AIPromptSuggestionsProps {
  onSelectPrompt: (prompt: string) => void
  recentPrompts?: string[]
  className?: string
}

const promptCategories = [
  { id: 'apartment', label: 'Квартира', icon: Home },
  { id: 'house', label: 'Дом', icon: Building },
  { id: 'office', label: 'Офис', icon: Briefcase },
  { id: 'commercial', label: 'Коммерция', icon: Wrench },
]

const suggestedPrompts: PromptSuggestion[] = [
  // Popular prompts
  {
    id: 'apt-cosmo',
    text: 'Косметический ремонт квартиры 50м²: покраска стен, укладка ламината, замена плинтусов',
    category: 'apartment',
    icon: Home,
    gradient: 'from-blue-500 to-cyan-500',
    popular: true,
  },
  {
    id: 'apt-full',
    text: 'Капитальный ремонт однокомнатной квартиры 40м² под ключ: стяжка, штукатурка, электрика, сантехника',
    category: 'apartment',
    icon: Home,
    gradient: 'from-violet-500 to-purple-500',
    popular: true,
  },
  {
    id: 'apt-bath',
    text: 'Ремонт ванной комнаты 6м²: укладка плитки, установка сантехники, натяжной потолок',
    category: 'apartment',
    icon: Home,
    gradient: 'from-cyan-500 to-blue-500',
    new: true,
  },
  {
    id: 'apt-kitchen',
    text: 'Ремонт кухни 12м²: выравнивание стен, укладка фартука, монтаж вытяжки',
    category: 'apartment',
    icon: Home,
    gradient: 'from-orange-500 to-amber-500',
  },
  // House prompts
  {
    id: 'house-facade',
    text: 'Отделка фасада частного дома 150м²: утепление, штукатурка, покраска',
    category: 'house',
    icon: Building,
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'house-roof',
    text: 'Монтаж кровли дома 120м²: металлочерепица, утепление, водосток',
    category: 'house',
    icon: Building,
    gradient: 'from-amber-500 to-yellow-500',
  },
  // Office prompts
  {
    id: 'office-open',
    text: 'Ремонт офиса open-space 200м²: перегородки, потолок армстронг, ковролин',
    category: 'office',
    icon: Briefcase,
    gradient: 'from-indigo-500 to-blue-500',
  },
  // Commercial
  {
    id: 'comm-shop',
    text: 'Отделка магазина 80м²: витрины, освещение, напольное покрытие',
    category: 'commercial',
    icon: Wrench,
    gradient: 'from-pink-500 to-rose-500',
  },
]

export default function AIPromptSuggestions({
  onSelectPrompt,
  recentPrompts = [],
  className,
}: AIPromptSuggestionsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [hoveredPrompt, setHoveredPrompt] = useState<string | null>(null)

  const filteredPrompts = selectedCategory
    ? suggestedPrompts.filter((p) => p.category === selectedCategory)
    : suggestedPrompts.filter((p) => p.popular || p.new)

  return (
    <div className={clsx('space-y-6', className)}>
      {/* Header with gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-pink-500/10 dark:from-violet-500/20 dark:via-purple-500/20 dark:to-pink-500/20 p-6 border border-violet-200/50 dark:border-violet-800/50">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-500/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        
        <div className="relative flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1">
              AI-подсказки
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Выберите готовый шаблон или создайте свой запрос
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-zinc-500">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            Совет: чем подробнее описание, тем точнее смета
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
            !selectedCategory
              ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 ring-2 ring-violet-500/30'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
          )}
        >
          <Zap className="w-4 h-4" />
          Популярные
        </button>
        {promptCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
              selectedCategory === cat.id
                ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 ring-2 ring-violet-500/30'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            )}
          >
            <cat.icon className="w-4 h-4" />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Recent Prompts */}
      {recentPrompts.length > 0 && !selectedCategory && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            <Clock className="w-4 h-4" />
            Недавние запросы
          </div>
          <div className="space-y-2">
            {recentPrompts.slice(0, 3).map((prompt, index) => (
              <button
                key={index}
                onClick={() => onSelectPrompt(prompt)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-zinc-500" />
                </div>
                <span className="flex-1 text-sm text-zinc-700 dark:text-zinc-300 truncate">
                  {prompt}
                </span>
                <ArrowRight className="w-4 h-4 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Prompt Grid */}
      <div className="grid md:grid-cols-2 gap-3">
        {filteredPrompts.map((prompt) => {
          const Icon = prompt.icon
          const isHovered = hoveredPrompt === prompt.id

          return (
            <button
              key={prompt.id}
              onClick={() => onSelectPrompt(prompt.text)}
              onMouseEnter={() => setHoveredPrompt(prompt.id)}
              onMouseLeave={() => setHoveredPrompt(null)}
              className={clsx(
                'relative flex items-start gap-3 p-4 rounded-2xl text-left transition-all',
                'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800',
                'hover:border-violet-300 dark:hover:border-violet-700',
                'hover:shadow-lg hover:shadow-violet-500/5',
                'group'
              )}
            >
              {/* Icon */}
              <div
                className={clsx(
                  'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all',
                  `bg-gradient-to-br ${prompt.gradient}`,
                  isHovered && 'scale-110 shadow-lg'
                )}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {prompt.popular && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                      Популярное
                    </span>
                  )}
                  {prompt.new && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                      Новое
                    </span>
                  )}
                </div>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 line-clamp-2">
                  {prompt.text}
                </p>
              </div>

              {/* Hover Arrow */}
              <ArrowRight
                className={clsx(
                  'w-5 h-5 text-violet-500 flex-shrink-0 transition-all',
                  isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
                )}
              />
            </button>
          )
        })}
      </div>

      {/* Quick Tips */}
      <div className="flex flex-wrap gap-4 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-200/50 dark:border-amber-800/50">
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span className="text-zinc-600 dark:text-zinc-400">Укажите площадь</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span className="text-zinc-600 dark:text-zinc-400">Опишите виды работ</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span className="text-zinc-600 dark:text-zinc-400">Уточните материалы</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <TrendingUp className="w-4 h-4 text-blue-500" />
          <span className="text-zinc-600 dark:text-zinc-400">AI подберёт лучшие цены</span>
        </div>
      </div>
    </div>
  )
}
