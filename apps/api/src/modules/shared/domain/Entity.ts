import { UniqueEntityId } from './UniqueEntityId.js'

export abstract class Entity<TProps> {
  protected readonly _id: UniqueEntityId
  protected readonly props: TProps

  constructor(props: TProps, id?: UniqueEntityId) {
    this._id = id ?? new UniqueEntityId(crypto.randomUUID())
    this.props = props
  }

  get id(): UniqueEntityId {
    return this._id
  }

  equals(object?: Entity<TProps>): boolean {
    if (!object) return false
    if (object === this) return true
    return object.id.toString() === this._id.toString()
  }
}
