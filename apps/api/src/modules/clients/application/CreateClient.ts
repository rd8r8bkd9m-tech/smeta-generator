import { Client } from '../domain/Client.js'
import type { ClientRepository } from '../domain/ClientRepository.js'
import type { UseCase } from '../../shared/application/UseCase.js'
import type { UserResolver } from '../../shared/application/UserResolver.js'
import type { ClientDTO, CreateClientInput } from './types.js'
import { UniqueEntityId } from '../../shared/domain/UniqueEntityId.js'

export class CreateClient implements UseCase<CreateClientInput, ClientDTO> {
  constructor(
    private readonly repository: ClientRepository,
    private readonly userResolver: UserResolver
  ) {}

  async execute(input: CreateClientInput): Promise<ClientDTO> {
    const userId = await this.userResolver.resolve(input.userId)
    const now = new Date()

    const client = Client.create(
      {
        name: input.name,
        type: input.type,
        contact: input.contact ?? null,
        phone: input.phone ?? null,
        email: input.email ?? null,
        address: input.address ?? null,
        inn: input.inn ?? null,
        kpp: input.kpp ?? null,
        notes: input.notes ?? null,
        userId,
        createdAt: now,
        updatedAt: now,
      },
      new UniqueEntityId(crypto.randomUUID())
    )

    const saved = await this.repository.create(client)
    return saved.toJSON()
  }
}
