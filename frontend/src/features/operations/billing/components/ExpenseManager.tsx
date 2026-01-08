/**
 * @module components/billing/ExpenseManager
 * @category Billing
 * @description Comprehensive expense tracking and management interface
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useState, memo } from 'react';
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Receipt,
  Edit2,
  Trash2,
  CheckCircle,
  Clock
} from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/contexts/theme/ThemeContext';

// Components
import { Currency } from '@/components/ui/atoms/Currency';

// Utils & Constants
import { cn } from '@/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface ExpenseManagerProps {
  /** Optional case/matter ID to filter expenses */
  caseId?: string;
  /** Optional callback when adding new expense */
  onAddExpense?: () => void;
  /** Optional class name */
  className?: string;
}

interface Expense {
  id: string;
  caseNumber: string;
  caseName: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  vendor?: string;
  billable: boolean;
  status: 'draft' | 'submitted' | 'approved' | 'billed';
  receiptUrl?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

const ExpenseManagerComponent: React.FC<ExpenseManagerProps> = ({
  caseId,
  onAddExpense,
  className
}) => {
  const { theme } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Mock data
  const [expenses] = useState<Expense[]>([
    {
      id: '1',
      caseNumber: 'CASE-2024-001',
      caseName: 'Smith v. Johnson',
      category: 'Court Fees',
      description: 'Filing fee for complaint',
      amount: 435.00,
      date: '2026-01-05',
      vendor: 'Superior Court',
      billable: true,
      status: 'approved',
      receiptUrl: '/receipts/001.pdf'
    },
    {
      id: '2',
      caseNumber: 'CASE-2024-002',
      caseName: 'Acme Corp Merger',
      category: 'Travel',
      description: 'Flight to NYC for client meeting',
      amount: 587.50,
      date: '2026-01-07',
      vendor: 'United Airlines',
      billable: true,
      status: 'submitted'
    },
    {
      id: '3',
      caseNumber: 'CASE-2024-001',
      caseName: 'Smith v. Johnson',
      category: 'Expert Witness',
      description: 'Forensic accountant consultation',
      amount: 2500.00,
      date: '2026-01-08',
      vendor: 'ABC Forensics',
      billable: true,
      status: 'draft'
    }
  ]);

  const categories = [
    'All',
    'Court Fees',
    'Filing Fees',
    'Expert Witness',
    'Deposition',
    'Travel',
    'Meals',
    'Lodging',
    'Copies',
    'Postage',
    'Research',
    'Transcripts',
    'Technology',
    'Other'
  ];

  // Filter expenses
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch =
      searchQuery === '' ||
      expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.caseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.vendor?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' ||
      expense.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesStatus =
      selectedStatus === 'all' ||
      expense.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate totals
  const totals = {
    total: filteredExpenses.reduce((sum, e) => sum + e.amount, 0),
    billable: filteredExpenses.filter(e => e.billable).reduce((sum, e) => sum + e.amount, 0),
    approved: filteredExpenses.filter(e => e.status === 'approved').reduce((sum, e) => sum + e.amount, 0),
    pending: filteredExpenses.filter(e => e.status === 'submitted' || e.status === 'draft').reduce((sum, e) => sum + e.amount, 0)
  };

  // Status badge component
  const StatusBadge: React.FC<{ status: Expense['status'] }> = ({ status }) => {
    const statusConfig = {
      draft: { icon: Edit2, color: 'text-slate-600 bg-slate-100', label: 'Draft' },
      submitted: { icon: Clock, color: 'text-blue-600 bg-blue-100', label: 'Submitted' },
      approved: { icon: CheckCircle, color: 'text-emerald-600 bg-emerald-100', label: 'Approved' },
      billed: { icon: DollarSign, color: 'text-purple-600 bg-purple-100', label: 'Billed' }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", config.color)}>
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className={cn(
        "rounded-lg shadow-sm border p-4",
        theme.surface.default,
        theme.border.default
      )}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className={cn("text-xl font-bold flex items-center gap-2", theme.text.primary)}>
              <DollarSign className={cn("h-6 w-6", theme.primary.text)} />
              Expense Manager
            </h2>
            <p className={cn("text-sm mt-1", theme.text.secondary)}>
              Track and manage case-related expenses
            </p>
          </div>

          <div className="flex gap-2">
            <button
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
                "border hover:bg-slate-50 dark:hover:bg-slate-700"
              )}
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            <button
              onClick={onAddExpense}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
                "bg-blue-600 hover:bg-blue-700 text-white"
              )}
            >
              <Plus className="h-4 w-4" />
              Add Expense
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className={cn("p-3 rounded-lg", theme.surface.highlight)}>
            <p className={cn("text-xs", theme.text.secondary)}>Total Expenses</p>
            <p className={cn("text-lg font-bold", theme.text.primary)}>
              <Currency value={totals.total} />
            </p>
          </div>
          <div className={cn("p-3 rounded-lg", theme.surface.highlight)}>
            <p className={cn("text-xs", theme.text.secondary)}>Billable</p>
            <p className={cn("text-lg font-bold text-emerald-600")}>
              <Currency value={totals.billable} />
            </p>
          </div>
          <div className={cn("p-3 rounded-lg", theme.surface.highlight)}>
            <p className={cn("text-xs", theme.text.secondary)}>Approved</p>
            <p className={cn("text-lg font-bold text-blue-600")}>
              <Currency value={totals.approved} />
            </p>
          </div>
          <div className={cn("p-3 rounded-lg", theme.surface.highlight)}>
            <p className={cn("text-xs", theme.text.secondary)}>Pending</p>
            <p className={cn("text-lg font-bold text-amber-600")}>
              <Currency value={totals.pending} />
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={cn(
        "rounded-lg shadow-sm border p-4",
        theme.surface.default,
        theme.border.default
      )}>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className={cn("absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4", theme.text.tertiary)} />
              <input
                type="text"
                placeholder="Search expenses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "w-full pl-10 pr-4 py-2 rounded-lg border",
                  theme.surface.default,
                  theme.border.default,
                  theme.text.primary
                )}
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="md:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={cn(
                "w-full px-3 py-2 rounded-lg border",
                theme.surface.default,
                theme.border.default,
                theme.text.primary
              )}
            >
              {categories.map(cat => (
                <option key={cat} value={cat.toLowerCase()}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="md:w-40">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className={cn(
                "w-full px-3 py-2 rounded-lg border",
                theme.surface.default,
                theme.border.default,
                theme.text.primary
              )}
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="billed">Billed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Expense List */}
      <div className={cn(
        "rounded-lg shadow-sm border",
        theme.surface.default,
        theme.border.default
      )}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={cn("border-b", theme.border.default, theme.surface.highlight)}>
              <tr>
                <th className={cn("px-4 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                  Date
                </th>
                <th className={cn("px-4 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                  Case
                </th>
                <th className={cn("px-4 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                  Category
                </th>
                <th className={cn("px-4 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                  Description
                </th>
                <th className={cn("px-4 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                  Vendor
                </th>
                <th className={cn("px-4 py-3 text-right text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                  Amount
                </th>
                <th className={cn("px-4 py-3 text-center text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                  Status
                </th>
                <th className={cn("px-4 py-3 text-center text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                  Receipt
                </th>
                <th className={cn("px-4 py-3 text-center text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={cn("divide-y", theme.border.default)}>
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <DollarSign className={cn("h-12 w-12 mx-auto mb-2 opacity-20", theme.text.tertiary)} />
                    <p className={cn("text-sm", theme.text.secondary)}>No expenses found</p>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map(expense => (
                  <tr
                    key={expense.id}
                    className={cn("hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors")}
                  >
                    <td className={cn("px-4 py-3 text-sm", theme.text.primary)}>
                      {new Date(expense.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className={cn("text-sm font-medium", theme.text.primary)}>
                          {expense.caseNumber}
                        </p>
                        <p className={cn("text-xs", theme.text.secondary)}>
                          {expense.caseName}
                        </p>
                      </div>
                    </td>
                    <td className={cn("px-4 py-3 text-sm", theme.text.primary)}>
                      {expense.category}
                    </td>
                    <td className={cn("px-4 py-3 text-sm", theme.text.secondary)}>
                      {expense.description}
                    </td>
                    <td className={cn("px-4 py-3 text-sm", theme.text.secondary)}>
                      {expense.vendor || '-'}
                    </td>
                    <td className={cn("px-4 py-3 text-sm text-right font-medium", theme.text.primary)}>
                      <Currency value={expense.amount} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={expense.status} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      {expense.receiptUrl ? (
                        <a
                          href={expense.receiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-600 hover:text-blue-700"
                        >
                          <Receipt className="h-4 w-4" />
                        </a>
                      ) : (
                        <button className="inline-flex items-center text-slate-400 hover:text-slate-600">
                          <Upload className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-1">
                        <button
                          className={cn(
                            "p-1.5 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 transition-colors"
                          )}
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          className={cn(
                            "p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 transition-colors"
                          )}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const ExpenseManager = memo(ExpenseManagerComponent);
ExpenseManager.displayName = 'ExpenseManager';
