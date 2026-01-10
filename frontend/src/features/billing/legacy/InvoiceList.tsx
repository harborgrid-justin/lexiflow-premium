/**
 * InvoiceList Component
 * Display and filter invoices with status tracking
 */

import { useTheme } from '@/contexts/theme/ThemeContext';
import { cn } from '@/lib/utils';
import type { Invoice } from '@/types/financial';
import { FileText, Filter, Send } from 'lucide-react';
import React, { useState } from 'react';
import { Form, Link } from 'react-router';


interface InvoiceListProps {
  invoices: Invoice[];
  filters?: Record<string, unknown>;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({ invoices, filters }) => {
  const { theme } = useTheme();
  const [showFilters, setShowFilters] = useState(false);

  const getStatusBadge = (status: string) => {
    const styles = {
      Draft: cn(theme.status.neutral.bg, theme.status.neutral.text),
      Sent: cn(theme.status.info.bg, theme.status.info.text),
      Paid: cn(theme.status.success.bg, theme.status.success.text),
      Overdue: cn(theme.status.error.bg, theme.status.error.text),
      Cancelled: cn(theme.status.neutral.bg, theme.status.neutral.text),
      'Partially Paid': cn(theme.status.warning.bg, theme.status.warning.text),
    };

    return (
      <span
        className={cn("inline-flex rounded-full px-2 py-1 text-xs font-semibold", styles[status as keyof typeof styles] || styles.Draft)}
      >
        {status}
      </span>
    );
  };

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
                Client
              </label>
              <input
                type="text"
                name="clientId"
                defaultValue={(filters?.clientId as string) || ''}
                placeholder="Client ID or name"
                className={cn("mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500", theme.surface.default, theme.border.default, theme.text.primary)}
              />
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
                <option value="Sent">Sent</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
                <option value="Cancelled">Cancelled</option>
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

      {/* Invoices Table */}
      <div className={cn("overflow-hidden rounded-lg border shadow", theme.surface.default, theme.border.default)}>
        <table className={cn("min-w-full divide-y", theme.border.default)}>
          <thead className={cn(theme.surface.subtle)}>
            <tr>
              <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                Invoice #
              </th>
              <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                Client
              </th>
              <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                Matter
              </th>
              <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                Date
              </th>
              <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                Due Date
              </th>
              <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                Amount
              </th>
              <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                Balance Due
              </th>
              <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                Status
              </th>
              <th className={cn("px-6 py-3 text-right text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className={cn("divide-y", theme.border.default, theme.surface.default)}>
            {invoices.map((invoice) => (
              <tr key={invoice.id} className={cn("transition-colors", `hover:${theme.surface.subtle}`)}>
                <td className="whitespace-nowrap px-6 py-4">
                  <Link
                    to={`/billing/invoices/${invoice.id}`}
                    className={cn("text-sm font-medium", theme.text.accent)}
                  >
                    {invoice.invoiceNumber}
                  </Link>
                </td>
                <td className={cn("whitespace-nowrap px-6 py-4 text-sm", theme.text.primary)}>
                  {invoice.clientName}
                </td>
                <td className={cn("px-6 py-4 text-sm", theme.text.secondary)}>
                  <div className="max-w-xs truncate" title={invoice.matterDescription}>
                    {invoice.matterDescription}
                  </div>
                </td>
                <td className={cn("whitespace-nowrap px-6 py-4 text-sm", theme.text.primary)}>
                  {new Date(invoice.invoiceDate).toLocaleDateString()}
                </td>
                <td className={cn("whitespace-nowrap px-6 py-4 text-sm", theme.text.primary)}>
                  {new Date(invoice.dueDate).toLocaleDateString()}
                </td>
                <td className={cn("whitespace-nowrap px-6 py-4 text-sm font-medium", theme.text.primary)}>
                  ${invoice.totalAmount.toLocaleString()}
                </td>
                <td className={cn("whitespace-nowrap px-6 py-4 text-sm font-medium", theme.text.primary)}>
                  ${invoice.balanceDue.toLocaleString()}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  {getStatusBadge(invoice.status)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    {invoice.status === 'Draft' && (
                      <Form method="post" className="inline">
                        <input type="hidden" name="id" value={invoice.id} />
                        <button
                          type="submit"
                          name="intent"
                          value="send"
                          className={cn("flex items-center gap-1", theme.text.accent)}
                        >
                          <Send className="h-4 w-4" />
                          Send
                        </button>
                      </Form>
                    )}
                    <Link
                      to={`/billing/invoices/${invoice.id}`}
                      className={cn(theme.text.accent, "hover:underline")}
                    >
                      View
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {invoices.length === 0 && (
          <div className="py-12 text-center">
            <FileText className={cn("mx-auto h-12 w-12", theme.text.muted)} />
            <h3 className={cn("mt-2 text-sm font-medium", theme.text.primary)}>
              No invoices
            </h3>
            <p className={cn("mt-1 text-sm", theme.text.secondary)}>
              Get started by creating a new invoice.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
