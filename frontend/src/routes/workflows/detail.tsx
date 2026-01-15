/**
 * Workflow Detail Route
 *
 * Displays detailed information for a single workflow.
 *
 * @module routes/workflows/detail
 */

import { api } from '@/services/api';
import { useTheme } from '@/contexts/ThemeContext';
import { requireAuthentication } from '@/utils/route-guards';
import { Form, useLoaderData, useNavigate, useNavigation } from 'react-router';
import { createDetailMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/detail";

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: Route.MetaArgs) {
  return createDetailMeta({
    entityType: 'Workflow',
    entityName: data?.template?.name,
    entityId: data?.template?.id,
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader({ params, request }: Route.LoaderArgs) {
  // Auth check
  requireAuthentication(request);

  const { workflowId } = params;

  if (!workflowId) {
    throw new Response("Workflow ID is required", { status: 400 });
  }

  try {
    const template = await api.workflow.getTemplateById(workflowId);
    if (!template) {
      throw new Response("Workflow not found", { status: 404 });
    }
    return { template };
  } catch (error) {
    console.error("Error fetching workflow:", error);
    throw new Response("Workflow not found", { status: 404 });
  }
}

// ============================================================================
// Action
// ============================================================================

export async function action({ params, request }: Route.ActionArgs) {
  const { workflowId } = params;

  if (!workflowId) {
    return { success: false, error: "Workflow ID is required" };
  }

  const formData = await request.formData();
  const intent = formData.get("intent");

  try {
    switch (intent) {
      case "update": {
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        await api.workflow.updateTemplate(workflowId, { name, description });
        return { success: true, message: "Workflow updated" };
      }

      case "delete":
        await api.workflow.deleteTemplate(workflowId);
        // Redirect handled by client-side navigation usually, but here we return success
        // and let the component handle redirect or use redirect() from react-router
        return { success: true, message: "Workflow deleted" };

      case "activate":
        await api.workflow.updateTemplate(workflowId, { status: 'active' });
        return { success: true, message: "Workflow activated" };

      case "deactivate":
        await api.workflow.updateTemplate(workflowId, { status: 'inactive' });
        return { success: true, message: "Workflow deactivated" };

      default:
        return { success: false, error: "Invalid action" };
    }
  } catch (error) {
    console.error("Workflow action error:", error);
    return { success: false, error: "Operation failed" };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function WorkflowDetailRoute() {
  const { template } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
  const navigate = useNavigate();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="p-8">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className={`inline-flex items-center gap-2 text-sm ${theme.text.secondary} ${theme.interactive.hover}`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </div>

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${theme.text.primary}`}>
            {template.name}
          </h1>
          <p className={`mt-1 text-sm ${theme.text.secondary}`}>
            {template.description || 'No description provided'}
          </p>
        </div>
        <div className="flex space-x-3">
          <Form method="post">
            <input
              type="hidden"
              name="intent"
              value={template.status === 'active' ? 'deactivate' : 'activate'}
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex items-center rounded-md px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${template.status === 'active'
                ? 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600'
                : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                }`}
            >
              {template.status === 'active' ? 'Deactivate' : 'Activate'}
            </button>
          </Form>

          <Form method="post" onSubmit={(e: React.FormEvent) => {
            if (!confirm('Are you sure you want to delete this workflow?')) {
              e.preventDefault();
            }
          }}>
            <input type="hidden" name="intent" value="delete" />
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Delete
            </button>
          </Form>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Steps */}
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800/50">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Workflow Steps</h3>
            </div>
            <div className="p-6">
              {template.steps.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400">No steps defined yet.</p>
              ) : (
                <ul className="space-y-4">
                  {template.steps.map((step, index) => (
                    <li key={step.id} className="flex items-start">
                      <div className="flex-shrink-0">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                          {index + 1}
                        </span>
                      </div>
                      <div className="ml-4 flex-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{step.name}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Type: {step.type}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800/50">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Details</h3>
            </div>
            <div className="px-6 py-4">
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                  <dd className="mt-1">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${template.status === 'active'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                      {template.status}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{template.category}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {template.createdAt ? new Date(template.createdAt).toLocaleDateString() : 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {template.updatedAt ? new Date(template.updatedAt).toLocaleDateString() : 'N/A'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
