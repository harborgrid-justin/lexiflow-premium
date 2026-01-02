/**
 * Expense Detail Page - Server Component with Data Fetching
 * Dynamic route for individual expense view
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

interface ExpenseDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ExpenseDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const expense = await apiFetch(API_ENDPOINTS.EXPENSES.DETAIL(id));
    return {
      title: `Expense: ${expense.description} | LexiFlow`,
      description: `Expense details for ${expense.description}`,
    };
  } catch (error) {
    return { title: 'Expense Not Found' };
  }
}

export default async function ExpenseDetailPage({ params }: ExpenseDetailPageProps) {
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
