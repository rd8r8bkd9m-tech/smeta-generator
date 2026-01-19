import { Entity } from '../../shared/domain/Entity.js'
import { UniqueEntityId } from '../../shared/domain/UniqueEntityId.js'
import { DomainError } from '../../shared/domain/DomainError.js'

export interface UserProps {
  email: string
  name: string
  avatar?: string | null
  phoneNumber?: string | null
  username?: string | null
  isOnline: boolean
  lastSeenAt?: Date | null
  bio?: string | null
  createdAt: Date
  updatedAt: Date
}

export class User extends Entity<UserProps> {
  private constructor(props: UserProps, id?: UniqueEntityId) {
    super(props, id)
  }

  static create(props: UserProps, id?: UniqueEntityId) {
    if (!props.email || props.email.trim().length === 0) {
      throw new DomainError('Email is required', 'USER_EMAIL_REQUIRED')
    }
    if (!props.name || props.name.trim().length === 0) {
      throw new DomainError('Name is required', 'USER_NAME_REQUIRED')
    }
    return new User(props, id)
  }

  get name() {
    return this.props.name
  }

  get email() {
    return this.props.email
  }

  toJSON() {
    return {
      id: this.id.toString(),
      ...this.props,
    }
  }
}
