/**
 * Expenses Page - Server Component
 *
 * Displays expenses with filtering, approval workflow, and CRUD operations.
 * Follows Next.js 16 strict requirements with async params handling.
 *
 * @module billing/expenses/page
 */

import { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Download,
  ChevronRight,
  Calendar,
  DollarSign,
  Briefcase,
  User,
  Tag,
  Check,
  X,
} from 'lucide-react';
import { getExpenses } from '../actions';
import type { Expense, ExpenseStatus, ExpenseFilters, EXPENSE_CATEGORIES } from '../types';
import { ExpenseActions } from './expense-actions';

// =============================================================================
// Metadata
// =============================================================================

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Expenses | Billing | LexiFlow',
    description: 'Track and manage billable and non-billable expenses',
  };
}

// =============================================================================
// Types
// =============================================================================

interface PageProps {
  searchParams: Promise<{
    caseId?: string;
    userId?: string;
    category?: string;
    status?: string;
    billable?: string;
    search?: string;
    page?: string;
  }>;
}

// =============================================================================
// Helper Functions
// =============================================================================

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getStatusColor(status: ExpenseStatus | string): string {
  const statusColors: Record<string, string> = {
    Draft: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
    Submitted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    Approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    Rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    Billed: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    Reimbursed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  };
  return statusColors[status] || statusColors.Draft;
}

function getCategoryIcon(category: string) {
  if (category.includes('Travel') || category.includes('Lodging')) {
    return '✈️';
  }
  if (category.includes('Filing') || category.includes('Court')) {
    return '⚖️';
  }
  if (category.includes('Postage') || category.includes('Delivery')) {
    return '📬';
  }
  if (category.includes('Research')) {
    return '📚';
  }
  if (category.includes('Technology')) {
    return '💻';
  }
  return '📋';
}

// =============================================================================
// Components
// =============================================================================

function StatsCards({ expenses }: { expenses: Expense[] }) {
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const billableExpenses = expenses.filter((e) => e.billable);
  const billableAmount = billableExpenses.reduce((sum, e) => sum + e.amount, 0);
  const pendingApproval = expenses.filter((e) => e.status === 'Submitted').length;
  const approvedAmount = expenses
    .filter((e) => e.status === 'Approved')
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="grid gap-4 sm:grid-cols-4">
      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <Receipt className="h-4 w-4" />
          <span className="text-sm font-medium">Total Expenses</span>
        </div>
        <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
          {formatCurrency(totalAmount)}
        </p>
        <p className="text-xs text-slate-500">{expenses.length} expenses</p>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
          <DollarSign className="h-4 w-4" />
          <span className="text-sm font-medium">Billable</span>
        </div>
        <p className="mt-1 text-2xl font-bold text-blue-700 dark:text-blue-300">
          {formatCurrency(billableAmount)}
        </p>
        <p className="text-xs text-blue-600 dark:text-blue-400">
          {billableExpenses.length} expenses
        </p>
      </div>

      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
          <Check className="h-4 w-4" />
          <span className="text-sm font-medium">Approved</span>
        </div>
        <p className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-300">
          {formatCurrency(approvedAmount)}
        </p>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
          <Receipt className="h-4 w-4" />
          <span className="text-sm font-medium">Pending Approval</span>
        </div>
        <p className="mt-1 text-2xl font-bold text-amber-700 dark:text-amber-300">
          {pendingApproval}
        </p>
        <p className="text-xs text-amber-600 dark:text-amber-400">expenses</p>
      </div>
    </div>
  );
}

function FilterBar({ filters }: { filters: ExpenseFilters }) {
  const statuses = ['Draft', 'Submitted', 'Approved', 'Rejected', 'Billed', 'Reimbursed'];
  const categories = [
    'Filing Fees',
    'Court Costs',
    'Postage & Delivery',
    'Travel',
    'Lodging',
    'Meals',
    'Expert Witness Fees',
    'Research Services',
    'Technology & Software',
    'Other',
  ];

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search expenses..."
          className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
        />
      </div>
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-slate-400" />
        <select
          defaultValue={filters.status || ''}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
        >
          <option value="">All Status</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <select
          defaultValue={filters.category || ''}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
      <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600">
        <Download className="h-4 w-4" />
        Export
      </button>
    </div>
  );
}

function ExpenseRow({ expense }: { expense: Expense }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 p-4 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-lg dark:bg-purple-900/20">
          {getCategoryIcon(expense.category)}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-900 dark:text-white">
              {expense.description.length > 50
                ? `${expense.description.substring(0, 50)}...`
                : expense.description}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(
                expense.status
              )}`}
            >
              {expense.status}
            </span>
            {expense.billable ? (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                Billable
              </span>
            ) : (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                Non-Billable
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Tag className="h-3.5 w-3.5" />
              {expense.category}
            </span>
            {expense.caseName && (
              <span className="flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5" />
                {expense.caseName}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(expense.date)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {expense.vendor && (
          <div className="text-right text-sm text-slate-500 dark:text-slate-400">
            {expense.vendor}
          </div>
        )}
        <div className="text-right">
          <p className="font-bold text-slate-900 dark:text-white">
            {formatCurrency(expense.amount)}
          </p>
          {expense.quantity > 1 && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {expense.quantity} x {formatCurrency(expense.unitCost)}
            </p>
          )}
        </div>
        <ExpenseActions expense={expense} />
      </div>
    </div>
  );
}

async function ExpenseList({ filters }: { filters: ExpenseFilters }) {
  const result = await getExpenses(filters);
  const expenses = result.data || [];

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-16 dark:border-slate-700 dark:bg-slate-800">
        <div className="rounded-full bg-slate-100 p-4 dark:bg-slate-700">
          <Receipt className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
          No expenses found
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Start tracking expenses by adding a new one
        </p>
        <Link
          href="/billing/expenses/new"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Expense
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <StatsCards expenses={expenses} />

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {expenses.length} expense{expenses.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {expenses.map((expense) => (
            <ExpenseRow key={expense.id} expense={expense} />
          ))}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Main Page Component
// =============================================================================

export default async function ExpensesPage({ searchParams }: PageProps) {
  // Next.js 16: Await searchParams
  const resolvedSearchParams = await searchParams;

  const filters: ExpenseFilters = {
    caseId: resolvedSearchParams.caseId,
    userId: resolvedSearchParams.userId,
    category: resolvedSearchParams.category,
    status: resolvedSearchParams.status,
    billable: resolvedSearchParams.billable,
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-6 py-6 dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/billing"
                className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                Billing
              </Link>
              <ChevronRight className="h-4 w-4 text-slate-400" />
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-50 p-2 dark:bg-purple-900/20">
                  <Receipt className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Expenses
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Track billable and non-billable expenses
                  </p>
                </div>
              </div>
            </div>
            <Link
              href="/billing/expenses/new"
              className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-purple-700"
            >
              <Plus className="h-4 w-4" />
              Add Expense
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Filters */}
        <section className="mb-6">
          <FilterBar filters={filters} />
        </section>

        {/* Expense List */}
        <section>
          <Suspense
            fallback={
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-4">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-24 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700"
                    />
                  ))}
                </div>
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-20 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700"
                  />
                ))}
              </div>
            }
          >
            <ExpenseList filters={filters} />
          </Suspense>
        </section>
      </div>
    </div>
  );
}
