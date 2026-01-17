/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

import React, { createContext, useCallback, useContext, useMemo, useSyncExternalStore, useTransition } from 'react';

import { StorageUtils } from '@/utils/storage';
/**
 * CaseContext - React v18 Concurrent-Safe Implementation
 *
 * Guidelines Applied:
 * - 22: Immutable context values
 * - 25: startTransition for non-urgent updates
 * - 32: useSyncExternalStore for localStorage
 * - 33: Explicit transitional states (isPending)
 * - 38: Concurrent-safe defaults
 */

interface CaseStateValue {
  readonly selectedCaseId: string | null;
  readonly isPending: boolean; // Guideline 33: Support transitional UI states
}

interface CaseActionsValue {
  selectCase: (caseId: string | null) => void;
  clearSelection: () => void;
}

export type CaseContextValue = CaseStateValue & CaseActionsValue;

// Guideline 38: ENSURE CONTEXT DEFAULTS ARE CONCURRENT-SAFE
// Non-placeholder, immutable defaults that avoid null checks
const DEFAULT_STATE: CaseStateValue = Object.freeze({
  selectedCaseId: null,
  isPending: false,
});

const DEFAULT_ACTIONS: CaseActionsValue = Object.freeze({
  selectCase: () => { throw new Error('CaseProvider not mounted'); },
  clearSelection: () => { throw new Error('CaseProvider not mounted'); },
});

const CaseStateContext = createContext<CaseStateValue>(DEFAULT_STATE);
const CaseActionsContext = createContext<CaseActionsValue>(DEFAULT_ACTIONS);

const STORAGE_KEY = 'lexiflow_global_context_case_id';

export function CaseProvider({ children }: { children: React.ReactNode }) {
  // Guideline 25: USE startTransition FOR NON-URGENT CONTEXT UPDATES
  const [isPending, startTransition] = useTransition();

  // Guideline 32: USE useSyncExternalStore FOR EXTERNAL MUTABLE SOURCES
  // localStorage is an external mutable source that requires synchronization
  const subscribe = useCallback((callback: () => void) => {
    if (typeof window === 'undefined') return () => { };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) callback();
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const getSnapshot = useCallback(() => {
    if (typeof window === 'undefined') return null;
    return StorageUtils.get<string | null>(STORAGE_KEY, null);
  }, []);

  const getServerSnapshot = useCallback(() => null, []);

  const selectedCaseId = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Guideline 25: Non-urgent updates use startTransition
  const selectCase = useCallback((caseId: string | null) => {
    startTransition(() => {
      if (caseId) {
        StorageUtils.set(STORAGE_KEY, caseId);
      } else {
        StorageUtils.remove(STORAGE_KEY);
      }
      // Manually dispatch storage event for same-tab updates
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new StorageEvent('storage', {
          key: STORAGE_KEY,
          newValue: caseId,
          storageArea: localStorage
        }));
      }
    });
  }, []);

  const clearSelection = useCallback(() => {
    selectCase(null);
  }, [selectCase]);

  // Guideline 22: DESIGN CONTEXT VALUES TO BE CONCURRENT-SAFE
  // Immutable state object, frozen in development
  const stateValue = useMemo<CaseStateValue>(() => {
    const value = {
      selectedCaseId,
      isPending,
    };
    return process.env.NODE_ENV === 'development' ? Object.freeze(value) : value;
  }, [selectedCaseId, isPending]);

  // Guideline 28: Stable function references
  const actionsValue = useMemo<CaseActionsValue>(() => ({
    selectCase,
    clearSelection,
  }), [selectCase, clearSelection]);

  // Guideline 36: ISOLATE CONTEXT PROVIDERS FROM FREQUENT RECONCILIATION
  return (
    <CaseStateContext.Provider value={stateValue}>
      <CaseActionsContext.Provider value={actionsValue}>
        {children}
      </CaseActionsContext.Provider>
    </CaseStateContext.Provider>
  );
}

CaseProvider.displayName = 'CaseProvider';

// Guideline 34: ASSUME CONTEXT READS MAY BE REPEATED OR DISCARDED
// These hooks have no side effects and can be called multiple times safely
export function useCaseState(): CaseStateValue {
  const context = useContext(CaseStateContext);
  // Context always has a value (DEFAULT_STATE), so we validate it's not the error-throwing default
  if (context === DEFAULT_STATE) {
    throw new Error('useCaseState must be used within a CaseProvider');
  }
  return context;
}

export function useCaseActions(): CaseActionsValue {
  const context = useContext(CaseActionsContext);
  if (context === DEFAULT_ACTIONS) {
    throw new Error('useCaseActions must be used within a CaseProvider');
  }
  return context;
}

export function useCaseContext(): CaseContextValue {
  return {
    ...useCaseState(),
    ...useCaseActions(),
  };
}
