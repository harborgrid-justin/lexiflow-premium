import { createContext } from 'react';

export type DataSource = {
  id: string;
  name: string;
  type: 'Database' | 'API' | 'File' | 'Stream';
  status: 'Connected' | 'Disconnected' | 'Error';
  recordCount: number;
  lastSync: string;
};

export type RLSPolicy = {
  id: string;
  name: string;
  table: string;
  roles: string[];
  definition: string;
};

export type SchemaInfo = {
  name: string;
  tables: number;
  size: string;
};

export type SavedQuery = {
  id: string;
  name: string;
  query: string;
  lastExecuted: string;
};

export interface DataPlatformState {
  sources: DataSource[];
  policies: RLSPolicy[];
  schemas: SchemaInfo[];
  queries: SavedQuery[];
  typeFilter: 'all' | 'Database' | 'API' | 'File' | 'Stream';
}

export interface DataPlatformMetrics {
  totalSources: number;
  connectedCount: number;
  totalRecords: number;
}

export interface DataPlatformContextValue extends DataPlatformState {
  setTypeFilter: (filter: 'all' | 'Database' | 'API' | 'File' | 'Stream') => void;
  metrics: DataPlatformMetrics;
}

export const DataPlatformContext = createContext<DataPlatformContextValue | undefined>(undefined);
