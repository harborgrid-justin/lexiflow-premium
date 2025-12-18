// Data sub-module exports
export { AdminDataRegistry } from './AdminDataRegistry';
export { AdminDatabaseControl } from './AdminDatabaseControl';
export { DataPlatformSidebar } from './DataPlatformSidebar';
export { PlatformOverview } from './PlatformOverview';
export { GovernanceConsole } from './GovernanceConsole';
export { PipelineMonitor } from './PipelineMonitor';
export { BackupVault } from './BackupVault';
export { QueryConsole } from './QueryConsole';
export { SecurityMatrix } from './SecurityMatrix';
export { DataCatalog } from './DataCatalog';
export { ApiGateway } from './ApiGateway';
export { DataQualityStudio } from './DataQualityStudio';
export { ReplicationManager } from './ReplicationManager';
export { LineageGraph } from './LineageGraph';
export { CostFinOps } from './CostFinOps';
export { DataLakeExplorer } from './DataLakeExplorer';
export { ShardingVisualizer } from './ShardingVisualizer';
export { RealtimeStreams } from './RealtimeStreams';
export { EventBusManager } from './EventBusManager';
export { VersionControl } from './VersionControl';
export { Configuration } from './Configuration';

// ============================================================================
// DataSourcesManager Module - Refactored Components & Utilities
// ============================================================================

// Components
export { DataSourcesManager } from './DataSourcesManager';
export { ConnectionCard } from './ConnectionCard';
export { ServiceCoverageIndicator } from './ServiceCoverageIndicator';

// Hooks
export { 
  useDataSourceConnections,
  useConnectionForm,
  useLocalStorageFiles
} from './hooks';

// Types
export type {
  ConnectionStatus,
  DataProviderType,
  DataSourceConnection,
  DataProvider,
  ConnectionFormData,
  ConnectionTestResult,
  SyncResult,
  DeleteResult
} from './types';

// Constants
export {
  DATA_PROVIDERS,
  BACKEND_ENABLED_SERVICES,
  DEFAULT_REGIONS,
  DEFAULT_CONNECTION_FORM
} from './constants';

// Utilities
export {
  getStatusColor,
  getStatusLabel,
  formatLastSync,
  calculateCoverage
} from './utils';
