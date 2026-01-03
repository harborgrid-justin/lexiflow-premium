/**
 * New Workflow Route
 *
 * Create a new workflow template.
 *
 * @module routes/workflows/new
 */

import { Form, redirect, useNavigate, useNavigation } from 'react-router';
import { api } from '../../api';
import { createMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/new";

// ============================================================================
// Meta Tags
// ============================================================================

export function meta() {
  return createMeta({
    title: 'New Workflow',
    description: 'Create a new workflow template',
  });
}

// ============================================================================
// Action
// ============================================================================

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const description = formData.get("description") as string;

  if (!name || !category) {
    return { success: false, error: "Name and category are required" };
  }

  try {
    const template = await api.workflow.createTemplate({
      name,
      category,
      description,
      status: 'draft',
      steps: []
    });

    return redirect(`/workflows/${template.id}`);
  } catch (error) {
    console.error("Error creating workflow:", error);
    return { success: false, error: "Failed to create workflow" };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function NewWorkflowRoute({ actionData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="mx-auto max-w-2xl p-8">
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Create New Workflow
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Define a new process template for your team.
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <Form method="post" className="space-y-6">
          {actionData?.error && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
              {actionData.error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Workflow Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
              placeholder="e.g., Client Onboarding"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Category
            </label>
            <select
              name="category"
              id="category"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
            >
              <option value="">Select a category</option>
              <option value="case-management">Case Management</option>
              <option value="client-intake">Client Intake</option>
              <option value="document-review">Document Review</option>
              <option value="billing">Billing & Invoicing</option>
              <option value="compliance">Compliance</option>
              <option value="hr">HR & Admin</option>
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              name="description"
              id="description"
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
              placeholder="Describe the purpose of this workflow..."
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Workflow'}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
