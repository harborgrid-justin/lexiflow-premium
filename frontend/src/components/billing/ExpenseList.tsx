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

  const resolveToken = (value: unknown): string => {
    if (typeof value === "function") {
      return String((value as () => unknown)());
    }
    return String(value);
  };

  const filterValue = (value: unknown): string =>
    typeof value === "string" ? value : "";

  const borderInput = resolveToken(theme.border.input("", "", undefined, ""));
  const surfaceDefault = resolveToken(theme.surface.default);
  const textPrimary = resolveToken(theme.text.primary);
  const primaryColor = resolveToken(tokens.colors.primary);
  const primaryHover = resolveToken(tokens.colors.primaryDark);
  const surfaceBase = resolveToken(tokens.colors.surface);
  const borderColor = resolveToken(tokens.colors.border);
  const textColor = resolveToken(tokens.colors.text);
  const textMuted = resolveToken(tokens.colors.textMuted);
  const surfaceHover = resolveToken(tokens.colors.surfaceHover);
  const infoColor = resolveToken(tokens.colors.info);
  const successColor = resolveToken(tokens.colors.success);
  const warningColor = resolveToken(tokens.colors.warning);
  const errorColor = resolveToken(tokens.colors.error);
  const accentColor = resolveToken(tokens.colors.accent);

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, { bg: string; text: string }> = {
      Draft: { bg: `${textMuted}20`, text: textMuted },
      Submitted: { bg: `${infoColor}20`, text: infoColor },
      Approved: { bg: `${successColor}20`, text: successColor },
      Billed: { bg: `${accentColor}20`, text: accentColor },
      Rejected: { bg: `${errorColor}20`, text: errorColor },
      Paid: { bg: `${successColor}20`, text: successColor },
      Pending: { bg: `${warningColor}20`, text: warningColor },
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
            backgroundColor: surfaceBase,
            border: `1px solid ${borderColor}`,
            borderRadius: tokens.borderRadius.md,
            color: textColor,
            boxShadow: tokens.shadows.sm
          }}
        >
          <Filter className="h-4 w-4" />
          Filters
        </button>

        <div className="flex items-center gap-1 text-sm" style={{ color: textMuted }}>
          <DollarSign className="h-4 w-4" />
          <span className="font-medium">Total: ${totalAmount.toLocaleString()}</span>
        </div>
      </div>

      {showFilters && (
        <Form method="get" className="p-4" style={{
          backgroundColor: tokens.colors.backgroundSecondary,
          border: `1px solid ${borderColor}`,
          borderRadius: tokens.borderRadius.lg
        }}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <label className="block text-sm font-medium" style={{ color: textColor }}>
                Case
              </label>
              <select
                name="caseId"
                defaultValue={filterValue(filters?.caseId)}
                className="mt-1 block w-full px-3 py-2 text-sm focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: surfaceBase,
                  border: `1px solid ${borderColor}`,
                  borderRadius: tokens.borderRadius.md,
                  color: textColor,
                  boxShadow: tokens.shadows.sm
                }}
              >
                <option value="">All Cases</option>
                <option value="C-2024-001">Martinez v. TechCorp</option>
                <option value="C-2024-112">OmniGlobal Merger</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: textPrimary }}>
                Category
              </label>
              <select
                name="category"
                defaultValue={filterValue(filters?.category)}
                style={{
                  marginTop: tokens.spacing.compact.xs,
                  width: '100%',
                  borderRadius: tokens.borderRadius.md,
                  borderWidth: '1px',
                  borderColor: borderInput,
                  backgroundColor: surfaceDefault,
                  padding: `${tokens.spacing.compact.sm} ${tokens.spacing.normal.sm}`,
                  fontSize: tokens.typography.fontSize.sm,
                  color: textPrimary,
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
              <label style={{ display: 'block', fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: textPrimary }}>
                Status
              </label>
              <select
                name="status"
                defaultValue={filterValue(filters?.status)}
                style={{
                  marginTop: tokens.spacing.compact.xs,
                  width: '100%',
                  borderRadius: tokens.borderRadius.md,
                  borderWidth: '1px',
                  borderColor: borderInput,
                  backgroundColor: surfaceDefault,
                  padding: `${tokens.spacing.compact.sm} ${tokens.spacing.normal.sm}`,
                  fontSize: tokens.typography.fontSize.sm,
                  color: textPrimary,
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
                  backgroundColor: primaryColor,
                  padding: `${tokens.spacing.compact.sm} ${tokens.spacing.normal.md}`,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: resolveToken(tokens.colors.textOnPrimary),
                  boxShadow: tokens.shadows.sm,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = primaryHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = primaryColor;
                }}
                className={cn("focus:outline-none focus:ring-2 focus:ring-offset-2")}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </Form>
      )}

      {/* Expenses Table */}
      <div style={{ overflow: 'hidden', borderRadius: tokens.borderRadius.lg, borderWidth: '1px', borderColor: resolveToken(theme.border.default), backgroundColor: surfaceDefault, boxShadow: tokens.shadows.sm }}>
        <table style={{ minWidth: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead style={{ backgroundColor: resolveToken(theme.surface.muted) }}>
            <tr>
              <th style={{ padding: `${tokens.spacing.normal.sm} ${tokens.spacing.normal.lg}`, textAlign: 'left', fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, textTransform: 'uppercase', letterSpacing: '0.05em', color: resolveToken(theme.text.secondary) }}>
                Date
              </th>
              <th style={{ padding: `${tokens.spacing.normal.sm} ${tokens.spacing.normal.lg}`, textAlign: 'left', fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, textTransform: 'uppercase', letterSpacing: '0.05em', color: resolveToken(theme.text.secondary) }}>
                Category
              </th>
              <th style={{ padding: `${tokens.spacing.normal.sm} ${tokens.spacing.normal.lg}`, textAlign: 'left', fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, textTransform: 'uppercase', letterSpacing: '0.05em', color: resolveToken(theme.text.secondary) }}>
                Description
              </th>
              <th style={{ padding: `${tokens.spacing.normal.sm} ${tokens.spacing.normal.lg}`, textAlign: 'left', fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, textTransform: 'uppercase', letterSpacing: '0.05em', color: resolveToken(theme.text.secondary) }}>
                Vendor
              </th>
              <th style={{ padding: `${tokens.spacing.normal.sm} ${tokens.spacing.normal.lg}`, textAlign: 'left', fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, textTransform: 'uppercase', letterSpacing: '0.05em', color: resolveToken(theme.text.secondary) }}>
                Amount
              </th>
              <th style={{ padding: `${tokens.spacing.normal.sm} ${tokens.spacing.normal.lg}`, textAlign: 'left', fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, textTransform: 'uppercase', letterSpacing: '0.05em', color: resolveToken(theme.text.secondary) }}>
                Status
              </th>
              <th style={{ padding: `${tokens.spacing.normal.sm} ${tokens.spacing.normal.lg}`, textAlign: 'left', fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, textTransform: 'uppercase', letterSpacing: '0.05em', color: resolveToken(theme.text.secondary) }}>
                Receipt
              </th>
              <th style={{ padding: `${tokens.spacing.normal.sm} ${tokens.spacing.normal.lg}`, textAlign: 'right', fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, textTransform: 'uppercase', letterSpacing: '0.05em', color: resolveToken(theme.text.secondary) }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody style={{ backgroundColor: surfaceBase }}>
            {expenses.map((expense) => (
              <tr
                key={expense.id}
                style={{ borderTop: `1px solid ${borderColor}` }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = surfaceHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = surfaceBase;
                }}
              >
                <td className="whitespace-nowrap px-6 py-4 text-sm" style={{ color: textColor }}>
                  {new Date(expense.date).toLocaleDateString()}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm" style={{ color: textColor }}>
                  {expense.category}
                </td>
                <td className="px-6 py-4 text-sm" style={{ color: textMuted }}>
                  <div className="max-w-xs truncate" title={expense.description}>
                    {expense.description}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm" style={{ color: textColor }}>
                  {expense.vendor}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium" style={{ color: textColor }}>
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
                      style={{ color: resolveToken(tokens.colors.primary) }}
                    >
                      <FileText className="h-4 w-4" />
                      <span className="text-xs">View</span>
                    </button>
                  ) : (
                    <span className="text-xs" style={{ color: textMuted }}>No receipt</span>
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
                        style={{ color: successColor }}
                      >
                        Approve
                      </button>
                    )}
                    <Link
                      to={`/billing/expenses/${expense.id}/edit`}
                      style={{ color: resolveToken(tokens.colors.primary) }}
                    >
                      Edit
                    </Link>
                    <button
                      type="submit"
                      name="intent"
                      value="delete"
                      style={{ color: errorColor }}
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
            <Receipt className="mx-auto h-12 w-12" style={{ color: textMuted }} />
            <h3 className="mt-2 text-sm font-medium" style={{ color: textColor }}>
              No expenses
            </h3>
            <p className="mt-1 text-sm" style={{ color: textMuted }}>
              Get started by creating a new expense.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
