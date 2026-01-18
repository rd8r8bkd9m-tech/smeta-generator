export type LineItemId = string;
export type EstimateId = string;
export type VersionId = string;
export type UserId = string;
export type ProjectId = string;
export type ClientId = string;

export interface LineItem {
  id: LineItemId;
  parentId: LineItemId | null;
  name: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  sortOrder: number;
  children?: LineItem[];
}

export type EstimateStatus = 'draft' | 'ready' | 'archived';
export type SyncState = 'idle' | 'pending' | 'error';

export interface EstimateMetadata {
  id: EstimateId;
  code: string;
  name: string;
  customer?: string;
  tags: string[];
  status: EstimateStatus;
  lastSyncedAt?: number;
  updatedAt: number;
  createdAt: number;
  syncState: SyncState;
  userId: UserId;
  projectId?: ProjectId;
}

export interface Estimate extends EstimateMetadata {
  lineItems: LineItem[];
  subtotal: number;
  vatRate: number;
  total: number;
  overhead?: number;
  profit?: number;
}

export interface DiffChange<T> {
  field: keyof T;
  before: T[keyof T];
  after: T[keyof T];
}

export interface EstimateDiff {
  metadataChanges: DiffChange<EstimateMetadata>[];
  lineItemChanges: Array<{
    id: LineItemId;
    type: 'added' | 'removed' | 'updated';
    before?: LineItem;
    after?: LineItem;
  }>;
}

export interface EstimateVersion {
  id: VersionId;
  estimateId: EstimateId;
  createdAt: number;
  author: string;
  comment?: string;
  diffSummary: string;
  payload: Estimate;
}

export interface SyncQueueItem {
  id: string;
  estimateId: EstimateId;
  payload: Estimate;
  operation: 'create' | 'update' | 'delete';
  createdAt: number;
  updatedAt: number;
  attempts: number;
}

export interface User {
  id: UserId;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'MANAGER';
  avatar?: string;
}

export interface Project {
  id: ProjectId;
  name: string;
  description?: string;
  status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
  totalAmount: number;
  userId: UserId;
  clientId?: ClientId;
  createdAt: number;
  updatedAt: number;
}

export interface Client {
  id: ClientId;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  userId: UserId;
  createdAt: number;
  updatedAt: number;
}
