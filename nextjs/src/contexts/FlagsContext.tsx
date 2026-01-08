/**
 * Feature Flags Context for LexiFlow Enterprise Legal Platform
 *
 * Provides feature flag management with:
 * - Dynamic flag fetching from backend
 * - Default fallback values
 * - Type-safe flag access via `isEnabled(flag)`
 * - Automatic refresh capabilities
 *
 * @module contexts/FlagsContext
 */

'use client';

import { apiClient } from '@/services/infrastructure/apiClient';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

// ============================================================================
// Types
// ============================================================================

/**
 * Feature flags configuration
 * Add new feature toggles here as the application grows
 */
export interface Flags {
  /** Enable new dashboard UI */
  enableNewDashboard: boolean;
  /** Enable admin tools access */
  enableAdminTools: boolean;
  /** Enable OCR document processing */
  ocr: boolean;
  /** Enable AI assistant features */
  aiAssistant: boolean;
  /** Enable real-time sync */
  realTimeSync: boolean;
  /** Enable analytics dashboard */
  enableAnalytics: boolean;
  /** Enable document collaboration */
  enableCollaboration: boolean;
  /** Enable advanced search */
  enableAdvancedSearch: boolean;
  /** Enable billing features */
  enableBilling: boolean;
  /** Enable discovery module */
  enableDiscovery: boolean;
}

/**
 * Flags context state
 */
export interface FlagsState {
  /** Current feature flags */
  flags: Flags;
  /** Loading state during flag fetch */
  isLoading: boolean;
  /** Error message if flag fetch failed */
  error: string | null;
}

/**
 * Flags context actions
 */
export interface FlagsActions {
  /** Refresh flags from backend */
  refreshFlags: () => Promise<void>;
  /** Check if a specific flag is enabled */
  isEnabled: (flag: keyof Flags) => boolean;
}

/**
 * Combined context value
 */
export type FlagsContextValue = FlagsState & FlagsActions;

// ============================================================================
// Default Values
// ============================================================================

const DEFAULT_FLAGS: Flags = {
  enableNewDashboard: true,
  enableAdminTools: false,
  ocr: false,
  aiAssistant: false,
  realTimeSync: true,
  enableAnalytics: true,
  enableCollaboration: true,
  enableAdvancedSearch: true,
  enableBilling: true,
  enableDiscovery: true,
};

// ============================================================================
// Context
// ============================================================================

const FlagsStateContext = createContext<FlagsState | undefined>(undefined);
const FlagsActionsContext = createContext<FlagsActions | undefined>(undefined);

// ============================================================================
// Custom Hooks
// ============================================================================

/**
 * Access feature flags state
 * @throws Error if used outside FlagsProvider
 */
export function useFlagsState(): FlagsState {
  const context = useContext(FlagsStateContext);
  if (!context) {
    throw new Error('useFlagsState must be used within a FlagsProvider');
  }
  return context;
}

/**
 * Access feature flags actions
 * @throws Error if used outside FlagsProvider
 */
export function useFlagsActions(): FlagsActions {
  const context = useContext(FlagsActionsContext);
  if (!context) {
    throw new Error('useFlagsActions must be used within a FlagsProvider');
  }
  return context;
}

/**
 * Convenience hook for both state and actions
 * @throws Error if used outside FlagsProvider
 */
export function useFlags(): FlagsContextValue {
  return {
    ...useFlagsState(),
    ...useFlagsActions(),
  };
}

// ============================================================================
// Provider Component
// ============================================================================

export interface FlagsProviderProps {
  children: ReactNode;
  /** Initial flag overrides (useful for testing or SSR) */
  initial?: Partial<Flags>;
}

/**
 * Feature Flags Provider
 *
 * Wraps the application to provide feature flag access.
 * Fetches flags from backend on mount and provides fallback defaults.
 *
 * @example
 * ```tsx
 * <FlagsProvider initial={{ aiAssistant: true }}>
 *   <App />
 * </FlagsProvider>
 * ```
 */
export function FlagsProvider({ children, initial }: FlagsProviderProps) {
  // State
  const [flags, setFlags] = useState<Flags>({ ...DEFAULT_FLAGS, ...initial });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refresh flags from backend
  const refreshFlags = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch feature flags from backend
      const response = await apiClient.get<Flags>('/features');
      setFlags({ ...DEFAULT_FLAGS, ...response });
      console.log('[FlagsContext] Feature flags loaded successfully');
    } catch (err) {
      console.warn('[FlagsContext] Failed to fetch feature flags, using defaults:', err);
      // Keep current flags (defaults + initial) on error
      // Don't block UI for feature flag fetch failure
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check if a flag is enabled
  const isEnabled = useCallback(
    (flag: keyof Flags): boolean => {
      return flags[flag] === true;
    },
    [flags]
  );

  // Fetch flags on mount
  useEffect(() => {
    refreshFlags();
  }, [refreshFlags]);

  // Memoized context values
  const stateValue = useMemo<FlagsState>(
    () => ({
      flags,
      isLoading,
      error,
    }),
    [flags, isLoading, error]
  );

  const actionsValue = useMemo<FlagsActions>(
    () => ({
      refreshFlags,
      isEnabled,
    }),
    [refreshFlags, isEnabled]
  );

  return (
    <FlagsStateContext.Provider value={stateValue}>
      <FlagsActionsContext.Provider value={actionsValue}>
        {children}
      </FlagsActionsContext.Provider>
    </FlagsStateContext.Provider>
  );
}

export default FlagsProvider;
