import type { UserRepository } from '../domain/UserRepository.js'
import type { UseCase } from '../../shared/application/UseCase.js'

export interface UserDTO {
  id: string
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

export class GetUser implements UseCase<string, UserDTO | null> {
  constructor(private readonly repository: UserRepository) {}

  async execute(id: string): Promise<UserDTO | null> {
    const user = await this.repository.findById(id)
    return user ? (user.toJSON() as any) : null
  }
}
