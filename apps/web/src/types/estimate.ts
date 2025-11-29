// Types for AI estimate generation

// FER item (not editable)
export interface FerItem {
  id: string
  type: 'FER'
  code: string
  name: string
  unit: string
  quantity: number
  price: number
  total: number
  editable: false
}

// Commercial item (editable)
export interface CommercialItem {
  id: string
  type: 'COMMERCIAL'
  code?: string
  name: string
  unit: string
  quantity: number
  price: number
  total: number
  editable: true
  ferCode?: string
  ferPrice?: number
  priceSource: 'DATABASE' | 'USER' | 'AI_SUGGESTED'
  originalPrice?: number
  notes?: string
}

// Combined estimate item type
export type AIEstimateItem = FerItem | CommercialItem

// Parsed work from AI
export interface ParsedWork {
  description: string
  category: string
  keywords: string[]
  estimatedQuantity?: number
  unit?: string
}

// Parsed request from AI
export interface ParsedRequest {
  projectType?: string
  totalArea?: number
  roomCount?: number
  works: ParsedWork[]
}

// Generated estimate response
export interface GeneratedEstimate {
  items: AIEstimateItem[]
  parsed: ParsedRequest
  subtotal: number
  ferSubtotal?: number
  commercialSubtotal?: number
  difference?: number
}

// Basic estimate item for manual entry
export interface ManualEstimateItem {
  id: string
  name: string
  unit: string
  quantity: number
  price: number
  total: number
}
