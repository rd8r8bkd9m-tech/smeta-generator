import type { ClientRepository } from '../domain/ClientRepository.js'
import type { UseCase } from '../../shared/application/UseCase.js'
import type { ClientDTO, UpdateClientInput } from './types.js'

export interface UpdateClientCommand {
  id: string
  data: UpdateClientInput
}

export class UpdateClient implements UseCase<UpdateClientCommand, ClientDTO | null> {
  constructor(private readonly repository: ClientRepository) {}

  async execute(input: UpdateClientCommand): Promise<ClientDTO | null> {
    const updated = await this.repository.update(input.id, input.data)
    return updated ? updated.toJSON() : null
  }
}
