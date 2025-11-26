import { useState, useCallback } from 'react'
import { Search, Plus, Download, Save } from 'lucide-react'
import EstimateTable from '../components/EstimateTable'
import { useStore } from '../store/useStore'

interface EstimateItem {
  id: string
  name: string
  unit: string
  quantity: number
  price: number
  total: number
}

// Примеры работ и материалов
const catalogItems = [
  { id: 'work-1', name: 'Демонтаж перегородок кирпичных', unit: 'м³', price: 1250 },
  { id: 'work-2', name: 'Кладка перегородок из кирпича', unit: 'м³', price: 4500 },
  { id: 'work-3', name: 'Штукатурка стен', unit: 'м²', price: 450 },
  { id: 'work-4', name: 'Шпаклевка стен', unit: 'м²', price: 280 },
  { id: 'work-5', name: 'Покраска стен', unit: 'м²', price: 180 },
  { id: 'mat-1', name: 'Кирпич керамический М150', unit: 'шт', price: 12 },
  { id: 'mat-2', name: 'Цемент М500', unit: 'кг', price: 8 },
  { id: 'mat-3', name: 'Песок строительный', unit: 'м³', price: 1200 },
  { id: 'mat-4', name: 'Штукатурка гипсовая', unit: 'кг', price: 15 },
  { id: 'mat-5', name: 'Краска водоэмульсионная', unit: 'л', price: 350 },
]

export default function CalculatorPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [estimateItems, setEstimateItems] = useState<EstimateItem[]>([])
  const { addNotification } = useStore()

  const filteredCatalog = catalogItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
      const newItem: EstimateItem = {
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

  const handleSave = () => {
    addNotification?.('success', 'Смета сохранена')
  }

  const handleExport = () => {
    addNotification?.('info', 'Экспорт в Excel...')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Калькулятор сметы</h1>
          <p className="text-secondary-600">Создайте новую смету или выберите из шаблонов</p>
        </div>
        <div className="flex space-x-2">
          <button onClick={handleSave} className="btn btn-secondary flex items-center space-x-2">
            <Save className="w-4 h-4" />
            <span>Сохранить</span>
          </button>
          <button onClick={handleExport} className="btn btn-primary flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Экспорт</span>
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Каталог */}
        <div className="card">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Каталог работ и материалов</h2>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <input
              type="text"
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredCatalog.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-secondary-900 truncate">
                    {item.name}
                  </div>
                  <div className="text-xs text-secondary-500">
                    {item.price} ₽ / {item.unit}
                  </div>
                </div>
                <button
                  onClick={() => addToEstimate(item)}
                  className="ml-2 p-2 text-primary-600 hover:bg-primary-100 rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Смета */}
        <div className="lg:col-span-2">
          <EstimateTable
            items={estimateItems}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeItem}
          />
        </div>
      </div>
    </div>
  )
}
