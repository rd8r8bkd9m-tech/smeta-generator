/**
 * ML Insights Panel - Displays comprehensive ML analysis for estimates
 */

import { useState, useEffect } from 'react'
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb, 
  DollarSign,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Check,
  X
} from 'lucide-react'
import clsx from 'clsx'

interface PricePrediction {
  itemId: string
  currentPrice: number
  predictedPrice: number
  confidence: number
  trend: 'rising' | 'falling' | 'stable'
  forecastPeriod: number
}

interface Recommendation {
  itemId: string
  name: string
  score: number
  reason: string
  type: 'material' | 'work' | 'bundle'
  savingsPercent?: number
}

interface AnomalyResult {
  itemId: string
  isAnomaly: boolean
  anomalyScore: number
  expectedRange: { min: number; max: number }
  actualPrice: number
  suggestion: string
  anomalyType?: string
}

interface OptimizationResult {
  originalTotal: number
  optimizedTotal: number
  savings: number
  savingsPercent: number
  changes: Array<{
    itemId: string
    originalItem: string
    suggestedItem: string
    originalPrice: number
    suggestedPrice: number
    savings: number
    reason: string
  }>
  qualityImpact: 'none' | 'minimal' | 'moderate'
  recommendations: string[]
}

interface MLInsights {
  pricePredictions: PricePrediction[]
  recommendations: Recommendation[]
  anomalies: AnomalyResult[]
  optimization?: OptimizationResult
  generatedAt: string
}

interface MLInsightsPanelProps {
  items: Array<{
    id: string
    name: string
    category: string
    price: number
    quantity: number
  }>
  projectType: string
  region?: string
  budget?: number
  onApplyOptimization?: (changes: OptimizationResult['changes']) => void
  className?: string
}

export default function MLInsightsPanel({
  items,
  projectType,
  region,
  budget,
  onApplyOptimization,
  className,
}: MLInsightsPanelProps) {
  const [insights, setInsights] = useState<MLInsights | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedSection, setExpandedSection] = useState<string | null>('anomalies')

  const fetchInsights = async () => {
    if (items.length === 0) {
      setError('Добавьте позиции в смету для анализа')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/ml/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          projectType,
          region,
          budget,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setInsights(data.data)
      } else {
        setError(data.error || 'Ошибка анализа')
      }
    } catch {
      setError('Ошибка подключения к серверу')
    }

    setIsLoading(false)
  }

  useEffect(() => {
    if (items.length > 0) {
      fetchInsights()
    }
  }, [items.length, projectType, region, budget])

  const anomaliesCount = insights?.anomalies.filter(a => a.isAnomaly).length || 0
  const savingsAmount = insights?.optimization?.savings || 0

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  return (
    <div className={clsx('bg-white dark:bg-secondary-800 rounded-2xl shadow-lg overflow-hidden', className)}>
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-secondary-200 dark:border-secondary-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-secondary-900 dark:text-white">
                ML-Анализ сметы
              </h3>
              <p className="text-sm text-secondary-500 dark:text-secondary-400">
                {insights?.generatedAt 
                  ? `Обновлено: ${new Date(insights.generatedAt).toLocaleTimeString('ru-RU')}`
                  : 'Машинное обучение'}
              </p>
            </div>
          </div>
          <button
            onClick={fetchInsights}
            disabled={isLoading}
            className="p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={clsx('w-5 h-5 text-secondary-500', isLoading && 'animate-spin')} />
          </button>
        </div>

        {/* Quick stats */}
        {insights && (
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="text-center p-2 bg-secondary-50 dark:bg-secondary-700 rounded-lg">
              <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                {anomaliesCount}
              </p>
              <p className="text-xs text-secondary-500 dark:text-secondary-400">Аномалий</p>
            </div>
            <div className="text-center p-2 bg-secondary-50 dark:bg-secondary-700 rounded-lg">
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {savingsAmount > 0 ? `${(savingsAmount / 1000).toFixed(0)}К` : '—'}
              </p>
              <p className="text-xs text-secondary-500 dark:text-secondary-400">Экономия ₽</p>
            </div>
            <div className="text-center p-2 bg-secondary-50 dark:bg-secondary-700 rounded-lg">
              <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                {insights.recommendations.length}
              </p>
              <p className="text-xs text-secondary-500 dark:text-secondary-400">Советов</p>
            </div>
          </div>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 m-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl">
          <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="p-8 text-center">
          <Brain className="w-12 h-12 mx-auto text-indigo-500 animate-pulse mb-4" />
          <p className="text-secondary-600 dark:text-secondary-400">Анализирую данные...</p>
        </div>
      )}

      {/* Content */}
      {insights && !isLoading && (
        <div className="divide-y divide-secondary-200 dark:divide-secondary-700">
          {/* Anomalies Section */}
          <div>
            <button
              onClick={() => toggleSection('anomalies')}
              className="w-full p-4 flex items-center justify-between hover:bg-secondary-50 dark:hover:bg-secondary-700/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={clsx(
                  'w-8 h-8 rounded-lg flex items-center justify-center',
                  anomaliesCount > 0 
                    ? 'bg-rose-100 dark:bg-rose-900/30' 
                    : 'bg-emerald-100 dark:bg-emerald-900/30'
                )}>
                  <AlertTriangle className={clsx(
                    'w-4 h-4',
                    anomaliesCount > 0 ? 'text-rose-500' : 'text-emerald-500'
                  )} />
                </div>
                <div className="text-left">
                  <p className="font-medium text-secondary-900 dark:text-white">
                    Обнаружение аномалий
                  </p>
                  <p className="text-sm text-secondary-500 dark:text-secondary-400">
                    {anomaliesCount > 0 
                      ? `Найдено ${anomaliesCount} подозрительных позиций`
                      : 'Аномалий не обнаружено'}
                  </p>
                </div>
              </div>
              {expandedSection === 'anomalies' ? (
                <ChevronUp className="w-5 h-5 text-secondary-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-secondary-400" />
              )}
            </button>

            {expandedSection === 'anomalies' && anomaliesCount > 0 && (
              <div className="px-4 pb-4 space-y-2">
                {insights.anomalies
                  .filter(a => a.isAnomaly)
                  .map((anomaly, index) => {
                    const item = items.find(i => i.id === anomaly.itemId)
                    return (
                      <div
                        key={index}
                        className="p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-secondary-900 dark:text-white">
                              {item?.name || anomaly.itemId}
                            </p>
                            <p className="text-sm text-secondary-600 dark:text-secondary-400">
                              Цена: {anomaly.actualPrice.toLocaleString('ru-RU')} ₽
                              <span className="text-secondary-400 mx-1">•</span>
                              Ожидаемо: {anomaly.expectedRange.min.toLocaleString('ru-RU')} — {anomaly.expectedRange.max.toLocaleString('ru-RU')} ₽
                            </p>
                          </div>
                          <span className={clsx(
                            'px-2 py-1 text-xs font-medium rounded-full',
                            anomaly.anomalyType === 'price_high'
                              ? 'bg-rose-200 text-rose-700 dark:bg-rose-800 dark:text-rose-200'
                              : 'bg-amber-200 text-amber-700 dark:bg-amber-800 dark:text-amber-200'
                          )}>
                            {anomaly.anomalyType === 'price_high' ? 'Завышена' : 'Занижена'}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">
                          {anomaly.suggestion}
                        </p>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>

          {/* Optimization Section */}
          {insights.optimization && (
            <div>
              <button
                onClick={() => toggleSection('optimization')}
                className="w-full p-4 flex items-center justify-between hover:bg-secondary-50 dark:hover:bg-secondary-700/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-secondary-900 dark:text-white">
                      Оптимизация стоимости
                    </p>
                    <p className="text-sm text-secondary-500 dark:text-secondary-400">
                      Потенциальная экономия: {insights.optimization.savings.toLocaleString('ru-RU')} ₽ ({insights.optimization.savingsPercent}%)
                    </p>
                  </div>
                </div>
                {expandedSection === 'optimization' ? (
                  <ChevronUp className="w-5 h-5 text-secondary-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-secondary-400" />
                )}
              </button>

              {expandedSection === 'optimization' && (
                <div className="px-4 pb-4 space-y-3">
                  {/* Summary */}
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-secondary-600 dark:text-secondary-400">Текущая стоимость:</span>
                      <span className="font-medium text-secondary-900 dark:text-white">
                        {insights.optimization.originalTotal.toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-secondary-600 dark:text-secondary-400">После оптимизации:</span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">
                        {insights.optimization.optimizedTotal.toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-emerald-200 dark:border-emerald-800">
                      <span className="font-medium text-secondary-900 dark:text-white">Экономия:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {insights.optimization.savings.toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                  </div>

                  {/* Changes */}
                  {insights.optimization.changes.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                        Предлагаемые замены:
                      </p>
                      {insights.optimization.changes.map((change, index) => (
                        <div
                          key={index}
                          className="p-3 bg-secondary-50 dark:bg-secondary-700 rounded-lg"
                        >
                          <div className="flex items-center gap-2 text-sm">
                            <X className="w-4 h-4 text-rose-500" />
                            <span className="text-secondary-600 dark:text-secondary-400 line-through">
                              {change.originalItem}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm mt-1">
                            <Check className="w-4 h-4 text-emerald-500" />
                            <span className="text-secondary-900 dark:text-white">
                              {change.suggestedItem}
                            </span>
                            <span className="ml-auto text-emerald-600 dark:text-emerald-400 font-medium">
                              −{change.savings.toLocaleString('ru-RU')} ₽
                            </span>
                          </div>
                          <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
                            {change.reason}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Apply button */}
                  {insights.optimization.changes.length > 0 && onApplyOptimization && (
                    <button
                      onClick={() => onApplyOptimization(insights.optimization!.changes)}
                      className="w-full py-2 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors"
                    >
                      Применить оптимизацию
                    </button>
                  )}

                  {/* Recommendations */}
                  {insights.optimization.recommendations.length > 0 && (
                    <div className="pt-3 border-t border-secondary-200 dark:border-secondary-600">
                      <p className="text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                        Дополнительные рекомендации:
                      </p>
                      <ul className="space-y-1">
                        {insights.optimization.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-secondary-600 dark:text-secondary-400">
                            <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Price Trends Section */}
          <div>
            <button
              onClick={() => toggleSection('trends')}
              className="w-full p-4 flex items-center justify-between hover:bg-secondary-50 dark:hover:bg-secondary-700/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-secondary-900 dark:text-white">
                    Прогноз цен
                  </p>
                  <p className="text-sm text-secondary-500 dark:text-secondary-400">
                    {insights.pricePredictions.length} позиций проанализировано
                  </p>
                </div>
              </div>
              {expandedSection === 'trends' ? (
                <ChevronUp className="w-5 h-5 text-secondary-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-secondary-400" />
              )}
            </button>

            {expandedSection === 'trends' && insights.pricePredictions.length > 0 && (
              <div className="px-4 pb-4 space-y-2">
                {insights.pricePredictions.slice(0, 5).map((prediction, index) => {
                  const item = items.find(i => i.id === prediction.itemId)
                  const change = ((prediction.predictedPrice - prediction.currentPrice) / prediction.currentPrice) * 100
                  
                  return (
                    <div
                      key={index}
                      className="p-3 bg-secondary-50 dark:bg-secondary-700 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-secondary-900 dark:text-white truncate">
                          {item?.name || prediction.itemId}
                        </span>
                        <span className={clsx(
                          'text-sm font-medium',
                          change > 0 ? 'text-rose-500' : change < 0 ? 'text-emerald-500' : 'text-secondary-500'
                        )}>
                          {change > 0 ? '+' : ''}{change.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-secondary-600 dark:text-secondary-400 mt-1">
                        <span>Сейчас: {prediction.currentPrice.toLocaleString('ru-RU')} ₽</span>
                        <span>→ {prediction.predictedPrice.toLocaleString('ru-RU')} ₽</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1 bg-secondary-200 dark:bg-secondary-600 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${prediction.confidence}%` }}
                          />
                        </div>
                        <span className="text-xs text-secondary-500">{prediction.confidence}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
