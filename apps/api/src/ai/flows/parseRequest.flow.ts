import { z } from 'zod'
import ai from '../genkit.config.js'
import { ParsedRequestSchema, type ParsedRequest } from '../schemas/estimate.schema.js'

// Define the flow for parsing text request using AI
export const parseRequestFlow = ai.defineFlow(
  {
    name: 'parseRequest',
    inputSchema: z.object({
      description: z.string().describe('Text description of construction/renovation works'),
    }),
    outputSchema: ParsedRequestSchema,
  },
  async (input) => {
    const { description } = input

    const prompt = `Ты эксперт по строительным сметам в России. Проанализируй следующее описание работ и извлеки структурированную информацию.

Описание работ:
"${description}"

Извлеки следующую информацию:
1. projectType - тип проекта (apartment, house, office, commercial, industrial)
2. totalArea - общая площадь в квадратных метрах (если упоминается)
3. roomCount - количество комнат (если упоминается)
4. works - список работ, для каждой работы укажи:
   - description: описание работы
   - category: категория (plastering, painting, flooring, demolition, masonry, tiling, electrical, plumbing, drywall, insulation, roofing, windows, doors, general)
   - keywords: ключевые слова для поиска в базе нормативов ФЕР
   - estimatedQuantity: примерное количество (если можно определить из контекста)
   - unit: единица измерения (м², м³, шт, п.м.)

Верни JSON объект строго в следующем формате:
{
  "projectType": "apartment",
  "totalArea": 60,
  "works": [
    {
      "description": "штукатурка стен",
      "category": "plastering",
      "keywords": ["штукатурка", "оштукатуривание"],
      "estimatedQuantity": 120,
      "unit": "м²"
    }
  ]
}

ВАЖНО: 
- Используй только указанные категории
- Ключевые слова должны быть на русском языке
- Если площадь не указана, не включай totalArea
- Если количество можно примерно рассчитать из площади (например, стены = площадь * 2.8), сделай это
`

    const response = await ai.generate({
      prompt,
      output: { schema: ParsedRequestSchema },
    })

    // Return the parsed request
    return response.output as ParsedRequest
  }
)

// Helper function to call the flow directly
export async function parseRequest(description: string): Promise<ParsedRequest> {
  return parseRequestFlow({ description })
}

export default parseRequestFlow
