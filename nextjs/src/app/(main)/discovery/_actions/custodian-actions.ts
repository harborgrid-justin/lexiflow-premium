'use server';

/**
 * Custodian Server Actions
 * Next.js 16 compliant Server Actions for custodian management
 *
 * @module discovery/_actions/custodian-actions
 */

import { revalidateTag } from 'next/cache';
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import type {
  ActionResponse,
  CreateCustodianInput,
  Custodian,
  LegalHold,
  CreateLegalHoldInput,
  PaginatedResponse,
} from '../_types';

// Cache tags
const CUSTODIAN_CACHE_TAG = 'custodians';
const LEGAL_HOLD_CACHE_TAG = 'legal-holds';

// ============================================================================
// Custodian Actions
// ============================================================================

/**
 * Get all custodians with optional filtering
 */
export async function getCustodians(params?: {
  caseId?: string;
  legalHoldStatus?: string;
  page?: number;
  pageSize?: number;
}): Promise<ActionResponse<PaginatedResponse<Custodian>>> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.caseId) searchParams.set('caseId', params.caseId);
    if (params?.legalHoldStatus) searchParams.set('legalHoldStatus', params.legalHoldStatus);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.pageSize) searchParams.set('pageSize', params.pageSize.toString());

    const queryString = searchParams.toString();
    const endpoint = `${API_ENDPOINTS.CUSTODIANS.LIST}${queryString ? `?${queryString}` : ''}`;

    const response = await apiFetch<Custodian[] | PaginatedResponse<Custodian>>(endpoint, {
      next: { tags: [CUSTODIAN_CACHE_TAG] },
    });

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
    console.error('Failed to fetch custodians:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch custodians',
    };
  }
}

/**
 * Get a single custodian by ID
 */
export async function getCustodian(id: string): Promise<ActionResponse<Custodian>> {
  try {
    const response = await apiFetch<Custodian>(
      API_ENDPOINTS.CUSTODIANS.DETAIL(id),
      { next: { tags: [CUSTODIAN_CACHE_TAG, `custodian-${id}`] } }
    );

    return { success: true, data: response };
  } catch (error) {
    console.error('Failed to fetch custodian:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch custodian',
    };
  }
}

/**
 * Create a new custodian
 */
export async function createCustodian(
  input: CreateCustodianInput
): Promise<ActionResponse<Custodian>> {
  try {
    const response = await apiFetch<Custodian>(
      API_ENDPOINTS.CUSTODIANS.CREATE,
      {
        method: 'POST',
        body: JSON.stringify({
          ...input,
          legalHoldStatus: 'pending',
          createdAt: new Date().toISOString(),
        }),
      }
    );

    revalidateTag(CUSTODIAN_CACHE_TAG);

    return {
      success: true,
      data: response,
      message: 'Custodian created successfully',
    };
  } catch (error) {
    console.error('Failed to create custodian:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create custodian',
    };
  }
}

/**
 * Update a custodian
 */
export async function updateCustodian(
  id: string,
  input: Partial<CreateCustodianInput>
): Promise<ActionResponse<Custodian>> {
  try {
    const response = await apiFetch<Custodian>(
      API_ENDPOINTS.CUSTODIANS.UPDATE(id),
      {
        method: 'PATCH',
        body: JSON.stringify({
          ...input,
          updatedAt: new Date().toISOString(),
        }),
      }
    );

    revalidateTag(CUSTODIAN_CACHE_TAG);
    revalidateTag(`custodian-${id}`);

    return {
      success: true,
      data: response,
      message: 'Custodian updated successfully',
    };
  } catch (error) {
    console.error('Failed to update custodian:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update custodian',
    };
  }
}

/**
 * Delete a custodian
 */
export async function deleteCustodian(id: string): Promise<ActionResponse<void>> {
  try {
    await apiFetch<void>(API_ENDPOINTS.CUSTODIANS.DELETE(id), {
      method: 'DELETE',
    });

    revalidateTag(CUSTODIAN_CACHE_TAG);
    revalidateTag(`custodian-${id}`);

    return {
      success: true,
      message: 'Custodian deleted successfully',
    };
  } catch (error) {
    console.error('Failed to delete custodian:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete custodian',
    };
  }
}

/**
 * Record custodian acknowledgment
 */
export async function acknowledgeLegalHold(
  custodianId: string,
  legalHoldId: string
): Promise<ActionResponse<Custodian>> {
  try {
    const response = await apiFetch<Custodian>(
      API_ENDPOINTS.CUSTODIANS.UPDATE(custodianId),
      {
        method: 'PATCH',
        body: JSON.stringify({
          legalHoldStatus: 'acknowledged',
          legalHoldId,
          acknowledgmentDate: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      }
    );

    revalidateTag(CUSTODIAN_CACHE_TAG);
    revalidateTag(LEGAL_HOLD_CACHE_TAG);

    return {
      success: true,
      data: response,
      message: 'Legal hold acknowledged',
    };
  } catch (error) {
    console.error('Failed to acknowledge legal hold:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to acknowledge legal hold',
    };
  }
}

/**
 * Record custodian interview
 */
export async function recordCustodianInterview(
  id: string,
  interviewDate: string,
  interviewNotes: string
): Promise<ActionResponse<Custodian>> {
  try {
    const response = await apiFetch<Custodian>(
      API_ENDPOINTS.CUSTODIANS.UPDATE(id),
      {
        method: 'PATCH',
        body: JSON.stringify({
          interviewDate,
          interviewNotes,
          updatedAt: new Date().toISOString(),
        }),
      }
    );

    revalidateTag(CUSTODIAN_CACHE_TAG);
    revalidateTag(`custodian-${id}`);

    return {
      success: true,
      data: response,
      message: 'Interview recorded successfully',
    };
  } catch (error) {
    console.error('Failed to record interview:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to record interview',
    };
  }
}

// ============================================================================
// Legal Hold Actions
// ============================================================================

/**
 * Get all legal holds
 */
export async function getLegalHolds(params?: {
  caseId?: string;
  status?: string;
}): Promise<ActionResponse<PaginatedResponse<LegalHold>>> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.caseId) searchParams.set('caseId', params.caseId);
    if (params?.status) searchParams.set('status', params.status);

    const queryString = searchParams.toString();
    const endpoint = `${API_ENDPOINTS.LEGAL_HOLDS.LIST}${queryString ? `?${queryString}` : ''}`;

    const response = await apiFetch<LegalHold[] | PaginatedResponse<LegalHold>>(endpoint, {
      next: { tags: [LEGAL_HOLD_CACHE_TAG] },
    });

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
    console.error('Failed to fetch legal holds:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch legal holds',
    };
  }
}

/**
 * Get a single legal hold
 */
export async function getLegalHold(id: string): Promise<ActionResponse<LegalHold>> {
  try {
    const response = await apiFetch<LegalHold>(
      API_ENDPOINTS.LEGAL_HOLDS.DETAIL(id),
      { next: { tags: [LEGAL_HOLD_CACHE_TAG, `legal-hold-${id}`] } }
    );

    return { success: true, data: response };
  } catch (error) {
    console.error('Failed to fetch legal hold:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch legal hold',
    };
  }
}

/**
 * Create a new legal hold
 */
export async function createLegalHold(
  input: CreateLegalHoldInput
): Promise<ActionResponse<LegalHold>> {
  try {
    const response = await apiFetch<LegalHold>(
      API_ENDPOINTS.LEGAL_HOLDS.CREATE,
      {
        method: 'POST',
        body: JSON.stringify({
          ...input,
          status: 'active',
          issuedDate: new Date().toISOString(),
          custodianCount: input.custodianIds.length,
          acknowledgedCount: 0,
          createdAt: new Date().toISOString(),
        }),
      }
    );

    revalidateTag(LEGAL_HOLD_CACHE_TAG);
    revalidateTag(CUSTODIAN_CACHE_TAG);

    return {
      success: true,
      data: response,
      message: 'Legal hold created successfully',
    };
  } catch (error) {
    console.error('Failed to create legal hold:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create legal hold',
    };
  }
}

/**
 * Release a legal hold
 */
export async function releaseLegalHold(id: string): Promise<ActionResponse<LegalHold>> {
  try {
    const response = await apiFetch<LegalHold>(
      API_ENDPOINTS.LEGAL_HOLDS.UPDATE(id),
      {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'released',
          releasedDate: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      }
    );

    revalidateTag(LEGAL_HOLD_CACHE_TAG);
    revalidateTag(`legal-hold-${id}`);
    revalidateTag(CUSTODIAN_CACHE_TAG);

    return {
      success: true,
      data: response,
      message: 'Legal hold released successfully',
    };
  } catch (error) {
    console.error('Failed to release legal hold:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to release legal hold',
    };
  }
}

/**
 * Send reminder to custodians who haven't acknowledged
 */
export async function sendLegalHoldReminder(id: string): Promise<ActionResponse<void>> {
  try {
    // This would typically call a separate notification endpoint
    await apiFetch<void>(
      `${API_ENDPOINTS.LEGAL_HOLDS.DETAIL(id)}/reminder`,
      { method: 'POST' }
    );

    return {
      success: true,
      message: 'Reminders sent successfully',
    };
  } catch (error) {
    console.error('Failed to send reminders:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send reminders',
    };
  }
}

/**
 * Add custodians to existing legal hold
 */
export async function addCustodiansToHold(
  holdId: string,
  custodianIds: string[]
): Promise<ActionResponse<LegalHold>> {
  try {
    const hold = await getLegalHold(holdId);
    if (!hold.success || !hold.data) {
      return { success: false, error: 'Legal hold not found' };
    }

    const updatedCustodians = [...new Set([...hold.data.custodianIds, ...custodianIds])];

    const response = await apiFetch<LegalHold>(
      API_ENDPOINTS.LEGAL_HOLDS.UPDATE(holdId),
      {
        method: 'PATCH',
        body: JSON.stringify({
          custodianIds: updatedCustodians,
          custodianCount: updatedCustodians.length,
          updatedAt: new Date().toISOString(),
        }),
      }
    );

    revalidateTag(LEGAL_HOLD_CACHE_TAG);
    revalidateTag(`legal-hold-${holdId}`);
    revalidateTag(CUSTODIAN_CACHE_TAG);

    return {
      success: true,
      data: response,
      message: 'Custodians added to legal hold',
    };
  } catch (error) {
    console.error('Failed to add custodians:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add custodians',
    };
  }
}
