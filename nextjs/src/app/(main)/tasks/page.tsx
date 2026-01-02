/**
 * Tasks List Page - Server Component with Data Fetching
 * List view of all tasks
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = {
  title: 'Tasks | LexiFlow',
  description: 'Manage tasks and assignments',
};

export default async function TasksPage(): Promise<JSX.Element> {
  // Fetch tasks from backend
  let tasks = [];

  try {
    tasks = await apiFetch(API_ENDPOINTS.TASKS.LIST);
  } catch (error) {
    console.error('Failed to load tasks:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <Link
          href="/tasks/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Task
        </Link>
      </div>

      <Suspense fallback={<div>Loading tasks...</div>}>
        <div className="space-y-3">
          {tasks && tasks.length > 0 ? (
            tasks.map((task: any) => (
              <Link
                key={task.id}
                href={`/tasks/${task.id}`}
                className="block p-4 bg-white dark:bg-slate-800 rounded-lg border hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold">{task.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {task.description}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <span className="px-2 py-1 text-xs rounded bg-slate-100 dark:bg-slate-700">
                      {task.priority}
                    </span>
                    <span className="px-2 py-1 text-xs rounded bg-blue-100 dark:bg-blue-900">
                      {task.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-slate-600 dark:text-slate-400">No tasks available</p>
          )}
        </div>
      </Suspense>
    </div>
  );
}
