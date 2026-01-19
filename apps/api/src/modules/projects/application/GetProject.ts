import type { ProjectRepository } from '../domain/ProjectRepository.js'
import type { UseCase } from '../../shared/application/UseCase.js'
import type { ProjectDTO } from './types.js'

export interface GetProjectInput {
  id: string
}

export class GetProject implements UseCase<GetProjectInput, ProjectDTO | null> {
  constructor(private readonly repository: ProjectRepository) {}

  async execute(input: GetProjectInput): Promise<ProjectDTO | null> {
    const project = await this.repository.findById(input.id)
    return project ? project.toJSON() : null
  }
}
