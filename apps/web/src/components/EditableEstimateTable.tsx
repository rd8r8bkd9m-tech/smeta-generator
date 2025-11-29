import { useMemo, useState, useCallback } from 'react'
import { Trash2, Plus, Minus, FileText, Sparkles, Lock, Edit2, Save, X, TrendingUp, TrendingDown } from 'lucide-react'
import { GlassCard, AnimatedNumber, Badge } from '../design-system/components'
import clsx from 'clsx'
import type { AIEstimateItem, CommercialItem } from '../types/estimate'

interface EditableEstimateTableProps {
  items: AIEstimateItem[]
  onUpdateQuantity: (id: string, quantity: number) => void
  onUpdatePrice: (id: string, price: number) => void
  onRemoveItem: (id: string) => void
  ferSubtotal?: number
  commercialSubtotal?: number
  difference?: number
}

export default function EditableEstimateTable({
  items,
  onUpdateQuantity,
  onUpdatePrice,
  onRemoveItem,
  ferSubtotal,
  commercialSubtotal,
  difference,
}: EditableEstimateTableProps) {
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null)
  const [editingPrice, setEditingPrice] = useState<string>('')

  const totalSum = useMemo(
    () => items.reduce((sum, item) => sum + item.total, 0),
    [items]
  )

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const handleStartEditPrice = useCallback((item: CommercialItem) => {
    setEditingPriceId(item.id)
    setEditingPrice(item.price.toString())
  }, [])

  const handleSavePrice = useCallback((id: string) => {
    const price = parseFloat(editingPrice)
    if (!isNaN(price) && price > 0) {
      onUpdatePrice(id, price)
    }
    setEditingPriceId(null)
    setEditingPrice('')
  }, [editingPrice, onUpdatePrice])

  const handleCancelEditPrice = useCallback(() => {
    setEditingPriceId(null)
    setEditingPrice('')
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      handleSavePrice(id)
    } else if (e.key === 'Escape') {
      handleCancelEditPrice()
    }
  }, [handleSavePrice, handleCancelEditPrice])

  const getPriceDifferencePercent = (item: AIEstimateItem): number | null => {
    if (item.type === 'COMMERCIAL' && item.ferPrice) {
      return Math.round(((item.price - item.ferPrice) / item.ferPrice) * 100)
    }
    return null
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
          Используйте AI-генератор или добавьте позиции из каталога
        </p>
      </GlassCard>
    )
  }

  return (
    <GlassCard className="p-0 overflow-hidden">
      {/* Summary Header */}
      <div className="p-6 bg-gradient-to-r from-primary-500/10 via-primary-500/5 to-transparent dark:from-primary-500/20 dark:via-primary-500/10 border-b border-secondary-100 dark:border-secondary-700/50">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-primary-500" />
              <span className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                Итого по смете
              </span>
            </div>
            <div className="text-3xl font-bold text-secondary-900 dark:text-white">
              <AnimatedNumber value={totalSum} suffix=" ₽" decimals={0} />
            </div>
          </div>

          {/* FER vs Commercial comparison */}
          {ferSubtotal && commercialSubtotal && (
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-xs text-secondary-500 dark:text-secondary-400 mb-0.5">ФЕР</div>
                <div className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                  {formatCurrency(ferSubtotal)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-secondary-500 dark:text-secondary-400 mb-0.5">Коммерческая</div>
                <div className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                  {formatCurrency(commercialSubtotal)}
                </div>
              </div>
              {difference !== undefined && (
                <Badge 
                  variant={difference > 0 ? 'warning' : 'success'}
                  size="sm"
                  className="flex items-center gap-1"
                >
                  {difference > 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {difference > 0 ? '+' : ''}{difference}%
                </Badge>
              )}
            </div>
          )}

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
              <th className="text-left px-4 py-3 text-secondary-600 dark:text-secondary-400 font-semibold text-xs uppercase tracking-wider">
                Тип
              </th>
              <th className="text-left px-4 py-3 text-secondary-600 dark:text-secondary-400 font-semibold text-xs uppercase tracking-wider">
                Код
              </th>
              <th className="text-left px-4 py-3 text-secondary-600 dark:text-secondary-400 font-semibold text-xs uppercase tracking-wider">
                Наименование
              </th>
              <th className="text-center px-3 py-3 text-secondary-600 dark:text-secondary-400 font-semibold text-xs uppercase tracking-wider">
                Ед. изм.
              </th>
              <th className="text-center px-3 py-3 text-secondary-600 dark:text-secondary-400 font-semibold text-xs uppercase tracking-wider">
                Кол-во
              </th>
              <th className="text-right px-3 py-3 text-secondary-600 dark:text-secondary-400 font-semibold text-xs uppercase tracking-wider">
                Цена ФЕР
              </th>
              <th className="text-right px-3 py-3 text-secondary-600 dark:text-secondary-400 font-semibold text-xs uppercase tracking-wider">
                Цена
              </th>
              <th className="text-right px-3 py-3 text-secondary-600 dark:text-secondary-400 font-semibold text-xs uppercase tracking-wider">
                Сумма
              </th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-100 dark:divide-secondary-700/50">
            {items.map((item, index) => {
              const priceDiff = getPriceDifferencePercent(item)
              const isEditing = editingPriceId === item.id

              return (
                <tr 
                  key={item.id} 
                  className={clsx(
                    'group transition-colors duration-150',
                    'hover:bg-secondary-50 dark:hover:bg-secondary-800/30',
                    item.type === 'FER' && 'bg-blue-50/30 dark:bg-blue-900/10'
                  )}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  {/* Type Badge */}
                  <td className="px-4 py-3">
                    <Badge 
                      variant={item.type === 'FER' ? 'info' : 'gradient'}
                      size="sm"
                      className="flex items-center gap-1 whitespace-nowrap"
                    >
                      {item.type === 'FER' ? (
                        <>
                          <Lock className="w-3 h-3" />
                          ФЕР
                        </>
                      ) : (
                        <>
                          <Edit2 className="w-3 h-3" />
                          Комм.
                        </>
                      )}
                    </Badge>
                  </td>

                  {/* Code */}
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono text-secondary-500 dark:text-secondary-400">
                      {item.code || '-'}
                    </span>
                  </td>

                  {/* Name */}
                  <td className="px-4 py-3">
                    <span className="font-medium text-secondary-900 dark:text-white text-sm">
                      {item.name}
                    </span>
                    {item.type === 'COMMERCIAL' && item.notes && (
                      <p className="text-xs text-secondary-400 mt-0.5">{item.notes}</p>
                    )}
                  </td>

                  {/* Unit */}
                  <td className="px-3 py-3 text-center">
                    <span className="px-2 py-1 bg-secondary-100 dark:bg-secondary-800 rounded-md text-xs text-secondary-600 dark:text-secondary-400">
                      {item.unit}
                    </span>
                  </td>

                  {/* Quantity */}
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                        className={clsx(
                          'p-1 rounded-md transition-all duration-200',
                          'text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300',
                          'hover:bg-secondary-100 dark:hover:bg-secondary-800',
                          'active:scale-90'
                        )}
                        aria-label="Уменьшить количество"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => onUpdateQuantity(item.id, parseFloat(e.target.value) || 0)}
                        className={clsx(
                          'w-14 text-center rounded-md px-1.5 py-1 text-sm',
                          'bg-white dark:bg-secondary-800',
                          'border border-secondary-200 dark:border-secondary-700',
                          'text-secondary-900 dark:text-white font-medium',
                          'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
                          'transition-all duration-200'
                        )}
                        min="0"
                        step="0.01"
                      />
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className={clsx(
                          'p-1 rounded-md transition-all duration-200',
                          'text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300',
                          'hover:bg-secondary-100 dark:hover:bg-secondary-800',
                          'active:scale-90'
                        )}
                        aria-label="Увеличить количество"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </td>

                  {/* FER Price */}
                  <td className="px-3 py-3 text-right">
                    <span className="text-xs text-secondary-500 dark:text-secondary-400">
                      {item.type === 'COMMERCIAL' && item.ferPrice
                        ? formatCurrency(item.ferPrice)
                        : item.type === 'FER'
                        ? formatCurrency(item.price)
                        : '-'}
                    </span>
                  </td>

                  {/* Editable Price */}
                  <td className="px-3 py-3 text-right">
                    {item.type === 'FER' ? (
                      <div className="flex items-center justify-end gap-1">
                        <Lock className="w-3 h-3 text-secondary-400" />
                        <span className="text-sm text-secondary-600 dark:text-secondary-400">
                          {formatCurrency(item.price)}
                        </span>
                      </div>
                    ) : isEditing ? (
                      <div className="flex items-center justify-end gap-1">
                        <input
                          type="number"
                          value={editingPrice}
                          onChange={(e) => setEditingPrice(e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, item.id)}
                          autoFocus
                          className={clsx(
                            'w-20 text-right rounded-md px-2 py-1 text-sm',
                            'bg-white dark:bg-secondary-800',
                            'border border-primary-500',
                            'text-secondary-900 dark:text-white font-medium',
                            'focus:outline-none focus:ring-2 focus:ring-primary-500/20'
                          )}
                          min="0"
                          step="0.01"
                        />
                        <button
                          onClick={() => handleSavePrice(item.id)}
                          className="p-1 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                        >
                          <Save className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={handleCancelEditPrice}
                          className="p-1 text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStartEditPrice(item)}
                        className="group/price flex items-center justify-end gap-1.5 hover:text-primary-500 transition-colors"
                      >
                        <span className="text-sm font-medium text-secondary-900 dark:text-white">
                          {formatCurrency(item.price)}
                        </span>
                        <Edit2 className="w-3 h-3 opacity-0 group-hover/price:opacity-100 transition-opacity" />
                        {priceDiff !== null && priceDiff !== 0 && (
                          <span className={clsx(
                            'text-xs ml-1',
                            priceDiff > 0 ? 'text-amber-500' : 'text-green-500'
                          )}>
                            {priceDiff > 0 ? '+' : ''}{priceDiff}%
                          </span>
                        )}
                      </button>
                    )}
                  </td>

                  {/* Total */}
                  <td className="px-3 py-3 text-right">
                    <span className="font-semibold text-secondary-900 dark:text-white text-sm">
                      {formatCurrency(item.total)}
                    </span>
                  </td>

                  {/* Delete Button */}
                  <td className="px-3 py-3">
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className={clsx(
                        'p-1.5 rounded-lg transition-all duration-200',
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
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Total */}
      <div className="p-4 bg-gradient-to-r from-primary-50 via-primary-50/50 to-transparent dark:from-primary-900/20 dark:via-primary-900/10 border-t border-secondary-100 dark:border-secondary-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-secondary-500 dark:text-secondary-400">
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" />
              ФЕР — цены из базы (не редактируются)
            </span>
            <span className="flex items-center gap-1">
              <Edit2 className="w-3.5 h-3.5" />
              Комм. — рыночные цены (редактируются)
            </span>
          </div>
          <div className="flex items-center gap-8">
            <span className="text-lg font-bold text-primary-900 dark:text-primary-400">
              ИТОГО:
            </span>
            <span className="text-xl font-bold text-primary-900 dark:text-primary-400">
              {formatCurrency(totalSum)}
            </span>
          </div>
        </div>
      </div>
    </GlassCard>
  )
}
