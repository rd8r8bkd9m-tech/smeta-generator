import { z } from 'zod'
import ai from '../genkit.config.js'
import {
  GenerateEstimateRequestSchema,
  GenerateEstimateResponseSchema,
  type GenerateEstimateRequest,
  type GenerateEstimateResponse,
  type CommercialItem,
} from '../schemas/estimate.schema.js'

// Agent 1: Chief Engineer Schema
const ChiefEngineerResponseSchema = z.object({
  objectType: z.string(),
  workScale: z.string(),
  complexity: z.string(),
  features: z.array(z.string()),
  recommendations: z.array(z.string()),
})

// Agent 2: Architect Schema
const ArchitectResponseSchema = z.object({
  areas: z.array(z.object({ name: z.string(), value: z.number(), unit: z.string() })),
  volumes: z.array(z.object({ name: z.string(), value: z.number(), unit: z.string() })),
  wasteFactors: z.record(z.number()),
})

// Agent 3: Foreman Schema
const ForemanResponseSchema = z.object({
  preparatoryWorks: z.array(z.object({ name: z.string(), quantity: z.number(), unit: z.string(), pricePerUnit: z.number(), notes: z.string().optional() })),
  mainWorks: z.array(z.object({ name: z.string(), quantity: z.number(), unit: z.string(), pricePerUnit: z.number(), notes: z.string().optional() })),
  finishingWorks: z.array(z.object({ name: z.string(), quantity: z.number(), unit: z.string(), pricePerUnit: z.number(), notes: z.string().optional() })),
})

// Agent 4: Materials Specialist Schema
const MaterialsResponseSchema = z.object({
  mainMaterials: z.array(z.object({ name: z.string(), quantity: z.number(), unit: z.string(), pricePerUnit: z.number(), manufacturer: z.string().optional() })),
  auxiliaryMaterials: z.array(z.object({ name: z.string(), quantity: z.number(), unit: z.string(), pricePerUnit: z.number() })),
})

// Agent 5: Cost Estimator Schema (Final)
const FinalEstimateSchema = z.object({
  title: z.string(),
  client: z.string(),
  project: z.string(),
  materials: z.array(z.object({ description: z.string(), quantity: z.number(), unit: z.string(), price: z.number() })),
  labor: z.array(z.object({ description: z.string(), quantity: z.number(), unit: z.string(), price: z.number() })),
  summary: z.object({
    materialsTotal: z.number(),
    laborTotal: z.number(),
    grandTotal: z.number(),
    notes: z.string().optional(),
  }),
})

export const multiAgentEstimateFlow = ai.defineFlow(
  {
    name: 'multiAgentEstimate',
    inputSchema: GenerateEstimateRequestSchema,
    outputSchema: GenerateEstimateResponseSchema,
  },
  async (input: GenerateEstimateRequest) => {
    const { description } = input

    // Step 1: Chief Engineer
    const chiefResponse = await ai.generate({
      prompt: `Ты - ГЛАВНЫЙ ИНЖЕНЕР строительного института с 25-летним опытом.
ОПИСАНИЕ ОБЪЕКТА: ${description}
Проанализируй объект и дай техническую характеристику. Ответь в формате JSON.`,
      output: { schema: ChiefEngineerResponseSchema },
    })
    const chiefAnalysis = chiefResponse.output
    if (!chiefAnalysis) throw new Error('Chief Engineer analysis failed')

    // Step 2: Architect
    const architectResponse = await ai.generate({
      prompt: `Ты - АРХИТЕКТОР-ПРОЕКТИРОВЩИК строительного института.
ОПИСАНИЕ ОБЪЕКТА: ${description}
АНАЛИЗ ГЛАВНОГО ИНЖЕНЕРА: ${JSON.stringify(chiefAnalysis)}
Рассчитай точные объемы и площади работ. Ответь в формате JSON.`,
      output: { schema: ArchitectResponseSchema },
    })
    const architectAnalysis = architectResponse.output
    if (!architectAnalysis) throw new Error('Architect analysis failed')

    // Step 3: Foreman
    const foremanResponse = await ai.generate({
      prompt: `Ты - ПРОРАБ с опытом 20 лет в строительстве.
ОПИСАНИЕ ОБЪЕКТА: ${description}
АНАЛИЗ ГЛАВНОГО ИНЖЕНЕРА: ${JSON.stringify(chiefAnalysis)}
РАСЧЕТЫ АРХИТЕКТОРА: ${JSON.stringify(architectAnalysis)}
Определи все необходимые работы с точными расценками для Москвы 2025 года. Ответь в формате JSON.`,
      output: { schema: ForemanResponseSchema },
    })
    const foremanAnalysis = foremanResponse.output
    if (!foremanAnalysis) throw new Error('Foreman analysis failed')

    // Step 4: Materials Specialist
    const materialsResponse = await ai.generate({
      prompt: `Ты - ИНЖЕНЕР ПО СНАБЖЕНИЮ материалами.
ОПИСАНИЕ ОБЪЕКТА: ${description}
РАСЧЕТЫ АРХИТЕКТОРА: ${JSON.stringify(architectAnalysis)}
ПЕРЕЧЕНЬ РАБОТ ОТ ПРОРАБА: ${JSON.stringify(foremanAnalysis)}
Подбери оптимальные материалы с актуальными ценами для Москвы 2025 года. Ответь в формате JSON.`,
      output: { schema: MaterialsResponseSchema },
    })
    const materialsAnalysis = materialsResponse.output
    if (!materialsAnalysis) throw new Error('Materials specialist analysis failed')

    // Step 5: Cost Estimator
    const estimatorResponse = await ai.generate({
      prompt: `Ты - ПРОФЕССИОНАЛЬНЫЙ СМЕТЧИК.
ОПИСАНИЕ ОБЪЕКТА: ${description}
АНАЛИЗ СПЕЦИАЛИСТОВ:
Главный инженер: ${JSON.stringify(chiefAnalysis)}
Архитектор: ${JSON.stringify(architectAnalysis)}
Прораб: ${JSON.stringify(foremanAnalysis)}
Снабженец: ${JSON.stringify(materialsAnalysis)}
Составь итоговую детальную смету высокой точности. Раздели на МАТЕРИАЛЫ и РАБОТЫ. Ответь в формате JSON.`,
      output: { schema: FinalEstimateSchema },
    })
    const finalEstimate = estimatorResponse.output
    if (!finalEstimate) throw new Error('Cost Estimator final estimate failed')

    // Convert to unified GenerateEstimateResponse format
    const items: CommercialItem[] = [
      ...finalEstimate.materials.map((m: any) => ({
        id: `mat-${Math.random().toString(36).substr(2, 9)}`,
        type: 'COMMERCIAL' as const,
        name: m.description,
        unit: m.unit,
        quantity: m.quantity,
        price: m.price,
        total: m.quantity * m.price,
        editable: true as const,
        priceSource: 'AI_SUGGESTED' as const,
      })),
      ...finalEstimate.labor.map((l: any) => ({
        id: `lab-${Math.random().toString(36).substr(2, 9)}`,
        type: 'COMMERCIAL' as const,
        name: l.description,
        unit: l.unit,
        quantity: l.quantity,
        price: l.price,
        total: l.quantity * l.price,
        editable: true as const,
        priceSource: 'AI_SUGGESTED' as const,
      })),
    ]

    return {
      items,
      parsed: {
        projectType: chiefAnalysis.objectType,
        totalArea: architectAnalysis.areas.find((a: any) => a.name.toLowerCase().includes('общая'))?.value || input.area,
        works: [
          ...foremanAnalysis.mainWorks.map((w: any) => ({
            description: w.name,
            category: 'general',
            keywords: [w.name],
            estimatedQuantity: w.quantity,
            unit: w.unit
          }))
        ]
      },
      subtotal: finalEstimate.summary.grandTotal,
      commercialSubtotal: finalEstimate.summary.grandTotal,
    } as GenerateEstimateResponse
  }
)
