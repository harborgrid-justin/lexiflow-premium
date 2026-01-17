/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Case Billing - Feature Provider
 *
 * Responsibilities:
 * - Route-scoped state and derivations for case billing
 * - Totals (hours/billed/expenses/invoiced)
 * - Budget utilization metrics
 */

import React, { createContext, useContext, useMemo, useState } from 'react';

import type { Case } from '@/types';

export type CaseBillingTimeEntry = {
  id: string;
  date: string;
  user?: string;
  description?: string;
  hours?: number;
  amount?: number;
  // Backend-aligned fields (fallbacks)
  duration?: number;
  total?: number;
  discountedTotal?: number;
};

export type CaseBillingInvoice = {
  id: string;
  status: string;
  date?: string;
  number?: string;
  total?: number;
  // Backend-aligned fields (fallbacks)
  invoiceDate?: string;
  invoiceNumber?: string;
  totalAmount?: number;
  amount?: number;
};

export type CaseBillingExpense = {
  id?: string;
  date?: string;
  description?: string;
  amount?: number;
  total?: number;
};

export interface CaseBillingLoaderData {
  caseData: Case;
  timeEntries: CaseBillingTimeEntry[];
  invoices: CaseBillingInvoice[];
  expenses: CaseBillingExpense[];
}

export interface CaseBillingTotals {
  hours: number;
  billed: number;
  expenses: number;
  invoiced: number;
}

export interface CaseBillingBudgetMetrics {
  budgetAmount: number;
  budgetUtilization: number;
  budgetRemaining: number;
  showBudget: boolean;
}

interface CaseBillingContextValue {
  caseData: Case;
  timeEntries: CaseBillingTimeEntry[];
  invoices: CaseBillingInvoice[];
  expenses: CaseBillingExpense[];
  totals: CaseBillingTotals;
  budget: CaseBillingBudgetMetrics;
}

const CaseBillingContext = createContext<CaseBillingContextValue | undefined>(undefined);

function asNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

export function CaseBillingProvider({
  initialData,
  children,
}: {
  initialData: CaseBillingLoaderData;
  children: React.ReactNode;
}) {
  const [caseData] = useState(() => initialData.caseData);
  const [timeEntries] = useState(() => initialData.timeEntries);
  const [invoices] = useState(() => initialData.invoices);
  const [expenses] = useState(() => initialData.expenses);

  const totals = useMemo<CaseBillingTotals>(() => {
    const hours = timeEntries.reduce((sum, entry) => {
      const entryHours = asNumber(entry.hours) || asNumber(entry.duration);
      return sum + entryHours;
    }, 0);

    const billed = timeEntries.reduce((sum, entry) => {
      const entryAmount =
        asNumber(entry.amount) ||
        asNumber(entry.discountedTotal) ||
        asNumber(entry.total);
      return sum + entryAmount;
    }, 0);

    const expenseTotal = expenses.reduce((sum, entry) => {
      const value = asNumber(entry.amount) || asNumber(entry.total);
      return sum + value;
    }, 0);

    const invoiced = invoices.reduce((sum, inv) => {
      const value = asNumber(inv.total) || asNumber(inv.totalAmount) || asNumber(inv.amount);
      return sum + value;
    }, 0);

    return { hours, billed, expenses: expenseTotal, invoiced };
  }, [timeEntries, invoices, expenses]);

  const budget = useMemo<CaseBillingBudgetMetrics>(() => {
    const rawBudget = (caseData as unknown as { budget?: unknown }).budget;
    const budgetAmount =
      typeof rawBudget === 'number'
        ? rawBudget
        : asNumber((rawBudget as { amount?: unknown } | undefined)?.amount);

    const showBudget = budgetAmount > 0;
    const budgetUtilization = showBudget ? (totals.billed / budgetAmount) * 100 : 0;
    const budgetRemaining = showBudget ? budgetAmount - totals.billed : 0;

    return {
      budgetAmount,
      budgetUtilization,
      budgetRemaining,
      showBudget,
    };
  }, [caseData, totals.billed]);

  const value = useMemo<CaseBillingContextValue>(() => ({
    caseData,
    timeEntries,
    invoices,
    expenses,
    totals,
    budget,
  }), [caseData, timeEntries, invoices, expenses, totals, budget]);

  return (
    <CaseBillingContext.Provider value={value}>
      {children}
    </CaseBillingContext.Provider>
  );
}

export function useCaseBilling(): CaseBillingContextValue {
  const ctx = useContext(CaseBillingContext);
  if (!ctx) {
    throw new Error('useCaseBilling must be used within CaseBillingProvider');
  }
  return ctx;
}
