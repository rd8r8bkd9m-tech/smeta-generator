import { Telegraf, Context, Markup } from 'telegraf'
import dotenv from 'dotenv'

dotenv.config()

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

if (!BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN is not set')
  process.exit(1)
}

const bot = new Telegraf(BOT_TOKEN)

// Session data storage (in production, use Redis or database)
const sessions: Map<number, { items: unknown[]; step: string }> = new Map()

// Start command
bot.command('start', async (ctx: Context) => {
  const keyboard = Markup.keyboard([
    ['📊 Новый расчет', '📋 Мои сметы'],
    ['📚 Каталог работ', '❓ Помощь'],
  ]).resize()

  await ctx.reply(
    '👋 Добро пожаловать в SMETA PRO Bot!\n\n' +
    'Я помогу вам быстро рассчитать стоимость строительных работ.\n\n' +
    'Выберите действие:',
    keyboard
  )
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
    '*Поддержка:* support@smeta-pro.ru',
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
console.log('🤖 Starting SMETA PRO Telegram Bot...')
bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

console.log('✅ Bot is running!')
