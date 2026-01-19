import type { ClientRepository } from '../domain/ClientRepository.js'
import type { UseCase } from '../../shared/application/UseCase.js'
import type { ClientDTO } from './types.js'

export interface GetClientInput {
  id: string
}

export class GetClient implements UseCase<GetClientInput, ClientDTO | null> {
  constructor(private readonly repository: ClientRepository) {}

  async execute(input: GetClientInput): Promise<ClientDTO | null> {
    const client = await this.repository.findById(input.id)
    return client ? client.toJSON() : null
  }
}
