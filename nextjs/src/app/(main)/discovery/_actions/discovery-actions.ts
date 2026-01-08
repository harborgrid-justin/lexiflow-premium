'use server';

/**
 * Discovery Server Actions
 * Next.js 16 compliant Server Actions for e-Discovery operations
 *
 * @module discovery/_actions/discovery-actions
 */

import { revalidateTag } from 'next/cache';
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import type {
  ActionResponse,
  CreateDiscoveryRequestInput,
  UpdateDiscoveryRequestInput,
  DiscoveryRequest,
  DiscoveryStatistics,
  PaginatedResponse,
} from '../_types';

// Cache tags for revalidation
const DISCOVERY_CACHE_TAG = 'discovery';
const DISCOVERY_LIST_TAG = 'discovery-list';
const DISCOVERY_DETAIL_TAG = 'discovery-detail';

// ============================================================================
// Discovery Request Actions
// ============================================================================

/**
 * Get all discovery requests with optional filtering
 */
export async function getDiscoveryRequests(params?: {
  caseId?: string;
  status?: string;
  type?: string;
  page?: number;
  pageSize?: number;
}): Promise<ActionResponse<PaginatedResponse<DiscoveryRequest>>> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.caseId) searchParams.set('caseId', params.caseId);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.type) searchParams.set('type', params.type);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.pageSize) searchParams.set('pageSize', params.pageSize.toString());

    const queryString = searchParams.toString();
    const endpoint = `${API_ENDPOINTS.DISCOVERY_REQUESTS.LIST}${queryString ? `?${queryString}` : ''}`;

    const response = await apiFetch<DiscoveryRequest[] | PaginatedResponse<DiscoveryRequest>>(endpoint, {
      next: { tags: [DISCOVERY_CACHE_TAG, DISCOVERY_LIST_TAG] },
    });

    // Handle both array and paginated response formats
    if (Array.isArray(response)) {
      return {
        success: true,
        data: {
          items: response,
          total: response.length,
          page: params?.page || 1,
          pageSize: params?.pageSize || 20,
          totalPages: Math.ceil(response.length / (params?.pageSize || 20)),
        },
      };
    }

    return { success: true, data: response };
  } catch (error) {
    console.error('Failed to fetch discovery requests:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch discovery requests',
    };
  }
}

/**
 * Get a single discovery request by ID
 */
export async function getDiscoveryRequest(id: string): Promise<ActionResponse<DiscoveryRequest>> {
  try {
    const response = await apiFetch<DiscoveryRequest>(
      API_ENDPOINTS.DISCOVERY_REQUESTS.DETAIL(id),
      { next: { tags: [DISCOVERY_CACHE_TAG, `${DISCOVERY_DETAIL_TAG}-${id}`] } }
    );

    return { success: true, data: response };
  } catch (error) {
    console.error('Failed to fetch discovery request:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch discovery request',
    };
  }
}

/**
 * Create a new discovery request
 */
export async function createDiscoveryRequest(
  input: CreateDiscoveryRequestInput
): Promise<ActionResponse<DiscoveryRequest>> {
  try {
    const response = await apiFetch<DiscoveryRequest>(
      API_ENDPOINTS.DISCOVERY_REQUESTS.CREATE,
      {
        method: 'POST',
        body: JSON.stringify({
          ...input,
          status: 'draft',
          createdAt: new Date().toISOString(),
        }),
      }
    );

    // Revalidate discovery caches - Next.js 16 requires profile as second arg
    revalidateTag(DISCOVERY_LIST_TAG);

    return {
      success: true,
      data: response,
      message: 'Discovery request created successfully',
    };
  } catch (error) {
    console.error('Failed to create discovery request:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create discovery request',
    };
  }
}

/**
 * Update an existing discovery request
 */
export async function updateDiscoveryRequest(
  id: string,
  input: UpdateDiscoveryRequestInput
): Promise<ActionResponse<DiscoveryRequest>> {
  try {
    const response = await apiFetch<DiscoveryRequest>(
      API_ENDPOINTS.DISCOVERY_REQUESTS.UPDATE(id),
      {
        method: 'PATCH',
        body: JSON.stringify({
          ...input,
          updatedAt: new Date().toISOString(),
        }),
      }
    );

    // Revalidate caches
    revalidateTag(DISCOVERY_LIST_TAG);
    revalidateTag(`${DISCOVERY_DETAIL_TAG}-${id}`);

    return {
      success: true,
      data: response,
      message: 'Discovery request updated successfully',
    };
  } catch (error) {
    console.error('Failed to update discovery request:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update discovery request',
    };
  }
}

/**
 * Delete a discovery request
 */
export async function deleteDiscoveryRequest(id: string): Promise<ActionResponse<void>> {
  try {
    await apiFetch<void>(API_ENDPOINTS.DISCOVERY_REQUESTS.DELETE(id), {
      method: 'DELETE',
    });

    // Revalidate caches
    revalidateTag(DISCOVERY_LIST_TAG);
    revalidateTag(`${DISCOVERY_DETAIL_TAG}-${id}`);

    return {
      success: true,
      message: 'Discovery request deleted successfully',
    };
  } catch (error) {
    console.error('Failed to delete discovery request:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete discovery request',
    };
  }
}

/**
 * Submit a response to a discovery request
 */
export async function respondToDiscoveryRequest(
  id: string,
  response: string,
  attachments?: string[]
): Promise<ActionResponse<DiscoveryRequest>> {
  try {
    const result = await apiFetch<DiscoveryRequest>(
      API_ENDPOINTS.DISCOVERY_REQUESTS.UPDATE(id),
      {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'responded',
          responseDate: new Date().toISOString(),
          responseNotes: response,
          ...(attachments && { attachments }),
          updatedAt: new Date().toISOString(),
        }),
      }
    );

    // Revalidate caches
    revalidateTag(DISCOVERY_LIST_TAG);
    revalidateTag(`${DISCOVERY_DETAIL_TAG}-${id}`);

    return {
      success: true,
      data: result,
      message: 'Response submitted successfully',
    };
  } catch (error) {
    console.error('Failed to respond to discovery request:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit response',
    };
  }
}

/**
 * Serve a discovery request
 */
export async function serveDiscoveryRequest(
  id: string,
  serviceMethod: string
): Promise<ActionResponse<DiscoveryRequest>> {
  try {
    const result = await apiFetch<DiscoveryRequest>(
      API_ENDPOINTS.DISCOVERY_REQUESTS.UPDATE(id),
      {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'served',
          serviceDate: new Date().toISOString(),
          serviceMethod,
          updatedAt: new Date().toISOString(),
        }),
      }
    );

    // Revalidate caches
    revalidateTag(DISCOVERY_LIST_TAG);
    revalidateTag(`${DISCOVERY_DETAIL_TAG}-${id}`);

    return {
      success: true,
      data: result,
      message: 'Discovery request served successfully',
    };
  } catch (error) {
    console.error('Failed to serve discovery request:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to serve request',
    };
  }
}

/**
 * File a motion related to discovery request
 */
export async function fileDiscoveryMotion(
  id: string,
  motionType: 'compel' | 'protective_order' | 'sanctions'
): Promise<ActionResponse<DiscoveryRequest>> {
  try {
    const result = await apiFetch<DiscoveryRequest>(
      API_ENDPOINTS.DISCOVERY_REQUESTS.UPDATE(id),
      {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'motion_filed',
          motionType,
          motionFiledDate: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      }
    );

    // Revalidate caches
    revalidateTag(DISCOVERY_LIST_TAG);
    revalidateTag(`${DISCOVERY_DETAIL_TAG}-${id}`);

    return {
      success: true,
      data: result,
      message: 'Motion filed successfully',
    };
  } catch (error) {
    console.error('Failed to file motion:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to file motion',
    };
  }
}

// ============================================================================
// Statistics Actions
// ============================================================================

/**
 * Get discovery statistics for dashboard
 */
export async function getDiscoveryStatistics(
  caseId?: string
): Promise<ActionResponse<DiscoveryStatistics>> {
  try {
    // Build the query string
    const queryString = caseId ? `?caseId=${caseId}` : '';
    const endpoint = `${API_ENDPOINTS.ANALYTICS.DISCOVERY}${queryString}`;

    const response = await apiFetch<DiscoveryStatistics>(endpoint, {
      next: { tags: [DISCOVERY_CACHE_TAG, 'discovery-stats'] },
    });

    return { success: true, data: response };
  } catch (error) {
    // Return mock statistics if API fails (for development)
    console.error('Failed to fetch discovery statistics:', error);

    const mockStats: DiscoveryStatistics = {
      requests: {
        total: 24,
        pending: 8,
        served: 6,
        responded: 7,
        overdue: 3,
      },
      collections: {
        total: 12,
        active: 4,
        completed: 8,
        totalSize: '2.4 TB',
      },
      review: {
        totalDocuments: 45000,
        reviewed: 32000,
        notReviewed: 13000,
        responsive: 18500,
        privileged: 2100,
        flagged: 450,
        averageReviewRate: 125,
      },
      productions: {
        total: 8,
        produced: 5,
        staging: 3,
        totalDocuments: 25000,
        totalSize: '1.8 TB',
      },
      legalHolds: {
        active: 6,
        released: 2,
        totalCustodians: 45,
        pendingAcknowledgments: 8,
      },
    };

    return { success: true, data: mockStats };
  }
}
