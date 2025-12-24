/**
 * Schema Management API Service
 * Database schema management and migrations
 */

import { apiClient } from '@services/infrastructure/apiClient';

export interface SchemaInfo {
  tables: {
    name: string;
    columns: {
      name: string;
      type: string;
      nullable: boolean;
      default?: unknown;
    }[];
    indexes: {
      name: string;
      columns: string[];
      unique: boolean;
    }[];
    constraints: {
      name: string;
      type: 'PRIMARY KEY' | 'FOREIGN KEY' | 'UNIQUE' | 'CHECK';
      definition: string;
    }[];
  }[];
  views: {
    name: string;
    definition: string;
  }[];
  functions: {
    name: string;
    returnType: string;
  }[];
}

export interface Migration {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'rolled_back';
  sql: string;
  appliedAt?: string;
  rolledBackAt?: string;
  error?: string;
}

export class SchemaManagementApiService {
  private readonly baseUrl = '/schema-management';

  async getSchema(): Promise<SchemaInfo> {
    return apiClient.get<SchemaInfo>(`${this.baseUrl}/schema`);
  }

  async getMigrations(): Promise<Migration[]> {
    return apiClient.get<Migration[]>(`${this.baseUrl}/migrations`);
  }

  async runMigration(id: string): Promise<Migration> {
    return apiClient.post<Migration>(`${this.baseUrl}/migrations/${id}/run`, {});
  }

  async rollback(id: string): Promise<Migration> {
    return apiClient.post<Migration>(`${this.baseUrl}/migrations/${id}/rollback`, {});
  }

  async createMigration(data: { name: string; sql: string }): Promise<Migration> {
    return apiClient.post<Migration>(`${this.baseUrl}/migrations`, data);
  }
}
