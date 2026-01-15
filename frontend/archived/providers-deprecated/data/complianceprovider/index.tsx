// ================================================================================
// ENTERPRISE REACT CONTEXT FILE - COMPLIANCE DOMAIN
// ================================================================================

/**
 * Compliance Provider
 *
 * Manages compliance and conflict check data state for regulatory adherence and ethical walls.
 * Handles conflict checks, audit logs, permissions, and ethical wall management.
 *
 * @module providers/data/complianceprovider
 */

import { ComplianceActionsContext, ComplianceStateContext } from '@/lib/compliance/contexts';
import type { ComplianceActionsValue, ComplianceProviderProps, ComplianceStateValue } from '@/lib/compliance/types';
import { DataService } from '@/services/data/dataService';
import type { ConflictCheck } from '@/types/compliance-risk';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

export function ComplianceProvider({ children, initialChecks }: ComplianceProviderProps) {
  const [checks, setChecks] = useState<ConflictCheck[]>(initialChecks || []);
  const [activeCheckId, setActiveCheckId] = useState<string | null>(null);
  const [activeCheck, setActiveCheckState] = useState<ConflictCheck | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [pendingChecks, setPendingChecks] = useState(0);

  const loadChecks = useCallback(async (filters?: { status?: string; caseId?: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const loaded = await (DataService.compliance as unknown as { getAll: (params?: unknown) => Promise<ConflictCheck[]> }).getAll(filters);
      setChecks(loaded.sort((a, b) => {
        const dateA = a.createdAt || a.date || '';
        const dateB = b.createdAt || b.date || '';
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      }));
      setPendingChecks(loaded.filter(c => c.status === 'Pending').length);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load compliance checks'));
      console.error('[ComplianceProvider] Failed to load checks:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadCheckById = useCallback(async (id: string): Promise<ConflictCheck | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const check = await (DataService.compliance as unknown as { getById: (id: string) => Promise<ConflictCheck> }).getById(id);
      setChecks(prev => {
        const exists = prev.find(c => c.id === id);
        if (exists) {
          return prev.map(c => c.id === id ? check : c);
        }
        return [check, ...prev];
      });
      return check;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to load compliance check ${id}`));
      console.error('[ComplianceProvider] Failed to load check:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCheck = useCallback(async (data: Partial<ConflictCheck>): Promise<ConflictCheck> => {
    setIsLoading(true);
    setError(null);
    try {
      const newCheck = await (DataService.compliance as unknown as { add: (data: Partial<ConflictCheck>) => Promise<ConflictCheck> }).add({
        ...data,
        status: 'Pending',
        createdAt: new Date().toISOString(),
      });
      setChecks(prev => [newCheck, ...prev]);
      setPendingChecks(prev => prev + 1);
      return newCheck;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create compliance check'));
      console.error('[ComplianceProvider] Failed to create check:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateCheck = useCallback(async (id: string, updates: Partial<ConflictCheck>): Promise<ConflictCheck> => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await (DataService.compliance as unknown as { update: (id: string, data: Partial<ConflictCheck>) => Promise<ConflictCheck> }).update(id, updates);
      setChecks(prev => prev.map(c => c.id === id ? updated : c));
      if (activeCheckId === id) {
        setActiveCheckState(updated);
      }
      // Recalculate pending checks
      const currentCheck = checks.find(c => c.id === id);
      if (currentCheck?.status === 'Pending' && updated.status !== 'Pending') {
        setPendingChecks(prev => Math.max(0, prev - 1));
      } else if (currentCheck?.status !== 'Pending' && updated.status === 'Pending') {
        setPendingChecks(prev => prev + 1);
      }
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to update compliance check ${id}`));
      console.error('[ComplianceProvider] Failed to update check:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [activeCheckId, checks]);

  const approveCheck = useCallback(async (id: string, notes?: string): Promise<void> => {
    await updateCheck(id, {
      status: 'Approved',
      reviewedAt: new Date().toISOString(),
      reviewNotes: notes
    } as Partial<ConflictCheck>);
  }, [updateCheck]);

  const rejectCheck = useCallback(async (id: string, notes?: string): Promise<void> => {
    await updateCheck(id, {
      status: 'Rejected',
      reviewedAt: new Date().toISOString(),
      reviewNotes: notes
    } as Partial<ConflictCheck>);
  }, [updateCheck]);


  const setActiveCheck = useCallback((id: string | null) => {
    setActiveCheckId(id);
    if (id) {
      const found = checks.find(c => c.id === id);
      setActiveCheckState(found || null);
      if (!found) {
        loadCheckById(id).then(loaded => {
          if (loaded) setActiveCheckState(loaded);
        });
      }
    } else {
      setActiveCheckState(null);
    }
  }, [checks, loadCheckById]);

  const searchChecks = useCallback(async (query: string): Promise<ConflictCheck[]> => {
    if (!query.trim()) return checks;

    const lowerQuery = query.toLowerCase();
    return checks.filter(c =>
      c.entityName?.toLowerCase().includes(lowerQuery) ||
      c.status?.toLowerCase().includes(lowerQuery) ||
      c.checkedBy?.toLowerCase().includes(lowerQuery)
    );
  }, [checks]);

  const refreshChecks = useCallback(async () => {
    await loadChecks();
  }, [loadChecks]);

  useEffect(() => {
    if (!initialChecks) {
      loadChecks();
    }
  }, [initialChecks, loadChecks]);

  useEffect(() => {
    if (activeCheckId) {
      const found = checks.find(c => c.id === activeCheckId);
      if (found) {
        setActiveCheckState(found);
      }
    }
  }, [activeCheckId, checks]);

  const stateValue = useMemo<ComplianceStateValue>(() => ({
    conflictChecks: checks,
    activeCheckId,
    activeCheck,
    isLoading,
    error,
    pendingChecks,
  }), [checks, activeCheckId, activeCheck, isLoading, error, pendingChecks]);

  const actionsValue = useMemo<ComplianceActionsValue>(() => ({
    loadConflictChecks: loadChecks,
    loadCheckById,
    createConflictCheck: createCheck,
    updateCheck,
    approveCheck,
    rejectCheck: (id: string, reason: string) => rejectCheck(id, reason),
    setActiveCheck,
    searchConflicts: searchChecks,
    refreshConflictChecks: refreshChecks,
  }), [
    loadChecks,
    loadCheckById,
    createCheck,
    updateCheck,
    approveCheck,
    rejectCheck,
    setActiveCheck,
    searchChecks,
    refreshChecks
  ]);

  return (
    <ComplianceStateContext.Provider value={stateValue}>
      <ComplianceActionsContext.Provider value={actionsValue}>
        {children}
      </ComplianceActionsContext.Provider>
    </ComplianceStateContext.Provider>
  );
}

export function useComplianceState(): ComplianceStateValue {
  const context = useContext(ComplianceStateContext);
  if (!context) {
    throw new Error('useComplianceState must be used within ComplianceProvider');
  }
  return context;
}

export function useComplianceActions(): ComplianceActionsValue {
  const context = useContext(ComplianceActionsContext);
  if (!context) {
    throw new Error('useComplianceActions must be used within ComplianceProvider');
  }
  return context;
}

export function useCompliance() {
  return {
    state: useComplianceState(),
    actions: useComplianceActions(),
  };
}
