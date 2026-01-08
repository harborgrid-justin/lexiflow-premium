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
import {
  validateHourlyRate,
  validateInvoiceAmount,
  validateExpenseAmount,
  validateTrustTransaction,
  validateDailyHours,
  roundToBillingIncrement,
  isReceiptRequired,
  FINANCIAL_CONSTRAINTS,
} from '@/lib/validation/financial-constraints';
import {
  validateExpense as validateExpenseInput,
  requiresReceipt,
  isValidExpenseCategory,
  RECEIPT_REQUIRED_THRESHOLD,
  EXPENSE_CATEGORIES as VALID_EXPENSE_CATEGORIES,
  type ExpenseValidationResult,
} from '@/lib/validation/expense-validation';
import {
  validateInvoice,
  validateInvoiceLineItems,
  validateInvoiceTotal,
  type InvoiceForValidation,
} from '@/lib/validation/invoice-validation';
import {
  validateThreeWayReconciliation,
  detectNegativeBalanceClients,
  checkReconciliationOverdue,
  generateReconciliationReport,
  type ClientLedgerEntry,
  type ReconciliationData,
  type ReconciliationComplianceReport,
  type NegativeBalanceClient,
  type ReconciliationOverdueResult,
} from '@/lib/validation/reconciliation-compliance';
import {
  validateTimeEntry as validateTimeEntryInput,
  sanitizeTimeEntryInput,
  minutesToRoundedHours,
  calculateBillableAmount,
  TIME_ENTRY_CONSTRAINTS,
  type TimeEntryInput as TimeEntryValidationInput,
} from '@/lib/validation/time-entry-validation';
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
 *
 * Validates line item calculations and invoice totals before creation.
 * Each line item's amount must equal quantity * rate (within 0.01 tolerance).
 * Invoice total must equal sum of line items + tax - discount.
 *
 * @param input - Invoice creation input with optional line items
 * @returns ActionResult with created invoice or validation errors
 */
export async function createInvoice(
  input: CreateInvoiceInput
): Promise<ActionResult<Invoice>> {
  try {
    // Validate invoice amount if total is provided in input
    // Note: CreateInvoiceInput may not include totalAmount, but we validate if present
    const inputWithTotal = input as CreateInvoiceInput & { totalAmount?: number };
    if (inputWithTotal.totalAmount !== undefined) {
      const amountValidation = validateInvoiceAmount(inputWithTotal.totalAmount);
      if (!amountValidation.valid) {
        return {
          success: false,
          error: amountValidation.error || 'Invalid invoice amount',
        };
      }
    }

    // Validate line items if present (amount = quantity * rate, with 0.01 tolerance)
    if (input.lineItems && input.lineItems.length > 0) {
      const invoiceForValidation: InvoiceForValidation = {
        lineItems: input.lineItems.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount,
          type: item.type,
        })),
        subtotal: input.subtotal,
        tax: input.taxAmount,
        discount: input.discountAmount,
        totalAmount: input.totalAmount ?? 0,
      };

      // Validate all line items (description, quantity, rate, amount calculations)
      const lineItemResults = validateInvoiceLineItems(invoiceForValidation.lineItems);
      const invalidLineItems = lineItemResults.filter((result) => !result.valid);

      if (invalidLineItems.length > 0) {
        const errors = invalidLineItems.flatMap((result) =>
          result.errors.map((error) => `Item ${result.index + 1}: ${error}`)
        );
        return {
          success: false,
          error: `Line item validation failed: ${errors.join('; ')}`,
        };
      }

      // Validate invoice total if totalAmount is provided
      if (input.totalAmount !== undefined) {
        const totalValidation = validateInvoiceTotal(invoiceForValidation);
        if (!totalValidation.valid) {
          return {
            success: false,
            error: totalValidation.errors.join('; '),
          };
        }
      }
    }

    const invoice = await apiFetch<Invoice>(API_ENDPOINTS.INVOICES.CREATE, {
      method: 'POST',
      body: JSON.stringify(input),
    });

    // Validate the returned invoice total (server may have calculated it)
    if (invoice.totalAmount !== undefined) {
      const totalValidation = validateInvoiceAmount(invoice.totalAmount);
      if (!totalValidation.valid) {
        console.error(
          `Invoice ${invoice.id} created with amount exceeding limits: $${invoice.totalAmount.toFixed(2)}`
        );
      }
    }

    // Validate returned invoice line items if present (post-creation validation)
    if (invoice.lineItems && invoice.lineItems.length > 0) {
      const returnedInvoiceForValidation: InvoiceForValidation = {
        lineItems: invoice.lineItems.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount,
          type: item.type,
        })),
        subtotal: invoice.subtotal,
        tax: invoice.taxAmount,
        discount: invoice.discountAmount,
        totalAmount: invoice.totalAmount,
      };

      const fullValidation = validateInvoice(returnedInvoiceForValidation);
      if (!fullValidation.valid) {
        console.warn(
          `Invoice ${invoice.id} has validation warnings: ${fullValidation.errors.join('; ')}`
        );
      }
    }

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
 *
 * Validates line item calculations if line items are being updated.
 * Each line item's amount must equal quantity * rate (within 0.01 tolerance).
 *
 * @param id - Invoice ID to update
 * @param input - Partial invoice update input
 * @returns ActionResult with updated invoice or validation errors
 */
export async function updateInvoice(
  id: string,
  input: UpdateInvoiceInput
): Promise<ActionResult<Invoice>> {
  try {
    // Validate line items if present in update
    if (input.lineItems && input.lineItems.length > 0) {
      const invoiceForValidation: InvoiceForValidation = {
        lineItems: input.lineItems.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount,
          type: item.type,
        })),
        subtotal: input.subtotal,
        tax: input.taxAmount,
        discount: input.discountAmount,
        totalAmount: input.totalAmount ?? 0,
      };

      const lineItemResults = validateInvoiceLineItems(invoiceForValidation.lineItems);
      const invalidLineItems = lineItemResults.filter((result) => !result.valid);

      if (invalidLineItems.length > 0) {
        const errors = invalidLineItems.flatMap((result) =>
          result.errors.map((error) => `Item ${result.index + 1}: ${error}`)
        );
        return {
          success: false,
          error: `Line item validation failed: ${errors.join('; ')}`,
        };
      }

      // Validate invoice total if totalAmount is provided
      if (input.totalAmount !== undefined) {
        const totalValidation = validateInvoiceTotal(invoiceForValidation);
        if (!totalValidation.valid) {
          return {
            success: false,
            error: totalValidation.errors.join('; '),
          };
        }
      }
    }

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
 *
 * Comprehensive validation matching frontend business rules:
 * - Duration must be positive integers (minutes)
 * - Max daily duration: 1440 minutes (24 hours)
 * - Description minimum length: 10 characters (audit requirement)
 * - Rate validation with constraint checking
 * - Status enum validation
 * - Input sanitization before saving
 * - Billing increment rounding (0.1 hours / 6 minutes)
 *
 * @param input - Time entry creation input
 * @returns ActionResult with created time entry or validation errors
 */
export async function createTimeEntry(
  input: CreateTimeEntryInput
): Promise<ActionResult<TimeEntry>> {
  try {
    // ==========================================================================
    // Comprehensive Time Entry Validation
    // ==========================================================================

    // Convert input to validation format (duration in minutes)
    const validationInput: TimeEntryValidationInput = {
      caseId: input.caseId,
      userId: input.userId,
      date: input.date,
      // Convert hours to minutes if needed (frontend may send hours or minutes)
      // We assume duration is in hours from CreateTimeEntryInput and convert to minutes
      duration: Math.round(input.duration * 60), // Convert hours to minutes
      description: input.description,
      rate: input.rate,
      billable: input.billable,
      activity: input.activity,
      ledesCode: input.ledesCode,
      taskCode: input.taskCode,
      internalNotes: input.internalNotes,
    };

    // Run comprehensive validation
    const validationResult = validateTimeEntryInput(validationInput);

    if (!validationResult.valid) {
      return {
        success: false,
        error: validationResult.errors.join('; '),
      };
    }

    // Use sanitized input
    const sanitizedInput = validationResult.sanitized!;

    // ==========================================================================
    // Additional Rate and Total Validation
    // ==========================================================================

    // Validate hourly rate
    const rateValidation = validateHourlyRate(input.rate);
    if (!rateValidation.valid) {
      return {
        success: false,
        error: rateValidation.error || 'Invalid hourly rate',
      };
    }

    // Convert duration back to hours and round to billing increment (0.1 hours / 6 minutes)
    const roundedDuration = minutesToRoundedHours(sanitizedInput.duration);

    // Calculate total with validated and rounded values
    const total = calculateBillableAmount(sanitizedInput.duration, input.rate);

    // Validate calculated total against invoice limits
    const totalValidation = validateInvoiceAmount(total);
    if (!totalValidation.valid) {
      return {
        success: false,
        error: `Calculated total: ${totalValidation.error}`,
      };
    }

    // ==========================================================================
    // Create Time Entry
    // ==========================================================================

    const entry = await apiFetch<TimeEntry>(API_ENDPOINTS.TIME_ENTRIES.CREATE, {
      method: 'POST',
      body: JSON.stringify({
        ...input,
        description: sanitizedInput.description, // Use sanitized description
        internalNotes: sanitizedInput.internalNotes, // Use sanitized notes
        duration: roundedDuration, // Send rounded hours to API
        total,
      }),
    });

    safeRevalidateTag(CACHE_TAGS.TIME_ENTRIES);
    safeRevalidateTag(CACHE_TAGS.BILLING_METRICS);

    // Include any warnings in the success message
    let message = 'Time entry created successfully';
    if (validationResult.warnings && validationResult.warnings.length > 0) {
      message += ` (${validationResult.warnings.join('; ')})`;
    }

    return { success: true, message, data: entry };
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
 *
 * Validates updated fields against business rules:
 * - Duration must be positive integers (minutes) if provided
 * - Max daily duration: 1440 minutes (24 hours)
 * - Description minimum length: 10 characters (audit requirement) if provided
 * - Rate validation with constraint checking if provided
 * - Status enum validation if provided
 * - Input sanitization before saving
 *
 * @param id - Time entry ID to update
 * @param input - Partial time entry update input
 * @returns ActionResult with updated time entry or validation errors
 */
export async function updateTimeEntry(
  id: string,
  input: UpdateTimeEntryInput
): Promise<ActionResult<TimeEntry>> {
  try {
    const updateData: Record<string, unknown> = { ...input };
    const warnings: string[] = [];

    // ==========================================================================
    // Validate Duration if Provided
    // ==========================================================================

    if (input.duration !== undefined) {
      // Convert hours to minutes for validation
      const durationMinutes = Math.round(input.duration * 60);

      if (durationMinutes <= 0) {
        return {
          success: false,
          error: 'Duration must be greater than zero',
        };
      }

      if (!Number.isInteger(durationMinutes)) {
        return {
          success: false,
          error: 'Duration must be a positive integer (minutes)',
        };
      }

      if (durationMinutes > TIME_ENTRY_CONSTRAINTS.MAX_DAILY_DURATION) {
        return {
          success: false,
          error: `Duration cannot exceed ${TIME_ENTRY_CONSTRAINTS.MAX_DAILY_DURATION} minutes (24 hours)`,
        };
      }

      // Round to billing increment
      const roundedDuration = minutesToRoundedHours(durationMinutes);
      updateData.duration = roundedDuration;

      // Warning for very short duration
      if (durationMinutes < 6 && durationMinutes > 0) {
        warnings.push(
          `Duration of ${durationMinutes} minute(s) will be rounded up to 6 minutes (0.1 hours) for billing`
        );
      }
    }

    // ==========================================================================
    // Validate Description if Provided (Audit Requirement)
    // ==========================================================================

    if (input.description !== undefined) {
      const descLength = input.description.trim().length;

      if (descLength < TIME_ENTRY_CONSTRAINTS.MIN_DESCRIPTION_LENGTH) {
        return {
          success: false,
          error: `Description must be at least ${TIME_ENTRY_CONSTRAINTS.MIN_DESCRIPTION_LENGTH} characters (audit requirement)`,
        };
      }

      if (descLength > TIME_ENTRY_CONSTRAINTS.MAX_DESCRIPTION_LENGTH) {
        return {
          success: false,
          error: `Description cannot exceed ${TIME_ENTRY_CONSTRAINTS.MAX_DESCRIPTION_LENGTH} characters`,
        };
      }

      // Sanitize description
      updateData.description = sanitizeTimeEntryInput({
        caseId: '',
        userId: '',
        date: '',
        duration: 0,
        description: input.description,
      }).description;
    }

    // ==========================================================================
    // Validate Rate if Provided
    // ==========================================================================

    if (input.rate !== undefined) {
      const rateValidation = validateHourlyRate(input.rate);
      if (!rateValidation.valid) {
        return {
          success: false,
          error: rateValidation.error || 'Invalid hourly rate',
        };
      }
    }

    // ==========================================================================
    // Validate Date if Provided
    // ==========================================================================

    if (input.date !== undefined) {
      const date = new Date(input.date);
      if (isNaN(date.getTime())) {
        return {
          success: false,
          error: 'Valid ISO date is required',
        };
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date > today) {
        return {
          success: false,
          error: 'Time entry date cannot be in the future',
        };
      }
    }

    // ==========================================================================
    // Sanitize Internal Notes if Provided
    // ==========================================================================

    if (input.internalNotes !== undefined) {
      updateData.internalNotes = sanitizeTimeEntryInput({
        caseId: '',
        userId: '',
        date: '',
        duration: 0,
        description: '',
        internalNotes: input.internalNotes,
      }).internalNotes;
    }

    // ==========================================================================
    // Recalculate Total if Duration or Rate Changed
    // ==========================================================================

    if (input.duration !== undefined || input.rate !== undefined) {
      // Fetch existing entry to get current values for calculation
      const existingResult = await getTimeEntryById(id);
      if (!existingResult.success || !existingResult.data) {
        return {
          success: false,
          error: 'Time entry not found for update',
        };
      }

      const existingEntry = existingResult.data;
      const newDuration =
        input.duration !== undefined ? input.duration : existingEntry.duration;
      const newRate = input.rate !== undefined ? input.rate : existingEntry.rate;

      // Calculate new total
      const durationMinutes = Math.round(newDuration * 60);
      const total = calculateBillableAmount(durationMinutes, newRate);

      // Validate total
      const totalValidation = validateInvoiceAmount(total);
      if (!totalValidation.valid) {
        return {
          success: false,
          error: `Calculated total: ${totalValidation.error}`,
        };
      }

      updateData.total = total;
    }

    // ==========================================================================
    // Update Time Entry
    // ==========================================================================

    const entry = await apiFetch<TimeEntry>(API_ENDPOINTS.TIME_ENTRIES.UPDATE(id), {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });

    safeRevalidateTag(CACHE_TAGS.TIME_ENTRY_DETAIL(id));
    safeRevalidateTag(CACHE_TAGS.TIME_ENTRIES);
    safeRevalidateTag(CACHE_TAGS.BILLING_METRICS);

    // Include any warnings in the success message
    let message = 'Time entry updated successfully';
    if (warnings.length > 0) {
      message += ` (${warnings.join('; ')})`;
    }

    return { success: true, message, data: entry };
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
 *
 * Handles form submissions for time entry operations with comprehensive validation.
 * All validation is performed server-side to ensure data integrity.
 */
export async function timeEntryFormAction(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const intent = formData.get('intent') as string;

  switch (intent) {
    case 'create': {
      // Parse duration - support both 'duration' (hours) and 'hours' fields
      const durationStr = formData.get('duration') as string;
      const hoursStr = formData.get('hours') as string;
      const duration = parseFloat(durationStr) || parseFloat(hoursStr) || 0;

      // Parse rate
      const rateStr = formData.get('rate') as string;
      const rate = parseFloat(rateStr) || 0;

      // Early validation for required fields to provide better error messages
      const caseId = formData.get('caseId') as string;
      const userId = formData.get('userId') as string;
      const date = formData.get('date') as string;
      const description = (formData.get('description') as string) || '';

      // Validate required fields early
      if (!caseId || !caseId.trim()) {
        return { success: false, error: 'Case ID is required' };
      }
      if (!userId || !userId.trim()) {
        return { success: false, error: 'User ID is required' };
      }
      if (!date || !date.trim()) {
        return { success: false, error: 'Date is required' };
      }
      if (duration <= 0) {
        return { success: false, error: 'Duration must be greater than zero' };
      }
      if (description.trim().length < TIME_ENTRY_CONSTRAINTS.MIN_DESCRIPTION_LENGTH) {
        return {
          success: false,
          error: `Description must be at least ${TIME_ENTRY_CONSTRAINTS.MIN_DESCRIPTION_LENGTH} characters (audit requirement)`,
        };
      }

      const input: CreateTimeEntryInput = {
        caseId,
        userId,
        date,
        duration,
        description,
        rate,
        billable: formData.get('billable') === 'true',
        activity:
          (formData.get('activity') as string) ||
          (formData.get('activityType') as string) ||
          undefined,
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

    case 'update': {
      const id = formData.get('id') as string;
      if (!id) {
        return { success: false, error: 'Time entry ID is required for update' };
      }

      const updateInput: UpdateTimeEntryInput = {};

      // Only include fields that were provided
      const durationStr = formData.get('duration') as string;
      if (durationStr) {
        updateInput.duration = parseFloat(durationStr);
      }

      const rateStr = formData.get('rate') as string;
      if (rateStr) {
        updateInput.rate = parseFloat(rateStr);
      }

      const description = formData.get('description') as string;
      if (description !== null && description !== undefined) {
        updateInput.description = description;
      }

      const date = formData.get('date') as string;
      if (date) {
        updateInput.date = date;
      }

      const billable = formData.get('billable');
      if (billable !== null) {
        updateInput.billable = billable === 'true';
      }

      const activity = formData.get('activity') as string;
      if (activity) {
        updateInput.activity = activity;
      }

      const internalNotes = formData.get('internalNotes') as string;
      if (internalNotes !== null && internalNotes !== undefined) {
        updateInput.internalNotes = internalNotes;
      }

      const result = await updateTimeEntry(id, updateInput);
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
 * Create a new expense with comprehensive validation
 *
 * Validates:
 * - Required fields (caseId, userId, date, amount, category, description)
 * - Amount within limits and proper format
 * - Category against allowed list
 * - Receipt requirement for amounts over $75
 * - Description length and format
 */
export async function createExpense(
  input: CreateExpenseInput
): Promise<ActionResult<Expense>> {
  try {
    // Comprehensive expense validation using expense-validation module
    const validationResult = validateExpenseInput({
      caseId: input.caseId,
      userId: input.userId,
      date: input.date,
      amount: input.amount,
      category: input.category,
      description: input.description,
      receiptUrl: input.receiptUrl,
      vendor: input.vendor,
      notes: input.notes,
      quantity: input.quantity,
      unitCost: input.unitCost,
      billable: input.billable,
    });

    // Return validation errors if any
    if (!validationResult.valid) {
      return {
        success: false,
        error: validationResult.errors.join('; '),
      };
    }

    // Additional category validation
    if (!isValidExpenseCategory(input.category)) {
      return {
        success: false,
        error: `Invalid expense category. Must be one of: ${VALID_EXPENSE_CATEGORIES.join(', ')}`,
      };
    }

    // Strict receipt requirement - block creation if receipt is required but not provided
    if (requiresReceipt(input.amount) && !input.receiptUrl) {
      return {
        success: false,
        error: `Receipt is required for expenses over $${RECEIPT_REQUIRED_THRESHOLD}. Please attach a receipt before submitting.`,
      };
    }

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
 * Update an existing expense with validation
 *
 * Validates updated fields including:
 * - Amount within limits if updated
 * - Category against allowed list if updated
 * - Receipt requirement for amounts over $75
 */
export async function updateExpense(
  id: string,
  input: UpdateExpenseInput
): Promise<ActionResult<Expense>> {
  try {
    // Validate amount if provided
    if (input.amount !== undefined) {
      const hasReceipt = !!input.receiptUrl;

      // If amount is being updated and exceeds threshold, require receipt
      if (requiresReceipt(input.amount) && !hasReceipt) {
        // Fetch existing expense to check if it has a receipt
        const existingResult = await getExpenseById(id);
        if (existingResult.success && existingResult.data) {
          if (!existingResult.data.receiptUrl) {
            return {
              success: false,
              error: `Receipt is required for expenses over $${RECEIPT_REQUIRED_THRESHOLD}. Please attach a receipt before updating.`,
            };
          }
        }
      }
    }

    // Validate category if provided
    if (input.category !== undefined && !isValidExpenseCategory(input.category)) {
      return {
        success: false,
        error: `Invalid expense category. Must be one of: ${VALID_EXPENSE_CATEGORIES.join(', ')}`,
      };
    }

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
      const amount = parseFloat(formData.get('amount') as string);
      const receiptUrl = (formData.get('receiptUrl') as string) || undefined;

      // Early validation for receipt requirement
      if (requiresReceipt(amount) && !receiptUrl) {
        return {
          success: false,
          error: `Receipt is required for expenses over $${RECEIPT_REQUIRED_THRESHOLD}. Please attach a receipt before submitting.`,
        };
      }

      const input: CreateExpenseInput = {
        caseId: formData.get('caseId') as string,
        userId: formData.get('userId') as string,
        date: formData.get('date') as string,
        category: formData.get('category') as string,
        description: formData.get('description') as string,
        amount,
        quantity: parseFloat(formData.get('quantity') as string) || 1,
        unitCost: parseFloat(formData.get('unitCost') as string) || undefined,
        billable: formData.get('billable') === 'true',
        vendor: (formData.get('vendor') as string) || undefined,
        receiptUrl,
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
    // Validate default rate if provided
    const inputWithRate = input as CreateRateTableInput & { defaultRate?: number };
    if (inputWithRate.defaultRate !== undefined) {
      const rateValidation = validateHourlyRate(inputWithRate.defaultRate);
      if (!rateValidation.valid) {
        return {
          success: false,
          error: `Default rate: ${rateValidation.error}`,
        };
      }
    }

    // Validate individual rates if provided
    const inputWithRates = input as CreateRateTableInput & { rates?: Array<{ rate: number }> };
    if (inputWithRates.rates && Array.isArray(inputWithRates.rates)) {
      for (let i = 0; i < inputWithRates.rates.length; i++) {
        const rate = inputWithRates.rates[i];
        if (rate.rate !== undefined) {
          const rateValidation = validateHourlyRate(rate.rate);
          if (!rateValidation.valid) {
            return {
              success: false,
              error: `Rate ${i + 1}: ${rateValidation.error}`,
            };
          }
        }
      }
    }

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

/**
 * Activate a rate table
 */
export async function activateRateTable(id: string): Promise<ActionResult> {
  try {
    await apiFetch(`${API_ENDPOINTS.RATE_TABLES.DETAIL(id)}/activate`, {
      method: 'POST',
    });
    safeRevalidateTag(CACHE_TAGS.RATE_TABLE_DETAIL(id));
    safeRevalidateTag(CACHE_TAGS.RATE_TABLES);
    return { success: true, message: 'Rate table activated' };
  } catch (error) {
    console.error('Failed to activate rate table:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to activate rate table',
    };
  }
}

/**
 * Deactivate a rate table
 */
export async function deactivateRateTable(id: string): Promise<ActionResult> {
  try {
    await apiFetch(`${API_ENDPOINTS.RATE_TABLES.DETAIL(id)}/deactivate`, {
      method: 'POST',
    });
    safeRevalidateTag(CACHE_TAGS.RATE_TABLE_DETAIL(id));
    safeRevalidateTag(CACHE_TAGS.RATE_TABLES);
    return { success: true, message: 'Rate table deactivated' };
  } catch (error) {
    console.error('Failed to deactivate rate table:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to deactivate rate table',
    };
  }
}

/**
 * Rate table form action handler
 */
export async function rateTableFormAction(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const intent = formData.get('intent') as string;

  switch (intent) {
    case 'create': {
      const input: CreateRateTableInput = {
        name: formData.get('name') as string,
        description: (formData.get('description') as string) || undefined,
        defaultRate: parseFloat(formData.get('defaultRate') as string),
        currency: (formData.get('currency') as string) || 'USD',
        effectiveDate: formData.get('effectiveDate') as string,
        expirationDate: (formData.get('expirationDate') as string) || undefined,
        rates: JSON.parse((formData.get('rates') as string) || '[]'),
      };
      const result = await createRateTable(input);
      if (result.success) {
        return { ...result, redirect: '/billing/rates' };
      }
      return result;
    }

    case 'activate': {
      const id = formData.get('id') as string;
      return activateRateTable(id);
    }

    case 'deactivate': {
      const id = formData.get('id') as string;
      return deactivateRateTable(id);
    }

    case 'delete': {
      const deleteId = formData.get('id') as string;
      return deleteRateTable(deleteId);
    }

    default:
      return { success: false, error: 'Invalid action' };
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
    // Validate trust transaction amount
    const amountValidation = validateTrustTransaction(deposit.amount);
    if (!amountValidation.valid) {
      return {
        success: false,
        error: amountValidation.error || 'Invalid deposit amount',
      };
    }

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
    // Validate trust transaction amount
    const amountValidation = validateTrustTransaction(withdrawal.amount);
    if (!amountValidation.valid) {
      return {
        success: false,
        error: amountValidation.error || 'Invalid withdrawal amount',
      };
    }

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
 * Reconcile trust account with compliance validation
 *
 * Performs three-way reconciliation validation before submitting:
 * 1. Validates bank statement matches trust ledger (adjusted for outstanding items)
 * 2. Validates trust ledger matches sum of client ledgers
 * 3. Detects any negative client balances (compliance violation)
 */
export async function reconcileTrustAccount(
  accountId: string,
  reconciliation: ReconciliationInput,
  clientLedgers?: ClientLedgerEntry[]
): Promise<ActionResult<ReconciliationComplianceReport | undefined>> {
  try {
    // Calculate outstanding deposits and withdrawals from arrays
    const outstandingDeposits =
      reconciliation.depositsInTransit?.reduce((sum, d) => sum + d.amount, 0) ?? 0;
    const outstandingWithdrawals =
      reconciliation.outstandingChecks?.reduce((sum, c) => sum + c.amount, 0) ?? 0;

    // Perform three-way reconciliation validation
    const threeWayResult = validateThreeWayReconciliation(
      reconciliation.bankStatementBalance,
      reconciliation.mainLedgerBalance,
      clientLedgers ?? [],
      {
        outstandingDeposits,
        outstandingWithdrawals,
      }
    );

    // Check for negative balance clients (critical compliance violation)
    const negativeBalanceClients = clientLedgers
      ? detectNegativeBalanceClients(clientLedgers)
      : [];

    // If there are critical compliance violations, return error
    const criticalViolations = negativeBalanceClients.filter(
      (c) => c.severity === 'critical'
    );
    if (criticalViolations.length > 0) {
      const clientNames = criticalViolations
        .slice(0, 3)
        .map((c) => c.clientName)
        .join(', ');
      return {
        success: false,
        error: `COMPLIANCE VIOLATION: Negative balance detected for client(s): ${clientNames}. Cannot reconcile until resolved.`,
      };
    }

    // Warn but allow if there's a discrepancy (user must acknowledge)
    if (!threeWayResult.isReconciled && threeWayResult.discrepancyAmount > 1) {
      console.warn(
        `Reconciliation discrepancy of $${threeWayResult.discrepancyAmount.toFixed(2)} detected for account ${accountId}`
      );
    }

    // Submit reconciliation to API
    await apiFetch(API_ENDPOINTS.TRUST_ACCOUNTING.RECONCILE(accountId), {
      method: 'POST',
      body: JSON.stringify({
        ...reconciliation,
        // Include compliance validation results
        complianceValidation: {
          threeWayReconciled: threeWayResult.isReconciled,
          discrepancyAmount: threeWayResult.discrepancyAmount,
          discrepancyReason: threeWayResult.discrepancyReason,
          negativeBalanceCount: negativeBalanceClients.length,
          outstandingDeposits,
          outstandingWithdrawals,
        },
      }),
    });

    safeRevalidateTag(CACHE_TAGS.TRUST_ACCOUNT_DETAIL(accountId));
    safeRevalidateTag(CACHE_TAGS.TRUST_ACCOUNTS);
    safeRevalidateTag(CACHE_TAGS.TRUST_TRANSACTIONS(accountId));

    // Generate success message with compliance status
    let message = 'Reconciliation completed successfully';
    if (!threeWayResult.isReconciled) {
      message += ` (with $${threeWayResult.discrepancyAmount.toFixed(2)} discrepancy noted)`;
    }
    if (negativeBalanceClients.length > 0) {
      message += ` - WARNING: ${negativeBalanceClients.length} client(s) with negative balance`;
    }

    return { success: true, message };
  } catch (error) {
    console.error('Failed to reconcile trust account:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to complete reconciliation',
    };
  }
}

/**
 * Perform comprehensive reconciliation with full compliance report
 *
 * This action fetches all required data, performs full compliance validation,
 * and generates a detailed compliance report.
 */
export async function performComprehensiveReconciliation(
  accountId: string,
  reconciliationDate: string,
  bankStatementBalance: number
): Promise<ActionResult<ReconciliationComplianceReport>> {
  try {
    // Fetch account details
    const accountResult = await getTrustAccountById(accountId);
    if (!accountResult.success || !accountResult.data) {
      return {
        success: false,
        error: accountResult.error || 'Failed to fetch trust account',
      };
    }
    const account = accountResult.data;

    // Fetch transactions
    const transactionsResult = await getTrustAccountTransactions(accountId);
    if (!transactionsResult.success || !transactionsResult.data) {
      return {
        success: false,
        error: transactionsResult.error || 'Failed to fetch transactions',
      };
    }
    const transactions = transactionsResult.data;

    // Build client ledgers from transactions (group by clientId)
    const clientLedgerMap = new Map<
      string,
      {
        clientId: string;
        clientName: string;
        caseId?: string;
        balance: number;
        lastTransactionDate?: string;
      }
    >();

    for (const txn of transactions) {
      if (!txn.clientId) continue;

      const existing = clientLedgerMap.get(txn.clientId);
      const txnAmount =
        txn.transactionType === 'deposit' || txn.transactionType === 'interest'
          ? txn.amount
          : -txn.amount;

      if (existing) {
        existing.balance += txnAmount;
        if (
          !existing.lastTransactionDate ||
          new Date(txn.transactionDate) > new Date(existing.lastTransactionDate)
        ) {
          existing.lastTransactionDate = txn.transactionDate;
        }
      } else {
        clientLedgerMap.set(txn.clientId, {
          clientId: txn.clientId,
          clientName: txn.clientName || `Client ${txn.clientId}`,
          caseId: txn.caseId,
          balance: txnAmount,
          lastTransactionDate: txn.transactionDate,
        });
      }
    }

    const clientLedgers: ClientLedgerEntry[] = Array.from(clientLedgerMap.values());

    // Build ledger transactions for matching
    const ledgerTransactions = transactions.map((txn) => ({
      transactionId: txn.id,
      date: txn.transactionDate,
      amount: txn.amount,
      type: txn.transactionType as 'deposit' | 'withdrawal' | 'transfer' | 'adjustment',
      reference: txn.referenceNumber,
      checkNumber: txn.checkNumber,
      description: txn.description,
      reconciled: txn.reconciled,
      clientId: txn.clientId,
    }));

    // Calculate outstanding items
    const pendingDeposits = transactions
      .filter((t) => t.transactionType === 'deposit' && t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0);

    const pendingWithdrawals = transactions
      .filter((t) => t.transactionType === 'withdrawal' && t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0);

    // Prepare reconciliation data
    const reconciliationData: ReconciliationData = {
      accountId,
      accountName: account.accountName,
      reconciliationDate,
      bankStatementBalance,
      trustLedgerBalance: account.balance,
      clientLedgers,
      bankTransactions: [],
      ledgerTransactions,
      outstandingDeposits: pendingDeposits,
      outstandingWithdrawals: pendingWithdrawals,
      lastReconciliationDate: account.lastReconciledDate,
      reconciliationFrequency: 'monthly',
    };

    // Generate comprehensive compliance report
    const report = generateReconciliationReport(reconciliationData);

    safeRevalidateTag(CACHE_TAGS.TRUST_ACCOUNT_DETAIL(accountId));

    return {
      success: true,
      message: `Compliance report generated. Status: ${report.complianceStatus}, Score: ${report.complianceScore}/100`,
      data: report,
    };
  } catch (error) {
    console.error('Failed to perform comprehensive reconciliation:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to perform comprehensive reconciliation',
    };
  }
}

/**
 * Check trust account reconciliation status
 */
export async function checkReconciliationStatus(
  accountId: string
): Promise<ActionResult<ReconciliationOverdueResult>> {
  try {
    const accountResult = await getTrustAccountById(accountId);
    if (!accountResult.success || !accountResult.data) {
      return {
        success: false,
        error: accountResult.error || 'Failed to fetch trust account',
      };
    }

    const account = accountResult.data;
    const overdueStatus = checkReconciliationOverdue(account.lastReconciledDate, 'monthly');

    return { success: true, data: overdueStatus };
  } catch (error) {
    console.error('Failed to check reconciliation status:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to check reconciliation status',
    };
  }
}

/**
 * Get clients with negative trust balances (compliance violations)
 */
export async function getNegativeBalanceClients(
  accountId: string
): Promise<ActionResult<NegativeBalanceClient[]>> {
  try {
    const transactionsResult = await getTrustAccountTransactions(accountId);
    if (!transactionsResult.success || !transactionsResult.data) {
      return {
        success: false,
        error: transactionsResult.error || 'Failed to fetch transactions',
      };
    }

    // Build client ledgers from transactions
    const clientLedgerMap = new Map<string, ClientLedgerEntry>();

    for (const txn of transactionsResult.data) {
      if (!txn.clientId) continue;

      const existing = clientLedgerMap.get(txn.clientId);
      const txnAmount =
        txn.transactionType === 'deposit' || txn.transactionType === 'interest'
          ? txn.amount
          : -txn.amount;

      if (existing) {
        existing.balance += txnAmount;
        if (
          !existing.lastTransactionDate ||
          new Date(txn.transactionDate) > new Date(existing.lastTransactionDate)
        ) {
          existing.lastTransactionDate = txn.transactionDate;
        }
      } else {
        clientLedgerMap.set(txn.clientId, {
          clientId: txn.clientId,
          clientName: txn.clientName || `Client ${txn.clientId}`,
          caseId: txn.caseId,
          balance: txnAmount,
          lastTransactionDate: txn.transactionDate,
        });
      }
    }

    const clientLedgers = Array.from(clientLedgerMap.values());
    const negativeBalanceClients = detectNegativeBalanceClients(clientLedgers);

    return { success: true, data: negativeBalanceClients };
  } catch (error) {
    console.error('Failed to get negative balance clients:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to check for negative balances',
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
