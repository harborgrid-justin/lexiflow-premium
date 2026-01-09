/**
 * InvoiceBuilder Component
 * Enterprise invoice creation with rate cards, fee arrangements, and multi-currency support
 */

import {
  Calendar,
  Copy,
  DollarSign,
  Eye,
  FileText,
  Globe,
  Minus,
  Percent,
  Plus,
  Save,
  Send
} from 'lucide-react';
import React, { useState } from 'react';
import { useTheme } from '@/theme/ThemeContext';
import { cn } from '@/lib/utils';

// Types
interface InvoiceLineItem {
  id: string;
  type: 'time' | 'expense' | 'fixed_fee' | 'disbursement';
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  discount?: number;
  discountAmount?: number;
  taxable: boolean;
  utbmsCode?: string;
}

interface RateCard {
  id: string;
  name: string;
  timekeeperLevel: string;
  standardRate: number;
  discountedRate?: number;
  effectiveDate: string;
  expiryDate?: string;
}

interface FeeArrangement {
  id: string;
  type: 'hourly' | 'fixed_fee' | 'contingency' | 'hybrid' | 'retainer';
  description: string;
  baseRate?: number;
  contingencyPercent?: number;
  fixedAmount?: number;
  capAmount?: number;
}

interface Currency {
  code: string;
  symbol: string;
  name: string;
  exchangeRate: number;
}

interface InvoiceBuilderProps {
  clientId?: string;
  matterId?: string;
  onSave?: (invoice: unknown) => void;
  onSend?: (invoice: unknown) => void;
  onPreview?: (invoice: unknown) => void;
}

export const InvoiceBuilder: React.FC<InvoiceBuilderProps> = ({
  onSave,
  onSend,
  onPreview,
}) => {
  const { theme } = useTheme();
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [selectedFeeArrangement, setSelectedFeeArrangement] = useState<string>('');
  const [showRateCardSelector, setShowRateCardSelector] = useState(false);

  // Mock data
  const rateCards: RateCard[] = [
    {
      id: '1',
      name: 'Standard Corporate Rates 2024',
      timekeeperLevel: 'Partner',
      standardRate: 650.00,
      effectiveDate: '2024-01-01',
    },
    {
      id: '2',
      name: 'Standard Corporate Rates 2024',
      timekeeperLevel: 'Senior Associate',
      standardRate: 475.00,
      effectiveDate: '2024-01-01',
    },
    {
      id: '3',
      name: 'Discounted Rates - TechCorp',
      timekeeperLevel: 'Partner',
      standardRate: 650.00,
      discountedRate: 585.00,
      effectiveDate: '2024-01-01',
      expiryDate: '2024-12-31',
    },
  ];

  const feeArrangements: FeeArrangement[] = [
    {
      id: '1',
      type: 'hourly',
      description: 'Standard Hourly Billing',
      baseRate: 450.00,
    },
    {
      id: '2',
      type: 'fixed_fee',
      description: 'Fixed Fee Agreement',
      fixedAmount: 25000.00,
    },
    {
      id: '3',
      type: 'contingency',
      description: 'Contingency Fee (33.3%)',
      contingencyPercent: 33.3,
    },
    {
      id: '4',
      type: 'hybrid',
      description: 'Hybrid: Reduced Hourly + Success Fee',
      baseRate: 300.00,
      contingencyPercent: 15.0,
    },
  ];

  const currencies: Currency[] = [
    { code: 'USD', symbol: '$', name: 'US Dollar', exchangeRate: 1.00 },
    { code: 'EUR', symbol: '€', name: 'Euro', exchangeRate: 0.92 },
    { code: 'GBP', symbol: '£', name: 'British Pound', exchangeRate: 0.79 },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', exchangeRate: 1.35 },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', exchangeRate: 1.52 },
  ];

  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    periodStart: '',
    periodEnd: '',
    billingModel: 'Hourly',
    notes: '',
    terms: 'Payment due within 30 days',
    taxRate: 0,
    discountPercent: 0,
  });

  const addLineItem = () => {
    const newItem: InvoiceLineItem = {
      id: `item-${Date.now()}`,
      type: 'time',
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0,
      taxable: true,
    };
    setLineItems([...lineItems, newItem]);
  };

  const updateLineItem = (id: string, field: keyof InvoiceLineItem, value: unknown) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };

        // Recalculate amount
        const baseAmount = updated.quantity * updated.rate;
        let discountAmount = 0;

        if (updated.discount && updated.discount > 0) {
          discountAmount = baseAmount * (updated.discount / 100);
          updated.discountAmount = discountAmount;
        }

        updated.amount = baseAmount - discountAmount;

        return updated;
      }
      return item;
    }));
  };

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateTaxAmount = () => {
    const taxableAmount = lineItems
      .filter(item => item.taxable)
      .reduce((sum, item) => sum + item.amount, 0);
    return taxableAmount * (invoiceData.taxRate / 100);
  };

  const calculateDiscountAmount = () => {
    return calculateSubtotal() * (invoiceData.discountPercent / 100);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTaxAmount();
    const discount = calculateDiscountAmount();
    return subtotal + tax - discount;
  };

  const getCurrencySymbol = () => {
    const currency = currencies.find(c => c.code === selectedCurrency);
    return currency?.symbol || '$';
  };

  const formatCurrency = (amount: number) => {
    return `${getCurrencySymbol()}${amount.toFixed(2)}`;
  };

  const handleCopyLineItem = (item: InvoiceLineItem) => {
    const copiedItem: InvoiceLineItem = {
      ...item,
      id: `item-${Date.now()}`,
      description: `${item.description} (Copy)`,
    };
    setLineItems([...lineItems, copiedItem]);
  };

  const applyRateCard = (rateCardId: string, itemId: string) => {
    const rateCard = rateCards.find(rc => rc.id === rateCardId);
    if (rateCard) {
      updateLineItem(itemId, 'rate', rateCard.discountedRate || rateCard.standardRate);
    }
    setShowRateCardSelector(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={cn("text-2xl font-bold", theme.text.primary)}>
            Invoice Builder
          </h2>
          <p className={cn("mt-1 text-sm", theme.text.secondary)}>
            Create professional invoices with advanced billing features
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => onPreview?.(invoiceData)}
            className={cn(
              "inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium shadow-sm transition-colors",
              theme.surface.default,
              theme.border.default,
              theme.text.primary,
              `hover:${theme.surface.highlight}`
            )}
          >
            <Eye className="h-4 w-4" />
            Preview
          </button>
          <button
            onClick={() => onSave?.(invoiceData)}
            className={cn(
              "inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium shadow-sm transition-colors",
              theme.surface.default,
              theme.border.default,
              theme.text.primary,
              `hover:${theme.surface.highlight}`
            )}
          >
            <Save className="h-4 w-4" />
            Save Draft
          </button>
          <button
            onClick={() => onSend?.(invoiceData)}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            <Send className="h-4 w-4" />
            Send Invoice
          </button>
        </div>
      </div>

      {/* Invoice Details */}
      <div className={cn("rounded-lg border p-6", theme.border.default, theme.surface.default)}>
        <h3 className={cn("text-lg font-semibold mb-4", theme.text.primary)}>
          Invoice Details
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className={cn("block text-sm font-medium", theme.text.secondary)}>
              Invoice Number
            </label>
            <input
              type="text"
              value={invoiceData.invoiceNumber}
              onChange={(e) => setInvoiceData({ ...invoiceData, invoiceNumber: e.target.value })}
              className={cn(
                "mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20",
                theme.border.default,
                theme.surface.default,
                theme.text.primary
              )}
            />
          </div>

          <div>
            <label className={cn("block text-sm font-medium", theme.text.secondary)}>
              <Calendar className="inline-block h-4 w-4 mr-1" />
              Invoice Date
            </label>
            <div className="relative mt-1">
              <input
                type="date"
                value={invoiceData.invoiceDate}
                onChange={(e) => setInvoiceData({ ...invoiceData, invoiceDate: e.target.value })}
                className={cn(
                  "block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20",
                  theme.border.default,
                  theme.surface.default,
                  theme.text.primary
                )}
              />
            </div>
          </div>

          <div>
            <label className={cn("block text-sm font-medium", theme.text.secondary)}>
              Due Date
            </label>
            <input
              type="date"
              value={invoiceData.dueDate}
              onChange={(e) => setInvoiceData({ ...invoiceData, dueDate: e.target.value })}
              className={cn(
                "mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20",
                theme.border.default,
                theme.surface.default,
                theme.text.primary
              )}
            />
          </div>

          <div>
            <label className={cn("block text-sm font-medium", theme.text.secondary)}>
              Currency
            </label>
            <div className="relative mt-1">
              <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className={cn(
                  "block w-full rounded-md border py-2 pl-10 pr-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20",
                  theme.border.default,
                  theme.surface.default,
                  theme.text.primary
                )}
              >
                {currencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} ({currency.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={cn("block text-sm font-medium", theme.text.secondary)}>
              Billing Period Start
            </label>
            <input
              type="date"
              value={invoiceData.periodStart}
              onChange={(e) => setInvoiceData({ ...invoiceData, periodStart: e.target.value })}
              className={cn(
                "mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20",
                theme.border.default,
                theme.surface.default,
                theme.text.primary
              )}
            />
          </div>
          <div>
            <label className={cn("block text-sm font-medium", theme.text.secondary)}>
              Billing Period End
            </label>
            <input
              type="date"
              value={invoiceData.periodEnd}
              onChange={(e) => setInvoiceData({ ...invoiceData, periodEnd: e.target.value })}
              className={cn(
                "mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20",
                theme.border.default,
                theme.surface.default,
                theme.text.primary
              )}
            />
          </div>
        </div>
      </div>

      {/* Fee Arrangement */}
      <div className={cn("rounded-lg border p-6", theme.border.default, theme.surface.default)}>
        <h3 className={cn("text-lg font-semibold mb-4", theme.text.primary)}>
          Fee Arrangement
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {feeArrangements.map((arrangement) => (
            <div
              key={arrangement.id}
              className={cn(
                "cursor-pointer rounded-lg border-2 p-4 transition-colors",
                selectedFeeArrangement === arrangement.id
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : cn("border-transparent hover:border-gray-300", theme.border.default, `hover:${theme.border.active}`)
              )}
              onClick={() => setSelectedFeeArrangement(arrangement.id)}
            >
              <h4 className={cn("font-medium", theme.text.primary)}>
                {arrangement.description}
              </h4>
              <p className={cn("mt-1 text-sm", theme.text.secondary)}>
                Type: {arrangement.type.replace('_', ' ').toUpperCase()}
              </p>
              {arrangement.baseRate && (
                <p className={cn("text-sm", theme.text.secondary)}>
                  Base Rate: {formatCurrency(arrangement.baseRate)}/hr
                </p>
              )}
              {arrangement.fixedAmount && (
                <p className={cn("text-sm", theme.text.secondary)}>
                  Fixed Amount: {formatCurrency(arrangement.fixedAmount)}
                </p>
              )}
              {arrangement.contingencyPercent && (
                <p className={cn("text-sm", theme.text.secondary)}>
                  Contingency: {arrangement.contingencyPercent}%
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Line Items */}
      <div className={cn("rounded-lg border", theme.border.default, theme.surface.default)}>
        <div className={cn("border-b px-6 py-4", theme.border.default, theme.surface.subtle)}>
          <div className="flex items-center justify-between">
            <h3 className={cn("text-lg font-semibold", theme.text.primary)}>
              Line Items
            </h3>
            <button
              onClick={addLineItem}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add Item
            </button>
          </div>
        </div>

        <div className="p-6">
          {lineItems.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className={cn("mt-2 text-sm font-medium", theme.text.primary)}>
                No line items
              </h3>
              <p className={cn("mt-1 text-sm", theme.text.secondary)}>
                Get started by adding a line item to the invoice.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {lineItems.map((item) => (
                <div key={item.id} className={cn("rounded-lg border p-4", theme.border.default)}> // Should I use surface?
                  <div className="grid gap-4 sm:grid-cols-6">
                    <div className="sm:col-span-2">
                      <label className={cn("block text-sm font-medium", theme.text.secondary)}>
                        Description
                      </label>
                      <div className="mt-1 flex gap-2">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                          className={cn(
                            "block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20",
                            theme.border.default,
                            theme.surface.default,
                            theme.text.primary
                          )}
                          placeholder="Description of service"
                        />
                        <button
                          onClick={() => handleCopyLineItem(item)}
                          className={cn("rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-700")}
                          title="Copy line item"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className={cn("block text-sm font-medium", theme.text.secondary)}>
                        Type
                      </label>
                      <select
                        value={item.type}
                        onChange={(e) => updateLineItem(item.id, 'type', e.target.value)}
                        className={cn(
                          "mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20",
                          theme.border.default,
                          theme.surface.default,
                          theme.text.primary
                        )}
                      >
                        <option value="time">Time</option>
                        <option value="expense">Expense</option>
                        <option value="fixed_fee">Fixed Fee</option>
                        <option value="disbursement">Disbursement</option>
                      </select>
                    </div>

                    <div>
                      <label className={cn("block text-sm font-medium", theme.text.secondary)}>
                        Qty/Hrs
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        className={cn(
                          "mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20",
                          theme.border.default,
                          theme.surface.default,
                          theme.text.primary
                        )}
                      />
                    </div>

                    <div>
                      <label className={cn("block text-sm font-medium", theme.text.secondary)}>
                        <DollarSign className="inline-block h-4 w-4 mr-1" />
                        Rate
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.rate}
                        onChange={(e) => updateLineItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                        className={cn(
                          "mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20",
                          theme.border.default,
                          theme.surface.default,
                          theme.text.primary
                        )}
                      />
                    </div>

                    <div>
                      <label className={cn("block text-sm font-medium", theme.text.secondary)}>
                        Amount
                      </label>
                      <div className="mt-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={formatCurrency(item.amount)}
                          readOnly
                          className={cn(
                            "block w-full rounded-md border px-3 py-2 text-sm shadow-sm",
                            theme.border.default,
                            theme.surface.subtle, // Readonly bg
                            theme.text.primary
                          )}
                        />
                        <button
                          onClick={() => removeLineItem(item.id)}
                          className={cn("text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300")}
                          title="Remove item"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-4 sm:grid-cols-3">
                    <div>
                      <label className={cn("flex items-center gap-2 text-sm font-medium", theme.text.secondary)}>
                        <input
                          type="checkbox"
                          checked={item.taxable}
                          onChange={(e) => updateLineItem(item.id, 'taxable', e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        Taxable
                      </label>
                    </div>
                    <div>
                      <label className={cn("block text-sm font-medium", theme.text.secondary)}>
                        <Percent className="inline-block h-4 w-4 mr-1" />
                        Discount %
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={item.discount || 0}
                        onChange={(e) => updateLineItem(item.id, 'discount', parseFloat(e.target.value) || 0)}
                        className={cn(
                          "mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20",
                          theme.border.default,
                          theme.surface.default,
                          theme.text.primary
                        )}
                      />
                    </div>
                    <div>
                      <label className={cn("block text-sm font-medium", theme.text.secondary)}>
                        UTBMS Code
                      </label>
                      <input
                        type="text"
                        value={item.utbmsCode || ''}
                        onChange={(e) => updateLineItem(item.id, 'utbmsCode', e.target.value)}
                        className={cn(
                          "mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20",
                          theme.border.default,
                          theme.surface.default,
                          theme.text.primary
                        )}
                        placeholder="L210"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Invoice Summary */}
      <div className={cn("rounded-lg border p-6", theme.border.default, theme.surface.default)}>
        <h3 className={cn("text-lg font-semibold mb-4", theme.text.primary)}>
          Invoice Summary
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className={cn("text-sm", theme.text.secondary)}>Subtotal</span>
            <span className={cn("text-sm font-medium", theme.text.primary)}>
              {formatCurrency(calculateSubtotal())}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={cn("text-sm", theme.text.secondary)}>Tax</span>
              <input
                type="number"
                step="0.1"
                value={invoiceData.taxRate}
                onChange={(e) => setInvoiceData({ ...invoiceData, taxRate: parseFloat(e.target.value) || 0 })}
                className={cn(
                  "w-20 rounded-md border px-2 py-1 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20",
                  theme.border.default,
                  theme.surface.default,
                  theme.text.primary
                )}
              />
              <span className="text-xs text-gray-500">%</span>
            </div>
            <span className={cn("text-sm font-medium", theme.text.primary)}>
              {formatCurrency(calculateTaxAmount())}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={cn("text-sm", theme.text.secondary)}>Discount</span>
              <input
                type="number"
                step="0.1"
                value={invoiceData.discountPercent}
                onChange={(e) => setInvoiceData({ ...invoiceData, discountPercent: parseFloat(e.target.value) || 0 })}
                className={cn(
                  "w-20 rounded-md border px-2 py-1 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20",
                  theme.border.default,
                  theme.surface.default,
                  theme.text.primary
                )}
              />
              <span className="text-xs text-gray-500">%</span>
            </div>
            <span className={cn("text-sm font-medium", theme.status.error)}>
              -{formatCurrency(calculateDiscountAmount())}
            </span>
          </div>

          <div className={cn("border-t pt-3", theme.border.default)}>
            <div className="flex items-center justify-between">
              <span className={cn("text-lg font-semibold", theme.text.primary)}>Total</span>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(calculateTotal())}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes and Terms */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className={cn("rounded-lg border p-6", theme.border.default, theme.surface.default)}>
          <label className={cn("block text-sm font-medium mb-2", theme.text.primary)}>
            Invoice Notes
          </label>
          <textarea
            value={invoiceData.notes}
            onChange={(e) => setInvoiceData({ ...invoiceData, notes: e.target.value })}
            rows={4}
            className={cn(
              "block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20",
              theme.border.default,
              theme.surface.default,
              theme.text.primary
            )}
            placeholder="Additional notes or comments..."
          />
        </div>

        <div className={cn("rounded-lg border p-6", theme.border.default, theme.surface.default)}>
          <label className={cn("block text-sm font-medium mb-2", theme.text.primary)}>
            Payment Terms
          </label>
          <textarea
            value={invoiceData.terms}
            onChange={(e) => setInvoiceData({ ...invoiceData, terms: e.target.value })}
            rows={4}
            className={cn(
              "block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20",
              theme.border.default,
              theme.surface.default,
              theme.text.primary
            )}
            placeholder="Payment terms and conditions..."
          />
        </div>
      </div>

      {/* Rate Card Selector Modal */}
      {showRateCardSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className={cn("max-w-2xl w-full mx-4 rounded-lg shadow-xl", theme.surface.default)}>
            <div className={cn("p-6 border-b", theme.border.default)}>
              <div className="flex items-center justify-between">
                <h3 className={cn("text-lg font-semibold", theme.text.primary)}>
                  Select Rate Card
                </h3>
                <button
                  onClick={() => setShowRateCardSelector(false)}
                  className={cn("hover:text-gray-700 dark:hover:text-gray-200", theme.text.secondary)} // Close button might need specific styling
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="space-y-3">
                {rateCards.map((rc) => (
                  <button
                    key={rc.id}
                    onClick={() => applyRateCard(rc.id, lineItems[0]?.id || '')}
                    className={cn(
                      "w-full text-left p-4 rounded-lg border hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20",
                      theme.border.default
                    )}
                  >
                    <div className={cn("font-medium", theme.text.primary)}>{rc.name}</div>
                    <div className={cn("text-sm", theme.text.secondary)}>
                      {rc.timekeeperLevel}: {formatCurrency(rc.standardRate)}/hr
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
