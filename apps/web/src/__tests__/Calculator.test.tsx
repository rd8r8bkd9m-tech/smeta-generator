import { describe, it, expect } from 'vitest'
import {
  calculateItemTotal,
  calculateEstimate,
  roundToTwo,
  formatCurrency,
  parseQuantity,
  generateEstimateId,
} from '../services/calculator'

describe('Calculator Service', () => {
  describe('calculateItemTotal', () => {
    it('should calculate total for item without coefficient', () => {
      const item = {
        id: '1',
        name: 'Test Item',
        unit: 'шт',
        quantity: 10,
        price: 100,
      }
      expect(calculateItemTotal(item)).toBe(1000)
    })

    it('should calculate total with coefficient', () => {
      const item = {
        id: '1',
        name: 'Test Item',
        unit: 'шт',
        quantity: 10,
        price: 100,
        coefficient: 1.5,
      }
      expect(calculateItemTotal(item)).toBe(1500)
    })

    it('should handle zero quantity', () => {
      const item = {
        id: '1',
        name: 'Test Item',
        unit: 'шт',
        quantity: 0,
        price: 100,
      }
      expect(calculateItemTotal(item)).toBe(0)
    })
  })

  describe('calculateEstimate', () => {
    it('should calculate estimate with default options', () => {
      const items = [
        { id: '1', name: 'Item 1', unit: 'шт', quantity: 10, price: 100 },
        { id: '2', name: 'Item 2', unit: 'м²', quantity: 5, price: 200 },
      ]
      
      const result = calculateEstimate(items)
      
      expect(result.subtotal).toBe(2000)
      expect(result.overhead).toBe(240) // 12%
      expect(result.profit).toBe(179.2) // 8% of (2000 + 240)
      expect(result.total).toBeCloseTo(2903.04, 2) // With 20% VAT
    })

    it('should calculate estimate without VAT', () => {
      const items = [
        { id: '1', name: 'Item 1', unit: 'шт', quantity: 10, price: 100 },
      ]
      
      const result = calculateEstimate(items, { includeVat: false })
      
      expect(result.subtotal).toBe(1000)
      expect(result.total).toBeCloseTo(1209.6, 2) // Without VAT
    })

    it('should handle empty items array', () => {
      const result = calculateEstimate([])
      
      expect(result.subtotal).toBe(0)
      expect(result.overhead).toBe(0)
      expect(result.profit).toBe(0)
      expect(result.total).toBe(0)
    })
  })

  describe('roundToTwo', () => {
    it('should round to two decimal places', () => {
      expect(roundToTwo(1.234)).toBe(1.23)
      expect(roundToTwo(1.235)).toBe(1.24)
      expect(roundToTwo(1.2)).toBe(1.2)
    })
  })

  describe('formatCurrency', () => {
    it('should format currency in Russian rubles', () => {
      const formatted = formatCurrency(1000)
      expect(formatted).toContain('1')
      expect(formatted).toContain('000')
    })
  })

  describe('parseQuantity', () => {
    it('should parse valid numbers', () => {
      expect(parseQuantity('10')).toBe(10)
      expect(parseQuantity('10.5')).toBe(10.5)
      expect(parseQuantity('10,5')).toBe(10.5)
    })

    it('should return 0 for invalid input', () => {
      expect(parseQuantity('')).toBe(0)
      expect(parseQuantity('abc')).toBe(0)
    })

    it('should return 0 for negative numbers', () => {
      expect(parseQuantity('-5')).toBe(0)
    })
  })

  describe('generateEstimateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateEstimateId()
      const id2 = generateEstimateId()
      
      expect(id1).not.toBe(id2)
      expect(id1).toMatch(/^EST-/)
    })
  })
})
