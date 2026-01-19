import type { ClientType } from '../domain/Client.js'

export interface ClientDTO {
  id: string
  name: string
  type: ClientType
  contact?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
  inn?: string | null
  kpp?: string | null
  notes?: string | null
  projects?: Array<{ id: string }>
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateClientInput {
  name: string
  type: ClientType
  contact?: string
  phone?: string
  email?: string | null
  address?: string
  inn?: string
  kpp?: string
  notes?: string
  userId?: string
}

export type UpdateClientInput = Partial<CreateClientInput>
