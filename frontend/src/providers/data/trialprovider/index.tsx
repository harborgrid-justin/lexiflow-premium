// ================================================================================
// ENTERPRISE REACT CONTEXT FILE - TRIAL DOMAIN
// ================================================================================

/**
 * Trial Provider
 *
 * Manages trial preparation data state for courtroom readiness.
 * Handles exhibits, witnesses, examinations, and trial binder organization.
 *
 * @module providers/data/trialprovider
 */

import { TrialActionsContext, TrialStateContext } from '@/lib/trial/contexts';
import type { Examination, Exhibit, TrialActionsValue, TrialProviderProps, TrialStateValue } from '@/lib/trial/types';
import { DataService } from '@/services/data/dataService';
import type { Witness } from '@/types/trial';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

export function TrialProvider({ children, caseId }: TrialProviderProps) {
  const [exhibits, setExhibits] = useState<Exhibit[]>([]);
  const [witnesses, setWitnesses] = useState<Witness[]>([]);
  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [activeExhibitId, setActiveExhibitId] = useState<string | null>(null);
  const [activeWitnessId, setActiveWitnessId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [filterByCaseId, setFilterByCaseId] = useState<string | null>(caseId || null);

  // Exhibit Management
  const loadExhibits = useCallback(async (caseId?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const loaded = await (DataService.trial as unknown as { getExhibits: (caseId?: string) => Promise<Exhibit[]> }).getExhibits(caseId);
      setExhibits(loaded.sort((a, b) => (a.exhibitNumber || '').localeCompare(b.exhibitNumber || '')));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load exhibits'));
      console.error('[TrialProvider] Failed to load exhibits:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createExhibit = useCallback(async (data: Partial<Exhibit>): Promise<Exhibit> => {
    setIsLoading(true);
    setError(null);
    try {
      const newExhibit = await (DataService.trial as unknown as { addExhibit: (data: Partial<Exhibit>) => Promise<Exhibit> }).addExhibit(data);
      setExhibits(prev => [...prev, newExhibit].sort((a, b) =>
        (a.exhibitNumber || '').localeCompare(b.exhibitNumber || '')
      ));
      return newExhibit;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create exhibit'));
      console.error('[TrialProvider] Failed to create exhibit:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateExhibit = useCallback(async (id: string, updates: Partial<Exhibit>): Promise<Exhibit> => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await (DataService.trial as unknown as { updateExhibit: (id: string, data: Partial<Exhibit>) => Promise<Exhibit> }).updateExhibit(id, updates);
      setExhibits(prev => prev.map(e => e.id === id ? updated : e).sort((a, b) =>
        (a.exhibitNumber || '').localeCompare(b.exhibitNumber || '')
      ));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to update exhibit ${id}`));
      console.error('[TrialProvider] Failed to update exhibit:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteExhibit = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await (DataService.trial as unknown as { deleteExhibit: (id: string) => Promise<void> }).deleteExhibit(id);
      setExhibits(prev => prev.filter(e => e.id !== id));
      if (activeExhibitId === id) {
        setActiveExhibitId(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to delete exhibit ${id}`));
      console.error('[TrialProvider] Failed to delete exhibit:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [activeExhibitId]);

  // Witness Management
  const loadWitnesses = useCallback(async (caseId?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const loaded = await (DataService.trial as unknown as { getWitnesses: (caseId?: string) => Promise<Witness[]> }).getWitnesses(caseId);
      setWitnesses(loaded);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load witnesses'));
      console.error('[TrialProvider] Failed to load witnesses:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createWitness = useCallback(async (data: Partial<Witness>): Promise<Witness> => {
    setIsLoading(true);
    setError(null);
    try {
      const newWitness = await (DataService.trial as unknown as { addWitness: (data: Partial<Witness>) => Promise<Witness> }).addWitness(data);
      setWitnesses(prev => [...prev, newWitness]);
      return newWitness;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create witness'));
      console.error('[TrialProvider] Failed to create witness:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateWitness = useCallback(async (id: string, updates: Partial<Witness>): Promise<Witness> => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await (DataService.trial as unknown as { updateWitness: (id: string, data: Partial<Witness>) => Promise<Witness> }).updateWitness(id, updates);
      setWitnesses(prev => prev.map(w => w.id === id ? updated : w));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to update witness ${id}`));
      console.error('[TrialProvider] Failed to update witness:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteWitness = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await (DataService.trial as unknown as { deleteWitness: (id: string) => Promise<void> }).deleteWitness(id);
      setWitnesses(prev => prev.filter(w => w.id !== id));
      if (activeWitnessId === id) {
        setActiveWitnessId(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to delete witness ${id}`));
      console.error('[TrialProvider] Failed to delete witness:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [activeWitnessId]);

  // Examination Management
  const loadExaminations = useCallback(async (witnessId?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const loaded = await (DataService.trial as unknown as { getExaminations: (witnessId?: string) => Promise<Examination[]> }).getExaminations(witnessId);
      setExaminations(loaded);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load examinations'));
      console.error('[TrialProvider] Failed to load examinations:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createExamination = useCallback(async (data: Partial<Examination>): Promise<Examination> => {
    setIsLoading(true);
    setError(null);
    try {
      const newExamination = await (DataService.trial as unknown as { addExamination: (data: Partial<Examination>) => Promise<Examination> }).addExamination(data);
      setExaminations(prev => [...prev, newExamination]);
      return newExamination;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create examination'));
      console.error('[TrialProvider] Failed to create examination:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateExamination = useCallback(async (id: string, updates: Partial<Examination>): Promise<Examination> => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await (DataService.trial as unknown as { updateExamination: (id: string, data: Partial<Examination>) => Promise<Examination> }).updateExamination(id, updates);
      setExaminations(prev => prev.map(e => e.id === id ? updated : e));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to update examination ${id}`));
      console.error('[TrialProvider] Failed to update examination:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteExamination = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await (DataService.trial as unknown as { deleteExamination: (id: string) => Promise<void> }).deleteExamination(id);
      setExaminations(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to delete examination ${id}`));
      console.error('[TrialProvider] Failed to delete examination:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filterByCase = useCallback((caseId: string | null) => {
    setFilterByCaseId(caseId);
    if (caseId) {
      loadExhibits(caseId);
      loadWitnesses(caseId);
    } else {
      loadExhibits();
      loadWitnesses();
    }
  }, [loadExhibits, loadWitnesses]);

  const refreshTrial = useCallback(async () => {
    await Promise.all([
      loadExhibits(filterByCaseId || undefined),
      loadWitnesses(filterByCaseId || undefined),
      loadExaminations(),
    ]);
  }, [loadExhibits, loadWitnesses, loadExaminations, filterByCaseId]);

  useEffect(() => {
    loadExhibits(caseId);
    loadWitnesses(caseId);
    loadExaminations();
  }, [caseId, loadExhibits, loadWitnesses, loadExaminations]);

  const stateValue = useMemo<TrialStateValue>(() => ({
    exhibits,
    witnesses,
    examinations,
    activeExhibitId,
    activeWitnessId,
    isLoading,
    error,
    filterByCaseId,
  }), [exhibits, witnesses, examinations, activeExhibitId, activeWitnessId, isLoading, error, filterByCaseId]);

  const actionsValue = useMemo<TrialActionsValue>(() => ({
    loadExhibits,
    createExhibit,
    updateExhibit,
    deleteExhibit,
    loadWitnesses,
    createWitness,
    updateWitness,
    deleteWitness,
    loadExaminations,
    createExamination,
    updateExamination,
    deleteExamination,
    setActiveExhibit: setActiveExhibitId,
    setActiveWitness: setActiveWitnessId,
    filterByCase,
    refreshTrial,
  }), [
    loadExhibits,
    createExhibit,
    updateExhibit,
    deleteExhibit,
    loadWitnesses,
    createWitness,
    updateWitness,
    deleteWitness,
    loadExaminations,
    createExamination,
    updateExamination,
    deleteExamination,
    filterByCase,
    refreshTrial
  ]);

  return (
    <TrialStateContext.Provider value={stateValue}>
      <TrialActionsContext.Provider value={actionsValue}>
        {children}
      </TrialActionsContext.Provider>
    </TrialStateContext.Provider>
  );
}

export function useTrialState(): TrialStateValue {
  const context = useContext(TrialStateContext);
  if (!context) {
    throw new Error('useTrialState must be used within TrialProvider');
  }
  return context;
}

export function useTrialActions(): TrialActionsValue {
  const context = useContext(TrialActionsContext);
  if (!context) {
    throw new Error('useTrialActions must be used within TrialProvider');
  }
  return context;
}

export function useTrial() {
  return {
    state: useTrialState(),
    actions: useTrialActions(),
  };
}
