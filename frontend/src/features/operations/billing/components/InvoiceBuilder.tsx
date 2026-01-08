/**
 * @module components/billing/InvoiceBuilder
 * @category Billing
 * @description Interactive invoice builder for creating invoices from time entries and expenses
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useState, memo } from 'react';
import { FileText, Plus, Save, Eye, Send, Calendar, DollarSign, Percent } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
import { useTheme } from '@/contexts/theme/ThemeContext';
import { Currency } from '@/components/ui/atoms/Currency';
import { cn } from '@/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface InvoiceBuilderProps {
  caseId?: string;
  onSave?: (invoice: InvoiceData) => void;
  onPreview?: (invoice: InvoiceData) => void;
  className?: string;
}

interface InvoiceData {
  caseId: string;
  clientId: string;
  invoiceDate: string;
  dueDate: string;
  periodStart: string;
  periodEnd: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  notes?: string;
  terms?: string;
}

interface InvoiceItem {
  id: string;
  type: 'time' | 'expense';
  date: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  selected: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

const InvoiceBuilderComponent: React.FC<InvoiceBuilderProps> = ({
  caseId,
  onSave,
  onPreview,
  className
}) => {
  const { theme } = useTheme();

  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    caseId: caseId || '',
    clientId: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    periodStart: '',
    periodEnd: '',
    items: [],
    subtotal: 0,
    taxRate: 0,
    taxAmount: 0,
    discountAmount: 0,
    total: 0
  });

  // Mock unbilled items
  const [availableItems] = useState<InvoiceItem[]>([
    {
      id: '1',
      type: 'time',
      date: '2026-01-06',
      description: 'Client meeting regarding case strategy',
      quantity: 2.5,
      rate: 350,
      amount: 875,
      selected: false
    },
    {
      id: '2',
      type: 'time',
      date: '2026-01-07',
      description: 'Legal research on contract law',
      quantity: 3.0,
      rate: 350,
      amount: 1050,
      selected: false
    },
    {
      id: '3',
      type: 'expense',
      date: '2026-01-05',
      description: 'Court filing fee',
      quantity: 1,
      rate: 435,
      amount: 435,
      selected: false
    }
  ]);

  // Calculate totals
  const calculateTotals = (items: InvoiceItem[], taxRate: number, discountAmount: number) => {
    const subtotal = items.filter(item => item.selected).reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount - discountAmount;

    setInvoiceData(prev => ({
      ...prev,
      items: items.filter(item => item.selected),
      subtotal,
      taxAmount,
      total
    }));
  };

  const toggleItemSelection = (itemId: string) => {
    const updatedItems = availableItems.map(item =>
      item.id === itemId ? { ...item, selected: !item.selected } : item
    );
    calculateTotals(updatedItems, invoiceData.taxRate, invoiceData.discountAmount);
  };

  const handleTaxRateChange = (value: number) => {
    setInvoiceData(prev => ({ ...prev, taxRate: value }));
    calculateTotals(availableItems, value, invoiceData.discountAmount);
  };

  const handleDiscountChange = (value: number) => {
    setInvoiceData(prev => ({ ...prev, discountAmount: value }));
    calculateTotals(availableItems, invoiceData.taxRate, value);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className={cn("rounded-lg shadow-sm border p-4", theme.surface.default, theme.border.default)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className={cn("h-6 w-6", theme.primary.text)} />
            <h2 className={cn("text-xl font-bold", theme.text.primary)}>Invoice Builder</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPreview?.(invoiceData)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors border",
                "hover:bg-slate-50 dark:hover:bg-slate-700"
              )}
            >
              <Eye className="h-4 w-4" />
              Preview
            </button>
            <button
              onClick={() => onSave?.(invoiceData)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
                "bg-blue-600 hover:bg-blue-700 text-white"
              )}
            >
              <Save className="h-4 w-4" />
              Save Invoice
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Invoice Details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Date Range */}
          <div className={cn("rounded-lg shadow-sm border p-4", theme.surface.default, theme.border.default)}>
            <h3 className={cn("font-bold mb-4", theme.text.primary)}>Invoice Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={cn("block text-sm font-medium mb-1", theme.text.secondary)}>
                  Invoice Date
                </label>
                <input
                  type="date"
                  value={invoiceData.invoiceDate}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, invoiceDate: e.target.value }))}
                  className={cn("w-full px-3 py-2 rounded-lg border", theme.surface.default, theme.border.default)}
                />
              </div>
              <div>
                <label className={cn("block text-sm font-medium mb-1", theme.text.secondary)}>
                  Due Date
                </label>
                <input
                  type="date"
                  value={invoiceData.dueDate}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, dueDate: e.target.value }))}
                  className={cn("w-full px-3 py-2 rounded-lg border", theme.surface.default, theme.border.default)}
                />
              </div>
              <div>
                <label className={cn("block text-sm font-medium mb-1", theme.text.secondary)}>
                  Period Start
                </label>
                <input
                  type="date"
                  value={invoiceData.periodStart}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, periodStart: e.target.value }))}
                  className={cn("w-full px-3 py-2 rounded-lg border", theme.surface.default, theme.border.default)}
                />
              </div>
              <div>
                <label className={cn("block text-sm font-medium mb-1", theme.text.secondary)}>
                  Period End
                </label>
                <input
                  type="date"
                  value={invoiceData.periodEnd}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, periodEnd: e.target.value }))}
                  className={cn("w-full px-3 py-2 rounded-lg border", theme.surface.default, theme.border.default)}
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className={cn("rounded-lg shadow-sm border", theme.surface.default, theme.border.default)}>
            <div className={cn("p-4 border-b", theme.border.default)}>
              <h3 className={cn("font-bold", theme.text.primary)}>Unbilled Items</h3>
              <p className={cn("text-sm mt-1", theme.text.secondary)}>
                Select items to include in this invoice
              </p>
            </div>
            <div className="divide-y dark:divide-slate-700">
              {availableItems.map(item => (
                <div
                  key={item.id}
                  className={cn(
                    "p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer",
                    item.selected && "bg-blue-50 dark:bg-blue-900/20"
                  )}
                  onClick={() => toggleItemSelection(item.id)}
                >
                  <input
                    type="checkbox"
                    checked={item.selected}
                    onChange={() => toggleItemSelection(item.id)}
                    className="rounded"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn("text-xs font-medium px-2 py-0.5 rounded",
                        item.type === 'time' ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                      )}>
                        {item.type === 'time' ? 'Time' : 'Expense'}
                      </span>
                      <span className={cn("text-sm", theme.text.secondary)}>
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className={cn("text-sm", theme.text.primary)}>{item.description}</p>
                    <p className={cn("text-xs mt-1", theme.text.secondary)}>
                      {item.quantity} {item.type === 'time' ? 'hrs' : 'units'} × <Currency value={item.rate} />
                    </p>
                  </div>
                  <div className={cn("text-right font-medium", theme.text.primary)}>
                    <Currency value={item.amount} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Panel */}
        <div className="space-y-4">
          <div className={cn("rounded-lg shadow-sm border p-4 sticky top-4", theme.surface.default, theme.border.default)}>
            <h3 className={cn("font-bold mb-4", theme.text.primary)}>Invoice Summary</h3>

            {/* Subtotal */}
            <div className="flex justify-between mb-2">
              <span className={cn("text-sm", theme.text.secondary)}>Subtotal</span>
              <span className={cn("font-medium", theme.text.primary)}>
                <Currency value={invoiceData.subtotal} />
              </span>
            </div>

            {/* Tax */}
            <div className="mb-2">
              <div className="flex justify-between items-center mb-1">
                <label className={cn("text-sm", theme.text.secondary)}>Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={invoiceData.taxRate}
                  onChange={(e) => handleTaxRateChange(parseFloat(e.target.value) || 0)}
                  className={cn("w-20 px-2 py-1 text-sm rounded border", theme.surface.default, theme.border.default)}
                />
              </div>
              <div className="flex justify-between">
                <span className={cn("text-sm", theme.text.secondary)}>Tax Amount</span>
                <span className={cn("font-medium", theme.text.primary)}>
                  <Currency value={invoiceData.taxAmount} />
                </span>
              </div>
            </div>

            {/* Discount */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <label className={cn("text-sm", theme.text.secondary)}>Discount</label>
                <input
                  type="number"
                  step="0.01"
                  value={invoiceData.discountAmount}
                  onChange={(e) => handleDiscountChange(parseFloat(e.target.value) || 0)}
                  className={cn("w-24 px-2 py-1 text-sm rounded border", theme.surface.default, theme.border.default)}
                />
              </div>
            </div>

            {/* Total */}
            <div className={cn("pt-4 border-t", theme.border.default)}>
              <div className="flex justify-between items-center">
                <span className={cn("font-bold text-lg", theme.text.primary)}>Total</span>
                <span className={cn("font-bold text-2xl", theme.primary.text)}>
                  <Currency value={invoiceData.total} />
                </span>
              </div>
            </div>

            {/* Selected Items Count */}
            <div className={cn("mt-4 p-3 rounded-lg", theme.surface.highlight)}>
              <p className={cn("text-sm", theme.text.secondary)}>
                <strong>{availableItems.filter(i => i.selected).length}</strong> items selected
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const InvoiceBuilder = memo(InvoiceBuilderComponent);
InvoiceBuilder.displayName = 'InvoiceBuilder';
