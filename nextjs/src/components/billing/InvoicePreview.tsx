/**
 * InvoicePreview Component
 * PDF-like preview of invoice with professional formatting
 */

import React from 'react';
import type { Invoice } from '@/types/financial';

interface InvoicePreviewProps {
  invoice: Invoice;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice }) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {/* Invoice Header */}
      <div className="flex items-start justify-between border-b border-gray-200 pb-8 dark:border-gray-700">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">INVOICE</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Invoice #: {invoice.invoiceNumber}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Date: {new Date(invoice.invoiceDate).toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Due Date: {new Date(invoice.dueDate).toLocaleDateString()}
          </p>
        </div>

        <div className="text-right">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">LexiFlow Law Firm</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            123 Legal Avenue, Suite 400
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            San Francisco, CA 94102
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            (415) 555-0123
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            billing@lexiflow.com
          </p>
        </div>
      </div>

      {/* Bill To Section */}
      <div className="mt-8">
        <h3 className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">
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
