/**
 * Workflow Instance Detail Route
 *
 * Displays detailed information for a single workflow instance.
 *
 * @module routes/workflows/instance.detail
 */

import { api } from '@/services/api';
import { requireAuthentication } from '@/utils/route-guards';
import { Form, Link, useLoaderData, useNavigate, useNavigation, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router';
import { createDetailMeta } from '../_shared/meta-utils';

// ============================================================================
// Types
// ============================================================================

type LoaderData = Awaited<ReturnType<typeof loader>>;

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: { data: LoaderData }) {
  return createDetailMeta({
    entityType: 'Workflow Instance',
    entityName: data?.instance?.id,
    entityId: data?.instance?.id,
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader({ params, request }: LoaderFunctionArgs) {
  // Auth check
  requireAuthentication(request);

  const { instanceId } = params;

  if (!instanceId) {
    throw new Response("Instance ID is required", { status: 400 });
  }

  try {
    const instance = await api.workflow.getInstanceById(instanceId);
    if (!instance) {
      throw new Response("Workflow instance not found", { status: 404 });
    }

    // Fetch template to get step names
    let template = null;
    try {
      template = await api.workflow.getTemplateById(instance.templateId);
    } catch (templateError) {
      console.error("Error fetching template:", templateError);
      // Continue without template
    }

    return { instance, template };
  } catch (error) {
    console.error("Error fetching workflow instance:", error);
    throw new Response("Workflow instance not found", { status: 404 });
  }
}

// ============================================================================
// Action
// ============================================================================

export async function action({ params, request }: ActionFunctionArgs) {
  const { instanceId } = params;

  if (!instanceId) {
    return { success: false, error: "Instance ID is required" };
  }

  const formData = await request.formData();
  const intent = formData.get("intent");

  try {
    switch (intent) {
      case "pause":
        await api.workflow.pauseWorkflow(instanceId);
        return { success: true, message: "Workflow paused" };

      case "resume":
        await api.workflow.resumeWorkflow(instanceId);
        return { success: true, message: "Workflow resumed" };

      case "cancel":
        await api.workflow.cancelWorkflow(instanceId);
        return { success: true, message: "Workflow cancelled" };

      default:
        return { success: false, error: "Invalid action" };
    }
  } catch (error) {
    console.error("Workflow instance action error:", error);
    return { success: false, error: "Operation failed" };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function WorkflowInstanceDetailRoute() {
  const { instance, template } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
  const navigate = useNavigate();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="p-8">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </div>

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Workflow Instance
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            ID: {instance.id}
          </p>
          {template && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Template: <Link to={`/workflows/${template.id}`} className="text-blue-600 hover:underline">{template.name}</Link>
            </p>
          )}
        </div>
        <div className="flex space-x-3">
          {instance.status === 'running' && (
            <Form method="post">
              <input type="hidden" name="intent" value="pause" />
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Pause
              </button>
            </Form>
          )}

          {instance.status === 'paused' && (
            <Form method="post">
              <input type="hidden" name="intent" value="resume" />
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Resume
              </button>
            </Form>
          )}

          {(instance.status === 'running' || instance.status === 'paused') && (
            <Form method="post" onSubmit={(e) => {
              if (!confirm('Are you sure you want to cancel this workflow?')) {
                e.preventDefault();
              }
            }}>
              <input type="hidden" name="intent" value="cancel" />
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Cancel
              </button>
            </Form>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress */}
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800/50">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Progress</h3>
            </div>
            <div className="p-6">
              <div className="mb-2 flex justify-between text-sm font-medium text-gray-900 dark:text-gray-100">
                <span>Completion</span>
                <span>{instance.progress || 0}%</span>
              </div>
              <div className="h-4 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-4 rounded-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${instance.progress || 0}%` }}
                />
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">Current Step</h4>
                {instance.currentStep ? (
                  <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                          {template?.steps.find(s => s.id === instance.currentStep)?.name || instance.currentStep}
                        </h3>
                        <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                          <p>This step is currently in progress.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No active step (Workflow {instance.status})</p>
                )}
              </div>
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
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${instance.status === 'running'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      : instance.status === 'completed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : instance.status === 'failed'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                      {instance.status}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Started At</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {new Date(instance.startedAt).toLocaleString()}
                  </dd>
                </div>
                {instance.completedAt && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed At</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {new Date(instance.completedAt).toLocaleString()}
                    </dd>
                  </div>
                )}
                {instance.caseId && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Related Case</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      <Link to={`/cases/${instance.caseId}`} className="text-blue-600 hover:underline">
                        {instance.caseId}
                      </Link>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
