/**
 * ExpenseList Component
 * Display and filter expenses with receipt viewing
 */

import type { FirmExpense } from '@/types/financial';
import { DollarSign, FileText, Filter, Receipt } from 'lucide-react';
import React, { useState } from 'react';
import { Form, Link } from 'react-router';

interface ExpenseListProps {
  expenses: FirmExpense[];
  filters?: Record<string, unknown>;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, filters }) => {
  const [showFilters, setShowFilters] = useState(false);

  const getStatusBadge = (status: string) => {
    const styles = {
      Draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      Submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      Approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      Billed: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      Rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      Paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    };

    return (
      <span
        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${styles[status as keyof typeof styles] || styles.Draft
          }`}
      >
        {status}
      </span>
    );
  };

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          <Filter className="h-4 w-4" />
          Filters
        </button>

        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
          <DollarSign className="h-4 w-4" />
          <span className="font-medium">Total: ${totalAmount.toLocaleString()}</span>
        </div>
      </div>

      {showFilters && (
        <Form method="get" className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Case
              </label>
              <select
                name="caseId"
                defaultValue={(filters?.caseId as string) || ''}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="">All Cases</option>
                <option value="C-2024-001">Martinez v. TechCorp</option>
                <option value="C-2024-112">OmniGlobal Merger</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Category
              </label>
              <select
                name="category"
                defaultValue={(filters?.category as string) || ''}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="">All Categories</option>
                <option value="Filing Fees">Filing Fees</option>
                <option value="Travel">Travel</option>
                <option value="Expert Witness">Expert Witness</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </label>
              <select
                name="status"
                defaultValue={(filters?.status as string) || ''}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Submitted">Submitted</option>
                <option value="Approved">Approved</option>
                <option value="Billed">Billed</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </Form>
      )}

      {/* Expenses Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Vendor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Receipt
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
            {expenses.map((expense) => (
              <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                  {new Date(expense.date).toLocaleDateString()}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                  {expense.category}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                  <div className="max-w-xs truncate" title={expense.description}>
                    {expense.description}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                  {expense.vendor}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                  ${expense.amount.toLocaleString()}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  {getStatusBadge(expense.status)}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  {(expense as unknown as { receipt: boolean }).receipt ? (
                    <button
                      type="button"
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <FileText className="h-4 w-4" />
                      <span className="text-xs">View</span>
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400">No receipt</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <Form method="post" className="inline-flex gap-2">
                    <input type="hidden" name="id" value={expense.id} />
                    {(expense.status as string) === 'Submitted' && (
                      <button
                        type="submit"
                        name="intent"
                        value="approve"
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                      >
                        Approve
                      </button>
                    )}
                    <Link
                      to={`/billing/expenses/${expense.id}/edit`}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Edit
                    </Link>
                    <button
                      type="submit"
                      name="intent"
                      value="delete"
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      onClick={(e) => {
                        if (!confirm('Delete this expense?')) {
                          e.preventDefault();
                        }
                      }}
                    >
                      Delete
                    </button>
                  </Form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {expenses.length === 0 && (
          <div className="py-12 text-center">
            <Receipt className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              No expenses
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by creating a new expense.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
