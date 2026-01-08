'use server';

/**
 * Production Server Actions
 * Next.js 16 compliant Server Actions for production set management
 *
 * @module discovery/_actions/production-actions
 */

import { revalidateTag } from 'next/cache';
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import type {
  ActionResponse,
  ProductionSet,
  CreateProductionSetInput,
  PrivilegeLogEntry,
  PaginatedResponse,
  ProductionStatusValue,
} from '../_types';

// Cache tags
const PRODUCTIONS_CACHE_TAG = 'productions';
const PRIVILEGE_LOG_CACHE_TAG = 'privilege-log';

// ============================================================================
// Production Set Actions
// ============================================================================

/**
 * Get all production sets
 */
export async function getProductionSets(params?: {
  caseId?: string;
  discoveryRequestId?: string;
  status?: string;
}): Promise<ActionResponse<PaginatedResponse<ProductionSet>>> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.caseId) searchParams.set('caseId', params.caseId);
    if (params?.discoveryRequestId) searchParams.set('discoveryRequestId', params.discoveryRequestId);
    if (params?.status) searchParams.set('status', params.status);

    const queryString = searchParams.toString();
    const endpoint = `${API_ENDPOINTS.PRODUCTIONS.LIST}${queryString ? `?${queryString}` : ''}`;

    const response = await apiFetch<ProductionSet[] | PaginatedResponse<ProductionSet>>(
      endpoint,
      { next: { tags: [PRODUCTIONS_CACHE_TAG] } }
    );

    if (Array.isArray(response)) {
      return {
        success: true,
        data: {
          items: response,
          total: response.length,
          page: 1,
          pageSize: 20,
          totalPages: Math.ceil(response.length / 20),
        },
      };
    }

    return { success: true, data: response };
  } catch (error) {
    console.error('Failed to fetch production sets:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch production sets',
    };
  }
}

/**
 * Get a single production set
 */
export async function getProductionSet(id: string): Promise<ActionResponse<ProductionSet>> {
  try {
    const response = await apiFetch<ProductionSet>(
      API_ENDPOINTS.PRODUCTIONS.DETAIL(id),
      { next: { tags: [PRODUCTIONS_CACHE_TAG, `production-${id}`] } }
    );

    return { success: true, data: response };
  } catch (error) {
    console.error('Failed to fetch production set:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch production set',
    };
  }
}

/**
 * Create a new production set
 */
export async function createProductionSet(
  input: CreateProductionSetInput
): Promise<ActionResponse<ProductionSet>> {
  try {
    // Generate production number
    const timestamp = Date.now().toString(36).toUpperCase();
    const productionNumber = `PROD-${timestamp}`;

    const response = await apiFetch<ProductionSet>(
      API_ENDPOINTS.PRODUCTIONS.CREATE,
      {
        method: 'POST',
        body: JSON.stringify({
          ...input,
          productionNumber,
          status: 'draft',
          documentCount: 0,
          nativeCount: 0,
          imageCount: 0,
          batesRange: { start: '', end: '' },
          createdAt: new Date().toISOString(),
        }),
      }
    );

    revalidateTag(PRODUCTIONS_CACHE_TAG);

    return {
      success: true,
      data: response,
      message: 'Production set created successfully',
    };
  } catch (error) {
    console.error('Failed to create production set:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create production set',
    };
  }
}

/**
 * Update production set status
 */
export async function updateProductionStatus(
  id: string,
  status: ProductionStatusValue
): Promise<ActionResponse<ProductionSet>> {
  try {
    const updateData: Record<string, unknown> = {
      status,
      updatedAt: new Date().toISOString(),
    };

    // Set production date when marked as produced
    if (status === 'produced') {
      updateData.productionDate = new Date().toISOString();
    }

    const response = await apiFetch<ProductionSet>(
      API_ENDPOINTS.PRODUCTIONS.UPDATE(id),
      {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      }
    );

    revalidateTag(PRODUCTIONS_CACHE_TAG);
    revalidateTag(`production-${id}`);

    return {
      success: true,
      data: response,
      message: `Production status updated to ${status}`,
    };
  } catch (error) {
    console.error('Failed to update production status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update production status',
    };
  }
}

/**
 * Add documents to production set
 */
export async function addDocumentsToProduction(
  productionId: string,
  documentIds: string[]
): Promise<ActionResponse<ProductionSet>> {
  try {
    const response = await apiFetch<ProductionSet>(
      `${API_ENDPOINTS.PRODUCTIONS.DETAIL(productionId)}/documents`,
      {
        method: 'POST',
        body: JSON.stringify({ documentIds }),
      }
    );

    revalidateTag(PRODUCTIONS_CACHE_TAG);
    revalidateTag(`production-${productionId}`);

    return {
      success: true,
      data: response,
      message: `${documentIds.length} documents added to production`,
    };
  } catch (error) {
    console.error('Failed to add documents to production:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add documents to production',
    };
  }
}

/**
 * Remove documents from production set
 */
export async function removeDocumentsFromProduction(
  productionId: string,
  documentIds: string[]
): Promise<ActionResponse<ProductionSet>> {
  try {
    const response = await apiFetch<ProductionSet>(
      `${API_ENDPOINTS.PRODUCTIONS.DETAIL(productionId)}/documents`,
      {
        method: 'DELETE',
        body: JSON.stringify({ documentIds }),
      }
    );

    revalidateTag(PRODUCTIONS_CACHE_TAG);
    revalidateTag(`production-${productionId}`);

    return {
      success: true,
      data: response,
      message: `${documentIds.length} documents removed from production`,
    };
  } catch (error) {
    console.error('Failed to remove documents from production:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove documents from production',
    };
  }
}

/**
 * Generate Bates numbers for production
 */
export async function generateBatesNumbers(
  productionId: string,
  prefix: string,
  startNumber: number
): Promise<ActionResponse<ProductionSet>> {
  try {
    const response = await apiFetch<ProductionSet>(
      `${API_ENDPOINTS.PRODUCTIONS.DETAIL(productionId)}/bates`,
      {
        method: 'POST',
        body: JSON.stringify({ prefix, startNumber }),
      }
    );

    revalidateTag(PRODUCTIONS_CACHE_TAG);
    revalidateTag(`production-${productionId}`);

    return {
      success: true,
      data: response,
      message: 'Bates numbers generated',
    };
  } catch (error) {
    console.error('Failed to generate Bates numbers:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate Bates numbers',
    };
  }
}

/**
 * Run QC check on production
 */
export async function runProductionQC(
  productionId: string
): Promise<ActionResponse<{
  passed: boolean;
  issues: Array<{ documentId: string; issue: string }>;
}>> {
  try {
    const response = await apiFetch<{
      passed: boolean;
      issues: Array<{ documentId: string; issue: string }>;
    }>(
      `${API_ENDPOINTS.PRODUCTIONS.DETAIL(productionId)}/qc`,
      { method: 'POST' }
    );

    if (response.passed) {
      // Update status to QC if passed
      await updateProductionStatus(productionId, 'qc');
    }

    return {
      success: true,
      data: response,
      message: response.passed ? 'QC passed' : `QC found ${response.issues.length} issues`,
    };
  } catch (error) {
    console.error('Failed to run QC:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to run QC',
    };
  }
}

/**
 * Export production package
 */
export async function exportProduction(
  productionId: string,
  options: {
    format: 'native' | 'pdf' | 'tiff';
    includeLoadFile: boolean;
    loadFileType?: 'dat' | 'opt' | 'lfp' | 'csv';
    includeMetadata: boolean;
    includeText: boolean;
  }
): Promise<ActionResponse<{ downloadUrl: string; expiresAt: string }>> {
  try {
    const response = await apiFetch<{ downloadUrl: string; expiresAt: string }>(
      `${API_ENDPOINTS.PRODUCTIONS.DETAIL(productionId)}/export`,
      {
        method: 'POST',
        body: JSON.stringify(options),
      }
    );

    return {
      success: true,
      data: response,
      message: 'Production export ready for download',
    };
  } catch (error) {
    console.error('Failed to export production:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export production',
    };
  }
}

/**
 * Delete a production set
 */
export async function deleteProductionSet(id: string): Promise<ActionResponse<void>> {
  try {
    await apiFetch<void>(API_ENDPOINTS.PRODUCTIONS.DELETE(id), {
      method: 'DELETE',
    });

    revalidateTag(PRODUCTIONS_CACHE_TAG);
    revalidateTag(`production-${id}`);

    return {
      success: true,
      message: 'Production set deleted successfully',
    };
  } catch (error) {
    console.error('Failed to delete production set:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete production set',
    };
  }
}

// ============================================================================
// Privilege Log Actions
// ============================================================================

/**
 * Get privilege log entries
 */
export async function getPrivilegeLog(params?: {
  caseId?: string;
  productionId?: string;
}): Promise<ActionResponse<PaginatedResponse<PrivilegeLogEntry>>> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.caseId) searchParams.set('caseId', params.caseId);
    if (params?.productionId) searchParams.set('productionId', params.productionId);

    const queryString = searchParams.toString();
    const endpoint = `${API_ENDPOINTS.PRIVILEGE_LOG.LIST}${queryString ? `?${queryString}` : ''}`;

    const response = await apiFetch<PrivilegeLogEntry[] | PaginatedResponse<PrivilegeLogEntry>>(
      endpoint,
      { next: { tags: [PRIVILEGE_LOG_CACHE_TAG] } }
    );

    if (Array.isArray(response)) {
      return {
        success: true,
        data: {
          items: response,
          total: response.length,
          page: 1,
          pageSize: 50,
          totalPages: Math.ceil(response.length / 50),
        },
      };
    }

    return { success: true, data: response };
  } catch (error) {
    console.error('Failed to fetch privilege log:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch privilege log',
    };
  }
}

/**
 * Add privilege log entry
 */
export async function addPrivilegeLogEntry(
  entry: Omit<PrivilegeLogEntry, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ActionResponse<PrivilegeLogEntry>> {
  try {
    const response = await apiFetch<PrivilegeLogEntry>(
      API_ENDPOINTS.PRIVILEGE_LOG.CREATE,
      {
        method: 'POST',
        body: JSON.stringify({
          ...entry,
          createdAt: new Date().toISOString(),
        }),
      }
    );

    revalidateTag(PRIVILEGE_LOG_CACHE_TAG);

    return {
      success: true,
      data: response,
      message: 'Privilege log entry added',
    };
  } catch (error) {
    console.error('Failed to add privilege log entry:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add privilege log entry',
    };
  }
}

/**
 * Export privilege log
 */
export async function exportPrivilegeLog(
  caseId: string,
  format: 'csv' | 'excel' | 'pdf'
): Promise<ActionResponse<{ downloadUrl: string }>> {
  try {
    const response = await apiFetch<{ downloadUrl: string }>(
      `${API_ENDPOINTS.PRIVILEGE_LOG.LIST}/export`,
      {
        method: 'POST',
        body: JSON.stringify({ caseId, format }),
      }
    );

    return {
      success: true,
      data: response,
      message: 'Privilege log exported',
    };
  } catch (error) {
    console.error('Failed to export privilege log:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export privilege log',
    };
  }
}
