import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@smeta-pro.ru' },
    update: {},
    create: {
      email: 'admin@smeta-pro.ru',
      name: 'Администратор',
      password: adminPassword,
      role: 'ADMIN',
    },
  })
  console.log('✅ Created admin user:', admin.email)

  // Create test user
  const userPassword = await bcrypt.hash('user123', 10)
  const user = await prisma.user.upsert({
    where: { email: 'user@smeta-pro.ru' },
    update: {},
    create: {
      email: 'user@smeta-pro.ru',
      name: 'Тестовый пользователь',
      password: userPassword,
      role: 'USER',
    },
  })
  console.log('✅ Created test user:', user.email)

  // Create sample clients
  const client1 = await prisma.client.create({
    data: {
      name: 'ООО "Технологии Будущего"',
      type: 'COMPANY',
      contact: 'Иванов Иван Иванович',
      phone: '+7 (495) 123-45-67',
      email: 'info@techfuture.ru',
      inn: '7712345678',
      kpp: '771201001',
      userId: user.id,
    },
  })
  console.log('✅ Created client:', client1.name)

  const client2 = await prisma.client.create({
    data: {
      name: 'ИП Петров А.С.',
      type: 'INDIVIDUAL',
      contact: 'Петров Алексей Сергеевич',
      phone: '+7 (916) 987-65-43',
      email: 'petrov.as@mail.ru',
      inn: '771234567890',
      userId: user.id,
    },
  })
  console.log('✅ Created client:', client2.name)

  // Create sample project
  const project = await prisma.project.create({
    data: {
      name: 'Ремонт офиса "Технопарк"',
      description: 'Капитальный ремонт офисного помещения площадью 150 м²',
      status: 'IN_PROGRESS',
      totalAmount: 1250000,
      userId: user.id,
      clientId: client1.id,
    },
  })
  console.log('✅ Created project:', project.name)

  // Create sample estimate
  const estimate = await prisma.estimate.create({
    data: {
      name: 'Смета на отделочные работы',
      description: 'Штукатурка, шпаклевка, покраска стен',
      items: [
        { id: 'work-1', name: 'Штукатурка стен', unit: 'м²', quantity: 300, price: 450 },
        { id: 'work-2', name: 'Шпаклевка стен', unit: 'м²', quantity: 300, price: 280 },
        { id: 'work-3', name: 'Покраска стен', unit: 'м²', quantity: 300, price: 180 },
      ],
      subtotal: 273000,
      overhead: 32760,
      profit: 24460.8,
      total: 396265,
      options: {
        overheadRate: 0.12,
        profitRate: 0.08,
        vatRate: 0.20,
        includeVat: true,
      },
      userId: user.id,
      projectId: project.id,
    },
  })
  console.log('✅ Created estimate:', estimate.name)

  // Create sample normatives
  const normatives = [
    {
      code: 'ФЕР11-01-001-01',
      name: 'Кладка перегородок из кирпича',
      unit: 'м³',
      price: 4500,
      type: 'FER' as const,
      category: 'Кладка',
    },
    {
      code: 'ФЕР15-02-001-01',
      name: 'Штукатурка стен цементным раствором',
      unit: 'м²',
      price: 450,
      type: 'FER' as const,
      category: 'Отделка',
    },
    {
      code: 'ФЕР15-02-002-01',
      name: 'Шпаклевка стен',
      unit: 'м²',
      price: 280,
      type: 'FER' as const,
      category: 'Отделка',
    },
    {
      code: 'ФЕР15-04-001-01',
      name: 'Покраска стен водоэмульсионной краской',
      unit: 'м²',
      price: 180,
      type: 'FER' as const,
      category: 'Отделка',
    },
    {
      code: 'ФЕР11-01-002-01',
      name: 'Демонтаж перегородок кирпичных',
      unit: 'м³',
      price: 1250,
      type: 'FER' as const,
      category: 'Демонтаж',
    },
  ]

  for (const normative of normatives) {
    await prisma.normative.upsert({
      where: { code: normative.code },
      update: {},
      create: normative,
    })
  }
  console.log('✅ Created normatives:', normatives.length)

  // Create sample materials
  const materials = [
    { code: 'М-001', name: 'Кирпич керамический М150', unit: 'шт', price: 12, category: 'Кладочные материалы' },
    { code: 'М-002', name: 'Цемент М500', unit: 'кг', price: 8, category: 'Вяжущие' },
    { code: 'М-003', name: 'Песок строительный', unit: 'м³', price: 1200, category: 'Заполнители' },
    { code: 'М-004', name: 'Штукатурка гипсовая', unit: 'кг', price: 15, category: 'Отделочные материалы' },
    { code: 'М-005', name: 'Краска водоэмульсионная', unit: 'л', price: 350, category: 'Лакокрасочные материалы' },
  ]

  for (const material of materials) {
    await prisma.material.upsert({
      where: { code: material.code },
      update: {},
      create: material,
    })
  }
  console.log('✅ Created materials:', materials.length)

  console.log('🎉 Database seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
