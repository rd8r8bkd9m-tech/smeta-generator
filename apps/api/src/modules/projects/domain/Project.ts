import { Entity } from '../../shared/domain/Entity.js'
import { UniqueEntityId } from '../../shared/domain/UniqueEntityId.js'
import { DomainError } from '../../shared/domain/DomainError.js'

export type ProjectStatus = 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED'

export interface ProjectProps {
  name: string
  description?: string | null
  status: ProjectStatus
  totalAmount: number
  clientId?: string | null
  client?: { id: string; name: string } | null
  estimates?: Array<{ id: string; name: string; total: number }>
  userId: string
  createdAt: Date
  updatedAt: Date
}

export class Project extends Entity<ProjectProps> {
  private constructor(props: ProjectProps, id?: UniqueEntityId) {
    super(props, id)
  }

  static create(props: ProjectProps, id?: UniqueEntityId) {
    if (!props.name || props.name.trim().length === 0) {
      throw new DomainError('Project name is required', 'PROJECT_NAME_REQUIRED')
    }
    return new Project(props, id)
  }

  toJSON() {
    return {
      id: this.id.toString(),
      ...this.props,
    }
  }
}
