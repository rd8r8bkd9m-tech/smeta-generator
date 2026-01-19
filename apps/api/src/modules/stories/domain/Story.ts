import { Entity } from '../../shared/domain/Entity.js'
import { UniqueEntityId } from '../../shared/domain/UniqueEntityId.js'
import { DomainError } from '../../shared/domain/DomainError.js'

export type StoryType = 'TEXT' | 'IMAGE' | 'VIDEO'
export type StoryStatus = 'ACTIVE' | 'EXPIRED' | 'DELETED'

export interface StoryProps {
  userId: string
  type: StoryType
  content: string
  background?: string | null
  status: StoryStatus
  expiresAt: Date
  viewsCount: number
  createdAt: Date
  updatedAt: Date
}

export class Story extends Entity<StoryProps> {
  private constructor(props: StoryProps, id?: UniqueEntityId) {
    super(props, id)
  }

  static create(props: StoryProps, id?: UniqueEntityId) {
    if (!props.userId) {
      throw new DomainError('User ID is required', 'STORY_USER_ID_REQUIRED')
    }
    if (!props.content) {
      throw new DomainError('Content is required', 'STORY_CONTENT_REQUIRED')
    }
    return new Story(props, id)
  }

  toJSON() {
    return {
      id: this.id.toString(),
      ...this.props,
    }
  }
}
