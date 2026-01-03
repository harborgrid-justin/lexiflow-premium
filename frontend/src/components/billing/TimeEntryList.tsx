/**
 * TimeEntryList Component
 * Display and filter time entries with bulk operations
 */

import React, { useState } from 'react';
import { Link, Form } from 'react-router';
import { Clock, DollarSign, Filter, Check } from 'lucide-react';
import type { TimeEntry } from '@/types/financial';

interface TimeEntryListProps {
  entries: TimeEntry[];
  filters?: any;
}

export const TimeEntryList: React.FC<TimeEntryListProps> = ({ entries, filters }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === entries.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(entries.map((e) => e.id));
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      Draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      Submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      Approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      Billed: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      Unbilled: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    };

    return (
      <span
        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
          styles[status as keyof typeof styles] || styles.Draft
        }`}
      >
        {status}
      </span>
    );
  };

  const totalHours = entries.reduce((sum, e) => sum + e.duration, 0);
  const totalAmount = entries.reduce((sum, e) => sum + e.total, 0);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          <Filter className="h-4 w-4" />
          Filters
        </button>

        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span className="font-medium">{totalHours.toFixed(2)}</span> hours
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            <span className="font-medium">${totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {showFilters && (
        <Form method="get" className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Case
              </label>
              <select
                name="caseId"
                defaultValue={filters?.caseId || ''}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="">All Cases</option>
                <option value="C-2024-001">Martinez v. TechCorp</option>
                <option value="C-2024-112">OmniGlobal Merger</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </label>
              <select
                name="status"
                defaultValue={filters?.status || ''}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Submitted">Submitted</option>
                <option value="Approved">Approved</option>
                <option value="Billed">Billed</option>
                <option value="Unbilled">Unbilled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Billable
              </label>
              <select
                name="billable"
                defaultValue={filters?.billable || ''}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="">All</option>
                <option value="true">Billable Only</option>
                <option value="false">Non-Billable Only</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </Form>
      )}

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900/20">
          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
            {selectedIds.length} selected
          </span>
          <Form method="post" className="flex gap-2">
            <input type="hidden" name="ids" value={JSON.stringify(selectedIds)} />
            <button
              type="submit"
              name="intent"
              value="approve-bulk"
              className="flex items-center gap-2 rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-green-700"
            >
              <Check className="h-4 w-4" />
              Approve Selected
            </button>
          </Form>
        </div>
      )}

      {/* Entries Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedIds.length === entries.length && entries.length > 0}
                  onChange={toggleAll}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Case
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Hours
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
            {entries.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(entry.id)}
                    onChange={() => toggleSelection(entry.id)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                  {new Date(entry.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                  {entry.caseId}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                  <div className="max-w-xs truncate" title={entry.description}>
                    {entry.description}
                  </div>
                  {entry.ledesCode && (
                    <div className="mt-1 text-xs text-gray-500">
                      LEDES: {entry.ledesCode}
                    </div>
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                  {entry.duration.toFixed(2)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                  ${entry.rate}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                  ${entry.total.toLocaleString()}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  {getStatusBadge(entry.status)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <Form method="post" className="inline-flex gap-2">
                    <input type="hidden" name="id" value={entry.id} />
                    {entry.status === 'Submitted' && (
                      <button
                        type="submit"
                        name="intent"
                        value="approve"
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                      >
                        Approve
                      </button>
                    )}
                    <Link
                      to={`/billing/time/${entry.id}/edit`}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Edit
                    </Link>
                    <button
                      type="submit"
                      name="intent"
                      value="delete"
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      onClick={(e) => {
                        if (!confirm('Delete this time entry?')) {
                          e.preventDefault();
                        }
                      }}
                    >
                      Delete
                    </button>
                  </Form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {entries.length === 0 && (
          <div className="py-12 text-center">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              No time entries
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by creating a new time entry.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};