/**
 * @module components/billing/InvoicePreview
 * @category Billing
 * @description Professional invoice preview with print/PDF export capabilities
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { memo } from 'react';
import { Download, Printer, Send, X } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
import { useTheme } from '@/contexts/theme/ThemeContext';
import { Currency } from '@/components/ui/atoms/Currency';
import { cn } from '@/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface InvoicePreviewProps {
  invoiceNumber?: string;
  onClose?: () => void;
  onDownloadPDF?: () => void;
  onSend?: () => void;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

const InvoicePreviewComponent: React.FC<InvoicePreviewProps> = ({
  invoiceNumber = 'INV-202601-0001',
  onClose,
  onDownloadPDF,
  onSend,
  className
}) => {
  const { theme } = useTheme();

  // Mock invoice data
  const invoice = {
    number: invoiceNumber,
    date: '2026-01-08',
    dueDate: '2026-02-07',
    firm: {
      name: 'LexiFlow Legal Services',
      address: '123 Legal Plaza',
      city: 'New York, NY 10001',
      phone: '(555) 123-4567',
      email: 'billing@lexiflow.com'
    },
    client: {
      name: 'Acme Corporation',
      contact: 'John Smith',
      address: '456 Business Ave',
      city: 'New York, NY 10002'
    },
    items: [
      {
        date: '2026-01-06',
        description: 'Client meeting regarding merger transaction',
        quantity: 2.5,
        rate: 350,
        amount: 875
      },
      {
        date: '2026-01-07',
        description: 'Legal research on Delaware corporate law',
        quantity: 3.0,
        rate: 350,
        amount: 1050
      },
      {
        date: '2026-01-08',
        description: 'Draft merger agreement',
        quantity: 4.5,
        rate: 350,
        amount: 1575
      },
      {
        date: '2026-01-05',
        description: 'Court filing fee',
        quantity: 1,
        rate: 435,
        amount: 435
      }
    ],
    subtotal: 3935,
    taxRate: 8.875,
    taxAmount: 349.23,
    total: 4284.23
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={cn("max-w-4xl mx-auto", className)}>
      {/* Action Bar */}
      <div className={cn(
        "rounded-t-lg shadow-sm border-x border-t p-4 flex items-center justify-between print:hidden",
        theme.surface.default,
        theme.border.default
      )}>
        <h2 className={cn("font-bold", theme.text.primary)}>Invoice Preview</h2>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors border",
              "hover:bg-slate-50 dark:hover:bg-slate-700"
            )}
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
          <button
            onClick={onDownloadPDF}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors border",
              "hover:bg-slate-50 dark:hover:bg-slate-700"
            )}
          >
            <Download className="h-4 w-4" />
            PDF
          </button>
          <button
            onClick={onSend}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
              "bg-blue-600 hover:bg-blue-700 text-white"
            )}
          >
            <Send className="h-4 w-4" />
            Send
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className={cn(
                "p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              )}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Invoice Document */}
      <div className={cn(
        "rounded-b-lg shadow-sm border p-8 bg-white print:shadow-none print:border-0",
        "dark:bg-white dark:text-slate-900"
      )}>
        {/* Header */}
        <div className="flex justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-600 mb-2">{invoice.firm.name}</h1>
            <p className="text-sm text-slate-600">{invoice.firm.address}</p>
            <p className="text-sm text-slate-600">{invoice.firm.city}</p>
            <p className="text-sm text-slate-600">{invoice.firm.phone}</p>
            <p className="text-sm text-slate-600">{invoice.firm.email}</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">INVOICE</h2>
            <p className="text-sm text-slate-600">Invoice #: <strong>{invoice.number}</strong></p>
            <p className="text-sm text-slate-600">Date: {new Date(invoice.date).toLocaleDateString()}</p>
            <p className="text-sm text-slate-600">Due Date: {new Date(invoice.dueDate).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Bill To */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-slate-900 mb-2">BILL TO:</h3>
          <p className="text-sm font-medium text-slate-900">{invoice.client.name}</p>
          <p className="text-sm text-slate-600">Attn: {invoice.client.contact}</p>
          <p className="text-sm text-slate-600">{invoice.client.address}</p>
          <p className="text-sm text-slate-600">{invoice.client.city}</p>
        </div>

        {/* Line Items */}
        <table className="w-full mb-8">
          <thead className="bg-slate-100 border-y border-slate-300">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase">Description</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-slate-700 uppercase">Qty/Hrs</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-slate-700 uppercase">Rate</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-slate-700 uppercase">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {invoice.items.map((item, index) => (
              <tr key={index}>
                <td className="px-4 py-3 text-sm text-slate-900">
                  {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </td>
                <td className="px-4 py-3 text-sm text-slate-900">{item.description}</td>
                <td className="px-4 py-3 text-sm text-slate-900 text-right">{item.quantity}</td>
                <td className="px-4 py-3 text-sm text-slate-900 text-right">
                  <Currency value={item.rate} />
                </td>
                <td className="px-4 py-3 text-sm text-slate-900 text-right font-medium">
                  <Currency value={item.amount} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64">
            <div className="flex justify-between py-2 text-sm">
              <span className="text-slate-600">Subtotal:</span>
              <span className="font-medium text-slate-900"><Currency value={invoice.subtotal} /></span>
            </div>
            <div className="flex justify-between py-2 text-sm">
              <span className="text-slate-600">Tax ({invoice.taxRate}%):</span>
              <span className="font-medium text-slate-900"><Currency value={invoice.taxAmount} /></span>
            </div>
            <div className="flex justify-between py-3 text-lg font-bold border-t-2 border-slate-300">
              <span className="text-slate-900">Total Due:</span>
              <span className="text-blue-600"><Currency value={invoice.total} /></span>
            </div>
          </div>
        </div>

        {/* Payment Terms */}
        <div className="border-t pt-6">
          <h4 className="text-sm font-bold text-slate-900 mb-2">PAYMENT TERMS</h4>
          <p className="text-xs text-slate-600 mb-4">
            Payment is due within 30 days of invoice date. Late payments may be subject to
            interest charges at the maximum rate permitted by law. Please reference the invoice
            number with all payments.
          </p>

          <h4 className="text-sm font-bold text-slate-900 mb-2">PAYMENT METHODS</h4>
          <p className="text-xs text-slate-600">
            Please make checks payable to {invoice.firm.name} or pay online via our secure
            payment portal. For questions regarding this invoice, please contact us at {invoice.firm.email}.
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pt-6 border-t">
          <p className="text-xs text-slate-500">Thank you for your business!</p>
        </div>
      </div>
    </div>
  );
};

export const InvoicePreview = memo(InvoicePreviewComponent);
InvoicePreview.displayName = 'InvoicePreview';
