'use server';

/**
 * Case Server Actions
 * Next.js 16 Strict Compliance with Server Actions
 *
 * CRUD operations for cases with:
 * - Proper validation using Zod schemas
 * - Authentication requirements
 * - Cache invalidation
 * - Error handling
 */

import { revalidateTag } from 'next/cache';
import type { Case, Party } from '@/types/case';
import { API_BASE_URL } from '@/lib/api-config';
import {
  createAction,
  createMutation,
  createQuery,
  parseInput,
  ActionResult,
  success,
  failure,
  ActionContext,
  getActionContext,
} from './index';
import {
  createCaseSchema,
  updateCaseSchema,
  caseFilterSchema,
  idInputSchema,
  CreateCaseInput,
  UpdateCaseInput,
  CaseFilterInput,
} from '@/lib/validation';
import {
  CacheTags,
  CacheProfiles,
  invalidateCaseData,
  invalidateTags,
} from '@/lib/cache';

// ============================================================================
// API Helper
// ============================================================================

/**
 * Make authenticated API request to backend
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  context?: ActionContext
): Promise<T> {
  const ctx = context ?? await getActionContext();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(ctx.userId && { 'X-User-Id': ctx.userId }),
      ...(ctx.organizationId && { 'X-Organization-Id': ctx.organizationId }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `API error: ${response.status}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// ============================================================================
// Query Actions (Read Operations)
// ============================================================================

/**
 * Get all cases with optional filtering
 */
export const getCases = createQuery<CaseFilterInput | undefined, Case[]>(
  async (input, context) => {
    const params = input ? parseInput(caseFilterSchema, input) : {};

    const queryString = new URLSearchParams();
    if (params.page) queryString.set('page', String(params.page));
    if (params.pageSize) queryString.set('limit', String(params.pageSize));
    if (params.status?.length) queryString.set('status', params.status.join(','));
    if (params.matterType?.length) queryString.set('type', params.matterType.join(','));
    if (params.clientId) queryString.set('clientId', params.clientId);
    if (params.searchQuery) queryString.set('search', params.searchQuery);
    if (params.sortBy) queryString.set('sortBy', params.sortBy);
    if (params.sortOrder) queryString.set('sortOrder', params.sortOrder);

    const query = queryString.toString();
    const endpoint = `/cases${query ? `?${query}` : ''}`;

    return apiRequest<Case[]>(endpoint, {
      method: 'GET',
      next: {
        tags: [CacheTags.CASES],
        revalidate: CacheProfiles.DEFAULT,
      },
    }, context);
  },
  { requireAuth: false }
);

/**
 * Get a single case by ID
 */
export const getCaseById = createQuery<{ id: string }, Case | null>(
  async (input, context) => {
    const { id } = parseInput(idInputSchema, input);

    try {
      return await apiRequest<Case>(`/cases/${id}`, {
        method: 'GET',
        next: {
          tags: [CacheTags.CASE(id)],
          revalidate: CacheProfiles.DEFAULT,
        },
      }, context);
    } catch (error) {
      // Return null for 404s so page can handle with notFound()
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  },
  { requireAuth: false }
);

/**
 * Get case parties
 */
export const getCaseParties = createQuery<{ caseId: string }, Party[]>(
  async (input, context) => {
    const { id: caseId } = parseInput(idInputSchema, { id: input.caseId });

    return apiRequest<Party[]>(`/cases/${caseId}/parties`, {
      method: 'GET',
      next: {
        tags: [CacheTags.CASE_PARTIES(caseId)],
        revalidate: CacheProfiles.DEFAULT,
      },
    }, context);
  },
  { requireAuth: false }
);

/**
 * Search cases by query
 */
export const searchCases = createQuery<{ query: string; limit?: number }, Case[]>(
  async (input, context) => {
    const query = input.query.trim();
    const limit = input.limit ?? 10;

    if (!query) {
      return [];
    }

    return apiRequest<Case[]>(`/search/cases?q=${encodeURIComponent(query)}&limit=${limit}`, {
      method: 'GET',
      next: {
        tags: [CacheTags.CASES],
        revalidate: CacheProfiles.FAST,
      },
    }, context);
  },
  { requireAuth: false }
);

// ============================================================================
// Mutation Actions (Write Operations)
// ============================================================================

/**
 * Create a new case
 */
export const createCase = createMutation<CreateCaseInput, Case>(
  async (input, context) => {
    const validated = parseInput(createCaseSchema, input);

    const newCase = await apiRequest<Case>('/cases', {
      method: 'POST',
      body: JSON.stringify(validated),
    }, context);

    // Invalidate cases list cache
    revalidateTag(CacheTags.CASES);

    // Invalidate client cases if clientId provided
    if (validated.clientId) {
      revalidateTag(CacheTags.CLIENT_CASES(validated.clientId));
    }

    return newCase;
  },
  {
    revalidateTags: [CacheTags.CASES],
    auditLog: true,
  }
);

/**
 * Update an existing case
 */
export const updateCase = createMutation<UpdateCaseInput, Case>(
  async (input, context) => {
    const validated = parseInput(updateCaseSchema, input);
    const { id, ...data } = validated;

    const updatedCase = await apiRequest<Case>(`/cases/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, context);

    // Invalidate case-specific and list caches
    invalidateCaseData(id);

    return updatedCase;
  },
  { auditLog: true }
);

/**
 * Delete a case (soft delete)
 */
export const deleteCase = createMutation<{ id: string }, { success: boolean }>(
  async (input, context) => {
    const { id } = parseInput(idInputSchema, input);

    await apiRequest<void>(`/cases/${id}`, {
      method: 'DELETE',
    }, context);

    // Invalidate caches
    invalidateCaseData(id);

    return { success: true };
  },
  {
    revalidateTags: [CacheTags.CASES],
    auditLog: true,
  }
);

/**
 * Archive a case
 */
export const archiveCase = createMutation<{ id: string }, Case>(
  async (input, context) => {
    const { id } = parseInput(idInputSchema, input);

    const archivedCase = await apiRequest<Case>(`/cases/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isArchived: true, status: 'Archived' }),
    }, context);

    invalidateCaseData(id);

    return archivedCase;
  },
  { auditLog: true }
);

/**
 * Restore an archived case
 */
export const restoreCase = createMutation<{ id: string }, Case>(
  async (input, context) => {
    const { id } = parseInput(idInputSchema, input);

    const restoredCase = await apiRequest<Case>(`/cases/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isArchived: false, status: 'Active' }),
    }, context);

    invalidateCaseData(id);

    return restoredCase;
  },
  { auditLog: true }
);

/**
 * Update case status
 */
export const updateCaseStatus = createMutation<
  { id: string; status: string },
  Case
>(
  async (input, context) => {
    const { id } = parseInput(idInputSchema, { id: input.id });

    const updatedCase = await apiRequest<Case>(`/cases/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: input.status }),
    }, context);

    invalidateCaseData(id);

    return updatedCase;
  },
  { auditLog: true }
);

/**
 * Assign lead attorney to case
 */
export const assignLeadAttorney = createMutation<
  { caseId: string; attorneyId: string },
  Case
>(
  async (input, context) => {
    const { caseId, attorneyId } = input;

    const updatedCase = await apiRequest<Case>(`/cases/${caseId}`, {
      method: 'PATCH',
      body: JSON.stringify({ leadAttorneyId: attorneyId }),
    }, context);

    invalidateCaseData(caseId);

    return updatedCase;
  },
  { auditLog: true }
);

/**
 * Add party to case
 */
export const addPartyToCase = createMutation<
  { caseId: string; party: Omit<Party, 'id' | 'caseId' | 'createdAt' | 'updatedAt'> },
  Party
>(
  async (input, context) => {
    const { caseId, party } = input;

    const newParty = await apiRequest<Party>(`/parties`, {
      method: 'POST',
      body: JSON.stringify({ ...party, caseId }),
    }, context);

    // Invalidate case parties cache
    revalidateTag(CacheTags.CASE_PARTIES(caseId));
    revalidateTag(CacheTags.PARTIES);

    return newParty;
  },
  { auditLog: true }
);

/**
 * Remove party from case
 */
export const removePartyFromCase = createMutation<
  { caseId: string; partyId: string },
  { success: boolean }
>(
  async (input, context) => {
    const { caseId, partyId } = input;

    await apiRequest<void>(`/parties/${partyId}`, {
      method: 'DELETE',
    }, context);

    // Invalidate case parties cache
    revalidateTag(CacheTags.CASE_PARTIES(caseId));
    revalidateTag(CacheTags.PARTIES);

    return { success: true };
  },
  { auditLog: true }
);

// ============================================================================
// Bulk Operations
// ============================================================================

/**
 * Delete multiple cases
 */
export const deleteCases = createMutation<{ ids: string[] }, { success: boolean; count: number }>(
  async (input, context) => {
    const { ids } = input;

    // Delete each case
    await Promise.all(
      ids.map((id) =>
        apiRequest<void>(`/cases/${id}`, { method: 'DELETE' }, context)
      )
    );

    // Invalidate all affected caches
    invalidateTags([CacheTags.CASES, ...ids.map((id) => CacheTags.CASE(id))]);

    return { success: true, count: ids.length };
  },
  {
    revalidateTags: [CacheTags.CASES],
    auditLog: true,
  }
);

/**
 * Archive multiple cases
 */
export const archiveCases = createMutation<{ ids: string[] }, { success: boolean; count: number }>(
  async (input, context) => {
    const { ids } = input;

    await Promise.all(
      ids.map((id) =>
        apiRequest<Case>(`/cases/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({ isArchived: true, status: 'Archived' }),
        }, context)
      )
    );

    invalidateTags([CacheTags.CASES, ...ids.map((id) => CacheTags.CASE(id))]);

    return { success: true, count: ids.length };
  },
  { auditLog: true }
);

// ============================================================================
// Form Actions (for use with <form action={...}>)
// ============================================================================

/**
 * Form action for creating a case
 */
export async function createCaseFormAction(
  prevState: ActionResult<Case> | null,
  formData: FormData
): Promise<ActionResult<Case>> {
  const data: Record<string, unknown> = {};

  // Extract form fields
  const fields = [
    'title', 'description', 'caseNumber', 'type', 'status',
    'practiceArea', 'jurisdiction', 'court', 'judge',
    'filingDate', 'trialDate', 'clientId', 'client',
    'leadAttorneyId', 'billingModel', 'matterType',
  ];

  for (const field of fields) {
    const value = formData.get(field);
    if (value !== null && value !== '') {
      data[field] = value;
    }
  }

  // Handle numeric fields
  const valueField = formData.get('value');
  if (valueField && valueField !== '') {
    data.value = parseFloat(valueField as string);
  }

  // Handle tags array
  const tags = formData.get('tags');
  if (tags) {
    try {
      data.tags = JSON.parse(tags as string);
    } catch {
      data.tags = (tags as string).split(',').map((t) => t.trim()).filter(Boolean);
    }
  }

  return createCase(data as CreateCaseInput);
}

/**
 * Form action for updating a case
 */
export async function updateCaseFormAction(
  prevState: ActionResult<Case> | null,
  formData: FormData
): Promise<ActionResult<Case>> {
  const id = formData.get('id') as string;

  if (!id) {
    return failure('Case ID is required', 'VALIDATION_ERROR');
  }

  const data: Record<string, unknown> = { id };

  // Extract form fields
  const fields = [
    'title', 'description', 'caseNumber', 'type', 'status',
    'practiceArea', 'jurisdiction', 'court', 'judge',
    'filingDate', 'trialDate', 'clientId', 'client',
    'leadAttorneyId', 'billingModel', 'matterType',
  ];

  for (const field of fields) {
    const value = formData.get(field);
    if (value !== null && value !== '') {
      data[field] = value;
    }
  }

  // Handle numeric fields
  const valueField = formData.get('value');
  if (valueField && valueField !== '') {
    data.value = parseFloat(valueField as string);
  }

  return updateCase(data as UpdateCaseInput);
}

/**
 * Form action for deleting a case
 */
export async function deleteCaseFormAction(
  prevState: ActionResult<{ success: boolean }> | null,
  formData: FormData
): Promise<ActionResult<{ success: boolean }>> {
  const id = formData.get('id') as string;

  if (!id) {
    return failure('Case ID is required', 'VALIDATION_ERROR');
  }

  return deleteCase({ id });
}
