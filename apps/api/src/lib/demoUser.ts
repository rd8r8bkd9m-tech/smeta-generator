import bcrypt from 'bcryptjs'
import prisma from './prisma.js'

const DEMO_USER_ID = 'demo-user-001'
const DEMO_EMAIL = 'demo@denidom.ru'
const DEMO_PASSWORD = 'demo123'

export async function getOrCreateDemoUser(userId?: string): Promise<string> {
  if (userId) {
    const existing = await prisma.user.findUnique({ where: { id: userId } })
    if (existing) {
      return existing.id
    }
  }

  const demoById = await prisma.user.findUnique({ where: { id: DEMO_USER_ID } })
  if (demoById) {
    return demoById.id
  }

  const demoByEmail = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } })
  if (demoByEmail) {
    return demoByEmail.id
  }

  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10)
  const demoUser = await prisma.user.create({
    data: {
      id: DEMO_USER_ID,
      email: DEMO_EMAIL,
      name: 'Демо пользователь',
      password: hashedPassword,
      role: 'USER',
    },
  })

  return demoUser.id
}
