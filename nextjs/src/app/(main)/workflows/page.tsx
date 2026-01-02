/**
 * Workflows Page - Server Component with Data Fetching
 * Manage legal workflows and task automation
 */
import MasterWorkflow from '@/components/workflows/MasterWorkflow';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { Suspense } from 'react';

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = {
  title: 'Workflows | LexiFlow',
  description: 'Manage legal workflows and tasks',
};

export default async function WorkflowsPage(): Promise<JSX.Element> {
  // Fetch workflow templates and instances
  let workflows = [];
  let tasks = [];

  try {
    const [workflowData, tasksData] = await Promise.all([
      apiFetch(API_ENDPOINTS.WORKFLOW.TEMPLATES).catch(() => []),
      apiFetch(API_ENDPOINTS.TASKS.LIST).catch(() => []),
    ]);
    workflows = workflowData;
    tasks = tasksData;
  } catch (error) {
    console.error('Failed to load workflows:', error);
  }

  return (
    <div className="h-[calc(100vh-4rem)]">
      <Suspense fallback={<div className="p-8">Loading workflows...</div>}>
        <MasterWorkflow initialWorkflows={workflows} initialTasks={tasks} />
      </Suspense>
    </div>
  );
}
