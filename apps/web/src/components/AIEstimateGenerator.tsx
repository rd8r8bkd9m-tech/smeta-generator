import { useState, useCallback } from 'react'
import { Sparkles, Loader2, AlertCircle, Wand2 } from 'lucide-react'
import { GlassCard } from '../design-system/components'
import clsx from 'clsx'
import type { GeneratedEstimate } from '../types/estimate'

interface AIEstimateGeneratorProps {
  onEstimateGenerated: (estimate: GeneratedEstimate) => void
  className?: string
}

export default function AIEstimateGenerator({ onEstimateGenerated, className }: AIEstimateGeneratorProps) {
  const [description, setDescription] = useState('')
  const [estimateType, setEstimateType] = useState<'FER' | 'COMMERCIAL' | 'MIXED'>('COMMERCIAL')
  const [area, setArea] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = useCallback(async () => {
    if (!description.trim() || description.length < 10) {
      setError('Пожалуйста, введите более подробное описание работ (минимум 10 символов)')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: description.trim(),
          estimateType,
          area: area ? parseFloat(area) : undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || errorData.error || 'Failed to generate estimate')
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        onEstimateGenerated(result.data)
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (err) {
      console.error('Error generating estimate:', err)
      setError(err instanceof Error ? err.message : 'Произошла ошибка при генерации сметы')
    } finally {
      setIsGenerating(false)
    }
  }, [description, estimateType, area, onEstimateGenerated])

  const examplePrompts = [
    'Ремонт квартиры 60м², штукатурка стен, покраска, укладка ламината',
    'Капитальный ремонт ванной комнаты 6м², плитка на пол и стены',
    'Отделка офиса 100м², покраска стен, монтаж подвесного потолка',
  ]

  return (
    <GlassCard className={clsx('p-6', className)}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-amber-500 rounded-xl flex items-center justify-center">
          <Wand2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">
            AI-генератор сметы
          </h2>
          <p className="text-sm text-secondary-500 dark:text-secondary-400">
            Опишите работы, и AI создаст смету на основе базы нормативов
          </p>
        </div>
      </div>

      {/* Description Input */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
            Описание работ
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Например: Ремонт квартиры 60м², штукатурка стен, покраска, укладка ламината"
            className={clsx(
              'w-full px-4 py-3 rounded-xl border resize-none h-32',
              'bg-white dark:bg-secondary-800',
              'border-secondary-200 dark:border-secondary-700',
              'text-secondary-900 dark:text-white placeholder-secondary-400',
              'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
              'transition-all duration-200'
            )}
          />
        </div>

        {/* Example prompts */}
        <div>
          <span className="text-xs text-secondary-500 dark:text-secondary-400 mb-2 block">
            Примеры:
          </span>
          <div className="flex flex-wrap gap-2">
            {examplePrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => setDescription(prompt)}
                className={clsx(
                  'text-xs px-3 py-1.5 rounded-lg',
                  'bg-secondary-100 dark:bg-secondary-800',
                  'text-secondary-600 dark:text-secondary-400',
                  'hover:bg-secondary-200 dark:hover:bg-secondary-700',
                  'transition-colors duration-200'
                )}
              >
                {prompt.slice(0, 40)}...
              </button>
            ))}
          </div>
        </div>

        {/* Options Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Estimate Type */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
              Тип сметы
            </label>
            <select
              value={estimateType}
              onChange={(e) => setEstimateType(e.target.value as 'FER' | 'COMMERCIAL' | 'MIXED')}
              className={clsx(
                'w-full px-4 py-2.5 rounded-xl border',
                'bg-white dark:bg-secondary-800',
                'border-secondary-200 dark:border-secondary-700',
                'text-secondary-900 dark:text-white',
                'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500'
              )}
            >
              <option value="COMMERCIAL">Коммерческая (редактируемые цены)</option>
              <option value="FER">ФЕР (официальные цены)</option>
              <option value="MIXED">Смешанная</option>
            </select>
          </div>

          {/* Area Override */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
              Площадь (м²) <span className="text-secondary-400">(опционально)</span>
            </label>
            <input
              type="number"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Автоопределение"
              className={clsx(
                'w-full px-4 py-2.5 rounded-xl border',
                'bg-white dark:bg-secondary-800',
                'border-secondary-200 dark:border-secondary-700',
                'text-secondary-900 dark:text-white placeholder-secondary-400',
                'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500'
              )}
              min="1"
              step="0.1"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-2 p-4 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-200 dark:border-rose-800">
            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-rose-700 dark:text-rose-400">{error}</p>
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !description.trim()}
          className={clsx(
            'w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium',
            'bg-gradient-to-r from-primary-500 to-amber-500',
            'text-white shadow-lg shadow-primary-500/25',
            'hover:shadow-xl hover:shadow-primary-500/30',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg',
            'transition-all duration-200'
          )}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Генерация сметы...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Сгенерировать смету</span>
            </>
          )}
        </button>

        {/* Info */}
        <p className="text-xs text-secondary-500 dark:text-secondary-400 text-center">
          AI анализирует описание и подбирает позиции из базы нормативов ФЕР/ГЭСН. 
          Цены берутся 100% из базы данных.
        </p>
      </div>
    </GlassCard>
  )
}
