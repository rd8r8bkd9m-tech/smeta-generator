import { ai } from '../genkit.config.js'
import { z } from 'zod'
import type { VoiceCommand } from '../schemas/assistant.schema.js'

const VoiceCommandOutputSchema = z.object({
  action: z.enum(['add', 'remove', 'update', 'calculate', 'query']),
  target: z.string(),
  quantity: z.number().optional(),
  unit: z.string().optional(),
  room: z.string().optional(),
  material: z.string().optional(),
  notes: z.string().optional(),
  confidence: z.number(),
})

/**
 * Parse natural language voice command into structured data
 */
export const parseVoiceCommand = ai.defineFlow(
  {
    name: 'parseVoiceCommand',
    inputSchema: z.object({
      command: z.string().describe('Voice command in Russian'),
      context: z.object({
        currentRooms: z.array(z.string()).optional(),
        currentItems: z.array(z.string()).optional(),
        projectType: z.string().optional(),
      }).optional(),
    }),
    outputSchema: VoiceCommandOutputSchema,
  },
  async (input) => {
    const prompt = `Ты AI-ассистент для системы сметных расчетов "ДениДом".

Проанализируй голосовую команду пользователя на русском языке и извлеки структурированные данные.

Голосовая команда: "${input.command}"

${input.context ? `Контекст:
- Текущие комнаты: ${input.context.currentRooms?.join(', ') || 'не указаны'}
- Текущие позиции: ${input.context.currentItems?.join(', ') || 'не указаны'}
- Тип проекта: ${input.context.projectType || 'не указан'}` : ''}

Определи:
1. action: действие (add - добавить, remove - удалить, update - обновить, calculate - рассчитать, query - запрос информации)
2. target: что именно (работа, материал, комната)
3. quantity: количество (число)
4. unit: единица измерения (м², м³, шт, и т.д.)
5. room: комната/зона (кухня, ванная, спальня и т.д.)
6. material: материал если указан
7. notes: дополнительные заметки
8. confidence: уверенность в распознавании (0-100)

Примеры команд:
- "Добавь кухню 12 квадратов с ламинатом" → action: add, target: полы, room: кухня, quantity: 12, unit: м², material: ламинат
- "Убери штукатурку из ванной" → action: remove, target: штукатурка, room: ванная
- "Сколько стоит плитка?" → action: query, target: плитка
- "Обнови площадь спальни на 15 метров" → action: update, target: площадь, room: спальня, quantity: 15, unit: м²

Ответь в формате JSON.`

    const response = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt,
      output: { schema: VoiceCommandOutputSchema },
    })

    return response.output || {
      action: 'query' as const,
      target: input.command,
      confidence: 50,
    }
  }
)

// Command patterns for offline processing
const commandPatterns = [
  { pattern: /добав[ьи]?\s+(.+)/i, action: 'add' as const },
  { pattern: /убер[иь]?\s+(.+)/i, action: 'remove' as const },
  { pattern: /удал[иь]?\s+(.+)/i, action: 'remove' as const },
  { pattern: /обнов[иь]?\s+(.+)/i, action: 'update' as const },
  { pattern: /измен[иь]?\s+(.+)/i, action: 'update' as const },
  { pattern: /рассчита[йь]?\s+(.+)/i, action: 'calculate' as const },
  { pattern: /посчита[йь]?\s+(.+)/i, action: 'calculate' as const },
  { pattern: /сколько\s+(.+)/i, action: 'query' as const },
  { pattern: /как[ая]?\s+цен[аы]?\s+(.+)/i, action: 'query' as const },
]

const roomPatterns = [
  { pattern: /кухн[яиею]/i, room: 'кухня' },
  { pattern: /ванн[аяуой]/i, room: 'ванная' },
  { pattern: /спальн[яиею]/i, room: 'спальня' },
  { pattern: /гостин[аяуой]/i, room: 'гостиная' },
  { pattern: /коридор/i, room: 'коридор' },
  { pattern: /прихож[аяуой]/i, room: 'прихожая' },
  { pattern: /балкон/i, room: 'балкон' },
  { pattern: /туалет/i, room: 'туалет' },
  { pattern: /детск[аяуой]/i, room: 'детская' },
  { pattern: /кабинет/i, room: 'кабинет' },
]

const materialPatterns = [
  { pattern: /ламинат/i, material: 'ламинат' },
  { pattern: /плитк[аиуой]/i, material: 'плитка' },
  { pattern: /паркет/i, material: 'паркет' },
  { pattern: /линолеум/i, material: 'линолеум' },
  { pattern: /обо[ийев]/i, material: 'обои' },
  { pattern: /краск[аиуой]/i, material: 'краска' },
  { pattern: /штукатурк[аиуой]/i, material: 'штукатурка' },
  { pattern: /гипсокартон/i, material: 'гипсокартон' },
  { pattern: /натяжн[ыоа][йеа]/i, material: 'натяжной потолок' },
]

const unitPatterns = [
  { pattern: /(\d+(?:[.,]\d+)?)\s*(?:квадрат|кв\.?\s*м|м²|метр[аов]*\s*квадрат)/i, unit: 'м²' },
  { pattern: /(\d+(?:[.,]\d+)?)\s*(?:куб|м³|метр[аов]*\s*куб)/i, unit: 'м³' },
  { pattern: /(\d+(?:[.,]\d+)?)\s*(?:штук|шт)/i, unit: 'шт' },
  { pattern: /(\d+(?:[.,]\d+)?)\s*(?:погон|п\.?\s*м|метр[аов]*\s*погон)/i, unit: 'м.п.' },
  { pattern: /(\d+(?:[.,]\d+)?)\s*метр/i, unit: 'м' },
]

/**
 * Parse voice command locally without AI (fallback)
 */
export function parseVoiceCommandLocal(command: string): VoiceCommand {
  let action: VoiceCommand['action'] = 'query'
  let target = command
  let quantity: number | undefined
  let unit: string | undefined
  let room: string | undefined
  let material: string | undefined

  // Detect action
  for (const { pattern, action: act } of commandPatterns) {
    const match = command.match(pattern)
    if (match) {
      action = act
      target = match[1] || command
      break
    }
  }

  // Detect room
  for (const { pattern, room: r } of roomPatterns) {
    if (pattern.test(command)) {
      room = r
      break
    }
  }

  // Detect material
  for (const { pattern, material: m } of materialPatterns) {
    if (pattern.test(command)) {
      material = m
      break
    }
  }

  // Detect quantity and unit
  for (const { pattern, unit: u } of unitPatterns) {
    const match = command.match(pattern)
    if (match) {
      quantity = parseFloat(match[1].replace(',', '.'))
      unit = u
      break
    }
  }

  // Fallback: try to find any number
  if (!quantity) {
    const numMatch = command.match(/(\d+(?:[.,]\d+)?)/i)
    if (numMatch) {
      quantity = parseFloat(numMatch[1].replace(',', '.'))
    }
  }

  return {
    action,
    target: target.trim(),
    quantity,
    unit,
    room,
    material,
  }
}

export type { VoiceCommand }
