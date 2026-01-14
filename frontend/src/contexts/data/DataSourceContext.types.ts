/**
 * DataSource Context Types
 * Type definitions for data source management context
 */

export type DataSourceType = "backend" | "local" | "hybrid";

export interface DataSourceStateValue {
  type: DataSourceType;
  isConnected: boolean;
  isOnline: boolean;
  lastSync?: Date;
}

export interface DataSourceActionsValue {
  switchSource: (type: DataSourceType) => void;
  sync: () => Promise<void>;
  checkConnection: () => Promise<boolean>;
}

export interface DataSourceContextValue {
  state: DataSourceStateValue;
  actions: DataSourceActionsValue;
}

export interface DataSourceProviderProps {
  children: React.ReactNode;
  initialType?: DataSourceType;
}
