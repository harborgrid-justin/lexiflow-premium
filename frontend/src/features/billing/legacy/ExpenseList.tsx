/**
 * ExpenseList Component
 * Display and filter expenses with receipt viewing
 */

import { useTheme } from '@/contexts/theme/ThemeContext';
import type { FirmExpense } from '@/types/financial';
import { DollarSign, FileText, Filter, Receipt } from 'lucide-react';
import React, { useState } from 'react';
import { Form, Link } from 'react-router';

interface ExpenseListProps {
  expenses: FirmExpense[];
  filters?: Record<string, unknown>;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, filters }) => {
  const { theme } = useTheme();
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
          className={cn("flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium shadow-sm transition-colors", theme.surface.default, theme.border.default, theme.text.primary, `hover:${theme.surface.highlight}`)}
        >
          <Filter className="h-4 w-4" />
          Filters
        </button>

        <div className={cn("flex items-center gap-1 text-sm", theme.text.secondary)}>
          <DollarSign className="h-4 w-4" />
          <span className="font-medium">Total: ${totalAmount.toLocaleString()}</span>
        </div>
      </div>

      {showFilters && (
        <Form method="get" className={cn("rounded-lg border p-4", theme.surface.subtle, theme.border.default)}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <label className={cn("block text-sm font-medium", theme.text.secondary)}>
                Case
              </label>
              <select
                name="caseId"
                defaultValue={(filters?.caseId as string) || ''}
                className={cn("mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500", theme.surface.default, theme.border.default, theme.text.primary)}
              >
                <option value="">All Cases</option>
                <option value="C-2024-001">Martinez v. TechCorp</option>
                <option value="C-2024-112">OmniGlobal Merger</option>
              </select>
            </div>

            <div>
              <label className={cn("block text-sm font-medium", theme.text.secondary)}>
                Category
              </label>
              <select
                name="category"
                defaultValue={(filters?.category as string) || ''}
                className={cn("mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500", theme.surface.default, theme.border.default, theme.text.primary)}
              >
                <option value="">All Categories</option>
                <option value="Filing Fees">Filing Fees</option>
                <option value="Travel">Travel</option>
                <option value="Expert Witness">Expert Witness</option>
              </select>
            </div>

            <div>
              <label className={cn("block text-sm font-medium", theme.text.secondary)}>
                Status
              </label>
              <select
                name="status"
                defaultValue={(filters?.status as string) || ''}
                className={cn("mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500", theme.surface.default, theme.border.default, theme.text.primary)}
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
                className={cn("w-full rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2", theme.interactive.primary, "focus:ring-blue-500")}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </Form>
      )}

      {/* Expenses Table */}
      <div className={cn("overflow-hidden rounded-lg border shadow", theme.surface.default, theme.border.default)}>
        <table className={cn("min-w-full divide-y", theme.border.default)}>
          <thead className={cn(theme.surface.subtle)}>
            <tr>
              <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                Date
              </th>
              <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                Category
              </th>
              <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                Description
              </th>
              <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                Vendor
              </th>
              <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                Amount
              </th>
              <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                Status
              </th>
              <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                Receipt
              </th>
              <th className={cn("px-6 py-3 text-right text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className={cn("divide-y", theme.border.default, theme.surface.default)}>
            {expenses.map((expense) => (
              <tr key={expense.id} className={cn("transition-colors", `hover:${theme.surface.subtle}`)}>
                <td className={cn("whitespace-nowrap px-6 py-4 text-sm", theme.text.primary)}>
                  {new Date(expense.date).toLocaleDateString()}
                </td>
                <td className={cn("whitespace-nowrap px-6 py-4 text-sm", theme.text.primary)}>
                  {expense.category}
                </td>
                <td className={cn("px-6 py-4 text-sm", theme.text.secondary)}>
                  <div className="max-w-xs truncate" title={expense.description}>
                    {expense.description}
                  </div>
                </td>
                <td className={cn("whitespace-nowrap px-6 py-4 text-sm", theme.text.primary)}>
                  {expense.vendor}
                </td>
                <td className={cn("whitespace-nowrap px-6 py-4 text-sm font-medium", theme.text.primary)}>
                  ${expense.amount.toLocaleString()}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  {getStatusBadge(expense.status)}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  {(expense as unknown as { receipt: boolean }).receipt ? (
                    <button
                      type="button"
                      className={cn("flex items-center gap-1", theme.text.accent)}
                    >
                      <FileText className="h-4 w-4" />
                      <span className="text-xs">View</span>
                    </button>
                  ) : (
                    <span className={cn("text-xs", theme.text.muted)}>No receipt</span>
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
                        className={cn(theme.text.success, "hover:underline")}
                      >
                        Approve
                      </button>
                    )}
                    <Link
                      to={`/billing/expenses/${expense.id}/edit`}
                      className={cn(theme.text.accent, "hover:underline")}
                    >
                      Edit
                    </Link>
                    <button
                      type="submit"
                      name="intent"
                      value="delete"
                      className={cn(theme.text.error, "hover:underline")}
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
            <Receipt className={cn("mx-auto h-12 w-12", theme.text.muted)} />
            <h3 className={cn("mt-2 text-sm font-medium", theme.text.primary)}>
              No expenses
            </h3>
            <p className={cn("mt-1 text-sm", theme.text.secondary)}>
              Get started by creating a new expense.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
