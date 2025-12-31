/**
 * Data Sources Manager Module
 *
 * Modular architecture for managing data source connections
 * Broken down from 967 LOC monolith into focused modules
 */

export { DataSourcesManager as default } from '@/features/admin/components/data/DataSourcesManager';
export { ConnectionCard } from './ConnectionCard';
export { ConnectionForm } from './ConnectionForm';
export { CloudDatabaseContent } from './CloudDatabaseContent';
export { LocalStorageView } from './LocalStorageView';
export { IndexedDBView } from './IndexedDBView';
export { IndexedDBStoreList } from './IndexedDBStoreList';
export { IndexedDBDataTable } from './IndexedDBDataTable';
export { SystemHealthDisplay } from './SystemHealthDisplay';
export { DataSourceSelector } from './DataSourceSelector';
export * from './types';
