import { Telegraf, Context, Markup } from 'telegraf'
import dotenv from 'dotenv'
import { generateEstimate, getEstimates } from './services/api.js'

dotenv.config()

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

if (!BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN is not set')
  process.exit(1)
}

const bot = new Telegraf(BOT_TOKEN)

// Session data storage (in production, use Redis or database)
const sessions: Map<number, { items: unknown[]; step: string; description?: string }> = new Map()

// Start command
bot.command('start', async (ctx: Context) => {
  const keyboard = Markup.keyboard([
    ['🤖 AI Генерация', '📊 Новый расчет'],
    ['📋 Мои сметы', '📚 Каталог работ'],
    ['❓ Помощь'],
  ]).resize()

  await ctx.reply(
    '👋 Добро пожаловать в ДениДом Bot!\n\n' +
    'Я помогу вам быстро рассчитать стоимость строительных работ.\n\n' +
    'Выберите действие:',
    keyboard
  )
})

// AI Generate command
bot.command('generate', async (ctx: Context) => {
  const chatId = ctx.chat?.id
  if (!chatId) return

  sessions.set(chatId, { items: [], step: 'waiting_for_description' })
  await ctx.reply('Опишите объект и работы для AI-генерации сметы (минимум 10 символов):')
})

// Handle AI generation
bot.on('text', async (ctx, next) => {
  const chatId = ctx.chat?.id
  if (!chatId) return next()

  const session = sessions.get(chatId)
  if (session?.step === 'waiting_for_description') {
    const description = ctx.message.text
    if (description.length < 10) {
      await ctx.reply('Описание слишком короткое. Пожалуйста, опишите работы подробнее.')
      return
    }

    await ctx.reply('🚀 Запускаю 5 ИИ-агентов для анализа... Это может занять до 30 секунд.')
    
    try {
      const result = await generateEstimate(description)
      if (result.success && result.data) {
        const { items, subtotal } = result.data
        let message = `✅ *Смета сгенерирована!*\n\n`
        message += `💰 *Итого:* ${new Intl.NumberFormat('ru-RU').format(subtotal)} ₽\n\n`
        message += `📋 *Основные позиции:*\n`
        
        items.slice(0, 10).forEach((item: any) => {
          message += `• ${item.name}: ${item.quantity} ${item.unit} x ${item.price} ₽\n`
        })
        
        if (items.length > 10) {
          message += `...и еще ${items.length - 10} позиций\n`
        }
        
        message += `\nПолную смету можно просмотреть в веб-панели.`
        
        await ctx.reply(message, { parse_mode: 'Markdown' })
      } else {
        await ctx.reply('❌ Не удалось сгенерировать смету. Попробуйте еще раз позже.')
      }
    } catch (error) {
      console.error('AI Gen error:', error)
      await ctx.reply('❌ Произошла ошибка при обращении к ИИ-сервису.')
    }
    
    session.step = ''
    sessions.set(chatId, session)
    return
  }
  
  if (ctx.message.text === '🤖 AI Генерация') {
    return bot.handleUpdate(ctx.update) // Re-trigger command logic or just call command
  }

  return next()
})

// Update handle text messages for buttons
bot.hears('🤖 AI Генерация', async (ctx) => {
  const chatId = ctx.chat?.id
  if (!chatId) return
  sessions.set(chatId, { items: [], step: 'waiting_for_description' })
  await ctx.reply('Опишите объект и работы для AI-генерации сметы (минимум 10 символов):')
})

bot.hears('📋 Мои сметы', async (ctx) => {
  const userId = ctx.from?.id.toString()
  if (!userId) return
  
  try {
    const estimates = await getEstimates(userId)
    if (estimates && estimates.length > 0) {
      let message = `📋 *Ваши последние сметы:*\n\n`
      estimates.slice(0, 5).forEach((e: any) => {
        message += `• ${e.name} (${new Intl.NumberFormat('ru-RU').format(e.total)} ₽)\n`
      })
      await ctx.reply(message, { parse_mode: 'Markdown' })
    } else {
      await ctx.reply('У вас пока нет сохраненных смет.')
    }
  } catch (error) {
    await ctx.reply('Не удалось загрузить список смет.')
  }
})

// Help command
bot.command('help', async (ctx: Context) => {
  await ctx.reply(
    '📖 *Помощь по использованию бота*\n\n' +
    '*Доступные команды:*\n' +
    '/start - Главное меню\n' +
    '/help - Справка\n' +
    '/calculate - Новый расчет\n' +
    '/estimates - Мои сметы\n' +
    '/catalog - Каталог работ\n\n' +
    '*Как создать смету:*\n' +
    '1. Нажмите "📊 Новый расчет"\n' +
    '2. Выберите работы из каталога\n' +
    '3. Укажите количество\n' +
    '4. Получите готовую смету\n\n' +
    '*Поддержка:* support@denidom.ru',
    { parse_mode: 'Markdown' }
  )
})

// Calculate command
bot.command('calculate', async (ctx: Context) => {
  const chatId = ctx.chat?.id
  if (!chatId) return

  sessions.set(chatId, { items: [], step: 'select_category' })

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('🔨 Демонтаж', 'category_demolition')],
    [Markup.button.callback('🧱 Кладка', 'category_masonry')],
    [Markup.button.callback('🎨 Отделка', 'category_finishing')],
    [Markup.button.callback('⚡ Электрика', 'category_electrical')],
    [Markup.button.callback('🚿 Сантехника', 'category_plumbing')],
    [Markup.button.callback('❌ Отмена', 'cancel')],
  ])

  await ctx.reply('Выберите категорию работ:', keyboard)
})

// Handle category selection
bot.action(/^category_(.+)$/, async (ctx) => {
  const category = ctx.match?.[1]
  const chatId = ctx.chat?.id
  if (!chatId || !category) return

  await ctx.answerCbQuery()

  const works: Record<string, { name: string; price: number; unit: string }[]> = {
    demolition: [
      { name: 'Демонтаж перегородок кирпичных', price: 1250, unit: 'м³' },
      { name: 'Демонтаж штукатурки', price: 150, unit: 'м²' },
      { name: 'Демонтаж плитки', price: 200, unit: 'м²' },
    ],
    masonry: [
      { name: 'Кладка перегородок из кирпича', price: 4500, unit: 'м³' },
      { name: 'Кладка стен из блоков', price: 3200, unit: 'м³' },
    ],
    finishing: [
      { name: 'Штукатурка стен', price: 450, unit: 'м²' },
      { name: 'Шпаклевка стен', price: 280, unit: 'м²' },
      { name: 'Покраска стен', price: 180, unit: 'м²' },
      { name: 'Укладка ламината', price: 350, unit: 'м²' },
    ],
    electrical: [
      { name: 'Прокладка кабеля', price: 120, unit: 'м.п.' },
      { name: 'Установка розетки', price: 350, unit: 'шт' },
      { name: 'Установка выключателя', price: 300, unit: 'шт' },
    ],
    plumbing: [
      { name: 'Установка унитаза', price: 3500, unit: 'шт' },
      { name: 'Установка раковины', price: 2500, unit: 'шт' },
      { name: 'Прокладка труб', price: 800, unit: 'м.п.' },
    ],
  }

  const categoryWorks = works[category] || []
  
  const buttons = categoryWorks.map((work, index) => [
    Markup.button.callback(
      `${work.name} (${work.price} ₽/${work.unit})`,
      `work_${category}_${index}`
    ),
  ])
  buttons.push([Markup.button.callback('⬅️ Назад', 'back_categories')])

  const keyboard = Markup.inlineKeyboard(buttons)
  await ctx.editMessageText('Выберите работу:', keyboard)
})

// Handle work selection
bot.action(/^work_(.+)_(\d+)$/, async (ctx) => {
  const chatId = ctx.chat?.id
  if (!chatId) return

  await ctx.answerCbQuery()

  const session = sessions.get(chatId) || { items: [], step: '' }
  session.step = 'enter_quantity'
  sessions.set(chatId, session)

  await ctx.reply('Введите количество (например: 50):')
})

// Handle cancel
bot.action('cancel', async (ctx) => {
  const chatId = ctx.chat?.id
  if (chatId) {
    sessions.delete(chatId)
  }
  await ctx.answerCbQuery('Отменено')
  await ctx.editMessageText('Расчет отменен.')
})

// Handle back to categories
bot.action('back_categories', async (ctx) => {
  await ctx.answerCbQuery()
  
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('🔨 Демонтаж', 'category_demolition')],
    [Markup.button.callback('🧱 Кладка', 'category_masonry')],
    [Markup.button.callback('🎨 Отделка', 'category_finishing')],
    [Markup.button.callback('⚡ Электрика', 'category_electrical')],
    [Markup.button.callback('🚿 Сантехника', 'category_plumbing')],
    [Markup.button.callback('❌ Отмена', 'cancel')],
  ])

  await ctx.editMessageText('Выберите категорию работ:', keyboard)
})

// Handle text messages
bot.on('text', async (ctx) => {
  const text = ctx.message.text

  if (text === '📊 Новый расчет') {
    await ctx.reply('Используйте команду /calculate для нового расчета')
  } else if (text === '📋 Мои сметы') {
    await ctx.reply('Функция в разработке. Скоро здесь будут ваши сметы.')
  } else if (text === '📚 Каталог работ') {
    await ctx.reply('Функция в разработке. Скоро здесь будет полный каталог работ.')
  } else if (text === '❓ Помощь') {
    await ctx.reply('Используйте команду /help для получения справки')
  }
})

// Error handler
bot.catch((err, ctx) => {
  console.error('Bot error:', err)
  ctx.reply('Произошла ошибка. Попробуйте еще раз.')
})

// Start bot
console.log('🤖 Starting ДениДом Telegram Bot...')
bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

console.log('✅ Bot is running!')
