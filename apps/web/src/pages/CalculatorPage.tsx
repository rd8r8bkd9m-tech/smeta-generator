import { useState, useCallback, useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, Plus, Download, Save, Sparkles, Package, Hammer, Filter, Wand2, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react'
import EstimateTable from '../components/EstimateTable'
import AIEstimateGenerator from '../components/AIEstimateGenerator'
import EditableEstimateTable from '../components/EditableEstimateTable'
import AIAssistantPanel from '../components/AIAssistantPanel'
import { useStore } from '../store/useStore'
import { GlassCard, Badge } from '../design-system/components'
import clsx from 'clsx'
import type { AIEstimateItem, GeneratedEstimate, ManualEstimateItem } from '../types/estimate'

// Примеры работ и материалов
const catalogItems = [
  { id: 'work-1', name: 'Демонтаж перегородок кирпичных', unit: 'м³', price: 1250, type: 'work' },
  { id: 'work-2', name: 'Кладка перегородок из кирпича', unit: 'м³', price: 4500, type: 'work' },
  { id: 'work-3', name: 'Штукатурка стен', unit: 'м²', price: 450, type: 'work' },
  { id: 'work-4', name: 'Шпаклевка стен', unit: 'м²', price: 280, type: 'work' },
  { id: 'work-5', name: 'Покраска стен', unit: 'м²', price: 180, type: 'work' },
  { id: 'mat-1', name: 'Кирпич керамический М150', unit: 'шт', price: 12, type: 'material' },
  { id: 'mat-2', name: 'Цемент М500', unit: 'кг', price: 8, type: 'material' },
  { id: 'mat-3', name: 'Песок строительный', unit: 'м³', price: 1200, type: 'material' },
  { id: 'mat-4', name: 'Штукатурка гипсовая', unit: 'кг', price: 15, type: 'material' },
  { id: 'mat-5', name: 'Краска водоэмульсионная', unit: 'л', price: 350, type: 'material' },
]

type FilterType = 'all' | 'work' | 'material'
type ViewMode = 'manual' | 'ai'

interface ProjectOption {
  id: string
  name: string
  client?: { name: string } | null
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

const API_URL = '/api'
const DEMO_USER_ID = 'demo-user-001'

export default function CalculatorPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('manual')
  const [estimateItems, setEstimateItems] = useState<ManualEstimateItem[]>([])
  const [aiEstimateItems, setAiEstimateItems] = useState<AIEstimateItem[]>([])
  const [generatedEstimate, setGeneratedEstimate] = useState<GeneratedEstimate | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const { addNotification } = useStore()
  const [projects, setProjects] = useState<ProjectOption[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [estimateName, setEstimateName] = useState('Новая смета')
  const [estimateDescription, setEstimateDescription] = useState('')
  const [estimateId, setEstimateId] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [isSaving, setIsSaving] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [draftLoaded, setDraftLoaded] = useState(false)
  const draftKey = useMemo(
    () => (selectedProjectId ? `estimateDraft:${selectedProjectId}` : 'estimateDraft:local'),
    [selectedProjectId]
  )

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`${API_URL}/projects`)
        if (!response.ok) {
          throw new Error('Failed to fetch projects')
        }
        const data = await response.json()
        setProjects(data)
      } catch (error) {
        console.error('Failed to load projects:', error)
      }
    }

    fetchProjects()
  }, [])

  useEffect(() => {
    const templateId = searchParams.get('template')
    if (templateId) {
      loadTemplate(templateId)
    }
    const projectId = searchParams.get('projectId')
    if (projectId) {
      setSelectedProjectId(projectId)
    }
    const estimateParam = searchParams.get('estimateId')
    if (estimateParam) {
      setEstimateId(estimateParam)
      loadEstimate(estimateParam)
    }
  }, [searchParams])

  const loadTemplate = async (id: string) => {
    try {
      const response = await fetch('/api/calculator/templates')
      const templates = await response.json()
      const template = templates.find((t: any) => t.id === id)
      
      if (template) {
        const manualItems: ManualEstimateItem[] = template.items.map((item: any) => {
          const quantity = item.quantity ?? 1
          const price = item.price ?? 0
          return {
            ...item,
            quantity,
            price,
            total: item.total ?? quantity * price,
          }
        })
        setEstimateItems(manualItems)
        setEstimateName(template.name || 'Новая смета')
        setEstimateDescription(template.description || '')
        setViewMode('manual')
        addNotification?.('success', `Применен шаблон: ${template.name}`)
      }
    } catch (error) {
      console.error('Failed to load template:', error)
    }
  }

  const loadEstimate = async (id: string) => {
    try {
      setLoadError(null)
      const response = await fetch(`/api/calculator/estimates/${id}`)
      if (!response.ok) {
        throw new Error('Failed to load estimate')
      }
      const estimate = await response.json()
      const rawItems = Array.isArray(estimate.items) ? estimate.items : []
      const hasAiType = rawItems.some((item: any) => item.type === 'FER' || item.type === 'COMMERCIAL')

      if (hasAiType) {
        const aiItems = rawItems.map((item: any) => ({
          ...item,
          total: item.total ?? item.quantity * item.price,
        }))
        setAiEstimateItems(aiItems)
        setViewMode('ai')
        setGeneratedEstimate({
          items: aiItems,
          subtotal: aiItems.reduce((sum: number, item: any) => sum + (item.total ?? 0), 0),
          parsed: { works: [] },
        })
      } else {
        const manualItems = rawItems.map((item: any) => ({
          id: item.id,
          name: item.name,
          unit: item.unit,
          quantity: item.quantity,
          price: item.price,
          total: item.total ?? item.quantity * item.price,
        }))
        setEstimateItems(manualItems)
        setViewMode('manual')
      }

      setEstimateName(estimate.name || 'Новая смета')
      setEstimateDescription(estimate.description || '')
      setSelectedProjectId(estimate.projectId || '')
      addNotification?.('success', 'Смета загружена')
    } catch (error) {
      console.error('Failed to load estimate:', error)
      setLoadError('Не удалось загрузить смету')
    }
  }

  useEffect(() => {
    if (estimateId || draftLoaded) return
    if (estimateItems.length > 0 || aiEstimateItems.length > 0) return

    const saved = localStorage.getItem(draftKey)
    if (!saved) {
      setDraftLoaded(true)
      return
    }

    try {
      const parsed = JSON.parse(saved)
      setEstimateName(parsed.estimateName || 'Новая смета')
      setEstimateDescription(parsed.estimateDescription || '')
      setSelectedProjectId(parsed.selectedProjectId || '')
      if (parsed.viewMode === 'ai') {
        setAiEstimateItems(parsed.aiEstimateItems || [])
        setViewMode('ai')
      } else {
        setEstimateItems(parsed.estimateItems || [])
        setViewMode('manual')
      }
    } catch (error) {
      console.error('Failed to load draft:', error)
    } finally {
      setDraftLoaded(true)
    }
  }, [aiEstimateItems.length, draftKey, draftLoaded, estimateId, estimateItems.length])

  useEffect(() => {
    if (estimateId) return
    const payload = {
      estimateName,
      estimateDescription,
      selectedProjectId,
      viewMode,
      estimateItems,
      aiEstimateItems,
      updatedAt: new Date().toISOString(),
    }
    localStorage.setItem(draftKey, JSON.stringify(payload))
  }, [aiEstimateItems, draftKey, estimateDescription, estimateId, estimateItems, estimateName, selectedProjectId, viewMode])

  const filteredCatalog = catalogItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || item.type === filterType
    return matchesSearch && matchesType
  })

  const addToEstimate = useCallback((catalogItem: typeof catalogItems[0]) => {
    const existingItem = estimateItems.find(item => item.id === catalogItem.id)
    
    if (existingItem) {
      setEstimateItems(items =>
        items.map(item =>
          item.id === catalogItem.id
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
            : item
        )
      )
    } else {
      const newItem: ManualEstimateItem = {
        id: catalogItem.id,
        name: catalogItem.name,
        unit: catalogItem.unit,
        quantity: 1,
        price: catalogItem.price,
        total: catalogItem.price,
      }
      setEstimateItems(items => [...items, newItem])
    }
    addNotification?.('success', `Добавлено: ${catalogItem.name}`)
  }, [estimateItems, addNotification])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setEstimateItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, quantity, total: quantity * item.price }
          : item
      )
    )
  }, [])

  const removeItem = useCallback((id: string) => {
    setEstimateItems(items => items.filter(item => item.id !== id))
  }, [])

  // AI estimate handlers
  const handleEstimateGenerated = useCallback((estimate: GeneratedEstimate) => {
    setGeneratedEstimate(estimate)
    setAiEstimateItems(estimate.items)
    setViewMode('ai')
    if (!estimateName || estimateName === 'Новая смета') {
      setEstimateName(`AI смета — ${new Date().toLocaleDateString('ru-RU')}`)
    }
    addNotification?.('success', `Сгенерировано ${estimate.items.length} позиций`)
  }, [addNotification, estimateName])

  const updateAiQuantity = useCallback((id: string, quantity: number) => {
    setAiEstimateItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, quantity, total: quantity * item.price }
          : item
      )
    )
  }, [])

  const updateAiPrice = useCallback((id: string, price: number) => {
    setAiEstimateItems(items =>
      items.map(item =>
        item.id === id && item.type === 'COMMERCIAL'
          ? { ...item, price, total: item.quantity * price, priceSource: 'USER' as const }
          : item
      )
    )
  }, [])

  const removeAiItem = useCallback((id: string) => {
    setAiEstimateItems(items => items.filter(item => item.id !== id))
  }, [])

  const getCurrentItems = () => (viewMode === 'ai' ? aiEstimateItems : estimateItems)

  const normalizeItems = (items: Array<AIEstimateItem | ManualEstimateItem>) =>
    items.map((item) => ({
      ...item,
      total: item.total ?? item.quantity * item.price,
    }))

  const calculateSubtotal = (items: Array<AIEstimateItem | ManualEstimateItem>) =>
    items.reduce((sum, item) => sum + (item.total ?? item.quantity * item.price), 0)

  const inferEstimateType = (items: Array<AIEstimateItem | ManualEstimateItem>) => {
    const hasFer = items.some((item: any) => item.type === 'FER')
    const hasCommercial = items.some((item: any) => item.type === 'COMMERCIAL')
    if (hasFer && hasCommercial) return 'MIXED'
    if (hasFer) return 'FER'
    return 'COMMERCIAL'
  }

  const handleSave = async () => {
    const items = getCurrentItems()
    if (!estimateName.trim()) {
      addNotification?.('error', 'Укажите название сметы')
      return
    }
    if (items.length === 0) {
      addNotification?.('warning', 'Добавьте хотя бы одну позицию')
      return
    }

    setIsSaving(true)
    setSaveStatus('saving')

    try {
      const normalizedItems = normalizeItems(items)
      const subtotal = calculateSubtotal(normalizedItems)

      const payload = {
        name: estimateName.trim(),
        description: estimateDescription || undefined,
        items: normalizedItems,
        subtotal,
        total: subtotal,
        type: inferEstimateType(normalizedItems),
        projectId: selectedProjectId || undefined,
        userId: DEMO_USER_ID,
      }

      const endpoint = estimateId
        ? `${API_URL}/calculator/estimates/${estimateId}`
        : `${API_URL}/calculator/estimates`

      const response = await fetch(endpoint, {
        method: estimateId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData?.error || 'Ошибка сохранения')
      }

      const saved = await response.json()
      setEstimateId(saved.id)
      setSaveStatus('saved')
      localStorage.removeItem(draftKey)

      const nextParams = new URLSearchParams(searchParams)
      nextParams.set('estimateId', saved.id)
      if (selectedProjectId) {
        nextParams.set('projectId', selectedProjectId)
      }
      setSearchParams(nextParams, { replace: true })

      addNotification?.('success', 'Смета сохранена в базе')
    } catch (error) {
      console.error('Failed to save estimate:', error)
      setSaveStatus('error')
      addNotification?.('error', error instanceof Error ? error.message : 'Ошибка сохранения')
    } finally {
      setIsSaving(false)
      setTimeout(() => setSaveStatus('idle'), 2000)
    }
  }

  const handleExport = () => {
    addNotification?.('info', 'Экспорт в Excel скоро будет доступен')
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
              Калькулятор сметы
            </h1>
            <Badge variant="gradient" size="sm">
              <Sparkles className="w-3 h-3 mr-1" />
              AI Pro
            </Badge>
          </div>
          <p className="text-secondary-600 dark:text-secondary-400">
            Создайте смету с помощью AI или выберите позиции из каталога
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Mode Toggle */}
          <div className="flex rounded-lg bg-secondary-100 dark:bg-secondary-800 p-1">
            <button
              onClick={() => setViewMode('manual')}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                viewMode === 'manual'
                  ? 'bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white shadow-sm'
                  : 'text-secondary-600 dark:text-secondary-400'
              )}
            >
              <Hammer className="w-4 h-4" />
              Ручной
            </button>
            <button
              onClick={() => setViewMode('ai')}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                viewMode === 'ai'
                  ? 'bg-gradient-to-r from-primary-500 to-amber-500 text-white shadow-sm'
                  : 'text-secondary-600 dark:text-secondary-400'
              )}
            >
              <Wand2 className="w-4 h-4" />
              AI
            </button>
          </div>
          <div className="hidden md:flex items-center gap-1.5 text-xs text-secondary-500 dark:text-secondary-400">
            {saveStatus === 'saving' && (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Сохранение...
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Сохранено
              </>
            )}
            {saveStatus === 'error' && (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                Ошибка сохранения
              </>
            )}
          </div>
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="btn btn-secondary flex items-center gap-2"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? 'Сохранение...' : 'Сохранить'}</span>
          </button>
          <button 
            onClick={handleExport} 
            className="btn btn-primary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Экспорт</span>
          </button>
        </div>
      </div>

      {/* Project & Estimate Details */}
      <GlassCard className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
              Название сметы *
            </label>
            <input
              type="text"
              value={estimateName}
              onChange={(e) => setEstimateName(e.target.value)}
              className="input w-full"
              placeholder="Например: Штукатурка стен 109 м²"
            />
            {estimateId && (
              <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
                ID сметы: {estimateId}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
              Проект
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="input w-full"
            >
              <option value="">Без проекта</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                  {project.client?.name ? ` — ${project.client.name}` : ''}
                </option>
              ))}
            </select>
            <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
              <Link to="/projects" className="text-primary-600 hover:underline">
                Управление проектами
              </Link>
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
              Описание
            </label>
            <textarea
              value={estimateDescription}
              onChange={(e) => setEstimateDescription(e.target.value)}
              className="input w-full"
              rows={2}
              placeholder="Краткое описание работ..."
            />
          </div>
        </div>
        {loadError && (
          <div className="mt-4 text-sm text-rose-600 dark:text-rose-400">
            {loadError}
          </div>
        )}
      </GlassCard>

      {viewMode === 'manual' ? (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Каталог */}
          <GlassCard className="p-0 overflow-hidden">
            <div className="p-6 border-b border-secondary-100 dark:border-secondary-700/50">
              <h2 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
                Каталог работ и материалов
              </h2>
              
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <input
                  type="text"
                  placeholder="Поиск позиций..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10"
                />
              </div>

              {/* Filter chips */}
              <div className="flex gap-2">
                {[
                  { key: 'all', label: 'Все', icon: Filter },
                  { key: 'work', label: 'Работы', icon: Hammer },
                  { key: 'material', label: 'Материалы', icon: Package },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setFilterType(key as FilterType)}
                    className={clsx(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                      filterType === key
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                        : 'bg-secondary-100 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-400 hover:bg-secondary-200 dark:hover:bg-secondary-700'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 max-h-[500px] overflow-y-auto scrollbar-thin">
              <div className="space-y-2">
                {filteredCatalog.map((item, index) => (
                  <div
                    key={item.id}
                    className={clsx(
                      'group flex items-center justify-between p-3 rounded-xl',
                      'bg-secondary-50 dark:bg-secondary-800/50',
                      'hover:bg-secondary-100 dark:hover:bg-secondary-800',
                      'border border-transparent hover:border-secondary-200 dark:hover:border-secondary-700',
                      'transition-all duration-200 cursor-pointer',
                      'stagger-item'
                    )}
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {item.type === 'work' ? (
                          <Hammer className="w-3.5 h-3.5 text-blue-500" />
                        ) : (
                          <Package className="w-3.5 h-3.5 text-amber-500" />
                        )}
                        <span className="text-sm font-medium text-secondary-900 dark:text-white truncate">
                          {item.name}
                        </span>
                      </div>
                      <div className="text-xs text-secondary-500 dark:text-secondary-400">
                        <span className="font-medium text-primary-600 dark:text-primary-400">
                          {formatPrice(item.price)} ₽
                        </span>
                        <span className="mx-1">/</span>
                        <span>{item.unit}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => addToEstimate(item)}
                      className={clsx(
                        'ml-3 p-2 rounded-lg',
                        'text-primary-600 dark:text-primary-400',
                        'hover:bg-primary-100 dark:hover:bg-primary-900/30',
                        'transition-all duration-200',
                        'group-hover:scale-110'
                      )}
                      aria-label={`Добавить ${item.name}`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {filteredCatalog.length === 0 && (
                <div className="text-center py-8">
                  <Search className="w-10 h-10 text-secondary-300 dark:text-secondary-600 mx-auto mb-3" />
                  <p className="text-secondary-500 dark:text-secondary-400">
                    Ничего не найдено
                  </p>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Смета (ручной режим) */}
          <div className="lg:col-span-2">
            <EstimateTable
              items={estimateItems}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeItem}
            />
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* AI Generator */}
          <div className="space-y-6">
            <AIEstimateGenerator 
              onEstimateGenerated={handleEstimateGenerated}
            />
            
            {/* AI Assistant Panel */}
            <AIAssistantPanel
              projectType={generatedEstimate?.parsed?.projectType || 'apartment'}
              totalArea={generatedEstimate?.parsed?.totalArea || 60}
              rooms={generatedEstimate?.parsed?.works?.map(w => w.description)}
              currentItems={aiEstimateItems.map(item => ({
                name: item.name,
                category: item.type === 'COMMERCIAL' ? 'commercial' : 'fer',
                price: item.price,
              }))}
              onRoomsDetected={(rooms) => {
                addNotification?.('success', `Обнаружено ${rooms.length} комнат, общая площадь: ${rooms.reduce((s, r) => s + r.area, 0)} м²`)
              }}
              onRecommendationApply={(rec) => {
                addNotification?.('info', `Применена рекомендация: ${rec.title}`)
              }}
            />
          </div>

          {/* Смета (AI режим) */}
          <div className="lg:col-span-2">
            <EditableEstimateTable
              items={aiEstimateItems}
              onUpdateQuantity={updateAiQuantity}
              onUpdatePrice={updateAiPrice}
              onRemoveItem={removeAiItem}
              ferSubtotal={generatedEstimate?.ferSubtotal}
              commercialSubtotal={generatedEstimate?.commercialSubtotal}
              difference={generatedEstimate?.difference}
            />
          </div>
        </div>
      )}
    </div>
  )
}
