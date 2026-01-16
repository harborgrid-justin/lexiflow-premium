/**
 * TimeEntryList Component
 * Display and filter time entries with bulk operations
 */

import { useTheme } from "@/hooks/useTheme";
import type { TimeEntry } from '@/types/financial';
import { Check, Clock, DollarSign, Filter } from 'lucide-react';
import React, { useState } from 'react';
import { Form, Link } from 'react-router';

interface TimeEntryListProps {
  entries: TimeEntry[];
  filters?: Record<string, unknown>;
}

export const TimeEntryList: React.FC<TimeEntryListProps> = ({ entries, filters }) => {
  const { theme, tokens } = useTheme();
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
      Draft: { bg: theme.surface.muted, text: theme.text.secondary },
      Submitted: { bg: tokens.colors.blue400 + '20', text: tokens.colors.blue600 },
      Approved: { bg: theme.status.success.bg, text: theme.status.success.text },
      Billed: { bg: tokens.colors.indigo400 + '20', text: tokens.colors.indigo400 },
      Unbilled: { bg: theme.status.warning.bg, text: theme.status.warning.text },
    };

    const statusStyle = styles[status as keyof typeof styles] || styles.Draft;
    return (
      <span
        style={{
          backgroundColor: statusStyle.bg,
          color: statusStyle.text,
          borderRadius: tokens.borderRadius.full,
          padding: `${tokens.spacing.compact.xs} ${tokens.spacing.compact.sm}`,
          fontSize: tokens.typography.fontSize.xs,
          fontWeight: tokens.typography.fontWeight.semibold,
        }}
        className="inline-flex"
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
          style={{ backgroundColor: theme.surface.elevated, borderColor: theme.border.default, color: theme.text.primary }}
          className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium shadow-sm hover:opacity-90 transition-all"
        >
          <Filter className="h-4 w-4" />
          Filters
        </button>

        <div className="flex items-center gap-4 text-sm" style={{ color: theme.text.secondary }}>
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
        <Form method="get" className="rounded-lg border p-4" style={{ borderColor: theme.border.default, backgroundColor: theme.surface.raised }}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <label className="block text-sm font-medium" style={{ color: theme.text.primary }}>
                Case
              </label>
              <select
                name="caseId"
                defaultValue={(filters?.caseId as string) || ''}
                style={{ backgroundColor: theme.surface.input, borderColor: theme.border.default, color: theme.text.primary }}
                className="mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 transition-all"
              >
                <option value="">All Cases</option>
                <option value="C-2024-001">Martinez v. TechCorp</option>
                <option value="C-2024-112">OmniGlobal Merger</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium" style={{ color: theme.text.primary }}>
                Status
              </label>
              <select
                name="status"
                defaultValue={(filters?.status as string) || ''}
                style={{ backgroundColor: theme.surface.input, borderColor: theme.border.default, color: theme.text.primary }}
                className="mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 transition-all"
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
              <label style={{
                display: 'block',
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: theme.text.primary,
              }}>
                Billable
              </label>
              <select
                name="billable"
                defaultValue={(filters?.billable as string) || ''}
                style={{
                  marginTop: tokens.spacing.compact.xs,
                  display: 'block',
                  width: '100%',
                  borderRadius: tokens.borderRadius.md,
                  border: `1px solid ${theme.border.default}`,
                  backgroundColor: theme.surface.input,
                  padding: `${tokens.spacing.compact.sm} ${tokens.spacing.normal.md}`,
                  fontSize: tokens.typography.fontSize.sm,
                  boxShadow: tokens.shadows.sm,
                  color: theme.text.primary,
                }}
                className="focus:outline-none focus:ring-2 transition-all"
              >
                <option value="">All</option>
                <option value="true">Billable Only</option>
                <option value="false">Non-Billable Only</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                style={{
                  width: '100%',
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: theme.primary.DEFAULT,
                  padding: `${tokens.spacing.compact.sm} ${tokens.spacing.normal.lg}`,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: theme.surface.base,
                  boxShadow: tokens.shadows.sm,
                }}
                className="transition-opacity focus:outline-none focus:ring-2"
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </Form>
      )}

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: tokens.borderRadius.lg,
          border: `1px solid ${theme.primary.DEFAULT}30`,
          backgroundColor: theme.primary.DEFAULT + '15',
          padding: tokens.spacing.normal.lg,
        }}>
          <span style={{
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.medium,
            color: theme.primary.DEFAULT,
          }}>
            {selectedIds.length} selected
          </span>
          <Form method="post" style={{ display: 'flex', gap: tokens.spacing.normal.sm }}>
            <input type="hidden" name="ids" value={JSON.stringify(selectedIds)} />
            <button
              type="submit"
              name="intent"
              value="approve-bulk"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing.normal.sm,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: theme.status.success.text,
                padding: `${tokens.spacing.compact.sm} ${tokens.spacing.normal.md}`,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: theme.surface.base,
                boxShadow: tokens.shadows.sm,
              }}
              className="transition-opacity"
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              <Check className="h-4 w-4" />
              Approve Selected
            </button>
          </Form>
        </div>
      )}

      {/* Entries Table */}
      <div style={{
        overflow: 'hidden',
        borderRadius: tokens.borderRadius.lg,
        border: `1px solid ${theme.border.default}`,
        backgroundColor: theme.surface.base,
        boxShadow: tokens.shadows.sm,
      }}>
        <table
          style={{ minWidth: '100%', borderColor: theme.border.default }}
          className="divide-y"
        >
          <thead style={{ backgroundColor: theme.surface.elevated }}>
            <tr>
              <th style={{ padding: `${tokens.spacing.compact.sm} ${tokens.spacing.normal.lg}` }}>
                <input
                  type="checkbox"
                  checked={selectedIds.length === entries.length && entries.length > 0}
                  onChange={toggleAll}
                  className="h-4 w-4 rounded focus:ring-2"
                />
              </th>
              <th style={{
                padding: `${tokens.spacing.normal.md} ${tokens.spacing.normal['2xl']}`,
                textAlign: 'left',
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: theme.text.muted,
              }}>
                Date
              </th>
              <th style={{
                padding: `${tokens.spacing.normal.md} ${tokens.spacing.normal['2xl']}`,
                textAlign: 'left',
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: theme.text.muted,
              }}>
                Case
              </th>
              <th style={{
                padding: `${tokens.spacing.normal.md} ${tokens.spacing.normal['2xl']}`,
                textAlign: 'left',
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: theme.text.muted,
              }}>
                Description
              </th>
              <th style={{
                padding: `${tokens.spacing.normal.md} ${tokens.spacing.normal['2xl']}`,
                textAlign: 'left',
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: theme.text.muted,
              }}>
                Hours
              </th>
              <th style={{
                padding: `${tokens.spacing.normal.md} ${tokens.spacing.normal['2xl']}`,
                textAlign: 'left',
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: theme.text.muted,
              }}>
                Rate
              </th>
              <th style={{
                padding: `${tokens.spacing.normal.md} ${tokens.spacing.normal['2xl']}`,
                textAlign: 'left',
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: theme.text.muted,
              }}>
                Amount
              </th>
              <th style={{
                padding: `${tokens.spacing.normal.md} ${tokens.spacing.normal['2xl']}`,
                textAlign: 'left',
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: theme.text.muted,
              }}>
                Status
              </th>
              <th style={{
                padding: `${tokens.spacing.normal.md} ${tokens.spacing.normal['2xl']}`,
                textAlign: 'right',
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: theme.text.muted,
              }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody
            style={{ backgroundColor: theme.surface.base, borderColor: theme.border.default }}
            className="divide-y"
          >
            {entries.map((entry) => (
              <tr key={entry.id}
                className="transition-colors"
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.surface.hover}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <td style={{ padding: `${tokens.spacing.normal.lg} ${tokens.spacing.normal.lg}` }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(entry.id)}
                    onChange={() => toggleSelection(entry.id)}
                    className="h-4 w-4 rounded focus:ring-2"
                  />
                </td>
                <td style={{
                  whiteSpace: 'nowrap',
                  padding: `${tokens.spacing.normal.lg} ${tokens.spacing.normal['2xl']}`,
                  fontSize: tokens.typography.fontSize.sm,
                  color: theme.text.primary,
                }}>
                  {new Date(entry.date).toLocaleDateString()}
                </td>
                <td style={{
                  padding: `${tokens.spacing.normal.lg} ${tokens.spacing.normal['2xl']}`,
                  fontSize: tokens.typography.fontSize.sm,
                  color: theme.text.primary,
                }}>
                  {entry.caseId}
                </td>
                <td style={{
                  padding: `${tokens.spacing.normal.lg} ${tokens.spacing.normal['2xl']}`,
                  fontSize: tokens.typography.fontSize.sm,
                  color: theme.text.secondary,
                }}>
                  <div className="max-w-xs truncate" title={entry.description}>
                    {entry.description}
                  </div>
                  {entry.ledesCode && (
                    <div style={{
                      marginTop: tokens.spacing.compact.xs,
                      fontSize: tokens.typography.fontSize.xs,
                      color: theme.text.muted,
                    }}>
                      LEDES: {entry.ledesCode}
                    </div>
                  )}
                </td>
                <td style={{
                  whiteSpace: 'nowrap',
                  padding: `${tokens.spacing.normal.lg} ${tokens.spacing.normal['2xl']}`,
                  fontSize: tokens.typography.fontSize.sm,
                  color: theme.text.primary,
                }}>
                  {entry.duration.toFixed(2)}
                </td>
                <td style={{
                  whiteSpace: 'nowrap',
                  padding: `${tokens.spacing.normal.lg} ${tokens.spacing.normal['2xl']}`,
                  fontSize: tokens.typography.fontSize.sm,
                  color: theme.text.primary,
                }}>
                  ${entry.rate}
                </td>
                <td style={{
                  whiteSpace: 'nowrap',
                  padding: `${tokens.spacing.normal.lg} ${tokens.spacing.normal['2xl']}`,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: theme.text.primary,
                }}>
                  ${entry.total.toLocaleString()}
                </td>
                <td style={{
                  whiteSpace: 'nowrap',
                  padding: `${tokens.spacing.normal.lg} ${tokens.spacing.normal['2xl']}`,
                }}>
                  {getStatusBadge(entry.status)}
                </td>
                <td style={{
                  whiteSpace: 'nowrap',
                  padding: `${tokens.spacing.normal.lg} ${tokens.spacing.normal['2xl']}`,
                  textAlign: 'right',
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                }}>
                  <Form method="post" className="inline-flex gap-2">
                    <input type="hidden" name="id" value={entry.id} />
                    {entry.status === 'Submitted' && (
                      <button
                        type="submit"
                        name="intent"
                        value="approve"
                        style={{ color: theme.status.success.text }}
                        className="transition-opacity"
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                      >
                        Approve
                      </button>
                    )}
                    <Link
                      to={`/billing/time/${entry.id}/edit`}
                      style={{ color: theme.primary.DEFAULT }}
                      className="transition-opacity"
                      onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                    >
                      Edit
                    </Link>
                    <button
                      type="submit"
                      name="intent"
                      value="delete"
                      style={{ color: theme.status.error.text }}
                      className="transition-opacity"
                      onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
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
          <div style={{
            padding: `${tokens.spacing.normal['3xl']} 0`,
            textAlign: 'center',
          }}>
            <Clock style={{
              margin: '0 auto',
              height: '3rem',
              width: '3rem',
              color: theme.text.muted,
            }} />
            <h3 style={{
              marginTop: tokens.spacing.compact.sm,
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              color: theme.text.primary,
            }}>
              No time entries
            </h3>
            <p style={{
              marginTop: tokens.spacing.compact.xs,
              fontSize: tokens.typography.fontSize.sm,
              color: theme.text.muted,
            }}>
              Get started by creating a new time entry.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
