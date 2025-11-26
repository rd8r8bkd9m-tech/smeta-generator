import { useMemo } from 'react'
import { Trash2, Plus, Minus } from 'lucide-react'

interface EstimateItem {
  id: string
  name: string
  unit: string
  quantity: number
  price: number
  total: number
}

interface EstimateTableProps {
  items: EstimateItem[]
  onUpdateQuantity: (id: string, quantity: number) => void
  onRemoveItem: (id: string) => void
}

export default function EstimateTable({ items, onUpdateQuantity, onRemoveItem }: EstimateTableProps) {
  const totalSum = useMemo(
    () => items.reduce((sum, item) => sum + item.total, 0),
    [items]
  )

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 2,
    }).format(value)
  }

  if (items.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-secondary-500">Смета пуста. Добавьте позиции для расчета.</p>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary-50">
            <tr>
              <th className="text-left px-4 py-3 text-secondary-600 font-medium">Наименование</th>
              <th className="text-center px-4 py-3 text-secondary-600 font-medium">Ед. изм.</th>
              <th className="text-center px-4 py-3 text-secondary-600 font-medium">Кол-во</th>
              <th className="text-right px-4 py-3 text-secondary-600 font-medium">Цена</th>
              <th className="text-right px-4 py-3 text-secondary-600 font-medium">Сумма</th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-100">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-secondary-50 transition-colors">
                <td className="px-4 py-3 text-secondary-900">{item.name}</td>
                <td className="px-4 py-3 text-center text-secondary-600">{item.unit}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                      className="p-1 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 rounded"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => onUpdateQuantity(item.id, parseFloat(e.target.value) || 0)}
                      className="w-16 text-center border border-secondary-200 rounded px-2 py-1"
                      min="0"
                      step="0.1"
                    />
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="p-1 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 rounded"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-secondary-600">
                  {formatCurrency(item.price)}
                </td>
                <td className="px-4 py-3 text-right font-medium text-secondary-900">
                  {formatCurrency(item.total)}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-primary-50">
            <tr>
              <td colSpan={4} className="px-4 py-3 text-right font-bold text-primary-900">
                ИТОГО:
              </td>
              <td className="px-4 py-3 text-right font-bold text-primary-900">
                {formatCurrency(totalSum)}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
