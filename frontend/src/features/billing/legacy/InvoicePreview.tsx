/**
 * InvoicePreview Component
 * PDF-like preview of invoice with professional formatting
 */

import { useTheme } from '@/features/theme';
import { cn } from '@/shared/lib/cn';
import type { Invoice } from '@/types/financial';
interface InvoicePreviewProps {
  invoice: Invoice;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice }) => {
  const { theme } = useTheme();

  return (
    <div className={cn("rounded-lg border p-8 shadow-sm", theme.surface.default, theme.border.default)}>
      {/* Invoice Header */}
      <div className={cn("flex items-start justify-between border-b pb-8", theme.border.default)}>
        <div>
          <h2 className={cn("text-3xl font-bold", theme.text.primary)}>INVOICE</h2>
          <p className={cn("mt-2 text-sm", theme.text.secondary)}>
            Invoice #: {invoice.invoiceNumber}
          </p>
          <p className={cn("text-sm", theme.text.secondary)}>
            Date: {new Date(invoice.invoiceDate).toLocaleDateString()}
          </p>
          <p className={cn("text-sm", theme.text.secondary)}>
            Due Date: {new Date(invoice.dueDate).toLocaleDateString()}
          </p>
        </div>

        <div className="text-right">
          <h3 className={cn("text-xl font-bold", theme.text.primary)}>LexiFlow Law Firm</h3>
          <p className={cn("mt-2 text-sm", theme.text.secondary)}>
            123 Legal Avenue, Suite 400
          </p>
          <p className={cn("text-sm", theme.text.secondary)}>
            San Francisco, CA 94102
          </p>
          <p className={cn("text-sm", theme.text.secondary)}>
            (415) 555-0123
          </p>
          <p className={cn("text-sm", theme.text.secondary)}>
            billing@lexiflow.com
          </p>
        </div>
      </div>

      {/* Bill To Section */}
      <div className="mt-8">
        <h3 className={cn("text-sm font-semibold uppercase", theme.text.muted)}>
          Bill To
        </h3>
        <div className="mt-2">
          <p className="font-medium text-gray-900 dark:text-gray-100">{invoice.clientName}</p>
          {invoice.billingAddress && (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-400">{invoice.billingAddress}</p>
            </>
          )}
        </div>
      </div>

      {/* Matter Information */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">
          Matter
        </h3>
        <p className="mt-1 text-gray-900 dark:text-gray-100">{invoice.matterDescription}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Billing Model: {invoice.billingModel}
        </p>
        {invoice.periodStart && invoice.periodEnd && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Period: {new Date(invoice.periodStart).toLocaleDateString()} - {new Date(invoice.periodEnd).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Line Items Table */}
      <div className="mt-8">
        <table className="min-w-full">
          <thead>
            <tr className="border-b-2 border-gray-300 dark:border-gray-600">
              <th className="pb-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Description
              </th>
              <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Quantity
              </th>
              <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Rate
              </th>
              <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {/* Time Charges */}
            {invoice.timeCharges > 0 && (
              <tr>
                <td className="py-4 text-sm text-gray-900 dark:text-gray-100">
                  Professional Services (Time)
                </td>
                <td className="py-4 text-right text-sm text-gray-900 dark:text-gray-100">
                  -
                </td>
                <td className="py-4 text-right text-sm text-gray-900 dark:text-gray-100">
                  -
                </td>
                <td className="py-4 text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                  ${invoice.timeCharges.toLocaleString()}
                </td>
              </tr>
            )}

            {/* Expense Charges */}
            {invoice.expenseCharges > 0 && (
              <tr>
                <td className="py-4 text-sm text-gray-900 dark:text-gray-100">
                  Expenses and Disbursements
                </td>
                <td className="py-4 text-right text-sm text-gray-900 dark:text-gray-100">
                  -
                </td>
                <td className="py-4 text-right text-sm text-gray-900 dark:text-gray-100">
                  -
                </td>
                <td className="py-4 text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                  ${invoice.expenseCharges.toLocaleString()}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Totals Section */}
      <div className="mt-8 flex justify-end">
        <div className="w-64">
          <div className="flex justify-between border-t border-gray-200 py-2 dark:border-gray-700">
            <span className="text-sm text-gray-600 dark:text-gray-400">Subtotal:</span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              ${invoice.subtotal.toLocaleString()}
            </span>
          </div>

          {invoice.taxAmount > 0 && (
            <div className="flex justify-between border-t border-gray-200 py-2 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Tax ({invoice.taxRate}%):
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                ${invoice.taxAmount.toLocaleString()}
              </span>
            </div>
          )}

          {invoice.discountAmount > 0 && (
            <div className="flex justify-between border-t border-gray-200 py-2 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">Discount:</span>
              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                -${invoice.discountAmount.toLocaleString()}
              </span>
            </div>
          )}

          <div className="flex justify-between border-t-2 border-gray-300 py-2 dark:border-gray-600">
            <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Total:
            </span>
            <span className="text-base font-bold text-gray-900 dark:text-gray-100">
              ${invoice.totalAmount.toLocaleString()}
            </span>
          </div>

          {invoice.paidAmount > 0 && (
            <>
              <div className="flex justify-between border-t border-gray-200 py-2 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">Paid:</span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  -${invoice.paidAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-t-2 border-gray-300 py-2 dark:border-gray-600">
                <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  Balance Due:
                </span>
                <span className="text-base font-bold text-red-600 dark:text-red-400">
                  ${invoice.balanceDue.toLocaleString()}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Notes and Terms */}
      {(invoice.notes || invoice.terms) && (
        <div className="mt-12 space-y-4 border-t border-gray-200 pt-8 dark:border-gray-700">
          {invoice.notes && (
            <div>
              <h3 className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">
                Notes
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{invoice.notes}</p>
            </div>
          )}

          {invoice.terms && (
            <div>
              <h3 className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">
                Terms
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{invoice.terms}</p>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 border-t border-gray-200 pt-8 text-center dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Thank you for your business. Please remit payment within {invoice.terms || '30 days'}.
        </p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          For questions about this invoice, please contact billing@lexiflow.com
        </p>
      </div>
    </div>
  );
};
