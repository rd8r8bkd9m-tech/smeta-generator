// ============================================
// User Types
// ============================================

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export type UserRole = 'USER' | 'ADMIN' | 'MANAGER'

export interface AuthPayload {
  user: Pick<User, 'id' | 'email' | 'name'>
  token: string
}

// ============================================
// Client Types
// ============================================

export interface Client {
  id: string
  name: string
  type: ClientType
  contact?: string
  phone?: string
  email?: string
  address?: string
  inn?: string
  kpp?: string
  notes?: string
  projectsCount: number
  totalAmount: number
  createdAt: Date
  updatedAt: Date
}

export type ClientType = 'company' | 'individual'

export interface CreateClientDTO {
  name: string
  type: ClientType
  contact?: string
  phone?: string
  email?: string
  address?: string
  inn?: string
  kpp?: string
  notes?: string
}

export interface UpdateClientDTO extends Partial<CreateClientDTO> {}

// ============================================
// Project Types
// ============================================

export interface Project {
  id: string
  name: string
  description?: string
  status: ProjectStatus
  totalAmount: number
  clientId?: string
  client?: Client
  estimates: Estimate[]
  createdAt: Date
  updatedAt: Date
}

export type ProjectStatus = 'draft' | 'in_progress' | 'completed' | 'archived'

export interface CreateProjectDTO {
  name: string
  description?: string
  clientId?: string
  status?: ProjectStatus
}

export interface UpdateProjectDTO extends Partial<CreateProjectDTO> {}

// ============================================
// Estimate Types
// ============================================

export interface Estimate {
  id: string
  name: string
  description?: string
  items: EstimateItem[]
  subtotal: number
  overhead: number
  profit: number
  total: number
  options: CalculatorOptions
  projectId?: string
  createdAt: Date
  updatedAt: Date
}

export interface EstimateItem {
  id: string
  name: string
  unit: string
  quantity: number
  price: number
  coefficient?: number
  total: number
}

export interface CreateEstimateDTO {
  name: string
  description?: string
  items: Omit<EstimateItem, 'total'>[]
  options?: Partial<CalculatorOptions>
  projectId?: string
}

// ============================================
// Calculator Types
// ============================================

export interface CalculatorOptions {
  overheadRate: number
  profitRate: number
  vatRate: number
  includeVat: boolean
}

export interface CalculationResult {
  items: EstimateItem[]
  subtotal: number
  overhead: number
  profit: number
  vat: number
  total: number
}

export interface CalculatorItem {
  id: string
  name: string
  unit: string
  quantity: number
  price: number
  coefficient?: number
}

// ============================================
// Normative Types
// ============================================

export interface Normative {
  id: string
  code: string
  name: string
  unit: string
  price: number
  type: NormativeType
  category?: string
  description?: string
  materials?: MaterialRatio[]
  labor?: LaborRatio
  equipment?: EquipmentRatio[]
  validFrom: Date
  validTo?: Date
}

export type NormativeType = 'FER' | 'GESN' | 'TER' | 'TSN'

export interface MaterialRatio {
  id: string
  name: string
  unit: string
  ratio: number
}

export interface LaborRatio {
  workers: number
  hours: number
  rate: number
}

export interface EquipmentRatio {
  id: string
  name: string
  hours: number
  rate: number
}

// ============================================
// Material Types
// ============================================

export interface Material {
  id: string
  code: string
  name: string
  unit: string
  price: number
  category?: string
  supplier?: string
  description?: string
  validFrom: Date
  validTo?: Date
}

// ============================================
// Document Types
// ============================================

export interface DocumentTemplate {
  id: string
  name: string
  type: DocumentType
  format: DocumentFormat
  template: string
}

export type DocumentType = 'KS2' | 'KS3' | 'M29' | 'ESTIMATE' | 'INVOICE'
export type DocumentFormat = 'PDF' | 'XLSX' | 'DOCX'

// ============================================
// API Types
// ============================================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface PaginationParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// ============================================
// Utility Types
// ============================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type Nullable<T> = T | null

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
