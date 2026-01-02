/**
 * Expense Detail Page - Server Component with Data Fetching
 * Dynamic route for individual expense view
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface ExpenseDetailPageProps {
  params: Promise<{ id: string }>;
}


// Static Site Generation (SSG) Configuration
export const dynamic = 'force-static';
export const revalidate = 1800; // Revalidate every 30 minutes

/**
 * Generate static params for expenses detail pages
 *
 * Next.js 16 will pre-render these pages at build time.
 * With revalidate, pages are regenerated in the background when stale.
 *
 * @returns Array of { id: string } objects for static generation
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    // Fetch list of expenses IDs for static generation
    const response = await apiFetch<any[]>(
      API_ENDPOINTS.EXPENSES.LIST + '?limit=100&fields=id'
    );

    // Map to the required { id: string } format
    return (response || []).map((item: any) => ({
      id: String(item.id),
    }));
  } catch (error) {
    console.warn(`[generateStaticParams] Failed to fetch expenses list:`, error);
    // Return empty array to continue build without static params
    // Pages will be generated on-demand (ISR) instead
    return [];
  }
}

export async function generateMetadata({
  params,
}: ExpenseDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const expense = await apiFetch(API_ENDPOINTS.EXPENSES.DETAIL(id)) as any;
    return {
      title: `Expense: ${expense.description} | LexiFlow`,
      description: `Expense details for ${expense.description}`,
    };
  } catch (error) {
    return { title: 'Expense Not Found' };
  }
}

export default async function ExpenseDetailPage({ params }: ExpenseDetailPageProps): Promise<JSX.Element> {
  const { id } = await params;

  let expense: any;
  try {
    expense = await apiFetch(API_ENDPOINTS.EXPENSES.DETAIL(id));
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading expense...</div>}>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold mb-4">Expense</h1>
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-2">{expense.description}</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Category: {expense.category}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">${expense.amount}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">{expense.status}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t pt-4 mt-4">
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Date:</span>
                <span className="ml-2">{expense.date}</span>
              </div>
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Submitted By:</span>
                <span className="ml-2">{expense.submittedBy}</span>
              </div>
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Case:</span>
                <span className="ml-2">{expense.caseId || 'N/A'}</span>
              </div>
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Billable:</span>
                <span className="ml-2">{expense.billable ? 'Yes' : 'No'}</span>
              </div>
            </div>
            {expense.receipt && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Receipt</h3>
                <a href={expense.receipt} className="text-blue-600 hover:underline">
                  View Receipt
                </a>
              </div>
            )}
          </div>
        </div>
      </Suspense>
    </div>
  );
}
