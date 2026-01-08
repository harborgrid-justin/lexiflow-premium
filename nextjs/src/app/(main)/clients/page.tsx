/**
 * Clients Page - Server Component with Server Actions
 * Next.js 16 Compliant: Async params/searchParams, Server Actions
 */

import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { getClients } from '@/lib/actions/clients';
import type { Client } from '@/types/financial';

export const metadata: Metadata = {
  title: 'Clients | LexiFlow',
  description: 'Manage clients and contacts',
};

// Next.js 16: searchParams must be awaited
interface ClientsPageProps {
  searchParams: Promise<{
    status?: string;
    type?: string;
    search?: string;
    page?: string;
    isVip?: string;
    hasRetainer?: string;
  }>;
}

/**
 * Status badge colors
 */
const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  inactive: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
  prospective: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  former: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  blocked: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

/**
 * Client type icons
 */
const typeIcons: Record<string, string> = {
  individual: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  corporation: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  partnership: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
  llc: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  nonprofit: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  government: 'M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z',
  other: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
};

/**
 * Client card component
 */
function ClientCard({ client }: { client: Client }) {
  const typeIcon = typeIcons[client.clientType || 'other'] || typeIcons.other;

  return (
    <Link
      href={`/clients/${client.id}`}
      className="block p-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          {/* Type Icon */}
          <div className="flex-shrink-0 w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-slate-600 dark:text-slate-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={typeIcon} />
            </svg>
          </div>

          {/* Client Info */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
                {client.name}
              </h3>
              {client.isVip && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                  VIP
                </span>
              )}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {client.clientNumber}
            </p>
            {client.email && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {client.email}
              </p>
            )}
            {client.phone && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {client.phone}
              </p>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            statusColors[client.status] || statusColors.active
          }`}
        >
          {client.status}
        </span>
      </div>

      {/* Stats Row */}
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Active Cases</p>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {client.activeCases || 0}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Total Billed</p>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            ${(client.totalBilled || 0).toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Balance</p>
          <p className={`text-sm font-semibold ${
            (client.currentBalance || 0) > 0
              ? 'text-red-600 dark:text-red-400'
              : 'text-green-600 dark:text-green-400'
          }`}>
            ${Math.abs(client.currentBalance || 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Retainer indicator */}
      {client.hasRetainer && (
        <div className="mt-3 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Retainer: ${(client.retainerBalance || 0).toLocaleString()}
        </div>
      )}
    </Link>
  );
}

/**
 * Clients data fetcher component
 */
async function ClientsData({
  filters,
}: {
  filters: {
    status?: string[];
    clientType?: string[];
    searchQuery?: string;
    page?: number;
    isVip?: boolean;
    hasRetainer?: boolean;
  };
}) {
  const result = await getClients(
    filters.status || filters.clientType || filters.searchQuery || filters.isVip !== undefined || filters.hasRetainer !== undefined
      ? {
          status: filters.status as ('active' | 'inactive' | 'prospective' | 'former' | 'blocked')[],
          clientType: filters.clientType as ('individual' | 'corporation' | 'partnership' | 'llc' | 'nonprofit' | 'government' | 'other')[],
          searchQuery: filters.searchQuery,
          page: filters.page ?? 1,
          pageSize: 24,
          isVip: filters.isVip,
          hasRetainer: filters.hasRetainer,
        }
      : undefined
  );

  if (!result.success) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">
          Failed to load clients: {result.error}
        </p>
        <Link
          href="/clients"
          className="mt-4 inline-block text-blue-600 hover:underline"
        >
          Try again
        </Link>
      </div>
    );
  }

  const clients = result.data;

  if (clients.length === 0) {
    return (
      <div className="col-span-full text-center py-12 bg-white dark:bg-slate-800 rounded-lg border">
        <svg
          className="mx-auto h-12 w-12 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-slate-100">
          No clients found
        </h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {filters.searchQuery
            ? 'No clients match your search criteria.'
            : 'Get started by adding your first client.'}
        </p>
        <Link
          href="/clients/new"
          className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Client
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Results count */}
      <div className="col-span-full mb-2">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Showing {clients.length} client{clients.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Client cards */}
      {clients.map((client) => (
        <ClientCard key={client.id} client={client} />
      ))}
    </>
  );
}

/**
 * Loading skeleton
 */
function ClientsLoadingSkeleton() {
  return (
    <>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="p-6 bg-white dark:bg-slate-800 rounded-lg border animate-pulse"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            <div className="flex-1">
              <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-2" />
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
            </div>
            <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 grid grid-cols-3 gap-4">
            <div>
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-1" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-8" />
            </div>
            <div>
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-1" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16" />
            </div>
            <div>
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-1" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-12" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

/**
 * Main Clients Page
 */
export default async function ClientsPage({
  searchParams,
}: ClientsPageProps): Promise<React.JSX.Element> {
  // Next.js 16: Await searchParams
  const params = await searchParams;

  // Parse filters from search params
  const filters = {
    status: params.status?.split(',').filter(Boolean) as string[] | undefined,
    clientType: params.type?.split(',').filter(Boolean) as string[] | undefined,
    searchQuery: params.search,
    page: params.page ? parseInt(params.page, 10) : 1,
    isVip: params.isVip === 'true' ? true : params.isVip === 'false' ? false : undefined,
    hasRetainer: params.hasRetainer === 'true' ? true : params.hasRetainer === 'false' ? false : undefined,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            Clients
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage client relationships and contacts
          </p>
        </div>
        <Link
          href="/clients/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Client
        </Link>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href="/clients"
          className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
            !params.status && !params.isVip && !params.hasRetainer
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          All
        </Link>
        <Link
          href="/clients?status=active"
          className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
            params.status === 'active'
              ? 'bg-green-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          Active
        </Link>
        <Link
          href="/clients?isVip=true"
          className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
            params.isVip === 'true'
              ? 'bg-amber-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          VIP
        </Link>
        <Link
          href="/clients?hasRetainer=true"
          className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
            params.hasRetainer === 'true'
              ? 'bg-purple-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          With Retainer
        </Link>
        <Link
          href="/clients?status=prospective"
          className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
            params.status === 'prospective'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          Prospective
        </Link>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Suspense fallback={<ClientsLoadingSkeleton />}>
          <ClientsData filters={filters} />
        </Suspense>
      </div>
    </div>
  );
}
