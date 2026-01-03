/**
 * DataSourceContext Type Definitions
 */

import type { ReactNode } from 'react';
import type { RepositoryRegistry } from '../repository/types';
import type { DataSourceConfig } from '../repository/config';

export type DataSourceType = 'indexeddb' | 'postgresql' | 'cloud';

// Pattern 2: Narrow interface - read-only state (stable repository access)
export interface DataSourceStateValue {
  currentSource: DataSourceType;
  isBackendApiEnabled: boolean;
  
  /**
   * Pattern 2 & 8: Expose memoized repositories (NOT raw API clients)
   * Repositories are referentially stable and provide domain contracts
   */
  repositories: RepositoryRegistry;
  
  /**
   * Pattern 7 & 14: Configuration with environment and versioning
   */
  config: DataSourceConfig;
}

// BP2: Narrow interface - actions only
export interface DataSourceActionsValue {
  switchDataSource: (source: DataSourceType) => void;
}

// Combined interface for backward compatibility
export interface DataSourceContextValue extends DataSourceStateValue, DataSourceActionsValue {}

// Provider props
// Pattern 13: Support test-friendly overrides (mock injection)
export interface DataSourceProviderProps {
  children: ReactNode;
  
  /**
   * Override initial source for testing
   */
  initialSource?: DataSourceType;
  
  /**
   * Pattern 13: Inject mock repositories for testing
   */
  repositories?: RepositoryRegistry;
  
  /**
   * Pattern 13: Inject test configuration
   */
  config?: DataSourceConfig;
}
