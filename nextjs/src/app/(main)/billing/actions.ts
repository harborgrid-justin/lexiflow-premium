'use server';

/**
 * Billing Module Server Actions
 *
 * Server-side actions for billing operations following Next.js 16 conventions.
 * All actions use proper async handling and revalidation.
 *
 * @module billing/actions
 */

import { revalidateTag } from 'next/cache';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import type {
  ActionResult,
  Invoice,
  InvoiceStats,
  InvoiceFilters,
  CreateInvoiceInput,
  UpdateInvoiceInput,
  RecordPaymentInput,
  TimeEntry,
  TimeEntryFilters,
  CreateTimeEntryInput,
  UpdateTimeEntryInput,
  BulkApproveResult,
  Expense,
  ExpenseFilters,
  CreateExpenseInput,
  UpdateExpenseInput,
  RateTable,
  CreateRateTableInput,
  UpdateRateTableInput,
  CreateRateInput,
  TrustAccount,
  TrustAccountFilters,
  CreateTrustAccountInput,
  DepositInput,
  WithdrawalInput,
  ReconciliationInput,
  TrustTransaction,
  BillingMetrics,
  PaymentMethod,
} from './types';

// =============================================================================
// Cache Tags
// =============================================================================

const CACHE_TAGS = {
  BILLING_METRICS: 'billing-metrics',
  INVOICES: 'billing-invoices',
  INVOICE_DETAIL: (id: string) => `billing-invoice-${id}`,
  TIME_ENTRIES: 'billing-time-entries',
  TIME_ENTRY_DETAIL: (id: string) => `billing-time-entry-${id}`,
  EXPENSES: 'billing-expenses',
  EXPENSE_DETAIL: (id: string) => `billing-expense-${id}`,
  RATE_TABLES: 'billing-rate-tables',
  RATE_TABLE_DETAIL: (id: string) => `billing-rate-table-${id}`,
  TRUST_ACCOUNTS: 'billing-trust-accounts',
  TRUST_ACCOUNT_DETAIL: (id: string) => `billing-trust-account-${id}`,
  TRUST_TRANSACTIONS: (accountId: string) => `billing-trust-transactions-${accountId}`,
} as const;

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Safely revalidate a cache tag with the required profile parameter
 */
function safeRevalidateTag(tag: string): void {
  try {
    // Next.js 16 requires 2nd arg for revalidateTag in some contexts
    // Using empty string as profile fallback
    revalidateTag(tag);
  } catch {
    console.warn(`Failed to revalidate tag: ${tag}`);
  }
}

/**
 * Build query string from filters object
 */
function buildQueryString(filters: Record<string, unknown>): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });
  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Parse form data to typed object
 */
function parseFormData<T>(formData: FormData, keys: string[]): Partial<T> {
  const result: Record<string, unknown> = {};
  keys.forEach((key) => {
    const value = formData.get(key);
    if (value !== null && value !== '') {
      result[key] = value;
    }
  });
  return result as Partial<T>;
}

// =============================================================================
// Billing Metrics Actions
// =============================================================================

/**
 * Fetch billing metrics for dashboard
 */
export async function getBillingMetrics(period?: string): Promise<ActionResult<BillingMetrics>> {
  try {
    const queryString = period ? `?period=${period}` : '';
    const metrics = await apiFetch<BillingMetrics>(
      `${API_ENDPOINTS.BILLING.METRICS}${queryString}`,
      {
        next: {
          tags: [CACHE_TAGS.BILLING_METRICS],
          revalidate: 60, // Revalidate every minute
        },
      }
    );
    return { success: true, data: metrics };
  } catch (error) {
    console.error('Failed to fetch billing metrics:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch billing metrics',
    };
  }
}

// =============================================================================
// Invoice Actions
// =============================================================================

/**
 * Fetch all invoices with optional filters
 */
export async function getInvoices(
  filters?: InvoiceFilters
): Promise<ActionResult<Invoice[]>> {
  try {
    const queryString = filters ? buildQueryString(filters) : '';
    const invoices = await apiFetch<Invoice[]>(
      `${API_ENDPOINTS.INVOICES.LIST}${queryString}`,
      {
        next: {
          tags: [CACHE_TAGS.INVOICES],
          revalidate: 30,
        },
      }
    );
    return { success: true, data: invoices };
  } catch (error) {
    console.error('Failed to fetch invoices:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch invoices',
    };
  }
}

/**
 * Fetch invoice statistics
 */
export async function getInvoiceStats(): Promise<ActionResult<InvoiceStats>> {
  try {
    const stats = await apiFetch<InvoiceStats>(`${API_ENDPOINTS.INVOICES.LIST}/stats`, {
      next: {
        tags: [CACHE_TAGS.INVOICES],
        revalidate: 60,
      },
    });
    return { success: true, data: stats };
  } catch (error) {
    console.error('Failed to fetch invoice stats:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch invoice stats',
    };
  }
}

/**
 * Fetch single invoice by ID
 */
export async function getInvoiceById(id: string): Promise<ActionResult<Invoice>> {
  try {
    const invoice = await apiFetch<Invoice>(API_ENDPOINTS.INVOICES.DETAIL(id), {
      next: {
        tags: [CACHE_TAGS.INVOICE_DETAIL(id), CACHE_TAGS.INVOICES],
        revalidate: 30,
      },
    });
    return { success: true, data: invoice };
  } catch (error) {
    console.error('Failed to fetch invoice:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Invoice not found',
    };
  }
}

/**
 * Create a new invoice
 */
export async function createInvoice(
  input: CreateInvoiceInput
): Promise<ActionResult<Invoice>> {
  try {
    const invoice = await apiFetch<Invoice>(API_ENDPOINTS.INVOICES.CREATE, {
      method: 'POST',
      body: JSON.stringify(input),
    });
    safeRevalidateTag(CACHE_TAGS.INVOICES);
    safeRevalidateTag(CACHE_TAGS.BILLING_METRICS);
    return { success: true, message: 'Invoice created successfully', data: invoice };
  } catch (error) {
    console.error('Failed to create invoice:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create invoice',
    };
  }
}

/**
 * Update an existing invoice
 */
export async function updateInvoice(
  id: string,
  input: UpdateInvoiceInput
): Promise<ActionResult<Invoice>> {
  try {
    const invoice = await apiFetch<Invoice>(API_ENDPOINTS.INVOICES.UPDATE(id), {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
    safeRevalidateTag(CACHE_TAGS.INVOICE_DETAIL(id));
    safeRevalidateTag(CACHE_TAGS.INVOICES);
    safeRevalidateTag(CACHE_TAGS.BILLING_METRICS);
    return { success: true, message: 'Invoice updated successfully', data: invoice };
  } catch (error) {
    console.error('Failed to update invoice:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update invoice',
    };
  }
}

/**
 * Delete an invoice
 */
export async function deleteInvoice(id: string): Promise<ActionResult> {
  try {
    await apiFetch(API_ENDPOINTS.INVOICES.DELETE(id), {
      method: 'DELETE',
    });
    safeRevalidateTag(CACHE_TAGS.INVOICE_DETAIL(id));
    safeRevalidateTag(CACHE_TAGS.INVOICES);
    safeRevalidateTag(CACHE_TAGS.BILLING_METRICS);
    return { success: true, message: 'Invoice deleted successfully' };
  } catch (error) {
    console.error('Failed to delete invoice:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete invoice',
    };
  }
}

/**
 * Send invoice to client
 */
export async function sendInvoice(
  id: string,
  recipients?: string[]
): Promise<ActionResult> {
  try {
    await apiFetch(API_ENDPOINTS.INVOICES.SEND(id), {
      method: 'POST',
      body: JSON.stringify({ recipients }),
    });
    safeRevalidateTag(CACHE_TAGS.INVOICE_DETAIL(id));
    safeRevalidateTag(CACHE_TAGS.INVOICES);
    return { success: true, message: 'Invoice sent successfully' };
  } catch (error) {
    console.error('Failed to send invoice:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send invoice',
    };
  }
}

/**
 * Record payment for invoice
 */
export async function recordInvoicePayment(
  invoiceId: string,
  payment: RecordPaymentInput
): Promise<ActionResult> {
  try {
    await apiFetch(`${API_ENDPOINTS.INVOICES.DETAIL(invoiceId)}/payments`, {
      method: 'POST',
      body: JSON.stringify(payment),
    });
    safeRevalidateTag(CACHE_TAGS.INVOICE_DETAIL(invoiceId));
    safeRevalidateTag(CACHE_TAGS.INVOICES);
    safeRevalidateTag(CACHE_TAGS.BILLING_METRICS);
    return { success: true, message: 'Payment recorded successfully' };
  } catch (error) {
    console.error('Failed to record payment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to record payment',
    };
  }
}

/**
 * Invoice form action handler
 */
export async function invoiceFormAction(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const intent = formData.get('intent') as string;

  switch (intent) {
    case 'send': {
      const id = formData.get('id') as string;
      const recipientsRaw = formData.get('recipients') as string;
      const recipients = recipientsRaw ? JSON.parse(recipientsRaw) : undefined;
      return sendInvoice(id, recipients);
    }

    case 'record-payment': {
      const invoiceId = formData.get('invoiceId') as string;
      const methodRaw = formData.get('method') as string;
      let method: PaymentMethod = PaymentMethod.CHECK;

      switch (methodRaw.toLowerCase()) {
        case 'check':
          method = PaymentMethod.CHECK;
          break;
        case 'wire':
          method = PaymentMethod.WIRE;
          break;
        case 'credit_card':
        case 'credit card':
          method = PaymentMethod.CREDIT_CARD;
          break;
        case 'ach':
          method = PaymentMethod.ACH;
          break;
        case 'cash':
          method = PaymentMethod.CASH;
          break;
      }

      const payment: RecordPaymentInput = {
        amount: parseFloat(formData.get('amount') as string),
        date: formData.get('date') as string,
        method,
        reference: (formData.get('reference') as string) || undefined,
        notes: (formData.get('notes') as string) || undefined,
      };
      return recordInvoicePayment(invoiceId, payment);
    }

    case 'delete': {
      const deleteId = formData.get('id') as string;
      return deleteInvoice(deleteId);
    }

    default:
      return { success: false, error: 'Invalid action' };
  }
}

// =============================================================================
// Time Entry Actions
// =============================================================================

/**
 * Fetch all time entries with optional filters
 */
export async function getTimeEntries(
  filters?: TimeEntryFilters
): Promise<ActionResult<TimeEntry[]>> {
  try {
    const queryString = filters ? buildQueryString(filters) : '';
    const entries = await apiFetch<TimeEntry[]>(
      `${API_ENDPOINTS.TIME_ENTRIES.LIST}${queryString}`,
      {
        next: {
          tags: [CACHE_TAGS.TIME_ENTRIES],
          revalidate: 30,
        },
      }
    );
    return { success: true, data: entries };
  } catch (error) {
    console.error('Failed to fetch time entries:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch time entries',
    };
  }
}

/**
 * Fetch single time entry by ID
 */
export async function getTimeEntryById(id: string): Promise<ActionResult<TimeEntry>> {
  try {
    const entry = await apiFetch<TimeEntry>(API_ENDPOINTS.TIME_ENTRIES.DETAIL(id), {
      next: {
        tags: [CACHE_TAGS.TIME_ENTRY_DETAIL(id), CACHE_TAGS.TIME_ENTRIES],
        revalidate: 30,
      },
    });
    return { success: true, data: entry };
  } catch (error) {
    console.error('Failed to fetch time entry:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Time entry not found',
    };
  }
}

/**
 * Create a new time entry
 */
export async function createTimeEntry(
  input: CreateTimeEntryInput
): Promise<ActionResult<TimeEntry>> {
  try {
    // Calculate total
    const total = input.duration * input.rate;
    const entry = await apiFetch<TimeEntry>(API_ENDPOINTS.TIME_ENTRIES.CREATE, {
      method: 'POST',
      body: JSON.stringify({ ...input, total }),
    });
    safeRevalidateTag(CACHE_TAGS.TIME_ENTRIES);
    safeRevalidateTag(CACHE_TAGS.BILLING_METRICS);
    return { success: true, message: 'Time entry created successfully', data: entry };
  } catch (error) {
    console.error('Failed to create time entry:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create time entry',
    };
  }
}

/**
 * Update an existing time entry
 */
export async function updateTimeEntry(
  id: string,
  input: UpdateTimeEntryInput
): Promise<ActionResult<TimeEntry>> {
  try {
    const entry = await apiFetch<TimeEntry>(API_ENDPOINTS.TIME_ENTRIES.UPDATE(id), {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
    safeRevalidateTag(CACHE_TAGS.TIME_ENTRY_DETAIL(id));
    safeRevalidateTag(CACHE_TAGS.TIME_ENTRIES);
    safeRevalidateTag(CACHE_TAGS.BILLING_METRICS);
    return { success: true, message: 'Time entry updated successfully', data: entry };
  } catch (error) {
    console.error('Failed to update time entry:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update time entry',
    };
  }
}

/**
 * Delete a time entry
 */
export async function deleteTimeEntry(id: string): Promise<ActionResult> {
  try {
    await apiFetch(API_ENDPOINTS.TIME_ENTRIES.DELETE(id), {
      method: 'DELETE',
    });
    safeRevalidateTag(CACHE_TAGS.TIME_ENTRY_DETAIL(id));
    safeRevalidateTag(CACHE_TAGS.TIME_ENTRIES);
    safeRevalidateTag(CACHE_TAGS.BILLING_METRICS);
    return { success: true, message: 'Time entry deleted successfully' };
  } catch (error) {
    console.error('Failed to delete time entry:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete time entry',
    };
  }
}

/**
 * Approve a time entry
 */
export async function approveTimeEntry(id: string): Promise<ActionResult> {
  try {
    await apiFetch(`${API_ENDPOINTS.TIME_ENTRIES.DETAIL(id)}/approve`, {
      method: 'POST',
    });
    safeRevalidateTag(CACHE_TAGS.TIME_ENTRY_DETAIL(id));
    safeRevalidateTag(CACHE_TAGS.TIME_ENTRIES);
    return { success: true, message: 'Time entry approved' };
  } catch (error) {
    console.error('Failed to approve time entry:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to approve time entry',
    };
  }
}

/**
 * Bulk approve time entries
 */
export async function bulkApproveTimeEntries(
  ids: string[]
): Promise<ActionResult<BulkApproveResult>> {
  try {
    const result = await apiFetch<BulkApproveResult>(
      `${API_ENDPOINTS.TIME_ENTRIES.LIST}/bulk-approve`,
      {
        method: 'POST',
        body: JSON.stringify({ ids }),
      }
    );
    safeRevalidateTag(CACHE_TAGS.TIME_ENTRIES);
    return {
      success: true,
      message: `${result.success} entries approved`,
      data: result,
    };
  } catch (error) {
    console.error('Failed to bulk approve time entries:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to approve entries',
    };
  }
}

/**
 * Time entry form action handler
 */
export async function timeEntryFormAction(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const intent = formData.get('intent') as string;

  switch (intent) {
    case 'create': {
      const input: CreateTimeEntryInput = {
        caseId: formData.get('caseId') as string,
        userId: formData.get('userId') as string,
        date: formData.get('date') as string,
        duration: parseFloat(formData.get('duration') as string) || parseFloat(formData.get('hours') as string),
        description: formData.get('description') as string,
        rate: parseFloat(formData.get('rate') as string),
        billable: formData.get('billable') === 'true',
        activity: (formData.get('activity') as string) || (formData.get('activityType') as string) || undefined,
        ledesCode: (formData.get('ledesCode') as string) || undefined,
        taskCode: (formData.get('taskCode') as string) || undefined,
        internalNotes: (formData.get('internalNotes') as string) || undefined,
      };
      const result = await createTimeEntry(input);
      if (result.success) {
        return { ...result, redirect: '/billing/time' };
      }
      return result;
    }

    case 'approve': {
      const id = formData.get('id') as string;
      return approveTimeEntry(id);
    }

    case 'approve-bulk': {
      const idsRaw = formData.get('ids') as string;
      const ids = JSON.parse(idsRaw) as string[];
      return bulkApproveTimeEntries(ids);
    }

    case 'delete': {
      const deleteId = formData.get('id') as string;
      return deleteTimeEntry(deleteId);
    }

    default:
      return { success: false, error: 'Invalid action' };
  }
}

// =============================================================================
// Expense Actions
// =============================================================================

/**
 * Fetch all expenses with optional filters
 */
export async function getExpenses(
  filters?: ExpenseFilters
): Promise<ActionResult<Expense[]>> {
  try {
    const queryString = filters ? buildQueryString(filters) : '';
    const expenses = await apiFetch<Expense[]>(
      `${API_ENDPOINTS.EXPENSES.LIST}${queryString}`,
      {
        next: {
          tags: [CACHE_TAGS.EXPENSES],
          revalidate: 30,
        },
      }
    );
    return { success: true, data: expenses };
  } catch (error) {
    console.error('Failed to fetch expenses:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch expenses',
    };
  }
}

/**
 * Fetch single expense by ID
 */
export async function getExpenseById(id: string): Promise<ActionResult<Expense>> {
  try {
    const expense = await apiFetch<Expense>(API_ENDPOINTS.EXPENSES.DETAIL(id), {
      next: {
        tags: [CACHE_TAGS.EXPENSE_DETAIL(id), CACHE_TAGS.EXPENSES],
        revalidate: 30,
      },
    });
    return { success: true, data: expense };
  } catch (error) {
    console.error('Failed to fetch expense:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Expense not found',
    };
  }
}

/**
 * Create a new expense
 */
export async function createExpense(
  input: CreateExpenseInput
): Promise<ActionResult<Expense>> {
  try {
    const expense = await apiFetch<Expense>(API_ENDPOINTS.EXPENSES.CREATE, {
      method: 'POST',
      body: JSON.stringify(input),
    });
    safeRevalidateTag(CACHE_TAGS.EXPENSES);
    safeRevalidateTag(CACHE_TAGS.BILLING_METRICS);
    return { success: true, message: 'Expense created successfully', data: expense };
  } catch (error) {
    console.error('Failed to create expense:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create expense',
    };
  }
}

/**
 * Update an existing expense
 */
export async function updateExpense(
  id: string,
  input: UpdateExpenseInput
): Promise<ActionResult<Expense>> {
  try {
    const expense = await apiFetch<Expense>(API_ENDPOINTS.EXPENSES.UPDATE(id), {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
    safeRevalidateTag(CACHE_TAGS.EXPENSE_DETAIL(id));
    safeRevalidateTag(CACHE_TAGS.EXPENSES);
    safeRevalidateTag(CACHE_TAGS.BILLING_METRICS);
    return { success: true, message: 'Expense updated successfully', data: expense };
  } catch (error) {
    console.error('Failed to update expense:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update expense',
    };
  }
}

/**
 * Delete an expense
 */
export async function deleteExpense(id: string): Promise<ActionResult> {
  try {
    await apiFetch(API_ENDPOINTS.EXPENSES.DELETE(id), {
      method: 'DELETE',
    });
    safeRevalidateTag(CACHE_TAGS.EXPENSE_DETAIL(id));
    safeRevalidateTag(CACHE_TAGS.EXPENSES);
    safeRevalidateTag(CACHE_TAGS.BILLING_METRICS);
    return { success: true, message: 'Expense deleted successfully' };
  } catch (error) {
    console.error('Failed to delete expense:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete expense',
    };
  }
}

/**
 * Approve an expense
 */
export async function approveExpense(id: string): Promise<ActionResult> {
  try {
    await apiFetch(`${API_ENDPOINTS.EXPENSES.DETAIL(id)}/approve`, {
      method: 'POST',
    });
    safeRevalidateTag(CACHE_TAGS.EXPENSE_DETAIL(id));
    safeRevalidateTag(CACHE_TAGS.EXPENSES);
    return { success: true, message: 'Expense approved' };
  } catch (error) {
    console.error('Failed to approve expense:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to approve expense',
    };
  }
}

/**
 * Expense form action handler
 */
export async function expenseFormAction(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const intent = formData.get('intent') as string;

  switch (intent) {
    case 'create': {
      const input: CreateExpenseInput = {
        caseId: formData.get('caseId') as string,
        userId: formData.get('userId') as string,
        date: formData.get('date') as string,
        category: formData.get('category') as string,
        description: formData.get('description') as string,
        amount: parseFloat(formData.get('amount') as string),
        quantity: parseFloat(formData.get('quantity') as string) || 1,
        unitCost: parseFloat(formData.get('unitCost') as string) || undefined,
        billable: formData.get('billable') === 'true',
        vendor: (formData.get('vendor') as string) || undefined,
        notes: (formData.get('notes') as string) || undefined,
      };
      const result = await createExpense(input);
      if (result.success) {
        return { ...result, redirect: '/billing/expenses' };
      }
      return result;
    }

    case 'approve': {
      const id = formData.get('id') as string;
      return approveExpense(id);
    }

    case 'delete': {
      const deleteId = formData.get('id') as string;
      return deleteExpense(deleteId);
    }

    default:
      return { success: false, error: 'Invalid action' };
  }
}

// =============================================================================
// Rate Table Actions
// =============================================================================

/**
 * Fetch all rate tables
 */
export async function getRateTables(): Promise<ActionResult<RateTable[]>> {
  try {
    const rateTables = await apiFetch<RateTable[]>(API_ENDPOINTS.RATE_TABLES.LIST, {
      next: {
        tags: [CACHE_TAGS.RATE_TABLES],
        revalidate: 300, // 5 minutes - rates don't change often
      },
    });
    return { success: true, data: rateTables };
  } catch (error) {
    console.error('Failed to fetch rate tables:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch rate tables',
    };
  }
}

/**
 * Fetch single rate table by ID
 */
export async function getRateTableById(id: string): Promise<ActionResult<RateTable>> {
  try {
    const rateTable = await apiFetch<RateTable>(API_ENDPOINTS.RATE_TABLES.DETAIL(id), {
      next: {
        tags: [CACHE_TAGS.RATE_TABLE_DETAIL(id), CACHE_TAGS.RATE_TABLES],
        revalidate: 300,
      },
    });
    return { success: true, data: rateTable };
  } catch (error) {
    console.error('Failed to fetch rate table:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Rate table not found',
    };
  }
}

/**
 * Create a new rate table
 */
export async function createRateTable(
  input: CreateRateTableInput
): Promise<ActionResult<RateTable>> {
  try {
    const rateTable = await apiFetch<RateTable>(API_ENDPOINTS.RATE_TABLES.CREATE, {
      method: 'POST',
      body: JSON.stringify(input),
    });
    safeRevalidateTag(CACHE_TAGS.RATE_TABLES);
    return { success: true, message: 'Rate table created successfully', data: rateTable };
  } catch (error) {
    console.error('Failed to create rate table:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create rate table',
    };
  }
}

/**
 * Update an existing rate table
 */
export async function updateRateTable(
  id: string,
  input: UpdateRateTableInput
): Promise<ActionResult<RateTable>> {
  try {
    const rateTable = await apiFetch<RateTable>(API_ENDPOINTS.RATE_TABLES.UPDATE(id), {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
    safeRevalidateTag(CACHE_TAGS.RATE_TABLE_DETAIL(id));
    safeRevalidateTag(CACHE_TAGS.RATE_TABLES);
    return { success: true, message: 'Rate table updated successfully', data: rateTable };
  } catch (error) {
    console.error('Failed to update rate table:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update rate table',
    };
  }
}

/**
 * Delete a rate table
 */
export async function deleteRateTable(id: string): Promise<ActionResult> {
  try {
    await apiFetch(API_ENDPOINTS.RATE_TABLES.DELETE(id), {
      method: 'DELETE',
    });
    safeRevalidateTag(CACHE_TAGS.RATE_TABLE_DETAIL(id));
    safeRevalidateTag(CACHE_TAGS.RATE_TABLES);
    return { success: true, message: 'Rate table deleted successfully' };
  } catch (error) {
    console.error('Failed to delete rate table:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete rate table',
    };
  }
}

/**
 * Add rate to rate table
 */
export async function addRateToTable(
  rateTableId: string,
  input: CreateRateInput
): Promise<ActionResult> {
  try {
    await apiFetch(API_ENDPOINTS.RATE_TABLES.RATES(rateTableId), {
      method: 'POST',
      body: JSON.stringify(input),
    });
    safeRevalidateTag(CACHE_TAGS.RATE_TABLE_DETAIL(rateTableId));
    safeRevalidateTag(CACHE_TAGS.RATE_TABLES);
    return { success: true, message: 'Rate added successfully' };
  } catch (error) {
    console.error('Failed to add rate:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add rate',
    };
  }
}

// =============================================================================
// Trust Account Actions
// =============================================================================

/**
 * Fetch all trust accounts with optional filters
 */
export async function getTrustAccounts(
  filters?: TrustAccountFilters
): Promise<ActionResult<TrustAccount[]>> {
  try {
    const queryString = filters ? buildQueryString(filters) : '';
    const accounts = await apiFetch<TrustAccount[]>(
      `${API_ENDPOINTS.TRUST_ACCOUNTS.LIST}${queryString}`,
      {
        next: {
          tags: [CACHE_TAGS.TRUST_ACCOUNTS],
          revalidate: 60,
        },
      }
    );
    return { success: true, data: accounts };
  } catch (error) {
    console.error('Failed to fetch trust accounts:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch trust accounts',
    };
  }
}

/**
 * Fetch single trust account by ID
 */
export async function getTrustAccountById(
  id: string
): Promise<ActionResult<TrustAccount>> {
  try {
    const account = await apiFetch<TrustAccount>(API_ENDPOINTS.TRUST_ACCOUNTS.DETAIL(id), {
      next: {
        tags: [CACHE_TAGS.TRUST_ACCOUNT_DETAIL(id), CACHE_TAGS.TRUST_ACCOUNTS],
        revalidate: 60,
      },
    });
    return { success: true, data: account };
  } catch (error) {
    console.error('Failed to fetch trust account:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Trust account not found',
    };
  }
}

/**
 * Get trust account transactions
 */
export async function getTrustAccountTransactions(
  accountId: string
): Promise<ActionResult<TrustTransaction[]>> {
  try {
    const transactions = await apiFetch<TrustTransaction[]>(
      API_ENDPOINTS.TRUST_ACCOUNTING.TRANSACTIONS(accountId),
      {
        next: {
          tags: [CACHE_TAGS.TRUST_TRANSACTIONS(accountId)],
          revalidate: 30,
        },
      }
    );
    return { success: true, data: transactions };
  } catch (error) {
    console.error('Failed to fetch trust transactions:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch transactions',
    };
  }
}

/**
 * Create a new trust account
 */
export async function createTrustAccount(
  input: CreateTrustAccountInput
): Promise<ActionResult<TrustAccount>> {
  try {
    const account = await apiFetch<TrustAccount>(API_ENDPOINTS.TRUST_ACCOUNTS.CREATE, {
      method: 'POST',
      body: JSON.stringify(input),
    });
    safeRevalidateTag(CACHE_TAGS.TRUST_ACCOUNTS);
    safeRevalidateTag(CACHE_TAGS.BILLING_METRICS);
    return { success: true, message: 'Trust account created successfully', data: account };
  } catch (error) {
    console.error('Failed to create trust account:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create trust account',
    };
  }
}

/**
 * Record deposit to trust account
 */
export async function depositToTrustAccount(
  accountId: string,
  deposit: DepositInput
): Promise<ActionResult> {
  try {
    await apiFetch(`${API_ENDPOINTS.TRUST_ACCOUNTS.DETAIL(accountId)}/deposit`, {
      method: 'POST',
      body: JSON.stringify(deposit),
    });
    safeRevalidateTag(CACHE_TAGS.TRUST_ACCOUNT_DETAIL(accountId));
    safeRevalidateTag(CACHE_TAGS.TRUST_ACCOUNTS);
    safeRevalidateTag(CACHE_TAGS.TRUST_TRANSACTIONS(accountId));
    safeRevalidateTag(CACHE_TAGS.BILLING_METRICS);
    return { success: true, message: 'Deposit recorded successfully' };
  } catch (error) {
    console.error('Failed to record deposit:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to record deposit',
    };
  }
}

/**
 * Record withdrawal from trust account
 */
export async function withdrawFromTrustAccount(
  accountId: string,
  withdrawal: WithdrawalInput
): Promise<ActionResult> {
  try {
    await apiFetch(`${API_ENDPOINTS.TRUST_ACCOUNTS.DETAIL(accountId)}/withdrawal`, {
      method: 'POST',
      body: JSON.stringify(withdrawal),
    });
    safeRevalidateTag(CACHE_TAGS.TRUST_ACCOUNT_DETAIL(accountId));
    safeRevalidateTag(CACHE_TAGS.TRUST_ACCOUNTS);
    safeRevalidateTag(CACHE_TAGS.TRUST_TRANSACTIONS(accountId));
    safeRevalidateTag(CACHE_TAGS.BILLING_METRICS);
    return { success: true, message: 'Withdrawal recorded successfully' };
  } catch (error) {
    console.error('Failed to record withdrawal:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to record withdrawal',
    };
  }
}

/**
 * Reconcile trust account
 */
export async function reconcileTrustAccount(
  accountId: string,
  reconciliation: ReconciliationInput
): Promise<ActionResult> {
  try {
    await apiFetch(API_ENDPOINTS.TRUST_ACCOUNTING.RECONCILE(accountId), {
      method: 'POST',
      body: JSON.stringify(reconciliation),
    });
    safeRevalidateTag(CACHE_TAGS.TRUST_ACCOUNT_DETAIL(accountId));
    safeRevalidateTag(CACHE_TAGS.TRUST_ACCOUNTS);
    safeRevalidateTag(CACHE_TAGS.TRUST_TRANSACTIONS(accountId));
    return { success: true, message: 'Reconciliation completed successfully' };
  } catch (error) {
    console.error('Failed to reconcile trust account:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to complete reconciliation',
    };
  }
}

/**
 * Trust account form action handler
 */
export async function trustAccountFormAction(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const intent = formData.get('intent') as string;
  const accountId = formData.get('accountId') as string;

  switch (intent) {
    case 'deposit': {
      const deposit: DepositInput = {
        amount: parseFloat(formData.get('amount') as string),
        transactionDate: formData.get('date') as string,
        description: formData.get('description') as string,
        payorName: formData.get('payorName') as string,
        checkNumber: (formData.get('checkNumber') as string) || undefined,
        matterReference: (formData.get('matterReference') as string) || undefined,
      };
      return depositToTrustAccount(accountId, deposit);
    }

    case 'withdrawal': {
      const withdrawal: WithdrawalInput = {
        amount: parseFloat(formData.get('amount') as string),
        transactionDate: formData.get('date') as string,
        description: formData.get('description') as string,
        payeeName: formData.get('payeeName') as string,
        checkNumber: (formData.get('checkNumber') as string) || undefined,
        purpose: formData.get('purpose') as WithdrawalInput['purpose'],
      };
      return withdrawFromTrustAccount(accountId, withdrawal);
    }

    case 'reconcile': {
      const reconciliation: ReconciliationInput = {
        reconciliationDate: formData.get('reconciliationDate') as string,
        bankStatementBalance: parseFloat(formData.get('bankStatementBalance') as string),
        mainLedgerBalance: parseFloat(formData.get('mainLedgerBalance') as string),
        clientLedgersTotalBalance: parseFloat(
          formData.get('clientLedgersTotalBalance') as string
        ),
        outstandingChecks: JSON.parse(
          (formData.get('outstandingChecks') as string) || '[]'
        ),
        depositsInTransit: JSON.parse(
          (formData.get('depositsInTransit') as string) || '[]'
        ),
        notes: (formData.get('notes') as string) || undefined,
      };
      return reconcileTrustAccount(accountId, reconciliation);
    }

    default:
      return { success: false, error: 'Invalid action' };
  }
}
