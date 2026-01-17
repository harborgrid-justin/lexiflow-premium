/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * ================================================================================
 * ENTERPRISE REACT DOMAIN PROVIDER - CASES
 * ================================================================================
 *
 * React v18 + React Router v7 + Context + Suspense
 *
 * POSITION IN ARCHITECTURE:
 *   Route Loader → CasesProvider → Case Components
 *
 * RULES ENFORCED:
 *   ✓ Lives in /routes/cases/ (domain-specific location)
 *   ✓ Initialized from route loader data
 *   ✓ Uses DataService for backend/local routing
 *   ✓ Split state/actions contexts for optimization
 *   ✓ Memoized values to prevent re-renders
 *   ✓ React 18 concurrent features (useTransition)
 *
 * DATA FLOW:
 *   SERVER → LOADER → PROVIDER → COMPONENT VIEW
 *
 * ================================================================================
 */

import React, { createContext, useCallback, useContext, useMemo, useState, useTransition } from 'react';

import { DataService } from '@/services/data/dataService';

import type { Case } from '@/types/case';

// ============================================================================
// TYPES
// ============================================================================

interface CasesState {
  cases: Case[];
  activeCaseId: string | null;
  activeCase: Case | null;
  isLoading: boolean;
  error: Error | null;
  isPending: boolean;
}

interface CasesActions {
  loadCases: () => Promise<void>;
  loadCaseById: (id: string) => Promise<Case | null>;
  setActiveCase: (caseId: string | null) => void;
  addCase: (caseData: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Case>;
  updateCase: (id: string, updates: Partial<Case>) => Promise<Case>;
  deleteCase: (id: string) => Promise<void>;
  searchCases: (query: string) => Case[];
}

export interface CasesProviderProps {
  children: React.ReactNode;
  initialCases?: Case[];
  preloadCaseId?: string;
}

// ============================================================================
// CONTEXTS
// ============================================================================

const CasesStateContext = createContext<CasesState | null>(null);
const CasesActionsContext = createContext<CasesActions | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

export function CasesProvider({ children, initialCases = [], preloadCaseId }: CasesProviderProps) {
  const [cases, setCases] = useState<Case[]>(initialCases);
  const [activeCaseId, setActiveCaseId] = useState<string | null>(preloadCaseId || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isPending, startTransition] = useTransition();

  // Derive active case from state
  const activeCase = useMemo(() => {
    return activeCaseId ? cases.find(c => c.id === activeCaseId) || null : null;
  }, [cases, activeCaseId]);

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const loadCases = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const loaded = await DataService.cases.getAll();
      startTransition(() => {
        setCases(loaded);
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load cases'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadCaseById = useCallback(async (id: string): Promise<Case | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const loadedCase = await DataService.cases.getById(id);
      if (loadedCase) {
        startTransition(() => {
          setCases(prev => {
            const exists = prev.some(c => c.id === id);
            return exists ? prev.map(c => c.id === id ? loadedCase : c) : [...prev, loadedCase];
          });
        });
      }
      return loadedCase;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load case'));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setActiveCase = useCallback((caseId: string | null) => {
    setActiveCaseId(caseId);
  }, []);

  const addCase = useCallback(async (caseData: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>): Promise<Case> => {
    setIsLoading(true);
    setError(null);
    try {
      const newCase = await DataService.cases.add(caseData as Case);
      startTransition(() => {
        setCases(prev => [...prev, newCase]);
      });
      return newCase;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add case'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateCase = useCallback(async (id: string, updates: Partial<Case>): Promise<Case> => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await DataService.cases.update(id, updates);
      startTransition(() => {
        setCases(prev => prev.map(c => c.id === id ? updated : c));
      });
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update case'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteCase = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await DataService.cases.delete(id);
      startTransition(() => {
        setCases(prev => prev.filter(c => c.id !== id));
        if (activeCaseId === id) {
          setActiveCaseId(null);
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete case'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [activeCaseId]);

  const searchCases = useCallback((query: string): Case[] => {
    const lowerQuery = query.toLowerCase();
    return cases.filter(c =>
      c.title?.toLowerCase().includes(lowerQuery) ||
      c.caseNumber?.toLowerCase().includes(lowerQuery) ||
      c.description?.toLowerCase().includes(lowerQuery)
    );
  }, [cases]);

  // ============================================================================
  // CONTEXT VALUES (Memoized for performance)
  // ============================================================================

  const state = useMemo<CasesState>(() => ({
    cases,
    activeCaseId,
    activeCase,
    isLoading,
    error,
    isPending,
  }), [cases, activeCaseId, activeCase, isLoading, error, isPending]);

  const actions = useMemo<CasesActions>(() => ({
    loadCases,
    loadCaseById,
    setActiveCase,
    addCase,
    updateCase,
    deleteCase,
    searchCases,
  }), [loadCases, loadCaseById, setActiveCase, addCase, updateCase, deleteCase, searchCases]);

  return (
    <CasesStateContext.Provider value={state}>
      <CasesActionsContext.Provider value={actions}>
        {children}
      </CasesActionsContext.Provider>
    </CasesStateContext.Provider>
  );
}

// ============================================================================
// HOOKS
// ============================================================================

export function useCasesState(): CasesState {
  const context = useContext(CasesStateContext);
  if (!context) {
    throw new Error('useCasesState must be used within CasesProvider');
  }
  return context;
}

export function useCasesActions(): CasesActions {
  const context = useContext(CasesActionsContext);
  if (!context) {
    throw new Error('useCasesActions must be used within CasesProvider');
  }
  return context;
}

/**
 * Combined hook for convenience (use split hooks for optimization)
 */
export function useCases() {
  return {
    ...useCasesState(),
    ...useCasesActions(),
  };
}
