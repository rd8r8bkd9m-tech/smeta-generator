import Dexie, { type Table } from 'dexie';
import { Estimate, Project, Client } from '@smeta/types';

export class SmetaDatabase extends Dexie {
  estimates!: Table<Estimate>;
  projects!: Table<Project>;
  clients!: Table<Client>;

  constructor() {
    super('SmetaDB');
    this.version(1).stores({
      estimates: '++id, name, userId, projectId, status, createdAt, updatedAt',
      projects: '++id, name, userId, status, createdAt, updatedAt',
      clients: '++id, name, userId, email, createdAt'
    });
  }
}

export const db = new SmetaDatabase();
