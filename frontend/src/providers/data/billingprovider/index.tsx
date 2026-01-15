// ================================================================================
// ENTERPRISE REACT CONTEXT FILE - BILLING DOMAIN
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
//   DataService → Billing Provider → Billing Components
//
// RULES ENFORCED:
//   ✓ Domain-scoped state only (billing, time tracking)
//   ✓ Uses DataService for backend/local routing
//   ✓ No direct API calls (uses DataService.billing)
//   ✓ Timer state management
//   ✓ Memoized context values
//   ✓ Split state/actions contexts
//
// DATA FLOW:
// Backend API → DataService → BillingProvider → Consumer Components
//
// ================================================================================

/**
 * Billing Provider
 *
 * Manages billing, time tracking, and invoice data state.
 * Handles time entry creation, timer functionality, and invoice generation
 * via DataService integration with backend API.
 *
 * @module providers/data/billingprovider
 */

import { BillingActionsContext, BillingStateContext } from '@/lib/billing/contexts';
import type { BillingActionsValue, BillingProviderProps, BillingStateValue } from '@/lib/billing/types';
import { DataService } from '@/services/data/dataService';
import type { BillingRate } from '@/types/billing-rate';
import type { Invoice, TimeEntry } from '@/types/financial';
import type { CaseId } from '@/types/primitives';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

// ============================================================================
// PROVIDER IMPLEMENTATION
// ============================================================================

export function BillingProvider({ children, initialTimeEntries, initialInvoices }: BillingProviderProps) {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(initialTimeEntries || []);
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices || []);
  const [rates, setRates] = useState<BillingRate[]>([]);
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [currentTimer, setCurrentTimer] = useState<{
    startTime: Date;
    caseId: string;
    description: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const loadTimeEntries = useCallback(async (filters?: {
    caseId?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const loaded = await (DataService.billing as unknown as {
        getTimeEntries: (filters?: unknown) => Promise<TimeEntry[]>
      }).getTimeEntries(filters);
      setTimeEntries(loaded);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load time entries'));
      console.error('[BillingProvider] Failed to load time entries:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadInvoices = useCallback(async (filters?: { clientId?: string; status?: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const loaded = await (DataService.billing as unknown as {
        getInvoices: (filters?: unknown) => Promise<Invoice[]>
      }).getInvoices(filters);
      setInvoices(loaded);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load invoices'));
      console.error('[BillingProvider] Failed to load invoices:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadRates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const loaded = await (DataService.billing as unknown as {
        getRates: () => Promise<BillingRate[]>
      }).getRates();
      setRates(loaded);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load billing rates'));
      console.error('[BillingProvider] Failed to load rates:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTimeEntry = useCallback(async (entry: Partial<TimeEntry>): Promise<TimeEntry> => {
    setIsLoading(true);
    setError(null);
    try {
      const newEntry = await (DataService.billing as unknown as {
        addTimeEntry: (entry: Partial<TimeEntry>) => Promise<TimeEntry>
      }).addTimeEntry(entry);

      setTimeEntries(prev => [...prev, newEntry]);
      return newEntry;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create time entry'));
      console.error('[BillingProvider] Failed to create time entry:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTimeEntry = useCallback(async (id: string, updates: Partial<TimeEntry>): Promise<TimeEntry> => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await (DataService.billing as unknown as {
        updateTimeEntry: (id: string, updates: Partial<TimeEntry>) => Promise<TimeEntry>
      }).updateTimeEntry(id, updates);

      setTimeEntries(prev => prev.map(e => e.id === id ? updated : e));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to update time entry ${id}`));
      console.error('[BillingProvider] Failed to update time entry:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteTimeEntry = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await (DataService.billing as unknown as {
        deleteTimeEntry: (id: string) => Promise<void>
      }).deleteTimeEntry(id);

      setTimeEntries(prev => prev.filter(e => e.id !== id));
      if (activeEntryId === id) {
        setActiveEntryId(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to delete time entry ${id}`));
      console.error('[BillingProvider] Failed to delete time entry:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [activeEntryId]);

  const startTimer = useCallback((caseId: string, description: string) => {
    setCurrentTimer({
      startTime: new Date(),
      caseId,
      description,
    });
    setIsTracking(true);
    console.log('[BillingProvider] Timer started for case:', caseId);
  }, []);

  const stopTimer = useCallback(async (): Promise<TimeEntry | null> => {
    if (!currentTimer) {
      console.warn('[BillingProvider] No active timer to stop');
      return null;
    }

    const duration = (new Date().getTime() - currentTimer.startTime.getTime()) / (1000 * 60 * 60); // hours

    try {
      const entry = await createTimeEntry({
        caseId: currentTimer.caseId as unknown as CaseId,
        description: currentTimer.description,
        date: currentTimer.startTime.toISOString(),
        duration: Math.round(duration * 100) / 100, // Round to 2 decimals
        billable: true,
      } as unknown as Partial<TimeEntry>);

      setCurrentTimer(null);
      setIsTracking(false);
      console.log('[BillingProvider] Timer stopped, entry created:', entry.id);

      return entry;
    } catch (err) {
      console.error('[BillingProvider] Failed to stop timer:', err);
      setCurrentTimer(null);
      setIsTracking(false);
      throw err;
    }
  }, [currentTimer, createTimeEntry]);

  const generateInvoice = useCallback(async (params: {
    clientId: string;
    timeEntryIds: string[];
  }): Promise<Invoice> => {
    setIsLoading(true);
    setError(null);
    try {
      const invoice = await (DataService.billing as unknown as {
        generateInvoice: (params: unknown) => Promise<Invoice>
      }).generateInvoice(params);

      setInvoices(prev => [...prev, invoice]);
      return invoice;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to generate invoice'));
      console.error('[BillingProvider] Failed to generate invoice:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshBilling = useCallback(async () => {
    await Promise.all([
      loadTimeEntries(),
      loadInvoices(),
      loadRates(),
    ]);
  }, [loadTimeEntries, loadInvoices, loadRates]);

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  useEffect(() => {
    if (!initialTimeEntries && !initialInvoices) {
      refreshBilling();
    }
  }, [initialTimeEntries, initialInvoices, refreshBilling]);

  // ============================================================================
  // CONTEXT VALUES
  // ============================================================================

  const stateValue = useMemo<BillingStateValue>(() => ({
    timeEntries,
    invoices,
    rates,
    activeEntryId,
    isTracking,
    currentTimer,
    isLoading,
    error,
  }), [timeEntries, invoices, rates, activeEntryId, isTracking, currentTimer, isLoading, error]);

  const actionsValue = useMemo<BillingActionsValue>(() => ({
    loadTimeEntries,
    loadInvoices,
    loadRates,
    createTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    startTimer,
    stopTimer,
    generateInvoice,
    refreshBilling,
  }), [
    loadTimeEntries,
    loadInvoices,
    loadRates,
    createTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    startTimer,
    stopTimer,
    generateInvoice,
    refreshBilling
  ]);

  return (
    <BillingStateContext.Provider value={stateValue}>
      <BillingActionsContext.Provider value={actionsValue}>
        {children}
      </BillingActionsContext.Provider>
    </BillingStateContext.Provider>
  );
}

// ============================================================================
// PUBLIC HOOKS
// ============================================================================

export function useBillingState(): BillingStateValue {
  const context = useContext(BillingStateContext);
  if (!context) {
    throw new Error('useBillingState must be used within BillingProvider');
  }
  return context;
}

export function useBillingActions(): BillingActionsValue {
  const context = useContext(BillingActionsContext);
  if (!context) {
    throw new Error('useBillingActions must be used within BillingProvider');
  }
  return context;
}

export function useBilling() {
  return {
    state: useBillingState(),
    actions: useBillingActions(),
  };
}
