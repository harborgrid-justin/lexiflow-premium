/**
 * Expenses List Page - Server Component with Data Fetching
 * List view of all expenses
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Expenses | LexiFlow',
  description: 'Manage expenses and reimbursements',
};

export default async function ExpensesPage() {
  // Fetch expenses from backend
  let expenses: any[] = [];

  try {
    expenses = await apiFetch(API_ENDPOINTS.EXPENSES.LIST) as any[];
  } catch (error) {
    console.error('Failed to load expenses:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Expenses</h1>
        <Link
          href="/expenses/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Expense
        </Link>
      </div>

      <Suspense fallback={<div>Loading expenses...</div>}>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-100 dark:bg-slate-700">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {expenses && expenses.length > 0 ? (
                expenses.map((expense: any) => (
                  <tr key={expense.id} className="border-t hover:bg-slate-50 dark:hover:bg-slate-700">
                    <td className="px-4 py-3">
                      <Link href={`/expenses/${expense.id}`} className="text-blue-600 hover:underline">
                        {expense.date}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{expense.description}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs rounded bg-slate-100 dark:bg-slate-700">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">${expense.amount}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs rounded bg-blue-100 dark:bg-blue-900">
                        {expense.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-600 dark:text-slate-400">
                    No expenses found
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
