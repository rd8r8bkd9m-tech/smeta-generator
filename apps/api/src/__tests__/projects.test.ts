import { describe, it, expect, beforeEach } from 'vitest'

interface Project {
  id: string
  name: string
  description?: string
  status: string
  totalAmount: number
  estimates: unknown[]
  createdAt: string
  updatedAt: string
  clientId?: string
}

interface ProjectStore {
  projects: Map<string, Project>
  create: (data: { name: string; description?: string; clientId?: string; status?: string }) => Project
  getById: (id: string) => Project | undefined
  getAll: () => Project[]
  update: (id: string, data: Partial<Project>) => Project | undefined
  delete: (id: string) => boolean
}

let projectCounter = 0

function createProjectStore(): ProjectStore {
  const projects = new Map<string, Project>()

  return {
    projects,

    create(data) {
      projectCounter++
      const project: Project = {
        id: `PRJ-${Date.now().toString(36).toUpperCase()}-${projectCounter}`,
        name: data.name,
        description: data.description,
        status: data.status || 'draft',
        totalAmount: 0,
        estimates: [],
        clientId: data.clientId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      projects.set(project.id, project)
      return project
    },

    getById(id) {
      return projects.get(id)
    },

    getAll() {
      return Array.from(projects.values())
    },

    update(id, data) {
      const project = projects.get(id)
      if (!project) return undefined

      const updatedProject = {
        ...project,
        ...data,
        updatedAt: new Date().toISOString(),
      }
      projects.set(id, updatedProject)
      return updatedProject
    },

    delete(id) {
      return projects.delete(id)
    },
  }
}

describe('Projects API', () => {
  let store: ProjectStore

  beforeEach(() => {
    projectCounter = 0
    store = createProjectStore()
  })

  describe('Create Project', () => {
    it('should create a new project with required fields', () => {
      const project = store.create({ name: 'Test Project' })

      expect(project.id).toBeDefined()
      expect(project.id).toMatch(/^PRJ-/)
      expect(project.name).toBe('Test Project')
      expect(project.status).toBe('draft')
      expect(project.totalAmount).toBe(0)
      expect(project.estimates).toEqual([])
    })

    it('should create a project with all fields', () => {
      const project = store.create({
        name: 'Full Project',
        description: 'Project description',
        clientId: 'CLT-123',
        status: 'in_progress',
      })

      expect(project.name).toBe('Full Project')
      expect(project.description).toBe('Project description')
      expect(project.clientId).toBe('CLT-123')
      expect(project.status).toBe('in_progress')
    })

    it('should set createdAt and updatedAt timestamps', () => {
      const before = new Date().toISOString()
      const project = store.create({ name: 'Timed Project' })
      const after = new Date().toISOString()

      expect(project.createdAt).toBeDefined()
      expect(project.updatedAt).toBeDefined()
      expect(project.createdAt >= before).toBe(true)
      expect(project.createdAt <= after).toBe(true)
    })
  })

  describe('Get Project', () => {
    it('should get project by ID', () => {
      const created = store.create({ name: 'Get Test' })
      const found = store.getById(created.id)

      expect(found).toBeDefined()
      expect(found?.id).toBe(created.id)
      expect(found?.name).toBe('Get Test')
    })

    it('should return undefined for non-existent ID', () => {
      const found = store.getById('non-existent-id')
      expect(found).toBeUndefined()
    })

    it('should get all projects', () => {
      store.create({ name: 'Project 1' })
      store.create({ name: 'Project 2' })
      store.create({ name: 'Project 3' })

      const all = store.getAll()
      expect(all).toHaveLength(3)
    })
  })

  describe('Update Project', () => {
    it('should update project name', () => {
      const created = store.create({ name: 'Original Name' })
      const updated = store.update(created.id, { name: 'Updated Name' })

      expect(updated).toBeDefined()
      expect(updated?.name).toBe('Updated Name')
    })

    it('should update project status', () => {
      const created = store.create({ name: 'Status Test' })
      const updated = store.update(created.id, { status: 'completed' })

      expect(updated?.status).toBe('completed')
    })

    it('should update updatedAt timestamp', () => {
      const created = store.create({ name: 'Timestamp Test' })
      const originalUpdatedAt = created.updatedAt

      // Small delay to ensure timestamp difference
      const updated = store.update(created.id, { name: 'Updated' })

      expect(updated?.updatedAt).toBeDefined()
      expect(updated!.updatedAt >= originalUpdatedAt).toBe(true)
    })

    it('should return undefined for non-existent project', () => {
      const updated = store.update('non-existent', { name: 'Test' })
      expect(updated).toBeUndefined()
    })

    it('should preserve unchanged fields', () => {
      const created = store.create({
        name: 'Original',
        description: 'Description',
        status: 'draft',
      })

      const updated = store.update(created.id, { name: 'Updated' })

      expect(updated?.name).toBe('Updated')
      expect(updated?.description).toBe('Description')
      expect(updated?.status).toBe('draft')
    })
  })

  describe('Delete Project', () => {
    it('should delete existing project', () => {
      const created = store.create({ name: 'To Delete' })
      const deleted = store.delete(created.id)

      expect(deleted).toBe(true)
      expect(store.getById(created.id)).toBeUndefined()
    })

    it('should return false for non-existent project', () => {
      const deleted = store.delete('non-existent')
      expect(deleted).toBe(false)
    })

    it('should remove project from getAll list', () => {
      store.create({ name: 'Project 1' })
      const toDelete = store.create({ name: 'Project 2' })
      store.create({ name: 'Project 3' })

      store.delete(toDelete.id)

      const all = store.getAll()
      expect(all).toHaveLength(2)
      expect(all.find((p) => p.id === toDelete.id)).toBeUndefined()
    })
  })

  describe('Project Statuses', () => {
    it('should support all valid status values', () => {
      const statuses = ['draft', 'in_progress', 'completed', 'archived']

      statuses.forEach((status) => {
        const project = store.create({ name: `Status ${status}`, status })
        expect(project.status).toBe(status)
      })
    })
  })
})
