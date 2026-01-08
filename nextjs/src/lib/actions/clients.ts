'use server';

/**
 * Client Server Actions
 * Next.js 16 Strict Compliance with Server Actions
 *
 * CRUD operations for clients with:
 * - Comprehensive client management
 * - Financial tracking
 * - Conflict checking
 * - Retainer management
 */

import { revalidateTag } from 'next/cache';
import type { Client } from '@/types/financial';
import type { Case } from '@/types/case';
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
  createClientSchema,
  updateClientSchema,
  clientFilterSchema,
  idInputSchema,
  CreateClientInput,
  UpdateClientInput,
  ClientFilterInput,
} from '@/lib/validation';
import {
  CacheTags,
  CacheProfiles,
  invalidateClientData,
  invalidateTags,
} from '@/lib/cache';

// ============================================================================
// Types
// ============================================================================

interface ClientSummary {
  id: string;
  name: string;
  clientNumber: string;
  status: string;
  activeCases: number;
  totalBilled: number;
  totalPaid: number;
  currentBalance: number;
}

interface ConflictCheckResult {
  hasConflict: boolean;
  conflictingEntities: Array<{
    entityId: string;
    entityType: string;
    entityName: string;
    conflictType: string;
    description: string;
  }>;
  checkDate: string;
  checkedBy: string;
}

// ============================================================================
// API Helper
// ============================================================================

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

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// ============================================================================
// Query Actions (Read Operations)
// ============================================================================

/**
 * Get all clients with optional filtering
 */
export const getClients = createQuery<ClientFilterInput | undefined, Client[]>(
  async (input, context) => {
    const params = input ? parseInput(clientFilterSchema, input) : {};

    const queryString = new URLSearchParams();
    if (params.page) queryString.set('page', String(params.page));
    if (params.pageSize) queryString.set('limit', String(params.pageSize));
    if (params.status?.length) queryString.set('status', params.status.join(','));
    if (params.clientType?.length) queryString.set('clientType', params.clientType.join(','));
    if (params.isVip !== undefined) queryString.set('isVip', String(params.isVip));
    if (params.hasRetainer !== undefined) queryString.set('hasRetainer', String(params.hasRetainer));
    if (params.searchQuery) queryString.set('search', params.searchQuery);
    if (params.sortBy) queryString.set('sortBy', params.sortBy);
    if (params.sortOrder) queryString.set('sortOrder', params.sortOrder);

    const query = queryString.toString();
    const endpoint = `/clients${query ? `?${query}` : ''}`;

    return apiRequest<Client[]>(endpoint, {
      method: 'GET',
      next: {
        tags: [CacheTags.CLIENTS],
        revalidate: CacheProfiles.DEFAULT,
      },
    }, context);
  },
  { requireAuth: false }
);

/**
 * Get a single client by ID
 */
export const getClientById = createQuery<{ id: string }, Client | null>(
  async (input, context) => {
    const { id } = parseInput(idInputSchema, input);

    try {
      return await apiRequest<Client>(`/clients/${id}`, {
        method: 'GET',
        next: {
          tags: [CacheTags.CLIENT(id)],
          revalidate: CacheProfiles.DEFAULT,
        },
      }, context);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  },
  { requireAuth: false }
);

/**
 * Get client by client number
 */
export const getClientByNumber = createQuery<{ clientNumber: string }, Client | null>(
  async (input, context) => {
    const { clientNumber } = input;

    try {
      const clients = await apiRequest<Client[]>(`/clients?clientNumber=${encodeURIComponent(clientNumber)}`, {
        method: 'GET',
        next: {
          tags: [CacheTags.CLIENTS],
          revalidate: CacheProfiles.DEFAULT,
        },
      }, context);

      return clients[0] ?? null;
    } catch {
      return null;
    }
  },
  { requireAuth: false }
);

/**
 * Get cases for a client
 */
export const getClientCases = createQuery<{ clientId: string }, Case[]>(
  async (input, context) => {
    const { clientId } = input;

    return apiRequest<Case[]>(`/cases?clientId=${clientId}`, {
      method: 'GET',
      next: {
        tags: [CacheTags.CLIENT_CASES(clientId)],
        revalidate: CacheProfiles.DEFAULT,
      },
    }, context);
  },
  { requireAuth: false }
);

/**
 * Get client summary (stats)
 */
export const getClientSummary = createQuery<{ clientId: string }, ClientSummary>(
  async (input, context) => {
    const { clientId } = input;

    return apiRequest<ClientSummary>(`/clients/${clientId}/summary`, {
      method: 'GET',
      next: {
        tags: [CacheTags.CLIENT(clientId)],
        revalidate: CacheProfiles.FAST,
      },
    }, context);
  },
  { requireAuth: false }
);

/**
 * Search clients
 */
export const searchClients = createQuery<
  { query: string; limit?: number },
  Client[]
>(
  async (input, context) => {
    const { query, limit = 10 } = input;

    if (!query.trim()) {
      return [];
    }

    return apiRequest<Client[]>(`/clients?search=${encodeURIComponent(query.trim())}&limit=${limit}`, {
      method: 'GET',
      next: {
        tags: [CacheTags.CLIENTS],
        revalidate: CacheProfiles.FAST,
      },
    }, context);
  },
  { requireAuth: false }
);

/**
 * Get VIP clients
 */
export const getVIPClients = createQuery<undefined, Client[]>(
  async (_, context) => {
    return apiRequest<Client[]>('/clients?isVip=true', {
      method: 'GET',
      next: {
        tags: [CacheTags.CLIENTS],
        revalidate: CacheProfiles.DEFAULT,
      },
    }, context);
  },
  { requireAuth: false }
);

/**
 * Get clients with retainers
 */
export const getClientsWithRetainers = createQuery<undefined, Client[]>(
  async (_, context) => {
    return apiRequest<Client[]>('/clients?hasRetainer=true', {
      method: 'GET',
      next: {
        tags: [CacheTags.CLIENTS],
        revalidate: CacheProfiles.DEFAULT,
      },
    }, context);
  },
  { requireAuth: false }
);

// ============================================================================
// Mutation Actions (Write Operations)
// ============================================================================

/**
 * Create a new client
 */
export const createClient = createMutation<CreateClientInput, Client>(
  async (input, context) => {
    const validated = parseInput(createClientSchema, input);

    const newClient = await apiRequest<Client>('/clients', {
      method: 'POST',
      body: JSON.stringify(validated),
    }, context);

    revalidateTag(CacheTags.CLIENTS);

    return newClient;
  },
  {
    revalidateTags: [CacheTags.CLIENTS],
    auditLog: true,
  }
);

/**
 * Update an existing client
 */
export const updateClient = createMutation<UpdateClientInput, Client>(
  async (input, context) => {
    const validated = parseInput(updateClientSchema, input);
    const { id, ...data } = validated;

    const updatedClient = await apiRequest<Client>(`/clients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, context);

    invalidateClientData(id);

    return updatedClient;
  },
  { auditLog: true }
);

/**
 * Delete a client
 */
export const deleteClient = createMutation<{ id: string }, { success: boolean }>(
  async (input, context) => {
    const { id } = parseInput(idInputSchema, input);

    await apiRequest<void>(`/clients/${id}`, {
      method: 'DELETE',
    }, context);

    invalidateClientData(id);

    return { success: true };
  },
  {
    revalidateTags: [CacheTags.CLIENTS],
    auditLog: true,
  }
);

/**
 * Update client status
 */
export const updateClientStatus = createMutation<
  { id: string; status: 'active' | 'inactive' | 'prospective' | 'former' | 'blocked' },
  Client
>(
  async (input, context) => {
    const { id, status } = input;

    const updatedClient = await apiRequest<Client>(`/clients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }, context);

    invalidateClientData(id);

    return updatedClient;
  },
  { auditLog: true }
);

/**
 * Mark client as VIP
 */
export const setClientVIP = createMutation<
  { id: string; isVip: boolean },
  Client
>(
  async (input, context) => {
    const { id, isVip } = input;

    const updatedClient = await apiRequest<Client>(`/clients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isVip }),
    }, context);

    invalidateClientData(id);

    return updatedClient;
  },
  { auditLog: true }
);

/**
 * Run conflict check for client
 */
export const runConflictCheck = createMutation<
  { clientId: string; checkAgainst?: string[] },
  ConflictCheckResult
>(
  async (input, context) => {
    const { clientId, checkAgainst } = input;

    const result = await apiRequest<ConflictCheckResult>('/compliance/conflicts/run', {
      method: 'POST',
      body: JSON.stringify({ clientId, checkAgainst }),
    }, context);

    // Update client with conflict check date
    await apiRequest<void>(`/clients/${clientId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        lastConflictCheckDate: new Date().toISOString(),
        conflictCheckCompleted: true,
      }),
    }, context);

    invalidateClientData(clientId);

    return result;
  },
  { auditLog: true }
);

/**
 * Update retainer information
 */
export const updateRetainer = createMutation<
  { clientId: string; hasRetainer: boolean; retainerAmount?: number; retainerBalance?: number },
  Client
>(
  async (input, context) => {
    const { clientId, ...retainerData } = input;

    const updatedClient = await apiRequest<Client>(`/clients/${clientId}`, {
      method: 'PATCH',
      body: JSON.stringify(retainerData),
    }, context);

    invalidateClientData(clientId);

    return updatedClient;
  },
  { auditLog: true }
);

/**
 * Update client credit limit
 */
export const updateCreditLimit = createMutation<
  { clientId: string; creditLimit: number },
  Client
>(
  async (input, context) => {
    const { clientId, creditLimit } = input;

    const updatedClient = await apiRequest<Client>(`/clients/${clientId}`, {
      method: 'PATCH',
      body: JSON.stringify({ creditLimit }),
    }, context);

    invalidateClientData(clientId);

    return updatedClient;
  },
  { auditLog: true }
);

/**
 * Update primary contact
 */
export const updatePrimaryContact = createMutation<
  {
    clientId: string;
    primaryContactName?: string;
    primaryContactEmail?: string;
    primaryContactPhone?: string;
    primaryContactTitle?: string;
  },
  Client
>(
  async (input, context) => {
    const { clientId, ...contactData } = input;

    const updatedClient = await apiRequest<Client>(`/clients/${clientId}`, {
      method: 'PATCH',
      body: JSON.stringify(contactData),
    }, context);

    invalidateClientData(clientId);

    return updatedClient;
  },
  { auditLog: true }
);

/**
 * Update billing address
 */
export const updateBillingAddress = createMutation<
  {
    clientId: string;
    billingAddress?: string;
    billingCity?: string;
    billingState?: string;
    billingZipCode?: string;
    billingCountry?: string;
  },
  Client
>(
  async (input, context) => {
    const { clientId, ...addressData } = input;

    const updatedClient = await apiRequest<Client>(`/clients/${clientId}`, {
      method: 'PATCH',
      body: JSON.stringify(addressData),
    }, context);

    invalidateClientData(clientId);

    return updatedClient;
  },
  { auditLog: true }
);

/**
 * Generate client portal access
 */
export const generatePortalAccess = createMutation<
  { clientId: string },
  { portalUrl: string; token: string; expiresAt: string }
>(
  async (input, context) => {
    const { clientId } = input;

    const result = await apiRequest<{ portalUrl: string; token: string; expiresAt: string }>(
      `/client-portal/${clientId}/access`,
      {
        method: 'POST',
      },
      context
    );

    invalidateClientData(clientId);

    return result;
  },
  { auditLog: true }
);

// ============================================================================
// Bulk Operations
// ============================================================================

/**
 * Delete multiple clients
 */
export const deleteClients = createMutation<
  { ids: string[] },
  { success: boolean; count: number }
>(
  async (input, context) => {
    const { ids } = input;

    await Promise.all(
      ids.map((id) =>
        apiRequest<void>(`/clients/${id}`, { method: 'DELETE' }, context)
      )
    );

    invalidateTags([CacheTags.CLIENTS, ...ids.map((id) => CacheTags.CLIENT(id))]);

    return { success: true, count: ids.length };
  },
  {
    revalidateTags: [CacheTags.CLIENTS],
    auditLog: true,
  }
);

/**
 * Update status for multiple clients
 */
export const updateClientsStatus = createMutation<
  { ids: string[]; status: 'active' | 'inactive' | 'former' | 'blocked' },
  { success: boolean; count: number }
>(
  async (input, context) => {
    const { ids, status } = input;

    await Promise.all(
      ids.map((id) =>
        apiRequest<Client>(`/clients/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({ status }),
        }, context)
      )
    );

    invalidateTags([CacheTags.CLIENTS, ...ids.map((id) => CacheTags.CLIENT(id))]);

    return { success: true, count: ids.length };
  },
  { auditLog: true }
);

// ============================================================================
// Form Actions
// ============================================================================

/**
 * Form action for creating a client
 */
export async function createClientFormAction(
  prevState: ActionResult<Client> | null,
  formData: FormData
): Promise<ActionResult<Client>> {
  const data: Record<string, unknown> = {};

  // String fields
  const stringFields = [
    'clientNumber', 'name', 'clientType', 'status',
    'email', 'phone', 'fax', 'website',
    'address', 'city', 'state', 'zipCode', 'country',
    'billingAddress', 'billingCity', 'billingState', 'billingZipCode', 'billingCountry',
    'taxId', 'industry',
    'primaryContactName', 'primaryContactEmail', 'primaryContactPhone', 'primaryContactTitle',
    'paymentTerms', 'preferredPaymentMethod',
    'notes',
  ];

  for (const field of stringFields) {
    const value = formData.get(field);
    if (value !== null && value !== '') {
      data[field] = value;
    }
  }

  // Numeric fields
  const numericFields = ['creditLimit', 'retainerAmount'];
  for (const field of numericFields) {
    const value = formData.get(field);
    if (value && value !== '') {
      data[field] = parseFloat(value as string);
    }
  }

  // Boolean fields
  const booleanFields = ['isVip', 'requiresConflictCheck', 'hasRetainer'];
  for (const field of booleanFields) {
    const value = formData.get(field);
    data[field] = value === 'true' || value === 'on';
  }

  // Tags
  const tags = formData.get('tags');
  if (tags) {
    try {
      data.tags = JSON.parse(tags as string);
    } catch {
      data.tags = (tags as string).split(',').map((t) => t.trim()).filter(Boolean);
    }
  }

  return createClient(data as CreateClientInput);
}

/**
 * Form action for updating a client
 */
export async function updateClientFormAction(
  prevState: ActionResult<Client> | null,
  formData: FormData
): Promise<ActionResult<Client>> {
  const id = formData.get('id') as string;

  if (!id) {
    return failure('Client ID is required', 'VALIDATION_ERROR');
  }

  const data: Record<string, unknown> = { id };

  // String fields
  const stringFields = [
    'clientNumber', 'name', 'clientType', 'status',
    'email', 'phone', 'fax', 'website',
    'address', 'city', 'state', 'zipCode', 'country',
    'billingAddress', 'billingCity', 'billingState', 'billingZipCode', 'billingCountry',
    'taxId', 'industry',
    'primaryContactName', 'primaryContactEmail', 'primaryContactPhone', 'primaryContactTitle',
    'paymentTerms', 'preferredPaymentMethod',
    'notes',
  ];

  for (const field of stringFields) {
    const value = formData.get(field);
    if (value !== null && value !== '') {
      data[field] = value;
    }
  }

  // Numeric fields
  const numericFields = ['creditLimit', 'retainerAmount', 'retainerBalance'];
  for (const field of numericFields) {
    const value = formData.get(field);
    if (value && value !== '') {
      data[field] = parseFloat(value as string);
    }
  }

  // Boolean fields
  const booleanFields = ['isVip', 'requiresConflictCheck', 'hasRetainer'];
  for (const field of booleanFields) {
    const value = formData.get(field);
    if (value !== null) {
      data[field] = value === 'true' || value === 'on';
    }
  }

  return updateClient(data as UpdateClientInput);
}

/**
 * Form action for deleting a client
 */
export async function deleteClientFormAction(
  prevState: ActionResult<{ success: boolean }> | null,
  formData: FormData
): Promise<ActionResult<{ success: boolean }>> {
  const id = formData.get('id') as string;

  if (!id) {
    return failure('Client ID is required', 'VALIDATION_ERROR');
  }

  return deleteClient({ id });
}
