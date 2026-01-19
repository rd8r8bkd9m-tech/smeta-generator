import type { PrismaClient } from '@prisma/client'
import { User } from '../domain/User.js'
import { UniqueEntityId } from '../../shared/domain/UniqueEntityId.js'
import type { UserRepository } from '../domain/UserRepository.js'

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(user: User): Promise<void> {
    const props = user.toJSON()
    await this.prisma.user.create({
      data: {
        id: props.id,
        email: props.email,
        name: props.name,
        password: '', // Should be handled in Auth service
        avatar: props.avatar,
        phoneNumber: props.phoneNumber,
        username: props.username,
        isOnline: props.isOnline,
        lastSeenAt: props.lastSeenAt,
        bio: props.bio,
      },
    })
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    })

    if (!user) return null

    return User.create(
      {
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        phoneNumber: user.phoneNumber,
        username: user.username,
        isOnline: user.isOnline,
        lastSeenAt: user.lastSeenAt,
        bio: user.bio,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      new UniqueEntityId(user.id)
    )
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    })

    if (!user) return null

    return User.create(
      {
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        phoneNumber: user.phoneNumber,
        username: user.username,
        isOnline: user.isOnline,
        lastSeenAt: user.lastSeenAt,
        bio: user.bio,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      new UniqueEntityId(user.id)
    )
  }

  async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { phoneNumber },
    })

    if (!user) return null

    return User.create(
      {
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        phoneNumber: user.phoneNumber,
        username: user.username,
        isOnline: user.isOnline,
        lastSeenAt: user.lastSeenAt,
        bio: user.bio,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      new UniqueEntityId(user.id)
    )
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { username },
    })

    if (!user) return null

    return User.create(
      {
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        phoneNumber: user.phoneNumber,
        username: user.username,
        isOnline: user.isOnline,
        lastSeenAt: user.lastSeenAt,
        bio: user.bio,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      new UniqueEntityId(user.id)
    )
  }

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { updatedAt: 'desc' },
    })

    return users.map((user) =>
      User.create(
        {
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          phoneNumber: user.phoneNumber,
          username: user.username,
          isOnline: user.isOnline,
          lastSeenAt: user.lastSeenAt,
          bio: user.bio,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        new UniqueEntityId(user.id)
      )
    )
  }

  async update(user: User): Promise<void> {
    const props = user.toJSON()
    await this.prisma.user.update({
      where: { id: props.id },
      data: {
        email: props.email,
        name: props.name,
        avatar: props.avatar,
        phoneNumber: props.phoneNumber,
        username: props.username,
        isOnline: props.isOnline,
        lastSeenAt: props.lastSeenAt,
        bio: props.bio,
      },
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } })
  }
}
