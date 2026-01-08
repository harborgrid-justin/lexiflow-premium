'use server';

/**
 * AR Aging & Collections Server Actions
 *
 * Server-side actions for accounts receivable aging analysis and collections management.
 * Following Next.js 16 conventions with proper async handling and revalidation.
 *
 * @module billing/ar-actions
 */

import { revalidateTag } from 'next/cache';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import type {
  ActionResult,
  ARAgingBucket,
  ARAgingSummary,
  ARAgingFilters,
  CollectionItem,
  CollectionFilters,
  CollectionSummary,
  UpdateCollectionInput,
  LogContactInput,
  CollectionContact,
  CollectionStatus,
  ContactType,
} from './types';

// =============================================================================
// Cache Tags
// =============================================================================

const CACHE_TAGS = {
  AR_AGING: 'billing-ar-aging',
  COLLECTIONS: 'billing-collections',
  COLLECTION_DETAIL: (id: string) => `billing-collection-${id}`,
  COLLECTION_SUMMARY: 'billing-collection-summary',
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

// =============================================================================
// AR Aging Actions
// =============================================================================

/**
 * Fetch AR Aging buckets with client breakdowns
 *
 * Returns aging data grouped by date ranges:
 * - 0-30 days (Current)
 * - 31-60 days
 * - 61-90 days
 * - 90+ days
 */
export async function getARAgingBuckets(
  filters?: ARAgingFilters
): Promise<ActionResult<ARAgingBucket[]>> {
  try {
    const queryString = filters ? buildQueryString(filters) : '';
    const buckets = await apiFetch<ARAgingBucket[]>(
      `${API_ENDPOINTS.BILLING.ANALYTICS}/ar-aging${queryString}`,
      {
        next: {
          tags: [CACHE_TAGS.AR_AGING],
          revalidate: 60, // Refresh every minute
        },
      }
    );
    return { success: true, data: buckets };
  } catch (error) {
    console.error('Failed to fetch AR aging buckets:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch AR aging data',
    };
  }
}

/**
 * Fetch AR Aging summary statistics
 */
export async function getARAgingSummary(
  filters?: ARAgingFilters
): Promise<ActionResult<ARAgingSummary>> {
  try {
    const queryString = filters ? buildQueryString(filters) : '';
    const summary = await apiFetch<ARAgingSummary>(
      `${API_ENDPOINTS.BILLING.ANALYTICS}/ar-aging/summary${queryString}`,
      {
        next: {
          tags: [CACHE_TAGS.AR_AGING],
          revalidate: 60,
        },
      }
    );
    return { success: true, data: summary };
  } catch (error) {
    console.error('Failed to fetch AR aging summary:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch AR aging summary',
    };
  }
}

/**
 * Export AR Aging report
 */
export async function exportARAgingReport(
  format: 'pdf' | 'excel' | 'csv',
  filters?: ARAgingFilters
): Promise<ActionResult<{ url: string }>> {
  try {
    const queryString = filters ? buildQueryString({ ...filters, format }) : `?format=${format}`;
    const result = await apiFetch<{ url: string }>(
      `${API_ENDPOINTS.BILLING.ANALYTICS}/ar-aging/export${queryString}`,
      {
        method: 'POST',
      }
    );
    return { success: true, data: result, message: 'Report generated successfully' };
  } catch (error) {
    console.error('Failed to export AR aging report:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export report',
    };
  }
}

// =============================================================================
// Collections Actions
// =============================================================================

/**
 * Fetch collection items with optional filters
 */
export async function getCollectionItems(
  filters?: CollectionFilters
): Promise<ActionResult<CollectionItem[]>> {
  try {
    const queryString = filters ? buildQueryString(filters) : '';
    const items = await apiFetch<CollectionItem[]>(
      `${API_ENDPOINTS.COLLECTIONS_QUEUE.LIST}${queryString}`,
      {
        next: {
          tags: [CACHE_TAGS.COLLECTIONS],
          revalidate: 30,
        },
      }
    );
    return { success: true, data: items };
  } catch (error) {
    console.error('Failed to fetch collection items:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch collection items',
    };
  }
}

/**
 * Fetch single collection item by ID
 */
export async function getCollectionItemById(
  id: string
): Promise<ActionResult<CollectionItem>> {
  try {
    const item = await apiFetch<CollectionItem>(
      API_ENDPOINTS.COLLECTIONS_QUEUE.DETAIL(id),
      {
        next: {
          tags: [CACHE_TAGS.COLLECTION_DETAIL(id), CACHE_TAGS.COLLECTIONS],
          revalidate: 30,
        },
      }
    );
    return { success: true, data: item };
  } catch (error) {
    console.error('Failed to fetch collection item:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Collection item not found',
    };
  }
}

/**
 * Fetch collection summary statistics
 */
export async function getCollectionSummary(): Promise<ActionResult<CollectionSummary>> {
  try {
    const summary = await apiFetch<CollectionSummary>(
      `${API_ENDPOINTS.COLLECTIONS_QUEUE.LIST}/summary`,
      {
        next: {
          tags: [CACHE_TAGS.COLLECTION_SUMMARY, CACHE_TAGS.COLLECTIONS],
          revalidate: 60,
        },
      }
    );
    return { success: true, data: summary };
  } catch (error) {
    console.error('Failed to fetch collection summary:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch collection summary',
    };
  }
}

/**
 * Update a collection item
 */
export async function updateCollectionItem(
  id: string,
  input: UpdateCollectionInput
): Promise<ActionResult<CollectionItem>> {
  try {
    const item = await apiFetch<CollectionItem>(
      API_ENDPOINTS.COLLECTIONS_QUEUE.DETAIL(id),
      {
        method: 'PATCH',
        body: JSON.stringify(input),
      }
    );
    safeRevalidateTag(CACHE_TAGS.COLLECTION_DETAIL(id));
    safeRevalidateTag(CACHE_TAGS.COLLECTIONS);
    safeRevalidateTag(CACHE_TAGS.COLLECTION_SUMMARY);
    return { success: true, message: 'Collection item updated successfully', data: item };
  } catch (error) {
    console.error('Failed to update collection item:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update collection item',
    };
  }
}

/**
 * Log a contact attempt for a collection item
 */
export async function logCollectionContact(
  collectionId: string,
  input: LogContactInput
): Promise<ActionResult<CollectionContact>> {
  try {
    const contact = await apiFetch<CollectionContact>(
      API_ENDPOINTS.COLLECTIONS_QUEUE.CONTACT(collectionId),
      {
        method: 'POST',
        body: JSON.stringify(input),
      }
    );
    safeRevalidateTag(CACHE_TAGS.COLLECTION_DETAIL(collectionId));
    safeRevalidateTag(CACHE_TAGS.COLLECTIONS);
    return { success: true, message: 'Contact logged successfully', data: contact };
  } catch (error) {
    console.error('Failed to log collection contact:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to log contact',
    };
  }
}

/**
 * Mark a collection item as collected
 */
export async function markAsCollected(
  id: string,
  notes?: string
): Promise<ActionResult<CollectionItem>> {
  return updateCollectionItem(id, {
    status: CollectionStatus.COLLECTED,
    notes,
  });
}

/**
 * Escalate a collection item
 */
export async function escalateCollectionItem(
  id: string,
  notes: string
): Promise<ActionResult<CollectionItem>> {
  return updateCollectionItem(id, {
    status: CollectionStatus.ESCALATED,
    priority: 'critical',
    notes,
  });
}

/**
 * Create a payment plan for a collection item
 */
export async function createCollectionPaymentPlan(
  collectionId: string,
  planData: {
    installmentCount: number;
    installmentAmount: number;
    startDate: string;
    frequency: 'weekly' | 'biweekly' | 'monthly';
  }
): Promise<ActionResult<{ paymentPlanId: string }>> {
  try {
    const result = await apiFetch<{ paymentPlanId: string }>(
      API_ENDPOINTS.COLLECTIONS_QUEUE.PAYMENT_PLAN(collectionId),
      {
        method: 'POST',
        body: JSON.stringify(planData),
      }
    );
    safeRevalidateTag(CACHE_TAGS.COLLECTION_DETAIL(collectionId));
    safeRevalidateTag(CACHE_TAGS.COLLECTIONS);
    return {
      success: true,
      message: 'Payment plan created successfully',
      data: result,
    };
  } catch (error) {
    console.error('Failed to create payment plan:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create payment plan',
    };
  }
}

/**
 * Bulk update collection items
 */
export async function bulkUpdateCollectionItems(
  ids: string[],
  input: UpdateCollectionInput
): Promise<ActionResult<{ updated: number; failed: number }>> {
  try {
    const result = await apiFetch<{ updated: number; failed: number }>(
      `${API_ENDPOINTS.COLLECTIONS_QUEUE.LIST}/bulk-update`,
      {
        method: 'PATCH',
        body: JSON.stringify({ ids, ...input }),
      }
    );
    safeRevalidateTag(CACHE_TAGS.COLLECTIONS);
    safeRevalidateTag(CACHE_TAGS.COLLECTION_SUMMARY);
    return {
      success: true,
      message: `${result.updated} items updated successfully`,
      data: result,
    };
  } catch (error) {
    console.error('Failed to bulk update collection items:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update collection items',
    };
  }
}

// =============================================================================
// Form Action Handlers
// =============================================================================

/**
 * Collection item form action handler
 */
export async function collectionFormAction(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const intent = formData.get('intent') as string;
  const id = formData.get('id') as string;

  switch (intent) {
    case 'update-status': {
      const status = formData.get('status') as CollectionStatus;
      const notes = formData.get('notes') as string | undefined;
      return updateCollectionItem(id, { status, notes });
    }

    case 'update-priority': {
      const priority = formData.get('priority') as 'low' | 'medium' | 'high' | 'critical';
      return updateCollectionItem(id, { priority });
    }

    case 'assign': {
      const assignedTo = formData.get('assignedTo') as string;
      return updateCollectionItem(id, { assignedTo });
    }

    case 'log-contact': {
      const contactInput: LogContactInput = {
        contactDate: formData.get('contactDate') as string,
        contactType: formData.get('contactType') as ContactType,
        notes: formData.get('notes') as string,
        outcome: (formData.get('outcome') as string) || undefined,
        followUpDate: (formData.get('followUpDate') as string) || undefined,
      };
      return logCollectionContact(id, contactInput);
    }

    case 'escalate': {
      const escalateNotes = formData.get('notes') as string;
      return escalateCollectionItem(id, escalateNotes);
    }

    case 'mark-collected': {
      const collectedNotes = formData.get('notes') as string | undefined;
      return markAsCollected(id, collectedNotes);
    }

    case 'create-payment-plan': {
      const planData = {
        installmentCount: parseInt(formData.get('installmentCount') as string, 10),
        installmentAmount: parseFloat(formData.get('installmentAmount') as string),
        startDate: formData.get('startDate') as string,
        frequency: formData.get('frequency') as 'weekly' | 'biweekly' | 'monthly',
      };
      return createCollectionPaymentPlan(id, planData);
    }

    case 'bulk-update': {
      const idsRaw = formData.get('ids') as string;
      const ids = JSON.parse(idsRaw) as string[];
      const bulkStatus = formData.get('status') as CollectionStatus | undefined;
      const bulkPriority = formData.get('priority') as 'low' | 'medium' | 'high' | 'critical' | undefined;
      const bulkAssignedTo = formData.get('assignedTo') as string | undefined;
      return bulkUpdateCollectionItems(ids, {
        status: bulkStatus,
        priority: bulkPriority,
        assignedTo: bulkAssignedTo,
      });
    }

    default:
      return { success: false, error: 'Invalid action' };
  }
}

/**
 * AR Aging export action handler
 */
export async function arAgingExportAction(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const format = formData.get('format') as 'pdf' | 'excel' | 'csv';
  const filters: ARAgingFilters = {
    startDate: (formData.get('startDate') as string) || undefined,
    endDate: (formData.get('endDate') as string) || undefined,
    clientId: (formData.get('clientId') as string) || undefined,
  };
  return exportARAgingReport(format, filters);
}
