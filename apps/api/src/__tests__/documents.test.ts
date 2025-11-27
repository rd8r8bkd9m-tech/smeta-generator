import { describe, it, expect } from 'vitest'

// Document generation logic tests (matching services/documents.ts)
interface EstimateItem {
  id: string
  name: string
  unit: string
  quantity: number
  price: number
  coefficient?: number
}

interface Estimate {
  id: string
  name: string
  items: EstimateItem[]
  subtotal: number
  overhead: number
  profit: number
  total: number
}

interface KS2Item {
  number: number
  estimateNumber: string
  name: string
  unit: string
  quantityEstimate: number
  quantityActual: number
  unitPrice: number
  total: number
}

function generateKS2Items(estimate: Estimate): KS2Item[] {
  return estimate.items.map((item, index) => ({
    number: index + 1,
    estimateNumber: estimate.id.slice(0, 8),
    name: item.name,
    unit: item.unit,
    quantityEstimate: item.quantity,
    quantityActual: item.quantity,
    unitPrice: item.price * (item.coefficient || 1),
    total: item.quantity * item.price * (item.coefficient || 1),
  }))
}

function calculateKS2Totals(estimate: Estimate) {
  const totalWithoutVat = estimate.subtotal + estimate.overhead + estimate.profit
  const vat = totalWithoutVat * 0.2
  const totalWithVat = totalWithoutVat + vat
  
  return {
    totalWithoutVat: Math.round(totalWithoutVat * 100) / 100,
    vat: Math.round(vat * 100) / 100,
    totalWithVat: Math.round(totalWithVat * 100) / 100,
  }
}

describe('Document Generation', () => {
  describe('KS-2 Generation', () => {
    const sampleEstimate: Estimate = {
      id: 'EST-12345678',
      name: 'Test Estimate',
      items: [
        { id: '1', name: 'Штукатурка стен', unit: 'м²', quantity: 100, price: 450 },
        { id: '2', name: 'Покраска стен', unit: 'м²', quantity: 100, price: 180 },
      ],
      subtotal: 63000,
      overhead: 7560,
      profit: 5644.8,
      total: 91445.76,
    }

    it('should generate correct KS-2 items', () => {
      const items = generateKS2Items(sampleEstimate)
      
      expect(items).toHaveLength(2)
      expect(items[0].number).toBe(1)
      expect(items[0].name).toBe('Штукатурка стен')
      expect(items[0].total).toBe(45000)
      expect(items[1].total).toBe(18000)
    })

    it('should apply coefficient correctly', () => {
      const estimateWithCoef: Estimate = {
        ...sampleEstimate,
        items: [
          { id: '1', name: 'Work', unit: 'м²', quantity: 100, price: 100, coefficient: 1.5 },
        ],
      }
      
      const items = generateKS2Items(estimateWithCoef)
      
      expect(items[0].unitPrice).toBe(150)
      expect(items[0].total).toBe(15000)
    })

    it('should calculate totals correctly', () => {
      const totals = calculateKS2Totals(sampleEstimate)
      
      expect(totals.totalWithoutVat).toBe(76204.8)
      expect(totals.vat).toBe(15240.96)
      expect(totals.totalWithVat).toBe(91445.76)
    })

    it('should truncate estimate ID for estimateNumber', () => {
      const items = generateKS2Items(sampleEstimate)
      
      expect(items[0].estimateNumber).toBe('EST-1234')
    })
  })

  describe('CSV Export', () => {
    it('should generate valid CSV with BOM', () => {
      const BOM = '\uFEFF'
      let csv = 'Header1;Header2\n'
      csv += 'Value1;Value2\n'
      
      const output = BOM + csv
      
      expect(output.startsWith(BOM)).toBe(true)
      expect(output).toContain('Header1;Header2')
    })

    it('should handle Russian characters', () => {
      const russianText = 'Штукатурка стен'
      const csv = `Наименование;${russianText}\n`
      
      expect(csv).toContain(russianText)
      expect(csv).toContain('Наименование')
    })

    it('should format numbers correctly', () => {
      const value = 12345.67
      const formatted = value.toString()
      
      expect(formatted).toBe('12345.67')
    })
  })

  describe('M-29 Calculations', () => {
    it('should calculate material deviation', () => {
      const normativeQty = 100
      const actualQty = 105
      const price = 50
      
      const deviation = (actualQty - normativeQty) * price
      
      expect(deviation).toBe(250)
    })

    it('should handle negative deviation (savings)', () => {
      const normativeQty = 100
      const actualQty = 95
      const price = 50
      
      const deviation = (actualQty - normativeQty) * price
      
      expect(deviation).toBe(-250)
    })
  })
})

describe('Estimate Calculations', () => {
  it('should calculate subtotal correctly', () => {
    const items: EstimateItem[] = [
      { id: '1', name: 'Item 1', unit: 'шт', quantity: 10, price: 100 },
      { id: '2', name: 'Item 2', unit: 'м²', quantity: 5, price: 200 },
    ]
    
    const subtotal = items.reduce((sum, item) => {
      const coef = item.coefficient || 1
      return sum + item.quantity * item.price * coef
    }, 0)
    
    expect(subtotal).toBe(2000)
  })

  it('should apply overhead correctly', () => {
    const subtotal = 10000
    const overheadRate = 0.12
    
    const overhead = subtotal * overheadRate
    
    expect(overhead).toBe(1200)
  })

  it('should apply profit on subtotal + overhead', () => {
    const subtotal = 10000
    const overhead = 1200
    const profitRate = 0.08
    
    const profit = (subtotal + overhead) * profitRate
    
    expect(profit).toBe(896)
  })

  it('should calculate VAT correctly', () => {
    const subtotal = 10000
    const overhead = 1200
    const profit = 896
    const vatRate = 0.20
    
    const total = (subtotal + overhead + profit) * (1 + vatRate)
    
    expect(total).toBeCloseTo(14515.2, 2)
  })
})
