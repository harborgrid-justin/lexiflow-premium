/**
 * Templates List Page - Server Component
 * Lists document templates with filtering
 */
import React from 'react';
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Templates | LexiFlow',
  description: 'Document templates management',
};

interface Template {
  id: string;
  name: string;
  category: string;
  lastModified: string;
  usageCount: number;
}

async function TemplatesList() {
  const templates: Template[] = await apiFetch(API_ENDPOINTS.TEMPLATES.LIST);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Link
            key={template.id}
            href={`/templates/${template.id}`}
            className="block p-6 bg-white dark:bg-slate-800 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
              {template.name}
            </h3>
            <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
              <p>
                <span className="font-medium">Category:</span> {template.category}
              </p>
              <p>
                <span className="font-medium">Last Modified:</span>{' '}
                {new Date(template.lastModified).toLocaleDateString()}
              </p>
              <p>
                <span className="font-medium">Usage Count:</span> {template.usageCount}
              </p>
            </div>
          </Link>
        ))}
      </div>
      {templates.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          No templates found. Create your first template.
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="p-6 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse">
          <div className="h-6 bg-slate-300 dark:bg-slate-700 rounded w-3/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded"></div>
            <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-5/6"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function TemplatesPage(): Promise<React.JSX.Element> {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Templates</h1>
        <Link
          href="/templates/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + New Template
        </Link>
      </div>

      <Suspense fallback={<LoadingState />}>
        <TemplatesList />
      </Suspense>
    </div>
  );
}
