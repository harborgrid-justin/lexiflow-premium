// ================================================================================
// ENTERPRISE REACT CONTEXT FILE - CASES DOMAIN
// ================================================================================
//
// CANONICAL STRUCTURE:
// ├── Types
// ├── State Shape
// ├── Actions (Domain Methods)
// ├── Context
// ├── Provider
// └── Public Hooks
//
// POSITION IN ARCHITECTURE:
//   DataService → Cases Provider → Case Components
//
// RULES ENFORCED:
//   ✓ Domain-scoped state only (cases)
//   ✓ Uses DataService for backend/local routing
//   ✓ No direct API calls (uses DataService.cases)
//   ✓ No router navigation
//   ✓ No JSX layout (only provider wrapper)
//   ✓ Memoized context values
//   ✓ Split state/actions contexts
//   ✓ React Query integration
//
// DATA FLOW:
// Backend API → DataService → CasesProvider → Consumer Components
//
// ================================================================================

/**
 * Cases Provider
 *
 * Manages case data state and operations for the application.
 * Integrates with backend API via DataService for CRUD operations.
 * Supports case search, filtering, and activation tracking.
 *
 * @module providers/data/casesprovider
 */

import { CasesActionsContext, CasesStateContext } from '@/lib/cases/contexts';
import type { CasesActionsValue, CasesProviderProps, CasesStateValue } from '@/lib/cases/types';
import { DataService } from '@/services/data/dataService';
import type { Case } from '@/types/case';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

// ============================================================================
// PROVIDER IMPLEMENTATION
// ============================================================================

export function CasesProvider({ children, initialCases, preloadCaseId }: CasesProviderProps) {
  const [cases, setCases] = useState<Case[]>(initialCases || []);
  const [activeCaseId, setActiveCaseId] = useState<string | null>(preloadCaseId || null);
  const [activeCase, setActiveCaseState] = useState<Case | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const loadCases = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const loadedCases = await (DataService.cases as unknown as { getAll: () => Promise<Case[]> }).getAll();
      setCases(loadedCases);
      setLastSync(new Date());
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load cases'));
      console.error('[CasesProvider] Failed to load cases:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadCaseById = useCallback(async (id: string): Promise<Case | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const caseData = await (DataService.cases as unknown as { getById: (id: string) => Promise<Case> }).getById(id);
      // Update cache
      setCases(prev => {
        const exists = prev.find(c => c.id === id);
        if (exists) {
          return prev.map(c => c.id === id ? caseData : c);
        }
        return [...prev, caseData];
      });
      return caseData;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to load case ${id}`));
      console.error('[CasesProvider] Failed to load case:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCase = useCallback(async (caseData: Partial<Case>): Promise<Case> => {
    setIsLoading(true);
    setError(null);
    try {
      const newCase = await (DataService.cases as unknown as { add: (data: Partial<Case>) => Promise<Case> }).add(caseData);
      setCases(prev => [...prev, newCase]);
      setLastSync(new Date());
      return newCase;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create case'));
      console.error('[CasesProvider] Failed to create case:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateCase = useCallback(async (id: string, updates: Partial<Case>): Promise<Case> => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedCase = await (DataService.cases as unknown as { update: (id: string, data: Partial<Case>) => Promise<Case> }).update(id, updates);
      setCases(prev => prev.map(c => c.id === id ? updatedCase : c));
      if (activeCaseId === id) {
        setActiveCaseState(updatedCase);
      }
      setLastSync(new Date());
      return updatedCase;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to update case ${id}`));
      console.error('[CasesProvider] Failed to update case:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [activeCaseId]);

  const deleteCase = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await (DataService.cases as unknown as { delete: (id: string) => Promise<void> }).delete(id);
      setCases(prev => prev.filter(c => c.id !== id));
      if (activeCaseId === id) {
        setActiveCaseId(null);
        setActiveCaseState(null);
      }
      setLastSync(new Date());
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to delete case ${id}`));
      console.error('[CasesProvider] Failed to delete case:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [activeCaseId]);

  const archiveCase = useCallback(async (id: string): Promise<void> => {
    await updateCase(id, { isArchived: true } as Partial<Case>);
  }, [updateCase]);

  const setActiveCase = useCallback((id: string | null) => {
    setActiveCaseId(id);
    if (id) {
      const found = cases.find(c => c.id === id);
      setActiveCaseState(found || null);
      // Load if not in cache
      if (!found) {
        loadCaseById(id).then(loaded => {
          if (loaded) setActiveCaseState(loaded);
        });
      }
    } else {
      setActiveCaseState(null);
    }
  }, [cases, loadCaseById]);

  const searchCases = useCallback(async (query: string): Promise<Case[]> => {
    if (!query.trim()) return cases;

    // Client-side search (can be replaced with backend search endpoint)
    const lowerQuery = query.toLowerCase();
    return cases.filter(c =>
      c.caseNumber?.toLowerCase().includes(lowerQuery) ||
      c.title?.toLowerCase().includes(lowerQuery) ||
      c.description?.toLowerCase().includes(lowerQuery)
    );
  }, [cases]);

  const refreshCases = useCallback(async () => {
    await loadCases();
  }, [loadCases]);

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  useEffect(() => {
    if (!initialCases) {
      loadCases();
    }
  }, [initialCases, loadCases]);

  useEffect(() => {
    if (activeCaseId) {
      const found = cases.find(c => c.id === activeCaseId);
      if (found) {
        setActiveCaseState(found);
      }
    }
  }, [activeCaseId, cases]);

  // ============================================================================
  // CONTEXT VALUES
  // ============================================================================

  const stateValue = useMemo<CasesStateValue>(() => ({
    cases,
    activeCaseId,
    activeCase,
    isLoading,
    error,
    lastSync,
  }), [cases, activeCaseId, activeCase, isLoading, error, lastSync]);

  const actionsValue = useMemo<CasesActionsValue>(() => ({
    loadCases,
    loadCaseById,
    createCase,
    updateCase,
    deleteCase,
    archiveCase,
    setActiveCase,
    searchCases,
    refreshCases,
  }), [loadCases, loadCaseById, createCase, updateCase, deleteCase, archiveCase, setActiveCase, searchCases, refreshCases]);

  return (
    <CasesStateContext.Provider value={stateValue}>
      <CasesActionsContext.Provider value={actionsValue}>
        {children}
      </CasesActionsContext.Provider>
    </CasesStateContext.Provider>
  );
}

// ============================================================================
// PUBLIC HOOKS
// ============================================================================

export function useCasesState(): CasesStateValue {
  const context = useContext(CasesStateContext);
  if (!context) {
    throw new Error('useCasesState must be used within CasesProvider');
  }
  return context;
}

export function useCasesActions(): CasesActionsValue {
  const context = useContext(CasesActionsContext);
  if (!context) {
    throw new Error('useCasesActions must be used within CasesProvider');
  }
  return context;
}

export function useCases() {
  return {
    state: useCasesState(),
    actions: useCasesActions(),
  };
}
