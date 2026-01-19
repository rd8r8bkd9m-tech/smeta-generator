import { DomainError } from './DomainError.js'

export class UniqueEntityId {
  private readonly value: string

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new DomainError('Entity id is required', 'INVALID_ENTITY_ID')
    }
    this.value = value
  }

  toString() {
    return this.value
  }
}
