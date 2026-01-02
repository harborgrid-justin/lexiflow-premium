/**
 * Task Detail Page - Server Component with Data Fetching
 * Dynamic route for individual task view
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

interface Task {
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
}

interface TaskDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: TaskDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const task = (await apiFetch(API_ENDPOINTS.TASKS.DETAIL(id))) as Task;
    return {
      title: `${task.title} | LexiFlow`,
      description: task.description || 'Task details',
    };
  } catch (error) {
    return { title: 'Task Not Found' };
  }
}

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const { id } = await params;

  let task: Task;
  try {
    task = (await apiFetch(API_ENDPOINTS.TASKS.DETAIL(id))) as Task;
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading task...</div>}>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold mb-4">{task.title}</h1>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Status:</span>
                <span className="ml-2 font-medium">{task.status}</span>
              </div>
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Priority:</span>
                <span className="ml-2 font-medium">{task.priority}</span>
              </div>
            </div>
            <div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Due Date:</span>
              <span className="ml-2">{task.dueDate}</span>
            </div>
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-slate-700 dark:text-slate-300">{task.description}</p>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
