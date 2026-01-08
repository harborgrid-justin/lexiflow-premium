/**
 * Deadlines Page - Server Component with Data Fetching
 * List of all legal deadlines
 */
import React from 'react';
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Deadlines | LexiFlow',
  description: 'Manage legal deadlines and due dates',
};

export default async function DeadlinesPage(): Promise<React.JSX.Element> {
  let deadlines: any[] = [];

  try {
    deadlines = await apiFetch(API_ENDPOINTS.DEADLINES.LIST) as any[];
  } catch (error) {
    console.error('Failed to load deadlines:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Deadlines</h1>
        <Link
          href="/deadlines/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Deadline
        </Link>
      </div>

      <Suspense fallback={<div>Loading deadlines...</div>}>
        <div className="grid grid-cols-1 gap-4">
          {deadlines && deadlines.length > 0 ? (
            deadlines.map((deadline: any) => {
              const dueDate = new Date(deadline.dueDate);
              const daysUntil = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              const isUrgent = daysUntil <= 7 || deadline.priority === 'urgent';
              const isOverdue = daysUntil < 0;

              return (
                <Link
                  key={deadline.id}
                  href={`/deadlines/${deadline.id}`}
                  className={`block p-6 rounded-lg border hover:shadow-lg transition-shadow ${isOverdue
                    ? 'bg-red-50 dark:bg-red-950 border-red-300 dark:border-red-800'
                    : isUrgent
                      ? 'bg-amber-50 dark:bg-amber-950 border-amber-300 dark:border-amber-800'
                      : 'bg-white dark:bg-slate-800'
                    }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{deadline.description}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Attorney: {deadline.attorney || 'Unassigned'}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {deadline.caseNumber && `Case: ${deadline.caseNumber}`}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`px-3 py-1 text-sm rounded ${isOverdue
                          ? 'bg-red-200 dark:bg-red-900 text-red-900 dark:text-red-200 font-bold'
                          : isUrgent
                            ? 'bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-semibold'
                            : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                          }`}
                      >
                        {deadline.priority?.toUpperCase() || 'NORMAL'}
                      </span>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {isOverdue
                          ? `${Math.abs(daysUntil)} days overdue`
                          : `${daysUntil} days until due`}
                      </span>
                      <span className="text-xs text-slate-500">
                        Due: {dueDate.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="text-center py-12 text-slate-500">No deadlines found</div>
          )}
        </div>
      </Suspense>
    </div>
  );
}
