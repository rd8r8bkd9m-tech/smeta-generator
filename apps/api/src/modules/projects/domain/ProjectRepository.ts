import type { Project } from './Project.js'

export interface ProjectRepository {
  findAll(userId?: string): Promise<Project[]>
  findById(id: string): Promise<Project | null>
  create(project: Project): Promise<Project>
  update(id: string, data: Partial<Project>): Promise<Project | null>
  delete(id: string): Promise<void>
}
