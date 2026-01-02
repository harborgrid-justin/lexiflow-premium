/**
 * Case Intake Page - Server Component with Data Fetching
 * New case intake and onboarding with workflow templates
 */
import React from 'react';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Case Intake | LexiFlow',
  description: 'New case intake and onboarding',
};

export default async function CaseIntakePage(): Promise<React.JSX.Element> {
  // Fetch intake templates and workflow
  let templates = [];

  try {
    templates = await apiFetch(API_ENDPOINTS.WORKFLOW.TEMPLATES);
  } catch (error) {
    console.error('Failed to load intake templates:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-6">Case Intake</h1>
      <Suspense fallback={<div>Loading intake form...</div>}>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">New Case Intake Form</h2>
          {templates && templates.length > 0 ? (
            <div className="space-y-4">
              {templates.filter((t: any) => t.type === 'intake').map((template: any) => (
                <div key={template.id} className="p-4 border rounded hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer">
                  <h3 className="font-semibold">{template.name}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{template.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-600 dark:text-slate-400">No intake templates available</p>
          )}
        </div>
      </Suspense>
    </div>
  );
}
