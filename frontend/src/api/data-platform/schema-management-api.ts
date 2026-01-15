/**
 * @module services/api/data-platform/schema-management-api
 * @description Schema management API service
 * Handles database schema inspection, migrations, and snapshots
 * 
 * @responsibility Manage database schema operations
 */

import { apiClient } from '@/services/infrastructure/apiClient';

/**
 * Schema table interface
 */
export interface SchemaTable {
  name: string;
  columnCount: number;
  columns: {
    name: string;
    type: string;
    pk?: boolean;
    notNull?: boolean;
    unique?: boolean;
    fk?: string;
    defaultValue?: string;
  }[];
}

/**
 * Migration interface
 */
export interface Migration {
  id: string;
  name: string;
  description?: string;
  applied: boolean;
  createdAt: string;
  appliedAt?: string;
  appliedBy?: string;
}

/**
 * Schema snapshot interface
 */
export interface Snapshot {
  id: string;
  name: string;
  description?: string;
  sizeBytes: number;
  createdAt: string;
  createdBy?: string;
}

/**
 * Schema management API service class
 * Provides methods for schema inspection, migrations, and snapshots
 */
export class SchemaManagementApiService {
// ====================
Schema Inspection ====================
  
  /**
   * Get all tables in the database
   */
  async getTables(): Promise<SchemaTable[]> {
    try {
      return await apiClient.get<SchemaTable[]>('/schema/tables');
    } catch (error) {
      console.error('[SchemaManagementApi] Error fetching tables:', error);
      return [];
    }
  }

  /**
   * Get columns for a specific table
   */
  async getTableColumns(tableName: string): Promise<unknown[]> {
    try {
      return await apiClient.get<unknown[]>(`/schema/tables/${tableName}/columns`);
    } catch (error) {
      console.error('[SchemaManagementApi] Error fetching columns:', error);
      return [];
    }
  }

// ====================
Migrations ====================
  
  /**
   * Get all migrations
   */
  async getMigrations(): Promise<Migration[]> {
    try {
      return await apiClient.get<Migration[]>('/schema/migrations');
    } catch (error) {
      console.error('[SchemaManagementApi] Error fetching migrations:', error);
      return [];
    }
  }

  /**
   * Create a new migration
   */
  async createMigration(data: { 
    name: string; 
    up: string; 
    down: string; 
    description?: string 
  }): Promise<Migration> {
    return await apiClient.post<Migration>('/schema/migrations', data);
  }

  /**
   * Apply a migration
   */
  async applyMigration(id: string): Promise<Migration> {
    return await apiClient.post<Migration>(`/schema/migrations/${id}/apply`, {});
  }

  /**
   * Revert a migration
   */
  async revertMigration(id: string): Promise<Migration> {
    return await apiClient.post<Migration>(`/schema/migrations/${id}/revert`, {});
  }

// ====================
Snapshots ====================
  
  /**
   * Get all schema snapshots
   */
  async getSnapshots(): Promise<Snapshot[]> {
    try {
      return await apiClient.get<Snapshot[]>('/schema/snapshots');
    } catch (error) {
      console.error('[SchemaManagementApi] Error fetching snapshots:', error);
      return [];
    }
  }

  /**
   * Get a specific snapshot
   */
  async getSnapshot(id: string): Promise<Snapshot> {
    return await apiClient.get<Snapshot>(`/schema/snapshots/${id}`);
  }

  /**
   * Create a new snapshot
   */
  async createSnapshot(data: { 
    name: string; 
    description?: string; 
    tables?: string[] 
  }): Promise<Snapshot> {
    return await apiClient.post<Snapshot>('/schema/snapshots', data);
  }

  /**
   * Delete a snapshot
   */
  async deleteSnapshot(id: string): Promise<void> {
    await apiClient.delete(`/schema/snapshots/${id}`);
  }

// ====================
Table Operations ====================
  
  /**
   * Create a new table
   */
  async createTable(data: {
    name: string;
    columns: Record<string, unknown>[];
    description?: string;
  }): Promise<{ success: boolean; table: string }> {
    return await apiClient.post('/schema/tables', data);
  }

  /**
   * Drop a table
   */
  async dropTable(tableName: string): Promise<{ success: boolean; table: string }> {
    return await apiClient.delete(`/schema/tables/${tableName}`);
  }
}
