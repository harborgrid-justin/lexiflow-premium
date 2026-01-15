/**
 * Billing Provider Types
 * Type definitions for time tracking and billing context
 *
 * @module lib/billing/types
 */

import type { BillingRate } from "@/types/billing-rate";
import type { Invoice, TimeEntry } from "@/types/financial";

export interface BillingStateValue {
  timeEntries: TimeEntry[];
  invoices: Invoice[];
  rates: BillingRate[];
  activeEntryId: string | null;
  isTracking: boolean;
  currentTimer: {
    startTime: Date;
    caseId: string;
    description: string;
  } | null;
  isLoading: boolean;
  error: Error | null;
}

export interface BillingActionsValue {
  loadTimeEntries: (filters?: {
    caseId?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
  }) => Promise<void>;
  loadInvoices: (filters?: {
    clientId?: string;
    status?: string;
  }) => Promise<void>;
  loadRates: () => Promise<void>;
  createTimeEntry: (entry: Partial<TimeEntry>) => Promise<TimeEntry>;
  updateTimeEntry: (
    id: string,
    updates: Partial<TimeEntry>
  ) => Promise<TimeEntry>;
  deleteTimeEntry: (id: string) => Promise<void>;
  startTimer: (caseId: string, description: string) => void;
  stopTimer: () => Promise<TimeEntry | null>;
  generateInvoice: (params: {
    clientId: string;
    timeEntryIds: string[];
  }) => Promise<Invoice>;
  refreshBilling: () => Promise<void>;
}

export interface BillingProviderProps {
  children: React.ReactNode;
  initialTimeEntries?: TimeEntry[];
  initialInvoices?: Invoice[];
}
