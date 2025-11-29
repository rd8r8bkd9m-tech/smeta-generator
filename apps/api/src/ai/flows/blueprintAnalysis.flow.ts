import { ai } from '../genkit.config.js'
import { z } from 'zod'
import type { BlueprintAnalysis } from '../schemas/assistant.schema.js'

const BlueprintOutputSchema = z.object({
  rooms: z.array(z.object({
    name: z.string(),
    area: z.number(),
    perimeter: z.number().optional(),
    height: z.number().optional(),
    type: z.string(),
  })),
  totalArea: z.number(),
  totalPerimeter: z.number().optional(),
  floorCount: z.number().optional(),
  buildingType: z.string().optional(),
  suggestedWorks: z.array(z.object({
    room: z.string(),
    works: z.array(z.string()),
    estimatedCost: z.number().optional(),
  })),
})

/**
 * Analyze blueprint/plan image and extract room data
 * Note: This requires vision-capable AI model
 */
export const analyzeBlueprint = ai.defineFlow(
  {
    name: 'analyzeBlueprint',
    inputSchema: z.object({
      imageBase64: z.string().describe('Base64 encoded image of the blueprint'),
      imageType: z.string().optional().describe('Image MIME type'),
      projectType: z.string().optional().describe('Type of project for context'),
      includeWorkSuggestions: z.boolean().optional().default(true),
    }),
    outputSchema: BlueprintOutputSchema,
  },
  async (input) => {
    const prompt = `Ты эксперт по анализу архитектурных чертежей и планов помещений.

Проанализируй прикрепленное изображение плана/чертежа и извлеки следующую информацию:

1. Список комнат с их:
   - Названием (кухня, спальня, ванная и т.д.)
   - Площадью в м²
   - Периметром (если можно определить)
   - Типом помещения

2. Общая площадь помещения

3. Количество этажей (если видно)

4. Тип здания (квартира, дом, офис)

${input.includeWorkSuggestions ? `5. Предложи типичные работы для каждой комнаты:
   - Для ванной: укладка плитки, гидроизоляция, сантехника
   - Для кухни: укладка плитки/ламината, установка мебели
   - Для жилых комнат: покраска/обои, укладка полов
   - И т.д.` : ''}

${input.projectType ? `Контекст: это ${input.projectType}` : ''}

Если изображение не является планом помещения или недостаточно четкое, верни пустой результат с соответствующим комментарием.

Ответь в формате JSON.`

    try {
      const response = await ai.generate({
        model: 'googleai/gemini-1.5-flash',
        prompt: [
          { text: prompt },
          { 
            media: { 
              url: `data:${input.imageType || 'image/jpeg'};base64,${input.imageBase64}`,
              contentType: input.imageType || 'image/jpeg',
            } 
          },
        ],
        output: { schema: BlueprintOutputSchema },
      })

      return response.output || getEmptyBlueprintAnalysis()
    } catch (error) {
      console.error('Error analyzing blueprint:', error)
      return getEmptyBlueprintAnalysis()
    }
  }
)

/**
 * Fallback analysis from user-provided room data
 */
export function analyzeRoomsManually(rooms: Array<{ name: string; area: number; type?: string }>): BlueprintAnalysis {
  const totalArea = rooms.reduce((sum, room) => sum + room.area, 0)
  
  // Generate work suggestions based on room types
  const suggestedWorks = rooms.map(room => {
    const works = getSuggestedWorksForRoom(room.type || room.name.toLowerCase())
    return {
      room: room.name,
      works,
    }
  })

  return {
    rooms: rooms.map(r => ({
      name: r.name,
      area: r.area,
      type: r.type || detectRoomType(r.name),
    })),
    totalArea,
    suggestedWorks,
  }
}

function detectRoomType(roomName: string): string {
  const name = roomName.toLowerCase()
  if (name.includes('кухн')) return 'kitchen'
  if (name.includes('ванн') || name.includes('санузел')) return 'bathroom'
  if (name.includes('спальн')) return 'bedroom'
  if (name.includes('гостин') || name.includes('зал')) return 'living_room'
  if (name.includes('детск')) return 'children_room'
  if (name.includes('кабинет')) return 'office'
  if (name.includes('коридор') || name.includes('прихож')) return 'hallway'
  if (name.includes('балкон') || name.includes('лодж')) return 'balcony'
  if (name.includes('туалет') || name.includes('wc')) return 'toilet'
  return 'other'
}

function getSuggestedWorksForRoom(roomType: string): string[] {
  const workSuggestions: Record<string, string[]> = {
    kitchen: [
      'Укладка напольной плитки',
      'Укладка фартука из плитки',
      'Покраска стен',
      'Монтаж натяжного потолка',
      'Установка кухонного гарнитура',
      'Электромонтажные работы',
    ],
    bathroom: [
      'Гидроизоляция',
      'Укладка напольной плитки',
      'Укладка настенной плитки',
      'Монтаж подвесного потолка',
      'Установка сантехники',
      'Монтаж полотенцесушителя',
    ],
    toilet: [
      'Гидроизоляция',
      'Укладка плитки',
      'Установка унитаза',
      'Монтаж потолка',
    ],
    bedroom: [
      'Штукатурка стен',
      'Шпаклевка под покраску',
      'Покраска стен',
      'Укладка ламината',
      'Монтаж плинтусов',
      'Монтаж натяжного потолка',
    ],
    living_room: [
      'Штукатурка стен',
      'Шпаклевка под покраску',
      'Покраска стен',
      'Укладка ламината/паркета',
      'Монтаж плинтусов',
      'Монтаж натяжного потолка',
    ],
    children_room: [
      'Штукатурка стен',
      'Покраска стен (экологичная краска)',
      'Укладка ламината',
      'Монтаж плинтусов',
      'Монтаж натяжного потолка',
    ],
    office: [
      'Штукатурка стен',
      'Покраска стен',
      'Укладка ламината',
      'Монтаж плинтусов',
      'Электромонтажные работы',
    ],
    hallway: [
      'Штукатурка стен',
      'Покраска стен',
      'Укладка ламината/плитки',
      'Монтаж плинтусов',
      'Монтаж потолка',
    ],
    balcony: [
      'Остекление',
      'Утепление',
      'Обшивка стен',
      'Укладка напольного покрытия',
    ],
  }

  return workSuggestions[roomType] || workSuggestions.bedroom
}

function getEmptyBlueprintAnalysis(): BlueprintAnalysis {
  return {
    rooms: [],
    totalArea: 0,
    suggestedWorks: [],
  }
}

export type { BlueprintAnalysis }
