import type { ProjectStatus } from '../domain/Project.js'

export interface ProjectDTO {
  id: string
  name: string
  description?: string | null
  status: ProjectStatus
  totalAmount: number
  clientId?: string | null
  client?: { id: string; name: string } | null
  estimates?: Array<{ id: string; name: string; total: number }>
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateProjectInput {
  name: string
  description?: string
  clientId?: string | null
  status?: ProjectStatus
  userId?: string
}

export type UpdateProjectInput = Partial<CreateProjectInput>
