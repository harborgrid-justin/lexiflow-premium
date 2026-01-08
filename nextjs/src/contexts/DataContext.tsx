/**
 * Data Context for LexiFlow Enterprise Legal Platform
 *
 * Provides dashboard data management with:
 * - Dynamic data fetching based on user role and entitlements
 * - Support for multiple dashboard item types (cases, audits, public)
 * - Error handling and loading states
 * - Automatic refresh capabilities
 *
 * @module contexts/DataContext
 */

'use client';

import { apiClient } from '@/services/infrastructure/apiClient';
import type { PaginatedResponse } from '@/services/infrastructure/apiClient';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import { useEntitlements } from './EntitlementsContext';

// ============================================================================
// Types
// ============================================================================

/**
 * Case dashboard item
 */
interface CaseDashboardItem {
  type: 'case';
  id: string;
  label: string;
  status: string;
  caseNumber?: string;
  client?: string;
  lastActivity?: string;
}

/**
 * Audit log dashboard item (for admins)
 */
interface AuditDashboardItem {
  type: 'audit';
  id: string;
  label: string;
  action: string;
  userId?: string;
  timestamp?: string;
}

/**
 * Public content dashboard item (for anonymous users)
 */
interface PublicDashboardItem {
  type: 'public';
  id: string;
  label: string;
  description?: string;
}

/**
 * Task dashboard item
 */
interface TaskDashboardItem {
  type: 'task';
  id: string;
  label: string;
  status: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

/**
 * Union type for all dashboard items
 */
export type DashboardItem =
  | CaseDashboardItem
  | AuditDashboardItem
  | PublicDashboardItem
  | TaskDashboardItem;

/**
 * Data context state
 */
export interface DataState {
  /** Dashboard items */
  items: DashboardItem[];
  /** Loading state during data fetch */
  isLoading: boolean;
  /** Error message if data fetch failed */
  error: string | null;
  /** Last refresh timestamp */
  lastRefreshed: Date | null;
}

/**
 * Data context actions
 */
export interface DataActions {
  /** Refresh dashboard data */
  refresh: () => Promise<void>;
  /** Clear all data */
  clear: () => void;
  /** Get items by type */
  getItemsByType: <T extends DashboardItem['type']>(type: T) => DashboardItem[];
}

/**
 * Combined context value
 */
export type DataContextValue = DataState & DataActions;

// ============================================================================
// API Response Types
// ============================================================================

interface CaseApiResponse {
  id: string;
  title?: string;
  caseNumber?: string;
  status: string;
  clientName?: string;
  updatedAt?: string;
}

interface AuditLogApiResponse {
  id: string;
  action: string;
  userId: string;
  createdAt?: string;
  details?: string;
}

interface TaskApiResponse {
  id: string;
  title: string;
  status: string;
  dueDate?: string;
  priority?: string;
}

// ============================================================================
// Context
// ============================================================================

const DataStateContext = createContext<DataState | undefined>(undefined);
const DataActionsContext = createContext<DataActions | undefined>(undefined);

// ============================================================================
// Custom Hooks
// ============================================================================

/**
 * Access data state
 * @throws Error if used outside DataProvider
 */
export function useDataState(): DataState {
  const context = useContext(DataStateContext);
  if (!context) {
    throw new Error('useDataState must be used within a DataProvider');
  }
  return context;
}

/**
 * Access data actions
 * @throws Error if used outside DataProvider
 */
export function useDataActions(): DataActions {
  const context = useContext(DataActionsContext);
  if (!context) {
    throw new Error('useDataActions must be used within a DataProvider');
  }
  return context;
}

/**
 * Convenience hook for both state and actions
 * @throws Error if used outside DataProvider
 */
export function useData(): DataContextValue {
  return {
    ...useDataState(),
    ...useDataActions(),
  };
}

// ============================================================================
// Provider Component
// ============================================================================

export interface DataProviderProps {
  children: ReactNode;
  /** Auto-refresh interval in milliseconds (0 to disable) */
  autoRefreshInterval?: number;
}

/**
 * Data Provider
 *
 * Wraps the application to provide dashboard data access.
 * Fetches data based on user role and entitlements.
 *
 * @example
 * ```tsx
 * <AuthProvider>
 *   <EntitlementsProvider>
 *     <DataProvider autoRefreshInterval={60000}>
 *       <Dashboard />
 *     </DataProvider>
 *   </EntitlementsProvider>
 * </AuthProvider>
 * ```
 */
export function DataProvider({ children, autoRefreshInterval = 0 }: DataProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const { entitlements } = useEntitlements();

  // State
  const [items, setItems] = useState<DashboardItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  // Refresh dashboard data
  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Anonymous users get public content only
      if (!isAuthenticated) {
        setItems([
          {
            type: 'public',
            id: 'welcome',
            label: 'Welcome to LexiFlow',
            description: 'Enterprise Legal Practice Management Platform',
          },
          {
            type: 'public',
            id: 'features',
            label: 'Explore Features',
            description: 'Discover powerful tools for legal practice management',
          },
        ]);
        setLastRefreshed(new Date());
        return;
      }

      const dashboardItems: DashboardItem[] = [];

      // Admin users with enterprise plan get audit logs
      if (entitlements.plan === 'enterprise' && entitlements.canUseAdminTools) {
        try {
          const logsResponse = await apiClient.get<PaginatedResponse<AuditLogApiResponse> | AuditLogApiResponse[]>(
            '/audit-logs',
            { limit: 10 }
          );

          const logs = Array.isArray(logsResponse)
            ? logsResponse
            : logsResponse.data || [];

          const auditItems: AuditDashboardItem[] = logs.map((log) => ({
            type: 'audit' as const,
            id: log.id,
            label: `Audit: ${log.action}`,
            action: log.action,
            userId: log.userId,
            timestamp: log.createdAt,
          }));

          dashboardItems.push(...auditItems);
          console.log('[DataContext] Loaded audit logs:', auditItems.length);
        } catch (err) {
          console.warn('[DataContext] Failed to fetch audit logs:', err);
          // Continue with other data sources
        }
      }

      // All authenticated users get their cases
      try {
        const casesResponse = await apiClient.get<PaginatedResponse<CaseApiResponse> | CaseApiResponse[]>(
          '/cases',
          { limit: 20 }
        );

        const cases = Array.isArray(casesResponse)
          ? casesResponse
          : casesResponse.data || [];

        const caseItems: CaseDashboardItem[] = cases.map((c) => ({
          type: 'case' as const,
          id: c.id,
          label: c.title || c.caseNumber || 'Untitled Case',
          status: c.status,
          caseNumber: c.caseNumber,
          client: c.clientName,
          lastActivity: c.updatedAt,
        }));

        dashboardItems.push(...caseItems);
        console.log('[DataContext] Loaded cases:', caseItems.length);
      } catch (err) {
        console.warn('[DataContext] Failed to fetch cases:', err);
        // Continue with other data sources
      }

      // Fetch user's tasks
      try {
        const tasksResponse = await apiClient.get<PaginatedResponse<TaskApiResponse> | TaskApiResponse[]>(
          '/tasks',
          { limit: 10, assigneeId: user?.id }
        );

        const tasks = Array.isArray(tasksResponse)
          ? tasksResponse
          : tasksResponse.data || [];

        const taskItems: TaskDashboardItem[] = tasks.map((t) => ({
          type: 'task' as const,
          id: t.id,
          label: t.title,
          status: t.status,
          dueDate: t.dueDate,
          priority: t.priority as TaskDashboardItem['priority'],
        }));

        dashboardItems.push(...taskItems);
        console.log('[DataContext] Loaded tasks:', taskItems.length);
      } catch (err) {
        console.warn('[DataContext] Failed to fetch tasks:', err);
        // Continue without tasks
      }

      setItems(dashboardItems);
      setLastRefreshed(new Date());
      console.log('[DataContext] Dashboard data refreshed, total items:', dashboardItems.length);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load dashboard data';
      console.error('[DataContext] Error refreshing data:', err);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.id, entitlements.plan, entitlements.canUseAdminTools]);

  // Clear all data
  const clear = useCallback(() => {
    setItems([]);
    setError(null);
    setLastRefreshed(null);
  }, []);

  // Get items by type
  const getItemsByType = useCallback(
    <T extends DashboardItem['type']>(type: T): DashboardItem[] => {
      return items.filter((item) => item.type === type);
    },
    [items]
  );

  // Initial data fetch
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Auto-refresh interval
  useEffect(() => {
    if (autoRefreshInterval > 0) {
      const intervalId = setInterval(refresh, autoRefreshInterval);
      return () => clearInterval(intervalId);
    }
  }, [autoRefreshInterval, refresh]);

  // Memoized context values
  const stateValue = useMemo<DataState>(
    () => ({
      items,
      isLoading,
      error,
      lastRefreshed,
    }),
    [items, isLoading, error, lastRefreshed]
  );

  const actionsValue = useMemo<DataActions>(
    () => ({
      refresh,
      clear,
      getItemsByType,
    }),
    [refresh, clear, getItemsByType]
  );

  return (
    <DataStateContext.Provider value={stateValue}>
      <DataActionsContext.Provider value={actionsValue}>
        {children}
      </DataActionsContext.Provider>
    </DataStateContext.Provider>
  );
}

export default DataProvider;
