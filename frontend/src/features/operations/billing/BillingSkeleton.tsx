/**
 * @module components/billing/BillingSkeleton
 * @description Loading skeleton components for billing module
 * Provides visual feedback during data loading with context-specific variants
 */

import { useTheme } from '@/contexts/theme/ThemeContext';
import { cn } from '@/shared/lib/cn';

// ============================================================================
// OVERVIEW SKELETON (Charts and Stats)
// ============================================================================

export const BillingOverviewSkeleton = () => {
  const { theme } = useTheme();

  return (
    <div className="space-y-6 animate-pulse">
      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={`stat-skeleton-${i}`}
            className={cn(
              'p-4 rounded-lg border',
              theme.surface.default,
              theme.border.default
            )}
          >
            <div className={cn('h-4 w-24 rounded mb-2', theme.surface.highlight)} />
            <div className={cn('h-8 w-32 rounded mb-1', theme.surface.raised)} />
            <div className={cn('h-3 w-20 rounded', theme.surface.highlight)} />
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* WIP Chart */}
        <div className={cn('p-6 rounded-lg border', theme.surface.default, theme.border.default)}>
          <div className={cn('h-5 w-32 rounded mb-4', theme.surface.raised)} />
          <div className={cn('h-64 rounded', theme.surface.highlight)} />
        </div>

        {/* Realization Chart */}
        <div className={cn('p-6 rounded-lg border', theme.surface.default, theme.border.default)}>
          <div className={cn('h-5 w-40 rounded mb-4', theme.surface.raised)} />
          <div className={cn('h-64 rounded', theme.surface.highlight)} />
        </div>
      </div>

      {/* Top Clients Table */}
      <div className={cn('p-6 rounded-lg border', theme.surface.default, theme.border.default)}>
        <div className={cn('h-5 w-32 rounded mb-4', theme.surface.raised)} />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={`top-client-skeleton-${i}`} className="flex items-center gap-4">
              <div className={cn('h-4 w-8 rounded', theme.surface.highlight)} />
              <div className={cn('h-4 flex-1 rounded', theme.surface.highlight)} />
              <div className={cn('h-4 w-24 rounded', theme.surface.highlight)} />
              <div className={cn('h-4 w-24 rounded', theme.surface.highlight)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// WIP TABLE SKELETON
// ============================================================================

export const BillingWIPSkeleton = () => {
  const { theme } = useTheme();

  return (
    <div className="space-y-4 animate-pulse">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-4">
        <div className={cn('h-8 w-48 rounded', theme.surface.raised)} />
        <div className="flex gap-2">
          <div className={cn('h-9 w-24 rounded', theme.surface.raised)} />
          <div className={cn('h-9 w-32 rounded', theme.surface.raised)} />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-3 mb-4">
        <div className={cn('h-10 flex-1 rounded', theme.surface.highlight)} />
        <div className={cn('h-10 w-32 rounded', theme.surface.highlight)} />
        <div className={cn('h-10 w-32 rounded', theme.surface.highlight)} />
      </div>

      {/* Table */}
      <div className={cn('rounded-lg border overflow-hidden', theme.border.default)}>
        {/* Table Header */}
        <div className={cn('px-4 py-3 border-b', theme.surface.raised, theme.border.default)}>
          <div className="grid grid-cols-12 gap-4">
            <div className={cn('h-4 col-span-1 rounded', theme.surface.highlight)} />
            <div className={cn('h-4 col-span-3 rounded', theme.surface.highlight)} />
            <div className={cn('h-4 col-span-2 rounded', theme.surface.highlight)} />
            <div className={cn('h-4 col-span-1 rounded', theme.surface.highlight)} />
            <div className={cn('h-4 col-span-1 rounded', theme.surface.highlight)} />
            <div className={cn('h-4 col-span-2 rounded', theme.surface.highlight)} />
            <div className={cn('h-4 col-span-1 rounded', theme.surface.highlight)} />
            <div className={cn('h-4 col-span-1 rounded', theme.surface.highlight)} />
          </div>
        </div>

        {/* Table Rows */}
        <div className={theme.surface.default}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={`wip-skeleton-row-${i}`}
              className={cn(
                'px-4 py-3 border-b last:border-b-0',
                theme.border.default
              )}
            >
              <div className="grid grid-cols-12 gap-4">
                <div className={cn('h-4 col-span-1 rounded', theme.surface.highlight)} />
                <div className={cn('h-4 col-span-3 rounded', theme.surface.highlight)} />
                <div className={cn('h-4 col-span-2 rounded', theme.surface.highlight)} />
                <div className={cn('h-4 col-span-1 rounded', theme.surface.highlight)} />
                <div className={cn('h-4 col-span-1 rounded', theme.surface.highlight)} />
                <div className={cn('h-4 col-span-2 rounded', theme.surface.highlight)} />
                <div className={cn('h-4 col-span-1 rounded', theme.surface.highlight)} />
                <div className={cn('h-4 col-span-1 rounded', theme.surface.highlight)} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-4">
        <div className={cn('h-4 w-32 rounded', theme.surface.highlight)} />
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className={cn('h-8 w-8 rounded', theme.surface.highlight)} />
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// INVOICES GRID SKELETON
// ============================================================================

export const BillingInvoicesSkeleton = () => {
  const { theme } = useTheme();

  return (
    <div className="space-y-4 animate-pulse">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-4">
        <div className={cn('h-8 w-40 rounded', theme.surface.raised)} />
        <div className="flex gap-2">
          <div className={cn('h-9 w-28 rounded', theme.surface.raised)} />
          <div className={cn('h-9 w-36 rounded', theme.surface.raised)} />
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 mb-4">
        {['All', 'Draft', 'Sent', 'Paid', 'Overdue'].map((label) => (
          <div key={label} className={cn('h-9 w-20 rounded', theme.surface.highlight)} />
        ))}
      </div>

      {/* Invoice Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className={cn(
              'p-5 rounded-lg border',
              theme.surface.default,
              theme.border.default
            )}
          >
            {/* Invoice Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className={cn('h-5 w-32 rounded mb-2', theme.surface.raised)} />
                <div className={cn('h-4 w-24 rounded', theme.surface.highlight)} />
              </div>
              <div className={cn('h-6 w-16 rounded', theme.surface.highlight)} />
            </div>

            {/* Client Info */}
            <div className="space-y-2 mb-4">
              <div className={cn('h-4 w-full rounded', theme.surface.highlight)} />
              <div className={cn('h-4 w-3/4 rounded', theme.surface.highlight)} />
            </div>

            {/* Amount */}
            <div className={cn('h-8 w-32 rounded mb-4', theme.surface.raised)} />

            {/* Actions */}
            <div className="flex gap-2">
              <div className={cn('h-8 flex-1 rounded', theme.surface.highlight)} />
              <div className={cn('h-8 w-8 rounded', theme.surface.highlight)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// LEDGER ENTRIES SKELETON
// ============================================================================

export const BillingLedgerSkeleton = () => {
  const { theme } = useTheme();

  return (
    <div className="space-y-4 animate-pulse">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              'p-4 rounded-lg border',
              theme.surface.default,
              theme.border.default
            )}
          >
            <div className={cn('h-4 w-32 rounded mb-2', theme.surface.highlight)} />
            <div className={cn('h-7 w-24 rounded', theme.surface.raised)} />
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex gap-3 mb-4">
        <div className={cn('h-10 w-48 rounded', theme.surface.highlight)} />
        <div className={cn('h-10 w-32 rounded', theme.surface.highlight)} />
        <div className={cn('h-10 w-32 rounded', theme.surface.highlight)} />
      </div>

      {/* Expense Entries */}
      <div className={cn('rounded-lg border', theme.border.default)}>
        <div className={cn('px-4 py-3 border-b', theme.surface.raised, theme.border.default)}>
          <div className={cn('h-5 w-32 rounded', theme.surface.highlight)} />
        </div>

        <div className={theme.surface.default}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={cn(
                'px-4 py-3 border-b last:border-b-0',
                theme.border.default
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className={cn('h-4 w-48 rounded mb-2', theme.surface.raised)} />
                  <div className={cn('h-3 w-32 rounded', theme.surface.highlight)} />
                </div>
                <div className="text-right">
                  <div className={cn('h-5 w-20 rounded mb-1', theme.surface.raised)} />
                  <div className={cn('h-3 w-16 rounded', theme.surface.highlight)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust Account Section */}
      <div className={cn('rounded-lg border mt-6', theme.border.default)}>
        <div className={cn('px-4 py-3 border-b', theme.surface.raised, theme.border.default)}>
          <div className={cn('h-5 w-40 rounded', theme.surface.highlight)} />
        </div>

        <div className={theme.surface.default}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                'px-4 py-3 border-b last:border-b-0',
                theme.border.default
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className={cn('h-4 w-56 rounded mb-2', theme.surface.raised)} />
                  <div className={cn('h-3 w-40 rounded', theme.surface.highlight)} />
                </div>
                <div className={cn('h-5 w-24 rounded', theme.surface.raised)} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// TRUST ACCOUNT DETAIL SKELETON
// ============================================================================

export const TrustAccountDetailSkeleton = () => {
  const { theme } = useTheme();

  return (
    <div className="space-y-6 animate-pulse">
      {/* Account Header */}
      <div className={cn('p-6 rounded-lg border', theme.surface.default, theme.border.default)}>
        <div className="flex items-center justify-between mb-4">
          <div className={cn('h-6 w-48 rounded', theme.surface.raised)} />
          <div className={cn('h-6 w-20 rounded', theme.surface.highlight)} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className={cn('h-3 w-24 rounded mb-2', theme.surface.highlight)} />
            <div className={cn('h-7 w-32 rounded', theme.surface.raised)} />
          </div>
          <div>
            <div className={cn('h-3 w-20 rounded mb-2', theme.surface.highlight)} />
            <div className={cn('h-7 w-28 rounded', theme.surface.raised)} />
          </div>
          <div>
            <div className={cn('h-3 w-28 rounded mb-2', theme.surface.highlight)} />
            <div className={cn('h-7 w-36 rounded', theme.surface.raised)} />
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className={cn('rounded-lg border', theme.border.default)}>
        <div className={cn('px-4 py-3 border-b', theme.surface.raised, theme.border.default)}>
          <div className={cn('h-5 w-40 rounded', theme.surface.highlight)} />
        </div>

        <div className={theme.surface.default}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className={cn(
                'px-4 py-3 border-b last:border-b-0',
                theme.border.default
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className={cn('h-4 w-56 rounded mb-2', theme.surface.raised)} />
                  <div className={cn('h-3 w-40 rounded', theme.surface.highlight)} />
                </div>
                <div className="text-right">
                  <div className={cn('h-5 w-20 rounded mb-1', theme.surface.raised)} />
                  <div className={cn('h-3 w-24 rounded', theme.surface.highlight)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
