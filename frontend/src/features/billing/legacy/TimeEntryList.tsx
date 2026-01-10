/**
 * TimeEntryList Component
 * Display and filter time entries with bulk operations
 */

import { useTheme } from '@/contexts/theme/ThemeContext';
import { cn } from '@/lib/utils';
import type { TimeEntry } from '@/types/financial';
import { Check, Clock, DollarSign, Filter } from 'lucide-react';
import React, { useState } from 'react';
import { Form, Link } from 'react-router';


interface TimeEntryListProps {
  entries: TimeEntry[];
  filters?: Record<string, unknown>;
}

export const TimeEntryList: React.FC<TimeEntryListProps> = ({ entries, filters }) => {
  const { theme } = useTheme();
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
        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${styles[status as keyof typeof styles] || styles.Draft
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
          className={cn("flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium shadow-sm transition-colors", theme.surface.default, theme.border.default, theme.text.primary, `hover:${theme.surface.highlight}`)}
        >
          <Filter className="h-4 w-4" />
          Filters
        </button>

        <div className={cn("flex items-center gap-4 text-sm", theme.text.secondary)}>
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
        <Form method="get" className={cn("rounded-lg border p-4", theme.surface.subtle, theme.border.default)}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <label className={cn("block text-sm font-medium", theme.text.secondary)}>
                Case
              </label>
              <select
                name="caseId"
                defaultValue={(filters?.caseId as string) || ''}
                className={cn("mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500", theme.surface.default, theme.border.default, theme.text.primary)}
              >
                <option value="">All Cases</option>
                <option value="C-2024-001">Martinez v. TechCorp</option>
                <option value="C-2024-112">OmniGlobal Merger</option>
              </select>
            </div>

            <div>
              <label className={cn("block text-sm font-medium", theme.text.secondary)}>
                Status
              </label>
              <select
                name="status"
                defaultValue={(filters?.status as string) || ''}
                className={cn("mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500", theme.surface.default, theme.border.default, theme.text.primary)}
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
              <label className={cn("block text-sm font-medium", theme.text.secondary)}>
                Billable
              </label>
              <select
                name="billable"
                defaultValue={(filters?.billable as string) || ''}
                className={cn("mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500", theme.surface.default, theme.border.default, theme.text.primary)}
              >
                <option value="">All</option>
                <option value="true">Billable Only</option>
                <option value="false">Non-Billable Only</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className={cn("w-full rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2", theme.interactive.primary, "focus:ring-blue-500")}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </Form>
      )}

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className={cn("flex items-center justify-between rounded-lg p-4", theme.surface.highlight)}>
          <span className={cn("text-sm font-medium", theme.text.accent)}>
            {selectedIds.length} selected
          </span>
          <Form method="post" className="flex gap-2">
            <input type="hidden" name="ids" value={JSON.stringify(selectedIds)} />
            <button
              type="submit"
              name="intent"
              value="approve-bulk"
              className={cn("flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-white shadow-sm", (theme.interactive as Record<string, string>).success)}
            >
              <Check className="h-4 w-4" />
              Approve Selected
            </button>
          </Form>
        </div>
      )}

      {/* Entries Table */}
      <div className={cn("overflow-hidden rounded-lg border shadow", theme.surface.default, theme.border.default)}>
        <table className={cn("min-w-full divide-y", theme.border.default)}>
          <thead className={cn(theme.surface.subtle)}>
            <tr>
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedIds.length === entries.length && entries.length > 0}
                  onChange={toggleAll}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                Date
              </th>
              <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                Case
              </th>
              <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                Description
              </th>
              <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                Hours
              </th>
              <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                Rate
              </th>
              <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                Amount
              </th>
              <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                Status
              </th>
              <th className={cn("px-6 py-3 text-right text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className={cn("divide-y", theme.border.default, theme.surface.default)}>
            {entries.map((entry) => (
              <tr key={entry.id} className={cn("transition-colors", `hover:${theme.surface.subtle}`)}>
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(entry.id)}
                    onChange={() => toggleSelection(entry.id)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className={cn("whitespace-nowrap px-6 py-4 text-sm", theme.text.primary)}>
                  {new Date(entry.date).toLocaleDateString()}
                </td>
                <td className={cn("px-6 py-4 text-sm", theme.text.primary)}>
                  {entry.caseId}
                </td>
                <td className={cn("px-6 py-4 text-sm", theme.text.secondary)}>
                  <div className="max-w-xs truncate" title={entry.description}>
                    {entry.description}
                  </div>
                  {entry.ledesCode && (
                    <div className={cn("mt-1 text-xs", theme.text.muted)}>
                      LEDES: {entry.ledesCode}
                    </div>
                  )}
                </td>
                <td className={cn("whitespace-nowrap px-6 py-4 text-sm", theme.text.primary)}>
                  {entry.duration.toFixed(2)}
                </td>
                <td className={cn("whitespace-nowrap px-6 py-4 text-sm", theme.text.primary)}>
                  ${entry.rate}
                </td>
                <td className={cn("whitespace-nowrap px-6 py-4 text-sm font-medium", theme.text.primary)}>
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
                        className={cn((theme.text as Record<string, string>).success, "hover:underline")}
                      >
                        Approve
                      </button>
                    )}
                    <Link
                      to={`/billing/time/${entry.id}/edit`}
                      className={cn(theme.text.accent, "hover:underline")}
                    >
                      Edit
                    </Link>
                    <button
                      type="submit"
                      name="intent"
                      value="delete"
                      className={cn((theme.text as Record<string, string>).error, "hover:underline")}
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
            <Clock className={cn("mx-auto h-12 w-12", theme.text.muted)} />
            <h3 className={cn("mt-2 text-sm font-medium", theme.text.primary)}>
              No time entries
            </h3>
            <p className={cn("mt-1 text-sm", theme.text.secondary)}>
              Get started by creating a new time entry.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
