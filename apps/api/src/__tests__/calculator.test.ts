import { describe, it, expect } from 'vitest'

interface CalculatorItem {
  id: string
  name: string
  unit: string
  quantity: number
  price: number
  coefficient?: number
}

interface CalculatorOptions {
  overheadRate: number
  profitRate: number
  vatRate: number
  includeVat: boolean
}

function calculateEstimate(items: CalculatorItem[], options: CalculatorOptions) {
  const subtotal = items.reduce((sum, item) => {
    const coefficient = item.coefficient || 1
    return sum + item.quantity * item.price * coefficient
  }, 0)

  const overhead = subtotal * options.overheadRate
  const profit = (subtotal + overhead) * options.profitRate
  
  let total = subtotal + overhead + profit
  if (options.includeVat) {
    total = total * (1 + options.vatRate)
  }

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    overhead: Math.round(overhead * 100) / 100,
    profit: Math.round(profit * 100) / 100,
    total: Math.round(total * 100) / 100,
  }
}

describe('Calculator API', () => {
  const defaultOptions: CalculatorOptions = {
    overheadRate: 0.12,
    profitRate: 0.08,
    vatRate: 0.20,
    includeVat: true,
  }

  describe('calculateEstimate', () => {
    it('should calculate subtotal correctly', () => {
      const items: CalculatorItem[] = [
        { id: '1', name: 'Item 1', unit: 'шт', quantity: 10, price: 100 },
        { id: '2', name: 'Item 2', unit: 'м²', quantity: 5, price: 200 },
      ]

      const result = calculateEstimate(items, defaultOptions)
      
      expect(result.subtotal).toBe(2000)
    })

    it('should apply coefficient correctly', () => {
      const items: CalculatorItem[] = [
        { id: '1', name: 'Item 1', unit: 'шт', quantity: 10, price: 100, coefficient: 1.5 },
      ]

      const result = calculateEstimate(items, defaultOptions)
      
      expect(result.subtotal).toBe(1500)
    })

    it('should calculate overhead correctly', () => {
      const items: CalculatorItem[] = [
        { id: '1', name: 'Item 1', unit: 'шт', quantity: 10, price: 100 },
      ]

      const result = calculateEstimate(items, defaultOptions)
      
      expect(result.overhead).toBe(120) // 12% of 1000
    })

    it('should calculate profit correctly', () => {
      const items: CalculatorItem[] = [
        { id: '1', name: 'Item 1', unit: 'шт', quantity: 10, price: 100 },
      ]

      const result = calculateEstimate(items, defaultOptions)
      
      // Profit = 8% of (subtotal + overhead) = 8% of 1120 = 89.6
      expect(result.profit).toBe(89.6)
    })

    it('should calculate total with VAT', () => {
      const items: CalculatorItem[] = [
        { id: '1', name: 'Item 1', unit: 'шт', quantity: 10, price: 100 },
      ]

      const result = calculateEstimate(items, defaultOptions)
      
      // Total without VAT = 1000 + 120 + 89.6 = 1209.6
      // Total with VAT = 1209.6 * 1.2 = 1451.52
      expect(result.total).toBe(1451.52)
    })

    it('should calculate total without VAT', () => {
      const items: CalculatorItem[] = [
        { id: '1', name: 'Item 1', unit: 'шт', quantity: 10, price: 100 },
      ]

      const result = calculateEstimate(items, { ...defaultOptions, includeVat: false })
      
      expect(result.total).toBe(1209.6)
    })

    it('should handle empty items array', () => {
      const result = calculateEstimate([], defaultOptions)
      
      expect(result.subtotal).toBe(0)
      expect(result.overhead).toBe(0)
      expect(result.profit).toBe(0)
      expect(result.total).toBe(0)
    })
  })
})
