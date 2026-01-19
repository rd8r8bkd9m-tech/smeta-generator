import type { ProjectRepository } from '../domain/ProjectRepository.js'
import type { UseCase } from '../../shared/application/UseCase.js'
import type { ProjectDTO, UpdateProjectInput } from './types.js'

export interface UpdateProjectCommand {
  id: string
  data: UpdateProjectInput
}

export class UpdateProject implements UseCase<UpdateProjectCommand, ProjectDTO | null> {
  constructor(private readonly repository: ProjectRepository) {}

  async execute(input: UpdateProjectCommand): Promise<ProjectDTO | null> {
    const updated = await this.repository.update(input.id, input.data)
    return updated ? updated.toJSON() : null
  }
}
