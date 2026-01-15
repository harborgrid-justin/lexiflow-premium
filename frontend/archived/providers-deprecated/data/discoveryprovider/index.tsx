// ================================================================================
// ENTERPRISE REACT CONTEXT FILE - DISCOVERY DOMAIN
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
//   DataService → Discovery Provider → Discovery Components
//
// RULES ENFORCED:
//   ✓ Domain-scoped state only (evidence, discovery)
//   ✓ Uses DataService for backend/local routing
//   ✓ No direct API calls (uses DataService.evidence)
//   ✓ Chain of custody tracking
//   ✓ Memoized context values
//   ✓ Split state/actions contexts
//
// DATA FLOW:
// Backend API → DataService → DiscoveryProvider → Consumer Components
//
// ================================================================================

/**
 * Discovery Provider
 *
 * Manages discovery and evidence data state for the application.
 * Handles evidence items, chain of custody, and discovery operations
 * via DataService integration with backend API.
 *
 * @module providers/data/discoveryprovider
 */

import { DiscoveryActionsContext, DiscoveryStateContext } from '@/lib/discovery/contexts';
import type { DiscoveryActionsValue, DiscoveryProviderProps, DiscoveryStateValue } from '@/lib/discovery/types';
import { DataService } from '@/services/data/dataService';
import type { EvidenceItem } from '@/types/evidence';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

// ============================================================================
// PROVIDER IMPLEMENTATION
// ============================================================================

export function DiscoveryProvider({ children, initialEvidence, caseId }: DiscoveryProviderProps) {
  const [evidence, setEvidence] = useState<EvidenceItem[]>(initialEvidence || []);
  const [activeEvidenceId, setActiveEvidenceId] = useState<string | null>(null);
  const [activeEvidence, setActiveEvidenceState] = useState<EvidenceItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [filterByCaseId, setFilterByCaseId] = useState<string | null>(caseId || null);

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const loadEvidence = useCallback(async (filterCaseId?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = filterCaseId ? { caseId: filterCaseId } : {};
      const loaded = await (DataService.evidence as unknown as {
        getAll: (params?: unknown) => Promise<EvidenceItem[]>
      }).getAll(params);
      setEvidence(loaded);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load evidence'));
      console.error('[DiscoveryProvider] Failed to load evidence:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadEvidenceById = useCallback(async (id: string): Promise<EvidenceItem | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const item = await (DataService.evidence as unknown as {
        getById: (id: string) => Promise<EvidenceItem>
      }).getById(id);

      // Update cache
      setEvidence(prev => {
        const exists = prev.find(e => e.id === id);
        if (exists) {
          return prev.map(e => e.id === id ? item : e);
        }
        return [...prev, item];
      });
      return item;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to load evidence ${id}`));
      console.error('[DiscoveryProvider] Failed to load evidence:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createEvidence = useCallback(async (data: Partial<EvidenceItem>): Promise<EvidenceItem> => {
    setIsLoading(true);
    setError(null);
    try {
      const newItem = await (DataService.evidence as unknown as {
        add: (data: Partial<EvidenceItem>) => Promise<EvidenceItem>
      }).add(data);

      setEvidence(prev => [...prev, newItem]);
      return newItem;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create evidence'));
      console.error('[DiscoveryProvider] Failed to create evidence:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateEvidence = useCallback(async (id: string, updates: Partial<EvidenceItem>): Promise<EvidenceItem> => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await (DataService.evidence as unknown as {
        update: (id: string, data: Partial<EvidenceItem>) => Promise<EvidenceItem>
      }).update(id, updates);

      setEvidence(prev => prev.map(e => e.id === id ? updated : e));
      if (activeEvidenceId === id) {
        setActiveEvidenceState(updated);
      }
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to update evidence ${id}`));
      console.error('[DiscoveryProvider] Failed to update evidence:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [activeEvidenceId]);

  const deleteEvidence = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await (DataService.evidence as unknown as { delete: (id: string) => Promise<void> }).delete(id);
      setEvidence(prev => prev.filter(e => e.id !== id));
      if (activeEvidenceId === id) {
        setActiveEvidenceId(null);
        setActiveEvidenceState(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to delete evidence ${id}`));
      console.error('[DiscoveryProvider] Failed to delete evidence:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [activeEvidenceId]);

  const setActiveEvidence = useCallback((id: string | null) => {
    setActiveEvidenceId(id);
    if (id) {
      const found = evidence.find(e => e.id === id);
      setActiveEvidenceState(found || null);
      if (!found) {
        loadEvidenceById(id).then(loaded => {
          if (loaded) setActiveEvidenceState(loaded);
        });
      }
    } else {
      setActiveEvidenceState(null);
    }
  }, [evidence, loadEvidenceById]);

  const searchEvidence = useCallback(async (query: string, filterCaseId?: string): Promise<EvidenceItem[]> => {
    if (!query.trim()) return evidence;

    const lowerQuery = query.toLowerCase();
    let filtered = evidence.filter(e =>
      e.title?.toLowerCase().includes(lowerQuery) ||
      e.description?.toLowerCase().includes(lowerQuery) ||
      e.type?.toLowerCase().includes(lowerQuery)
    );

    if (filterCaseId) {
      filtered = filtered.filter(e => e.caseId === filterCaseId);
    }

    return filtered;
  }, [evidence]);

  const updateChainOfCustody = useCallback(async (
    id: string,
    entry: Record<string, unknown>
  ): Promise<EvidenceItem> => {
    setIsLoading(true);
    setError(null);
    try {
      // Get current evidence
      const current = evidence.find(e => e.id === id);
      if (!current) {
        throw new Error(`Evidence ${id} not found`);
      }

      // Update chain of custody
      const chainOfCustody = [
        ...(current.chainOfCustody || []),
        {
          ...entry,
          timestamp: new Date().toISOString(),
        }
      ];

      const updated = await updateEvidence(id, { chainOfCustody } as Partial<EvidenceItem>);
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to update chain of custody for ${id}`));
      console.error('[DiscoveryProvider] Failed to update chain of custody:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [evidence, updateEvidence]);

  const filterByCase = useCallback((caseId: string | null) => {
    setFilterByCaseId(caseId);
    loadEvidence(caseId || undefined);
  }, [loadEvidence]);

  const refreshEvidence = useCallback(async () => {
    await loadEvidence(filterByCaseId || undefined);
  }, [loadEvidence, filterByCaseId]);

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  useEffect(() => {
    if (!initialEvidence) {
      loadEvidence(caseId);
    }
  }, [initialEvidence, caseId, loadEvidence]);

  useEffect(() => {
    if (activeEvidenceId) {
      const found = evidence.find(e => e.id === activeEvidenceId);
      if (found) {
        setActiveEvidenceState(found);
      }
    }
  }, [activeEvidenceId, evidence]);

  // ============================================================================
  // CONTEXT VALUES
  // ============================================================================

  const stateValue = useMemo<DiscoveryStateValue>(() => ({
    evidence,
    activeEvidenceId,
    activeEvidence,
    isLoading,
    error,
    filterByCaseId,
  }), [evidence, activeEvidenceId, activeEvidence, isLoading, error, filterByCaseId]);

  const actionsValue = useMemo<DiscoveryActionsValue>(() => ({
    loadEvidence,
    loadEvidenceById,
    createEvidence,
    updateEvidence,
    deleteEvidence,
    setActiveEvidence,
    searchEvidence,
    updateChainOfCustody,
    filterByCase,
    refreshEvidence,
  }), [
    loadEvidence,
    loadEvidenceById,
    createEvidence,
    updateEvidence,
    deleteEvidence,
    setActiveEvidence,
    searchEvidence,
    updateChainOfCustody,
    filterByCase,
    refreshEvidence
  ]);

  return (
    <DiscoveryStateContext.Provider value={stateValue}>
      <DiscoveryActionsContext.Provider value={actionsValue}>
        {children}
      </DiscoveryActionsContext.Provider>
    </DiscoveryStateContext.Provider>
  );
}

// ============================================================================
// PUBLIC HOOKS
// ============================================================================

export function useDiscoveryState(): DiscoveryStateValue {
  const context = useContext(DiscoveryStateContext);
  if (!context) {
    throw new Error('useDiscoveryState must be used within DiscoveryProvider');
  }
  return context;
}

export function useDiscoveryActions(): DiscoveryActionsValue {
  const context = useContext(DiscoveryActionsContext);
  if (!context) {
    throw new Error('useDiscoveryActions must be used within DiscoveryProvider');
  }
  return context;
}

export function useDiscovery() {
  return {
    state: useDiscoveryState(),
    actions: useDiscoveryActions(),
  };
}
