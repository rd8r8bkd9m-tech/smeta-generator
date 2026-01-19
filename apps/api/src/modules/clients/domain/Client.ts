import { Entity } from '../../shared/domain/Entity.js'
import { UniqueEntityId } from '../../shared/domain/UniqueEntityId.js'
import { DomainError } from '../../shared/domain/DomainError.js'

export type ClientType = 'COMPANY' | 'INDIVIDUAL'

export interface ClientProps {
  name: string
  type: ClientType
  contact?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
  inn?: string | null
  kpp?: string | null
  notes?: string | null
  userId: string
  projects?: Array<{ id: string }>
  createdAt: Date
  updatedAt: Date
}

export class Client extends Entity<ClientProps> {
  private constructor(props: ClientProps, id?: UniqueEntityId) {
    super(props, id)
  }

  static create(props: ClientProps, id?: UniqueEntityId) {
    if (!props.name || props.name.trim().length === 0) {
      throw new DomainError('Client name is required', 'CLIENT_NAME_REQUIRED')
    }
    return new Client(props, id)
  }

  get name() {
    return this.props.name
  }

  toJSON() {
    return {
      id: this.id.toString(),
      ...this.props,
    }
  }
}
