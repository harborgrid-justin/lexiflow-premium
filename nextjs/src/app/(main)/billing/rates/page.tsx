/**
 * Rate Tables Page
 *
 * Manage billing rates and rate tables for different timekeepers and services.
 *
 * KEY FEATURES:
 * - Rate table list with CRUD operations
 * - Role-specific rate configuration
 * - Status filtering (Active, Draft, Inactive)
 * - Default rate management
 * - Effective date tracking
 */

import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { DollarSign, Plus, Users, Calendar, ArrowLeft } from 'lucide-react';
import { getRateTables } from '../actions';
import type { RateTable, RateTableStatus } from '../types';
import { RateTableActions } from './rate-table-actions';

// ============================================================================
// Metadata
// ============================================================================

export const metadata: Metadata = {
  title: 'Rate Tables | Billing',
  description: 'Manage billing rates for timekeepers and services',
};

// ============================================================================
// Helper Functions
// ============================================================================

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function getStatusColor(status: RateTableStatus): string {
  switch (status) {
    case 'Active':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    case 'Draft':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    case 'Inactive':
      return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
    default:
      return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400';
  }
}

// ============================================================================
// Sub-Components
// ============================================================================

function PageHeader() {
  return (
    <div className="border-b border-slate-200 bg-white px-6 py-6 dark:border-slate-700 dark:bg-slate-800">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/billing"
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
              <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Rate Tables
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Manage billing rates for timekeepers and services
              </p>
            </div>
          </div>

          <Link
            href="/billing/rates/new"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Create Rate Table
          </Link>
        </div>
      </div>
    </div>
  );
}

interface StatsCardsProps {
  rateTables: RateTable[];
}

async function StatsCards({ rateTables }: StatsCardsProps) {
  const activeCount = rateTables.filter((rt) => rt.status === 'Active').length;
  const draftCount = rateTables.filter((rt) => rt.status === 'Draft').length;
  const totalRoles = rateTables.reduce((sum, rt) => sum + rt.rates.length, 0);
  const avgDefaultRate =
    rateTables.length > 0
      ? rateTables.reduce((sum, rt) => sum + rt.defaultRate, 0) /
        rateTables.length
      : 0;

  const stats = [
    {
      label: 'Active Tables',
      value: activeCount.toString(),
      icon: DollarSign,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    },
    {
      label: 'Draft Tables',
      value: draftCount.toString(),
      icon: Calendar,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    },
    {
      label: 'Roles Configured',
      value: totalRoles.toString(),
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      label: 'Avg Default Rate',
      value: formatCurrency(avgDefaultRate) + '/hr',
      icon: DollarSign,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
        >
          <div className="flex items-center gap-3">
            <div className={`rounded-lg p-2 ${stat.bgColor}`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {stat.label}
              </p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {stat.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface RateTableRowProps {
  rateTable: RateTable;
}

function RateTableRow({ rateTable }: RateTableRowProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              {rateTable.name}
            </h3>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(rateTable.status)}`}
            >
              {rateTable.status}
            </span>
          </div>

          {rateTable.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              {rateTable.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span className="font-semibold text-green-600 dark:text-green-400">
                {formatCurrency(rateTable.defaultRate)}/hr
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                default
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-slate-700 dark:text-slate-300">
                {rateTable.rates.length} roles
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span className="text-slate-600 dark:text-slate-400">
                Effective: {new Date(rateTable.effectiveDate).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Role-specific rates preview */}
          {rateTable.rates.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {rateTable.rates.slice(0, 4).map((rate, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-xs dark:bg-slate-700"
                >
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {rate.role}:
                  </span>
                  <span className="text-green-600 dark:text-green-400">
                    {formatCurrency(rate.rate)}/hr
                  </span>
                </span>
              ))}
              {rateTable.rates.length > 4 && (
                <span className="inline-flex items-center rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                  +{rateTable.rates.length - 4} more
                </span>
              )}
            </div>
          )}
        </div>

        <RateTableActions rateTable={rateTable} />
      </div>
    </div>
  );
}

interface RateTableListProps {
  rateTables: RateTable[];
}

function RateTableList({ rateTables }: RateTableListProps) {
  if (rateTables.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-16 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
          <DollarSign className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
          No Rate Tables
        </h3>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Create your first rate table to get started
        </p>
        <Link
          href="/billing/rates/new"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Create Rate Table
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rateTables.map((rateTable) => (
        <RateTableRow key={rateTable.id} rateTable={rateTable} />
      ))}
    </div>
  );
}

// ============================================================================
// Async Data Components
// ============================================================================

async function RateTablesContent() {
  const result = await getRateTables();
  const rateTables = result.success && result.data ? result.data : [];

  return (
    <div className="space-y-6">
      <StatsCards rateTables={rateTables} />
      <RateTableList rateTables={rateTables} />
    </div>
  );
}

function RateTablesSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700"
          />
        ))}
      </div>

      {/* List skeleton */}
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700"
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function RateTablesPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <PageHeader />

      <div className="mx-auto max-w-7xl px-6 py-8">
        <Suspense fallback={<RateTablesSkeleton />}>
          <RateTablesContent />
        </Suspense>
      </div>
    </div>
  );
}
