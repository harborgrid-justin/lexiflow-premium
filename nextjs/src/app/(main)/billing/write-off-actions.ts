'use server';

/**
 * Write-Off Management Server Actions
 *
 * Server-side actions for write-off request operations following Next.js 16 conventions.
 * Implements approval workflow with proper validation and cache revalidation.
 *
 * @module billing/write-off-actions
 */

import { revalidateTag } from 'next/cache';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import type { ActionResult } from './types';

// =============================================================================
// Types
// =============================================================================

export type WriteOffStatus = 'pending' | 'approved' | 'rejected';

export interface WriteOffRequest {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  clientId?: string;
  clientName: string;
  amount: number;
  reason: string;
  category?: WriteOffCategory;
  requestedBy: string;
  requestedByName?: string;
  requestedDate: string;
  status: WriteOffStatus;
  approvedBy?: string;
  approvedByName?: string;
  approvedDate?: string;
  rejectedBy?: string;
  rejectedByName?: string;
  rejectedDate?: string;
  rejectionReason?: string;
  notes?: string;
  impactedArAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export type WriteOffCategory =
  | 'uncollectible'
  | 'client_dispute'
  | 'billing_error'
  | 'courtesy_adjustment'
  | 'bankruptcy'
  | 'settlement'
  | 'other';

export const WRITE_OFF_CATEGORIES: { value: WriteOffCategory; label: string }[] = [
  { value: 'uncollectible', label: 'Uncollectible Debt' },
  { value: 'client_dispute', label: 'Client Dispute' },
  { value: 'billing_error', label: 'Billing Error' },
  { value: 'courtesy_adjustment', label: 'Courtesy Adjustment' },
  { value: 'bankruptcy', label: 'Client Bankruptcy' },
  { value: 'settlement', label: 'Settlement Agreement' },
  { value: 'other', label: 'Other' },
];

export interface CreateWriteOffInput {
  invoiceId: string;
  amount: number;
  reason: string;
  category?: WriteOffCategory;
  notes?: string;
}

export interface WriteOffFilters {
  status?: WriteOffStatus | string;
  invoiceId?: string;
  clientId?: string;
  startDate?: string;
  endDate?: string;
  requestedBy?: string;
  category?: WriteOffCategory | string;
}

export interface WriteOffStats {
  totalRequests: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  totalPendingAmount: number;
  totalApprovedAmount: number;
  totalRejectedAmount: number;
  averageApprovalTime?: number; // in hours
}

// =============================================================================
// Cache Tags
// =============================================================================

const CACHE_TAGS = {
  WRITE_OFFS: 'billing-write-offs',
  WRITE_OFF_DETAIL: (id: string) => `billing-write-off-${id}`,
  WRITE_OFF_STATS: 'billing-write-off-stats',
  INVOICES: 'billing-invoices',
  BILLING_METRICS: 'billing-metrics',
} as const;

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Safely revalidate a cache tag
 */
function safeRevalidateTag(tag: string): void {
  try {
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
 * Validate write-off amount
 */
function validateWriteOffAmount(amount: number, invoiceBalance?: number): { valid: boolean; error?: string } {
  if (amount <= 0) {
    return { valid: false, error: 'Write-off amount must be greater than zero' };
  }
  if (amount > 10_000_000) {
    return { valid: false, error: 'Write-off amount exceeds maximum allowed ($10,000,000)' };
  }
  if (invoiceBalance !== undefined && amount > invoiceBalance) {
    return { valid: false, error: 'Write-off amount cannot exceed invoice balance' };
  }
  return { valid: true };
}

// =============================================================================
// Write-Off Request Actions
// =============================================================================

/**
 * Fetch all write-off requests with optional filters
 */
export async function getWriteOffRequests(
  filters?: WriteOffFilters
): Promise<ActionResult<WriteOffRequest[]>> {
  try {
    const queryString = filters ? buildQueryString(filters) : '';
    const writeOffs = await apiFetch<WriteOffRequest[]>(
      `${API_ENDPOINTS.WRITE_OFFS.LIST}${queryString}`,
      {
        next: {
          tags: [CACHE_TAGS.WRITE_OFFS],
          revalidate: 30,
        },
      }
    );
    return { success: true, data: writeOffs };
  } catch (error) {
    console.error('Failed to fetch write-off requests:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch write-off requests',
    };
  }
}

/**
 * Fetch write-off statistics
 */
export async function getWriteOffStats(): Promise<ActionResult<WriteOffStats>> {
  try {
    const stats = await apiFetch<WriteOffStats>(
      `${API_ENDPOINTS.WRITE_OFFS.LIST}/stats`,
      {
        next: {
          tags: [CACHE_TAGS.WRITE_OFF_STATS],
          revalidate: 60,
        },
      }
    );
    return { success: true, data: stats };
  } catch (error) {
    console.error('Failed to fetch write-off stats:', error);
    // Return default stats on error to allow page to render
    return {
      success: true,
      data: {
        totalRequests: 0,
        pendingCount: 0,
        approvedCount: 0,
        rejectedCount: 0,
        totalPendingAmount: 0,
        totalApprovedAmount: 0,
        totalRejectedAmount: 0,
      },
    };
  }
}

/**
 * Fetch single write-off request by ID
 */
export async function getWriteOffById(id: string): Promise<ActionResult<WriteOffRequest>> {
  try {
    const writeOff = await apiFetch<WriteOffRequest>(
      API_ENDPOINTS.WRITE_OFFS.DETAIL(id),
      {
        next: {
          tags: [CACHE_TAGS.WRITE_OFF_DETAIL(id), CACHE_TAGS.WRITE_OFFS],
          revalidate: 30,
        },
      }
    );
    return { success: true, data: writeOff };
  } catch (error) {
    console.error('Failed to fetch write-off request:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Write-off request not found',
    };
  }
}

/**
 * Create a new write-off request
 *
 * Validates amount and reason before submission.
 * The request will be created with 'pending' status awaiting approval.
 */
export async function createWriteOffRequest(
  input: CreateWriteOffInput
): Promise<ActionResult<WriteOffRequest>> {
  try {
    // Validate amount
    const amountValidation = validateWriteOffAmount(input.amount);
    if (!amountValidation.valid) {
      return {
        success: false,
        error: amountValidation.error,
      };
    }

    // Validate reason
    if (!input.reason || input.reason.trim().length < 10) {
      return {
        success: false,
        error: 'Write-off reason must be at least 10 characters',
      };
    }

    if (input.reason.length > 1000) {
      return {
        success: false,
        error: 'Write-off reason cannot exceed 1000 characters',
      };
    }

    // Validate invoice ID
    if (!input.invoiceId) {
      return {
        success: false,
        error: 'Invoice ID is required',
      };
    }

    const writeOff = await apiFetch<WriteOffRequest>(
      API_ENDPOINTS.WRITE_OFFS.CREATE,
      {
        method: 'POST',
        body: JSON.stringify({
          ...input,
          status: 'pending',
          requestedDate: new Date().toISOString(),
        }),
      }
    );

    safeRevalidateTag(CACHE_TAGS.WRITE_OFFS);
    safeRevalidateTag(CACHE_TAGS.WRITE_OFF_STATS);

    return {
      success: true,
      message: 'Write-off request submitted for approval',
      data: writeOff,
    };
  } catch (error) {
    console.error('Failed to create write-off request:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create write-off request',
    };
  }
}

/**
 * Approve a write-off request
 *
 * Updates invoice/AR and marks the request as approved.
 * Only pending requests can be approved.
 */
export async function approveWriteOff(
  id: string,
  approverNotes?: string
): Promise<ActionResult<WriteOffRequest>> {
  try {
    const writeOff = await apiFetch<WriteOffRequest>(
      API_ENDPOINTS.WRITE_OFFS.APPROVE(id),
      {
        method: 'POST',
        body: JSON.stringify({
          approvedDate: new Date().toISOString(),
          notes: approverNotes,
        }),
      }
    );

    // Revalidate all related caches
    safeRevalidateTag(CACHE_TAGS.WRITE_OFF_DETAIL(id));
    safeRevalidateTag(CACHE_TAGS.WRITE_OFFS);
    safeRevalidateTag(CACHE_TAGS.WRITE_OFF_STATS);
    safeRevalidateTag(CACHE_TAGS.INVOICES);
    safeRevalidateTag(CACHE_TAGS.BILLING_METRICS);

    return {
      success: true,
      message: 'Write-off approved successfully. Invoice has been updated.',
      data: writeOff,
    };
  } catch (error) {
    console.error('Failed to approve write-off:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to approve write-off',
    };
  }
}

/**
 * Reject a write-off request
 *
 * Marks the request as rejected with a reason.
 * Only pending requests can be rejected.
 */
export async function rejectWriteOff(
  id: string,
  rejectionReason: string
): Promise<ActionResult<WriteOffRequest>> {
  try {
    // Validate rejection reason
    if (!rejectionReason || rejectionReason.trim().length < 10) {
      return {
        success: false,
        error: 'Rejection reason must be at least 10 characters',
      };
    }

    const writeOff = await apiFetch<WriteOffRequest>(
      `${API_ENDPOINTS.WRITE_OFFS.DETAIL(id)}/reject`,
      {
        method: 'POST',
        body: JSON.stringify({
          rejectionReason,
          rejectedDate: new Date().toISOString(),
        }),
      }
    );

    safeRevalidateTag(CACHE_TAGS.WRITE_OFF_DETAIL(id));
    safeRevalidateTag(CACHE_TAGS.WRITE_OFFS);
    safeRevalidateTag(CACHE_TAGS.WRITE_OFF_STATS);

    return {
      success: true,
      message: 'Write-off request rejected',
      data: writeOff,
    };
  } catch (error) {
    console.error('Failed to reject write-off:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reject write-off',
    };
  }
}

/**
 * Update a pending write-off request
 *
 * Only pending requests can be updated.
 */
export async function updateWriteOffRequest(
  id: string,
  input: Partial<CreateWriteOffInput>
): Promise<ActionResult<WriteOffRequest>> {
  try {
    // Validate amount if provided
    if (input.amount !== undefined) {
      const amountValidation = validateWriteOffAmount(input.amount);
      if (!amountValidation.valid) {
        return {
          success: false,
          error: amountValidation.error,
        };
      }
    }

    // Validate reason if provided
    if (input.reason !== undefined) {
      if (input.reason.trim().length < 10) {
        return {
          success: false,
          error: 'Write-off reason must be at least 10 characters',
        };
      }
      if (input.reason.length > 1000) {
        return {
          success: false,
          error: 'Write-off reason cannot exceed 1000 characters',
        };
      }
    }

    const writeOff = await apiFetch<WriteOffRequest>(
      API_ENDPOINTS.WRITE_OFFS.UPDATE(id),
      {
        method: 'PATCH',
        body: JSON.stringify(input),
      }
    );

    safeRevalidateTag(CACHE_TAGS.WRITE_OFF_DETAIL(id));
    safeRevalidateTag(CACHE_TAGS.WRITE_OFFS);
    safeRevalidateTag(CACHE_TAGS.WRITE_OFF_STATS);

    return {
      success: true,
      message: 'Write-off request updated',
      data: writeOff,
    };
  } catch (error) {
    console.error('Failed to update write-off request:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update write-off request',
    };
  }
}

/**
 * Delete/cancel a pending write-off request
 *
 * Only pending requests can be deleted.
 */
export async function deleteWriteOffRequest(id: string): Promise<ActionResult> {
  try {
    await apiFetch(API_ENDPOINTS.WRITE_OFFS.DETAIL(id), {
      method: 'DELETE',
    });

    safeRevalidateTag(CACHE_TAGS.WRITE_OFF_DETAIL(id));
    safeRevalidateTag(CACHE_TAGS.WRITE_OFFS);
    safeRevalidateTag(CACHE_TAGS.WRITE_OFF_STATS);

    return {
      success: true,
      message: 'Write-off request cancelled',
    };
  } catch (error) {
    console.error('Failed to delete write-off request:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel write-off request',
    };
  }
}

/**
 * Get write-off history for a specific invoice
 */
export async function getWriteOffsByInvoice(
  invoiceId: string
): Promise<ActionResult<WriteOffRequest[]>> {
  return getWriteOffRequests({ invoiceId });
}

/**
 * Get pending write-offs for approval queue
 */
export async function getPendingWriteOffs(): Promise<ActionResult<WriteOffRequest[]>> {
  return getWriteOffRequests({ status: 'pending' });
}

// =============================================================================
// Form Action Handler
// =============================================================================

/**
 * Write-off form action handler for useActionState
 */
export async function writeOffFormAction(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const intent = formData.get('intent') as string;

  switch (intent) {
    case 'create': {
      const input: CreateWriteOffInput = {
        invoiceId: formData.get('invoiceId') as string,
        amount: parseFloat(formData.get('amount') as string),
        reason: formData.get('reason') as string,
        category: (formData.get('category') as WriteOffCategory) || undefined,
        notes: (formData.get('notes') as string) || undefined,
      };
      const result = await createWriteOffRequest(input);
      if (result.success) {
        return { ...result, redirect: '/billing/write-offs' };
      }
      return result;
    }

    case 'approve': {
      const id = formData.get('id') as string;
      const approverNotes = (formData.get('approverNotes') as string) || undefined;
      return approveWriteOff(id, approverNotes);
    }

    case 'reject': {
      const id = formData.get('id') as string;
      const rejectionReason = formData.get('rejectionReason') as string;
      return rejectWriteOff(id, rejectionReason);
    }

    case 'update': {
      const id = formData.get('id') as string;
      const input: Partial<CreateWriteOffInput> = {};

      const amount = formData.get('amount');
      if (amount) input.amount = parseFloat(amount as string);

      const reason = formData.get('reason');
      if (reason) input.reason = reason as string;

      const category = formData.get('category');
      if (category) input.category = category as WriteOffCategory;

      const notes = formData.get('notes');
      if (notes) input.notes = notes as string;

      return updateWriteOffRequest(id, input);
    }

    case 'delete': {
      const id = formData.get('id') as string;
      return deleteWriteOffRequest(id);
    }

    default:
      return { success: false, error: 'Invalid action' };
  }
}
