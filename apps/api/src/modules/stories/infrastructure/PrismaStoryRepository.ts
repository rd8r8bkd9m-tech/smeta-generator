import type { PrismaClient, StoryType as PrismaStoryType, StoryStatus as PrismaStoryStatus } from '@prisma/client'
import { Story } from '../domain/Story.js'
import { UniqueEntityId } from '../../shared/domain/UniqueEntityId.js'
import type { StoryRepository } from '../domain/StoryRepository.js'

export class PrismaStoryRepository implements StoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(story: Story): Promise<void> {
    const props = story.toJSON()
    await this.prisma.story.create({
      data: {
        id: props.id,
        userId: props.userId,
        type: props.type as PrismaStoryType,
        content: props.content,
        background: props.background,
        status: props.status as PrismaStoryStatus,
        expiresAt: props.expiresAt,
        viewsCount: props.viewsCount,
      },
    })
  }

  async findById(id: string): Promise<Story | null> {
    const story = await this.prisma.story.findUnique({
      where: { id },
    })

    if (!story) return null

    return Story.create(
      {
        userId: story.userId,
        type: story.type as any,
        content: story.content,
        background: story.background,
        status: story.status as any,
        expiresAt: story.expiresAt,
        viewsCount: story.viewsCount,
        createdAt: story.createdAt,
        updatedAt: story.updatedAt,
      },
      new UniqueEntityId(story.id)
    )
  }

  async findByUserId(userId: string): Promise<Story[]> {
    const stories = await this.prisma.story.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    return stories.map((story) =>
      Story.create(
        {
          userId: story.userId,
          type: story.type as any,
          content: story.content,
          background: story.background,
          status: story.status as any,
          expiresAt: story.expiresAt,
          viewsCount: story.viewsCount,
          createdAt: story.createdAt,
          updatedAt: story.updatedAt,
        },
        new UniqueEntityId(story.id)
      )
    )
  }

  async findAllActive(): Promise<Story[]> {
    const now = new Date()
    const stories = await this.prisma.story.findMany({
      where: {
        status: 'ACTIVE',
        expiresAt: { gt: now },
      },
      orderBy: { createdAt: 'desc' },
    })

    return stories.map((story) =>
      Story.create(
        {
          userId: story.userId,
          type: story.type as any,
          content: story.content,
          background: story.background,
          status: story.status as any,
          expiresAt: story.expiresAt,
          viewsCount: story.viewsCount,
          createdAt: story.createdAt,
          updatedAt: story.updatedAt,
        },
        new UniqueEntityId(story.id)
      )
    )
  }

  async update(story: Story): Promise<void> {
    const props = story.toJSON()
    await this.prisma.story.update({
      where: { id: props.id },
      data: {
        type: props.type as PrismaStoryType,
        content: props.content,
        background: props.background,
        status: props.status as PrismaStoryStatus,
        expiresAt: props.expiresAt,
        viewsCount: props.viewsCount,
      },
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.story.delete({ where: { id } })
  }
}
