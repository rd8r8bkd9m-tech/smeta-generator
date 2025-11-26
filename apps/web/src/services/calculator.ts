export interface CalculatorItem {
  id: string
  name: string
  unit: string
  quantity: number
  price: number
  coefficient?: number
}

export interface CalculationResult {
  items: CalculatorItem[]
  subtotal: number
  overhead: number
  profit: number
  total: number
}

export interface CalculatorOptions {
  overheadRate: number
  profitRate: number
  vatRate: number
  includeVat: boolean
}

const defaultOptions: CalculatorOptions = {
  overheadRate: 0.12,
  profitRate: 0.08,
  vatRate: 0.20,
  includeVat: true,
}

export function calculateItemTotal(item: CalculatorItem): number {
  const coefficient = item.coefficient || 1
  return item.quantity * item.price * coefficient
}

export function calculateEstimate(
  items: CalculatorItem[],
  options: Partial<CalculatorOptions> = {}
): CalculationResult {
  const opts = { ...defaultOptions, ...options }

  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => {
    return sum + calculateItemTotal(item)
  }, 0)

  // Calculate overhead
  const overhead = subtotal * opts.overheadRate

  // Calculate profit
  const profit = (subtotal + overhead) * opts.profitRate

  // Calculate total
  let total = subtotal + overhead + profit

  // Add VAT if needed
  if (opts.includeVat) {
    total = total * (1 + opts.vatRate)
  }

  return {
    items,
    subtotal: roundToTwo(subtotal),
    overhead: roundToTwo(overhead),
    profit: roundToTwo(profit),
    total: roundToTwo(total),
  }
}

export function roundToTwo(num: number): number {
  return Math.round(num * 100) / 100
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 2,
  }).format(value)
}

export function parseQuantity(value: string): number {
  const parsed = parseFloat(value.replace(',', '.'))
  return isNaN(parsed) ? 0 : Math.max(0, parsed)
}

export function generateEstimateId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `EST-${timestamp}-${random}`.toUpperCase()
}

export function calculateMaterialsForWork(
  workId: string,
  quantity: number,
  materialsDatabase: Record<string, { materials: { id: string; ratio: number }[] }>
): { id: string; quantity: number }[] {
  const workData = materialsDatabase[workId]
  if (!workData) return []

  return workData.materials.map((material) => ({
    id: material.id,
    quantity: roundToTwo(quantity * material.ratio),
  }))
}
