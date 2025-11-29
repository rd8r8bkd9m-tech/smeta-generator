import { z } from 'zod'
import ai from '../genkit.config.js'
import {
  GenerateEstimateRequestSchema,
  type GenerateEstimateRequest,
  type GenerateEstimateResponse,
  type EstimateItem,
  type FerItem,
  type CommercialItem,
} from '../schemas/estimate.schema.js'
import { parseRequest } from './parseRequest.flow.js'
import { normativesMatcher } from '../services/normativesMatcher.js'

// Generate estimate from text description
export const generateEstimateFlow = ai.defineFlow(
  {
    name: 'generateEstimate',
    inputSchema: GenerateEstimateRequestSchema,
    outputSchema: z.object({
      items: z.array(z.any()),
      parsed: z.any(),
      subtotal: z.number(),
      ferSubtotal: z.number().optional(),
      commercialSubtotal: z.number().optional(),
      difference: z.number().optional(),
    }),
  },
  async (input: GenerateEstimateRequest) => {
    const { description, estimateType, area, region } = input

    // Step 1: Parse the request using AI (ONLY AI usage)
    const parsed = await parseRequest(description)

    // Override area if provided
    const effectiveArea = area || parsed.totalArea || 100

    // Step 2: For each parsed work, find matching normatives from database
    const items: EstimateItem[] = []
    let ferSubtotal = 0
    let commercialSubtotal = 0

    for (const work of parsed.works) {
      // Calculate quantity based on area and work type
      let quantity = work.estimatedQuantity || 0
      if (quantity === 0) {
        quantity = calculateQuantityFromArea(work.category, effectiveArea, work.unit)
      }

      // Find best matching normative from database
      const match = await normativesMatcher.findBestMatch(work, undefined, region)

      if (match) {
        const priceInfo = normativesMatcher.getPriceInfo(match)
        const ferTotal = match.normative.price * quantity

        if (estimateType === 'FER') {
          // FER only - prices are not editable
          const ferItem: FerItem = {
            id: `fer-${match.normative.id}`,
            type: 'FER',
            code: match.normative.code,
            name: match.normative.name,
            unit: match.normative.unit,
            quantity,
            price: match.normative.price,
            total: ferTotal,
            editable: false,
          }
          items.push(ferItem)
          ferSubtotal += ferTotal
        } else {
          // COMMERCIAL or MIXED - editable prices
          const commercialPrice = priceInfo.effectivePrice
          const commercialTotal = commercialPrice * quantity

          const commercialItem: CommercialItem = {
            id: `comm-${match.normative.id}`,
            type: 'COMMERCIAL',
            code: match.normative.code,
            name: match.normative.name,
            unit: match.normative.unit,
            quantity,
            price: commercialPrice,
            total: commercialTotal,
            editable: true,
            ferCode: match.normative.code,
            ferPrice: match.normative.price,
            priceSource: priceInfo.priceSource,
            originalPrice: commercialPrice,
          }
          items.push(commercialItem)
          commercialSubtotal += commercialTotal
          ferSubtotal += ferTotal
        }
      } else {
        // No match found - create a placeholder commercial item
        const estimatedPrice = estimatePrice(work.category)
        const total = estimatedPrice * quantity

        const placeholderItem: CommercialItem = {
          id: `placeholder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'COMMERCIAL',
          name: work.description,
          unit: work.unit || 'м²',
          quantity,
          price: estimatedPrice,
          total,
          editable: true,
          priceSource: 'DATABASE',
          originalPrice: estimatedPrice,
          notes: 'Норматив не найден в базе',
        }
        items.push(placeholderItem)
        commercialSubtotal += total
      }
    }

    const subtotal = estimateType === 'FER' ? ferSubtotal : commercialSubtotal
    const difference =
      ferSubtotal > 0
        ? Math.round(((commercialSubtotal - ferSubtotal) / ferSubtotal) * 100)
        : undefined

    return {
      items,
      parsed,
      subtotal,
      ferSubtotal: ferSubtotal > 0 ? ferSubtotal : undefined,
      commercialSubtotal: commercialSubtotal > 0 ? commercialSubtotal : undefined,
      difference,
    } as GenerateEstimateResponse
  }
)

// Helper function to calculate quantity based on area
function calculateQuantityFromArea(
  category: string,
  area: number,
  unit?: string
): number {
  // Wall area is typically totalArea * 2.8 (average wall height)
  // Floor/ceiling area equals total area
  const categoryMultipliers: Record<string, number> = {
    plastering: 2.8, // walls
    painting: 2.8, // walls
    flooring: 1.0, // floor
    tiling: 1.0, // floor/walls depends
    drywall: 2.8, // walls
    demolition: 1.0,
    masonry: 0.5,
    electrical: 1.0,
    plumbing: 0.3,
    insulation: 1.0,
    roofing: 1.0,
    windows: 0.1,
    doors: 0.05,
    general: 1.0,
  }

  const multiplier = categoryMultipliers[category] || 1.0

  // Convert to 100 m² units if unit suggests it
  const rawQuantity = area * multiplier
  if (unit === '100 м²') {
    return Math.round((rawQuantity / 100) * 100) / 100
  }

  return Math.round(rawQuantity * 100) / 100
}

// Estimate price for unknown work categories
function estimatePrice(category: string): number {
  const categoryPrices: Record<string, number> = {
    plastering: 450,
    painting: 250,
    flooring: 400,
    tiling: 800,
    demolition: 200,
    masonry: 3000,
    electrical: 500,
    plumbing: 600,
    drywall: 350,
    insulation: 300,
    roofing: 500,
    windows: 3000,
    doors: 2500,
    general: 400,
  }

  return categoryPrices[category] || 400
}

// Helper function to call the flow directly
export async function generateEstimate(
  request: GenerateEstimateRequest
): Promise<GenerateEstimateResponse> {
  return generateEstimateFlow(request) as Promise<GenerateEstimateResponse>
}

export default generateEstimateFlow
