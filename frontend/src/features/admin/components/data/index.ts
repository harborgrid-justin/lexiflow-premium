// Data sub-module exports
export { AdminDataRegistry } from "./AdminDataRegistry";
export { default as AdminDatabaseControl } from "./AdminDatabaseControl";
export { DataPlatformSidebar } from "./DataPlatformSidebar";
export { PlatformOverview } from "./PlatformOverview";
export { default as GovernanceConsole } from "./GovernanceConsole";
export { default as PipelineMonitor } from "./PipelineMonitor";
export { default as BackupVault } from "./BackupVault";
export { default as QueryConsole } from "./QueryConsole";
export { default as SecurityMatrix } from "./SecurityMatrix";
export { default as DataCatalog } from "./DataCatalog";
export { default as ApiGateway } from "./ApiGateway";
export { default as DataQualityStudio } from "./DataQualityStudio";
export { default as ReplicationManager } from "./ReplicationManager";
export { default as LineageGraph } from "./LineageGraph";
export { default as CostFinOps } from "./CostFinOps";
export { default as DataLakeExplorer } from "./DataLakeExplorer";
export { ShardingVisualizer } from "./ShardingVisualizer";
export { RealtimeStreams } from "./RealtimeStreams";
export { EventBusManager } from "./EventBusManager";
export { VersionControl } from "./VersionControl";
export { Configuration } from "./Configuration";

// ============================================================================
// DataSourcesManager Module - Refactored Components & Utilities
// ============================================================================

// Components
export { default as DataSourcesManager } from "./DataSourcesManager";
export { ConnectionCard } from "./ConnectionCard";
export { SystemHealthDisplay } from "./SystemHealthDisplay";

// Hooks
export {
  useDataSourceConnections,
  useConnectionForm,
  useLocalStorageFiles,
} from "./hooks";

// Types
export type {
  ConnectionStatus,
  DataProviderType,
  DataSourceConnection,
  DataProvider,
  ConnectionFormData,
  ConnectionTestResult,
  SyncResult,
  DeleteResult,
} from "./types";

// Constants
export {
  DATA_PROVIDERS,
  BACKEND_ENABLED_SERVICES,
  DEFAULT_REGIONS,
  DEFAULT_CONNECTION_FORM,
} from "./constants";

// Utilities
export {
  getStatusColor,
  getStatusLabel,
  formatLastSync,
  calculateCoverage,
} from "./utils";

// Re-export sub-modules
export * from "./lineage";
export * from "./quality";
export * from "./query";
