/**
 * Template Detail Page - Server Component
 * Template editor with variables, preview, and versions
 */
import React from 'react';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';


interface TemplateDetailPageProps {
  params: Promise<{ id: string }>;
}


// Static Site Generation (SSG) Configuration
export const dynamic = 'force-dynamic';
export const revalidate = 7200; // Revalidate every 120 minutes

/**
 * Generate static params for templates detail pages
 *
 * Next.js 16 will pre-render these pages at build time.
 * With revalidate, pages are regenerated in the background when stale.
 *
 * @returns Array of { id: string } objects for static generation
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    // Fetch list of templates IDs for static generation
    const response = await apiFetch<any[]>(
      API_ENDPOINTS.TEMPLATES.LIST + '?limit=100&fields=id'
    );

    // Map to the required { id: string } format
    return (response || []).map((item: any) => ({
      id: String(item.id),
    }));
  } catch (error) {
    console.warn(`[generateStaticParams] Failed to fetch templates list:`, error);
    // Return empty array to continue build without static params
    // Pages will be generated on-demand (ISR) instead
    return [];
  }
}

export async function generateMetadata({ params }: TemplateDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const template = await apiFetch(API_ENDPOINTS.TEMPLATES.DETAIL(id));
    return {
      title: `${template.name} | Templates | LexiFlow`,
      description: `Edit template: ${template.name}`,
    };
  } catch {
    return { title: 'Template Not Found' };
  }
}

export default async function TemplateDetailPage({ params }: TemplateDetailPageProps): Promise<React.JSX.Element> {
  const { id } = await params;

  let template;
  let versions;
  try {
    [template, versions] = await Promise.all([
      apiFetch(API_ENDPOINTS.TEMPLATES.DETAIL(id)),
      apiFetch(API_ENDPOINTS.TEMPLATES.VERSIONS(id)),
    ]);
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/templates" className="text-blue-600 hover:underline mb-2 inline-block">
          ← Back to Templates
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          {template.name}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Category: {template.category}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Template Editor</h2>
            <div className="border border-slate-300 dark:border-slate-600 rounded p-4 min-h-[400px] font-mono text-sm">
              <pre className="whitespace-pre-wrap">{template.content}</pre>
            </div>
          </div>

          {/* Preview Section */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Preview</h2>
            <div className="border border-slate-300 dark:border-slate-600 rounded p-4 min-h-[300px] bg-slate-50 dark:bg-slate-900">
              <div dangerouslySetInnerHTML={{ __html: template.renderedPreview || template.content }} />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Variables */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Variables</h2>
            {template.variables && template.variables.length > 0 ? (
              <ul className="space-y-2">
                {template.variables.map((variable: any) => (
                  <li key={variable.name} className="text-sm">
                    <code className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                      {'{'}
                      {variable.name}
                      {'}'}
                    </code>
                    <span className="text-slate-600 dark:text-slate-400 ml-2">
                      {variable.description}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">No variables defined</p>
            )}
          </div>

          {/* Versions */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Version History</h2>
            {versions && versions.length > 0 ? (
              <ul className="space-y-3">
                {versions.slice(0, 5).map((version: any) => (
                  <li key={version.id} className="text-sm border-l-2 border-slate-300 pl-3">
                    <div className="font-medium">v{version.version}</div>
                    <div className="text-slate-600 dark:text-slate-400 text-xs">
                      {new Date(version.createdAt).toLocaleString()}
                    </div>
                    <div className="text-slate-500 dark:text-slate-500 text-xs">
                      by {version.createdBy}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">No version history</p>
            )}
          </div>

          {/* Metadata */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Metadata</h2>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="font-medium text-slate-700 dark:text-slate-300">Usage Count</dt>
                <dd className="text-slate-600 dark:text-slate-400">{template.usageCount}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-700 dark:text-slate-300">Last Modified</dt>
                <dd className="text-slate-600 dark:text-slate-400">
                  {new Date(template.lastModified).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-slate-700 dark:text-slate-300">Created</dt>
                <dd className="text-slate-600 dark:text-slate-400">
                  {new Date(template.createdAt).toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
