/**
 * Anomaly Alert Component - Displays detected price anomalies
 */

import { AlertTriangle, TrendingUp, TrendingDown, X } from 'lucide-react'
import clsx from 'clsx'

interface AnomalyAlertProps {
  itemName: string
  actualPrice: number
  expectedMin: number
  expectedMax: number
  anomalyType: 'price_high' | 'price_low' | 'quantity_unusual' | 'combination'
  suggestion: string
  onDismiss?: () => void
  className?: string
}

export default function AnomalyAlert({
  itemName,
  actualPrice,
  expectedMin,
  expectedMax,
  anomalyType,
  suggestion,
  onDismiss,
  className,
}: AnomalyAlertProps) {
  const isHighPrice = anomalyType === 'price_high'
  const isLowPrice = anomalyType === 'price_low'

  return (
    <div
      className={clsx(
        'p-4 rounded-xl border',
        isHighPrice
          ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800'
          : isLowPrice
          ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
          : 'bg-secondary-50 dark:bg-secondary-800 border-secondary-200 dark:border-secondary-700',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={clsx(
            'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
            isHighPrice
              ? 'bg-rose-100 dark:bg-rose-900/50'
              : isLowPrice
              ? 'bg-amber-100 dark:bg-amber-900/50'
              : 'bg-secondary-100 dark:bg-secondary-700'
          )}
        >
          {isHighPrice ? (
            <TrendingUp className="w-5 h-5 text-rose-500" />
          ) : isLowPrice ? (
            <TrendingDown className="w-5 h-5 text-amber-500" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-secondary-500" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4
              className={clsx(
                'font-medium',
                isHighPrice
                  ? 'text-rose-700 dark:text-rose-300'
                  : isLowPrice
                  ? 'text-amber-700 dark:text-amber-300'
                  : 'text-secondary-700 dark:text-secondary-300'
              )}
            >
              {isHighPrice
                ? 'Завышенная цена'
                : isLowPrice
                ? 'Заниженная цена'
                : 'Аномалия обнаружена'}
            </h4>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="p-1 rounded hover:bg-white/50 dark:hover:bg-black/20 transition-colors"
              >
                <X className="w-4 h-4 text-secondary-400" />
              </button>
            )}
          </div>

          <p className="text-sm text-secondary-700 dark:text-secondary-300 mt-1">
            {itemName}
          </p>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <div>
              <span className="text-secondary-500 dark:text-secondary-400">Указано: </span>
              <span
                className={clsx(
                  'font-medium',
                  isHighPrice
                    ? 'text-rose-600 dark:text-rose-400'
                    : isLowPrice
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-secondary-900 dark:text-white'
                )}
              >
                {actualPrice.toLocaleString('ru-RU')} ₽
              </span>
            </div>
            <div>
              <span className="text-secondary-500 dark:text-secondary-400">Ожидаемо: </span>
              <span className="font-medium text-secondary-900 dark:text-white">
                {expectedMin.toLocaleString('ru-RU')} — {expectedMax.toLocaleString('ru-RU')} ₽
              </span>
            </div>
          </div>

          <p className="mt-2 text-sm text-secondary-600 dark:text-secondary-400">
            {suggestion}
          </p>
        </div>
      </div>
    </div>
  )
}
