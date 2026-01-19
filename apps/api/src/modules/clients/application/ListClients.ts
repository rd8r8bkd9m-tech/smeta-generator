import type { ClientRepository } from '../domain/ClientRepository.js'
import type { UseCase } from '../../shared/application/UseCase.js'
import type { ClientDTO } from './types.js'

export interface ListClientsInput {
  userId?: string
}

export class ListClients implements UseCase<ListClientsInput, ClientDTO[]> {
  constructor(private readonly repository: ClientRepository) {}

  async execute(input: ListClientsInput): Promise<ClientDTO[]> {
    const clients = await this.repository.findAll(input.userId)
    return clients.map((client) => client.toJSON())
  }
}
