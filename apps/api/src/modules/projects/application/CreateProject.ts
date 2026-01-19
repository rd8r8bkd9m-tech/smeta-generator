import { Project } from '../domain/Project.js'
import type { ProjectRepository } from '../domain/ProjectRepository.js'
import type { UseCase } from '../../shared/application/UseCase.js'
import type { UserResolver } from '../../shared/application/UserResolver.js'
import type { CreateProjectInput, ProjectDTO } from './types.js'
import { UniqueEntityId } from '../../shared/domain/UniqueEntityId.js'

export class CreateProject implements UseCase<CreateProjectInput, ProjectDTO> {
  constructor(
    private readonly repository: ProjectRepository,
    private readonly userResolver: UserResolver
  ) {}

  async execute(input: CreateProjectInput): Promise<ProjectDTO> {
    const userId = await this.userResolver.resolve(input.userId)
    const now = new Date()

    const project = Project.create(
      {
        name: input.name,
        description: input.description ?? null,
        status: input.status ?? 'DRAFT',
        totalAmount: 0,
        clientId: input.clientId ?? null,
        client: null,
        estimates: [],
        userId,
        createdAt: now,
        updatedAt: now,
      },
      new UniqueEntityId(crypto.randomUUID())
    )

    const saved = await this.repository.create(project)
    return saved.toJSON()
  }
}
