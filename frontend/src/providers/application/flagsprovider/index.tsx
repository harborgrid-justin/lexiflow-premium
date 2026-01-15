/**
 * ================================================================================
 * FLAGS PROVIDER - APPLICATION LAYER (Standalone)
 * ================================================================================
 *
 * ENTERPRISE LAYERING: APPLICATION LAYER (GLOBAL)
 *
 * RESPONSIBILITIES:
 * - Feature flag state management
 * - Flag evaluation and resolution
 * - Dynamic feature enablement
 * - A/B testing configuration
 *
 * RULES:
 * - Depends ONLY on Infrastructure Layer
 * - Must NOT depend on Domain Layer
 * - Provides feature availability context
 * - Flags are server-authoritative
 *
 * DATA FLOW:
 * SERVER (flags endpoint) → LOADER → FLAGS PROVIDER → CONSUMER COMPONENTS
 *
 * @module providers/application/flagsprovider
 */

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export type FeatureFlags = Record<string, boolean | string | number>;

export interface FlagsState {
  flags: FeatureFlags;
  isLoading: boolean;
}

export interface FlagsContextValue extends FlagsState {
  isEnabled: (flag: string) => boolean;
  getValue: <T = unknown>(flag: string, defaultValue?: T) => T;
  refresh: () => Promise<void>;
}

// ============================================================================
// CONTEXT
// ============================================================================

const FlagsContext = createContext<FlagsContextValue | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

export interface FlagsProviderProps {
  children: ReactNode;
  initial?: FeatureFlags;
}

export function FlagsProvider({ children, initial = {} }: FlagsProviderProps) {
  const [flags, setFlags] = useState<FeatureFlags>(initial);
  const [isLoading, setIsLoading] = useState(false);

  // Stable flag evaluation
  const isEnabled = useCallback(
    (flag: string): boolean => {
      return flags[flag] === true;
    },
    [flags]
  );

  const getValue = useCallback(
    <T = unknown,>(flag: string, defaultValue?: T): T => {
      const value = flags[flag];
      return value !== undefined ? (value as T) : (defaultValue as T);
    },
    [flags]
  );

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      // SERVER TRUTH: Fetch latest flags
      const response = await fetch('/api/flags');
      if (response.ok) {
        const data = await response.json();
        setFlags(data.flags);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Memoized context value (stability requirement)
  const value = useMemo(
    () => ({
      flags,
      isLoading,
      isEnabled,
      getValue,
      refresh,
    }),
    [flags, isLoading, isEnabled, getValue, refresh]
  );

  return <FlagsContext.Provider value={value}>{children}</FlagsContext.Provider>;
}

// ============================================================================
// HOOK
// ============================================================================

export function useFlags(): FlagsContextValue {
  const context = useContext(FlagsContext);

  if (!context) {
    throw new Error('useFlags must be used within FlagsProvider');
  }

  return context;
}
