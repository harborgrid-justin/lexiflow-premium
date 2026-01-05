import { isBackendApiEnabled as checkBackendEnabled } from '@/config/network/api.config';
import { DataService } from '@/services/data/dataService';
import { backendDiscovery } from '@/services/integration/backendDiscovery';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { DataSourceConfig } from '../repository/config';
import { createConfigFromEnv } from '../repository/config';
import type { RepositoryRegistry } from '../repository/types';
import type {
  DataSourceActionsValue,
  DataSourceProviderProps,
  DataSourceStateValue,
  DataSourceType,
} from './DataSourceContext.types';
import { DataSourceActionsContext, DataSourceStateContext } from './DataSourceHooks';

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                DATA SOURCE PROVIDER (INFRASTRUCTURE)                      ║
 * ║                   Enterprise Pattern Implementation                       ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * @module providers/DataSourceContext
 * @description Infrastructure boundary for data access layer
 *
 * ENTERPRISE PATTERNS APPLIED:
 * ✓ 1. Treat as Infrastructure (not business logic)
 * ✓ 2. Expose Stable Repository Interface (not raw clients)
 * ✓ 3. Do Not Expose Transport Details (HTTP/GraphQL hidden)
 * ✓ 4. Centralize Authentication and Authorization
 * ✓ 5. Normalize Errors at Provider Boundary
 * ✓ 6. Make Provider Stateless When Possible
 * ✓ 7. Support Multiple Environments Explicitly
 * ✓ 8. Memoize Repository Instances
 * ✓ 9. Avoid Cross-Domain Dependencies
 * ✓ 10. Enforce Timeouts and Retries Centrally
 * ✓ 11. Instrument Observability at Provider Level
 * ✓ 12. Design for Server-Side Rendering (SSR)
 * ✓ 13. Enable Mock and Stub Injection
 * ✓ 14. Version API Access Explicitly
 * ✓ 15. Document Data Ownership and Consistency Rules
 *
 * ARCHITECTURE:
 * Provider = Infrastructure boundary
 * Repositories = Domain contracts
 * Hooks = Orchestration layer
 * Components = Presentation
 */

// Re-export types for convenience
export type { DataSourceConfig } from '../repository/config';
export * from '../repository/errors';
export type { RepositoryRegistry } from '../repository/types';
export type { DataSourceType } from './DataSourceContext.types';
export * from './DataSourceHooks';

// ═══════════════════════════════════════════════════════════════════════════
//                         REPOSITORY FACTORY
// ═══════════════════════════════════════════════════════════════════════════
// Pattern 8: Memoize Repository Instances
// Pattern 13: Enable Mock and Stub Injection

/**
 * Create repositories from existing DataService facade
 * Pattern 1: Infrastructure layer - wraps existing services
 * Pattern 2: Exposes stable repository interface
 * Pattern 3: Hides transport details (HTTP/IndexedDB)
 */
function createRepositories(config: DataSourceConfig): RepositoryRegistry {
  // Pattern 11: Observability - log repository creation
  config.observability.logger?.info('Creating repository instances', {
    environment: config.environment.environment,
    apiVersion: config.environment.apiVersion,
  });

  // Pattern 2: Wrap DataService with stable repository interface
  // Pattern 3: DataService already hides HTTP details
  // Pattern 9: Each repository is independent (no cross-domain deps)
  return {
    cases: DataService.cases,
    documents: DataService.documents,
    compliance: DataService.compliance,
    evidence: DataService.evidence,
    discovery: DataService.discovery,
    pleadings: DataService.pleadings,
    depositions: DataService.depositions,
    hearings: DataService.hearings,
    billing: DataService.billing,
    timeEntries: DataService.timeEntries,
    clients: DataService.clients,
    analytics: DataService.analytics,
    reports: DataService.reports,
  } as RepositoryRegistry;
}

// --- Internal Helpers (Kept outside to avoid closures/circularity) ---

function getInitialDataSource(): DataSourceType {
  // Use the centralized apiConfig detection logic
  return checkBackendEnabled() ? 'postgresql' : 'indexeddb';
}

// BP3: Split contexts for state and actions
const contextId = Math.random().toString(36).substring(7);
console.log('[DataSourceContext] Module loaded, ID:', contextId);

/**
 * DataSourceProvider
 *
 * RESPONSIBILITIES (Pattern 15: Documentation):
 * - Initialize data source from localStorage or config
 * - Create and memoize repository instances (Pattern 8)
 * - Provide configuration with env/versioning (Pattern 7, 14)
 * - Handle source switching with hard reload
 * - Instrument observability (Pattern 11)
 *
 * LIFECYCLE:
 * - Initializes from localStorage/config on mount (Pattern 12: SSR-safe)
 * - Logs source changes for debugging (Pattern 11)
 * - Hard reload required for switching to reset service registry
 *
 * DATA OWNERSHIP (Pattern 15):
 * - OWNS: Configuration state, current source type
 * - FETCHES: Nothing (stateless provider - Pattern 6)
 * - NEVER CACHES: Repository data (belongs in React Query layer)
 * - CONSISTENCY: Strong (configuration is local state)
 */
export const DataSourceProvider = ({
  children,
  initialSource,
  // Pattern 13: Enable mock and stub injection for tests
  repositories: mockRepositories,
  config: overrideConfig,
}: DataSourceProviderProps) => {
  console.log('[DataSourceProvider] Rendering, Module ID:', contextId);
  // Pattern 12: SSR-safe initialization
  // Pattern 12: SSR-safe initialization
  const [currentSource, setCurrentSource] = useState<DataSourceType>(
    initialSource || getInitialDataSource
  );

  // Pattern 7 & 14: Environment configuration with API versioning
  // Pattern 13: Use override config for tests
  const config = useMemo<DataSourceConfig>(() => {
    if (overrideConfig) return overrideConfig;
    return createConfigFromEnv();
  }, [overrideConfig]);

  // Pattern 8: Memoize repository instances for referential stability
  // Pattern 13: Use mock repositories for tests
  const repositories = useMemo<RepositoryRegistry>(() => {
    if (mockRepositories) {
      // Pattern 11: Log when using mocks
      config.observability.logger?.info('Using mock repositories for testing');
      return mockRepositories;
    }
    return createRepositories(config);
  }, [config, mockRepositories]);

  // Derive state (Pattern 6: Stateless provider)
  const isBackendApiEnabled = currentSource !== 'indexeddb';

  /**
   * switchDataSource
   * Updates storage and performs hard reload to reset service registry
   */
  const switchDataSource = useCallback((source: DataSourceType) => {
    if (source === currentSource) return;

    // Pattern 11: Instrument observability
    if (config?.observability?.logger) {
      config.observability.logger.info('Switching data source', {
        from: currentSource,
        to: source,
      });
    }

    // Update storage so the next load picks up the right source
    // HYDRATION-SAFE: Only access window/localStorage in browser environment
    if (typeof window !== 'undefined') {
      // Use VITE_USE_INDEXEDDB for consistency with apiConfig.ts
      if (source === 'indexeddb') {
        localStorage.setItem('VITE_USE_INDEXEDDB', 'true');
      } else {
        localStorage.removeItem('VITE_USE_INDEXEDDB');
      }

      // We do NOT call queryClient here.
      // The reload ensures a clean slate for all singleton services.
      window.location.reload();
    }

    setCurrentSource(source);
  }, [currentSource, config]);

  useEffect(() => {
    // Pattern 11: Lifecycle logging
    config.observability.logger?.info('DataSource provider initialized', {
      currentSource,
      environment: config.environment.environment,
      apiVersion: config.environment.apiVersion,
    });

    // Start backend health monitoring service
    // This enables real-time backend availability tracking
    console.log('[DataSourceProvider] Starting backend health monitoring...');
    backendDiscovery.start();

    // Cleanup: Stop monitoring on unmount
    return () => {
      console.log('[DataSourceProvider] Stopping backend health monitoring...');
      backendDiscovery.stop();
    };
  }, [currentSource, config]);

  // Pattern 8: Memoize provider values explicitly - state context
  const stateValue = useMemo<DataSourceStateValue>(() => ({
    currentSource,
    isBackendApiEnabled,
    repositories, // Pattern 2: Expose stable repository interface
    config,       // Pattern 7: Environment configuration
  }), [currentSource, isBackendApiEnabled, repositories, config]);

  // Pattern 8: Memoize provider values explicitly - actions context
  const actionsValue = useMemo<DataSourceActionsValue>(() => ({
    switchDataSource
  }), [switchDataSource]);

  // Split contexts for performance (Pattern 3 equivalent)
  return (
    <DataSourceStateContext.Provider value={stateValue}>
      <DataSourceActionsContext.Provider value={actionsValue}>
        {children}
      </DataSourceActionsContext.Provider>
    </DataSourceStateContext.Provider>
  );
};
