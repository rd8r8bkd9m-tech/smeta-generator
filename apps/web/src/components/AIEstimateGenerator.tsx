import { useState, useCallback, useEffect, useRef } from 'react'
import { Sparkles, Loader2, AlertCircle, Wand2, Mic, MicOff, History, X, Building, Home, Briefcase, Wrench } from 'lucide-react'
import { GlassCard } from '../design-system/components'
import clsx from 'clsx'
import type { GeneratedEstimate } from '../types/estimate'

// SpeechRecognition types for browser API
interface SpeechRecognitionResult {
  0: { transcript: string }
  isFinal: boolean
}

interface SpeechRecognitionResultList {
  length: number
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionInterface extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: Event) => void) | null
  onend: (() => void) | null
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInterface
    webkitSpeechRecognition: new () => SpeechRecognitionInterface
  }
}

interface AIEstimateGeneratorProps {
  onEstimateGenerated: (estimate: GeneratedEstimate) => void
  className?: string
}

// Project type presets
const projectPresets = [
  { id: 'apartment', label: 'Квартира', icon: Home, prompts: ['Ремонт квартиры', 'Косметический ремонт квартиры', 'Капитальный ремонт квартиры'] },
  { id: 'house', label: 'Дом', icon: Building, prompts: ['Ремонт частного дома', 'Строительство дома', 'Отделка дома'] },
  { id: 'office', label: 'Офис', icon: Briefcase, prompts: ['Ремонт офиса', 'Отделка офисного помещения', 'Перепланировка офиса'] },
  { id: 'commercial', label: 'Комм.', icon: Wrench, prompts: ['Ремонт коммерческого помещения', 'Отделка магазина', 'Ремонт склада'] },
]

// Max history items
const MAX_HISTORY = 5

export default function AIEstimateGenerator({ onEstimateGenerated, className }: AIEstimateGeneratorProps) {
  const [description, setDescription] = useState('')
  const [estimateType, setEstimateType] = useState<'FER' | 'COMMERCIAL' | 'MIXED'>('COMMERCIAL')
  const [area, setArea] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<string[]>([])
  const recognitionRef = useRef<SpeechRecognitionInterface | null>(null)
  
  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('ai-estimate-history')
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory))
      } catch {
        // Invalid JSON, ignore
      }
    }
  }, [])

  // Save to history
  const saveToHistory = useCallback((text: string) => {
    setHistory(prev => {
      const newHistory = [text, ...prev.filter(h => h !== text)].slice(0, MAX_HISTORY)
      localStorage.setItem('ai-estimate-history', JSON.stringify(newHistory))
      return newHistory
    })
  }, [])

  // Clear history
  const clearHistory = useCallback(() => {
    setHistory([])
    localStorage.removeItem('ai-estimate-history')
  }, [])

  // Voice recognition setup
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognitionClass()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'ru-RU'

      recognitionRef.current.onresult = (event) => {
        let transcript = ''
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript
        }
        setDescription(prev => prev + ' ' + transcript)
      }

      recognitionRef.current.onerror = () => {
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const toggleVoiceInput = useCallback(() => {
    if (!recognitionRef.current) {
      setError('Голосовой ввод не поддерживается в вашем браузере')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
      setError(null)
    }
  }, [isListening])

  const handleGenerate = useCallback(async () => {
    if (!description.trim() || description.length < 10) {
      setError('Пожалуйста, введите более подробное описание работ (минимум 10 символов)')
      return
    }

    setIsGenerating(true)
    setError(null)

    // Save to history
    saveToHistory(description.trim())

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
        const errorData = await response.json().catch(() => ({}))
        
        // Provide user-friendly error messages based on status code
        switch (response.status) {
          case 400:
            throw new Error(errorData.message || 'Некорректные данные. Пожалуйста, проверьте ввод.')
          case 401:
            throw new Error('Требуется авторизация')
          case 503:
            throw new Error(errorData.message || 'Сервис AI временно недоступен. Попробуйте позже.')
          case 500:
            throw new Error('Ошибка сервера. Пожалуйста, попробуйте позже.')
          default:
            throw new Error(errorData.message || errorData.error || 'Не удалось сгенерировать смету')
        }
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        onEstimateGenerated(result.data)
      } else {
        throw new Error('Получен некорректный ответ от сервера')
      }
    } catch (err) {
      console.error('Error generating estimate:', err)
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Ошибка сети. Проверьте подключение к интернету.')
      } else {
        setError(err instanceof Error ? err.message : 'Произошла ошибка при генерации сметы')
      }
    } finally {
      setIsGenerating(false)
    }
  }, [description, estimateType, area, onEstimateGenerated, saveToHistory])

  const handlePresetSelect = useCallback((presetId: string) => {
    const preset = projectPresets.find(p => p.id === presetId)
    if (preset) {
      setSelectedPreset(presetId)
      setDescription(preset.prompts[0] + ' ')
    }
  }, [])

  return (
    <GlassCard className={clsx('p-6', className)}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-amber-500 rounded-xl flex items-center justify-center">
            <Wand2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">
              AI-генератор сметы
            </h2>
            <p className="text-sm text-secondary-500 dark:text-secondary-400">
              Опишите работы голосом или текстом
            </p>
          </div>
        </div>
        {/* History button */}
        {history.length > 0 && (
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={clsx(
              'p-2 rounded-lg transition-colors',
              showHistory 
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' 
                : 'text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800'
            )}
            title="История запросов"
          >
            <History className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* History Panel */}
      {showHistory && history.length > 0 && (
        <div className="mb-4 p-3 rounded-xl bg-secondary-50 dark:bg-secondary-800/50 border border-secondary-100 dark:border-secondary-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-secondary-600 dark:text-secondary-400">
              История запросов
            </span>
            <button
              onClick={clearHistory}
              className="text-xs text-rose-500 hover:text-rose-600"
            >
              Очистить
            </button>
          </div>
          <div className="space-y-1">
            {history.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  setDescription(item)
                  setShowHistory(false)
                }}
                className="w-full text-left text-sm p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors truncate text-secondary-700 dark:text-secondary-300"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Project Type Presets */}
      <div className="mb-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {projectPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetSelect(preset.id)}
              className={clsx(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
                selectedPreset === preset.id
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 border-2 border-primary-500'
                  : 'bg-secondary-100 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-400 border-2 border-transparent hover:border-secondary-300 dark:hover:border-secondary-600'
              )}
            >
              <preset.icon className="w-4 h-4" />
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Description Input */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
              Описание работ
            </label>
            {/* Voice Input Button */}
            <button
              onClick={toggleVoiceInput}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                isListening
                  ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 animate-pulse'
                  : 'bg-secondary-100 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-400 hover:bg-secondary-200 dark:hover:bg-secondary-700'
              )}
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4" />
                  Остановить
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  Голос
                </>
              )}
            </button>
          </div>
          <div className="relative">
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
                'transition-all duration-200',
                isListening && 'border-rose-500 ring-2 ring-rose-500/20'
              )}
            />
            {description && (
              <button
                onClick={() => setDescription('')}
                className="absolute top-3 right-3 p-1 text-secondary-400 hover:text-secondary-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {isListening && (
            <div className="flex items-center gap-2 mt-2 text-sm text-rose-500">
              <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
              Говорите... AI слушает
            </div>
          )}
        </div>

        {/* Quick Suggestions based on preset */}
        {selectedPreset && (
          <div>
            <span className="text-xs text-secondary-500 dark:text-secondary-400 mb-2 block">
              Быстрые шаблоны:
            </span>
            <div className="flex flex-wrap gap-2">
              {projectPresets.find(p => p.id === selectedPreset)?.prompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setDescription(prompt + ', ')}
                  className={clsx(
                    'text-xs px-3 py-1.5 rounded-lg',
                    'bg-primary-50 dark:bg-primary-900/20',
                    'text-primary-600 dark:text-primary-400',
                    'hover:bg-primary-100 dark:hover:bg-primary-900/30',
                    'transition-colors duration-200'
                  )}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

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
