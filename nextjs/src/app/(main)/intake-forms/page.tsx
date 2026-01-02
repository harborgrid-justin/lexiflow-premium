/**
 * Intake Forms List Page - Server Component with Data Fetching
 * Lists all client intake forms with form name, submission date, assigned to
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = {
  title: 'Intake Forms | LexiFlow',
  description: 'Manage client intake forms',
};

export default async function IntakeFormsPage(): Promise<JSX.Element> {
  let intakeForms: any[] = [];

  try {
    intakeForms = await apiFetch(API_ENDPOINTS.INTAKE_FORMS.LIST) as any[];
  } catch (error) {
    console.error('Failed to load intake forms:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Client Intake Forms</h1>
        <Link
          href="/intake-forms/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          New Intake Form
        </Link>
      </div>

      <Suspense fallback={<div>Loading intake forms...</div>}>
        <div className="bg-white dark:bg-slate-800 rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Form ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Form Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Client Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Submission Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {intakeForms && intakeForms.length > 0 ? (
                intakeForms.map((form: any) => (
                  <tr key={form.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/intake-forms/${form.id}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {form.formNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">{form.formName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {form.clientName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(form.submissionDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm mr-2">
                          {form.assignedTo?.charAt(0).toUpperCase()}
                        </div>
                        {form.assignedTo}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded ${form.status === 'Converted'
                          ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                          : form.status === 'Pending Review'
                            ? 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
                            : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                          }`}
                      >
                        {form.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No intake forms found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Suspense>
    </div>
  );
}
