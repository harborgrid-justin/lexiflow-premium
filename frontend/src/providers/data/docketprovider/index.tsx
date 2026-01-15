// ================================================================================
// ENTERPRISE REACT CONTEXT FILE - DOCKET DOMAIN
// ================================================================================

/**
 * Docket Provider
 *
 * Manages docket entry data state and operations for litigation tracking.
 * Handles docket entry CRUD, search, filtering by case, and chronological sorting.
 *
 * @module providers/data/docketprovider
 */

import { DocketActionsContext, DocketStateContext } from '@/lib/docket/contexts';
import type { DocketActionsValue, DocketProviderProps, DocketStateValue } from '@/lib/docket/types';
import { DataService } from '@/services/data/dataService';
import type { DocketEntry } from '@/types/motion-docket';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

export function DocketProvider({ children, initialEntries, caseId }: DocketProviderProps) {
  const [entries, setEntries] = useState<DocketEntry[]>(initialEntries || []);
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const [activeEntry, setActiveEntryState] = useState<DocketEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [filterByCaseId, setFilterByCaseId] = useState<string | null>(caseId || null);

  const loadEntries = useCallback(async (filterCaseId?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = filterCaseId ? { caseId: filterCaseId } : {};
      const loaded = await (DataService.docket as unknown as { getAll: (params?: unknown) => Promise<DocketEntry[]> }).getAll(params);
      setEntries(loaded.sort((a, b) => new Date(b.dateFiled).getTime() - new Date(a.dateFiled).getTime()));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load docket entries'));
      console.error('[DocketProvider] Failed to load entries:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadEntryById = useCallback(async (id: string): Promise<DocketEntry | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const entry = await (DataService.docket as unknown as { getById: (id: string) => Promise<DocketEntry> }).getById(id);
      setEntries(prev => {
        const exists = prev.find(e => e.id === id);
        if (exists) {
          return prev.map(e => e.id === id ? entry : e);
        }
        return [...prev, entry].sort((a, b) => new Date(b.dateFiled).getTime() - new Date(a.dateFiled).getTime());
      });
      return entry;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to load docket entry ${id}`));
      console.error('[DocketProvider] Failed to load entry:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createEntry = useCallback(async (data: Partial<DocketEntry>): Promise<DocketEntry> => {
    setIsLoading(true);
    setError(null);
    try {
      const newEntry = await (DataService.docket as unknown as { add: (data: Partial<DocketEntry>) => Promise<DocketEntry> }).add(data);
      setEntries(prev => [newEntry, ...prev]);
      return newEntry;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create docket entry'));
      console.error('[DocketProvider] Failed to create entry:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateEntry = useCallback(async (id: string, updates: Partial<DocketEntry>): Promise<DocketEntry> => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await (DataService.docket as unknown as { update: (id: string, data: Partial<DocketEntry>) => Promise<DocketEntry> }).update(id, updates);
      setEntries(prev => prev.map(e => e.id === id ? updated : e));
      if (activeEntryId === id) {
        setActiveEntryState(updated);
      }
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to update docket entry ${id}`));
      console.error('[DocketProvider] Failed to update entry:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [activeEntryId]);

  const deleteEntry = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await (DataService.docket as unknown as { delete: (id: string) => Promise<void> }).delete(id);
      setEntries(prev => prev.filter(e => e.id !== id));
      if (activeEntryId === id) {
        setActiveEntryId(null);
        setActiveEntryState(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to delete docket entry ${id}`));
      console.error('[DocketProvider] Failed to delete entry:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [activeEntryId]);

  const setActiveEntry = useCallback((id: string | null) => {
    setActiveEntryId(id);
    if (id) {
      const found = entries.find(e => e.id === id);
      setActiveEntryState(found || null);
      if (!found) {
        loadEntryById(id).then(loaded => {
          if (loaded) setActiveEntryState(loaded);
        });
      }
    } else {
      setActiveEntryState(null);
    }
  }, [entries, loadEntryById]);

  const searchEntries = useCallback(async (query: string, filterCaseId?: string): Promise<DocketEntry[]> => {
    if (!query.trim()) return entries;

    const lowerQuery = query.toLowerCase();
    let filtered = entries.filter(e =>
      e.description?.toLowerCase().includes(lowerQuery) ||
      e.filedBy?.toLowerCase().includes(lowerQuery) ||
      e.docketNumber?.includes(query)
    );

    if (filterCaseId) {
      filtered = filtered.filter(e => e.caseId === filterCaseId);
    }

    return filtered;
  }, [entries]);

  const filterByCase = useCallback((caseId: string | null) => {
    setFilterByCaseId(caseId);
    loadEntries(caseId || undefined);
  }, [loadEntries]);

  const refreshEntries = useCallback(async () => {
    await loadEntries(filterByCaseId || undefined);
  }, [loadEntries, filterByCaseId]);

  useEffect(() => {
    if (!initialEntries) {
      loadEntries(caseId);
    }
  }, [initialEntries, caseId, loadEntries]);

  useEffect(() => {
    if (activeEntryId) {
      const found = entries.find(e => e.id === activeEntryId);
      if (found) {
        setActiveEntryState(found);
      }
    }
  }, [activeEntryId, entries]);

  const stateValue = useMemo<DocketStateValue>(() => ({
    entries,
    activeEntryId,
    activeEntry,
    isLoading,
    error,
    filterByCaseId,
  }), [entries, activeEntryId, activeEntry, isLoading, error, filterByCaseId]);

  const actionsValue = useMemo<DocketActionsValue>(() => ({
    loadEntries,
    loadEntryById,
    createEntry,
    updateEntry,
    deleteEntry,
    setActiveEntry,
    searchEntries,
    filterByCase,
    refreshEntries,
  }), [loadEntries, loadEntryById, createEntry, updateEntry, deleteEntry, setActiveEntry, searchEntries, filterByCase, refreshEntries]);

  return (
    <DocketStateContext.Provider value={stateValue}>
      <DocketActionsContext.Provider value={actionsValue}>
        {children}
      </DocketActionsContext.Provider>
    </DocketStateContext.Provider>
  );
}

export function useDocketState(): DocketStateValue {
  const context = useContext(DocketStateContext);
  if (!context) {
    throw new Error('useDocketState must be used within DocketProvider');
  }
  return context;
}

export function useDocketActions(): DocketActionsValue {
  const context = useContext(DocketActionsContext);
  if (!context) {
    throw new Error('useDocketActions must be used within DocketProvider');
  }
  return context;
}

export function useDocket() {
  return {
    state: useDocketState(),
    actions: useDocketActions(),
  };
}
