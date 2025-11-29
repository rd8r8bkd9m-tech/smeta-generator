import { useState, useCallback, useRef } from 'react'
import { 
  Camera, 
  Upload, 
  TrendingUp, 
  Lightbulb, 
  BarChart2, 
  AlertTriangle,
  ChevronRight,
  X,
  Loader2,
  MapPin,
  Calendar,
  DollarSign,
  ArrowUp,
  ArrowDown,
  Minus,
  Sparkles
} from 'lucide-react'
import { GlassCard, Badge } from '../design-system/components'
import clsx from 'clsx'

interface PricePrediction {
  itemId: string
  itemName: string
  currentPrice: number
  predictedPrice: number
  priceChange: number
  confidence: number
  factors: Array<{
    factor: string
    impact: 'positive' | 'negative' | 'neutral'
    weight: number
    description: string
  }>
  forecast: Array<{
    date: string
    price: number
    confidence: number
  }>
}

interface SmartRecommendation {
  type: 'similar_project' | 'cost_saving' | 'quality_upgrade' | 'seasonal' | 'regional'
  title: string
  description: string
  confidence: number
  savings?: number
  items?: Array<{
    name: string
    currentChoice?: string
    recommendedChoice: string
    priceDiff?: number
    reason: string
  }>
}

interface MarketTrend {
  category: string
  trend: 'rising' | 'falling' | 'stable'
  changePercent: number
  period: string
  forecast: 'up' | 'down' | 'stable'
  forecastPeriod: string
  reasons: string[]
  affectedItems: Array<{
    name: string
    currentPrice: number
    expectedChange: number
  }>
}

interface BlueprintRoom {
  name: string
  area: number
  type: string
}

interface AIAssistantPanelProps {
  projectType?: string
  totalArea?: number
  rooms?: string[]
  currentItems?: Array<{ name: string; category: string; price: number }>
  budget?: number
  region?: string
  onRoomsDetected?: (rooms: BlueprintRoom[]) => void
  onRecommendationApply?: (recommendation: SmartRecommendation) => void
  className?: string
}

const recommendationIcons: Record<string, typeof Lightbulb> = {
  similar_project: Lightbulb,
  cost_saving: DollarSign,
  quality_upgrade: TrendingUp,
  seasonal: Calendar,
  regional: MapPin,
}

const recommendationColors: Record<string, string> = {
  similar_project: 'from-blue-500 to-cyan-500',
  cost_saving: 'from-emerald-500 to-teal-500',
  quality_upgrade: 'from-amber-500 to-orange-500',
  seasonal: 'from-violet-500 to-purple-500',
  regional: 'from-pink-500 to-rose-500',
}

export default function AIAssistantPanel({
  projectType = 'apartment',
  totalArea = 60,
  rooms,
  currentItems,
  budget,
  region,
  onRoomsDetected,
  onRecommendationApply,
  className,
}: AIAssistantPanelProps) {
  const [activeTab, setActiveTab] = useState<'scan' | 'predict' | 'recommend' | 'trends'>('recommend')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Blueprint scanning state
  const [blueprintImage, setBlueprintImage] = useState<string | null>(null)
  const [detectedRooms, setDetectedRooms] = useState<BlueprintRoom[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Price prediction state
  const [predictions, setPredictions] = useState<PricePrediction[]>([])
  
  // Recommendations state
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([])
  
  // Market trends state
  const [marketTrends, setMarketTrends] = useState<MarketTrend[]>([])
  const [marketInsights, setMarketInsights] = useState<Array<{ type: string; message: string; priority: string }>>([])

  // File validation constants
  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

  // Handle blueprint upload
  const handleBlueprintUpload = useCallback(async (file: File) => {
    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError('Неподдерживаемый формат файла. Допустимы: JPEG, PNG, WebP, GIF')
      return
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError('Файл слишком большой. Максимальный размер: 10 МБ')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string)?.split(',')[1]
        if (!base64) {
          setError('Не удалось прочитать изображение')
          setIsLoading(false)
          return
        }

        setBlueprintImage(e.target?.result as string)

        try {
          const response = await fetch('/api/ai/blueprint/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: base64,
              imageType: file.type,
              projectType,
              includeWorkSuggestions: true,
            }),
          })

          const data = await response.json()
          
          if (data.success && data.data.rooms) {
            setDetectedRooms(data.data.rooms)
            onRoomsDetected?.(data.data.rooms)
          } else {
            setError('Не удалось распознать комнаты на плане')
          }
        } catch {
          setError('Ошибка при анализе плана. Попробуйте загрузить другое изображение.')
        }
        
        setIsLoading(false)
      }
      reader.readAsDataURL(file)
    } catch {
      setError('Ошибка при загрузке файла')
      setIsLoading(false)
    }
  }, [projectType, onRoomsDetected])

  // Fetch price predictions
  const fetchPredictions = useCallback(async () => {
    if (!currentItems || currentItems.length === 0) {
      setError('Добавьте позиции в смету для прогноза цен')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/prices/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: currentItems.map((item, index) => ({
            id: String(index),
            name: item.name,
            category: item.category,
            currentPrice: item.price,
            unit: 'шт',
          })),
          region,
          forecastMonths: 3,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setPredictions(data.data.predictions || [])
      } else {
        setError(data.error || 'Ошибка получения прогноза')
      }
    } catch {
      setError('Ошибка подключения к серверу')
    }

    setIsLoading(false)
  }, [currentItems, region])

  // Fetch recommendations
  const fetchRecommendations = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectType,
          totalArea,
          rooms,
          currentItems,
          budget,
          region,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setRecommendations(data.data.recommendations || [])
      } else {
        setError(data.error || 'Ошибка получения рекомендаций')
      }
    } catch {
      setError('Ошибка подключения к серверу')
    }

    setIsLoading(false)
  }, [projectType, totalArea, rooms, currentItems, budget, region])

  // Fetch market trends
  const fetchMarketTrends = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/market/trends')
      const data = await response.json()
      
      if (data.success) {
        setMarketTrends(data.data.trends || [])
        setMarketInsights(data.data.insights || [])
      } else {
        setError(data.error || 'Ошибка получения трендов')
      }
    } catch {
      setError('Ошибка подключения к серверу')
    }

    setIsLoading(false)
  }, [])

  // Tab change handler
  const handleTabChange = useCallback((tab: typeof activeTab) => {
    setActiveTab(tab)
    setError(null)
    
    if (tab === 'predict' && predictions.length === 0) {
      fetchPredictions()
    } else if (tab === 'recommend' && recommendations.length === 0) {
      fetchRecommendations()
    } else if (tab === 'trends' && marketTrends.length === 0) {
      fetchMarketTrends()
    }
  }, [predictions.length, recommendations.length, marketTrends.length, fetchPredictions, fetchRecommendations, fetchMarketTrends])

  const getTrendIcon = (trend: 'rising' | 'falling' | 'stable') => {
    switch (trend) {
      case 'rising': return <ArrowUp className="w-4 h-4 text-rose-500" />
      case 'falling': return <ArrowDown className="w-4 h-4 text-emerald-500" />
      default: return <Minus className="w-4 h-4 text-secondary-500" />
    }
  }

  const getTrendColor = (trend: 'rising' | 'falling' | 'stable') => {
    switch (trend) {
      case 'rising': return 'text-rose-500'
      case 'falling': return 'text-emerald-500'
      default: return 'text-secondary-500'
    }
  }

  return (
    <GlassCard className={clsx('p-4 sm:p-6', className)}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-secondary-900 dark:text-white">
            AI-Ассистент
          </h3>
          <p className="text-sm text-secondary-500 dark:text-secondary-400">
            Умный помощник сметчика
          </p>
        </div>
        <Badge variant="gradient" size="sm" className="ml-auto">PRO</Badge>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-secondary-100 dark:bg-secondary-800 rounded-xl mb-4 overflow-x-auto">
        <button
          onClick={() => handleTabChange('scan')}
          className={clsx(
            'flex-1 min-w-[80px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
            activeTab === 'scan'
              ? 'bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white shadow-sm'
              : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-white'
          )}
        >
          <Camera className="w-4 h-4" />
          <span className="hidden sm:inline">Скан</span>
        </button>
        <button
          onClick={() => handleTabChange('predict')}
          className={clsx(
            'flex-1 min-w-[80px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
            activeTab === 'predict'
              ? 'bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white shadow-sm'
              : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-white'
          )}
        >
          <TrendingUp className="w-4 h-4" />
          <span className="hidden sm:inline">Прогноз</span>
        </button>
        <button
          onClick={() => handleTabChange('recommend')}
          className={clsx(
            'flex-1 min-w-[80px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
            activeTab === 'recommend'
              ? 'bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white shadow-sm'
              : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-white'
          )}
        >
          <Lightbulb className="w-4 h-4" />
          <span className="hidden sm:inline">Советы</span>
        </button>
        <button
          onClick={() => handleTabChange('trends')}
          className={clsx(
            'flex-1 min-w-[80px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
            activeTab === 'trends'
              ? 'bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white shadow-sm'
              : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-white'
          )}
        >
          <BarChart2 className="w-4 h-4" />
          <span className="hidden sm:inline">Тренды</span>
        </button>
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl">
          <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
          <span className="ml-2 text-secondary-600 dark:text-secondary-400">Анализирую...</span>
        </div>
      )}

      {/* Tab content */}
      {!isLoading && (
        <>
          {/* Blueprint Scanning Tab */}
          {activeTab === 'scan' && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleBlueprintUpload(file)
                }}
              />
              
              {!blueprintImage ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-secondary-300 dark:border-secondary-600 rounded-xl p-8 text-center cursor-pointer hover:border-primary-500 dark:hover:border-primary-400 transition-colors"
                >
                  <Upload className="w-12 h-12 mx-auto text-secondary-400 mb-4" />
                  <p className="text-secondary-700 dark:text-secondary-300 font-medium mb-2">
                    Загрузите план помещения
                  </p>
                  <p className="text-sm text-secondary-500 dark:text-secondary-400">
                    AI распознает комнаты и рассчитает площади
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={blueprintImage}
                      alt="Uploaded blueprint"
                      className="w-full rounded-xl"
                    />
                    <button
                      onClick={() => {
                        setBlueprintImage(null)
                        setDetectedRooms([])
                      }}
                      className="absolute top-2 right-2 p-1 bg-secondary-900/70 rounded-full text-white hover:bg-secondary-900"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {detectedRooms.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-secondary-900 dark:text-white">
                        Обнаруженные комнаты:
                      </h4>
                      <div className="grid gap-2">
                        {detectedRooms.map((room, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-secondary-50 dark:bg-secondary-800 rounded-lg"
                          >
                            <span className="font-medium text-secondary-700 dark:text-secondary-300">
                              {room.name}
                            </span>
                            <span className="text-secondary-600 dark:text-secondary-400">
                              {room.area} м²
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="pt-2 border-t border-secondary-200 dark:border-secondary-700">
                        <div className="flex items-center justify-between font-semibold">
                          <span className="text-secondary-900 dark:text-white">Общая площадь:</span>
                          <span className="text-primary-600 dark:text-primary-400">
                            {detectedRooms.reduce((sum, r) => sum + r.area, 0)} м²
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Price Prediction Tab */}
          {activeTab === 'predict' && (
            <div className="space-y-4">
              {predictions.length === 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 mx-auto text-secondary-300 dark:text-secondary-600 mb-4" />
                  <p className="text-secondary-600 dark:text-secondary-400 mb-4">
                    Добавьте позиции в смету для прогноза цен
                  </p>
                  <button
                    onClick={fetchPredictions}
                    className="btn btn-primary"
                    disabled={!currentItems || currentItems.length === 0}
                  >
                    Получить прогноз
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {predictions.map((prediction) => (
                    <div
                      key={prediction.itemId}
                      className="p-4 bg-secondary-50 dark:bg-secondary-800 rounded-xl"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-medium text-secondary-900 dark:text-white">
                          {prediction.itemName}
                        </span>
                        <div className={clsx(
                          'flex items-center gap-1 text-sm font-medium',
                          prediction.priceChange > 0 ? 'text-rose-500' : prediction.priceChange < 0 ? 'text-emerald-500' : 'text-secondary-500'
                        )}>
                          {prediction.priceChange > 0 ? <ArrowUp className="w-3 h-3" /> : prediction.priceChange < 0 ? <ArrowDown className="w-3 h-3" /> : null}
                          {prediction.priceChange > 0 ? '+' : ''}{prediction.priceChange}%
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-secondary-600 dark:text-secondary-400">
                        <span>Сейчас: {prediction.currentPrice.toLocaleString('ru-RU')} ₽</span>
                        <span>Прогноз: {prediction.predictedPrice.toLocaleString('ru-RU')} ₽</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-secondary-200 dark:bg-secondary-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary-500 to-amber-500 rounded-full"
                            style={{ width: `${prediction.confidence}%` }}
                          />
                        </div>
                        <span className="text-xs text-secondary-500">
                          {prediction.confidence}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Recommendations Tab */}
          {activeTab === 'recommend' && (
            <div className="space-y-3">
              {recommendations.length === 0 ? (
                <div className="text-center py-8">
                  <Lightbulb className="w-12 h-12 mx-auto text-secondary-300 dark:text-secondary-600 mb-4" />
                  <p className="text-secondary-600 dark:text-secondary-400 mb-4">
                    AI подготовит персональные рекомендации
                  </p>
                  <button
                    onClick={fetchRecommendations}
                    className="btn btn-primary"
                  >
                    Получить рекомендации
                  </button>
                </div>
              ) : (
                recommendations.map((rec, index) => {
                  const Icon = recommendationIcons[rec.type] || Lightbulb
                  const colorClass = recommendationColors[rec.type] || 'from-blue-500 to-cyan-500'
                  
                  return (
                    <div
                      key={index}
                      className="p-4 bg-secondary-50 dark:bg-secondary-800 rounded-xl"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorClass} flex items-center justify-center flex-shrink-0`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-secondary-900 dark:text-white truncate">
                              {rec.title}
                            </h4>
                            {rec.savings && (
                              <Badge variant="success" size="sm">
                                −{rec.savings.toLocaleString('ru-RU')} ₽
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-3">
                            {rec.description}
                          </p>
                          {rec.items && rec.items.length > 0 && (
                            <div className="space-y-1 mb-3">
                              {rec.items.slice(0, 2).map((item, i) => (
                                <div key={i} className="flex items-center text-xs text-secondary-500 dark:text-secondary-400">
                                  <ChevronRight className="w-3 h-3 mr-1" />
                                  <span>{item.recommendedChoice}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          <button
                            onClick={() => onRecommendationApply?.(rec)}
                            className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                          >
                            Применить →
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}

          {/* Market Trends Tab */}
          {activeTab === 'trends' && (
            <div className="space-y-4">
              {/* Insights */}
              {marketInsights.length > 0 && (
                <div className="space-y-2">
                  {marketInsights.map((insight, index) => (
                    <div
                      key={index}
                      className={clsx(
                        'p-3 rounded-xl flex items-start gap-3',
                        insight.priority === 'high'
                          ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
                          : 'bg-secondary-50 dark:bg-secondary-800'
                      )}
                    >
                      <AlertTriangle className={clsx(
                        'w-4 h-4 flex-shrink-0 mt-0.5',
                        insight.priority === 'high' ? 'text-amber-500' : 'text-secondary-400'
                      )} />
                      <p className="text-sm text-secondary-700 dark:text-secondary-300">
                        {insight.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Trends */}
              {marketTrends.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart2 className="w-12 h-12 mx-auto text-secondary-300 dark:text-secondary-600 mb-4" />
                  <p className="text-secondary-600 dark:text-secondary-400 mb-4">
                    Загрузите актуальные рыночные тренды
                  </p>
                  <button
                    onClick={fetchMarketTrends}
                    className="btn btn-primary"
                  >
                    Загрузить тренды
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {marketTrends.map((trend, index) => (
                    <div
                      key={index}
                      className="p-4 bg-secondary-50 dark:bg-secondary-800 rounded-xl"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-secondary-900 dark:text-white">
                          {trend.category}
                        </span>
                        <div className="flex items-center gap-2">
                          {getTrendIcon(trend.trend)}
                          <span className={clsx('text-sm font-medium', getTrendColor(trend.trend))}>
                            {trend.changePercent > 0 ? '+' : ''}{trend.changePercent}%
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-2">
                        {trend.reasons.join(', ')}
                      </p>
                      {trend.affectedItems.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {trend.affectedItems.slice(0, 3).map((item, i) => (
                            <Badge key={i} variant="default" size="sm">
                              {item.name}: {item.expectedChange > 0 ? '+' : ''}{item.expectedChange}%
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </GlassCard>
  )
}
