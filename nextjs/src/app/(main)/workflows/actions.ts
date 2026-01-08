'use server';

/**
 * Workflow Server Actions
 *
 * Next.js 16 Server Actions for workflow automation operations.
 * Handles template CRUD, instance execution control, and step management.
 *
 * Compliance:
 * - All async operations use proper error handling
 * - Uses revalidateTag with required profile parameter
 * - Implements proper cache invalidation patterns
 *
 * @module app/(main)/workflows/actions
 */

import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { API_BASE_URL, API_ENDPOINTS } from '@/lib/api-config';
import type {
  WorkflowTemplate,
  WorkflowTemplateSummary,
  WorkflowInstance,
  WorkflowInstanceSummary,
  WorkflowActionResult,
  CreateWorkflowTemplateRequest,
  UpdateWorkflowTemplateRequest,
  StartWorkflowInstanceRequest,
  CompleteStepRequest,
  WorkflowTemplateStatus,
  WorkflowInstanceStatus,
  WorkflowCategory,
  WorkflowDashboardStats,
} from '@/types/workflow-schemas';

// =============================================================================
// Cache Tags
// =============================================================================

const CACHE_TAGS = {
  TEMPLATES: 'workflow-templates',
  INSTANCES: 'workflow-instances',
  DASHBOARD: 'workflow-dashboard',
  TEMPLATE_DETAIL: (id: string) => `workflow-template-${id}`,
  INSTANCE_DETAIL: (id: string) => `workflow-instance-${id}`,
} as const;

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get auth headers from cookies (async in Next.js 16)
 */
async function getAuthHeaders(): Promise<HeadersInit> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

/**
 * Build API URL with query parameters
 */
function buildUrl(endpoint: string, params?: Record<string, string | undefined>): string {
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, value);
      }
    });
  }
  return url.toString();
}

/**
 * Handle API errors consistently
 */
function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

/**
 * Revalidate workflow caches with profile
 */
async function revalidateWorkflowCaches(tags: string[]): Promise<void> {
  const cookieStore = await cookies();
  const profile = cookieStore.get('user-profile')?.value || 'default';

  for (const tag of tags) {
    revalidateTag(tag, profile as Parameters<typeof revalidateTag>[1]);
  }
}

// =============================================================================
// Template Actions
// =============================================================================

/**
 * Fetch all workflow templates with optional filters
 */
export async function getWorkflowTemplates(filters?: {
  status?: WorkflowTemplateStatus;
  category?: WorkflowCategory;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<WorkflowActionResult<WorkflowTemplateSummary[]>> {
  try {
    const headers = await getAuthHeaders();
    const url = buildUrl(API_ENDPOINTS.WORKFLOW.TEMPLATES, {
      status: filters?.status,
      category: filters?.category,
      search: filters?.search,
      page: filters?.page?.toString(),
      limit: filters?.limit?.toString(),
    });

    const response = await fetch(url, {
      method: 'GET',
      headers,
      next: { tags: [CACHE_TAGS.TEMPLATES], revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch templates: ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('getWorkflowTemplates error:', error);
    return { success: false, error: handleApiError(error) };
  }
}

/**
 * Fetch a single workflow template by ID
 */
export async function getWorkflowTemplate(
  id: string
): Promise<WorkflowActionResult<WorkflowTemplate>> {
  try {
    const headers = await getAuthHeaders();
    const url = `${API_BASE_URL}${API_ENDPOINTS.WORKFLOW.TEMPLATES}/${id}`;

    const response = await fetch(url, {
      method: 'GET',
      headers,
      next: { tags: [CACHE_TAGS.TEMPLATE_DETAIL(id)], revalidate: 60 },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { success: false, error: 'Template not found' };
      }
      throw new Error(`Failed to fetch template: ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('getWorkflowTemplate error:', error);
    return { success: false, error: handleApiError(error) };
  }
}

/**
 * Create a new workflow template
 */
export async function createWorkflowTemplate(
  request: CreateWorkflowTemplateRequest
): Promise<WorkflowActionResult<WorkflowTemplate>> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.WORKFLOW.TEMPLATES}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...request,
        status: 'draft',
        version: 1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to create template: ${response.statusText}`);
    }

    const data = await response.json();

    await revalidateWorkflowCaches([CACHE_TAGS.TEMPLATES, CACHE_TAGS.DASHBOARD]);

    return { success: true, data, message: 'Template created successfully' };
  } catch (error) {
    console.error('createWorkflowTemplate error:', error);
    return { success: false, error: handleApiError(error) };
  }
}

/**
 * Update an existing workflow template
 */
export async function updateWorkflowTemplate(
  id: string,
  request: UpdateWorkflowTemplateRequest
): Promise<WorkflowActionResult<WorkflowTemplate>> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.WORKFLOW.TEMPLATES}/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update template: ${response.statusText}`);
    }

    const data = await response.json();

    await revalidateWorkflowCaches([
      CACHE_TAGS.TEMPLATES,
      CACHE_TAGS.TEMPLATE_DETAIL(id),
      CACHE_TAGS.DASHBOARD,
    ]);

    return { success: true, data, message: 'Template updated successfully' };
  } catch (error) {
    console.error('updateWorkflowTemplate error:', error);
    return { success: false, error: handleApiError(error) };
  }
}

/**
 * Delete a workflow template
 */
export async function deleteWorkflowTemplate(
  id: string
): Promise<WorkflowActionResult> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.WORKFLOW.TEMPLATES}/${id}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to delete template: ${response.statusText}`);
    }

    await revalidateWorkflowCaches([
      CACHE_TAGS.TEMPLATES,
      CACHE_TAGS.TEMPLATE_DETAIL(id),
      CACHE_TAGS.DASHBOARD,
    ]);

    return { success: true, message: 'Template deleted successfully' };
  } catch (error) {
    console.error('deleteWorkflowTemplate error:', error);
    return { success: false, error: handleApiError(error) };
  }
}

/**
 * Activate a workflow template
 */
export async function activateWorkflowTemplate(
  id: string
): Promise<WorkflowActionResult<WorkflowTemplate>> {
  return updateWorkflowTemplate(id, { status: 'active' });
}

/**
 * Deactivate a workflow template
 */
export async function deactivateWorkflowTemplate(
  id: string
): Promise<WorkflowActionResult<WorkflowTemplate>> {
  return updateWorkflowTemplate(id, { status: 'inactive' });
}

/**
 * Duplicate a workflow template
 */
export async function duplicateWorkflowTemplate(
  id: string,
  newName?: string
): Promise<WorkflowActionResult<WorkflowTemplate>> {
  try {
    // First, fetch the original template
    const originalResult = await getWorkflowTemplate(id);
    if (!originalResult.success || !originalResult.data) {
      return { success: false, error: originalResult.error || 'Failed to fetch original template' };
    }

    const original = originalResult.data;

    // Create a new template based on the original
    const duplicateRequest: CreateWorkflowTemplateRequest = {
      name: newName || `${original.name} (Copy)`,
      description: original.description,
      category: original.category,
      steps: original.steps.map(step => ({
        name: step.name,
        type: step.type,
        config: step.config,
        position: step.position,
        nextStepIds: step.nextStepIds,
        previousStepIds: step.previousStepIds,
        metadata: step.metadata,
      })),
      variables: original.variables.map(v => ({
        key: v.key,
        name: v.name,
        type: v.type,
        description: v.description,
        required: v.required,
        defaultValue: v.defaultValue,
        validation: v.validation,
      })),
      triggers: original.triggers,
      tags: original.tags ? [...original.tags] : [],
    };

    return createWorkflowTemplate(duplicateRequest);
  } catch (error) {
    console.error('duplicateWorkflowTemplate error:', error);
    return { success: false, error: handleApiError(error) };
  }
}

// =============================================================================
// Instance Actions
// =============================================================================

/**
 * Fetch all workflow instances with optional filters
 */
export async function getWorkflowInstances(filters?: {
  templateId?: string;
  status?: WorkflowInstanceStatus;
  caseId?: string;
  page?: number;
  limit?: number;
}): Promise<WorkflowActionResult<WorkflowInstanceSummary[]>> {
  try {
    const headers = await getAuthHeaders();
    const url = buildUrl(API_ENDPOINTS.WORKFLOW.INSTANCES, {
      templateId: filters?.templateId,
      status: filters?.status,
      caseId: filters?.caseId,
      page: filters?.page?.toString(),
      limit: filters?.limit?.toString(),
    });

    const response = await fetch(url, {
      method: 'GET',
      headers,
      next: { tags: [CACHE_TAGS.INSTANCES], revalidate: 30 },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch instances: ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('getWorkflowInstances error:', error);
    return { success: false, error: handleApiError(error) };
  }
}

/**
 * Fetch a single workflow instance by ID
 */
export async function getWorkflowInstance(
  id: string
): Promise<WorkflowActionResult<WorkflowInstance>> {
  try {
    const headers = await getAuthHeaders();
    const url = `${API_BASE_URL}${API_ENDPOINTS.WORKFLOW.INSTANCES}/${id}`;

    const response = await fetch(url, {
      method: 'GET',
      headers,
      next: { tags: [CACHE_TAGS.INSTANCE_DETAIL(id)], revalidate: 15 },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { success: false, error: 'Instance not found' };
      }
      throw new Error(`Failed to fetch instance: ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('getWorkflowInstance error:', error);
    return { success: false, error: handleApiError(error) };
  }
}

/**
 * Start a new workflow instance
 */
export async function startWorkflowInstance(
  request: StartWorkflowInstanceRequest
): Promise<WorkflowActionResult<WorkflowInstance>> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.WORKFLOW.INSTANCES}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...request,
        status: 'running',
        startedAt: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to start workflow: ${response.statusText}`);
    }

    const data = await response.json();

    await revalidateWorkflowCaches([CACHE_TAGS.INSTANCES, CACHE_TAGS.DASHBOARD]);

    return { success: true, data, message: 'Workflow started successfully' };
  } catch (error) {
    console.error('startWorkflowInstance error:', error);
    return { success: false, error: handleApiError(error) };
  }
}

/**
 * Pause a running workflow instance
 */
export async function pauseWorkflowInstance(
  id: string
): Promise<WorkflowActionResult<WorkflowInstance>> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.WORKFLOW.INSTANCES}/${id}/pause`, {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to pause workflow: ${response.statusText}`);
    }

    const data = await response.json();

    await revalidateWorkflowCaches([
      CACHE_TAGS.INSTANCES,
      CACHE_TAGS.INSTANCE_DETAIL(id),
      CACHE_TAGS.DASHBOARD,
    ]);

    return { success: true, data, message: 'Workflow paused successfully' };
  } catch (error) {
    console.error('pauseWorkflowInstance error:', error);
    return { success: false, error: handleApiError(error) };
  }
}

/**
 * Resume a paused workflow instance
 */
export async function resumeWorkflowInstance(
  id: string
): Promise<WorkflowActionResult<WorkflowInstance>> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.WORKFLOW.INSTANCES}/${id}/resume`, {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to resume workflow: ${response.statusText}`);
    }

    const data = await response.json();

    await revalidateWorkflowCaches([
      CACHE_TAGS.INSTANCES,
      CACHE_TAGS.INSTANCE_DETAIL(id),
      CACHE_TAGS.DASHBOARD,
    ]);

    return { success: true, data, message: 'Workflow resumed successfully' };
  } catch (error) {
    console.error('resumeWorkflowInstance error:', error);
    return { success: false, error: handleApiError(error) };
  }
}

/**
 * Cancel a workflow instance
 */
export async function cancelWorkflowInstance(
  id: string,
  reason?: string
): Promise<WorkflowActionResult<WorkflowInstance>> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.WORKFLOW.INSTANCES}/${id}/cancel`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to cancel workflow: ${response.statusText}`);
    }

    const data = await response.json();

    await revalidateWorkflowCaches([
      CACHE_TAGS.INSTANCES,
      CACHE_TAGS.INSTANCE_DETAIL(id),
      CACHE_TAGS.DASHBOARD,
    ]);

    return { success: true, data, message: 'Workflow cancelled successfully' };
  } catch (error) {
    console.error('cancelWorkflowInstance error:', error);
    return { success: false, error: handleApiError(error) };
  }
}

/**
 * Retry a failed workflow instance
 */
export async function retryWorkflowInstance(
  id: string
): Promise<WorkflowActionResult<WorkflowInstance>> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.WORKFLOW.INSTANCES}/${id}/retry`, {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to retry workflow: ${response.statusText}`);
    }

    const data = await response.json();

    await revalidateWorkflowCaches([
      CACHE_TAGS.INSTANCES,
      CACHE_TAGS.INSTANCE_DETAIL(id),
      CACHE_TAGS.DASHBOARD,
    ]);

    return { success: true, data, message: 'Workflow retry initiated' };
  } catch (error) {
    console.error('retryWorkflowInstance error:', error);
    return { success: false, error: handleApiError(error) };
  }
}

// =============================================================================
// Step Actions
// =============================================================================

/**
 * Complete a workflow step
 */
export async function completeWorkflowStep(
  request: CompleteStepRequest
): Promise<WorkflowActionResult<WorkflowInstance>> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.WORKFLOW.INSTANCES}/${request.instanceId}/steps/${request.stepId}/complete`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          result: request.result,
          notes: request.notes,
          nextStepId: request.nextStepId,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to complete step: ${response.statusText}`);
    }

    const data = await response.json();

    await revalidateWorkflowCaches([
      CACHE_TAGS.INSTANCES,
      CACHE_TAGS.INSTANCE_DETAIL(request.instanceId),
      CACHE_TAGS.DASHBOARD,
    ]);

    return { success: true, data, message: 'Step completed successfully' };
  } catch (error) {
    console.error('completeWorkflowStep error:', error);
    return { success: false, error: handleApiError(error) };
  }
}

/**
 * Skip a workflow step
 */
export async function skipWorkflowStep(
  instanceId: string,
  stepId: string,
  reason?: string
): Promise<WorkflowActionResult<WorkflowInstance>> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.WORKFLOW.INSTANCES}/${instanceId}/steps/${stepId}/skip`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ reason }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to skip step: ${response.statusText}`);
    }

    const data = await response.json();

    await revalidateWorkflowCaches([
      CACHE_TAGS.INSTANCES,
      CACHE_TAGS.INSTANCE_DETAIL(instanceId),
    ]);

    return { success: true, data, message: 'Step skipped successfully' };
  } catch (error) {
    console.error('skipWorkflowStep error:', error);
    return { success: false, error: handleApiError(error) };
  }
}

/**
 * Assign a step to a user
 */
export async function assignWorkflowStep(
  instanceId: string,
  stepId: string,
  assigneeId: string
): Promise<WorkflowActionResult<WorkflowInstance>> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.WORKFLOW.INSTANCES}/${instanceId}/steps/${stepId}/assign`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ assigneeId }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to assign step: ${response.statusText}`);
    }

    const data = await response.json();

    await revalidateWorkflowCaches([
      CACHE_TAGS.INSTANCES,
      CACHE_TAGS.INSTANCE_DETAIL(instanceId),
    ]);

    return { success: true, data, message: 'Step assigned successfully' };
  } catch (error) {
    console.error('assignWorkflowStep error:', error);
    return { success: false, error: handleApiError(error) };
  }
}

// =============================================================================
// Variable Actions
// =============================================================================

/**
 * Update workflow instance variables
 */
export async function updateWorkflowVariables(
  instanceId: string,
  variables: Record<string, unknown>
): Promise<WorkflowActionResult<WorkflowInstance>> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.WORKFLOW.INSTANCES}/${instanceId}/variables`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ variables }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update variables: ${response.statusText}`);
    }

    const data = await response.json();

    await revalidateWorkflowCaches([CACHE_TAGS.INSTANCE_DETAIL(instanceId)]);

    return { success: true, data, message: 'Variables updated successfully' };
  } catch (error) {
    console.error('updateWorkflowVariables error:', error);
    return { success: false, error: handleApiError(error) };
  }
}

// =============================================================================
// Dashboard Actions
// =============================================================================

/**
 * Fetch workflow dashboard statistics
 */
export async function getWorkflowDashboardStats(): Promise<WorkflowActionResult<WorkflowDashboardStats>> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.WORKFLOW.TEMPLATES}/dashboard`, {
      method: 'GET',
      headers,
      next: { tags: [CACHE_TAGS.DASHBOARD], revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch dashboard: ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('getWorkflowDashboardStats error:', error);
    return { success: false, error: handleApiError(error) };
  }
}

// =============================================================================
// Form Actions (for use with forms)
// =============================================================================

/**
 * Form action for creating a template
 */
export async function createTemplateFormAction(
  prevState: WorkflowActionResult<WorkflowTemplate> | null,
  formData: FormData
): Promise<WorkflowActionResult<WorkflowTemplate>> {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const category = formData.get('category') as WorkflowCategory;

  if (!name || !category) {
    return { success: false, error: 'Name and category are required' };
  }

  const result = await createWorkflowTemplate({ name, description, category });

  if (result.success && result.data) {
    redirect(`/workflows/templates/${result.data.id}`);
  }

  return result;
}

/**
 * Form action for updating a template
 */
export async function updateTemplateFormAction(
  id: string,
  prevState: WorkflowActionResult<WorkflowTemplate> | null,
  formData: FormData
): Promise<WorkflowActionResult<WorkflowTemplate>> {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const category = formData.get('category') as WorkflowCategory;

  const updates: UpdateWorkflowTemplateRequest = {};
  if (name) updates.name = name;
  if (description) updates.description = description;
  if (category) updates.category = category;

  return updateWorkflowTemplate(id, updates);
}

/**
 * Form action for deleting a template
 */
export async function deleteTemplateFormAction(
  formData: FormData
): Promise<WorkflowActionResult> {
  const id = formData.get('id') as string;

  if (!id) {
    return { success: false, error: 'Template ID is required' };
  }

  const result = await deleteWorkflowTemplate(id);

  if (result.success) {
    redirect('/workflows/templates');
  }

  return result;
}

/**
 * Form action for template status change
 */
export async function changeTemplateStatusFormAction(
  formData: FormData
): Promise<WorkflowActionResult<WorkflowTemplate>> {
  const id = formData.get('id') as string;
  const action = formData.get('action') as 'activate' | 'deactivate';

  if (!id || !action) {
    return { success: false, error: 'Template ID and action are required' };
  }

  if (action === 'activate') {
    return activateWorkflowTemplate(id);
  } else {
    return deactivateWorkflowTemplate(id);
  }
}

/**
 * Form action for instance control
 */
export async function instanceControlFormAction(
  formData: FormData
): Promise<WorkflowActionResult<WorkflowInstance>> {
  const id = formData.get('id') as string;
  const action = formData.get('action') as 'pause' | 'resume' | 'cancel' | 'retry';
  const reason = formData.get('reason') as string | undefined;

  if (!id || !action) {
    return { success: false, error: 'Instance ID and action are required' };
  }

  switch (action) {
    case 'pause':
      return pauseWorkflowInstance(id);
    case 'resume':
      return resumeWorkflowInstance(id);
    case 'cancel':
      return cancelWorkflowInstance(id, reason);
    case 'retry':
      return retryWorkflowInstance(id);
    default:
      return { success: false, error: 'Invalid action' };
  }
}

/**
 * Form action for starting a workflow
 */
export async function startWorkflowFormAction(
  formData: FormData
): Promise<WorkflowActionResult<WorkflowInstance>> {
  const templateId = formData.get('templateId') as string;
  const caseId = formData.get('caseId') as string | undefined;

  if (!templateId) {
    return { success: false, error: 'Template ID is required' };
  }

  const result = await startWorkflowInstance({ templateId, caseId });

  if (result.success && result.data) {
    redirect(`/workflows/instances/${result.data.id}`);
  }

  return result;
}
