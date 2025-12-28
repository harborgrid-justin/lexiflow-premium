// context/index.ts
// ============================================================================
// Context Providers & Hooks
// ============================================================================
// 
// Best Practice Applied (BP4): Export only hooks, not raw contexts
// This enables invariant checks and future refactors without breaking consumers

// Composed Provider Tree (recommended way to use all providers)
export { AppProviders } from './AppProviders';

// SyncContext exports
export { SyncProvider, useSyncState, useSyncActions, useSync } from './SyncContext';
export type { SyncStatus } from './SyncContext.types';

// ThemeContext exports
export { ThemeProvider, useThemeState, useThemeActions, useTheme } from './ThemeContext';

// ToastContext exports
export { ToastProvider, useToastState, useToastActions, useToast } from './ToastContext';
export type { ToastType } from './ToastContext.types';

// WindowContext exports
export { WindowProvider, useWindowState, useWindowActions, useWindow } from './WindowContext';
export type { WindowInstance } from './WindowContext.types';

// DataSourceContext exports
export { DataSourceProvider, useDataSourceState, useDataSourceActions, useDataSource } from './DataSourceContext';
export type { DataSourceType } from './DataSourceContext.types';

// ============================================================================
// Type Exports (Consolidated)
// ============================================================================
// Import all types from the consolidated types file for convenience
export type * from './types';

// ============================================================================
// Legacy Type Exports (for backward compatibility)
// ============================================================================

// Theme Context Types
export type { ThemeMode } from '../components/theme/tokens';

