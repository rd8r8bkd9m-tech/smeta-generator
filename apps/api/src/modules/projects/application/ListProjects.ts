import type { ProjectRepository } from '../domain/ProjectRepository.js'
import type { UseCase } from '../../shared/application/UseCase.js'
import type { ProjectDTO } from './types.js'

export interface ListProjectsInput {
  userId?: string
}

export class ListProjects implements UseCase<ListProjectsInput, ProjectDTO[]> {
  constructor(private readonly repository: ProjectRepository) {}

  async execute(input: ListProjectsInput): Promise<ProjectDTO[]> {
    const projects = await this.repository.findAll(input.userId)
    return projects.map((project) => project.toJSON())
  }
}
