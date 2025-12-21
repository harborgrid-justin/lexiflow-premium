/**
 * Type definitions for Data Sources Manager
 */

export type ConnectionStatus = 'active' | 'syncing' | 'degraded' | 'error' | 'disconnected';

export interface DataConnection {
  id: string;
  name: string;
  type: string;
  region: string;
  status: ConnectionStatus;
  lastSync?: string;
}

export interface LocalStorageItem {
  name: string;
  size: string;
  modified: string;
}

export interface StoreInfo {
  name: string;
  records: number;
  size: string;
}

export interface ConnectionFormData {
  name: string;
  host: string;
  region: string;
}

export interface StoreRecord {
  id: string;
  [key: string]: unknown;
}

export interface CloudProvider {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export interface TestConnectionResult {
  success: boolean;
  message?: string;
}
