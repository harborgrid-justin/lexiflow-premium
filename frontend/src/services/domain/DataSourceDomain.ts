/**
 * DataSourceDomain - External data source integration service
 * Provides connection management, synchronization, and data source testing
 * ? Migrated to backend API (2025-12-21)
 */

import { delay } from '@/utils/async';
import { db} from '@/services/data/db';

interface DataSource {
  id: string;
  name: string;
  type: 'postgresql' | 'mysql' | 'mongodb' | 'salesforce' | 'google-drive' | 'sharepoint';
  host?: string;
  port?: number;
  database?: string;
  connected: boolean;
  lastSync?: string;
  syncInterval?: number;
  metadata?: unknown;
}

interface ConnectionStatus {
  connected: boolean;
  latency?: number;
  error?: string;
  version?: string;
}

const DATA_SOURCES_STORE = 'data_sources';

export const DataSourceService = {
  getAll: async () => db.getAll(DATA_SOURCES_STORE),
  getById: async (id: string) => db.get(DATA_SOURCES_STORE, id),
  add: async (item: unknown) => db.put(DATA_SOURCES_STORE, {
    ...(item && typeof item === 'object' ? item : {}),
    connected: false,
    createdAt: new Date().toISOString()
  }),
  update: async (id: string, updates: unknown) => {
    const existing = await db.get(DATA_SOURCES_STORE, id);
    return db.put(DATA_SOURCES_STORE, {
      ...(existing && typeof existing === 'object' ? existing : {}),
      ...(updates && typeof updates === 'object' ? updates : {})
    });
  },
  delete: async (id: string) => db.delete(DATA_SOURCES_STORE, id),

  // Data source specific methods
  getDataSources: async (filters?: { type?: string; connected?: boolean }): Promise<DataSource[]> => {
    let sources = await db.getAll<DataSource>(DATA_SOURCES_STORE);

    if (filters?.type) {
      sources = sources.filter((s: DataSource) => s.type === filters.type);
    }

    if (filters?.connected !== undefined) {
      sources = sources.filter((s: DataSource) => s.connected === filters.connected);
    }

    return sources;
  },
  
  connect: async (sourceId: string): Promise<boolean> => {
    await delay(300); // Simulate connection
    try {
      const source = await db.get<DataSource>(DATA_SOURCES_STORE, sourceId);
      if (!source) throw new Error('Source not found');

      // In production, this would establish real database connection
      await db.put(DATA_SOURCES_STORE, {
        ...source,
        connected: true,
        lastSync: new Date().toISOString()
      });

      console.log(`[DataSourceService] Connected to ${source.name}`);
      return true;
    } catch (err) {
      console.error('[DataSourceService] Connection failed:', err);
      return false;
    }
  },

  disconnect: async (sourceId: string): Promise<boolean> => {
    await delay(100);
    try {
      const source = await db.get<DataSource>(DATA_SOURCES_STORE, sourceId);
      if (!source) return false;

      await db.put(DATA_SOURCES_STORE, {
        ...source,
        connected: false
      });

      console.log(`[DataSourceService] Disconnected from ${source.name}`);
      return true;
    } catch {
      return false;
    }
  },

  sync: async (sourceId: string, options?: { fullSync?: boolean }): Promise<boolean> => {
    await delay(500); // Simulate sync operation
    try {
      const source = await db.get<DataSource>(DATA_SOURCES_STORE, sourceId);
      if (!source || !source.connected) {
        throw new Error('Source not connected');
      }

      // In production, this would pull data from external source
      await db.put(DATA_SOURCES_STORE, {
        ...source,
        lastSync: new Date().toISOString()
      });

      console.log(`[DataSourceService] Synced ${source.name} (${options?.fullSync ? 'full' : 'incremental'})`);
      return true;
    } catch (err) {
      console.error('[DataSourceService] Sync failed:', err);
      return false;
    }
  },

  testConnection: async (sourceId: string): Promise<ConnectionStatus> => {
    await delay(200);
    try {
      const source = await db.get<DataSource>(DATA_SOURCES_STORE, sourceId);
      if (!source) {
        return { connected: false, error: 'Source not found' };
      }
      
      // Simulate connection test
      const latency = Math.floor(Math.random() * 100) + 20;
      
      return {
        connected: true,
        latency,
        version: '14.5', // Mock database version
      };
    } catch (err) {
      return {
        connected: false,
        error: err instanceof Error ? err.message : 'Connection failed',
      };
    }
  },
};
