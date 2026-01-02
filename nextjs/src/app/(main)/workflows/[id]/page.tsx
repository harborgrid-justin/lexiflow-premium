/**
 * Workflow Detail Page - Server Component with Data Fetching
 * Fetches specific workflow instance from backend
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface WorkflowDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: WorkflowDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const workflow = await apiFetch(API_ENDPOINTS.WORKFLOW.INSTANCES + `/${id}`);
    return {
      title: `Workflow ${workflow.name || id} | LexiFlow`,
      description: workflow.description || 'Workflow details',
    };
  } catch {
    return { title: 'Workflow Not Found' };
  }
}

export default async function WorkflowDetailPage({ params }: WorkflowDetailPageProps) {
  const { id } = await params;

  let workflow;
  try {
    workflow = await apiFetch(API_ENDPOINTS.WORKFLOW.INSTANCES + `/${id}`);
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-6">
        Workflow: {workflow.name || id}
      </h1>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg">
        <p className="text-slate-600 dark:text-slate-400">{workflow.description}</p>
        <div className="mt-4 text-sm text-slate-500">
          <p>Status: {workflow.status}</p>
        </div>
      </div>
    </div>
  );
}
