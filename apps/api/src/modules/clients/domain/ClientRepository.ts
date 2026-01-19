import type { Client } from './Client.js'

export interface ClientRepository {
  findAll(userId?: string): Promise<Client[]>
  findById(id: string): Promise<Client | null>
  create(client: Client): Promise<Client>
  update(id: string, client: Partial<Client>): Promise<Client>
  delete(id: string): Promise<void>
}
