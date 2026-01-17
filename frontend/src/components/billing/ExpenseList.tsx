/**
 * ExpenseList Component
 * Display and filter expenses with receipt viewing
 */

import { DollarSign, FileText, Filter, Receipt } from 'lucide-react';
import React, { useState } from 'react';
import { Form, Link } from 'react-router';

import { useTheme } from "@/hooks/useTheme";
import { cn } from '@/lib/cn';

import type { FirmExpense } from '@/types/financial';

interface ExpenseListProps {
  expenses: FirmExpense[];
  filters?: Record<string, unknown>;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, filters }) => {
  const { tokens, theme } = useTheme();
  const [showFilters, setShowFilters] = useState(false);

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, { bg: string; text: string }> = {
      Draft: { bg: tokens.colors.textMuted + '20', text: tokens.colors.textMuted },
      Submitted: { bg: tokens.colors.info + '20', text: tokens.colors.info },
      Approved: { bg: tokens.colors.success + '20', text: tokens.colors.success },
      Billed: { bg: tokens.colors.accent + '20', text: tokens.colors.accent },
      Rejected: { bg: tokens.colors.error + '20', text: tokens.colors.error },
      Paid: { bg: tokens.colors.success + '20', text: tokens.colors.success },
      Pending: { bg: tokens.colors.warning + '20', text: tokens.colors.warning },
    };

    const style = (statusStyles[status] ?? statusStyles.Draft)!;

    return (
      <span
        className="inline-flex px-2 py-1 text-xs font-semibold"
        style={{
          backgroundColor: style.bg,
          color: style.text,
          borderRadius: tokens.borderRadius.full
        }}
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
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium"
          style={{
            backgroundColor: tokens.colors.surface,
            border: `1px solid ${tokens.colors.border}`,
            borderRadius: tokens.borderRadius.md,
            color: tokens.colors.text,
            boxShadow: tokens.shadows.sm
          }}
        >
          <Filter className="h-4 w-4" />
          Filters
        </button>

        <div className="flex items-center gap-1 text-sm" style={{ color: tokens.colors.textMuted }}>
          <DollarSign className="h-4 w-4" />
          <span className="font-medium">Total: ${totalAmount.toLocaleString()}</span>
        </div>
      </div>

      {showFilters && (
        <Form method="get" className="p-4" style={{
          backgroundColor: tokens.colors.backgroundSecondary,
          border: `1px solid ${tokens.colors.border}`,
          borderRadius: tokens.borderRadius.lg
        }}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <label className="block text-sm font-medium" style={{ color: tokens.colors.text }}>
                Case
              </label>
              <select
                name="caseId"
                defaultValue={(filters?.caseId as string) || ''}
                className="mt-1 block w-full px-3 py-2 text-sm focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: tokens.colors.surface,
                  border: `1px solid ${tokens.colors.border}`,
                  borderRadius: tokens.borderRadius.md,
                  color: tokens.colors.text,
                  boxShadow: tokens.shadows.sm
                }}
              >
                <option value="">All Cases</option>
                <option value="C-2024-001">Martinez v. TechCorp</option>
                <option value="C-2024-112">OmniGlobal Merger</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: theme.text.primary }}>
                Category
              </label>
              <select
                name="category"
                defaultValue={(filters?.category as string) || ''}
                style={{
                  marginTop: tokens.spacing.compact.xs,
                  width: '100%',
                  borderRadius: tokens.borderRadius.md,
                  borderWidth: '1px',
                  borderColor: theme.border.input,
                  backgroundColor: theme.surface.default,
                  padding: `${tokens.spacing.compact.sm} ${tokens.spacing.normal.sm}`,
                  fontSize: tokens.typography.fontSize.sm,
                  color: theme.text.primary,
                  boxShadow: tokens.shadows.sm,
                }}
                className="focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                <option value="Filing Fees">Filing Fees</option>
                <option value="Travel">Travel</option>
                <option value="Expert Witness">Expert Witness</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: theme.text.primary }}>
                Status
              </label>
              <select
                name="status"
                defaultValue={(filters?.status as string) || ''}
                style={{
                  marginTop: tokens.spacing.compact.xs,
                  width: '100%',
                  borderRadius: tokens.borderRadius.md,
                  borderWidth: '1px',
                  borderColor: theme.border.input,
                  backgroundColor: theme.surface.default,
                  padding: `${tokens.spacing.compact.sm} ${tokens.spacing.normal.sm}`,
                  fontSize: tokens.typography.fontSize.sm,
                  color: theme.text.primary,
                  boxShadow: tokens.shadows.sm,
                }}
                className="focus:border-blue-500 focus:outline-none focus:ring-blue-500"
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
                style={{
                  width: '100%',
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: theme.button.primary.bg,
                  padding: `${tokens.spacing.compact.sm} ${tokens.spacing.normal.md}`,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: theme.button.primary.text,
                  boxShadow: tokens.shadows.sm,
                }}
                className={cn(`hover:${theme.colors.hoverPrimary}`, "focus:outline-none focus:ring-2 focus:ring-offset-2", theme.colors.primary)}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </Form>
      )}

      {/* Expenses Table */}
      <div style={{ overflow: 'hidden', borderRadius: tokens.borderRadius.lg, borderWidth: '1px', borderColor: theme.border.default, backgroundColor: theme.surface.default, boxShadow: tokens.shadows.sm }}>
        <table style={{ minWidth: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead style={{ backgroundColor: theme.surface.muted }}>
            <tr>
              <th style={{ padding: `${tokens.spacing.normal.sm} ${tokens.spacing.normal.lg}`, textAlign: 'left', fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, textTransform: 'uppercase', letterSpacing: '0.05em', color: theme.text.secondary }}>
                Date
              </th>
              <th style={{ padding: `${tokens.spacing.normal.sm} ${tokens.spacing.normal.lg}`, textAlign: 'left', fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, textTransform: 'uppercase', letterSpacing: '0.05em', color: theme.text.secondary }}>
                Category
              </th>
              <th style={{ padding: `${tokens.spacing.normal.sm} ${tokens.spacing.normal.lg}`, textAlign: 'left', fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, textTransform: 'uppercase', letterSpacing: '0.05em', color: theme.text.secondary }}>
                Description
              </th>
              <th style={{ padding: `${tokens.spacing.normal.sm} ${tokens.spacing.normal.lg}`, textAlign: 'left', fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, textTransform: 'uppercase', letterSpacing: '0.05em', color: theme.text.secondary }}>
                Vendor
              </th>
              <th style={{ padding: `${tokens.spacing.normal.sm} ${tokens.spacing.normal.lg}`, textAlign: 'left', fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, textTransform: 'uppercase', letterSpacing: '0.05em', color: theme.text.secondary }}>
                Amount
              </th>
              <th style={{ padding: `${tokens.spacing.normal.sm} ${tokens.spacing.normal.lg}`, textAlign: 'left', fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, textTransform: 'uppercase', letterSpacing: '0.05em', color: theme.text.secondary }}>
                Status
              </th>
              <th style={{ padding: `${tokens.spacing.normal.sm} ${tokens.spacing.normal.lg}`, textAlign: 'left', fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, textTransform: 'uppercase', letterSpacing: '0.05em', color: theme.text.secondary }}>
                Receipt
              </th>
              <th style={{ padding: `${tokens.spacing.normal.sm} ${tokens.spacing.normal.lg}`, textAlign: 'right', fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, textTransform: 'uppercase', letterSpacing: '0.05em', color: theme.text.secondary }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody style={{ backgroundColor: tokens.colors.surface }}>
            {expenses.map((expense) => (
              <tr
                key={expense.id}
                style={{ borderTop: `1px solid ${tokens.colors.border}` }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = tokens.colors.surfaceHover}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = tokens.colors.surface}
              >
                <td className="whitespace-nowrap px-6 py-4 text-sm" style={{ color: tokens.colors.text }}>
                  {new Date(expense.date).toLocaleDateString()}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm" style={{ color: tokens.colors.text }}>
                  {expense.category}
                </td>
                <td className="px-6 py-4 text-sm" style={{ color: tokens.colors.textMuted }}>
                  <div className="max-w-xs truncate" title={expense.description}>
                    {expense.description}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm" style={{ color: tokens.colors.text }}>
                  {expense.vendor}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium" style={{ color: tokens.colors.text }}>
                  ${expense.amount.toLocaleString()}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  {getStatusBadge(expense.status)}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  {(expense as unknown as { receipt: boolean }).receipt ? (
                    <button
                      type="button"
                      className="flex items-center gap-1"
                      style={{ color: tokens.colors.primary }}
                    >
                      <FileText className="h-4 w-4" />
                      <span className="text-xs">View</span>
                    </button>
                  ) : (
                    <span className="text-xs" style={{ color: tokens.colors.textMuted }}>No receipt</span>
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
                        style={{ color: tokens.colors.success }}
                      >
                        Approve
                      </button>
                    )}
                    <Link
                      to={`/billing/expenses/${expense.id}/edit`}
                      style={{ color: tokens.colors.primary }}
                    >
                      Edit
                    </Link>
                    <button
                      type="submit"
                      name="intent"
                      value="delete"
                      style={{ color: tokens.colors.error }}
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
            <Receipt className="mx-auto h-12 w-12" style={{ color: tokens.colors.textMuted }} />
            <h3 className="mt-2 text-sm font-medium" style={{ color: tokens.colors.text }}>
              No expenses
            </h3>
            <p className="mt-1 text-sm" style={{ color: tokens.colors.textMuted }}>
              Get started by creating a new expense.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
