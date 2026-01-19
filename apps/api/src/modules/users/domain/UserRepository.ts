import { User } from './User.js'

export interface UserRepository {
  save(user: User): Promise<void>
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  findByPhoneNumber(phone: string): Promise<User | null>
  findByUsername(username: string): Promise<User | null>
  findAll(): Promise<User[]>
  update(user: User): Promise<void>
  delete(id: string): Promise<void>
}
