/**
 * PartiesTable Component
 *
 * Displays case parties (plaintiffs, defendants, counsel) in a table format.
 * Supports sorting, filtering, and inline actions.
 *
 * @module components/features/cases/PartiesTable
 */

import { cn } from '@/lib/utils';
import type { Party } from '@/types';
import { useState } from 'react';

export interface PartiesTableProps {
  /** Array of parties to display */
  parties: Party[];
  /** Optional click handler for party selection */
  onSelectParty?: (party: Party) => void;
  /** Show actions column */
  showActions?: boolean;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Get party type badge color
 */
function getPartyTypeBadge(type: string): {
  bgColor: string;
  textColor: string;
} {
  const typeMap: Record<string, { bgColor: string; textColor: string }> = {
    'Plaintiff': {
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-700 dark:text-blue-400',
    },
    'Defendant': {
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      textColor: 'text-red-700 dark:text-red-400',
    },
    'Petitioner': {
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-700 dark:text-green-400',
    },
    'Respondent': {
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      textColor: 'text-orange-700 dark:text-orange-400',
    },
    'Appellant': {
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-700 dark:text-purple-400',
    },
    'Appellee': {
      bgColor: 'bg-pink-50 dark:bg-pink-900/20',
      textColor: 'text-pink-700 dark:text-pink-400',
    },
    'Third Party': {
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      textColor: 'text-yellow-700 dark:text-yellow-400',
    },
    'Witness': {
      bgColor: 'bg-teal-50 dark:bg-teal-900/20',
      textColor: 'text-teal-700 dark:text-teal-400',
    },
    'Expert Witness': {
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      textColor: 'text-indigo-700 dark:text-indigo-400',
    },
  };

  return typeMap[type] || {
    bgColor: 'bg-gray-50 dark:bg-gray-900/20',
    textColor: 'text-gray-700 dark:text-gray-400',
  };
}

/**
 * PartiesTable component displays parties in a table
 */
export function PartiesTable({
  parties,
  onSelectParty,
  showActions = true,
  className,
}: PartiesTableProps) {
  const [sortField, setSortField] = useState<keyof Party>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: keyof Party) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedParties = [...parties].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (aValue === undefined || aValue === null) return 1;
    if (bValue === undefined || bValue === null) return -1;

    const comparison = String(aValue).localeCompare(String(bValue));
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  if (parties.length === 0) {
    return (
      <div className={cn('rounded-lg border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800/50', className)}>
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No parties</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Add parties to this case to track plaintiffs, defendants, and counsel.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700', className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead style={{ backgroundColor: 'var(--color-surfaceHover)' }}>
            <tr>
              <th
                scope="col"
                className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1">
                  <span>Name</span>
                  {sortField === 'name' && (
                    <svg className={cn('h-4 w-4', sortDirection === 'desc' && 'rotate-180')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                onClick={() => handleSort('type')}
              >
                <div className="flex items-center gap-1">
                  <span>Type</span>
                  {sortField === 'type' && (
                    <svg className={cn('h-4 w-4', sortDirection === 'desc' && 'rotate-180')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                onClick={() => handleSort('role')}
              >
                <div className="flex items-center gap-1">
                  <span>Role</span>
                  {sortField === 'role' && (
                    <svg className={cn('h-4 w-4', sortDirection === 'desc' && 'rotate-180')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  )}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Contact
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Counsel
              </th>
              {showActions && (
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} className="divide-y">
            {sortedParties.map((party) => {
              const typeBadge = getPartyTypeBadge(party.type);

              return (
                <tr
                  key={party.id}
                  className={cn(
                    'hover:bg-gray-50 dark:hover:bg-gray-800',
                    onSelectParty && 'cursor-pointer'
                  )}
                  onClick={() => onSelectParty?.(party)}
                >
                  {/* Name */}
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {party.name}
                        </div>
                        {party.organization && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {party.organization}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={cn(
                        'inline-flex rounded-full px-2.5 py-1 text-xs font-medium',
                        typeBadge.bgColor,
                        typeBadge.textColor
                      )}
                    >
                      {party.type}
                    </span>
                  </td>

                  {/* Role */}
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {party.role}
                  </td>

                  {/* Contact */}
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {party.email && (
                        <div className="flex items-center gap-1">
                          <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <a href={`mailto:${party.email}`} className="text-blue-600 hover:underline dark:text-blue-400">
                            {party.email}
                          </a>
                        </div>
                      )}
                      {party.phone && (
                        <div className="mt-1 flex items-center gap-1 text-gray-500 dark:text-gray-400">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {party.phone}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Counsel */}
                  <td className="px-6 py-4">
                    {party.counsel || party.attorneyName ? (
                      <div className="text-sm">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {party.attorneyName || party.counsel}
                        </div>
                        {party.attorneyFirm && (
                          <div className="text-gray-500 dark:text-gray-400">
                            {party.attorneyFirm}
                          </div>
                        )}
                        {party.attorneyEmail && (
                          <div className="mt-1">
                            <a href={`mailto:${party.attorneyEmail}`} className="text-blue-600 hover:underline dark:text-blue-400">
                              {party.attorneyEmail}
                            </a>
                          </div>
                        )}
                        {party.isProSe && (
                          <span className="mt-1 inline-flex rounded bg-yellow-50 px-2 py-0.5 text-xs text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                            Pro Se
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 dark:text-gray-500">
                        No counsel
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  {showActions && (
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle action
                        }}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        View
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
