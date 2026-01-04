/**
 * Workflows Index Route
 *
 * Manage automated workflows, task automation, and process templates
 * for legal operations and case management.
 *
 * @module routes/workflows/index
 */

import type { WorkflowStatus } from '@/types';
import { useState } from 'react';
import { Form, Link, useLoaderData, useNavigate, useNavigation, type LoaderFunctionArgs } from 'react-router';
import { api } from '../../api';
import { createListMeta } from '../_shared/meta-utils';

// ============================================================================
// Types
// ============================================================================

type LoaderData = Awaited<ReturnType<typeof loader>>;

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: { data: LoaderData }) {
  return createListMeta({
    entityType: 'Workflows',
    count: data?.templates?.length,
    description: 'Manage automated workflows and process templates',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const status = url.searchParams.get('status') as WorkflowStatus;
  const category = url.searchParams.get('category') || undefined;

  const [templates, instances] = await Promise.all([
    api.workflow.getTemplates({ status, category }),
    api.workflow.getInstances({ status })
  ]);

  return { templates, instances };
}

// ============================================================================
// Action
// ============================================================================

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const id = formData.get("id") as string;

  try {
    switch (intent) {
      case "create": {
        const name = formData.get("name") as string;
        const category = formData.get("category") as string;
        if (!name || !category) return { success: false, error: "Name and category are required" };

        await api.workflow.createTemplate({
          name,
          category,
          status: 'draft',
          steps: [] // Initialize with empty steps
        });
        return { success: true, message: "Workflow template created" };
      }

      case "delete":
        if (!id) return { success: false, error: "ID is required" };
        await api.workflow.deleteTemplate(id);
        return { success: true, message: "Workflow template deleted" };

      case "activate":
        if (!id) return { success: false, error: "ID is required" };
        await api.workflow.updateTemplate(id, { status: 'active' });
        return { success: true, message: "Workflow activated" };

      case "deactivate":
        if (!id) return { success: false, error: "ID is required" };
        await api.workflow.updateTemplate(id, { status: 'inactive' });
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

export default function WorkflowsIndexRoute() {
  const { templates, instances } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
  const navigate = useNavigate();
  console.log('useNavigate:', navigate);
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [activeTab, setActiveTab] = useState<'templates' | 'instances'>('templates');

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Workflows & Automation
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage process templates and monitor active workflow instances
          </p>
        </div>

        <Link
          to="/workflows/new"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Workflow
        </Link>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('templates')}
            className={`${activeTab === 'templates'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
          >
            Templates ({templates.length})
          </button>
          <button
            onClick={() => setActiveTab('instances')}
            className={`${activeTab === 'instances'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
          >
            Active Instances ({instances.length})
          </button>
        </nav>
      </div>

      {activeTab === 'templates' ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {templates.length === 0 ? (
            <div className="col-span-full rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800/50">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No templates</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Get started by creating a new workflow template.
              </p>
            </div>
          ) : (
            templates.map((template) => (
              <div
                key={template.id}
                className="relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${template.status === 'active'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                      {template.status}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {template.steps.length} steps
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                    <Link to={`/workflows/${template.id}`} className="focus:outline-none">
                      <span className="absolute inset-0" aria-hidden="true" />
                      {template.name}
                    </Link>
                  </h3>
                  <p className="mt-2 flex-1 text-sm text-gray-500 dark:text-gray-400">
                    {template.description || `Category: ${template.category}`}
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-3 dark:border-gray-700 dark:bg-gray-800/50">
                  <div className="flex space-x-2">
                    <Form method="post" className="inline">
                      <input type="hidden" name="id" value={template.id} />
                      <input
                        type="hidden"
                        name="intent"
                        value={template.status === 'active' ? 'deactivate' : 'activate'}
                      />
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="text-xs font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                      >
                        {template.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </Form>
                  </div>
                  <div className="flex space-x-2">
                    <Form method="post" className="inline" onSubmit={(e) => {
                      if (!confirm('Are you sure you want to delete this template?')) {
                        e.preventDefault();
                      }
                    }}>
                      <input type="hidden" name="intent" value="delete" />
                      <input type="hidden" name="id" value={template.id} />
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="text-xs font-medium text-red-600 hover:text-red-500 dark:text-red-400"
                      >
                        Delete
                      </button>
                    </Form>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Instance ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Started
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Progress
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
              {instances.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No active workflow instances found.
                  </td>
                </tr>
              ) : (
                instances.map((instance) => (
                  <tr key={instance.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                      {instance.id.substring(0, 8)}...
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${instance.status === 'running'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        : instance.status === 'completed'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                        {instance.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(instance.startedAt).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <div className="h-2 w-16 rounded-full bg-gray-200 dark:bg-gray-700">
                          <div
                            className="h-2 rounded-full bg-blue-600"
                            style={{ width: `${instance.progress || 0}%` }}
                          />
                        </div>
                        <span className="ml-2 text-xs">{instance.progress || 0}%</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <Link to={`/workflows/instance/${instance.id}`} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
