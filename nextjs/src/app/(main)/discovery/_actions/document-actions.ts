'use server';

/**
 * Document Review Server Actions
 * Next.js 16 compliant Server Actions for document review operations
 *
 * @module discovery/_actions/document-actions
 */

import { revalidateTag } from 'next/cache';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import type {
  ActionResponse,
  ReviewDocument,
  DocumentCoding,
  DataCollection,
  BulkDocumentActionInput,
  SearchDocumentsInput,
  PaginatedResponse,
  ReviewStatusValue,
} from '../_types';

// Cache tags
const DOCUMENTS_CACHE_TAG = 'review-documents';
const COLLECTIONS_CACHE_TAG = 'collections';

// ============================================================================
// Document Collection Actions
// ============================================================================

/**
 * Get all data collections
 */
export async function getCollections(params?: {
  caseId?: string;
  status?: string;
}): Promise<ActionResponse<PaginatedResponse<DataCollection>>> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.caseId) searchParams.set('caseId', params.caseId);
    if (params?.status) searchParams.set('status', params.status);

    const queryString = searchParams.toString();
    const endpoint = `${API_ENDPOINTS.ESI_SOURCES.LIST}${queryString ? `?${queryString}` : ''}`;

    const response = await apiFetch<DataCollection[] | PaginatedResponse<DataCollection>>(
      endpoint,
      { next: { tags: [COLLECTIONS_CACHE_TAG] } }
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
    console.error('Failed to fetch collections:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch collections',
    };
  }
}

/**
 * Create a new data collection
 */
export async function createCollection(input: {
  caseId: string;
  collectionName: string;
  custodianIds: string[];
  dataSources: string[];
  dateRange: { start: string; end: string };
  collectionMethod: 'remote' | 'onsite' | 'forensic' | 'api';
  estimatedSize: string;
  notes?: string;
}): Promise<ActionResponse<DataCollection>> {
  try {
    const response = await apiFetch<DataCollection>(
      API_ENDPOINTS.ESI_SOURCES.CREATE,
      {
        method: 'POST',
        body: JSON.stringify({
          ...input,
          status: 'pending',
          progress: 0,
          totalItems: 0,
          collectedItems: 0,
          createdAt: new Date().toISOString(),
        }),
      }
    );

    revalidateTag(COLLECTIONS_CACHE_TAG);

    return {
      success: true,
      data: response,
      message: 'Collection created successfully',
    };
  } catch (error) {
    console.error('Failed to create collection:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create collection',
    };
  }
}

/**
 * Start a collection job
 */
export async function startCollection(id: string): Promise<ActionResponse<DataCollection>> {
  try {
    const response = await apiFetch<DataCollection>(
      API_ENDPOINTS.ESI_SOURCES.UPDATE(id),
      {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'in_progress',
          startedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      }
    );

    revalidateTag(COLLECTIONS_CACHE_TAG);

    return {
      success: true,
      data: response,
      message: 'Collection started',
    };
  } catch (error) {
    console.error('Failed to start collection:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to start collection',
    };
  }
}

/**
 * Pause a collection job
 */
export async function pauseCollection(id: string): Promise<ActionResponse<DataCollection>> {
  try {
    const response = await apiFetch<DataCollection>(
      API_ENDPOINTS.ESI_SOURCES.UPDATE(id),
      {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'paused',
          updatedAt: new Date().toISOString(),
        }),
      }
    );

    revalidateTag(COLLECTIONS_CACHE_TAG);

    return {
      success: true,
      data: response,
      message: 'Collection paused',
    };
  } catch (error) {
    console.error('Failed to pause collection:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to pause collection',
    };
  }
}

// ============================================================================
// Document Review Actions
// ============================================================================

/**
 * Search and filter review documents
 */
export async function searchDocuments(
  input: SearchDocumentsInput
): Promise<ActionResponse<PaginatedResponse<ReviewDocument>>> {
  try {
    const searchParams = new URLSearchParams();
    if (input.caseId) searchParams.set('caseId', input.caseId);
    if (input.discoveryRequestId) searchParams.set('discoveryRequestId', input.discoveryRequestId);
    if (input.keywords) searchParams.set('keywords', input.keywords);
    if (input.custodians?.length) searchParams.set('custodians', input.custodians.join(','));
    if (input.dateRange?.start) searchParams.set('dateStart', input.dateRange.start);
    if (input.dateRange?.end) searchParams.set('dateEnd', input.dateRange.end);
    if (input.fileTypes?.length) searchParams.set('fileTypes', input.fileTypes.join(','));
    if (input.reviewStatus?.length) searchParams.set('reviewStatus', input.reviewStatus.join(','));
    if (input.responsive) searchParams.set('responsive', input.responsive);
    if (input.privileged) searchParams.set('privileged', input.privileged);
    if (input.tags?.length) searchParams.set('tags', input.tags.join(','));
    if (input.page) searchParams.set('page', input.page.toString());
    if (input.pageSize) searchParams.set('pageSize', input.pageSize.toString());
    if (input.sortBy) searchParams.set('sortBy', input.sortBy);
    if (input.sortOrder) searchParams.set('sortOrder', input.sortOrder);

    const queryString = searchParams.toString();
    const endpoint = `${API_ENDPOINTS.DOCUMENTS.LIST}${queryString ? `?${queryString}` : ''}`;

    const response = await apiFetch<ReviewDocument[] | PaginatedResponse<ReviewDocument>>(
      endpoint,
      { next: { tags: [DOCUMENTS_CACHE_TAG] } }
    );

    if (Array.isArray(response)) {
      return {
        success: true,
        data: {
          items: response,
          total: response.length,
          page: input.page || 1,
          pageSize: input.pageSize || 50,
          totalPages: Math.ceil(response.length / (input.pageSize || 50)),
        },
      };
    }

    return { success: true, data: response };
  } catch (error) {
    console.error('Failed to search documents:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search documents',
    };
  }
}

/**
 * Get a single document for review
 */
export async function getReviewDocument(id: string): Promise<ActionResponse<ReviewDocument>> {
  try {
    const response = await apiFetch<ReviewDocument>(
      API_ENDPOINTS.DOCUMENTS.DETAIL(id),
      { next: { tags: [DOCUMENTS_CACHE_TAG, `document-${id}`] } }
    );

    return { success: true, data: response };
  } catch (error) {
    console.error('Failed to fetch document:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch document',
    };
  }
}

/**
 * Update document review status
 */
export async function updateReviewStatus(
  id: string,
  status: ReviewStatusValue
): Promise<ActionResponse<ReviewDocument>> {
  try {
    const response = await apiFetch<ReviewDocument>(
      API_ENDPOINTS.DOCUMENTS.UPDATE(id),
      {
        method: 'PATCH',
        body: JSON.stringify({
          reviewStatus: status,
          ...(status === 'reviewed' && { reviewedAt: new Date().toISOString() }),
          updatedAt: new Date().toISOString(),
        }),
      }
    );

    revalidateTag(DOCUMENTS_CACHE_TAG);
    revalidateTag(`document-${id}`);

    return {
      success: true,
      data: response,
      message: 'Review status updated',
    };
  } catch (error) {
    console.error('Failed to update review status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update review status',
    };
  }
}

/**
 * Update document coding
 */
export async function updateDocumentCoding(
  id: string,
  coding: Partial<DocumentCoding>
): Promise<ActionResponse<ReviewDocument>> {
  try {
    const response = await apiFetch<ReviewDocument>(
      API_ENDPOINTS.DOCUMENTS.UPDATE(id),
      {
        method: 'PATCH',
        body: JSON.stringify({
          coding,
          updatedAt: new Date().toISOString(),
        }),
      }
    );

    revalidateTag(DOCUMENTS_CACHE_TAG);
    revalidateTag(`document-${id}`);

    return {
      success: true,
      data: response,
      message: 'Document coding updated',
    };
  } catch (error) {
    console.error('Failed to update document coding:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update document coding',
    };
  }
}

/**
 * Add tags to a document
 */
export async function addDocumentTags(
  id: string,
  tags: string[]
): Promise<ActionResponse<ReviewDocument>> {
  try {
    // Get current document to merge tags
    const current = await getReviewDocument(id);
    if (!current.success || !current.data) {
      return { success: false, error: 'Document not found' };
    }

    const updatedTags = [...new Set([...(current.data.tags || []), ...tags])];

    const response = await apiFetch<ReviewDocument>(
      API_ENDPOINTS.DOCUMENTS.UPDATE(id),
      {
        method: 'PATCH',
        body: JSON.stringify({
          tags: updatedTags,
          updatedAt: new Date().toISOString(),
        }),
      }
    );

    revalidateTag(DOCUMENTS_CACHE_TAG);
    revalidateTag(`document-${id}`);

    return {
      success: true,
      data: response,
      message: 'Tags added',
    };
  } catch (error) {
    console.error('Failed to add tags:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add tags',
    };
  }
}

/**
 * Add notes to a document
 */
export async function addDocumentNotes(
  id: string,
  notes: string
): Promise<ActionResponse<ReviewDocument>> {
  try {
    const response = await apiFetch<ReviewDocument>(
      API_ENDPOINTS.DOCUMENTS.UPDATE(id),
      {
        method: 'PATCH',
        body: JSON.stringify({
          notes,
          updatedAt: new Date().toISOString(),
        }),
      }
    );

    revalidateTag(DOCUMENTS_CACHE_TAG);
    revalidateTag(`document-${id}`);

    return {
      success: true,
      data: response,
      message: 'Notes updated',
    };
  } catch (error) {
    console.error('Failed to update notes:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update notes',
    };
  }
}

/**
 * Bulk update documents
 */
export async function bulkUpdateDocuments(
  input: BulkDocumentActionInput
): Promise<ActionResponse<{ updated: number; failed: number }>> {
  try {
    let updateData: Record<string, unknown> = {};

    switch (input.action) {
      case 'code_responsive':
        updateData = { 'coding.responsive': input.value };
        break;
      case 'code_privileged':
        updateData = { 'coding.privileged': input.value };
        break;
      case 'code_confidential':
        updateData = { 'coding.confidential': input.value };
        break;
      case 'add_tag':
        // For tags, we need to handle differently
        updateData = { addTag: input.value };
        break;
      case 'remove_tag':
        updateData = { removeTag: input.value };
        break;
      case 'assign_reviewer':
        updateData = { reviewedBy: input.value };
        break;
    }

    // Process in batches
    let updated = 0;
    let failed = 0;

    for (const docId of input.documentIds) {
      try {
        await apiFetch(
          API_ENDPOINTS.DOCUMENTS.UPDATE(docId),
          {
            method: 'PATCH',
            body: JSON.stringify({
              ...updateData,
              updatedAt: new Date().toISOString(),
            }),
          }
        );
        updated++;
      } catch {
        failed++;
      }
    }

    revalidateTag(DOCUMENTS_CACHE_TAG);

    return {
      success: true,
      data: { updated, failed },
      message: `Updated ${updated} documents${failed > 0 ? `, ${failed} failed` : ''}`,
    };
  } catch (error) {
    console.error('Failed to bulk update documents:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to bulk update documents',
    };
  }
}

/**
 * Upload documents for review
 */
export async function uploadDocuments(
  caseId: string,
  discoveryRequestId: string,
  formData: FormData
): Promise<ActionResponse<{ uploaded: number; documentIds: string[] }>> {
  try {
    // Add case and discovery request IDs to form data
    formData.append('caseId', caseId);
    formData.append('discoveryRequestId', discoveryRequestId);

    const response = await apiFetch<{ uploaded: number; documentIds: string[] }>(
      API_ENDPOINTS.DOCUMENTS.UPLOAD,
      {
        method: 'POST',
        body: formData,
        headers: {
          // Remove content-type to let browser set it with boundary for multipart
        },
      }
    );

    revalidateTag(DOCUMENTS_CACHE_TAG);

    return {
      success: true,
      data: response,
      message: `${response.uploaded} documents uploaded`,
    };
  } catch (error) {
    console.error('Failed to upload documents:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload documents',
    };
  }
}

/**
 * Get document content/preview
 */
export async function getDocumentContent(id: string): Promise<ActionResponse<{
  content: string;
  contentType: string;
}>> {
  try {
    const response = await apiFetch<{ content: string; contentType: string }>(
      API_ENDPOINTS.DOCUMENTS.CONTENT(id),
      { next: { tags: [`document-content-${id}`] } }
    );

    return { success: true, data: response };
  } catch (error) {
    console.error('Failed to get document content:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get document content',
    };
  }
}
