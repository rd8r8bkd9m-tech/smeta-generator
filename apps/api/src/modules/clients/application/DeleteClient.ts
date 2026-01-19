import type { ClientRepository } from '../domain/ClientRepository.js'
import type { UseCase } from '../../shared/application/UseCase.js'

export interface DeleteClientInput {
  id: string
}

export class DeleteClient implements UseCase<DeleteClientInput, void> {
  constructor(private readonly repository: ClientRepository) {}

  async execute(input: DeleteClientInput): Promise<void> {
    await this.repository.delete(input.id)
  }
}
