import { useMemo } from 'react'
import { Trash2, Plus, Minus, FileText, Sparkles } from 'lucide-react'
import { GlassCard, AnimatedNumber } from '../design-system/components'
import clsx from 'clsx'

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
      <GlassCard className="text-center py-16">
        <div className="w-16 h-16 bg-secondary-100 dark:bg-secondary-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-secondary-400 dark:text-secondary-500" />
        </div>
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-2">
          Смета пуста
        </h3>
        <p className="text-secondary-500 dark:text-secondary-400 max-w-sm mx-auto">
          Добавьте позиции из каталога для начала расчета
        </p>
      </GlassCard>
    )
  }

  return (
    <GlassCard className="p-0 overflow-hidden">
      {/* Summary Header */}
      <div className="p-6 bg-gradient-to-r from-primary-500/10 via-primary-500/5 to-transparent dark:from-primary-500/20 dark:via-primary-500/10 border-b border-secondary-100 dark:border-secondary-700/50">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-primary-500" />
              <span className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                Итого по смете
              </span>
            </div>
            <div className="text-3xl font-bold text-secondary-900 dark:text-white">
              <AnimatedNumber value={totalSum} suffix=" ₽" decimals={2} />
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-secondary-500 dark:text-secondary-400">Позиций</div>
            <div className="text-2xl font-bold text-secondary-900 dark:text-white">{items.length}</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary-50 dark:bg-secondary-800/50">
            <tr>
              <th className="text-left px-6 py-4 text-secondary-600 dark:text-secondary-400 font-semibold text-sm">
                Наименование
              </th>
              <th className="text-center px-4 py-4 text-secondary-600 dark:text-secondary-400 font-semibold text-sm">
                Ед. изм.
              </th>
              <th className="text-center px-4 py-4 text-secondary-600 dark:text-secondary-400 font-semibold text-sm">
                Кол-во
              </th>
              <th className="text-right px-4 py-4 text-secondary-600 dark:text-secondary-400 font-semibold text-sm">
                Цена
              </th>
              <th className="text-right px-4 py-4 text-secondary-600 dark:text-secondary-400 font-semibold text-sm">
                Сумма
              </th>
              <th className="w-14"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-100 dark:divide-secondary-700/50">
            {items.map((item, index) => (
              <tr 
                key={item.id} 
                className={clsx(
                  'group transition-colors duration-150',
                  'hover:bg-secondary-50 dark:hover:bg-secondary-800/30',
                  'stagger-item'
                )}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <td className="px-6 py-4">
                  <span className="font-medium text-secondary-900 dark:text-white">
                    {item.name}
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="px-2 py-1 bg-secondary-100 dark:bg-secondary-800 rounded-md text-sm text-secondary-600 dark:text-secondary-400">
                    {item.unit}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                      className={clsx(
                        'p-1.5 rounded-lg transition-all duration-200',
                        'text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300',
                        'hover:bg-secondary-100 dark:hover:bg-secondary-800',
                        'active:scale-90'
                      )}
                      aria-label="Уменьшить количество"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => onUpdateQuantity(item.id, parseFloat(e.target.value) || 0)}
                      className={clsx(
                        'w-16 text-center rounded-lg px-2 py-1.5',
                        'bg-white dark:bg-secondary-800',
                        'border border-secondary-200 dark:border-secondary-700',
                        'text-secondary-900 dark:text-white font-medium',
                        'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
                        'transition-all duration-200'
                      )}
                      min="0"
                      step="0.1"
                    />
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className={clsx(
                        'p-1.5 rounded-lg transition-all duration-200',
                        'text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300',
                        'hover:bg-secondary-100 dark:hover:bg-secondary-800',
                        'active:scale-90'
                      )}
                      aria-label="Увеличить количество"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-4 text-right text-secondary-600 dark:text-secondary-400">
                  {formatCurrency(item.price)}
                </td>
                <td className="px-4 py-4 text-right">
                  <span className="font-semibold text-secondary-900 dark:text-white">
                    {formatCurrency(item.total)}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className={clsx(
                      'p-2 rounded-lg transition-all duration-200',
                      'text-secondary-400 hover:text-rose-500',
                      'hover:bg-rose-50 dark:hover:bg-rose-900/20',
                      'opacity-0 group-hover:opacity-100',
                      'active:scale-90'
                    )}
                    aria-label="Удалить позицию"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Total */}
      <div className="p-4 bg-gradient-to-r from-primary-50 via-primary-50/50 to-transparent dark:from-primary-900/20 dark:via-primary-900/10 border-t border-secondary-100 dark:border-secondary-700/50">
        <div className="flex items-center justify-end gap-8">
          <span className="text-lg font-bold text-primary-900 dark:text-primary-400">
            ИТОГО:
          </span>
          <span className="text-xl font-bold text-primary-900 dark:text-primary-400">
            {formatCurrency(totalSum)}
          </span>
        </div>
      </div>
    </GlassCard>
  )
}
