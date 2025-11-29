import { z } from 'zod'

// Schema for parsed work request
export const ParsedWorkSchema = z.object({
  description: z.string().describe('Description of the work'),
  category: z.string().describe('Work category: plastering, painting, flooring, demolition, masonry, etc.'),
  keywords: z.array(z.string()).describe('Keywords for searching normatives'),
  estimatedQuantity: z.number().optional().describe('Estimated quantity if mentioned'),
  unit: z.string().optional().describe('Unit of measurement if specified'),
})

export const ParsedRequestSchema = z.object({
  projectType: z.string().optional().describe('Type of project: apartment, house, office, etc.'),
  totalArea: z.number().optional().describe('Total area in square meters if mentioned'),
  roomCount: z.number().optional().describe('Number of rooms if mentioned'),
  works: z.array(ParsedWorkSchema).describe('List of works extracted from the description'),
})

export type ParsedWork = z.infer<typeof ParsedWorkSchema>
export type ParsedRequest = z.infer<typeof ParsedRequestSchema>

// Item type enum
export const ItemTypeSchema = z.enum(['FER', 'COMMERCIAL'])
export type ItemType = z.infer<typeof ItemTypeSchema>

// Price source enum
export const PriceSourceSchema = z.enum(['DATABASE', 'USER', 'AI_SUGGESTED'])
export type PriceSource = z.infer<typeof PriceSourceSchema>

// FER item (not editable)
export const FerItemSchema = z.object({
  id: z.string(),
  type: z.literal('FER'),
  code: z.string().describe('FER code'),
  name: z.string(),
  unit: z.string(),
  quantity: z.number(),
  price: z.number().describe('Price from FER database'),
  total: z.number(),
  editable: z.literal(false),
})

export type FerItem = z.infer<typeof FerItemSchema>

// Commercial item (editable)
export const CommercialItemSchema = z.object({
  id: z.string(),
  type: z.literal('COMMERCIAL'),
  code: z.string().optional(),
  name: z.string(),
  unit: z.string(),
  quantity: z.number(),
  price: z.number().describe('Editable commercial price'),
  total: z.number(),
  editable: z.literal(true),
  ferCode: z.string().optional().describe('Related FER code'),
  ferPrice: z.number().optional().describe('FER price for comparison'),
  priceSource: PriceSourceSchema,
  originalPrice: z.number().optional().describe('Original price before editing'),
  notes: z.string().optional(),
})

export type CommercialItem = z.infer<typeof CommercialItemSchema>

// Combined estimate item type
export const EstimateItemSchema = z.union([FerItemSchema, CommercialItemSchema])
export type EstimateItem = z.infer<typeof EstimateItemSchema>

// Generate estimate request
export const GenerateEstimateRequestSchema = z.object({
  description: z.string().min(10).describe('Text description of the works'),
  estimateType: z.enum(['FER', 'COMMERCIAL', 'MIXED']).default('COMMERCIAL'),
  area: z.number().optional().describe('Override area in square meters'),
  region: z.string().optional().describe('Region for pricing'),
})

export type GenerateEstimateRequest = z.infer<typeof GenerateEstimateRequestSchema>

// Generate estimate response
export const GenerateEstimateResponseSchema = z.object({
  items: z.array(EstimateItemSchema),
  parsed: ParsedRequestSchema,
  subtotal: z.number(),
  ferSubtotal: z.number().optional(),
  commercialSubtotal: z.number().optional(),
  difference: z.number().optional().describe('Percentage difference from FER'),
})

export type GenerateEstimateResponse = z.infer<typeof GenerateEstimateResponseSchema>

// Custom price request
export const CustomPriceRequestSchema = z.object({
  normativeId: z.string().optional(),
  code: z.string().optional(),
  name: z.string(),
  unit: z.string(),
  category: z.string().optional(),
  price: z.number().positive(),
  notes: z.string().optional(),
})

export type CustomPriceRequest = z.infer<typeof CustomPriceRequestSchema>

// Import commercial prices request
export const ImportCommercialPricesRequestSchema = z.object({
  prices: z.array(z.object({
    normativeId: z.string().optional(),
    code: z.string().optional(),
    name: z.string(),
    unit: z.string(),
    category: z.string().optional(),
    price: z.number().positive(),
    minPrice: z.number().optional(),
    maxPrice: z.number().optional(),
    costPrice: z.number().optional(),
    marginPercent: z.number().optional(),
    region: z.string().optional(),
    source: z.string().optional(),
    notes: z.string().optional(),
  })),
})

export type ImportCommercialPricesRequest = z.infer<typeof ImportCommercialPricesRequestSchema>
