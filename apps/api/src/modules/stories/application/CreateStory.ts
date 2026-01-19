import { Story } from '../domain/Story.js'
import type { StoryRepository } from '../domain/StoryRepository.js'
import type { UseCase } from '../../shared/application/UseCase.js'
import { UniqueEntityId } from '../../shared/domain/UniqueEntityId.js'

export interface CreateStoryInput {
  userId: string
  type: 'TEXT' | 'IMAGE' | 'VIDEO'
  content: string
  background?: string | null
}

export interface StoryDTO {
  id: string
  userId: string
  type: string
  content: string
  background?: string | null
  status: string
  expiresAt: Date
  viewsCount: number
  createdAt: Date
  updatedAt: Date
}

export class CreateStory implements UseCase<CreateStoryInput, StoryDTO> {
  constructor(private readonly repository: StoryRepository) {}

  async execute(input: CreateStoryInput): Promise<StoryDTO> {
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24 hours

    const story = Story.create(
      {
        userId: input.userId,
        type: input.type as any,
        content: input.content,
        background: input.background,
        status: 'ACTIVE',
        expiresAt,
        viewsCount: 0,
        createdAt: now,
        updatedAt: now,
      },
      new UniqueEntityId(crypto.randomUUID())
    )

    await this.repository.save(story)
    return story.toJSON() as any
  }
}
