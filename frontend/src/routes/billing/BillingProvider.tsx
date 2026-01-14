import React, { createContext, useCallback, useContext, useMemo, useState, useTransition } from 'react';
import { useRevalidator } from 'react-router';
import type { BillingRate, Invoice, TimeEntry, Transaction } from '../../types';

/**
 * Billing Domain State
 */
interface BillingState {
  invoices: Invoice[];
  transactions: Transaction[];
  rates: BillingRate[];
  timeEntries: TimeEntry[];
  activeTab: 'invoices' | 'transactions' | 'time' | 'rates';
  filters: {
    status?: string;
    dateRange?: { start: string; end: string };
    clientId?: string;
  };
}

/**
 * Billing Metrics (derived state)
 */
interface BillingMetrics {
  totalRevenue: number;
  outstandingBalance: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  totalBillableHours: number;
  unbilledHours: number;
}

/**
 * Billing Actions
 */
interface BillingActions {
  setActiveTab: (tab: BillingState['activeTab']) => void;
  setFilters: (filters: Partial<BillingState['filters']>) => void;
  revalidate: () => void;
}

interface BillingContextValue {
  state: BillingState;
  metrics: BillingMetrics;
  actions: BillingActions;
  isPending: boolean;
}

const BillingContext = createContext<BillingContextValue | null>(null);

interface BillingProviderProps {
  children: React.ReactNode;
  initialInvoices: Invoice[];
  initialTransactions: Transaction[];
  initialRates: BillingRate[];
  initialTimeEntries: TimeEntry[];
}

/**
 * BillingProvider - Domain Logic Layer
 *
 * Responsibilities:
 * - Manage billing domain state
 * - Compute derived metrics
 * - Provide stable callbacks
 * - Handle transitions
 */
export function BillingProvider({
  children,
  initialInvoices,
  initialTransactions,
  initialRates,
  initialTimeEntries
}: BillingProviderProps) {
  const [isPending, startTransition] = useTransition();
  const revalidator = useRevalidator();

  const [activeTab, setActiveTabState] = useState<BillingState['activeTab']>('invoices');
  const [filters, setFiltersState] = useState<BillingState['filters']>({});

  // Derived state: Billing metrics
  const metrics = useMemo<BillingMetrics>(() => {
    const totalRevenue = initialInvoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.totalAmount, 0);

    const outstandingBalance = initialInvoices
      .filter(inv => inv.status !== 'paid')
      .reduce((sum, inv) => sum + inv.totalAmount, 0);

    const paidInvoices = initialInvoices.filter(inv => inv.status === 'paid').length;
    const pendingInvoices = initialInvoices.filter(inv => inv.status === 'pending').length;

    const overdueInvoices = initialInvoices.filter(inv => {
      if (inv.status === 'paid') return false;
      return new Date(inv.dueDate) < new Date();
    }).length;

    const totalBillableHours = initialTimeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);

    const unbilledHours = initialTimeEntries
      .filter(entry => !entry.invoiceId)
      .reduce((sum, entry) => sum + (entry.duration || 0), 0);

    return {
      totalRevenue,
      outstandingBalance,
      paidInvoices,
      pendingInvoices,
      overdueInvoices,
      totalBillableHours,
      unbilledHours
    };
  }, [initialInvoices, initialTimeEntries]);

  // Stable callbacks
  const setActiveTab = useCallback((tab: BillingState['activeTab']) => {
    startTransition(() => {
      setActiveTabState(tab);
    });
  }, []);

  const setFilters = useCallback((newFilters: Partial<BillingState['filters']>) => {
    startTransition(() => {
      setFiltersState(prev => ({ ...prev, ...newFilters }));
    });
  }, []);

  const revalidate = useCallback(() => {
    revalidator.revalidate();
  }, [revalidator]);

  // Context value with split for optimization
  const state: BillingState = useMemo(() => ({
    invoices: initialInvoices,
    transactions: initialTransactions,
    rates: initialRates,
    timeEntries: initialTimeEntries,
    activeTab,
    filters
  }), [initialInvoices, initialTransactions, initialRates, initialTimeEntries, activeTab, filters]);

  const actions: BillingActions = useMemo(() => ({
    setActiveTab,
    setFilters,
    revalidate
  }), [setActiveTab, setFilters, revalidate]);

  const value = useMemo<BillingContextValue>(() => ({
    state,
    metrics,
    actions,
    isPending
  }), [state, metrics, actions, isPending]);

  return (
    <BillingContext.Provider value={value}>
      {children}
    </BillingContext.Provider>
  );
}

/**
 * Hook to access billing context
 */
export function useBilling() {
  const context = useContext(BillingContext);
  if (!context) {
    throw new Error('useBilling must be used within BillingProvider');
  }
  return context;
}
