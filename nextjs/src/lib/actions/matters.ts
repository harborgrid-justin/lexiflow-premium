"use server";

/**
 * Matter Server Actions
 * Next.js 16 Strict Compliance with Server Actions
 *
 * CRUD operations for matters with:
 * - Matter lifecycle management
 * - Financial tracking
 * - Case linking
 * - Conflict check integration
 */

import { API_BASE_URL } from "@/lib/api-config";
import { CacheProfiles, CacheTags, invalidateTags } from "@/lib/cache";
import {
  CreateMatterInput,
  createMatterSchema,
  idInputSchema,
  MatterFilterInput,
  matterFilterSchema,
  UpdateMatterInput,
  updateMatterSchema,
} from "@/lib/validation";
import type { Matter } from "@/types/case";
import { revalidateTag } from "next/cache";
import { createMutation, createQuery } from "./helpers";
import type { ActionContext, ActionResult } from "./index";
import { failure, getActionContext, parseInput } from "./index";

// ============================================================================
// Types
// ============================================================================

interface MatterSummary {
  id: string;
  matterNumber: string;
  title: string;
  status: string;
  totalBilled: number;
  totalCollected: number;
  unbilledTime: number;
  unbilledExpenses: number;
  budgetRemaining?: number;
}

interface MatterFinancials {
  matterId: string;
  totalTimeEntries: number;
  totalExpenses: number;
  totalBilled: number;
  totalPaid: number;
  outstandingBalance: number;
  budgetAmount?: number;
  budgetUsedPercent?: number;
}

// ============================================================================
// API Helper
// ============================================================================

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  context?: ActionContext
): Promise<T> {
  const ctx = context ?? (await getActionContext());

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(ctx.userId && { "X-User-Id": ctx.userId }),
      ...(ctx.organizationId && { "X-Organization-Id": ctx.organizationId }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || `API error: ${response.status}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// ============================================================================
// Cache Helpers
// ============================================================================

function invalidateMatterData(matterId: string): void {
  invalidateTags([CacheTags.MATTERS, CacheTags.MATTER(matterId)]);
}

// ============================================================================
// Query Actions (Read Operations)
// ============================================================================

/**
 * Get all matters with optional filtering
 */
export const getMatters = createQuery<MatterFilterInput | undefined, Matter[]>(
  async (input, context) => {
    const params = input ? parseInput(matterFilterSchema, input) : {};

    const queryString = new URLSearchParams();
    if (params.page) queryString.set("page", String(params.page));
    if (params.pageSize) queryString.set("limit", String(params.pageSize));
    if (params.status?.length)
      queryString.set("status", params.status.join(","));
    if (params.matterType?.length)
      queryString.set("type", params.matterType.join(","));
    if (params.priority?.length)
      queryString.set("priority", params.priority.join(","));
    if (params.clientId) queryString.set("clientId", params.clientId);
    if (params.leadAttorneyId)
      queryString.set("leadAttorneyId", params.leadAttorneyId);
    if (params.practiceArea)
      queryString.set("practiceArea", params.practiceArea);
    if (params.searchQuery) queryString.set("search", params.searchQuery);
    if (params.sortBy) queryString.set("sortBy", params.sortBy);
    if (params.sortOrder) queryString.set("sortOrder", params.sortOrder);

    const query = queryString.toString();
    const endpoint = `/matters${query ? `?${query}` : ""}`;

    return apiRequest<Matter[]>(
      endpoint,
      {
        method: "GET",
        next: {
          tags: [CacheTags.MATTERS],
          revalidate: CacheProfiles.DEFAULT,
        },
      },
      context
    );
  },
  { requireAuth: false }
);

/**
 * Get a single matter by ID
 */
export const getMatterById = createQuery<{ id: string }, Matter | null>(
  async (input, context) => {
    const { id } = parseInput(idInputSchema, input);

    try {
      return await apiRequest<Matter>(
        `/matters/${id}`,
        {
          method: "GET",
          next: {
            tags: [CacheTags.MATTER(id)],
            revalidate: CacheProfiles.DEFAULT,
          },
        },
        context
      );
    } catch (error) {
      if (error instanceof Error && error.message.includes("404")) {
        return null;
      }
      throw error;
    }
  },
  { requireAuth: false }
);

/**
 * Get matter by matter number
 */
export const getMatterByNumber = createQuery<
  { matterNumber: string },
  Matter | null
>(
  async (input, context) => {
    const { matterNumber } = input;

    try {
      const matters = await apiRequest<Matter[]>(
        `/matters?matterNumber=${encodeURIComponent(matterNumber)}`,
        {
          method: "GET",
          next: {
            tags: [CacheTags.MATTERS],
            revalidate: CacheProfiles.DEFAULT,
          },
        },
        context
      );

      return matters[0] ?? null;
    } catch {
      return null;
    }
  },
  { requireAuth: false }
);

/**
 * Get matter summary (financial stats)
 */
export const getMatterSummary = createQuery<
  { matterId: string },
  MatterSummary
>(
  async (input, context) => {
    const { matterId } = input;

    return apiRequest<MatterSummary>(
      `/matters/${matterId}/summary`,
      {
        method: "GET",
        next: {
          tags: [CacheTags.MATTER(matterId)],
          revalidate: CacheProfiles.FAST,
        },
      },
      context
    );
  },
  { requireAuth: false }
);

/**
 * Get matter financials
 */
export const getMatterFinancials = createQuery<
  { matterId: string },
  MatterFinancials
>(
  async (input, context) => {
    const { matterId } = input;

    return apiRequest<MatterFinancials>(
      `/matters/${matterId}/financials`,
      {
        method: "GET",
        next: {
          tags: [CacheTags.MATTER(matterId)],
          revalidate: CacheProfiles.FAST,
        },
      },
      context
    );
  },
  { requireAuth: false }
);

/**
 * Get matters by client
 */
export const getMattersByClient = createQuery<{ clientId: string }, Matter[]>(
  async (input, context) => {
    const { clientId } = input;

    return apiRequest<Matter[]>(
      `/matters?clientId=${clientId}`,
      {
        method: "GET",
        next: {
          tags: [CacheTags.MATTERS, CacheTags.CLIENT_CASES(clientId)],
          revalidate: CacheProfiles.DEFAULT,
        },
      },
      context
    );
  },
  { requireAuth: false }
);

/**
 * Get matters by lead attorney
 */
export const getMattersByAttorney = createQuery<
  { attorneyId: string },
  Matter[]
>(
  async (input, context) => {
    const { attorneyId } = input;

    return apiRequest<Matter[]>(
      `/matters?leadAttorneyId=${attorneyId}`,
      {
        method: "GET",
        next: {
          tags: [CacheTags.MATTERS],
          revalidate: CacheProfiles.DEFAULT,
        },
      },
      context
    );
  },
  { requireAuth: false }
);

/**
 * Search matters
 */
export const searchMatters = createQuery<
  { query: string; limit?: number },
  Matter[]
>(
  async (input, context) => {
    const { query, limit = 10 } = input;

    if (!query.trim()) {
      return [];
    }

    return apiRequest<Matter[]>(
      `/matters?search=${encodeURIComponent(query.trim())}&limit=${limit}`,
      {
        method: "GET",
        next: {
          tags: [CacheTags.MATTERS],
          revalidate: CacheProfiles.FAST,
        },
      },
      context
    );
  },
  { requireAuth: false }
);

/**
 * Get active matters
 */
export const getActiveMatters = createQuery<undefined, Matter[]>(
  async (_, context) => {
    return apiRequest<Matter[]>(
      "/matters?status=ACTIVE",
      {
        method: "GET",
        next: {
          tags: [CacheTags.MATTERS],
          revalidate: CacheProfiles.DEFAULT,
        },
      },
      context
    );
  },
  { requireAuth: false }
);

/**
 * Get matters with pending conflict checks
 */
export const getMattersNeedingConflictCheck = createQuery<undefined, Matter[]>(
  async (_, context) => {
    return apiRequest<Matter[]>(
      "/matters?conflictCheckCompleted=false",
      {
        method: "GET",
        next: {
          tags: [CacheTags.MATTERS],
          revalidate: CacheProfiles.DEFAULT,
        },
      },
      context
    );
  },
  { requireAuth: false }
);

// ============================================================================
// Mutation Actions (Write Operations)
// ============================================================================

/**
 * Create a new matter
 */
export const createMatter = createMutation<CreateMatterInput, Matter>(
  async (input, context) => {
    const validated = parseInput(createMatterSchema, input);

    const newMatter = await apiRequest<Matter>(
      "/matters",
      {
        method: "POST",
        body: JSON.stringify(validated),
      },
      context
    );

    revalidateTag(CacheTags.MATTERS);

    // Invalidate client matters if clientId provided
    if (validated.clientId) {
      revalidateTag(CacheTags.CLIENT_CASES(validated.clientId));
    }

    return newMatter;
  },
  {
    revalidateTags: [CacheTags.MATTERS],
    auditLog: true,
  }
);

/**
 * Update an existing matter
 */
export const updateMatter = createMutation<UpdateMatterInput, Matter>(
  async (input, context) => {
    const validated = parseInput(updateMatterSchema, input);
    const { id, ...data } = validated;

    const updatedMatter = await apiRequest<Matter>(
      `/matters/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
      context
    );

    invalidateMatterData(id);

    return updatedMatter;
  },
  { auditLog: true }
);

/**
 * Delete a matter
 */
export const deleteMatter = createMutation<
  { id: string },
  { success: boolean }
>(
  async (input, context) => {
    const { id } = parseInput(idInputSchema, input);

    await apiRequest<void>(
      `/matters/${id}`,
      {
        method: "DELETE",
      },
      context
    );

    invalidateMatterData(id);

    return { success: true };
  },
  {
    revalidateTags: [CacheTags.MATTERS],
    auditLog: true,
  }
);

/**
 * Update matter status
 */
export const updateMatterStatus = createMutation<
  {
    id: string;
    status: "INTAKE" | "ACTIVE" | "PENDING" | "ON_HOLD" | "CLOSED" | "ARCHIVED";
  },
  Matter
>(
  async (input, context) => {
    const { id, status } = input;

    const updatedMatter = await apiRequest<Matter>(
      `/matters/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify({ status }),
      },
      context
    );

    invalidateMatterData(id);

    return updatedMatter;
  },
  { auditLog: true }
);

/**
 * Update matter priority
 */
export const updateMatterPriority = createMutation<
  { id: string; priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT" },
  Matter
>(
  async (input, context) => {
    const { id, priority } = input;

    const updatedMatter = await apiRequest<Matter>(
      `/matters/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify({ priority }),
      },
      context
    );

    invalidateMatterData(id);

    return updatedMatter;
  },
  { auditLog: true }
);

/**
 * Assign lead attorney
 */
export const assignMatterLeadAttorney = createMutation<
  { matterId: string; attorneyId: string; attorneyName?: string },
  Matter
>(
  async (input, context) => {
    const { matterId, attorneyId, attorneyName } = input;

    const updatedMatter = await apiRequest<Matter>(
      `/matters/${matterId}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          leadAttorneyId: attorneyId,
          leadAttorneyName: attorneyName,
        }),
      },
      context
    );

    invalidateMatterData(matterId);

    return updatedMatter;
  },
  { auditLog: true }
);

/**
 * Complete conflict check
 */
export const completeMatterConflictCheck = createMutation<
  { matterId: string; notes?: string },
  Matter
>(
  async (input, context) => {
    const { matterId, notes } = input;

    const updatedMatter = await apiRequest<Matter>(
      `/matters/${matterId}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          conflictCheckCompleted: true,
          conflictCheckDate: new Date().toISOString().split("T")[0],
          conflictCheckNotes: notes,
        }),
      },
      context
    );

    invalidateMatterData(matterId);

    return updatedMatter;
  },
  { auditLog: true }
);

/**
 * Update matter budget
 */
export const updateMatterBudget = createMutation<
  { matterId: string; budgetAmount: number },
  Matter
>(
  async (input, context) => {
    const { matterId, budgetAmount } = input;

    const updatedMatter = await apiRequest<Matter>(
      `/matters/${matterId}`,
      {
        method: "PATCH",
        body: JSON.stringify({ budgetAmount }),
      },
      context
    );

    invalidateMatterData(matterId);

    return updatedMatter;
  },
  { auditLog: true }
);

/**
 * Update billing configuration
 */
export const updateMatterBilling = createMutation<
  {
    matterId: string;
    billingType?: string;
    hourlyRate?: number;
    flatFee?: number;
    contingencyPercentage?: number;
    retainerAmount?: number;
  },
  Matter
>(
  async (input, context) => {
    const { matterId, ...billingData } = input;

    const updatedMatter = await apiRequest<Matter>(
      `/matters/${matterId}`,
      {
        method: "PATCH",
        body: JSON.stringify(billingData),
      },
      context
    );

    invalidateMatterData(matterId);

    return updatedMatter;
  },
  { auditLog: true }
);

/**
 * Close a matter
 */
export const closeMatter = createMutation<
  { id: string; closeDate?: string },
  Matter
>(
  async (input, context) => {
    const { id, closeDate } = input;

    const updatedMatter = await apiRequest<Matter>(
      `/matters/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          status: "CLOSED",
          closedDate: closeDate ?? new Date().toISOString().split("T")[0],
        }),
      },
      context
    );

    invalidateMatterData(id);

    return updatedMatter;
  },
  { auditLog: true }
);

/**
 * Reopen a closed matter
 */
export const reopenMatter = createMutation<{ id: string }, Matter>(
  async (input, context) => {
    const { id } = parseInput(idInputSchema, input);

    const updatedMatter = await apiRequest<Matter>(
      `/matters/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          status: "ACTIVE",
          closedDate: null,
        }),
      },
      context
    );

    invalidateMatterData(id);

    return updatedMatter;
  },
  { auditLog: true }
);

/**
 * Archive a matter
 */
export const archiveMatter = createMutation<{ id: string }, Matter>(
  async (input, context) => {
    const { id } = parseInput(idInputSchema, input);

    const updatedMatter = await apiRequest<Matter>(
      `/matters/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          status: "ARCHIVED",
          isArchived: true,
        }),
      },
      context
    );

    invalidateMatterData(id);

    return updatedMatter;
  },
  { auditLog: true }
);

/**
 * Link case to matter
 */
export const linkCaseToMatter = createMutation<
  { matterId: string; caseId: string },
  Matter
>(
  async (input, context) => {
    const { matterId, caseId } = input;

    // Get current matter to get existing linked cases
    const matter = await apiRequest<Matter>(
      `/matters/${matterId}`,
      {
        method: "GET",
      },
      context
    );

    const linkedCaseIds = [...(matter.linkedCaseIds ?? []), caseId];

    const updatedMatter = await apiRequest<Matter>(
      `/matters/${matterId}`,
      {
        method: "PATCH",
        body: JSON.stringify({ linkedCaseIds }),
      },
      context
    );

    invalidateMatterData(matterId);
    revalidateTag(CacheTags.CASE(caseId));

    return updatedMatter;
  },
  { auditLog: true }
);

/**
 * Unlink case from matter
 */
export const unlinkCaseFromMatter = createMutation<
  { matterId: string; caseId: string },
  Matter
>(
  async (input, context) => {
    const { matterId, caseId } = input;

    // Get current matter
    const matter = await apiRequest<Matter>(
      `/matters/${matterId}`,
      {
        method: "GET",
      },
      context
    );

    const linkedCaseIds = (matter.linkedCaseIds ?? []).filter(
      (id) => id !== caseId
    );

    const updatedMatter = await apiRequest<Matter>(
      `/matters/${matterId}`,
      {
        method: "PATCH",
        body: JSON.stringify({ linkedCaseIds }),
      },
      context
    );

    invalidateMatterData(matterId);
    revalidateTag(CacheTags.CASE(caseId));

    return updatedMatter;
  },
  { auditLog: true }
);

// ============================================================================
// Bulk Operations
// ============================================================================

/**
 * Delete multiple matters
 */
export const deleteMatters = createMutation<
  { ids: string[] },
  { success: boolean; count: number }
>(
  async (input, context) => {
    const { ids } = input;

    await Promise.all(
      ids.map((id) =>
        apiRequest<void>(`/matters/${id}`, { method: "DELETE" }, context)
      )
    );

    invalidateTags([
      CacheTags.MATTERS,
      ...ids.map((id) => CacheTags.MATTER(id)),
    ]);

    return { success: true, count: ids.length };
  },
  {
    revalidateTags: [CacheTags.MATTERS],
    auditLog: true,
  }
);

/**
 * Archive multiple matters
 */
export const archiveMatters = createMutation<
  { ids: string[] },
  { success: boolean; count: number }
>(
  async (input, context) => {
    const { ids } = input;

    await Promise.all(
      ids.map((id) =>
        apiRequest<Matter>(
          `/matters/${id}`,
          {
            method: "PATCH",
            body: JSON.stringify({ status: "ARCHIVED", isArchived: true }),
          },
          context
        )
      )
    );

    invalidateTags([
      CacheTags.MATTERS,
      ...ids.map((id) => CacheTags.MATTER(id)),
    ]);

    return { success: true, count: ids.length };
  },
  { auditLog: true }
);

// ============================================================================
// Form Actions
// ============================================================================

/**
 * Form action for creating a matter
 */
export async function createMatterFormAction(
  prevState: ActionResult<Matter> | null,
  formData: FormData
): Promise<ActionResult<Matter>> {
  const data: Record<string, unknown> = {};

  // String fields
  const stringFields = [
    "matterNumber",
    "title",
    "description",
    "status",
    "matterType",
    "priority",
    "practiceArea",
    "clientId",
    "clientName",
    "leadAttorneyId",
    "leadAttorneyName",
    "originatingAttorneyId",
    "originatingAttorneyName",
    "jurisdiction",
    "venue",
    "billingType",
    "openedDate",
    "targetCloseDate",
    "opposingPartyName",
    "opposingCounselFirm",
    "conflictCheckNotes",
    "riskLevel",
    "riskNotes",
    "internalNotes",
  ];

  for (const field of stringFields) {
    const value = formData.get(field);
    if (value !== null && value !== "") {
      data[field] = value;
    }
  }

  // Numeric fields
  const numericFields = [
    "hourlyRate",
    "flatFee",
    "contingencyPercentage",
    "retainerAmount",
    "estimatedValue",
    "budgetAmount",
  ];

  for (const field of numericFields) {
    const value = formData.get(field);
    if (value && value !== "") {
      data[field] = parseFloat(value as string);
    }
  }

  // Boolean fields
  const booleanFields = ["conflictCheckCompleted"];
  for (const field of booleanFields) {
    const value = formData.get(field);
    data[field] = value === "true" || value === "on";
  }

  // Tags
  const tags = formData.get("tags");
  if (tags) {
    try {
      data.tags = JSON.parse(tags as string);
    } catch {
      data.tags = (tags as string)
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }
  }

  return createMatter(data as CreateMatterInput);
}

/**
 * Form action for updating a matter
 */
export async function updateMatterFormAction(
  prevState: ActionResult<Matter> | null,
  formData: FormData
): Promise<ActionResult<Matter>> {
  const id = formData.get("id") as string;

  if (!id) {
    return failure("Matter ID is required", "VALIDATION_ERROR");
  }

  const data: Record<string, unknown> = { id };

  // String fields
  const stringFields = [
    "matterNumber",
    "title",
    "description",
    "status",
    "matterType",
    "priority",
    "practiceArea",
    "clientId",
    "clientName",
    "leadAttorneyId",
    "leadAttorneyName",
    "originatingAttorneyId",
    "originatingAttorneyName",
    "jurisdiction",
    "venue",
    "billingType",
    "openedDate",
    "targetCloseDate",
    "closedDate",
    "opposingPartyName",
    "opposingCounselFirm",
    "conflictCheckNotes",
    "riskLevel",
    "riskNotes",
    "internalNotes",
  ];

  for (const field of stringFields) {
    const value = formData.get(field);
    if (value !== null && value !== "") {
      data[field] = value;
    }
  }

  // Numeric fields
  const numericFields = [
    "hourlyRate",
    "flatFee",
    "contingencyPercentage",
    "retainerAmount",
    "estimatedValue",
    "budgetAmount",
  ];

  for (const field of numericFields) {
    const value = formData.get(field);
    if (value && value !== "") {
      data[field] = parseFloat(value as string);
    }
  }

  // Boolean fields
  const booleanFields = ["conflictCheckCompleted", "isArchived"];
  for (const field of booleanFields) {
    const value = formData.get(field);
    if (value !== null) {
      data[field] = value === "true" || value === "on";
    }
  }

  return updateMatter(data as UpdateMatterInput);
}

/**
 * Form action for deleting a matter
 */
export async function deleteMatterFormAction(
  prevState: ActionResult<{ success: boolean }> | null,
  formData: FormData
): Promise<ActionResult<{ success: boolean }>> {
  const id = formData.get("id") as string;

  if (!id) {
    return failure("Matter ID is required", "VALIDATION_ERROR");
  }

  return deleteMatter({ id });
}
