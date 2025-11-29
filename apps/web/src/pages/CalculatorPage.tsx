import { useState, useCallback } from 'react'
import { Search, Plus, Download, Save, Sparkles, Package, Hammer, Filter, Wand2 } from 'lucide-react'
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

export default function CalculatorPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('manual')
  const [estimateItems, setEstimateItems] = useState<ManualEstimateItem[]>([])
  const [aiEstimateItems, setAiEstimateItems] = useState<AIEstimateItem[]>([])
  const [generatedEstimate, setGeneratedEstimate] = useState<GeneratedEstimate | null>(null)
  const { addNotification } = useStore()

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
    addNotification?.('success', `Сгенерировано ${estimate.items.length} позиций`)
  }, [addNotification])

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

  const handleSave = () => {
    addNotification?.('success', 'Смета сохранена')
  }

  const handleExport = () => {
    addNotification?.('info', 'Экспорт в Excel...')
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
          <button 
            onClick={handleSave} 
            className="btn btn-secondary flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Сохранить</span>
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
