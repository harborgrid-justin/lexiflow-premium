/**
 * Type definitions for Data Sources Management domain
 * 
 * Defines the contracts for data source connections, providers,
 * and UI component props.
 */

/**
 * Status of a data source connection
 */
export type ConnectionStatus = 'active' | 'syncing' | 'degraded' | 'error' | 'disconnected';

/**
 * Supported data provider types
 */
export type DataProviderType = 'Snowflake' | 'PostgreSQL' | 'MongoDB' | 'S3';

/**
 * Data source connection configuration
 */
export interface DataSourceConnection {
  id: string;
  name: string;
  type: DataProviderType;
  status: ConnectionStatus;
  lastSync: string | null;
  region: string;
  host?: string;
  providerId?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Data provider definition for UI rendering
 */
export interface DataProvider {
  id: string;
  name: DataProviderType;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

/**
 * Form data for creating new data source connection
 */
export interface ConnectionFormData {
  name: string;
  host: string;
  region: string;
}

/**
 * Test connection result
 */
export interface ConnectionTestResult {
  success: boolean;
  message: string;
  timestamp: string;
}

/**
 * Sync operation result
 */
export interface SyncResult {
  success: boolean;
  timestamp: string;
  connectionId: string;
}

/**
 * Delete operation result
 */
export interface DeleteResult {
  success: boolean;
  deletedId: string;
  timestamp: string;
}
