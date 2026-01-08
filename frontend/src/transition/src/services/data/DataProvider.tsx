/**
 * DataProvider - Central Data Management
 *
 * Implements "Data Provider Recommendations":
 * 1. Ownership: Owns data lifecycle and rules
 * 2. Surface: Single useData hook
 * 3. Actions: Intent-based (refresh, clear)
 * 4. Policy: Enforces access rules (via integration with Auth/Policy)
 *
 * @module services/data/DataProvider
 */

import { QueryClientProvider } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { useAuth } from '../identity/AuthProvider';
import { queryClient } from './client/queryClient';

// -----------------------------------------------------------------------------
// Types & Interfaces
// -----------------------------------------------------------------------------

interface DataContextValue {
  /** Global loading state (aggregates critical queries) */
  isLoading: boolean;
  /** Global error state */
  error: Error | null;
  /** Intent: Refresh specific data domain */
  refresh: (domain: string) => Promise<void>;
  /** Intent: Clear all sensitive data (e.g. on logout) */
  clearData: () => void;
  /** Check if data for a domain is cached/fresh */
  isFresh: (domain: string) => boolean;
}

// -----------------------------------------------------------------------------
// Context Definition
// -----------------------------------------------------------------------------

const DataContext = createContext<DataContextValue | null>(null);

// -----------------------------------------------------------------------------
// Hook: useData
// -----------------------------------------------------------------------------

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
}

// -----------------------------------------------------------------------------
// Provider Implementation
// -----------------------------------------------------------------------------

interface DataProviderProps {
  children: ReactNode;
}

export function DataProvider({ children }: DataProviderProps) {
  // 1. Dependency: Auth (for policy/lifecycle)
  const { user } = useAuth();

  // 2. State & Logic
  // In a real app, we might track global loading of "critical" data here
  const isLoading = false;
  const error = null;

  // 3. Actions
  const refresh = useCallback(async (domain: string) => {
    // Intent-based invalidation
    await queryClient.invalidateQueries({ queryKey: [domain] });
  }, []);

  const clearData = useCallback(() => {
    queryClient.clear();
  }, []);

  const isFresh = useCallback((domain: string) => {
    const state = queryClient.getQueryState([domain]);
    return state ? state.dataUpdatedAt > Date.now() - 1000 * 60 : false;
  }, []);

  // 4. Stable Context Value
  const value = useMemo<DataContextValue>(() => ({
    isLoading,
    error,
    refresh,
    clearData,
    isFresh
  }), [isLoading, error, refresh, clearData, isFresh]);

  // 5. Lifecycle Effects
  // Auto-clear data when user logs out to prevent leakage
  useEffect(() => {
    if (!user) {
      clearData();
    }
  }, [user, clearData]);

  return (
    <QueryClientProvider client={queryClient}>
      <DataContext.Provider value={value}>
        {children}
      </DataContext.Provider>
    </QueryClientProvider>
  );
}
