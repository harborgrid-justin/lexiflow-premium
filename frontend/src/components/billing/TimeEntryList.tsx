/**
 * TimeEntryList Component
 * Display and filter time entries with bulk operations
 */

import { Check, Clock, DollarSign, Filter } from 'lucide-react';
import React, { useState } from 'react';
import { Form, Link } from 'react-router';

import { useTheme } from "@/hooks/useTheme";

import type { TimeEntry } from '@/types/financial';

interface TimeEntryListProps {
  entries: TimeEntry[];
  filters?: Record<string, unknown>;
}

export const TimeEntryList: React.FC<TimeEntryListProps> = ({ entries, filters }) => {
  const { theme, tokens } = useTheme();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const toStyleValue = (value: unknown) => String(value);
  const filterValue = (value: unknown) => (typeof value === 'string' ? value : '');
  const borderDefault = toStyleValue(theme.border.default);
  const primaryDefault = toStyleValue(theme.primary.DEFAULT);
  const surfaceBase = toStyleValue(theme.surface.base);
  const surfaceElevated = toStyleValue(theme.surface.elevated);
  const surfaceHover = toStyleValue(theme.surface.hover);
  const surfaceInput = toStyleValue(theme.surface.input);
  const surfaceMuted = toStyleValue(theme.surface.muted);
  const surfaceRaised = toStyleValue(theme.surface.raised);
  const textPrimary = toStyleValue(theme.text.primary);
  const textSecondary = toStyleValue(theme.text.secondary);
  const textMuted = toStyleValue(theme.text.muted);
  const statusSuccessBg = toStyleValue(theme.status.success.bg);
  const statusSuccessText = toStyleValue(theme.status.success.text);
  const statusWarningBg = toStyleValue(theme.status.warning.bg);
  const statusWarningText = toStyleValue(theme.status.warning.text);
  const statusErrorText = toStyleValue(theme.status.error.text);
  const blue400 = toStyleValue(tokens.colors.blue400);
  const blue600 = toStyleValue(tokens.colors.blue600);
  const indigo400 = toStyleValue(tokens.colors.indigo400);

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
      Draft: { bg: surfaceMuted, text: textSecondary },
      Submitted: { bg: `${blue400}20`, text: blue600 },
      Approved: { bg: statusSuccessBg, text: statusSuccessText },
      Billed: { bg: `${indigo400}20`, text: indigo400 },
      Unbilled: { bg: statusWarningBg, text: statusWarningText },
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
          style={{ backgroundColor: surfaceElevated, borderColor: borderDefault, color: textPrimary }}
          className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium shadow-sm hover:opacity-90 transition-all"
        >
          <Filter className="h-4 w-4" />
          Filters
        </button>

        <div className="flex items-center gap-4 text-sm" style={{ color: textSecondary }}>
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
        <Form method="get" className="rounded-lg border p-4" style={{ borderColor: borderDefault, backgroundColor: surfaceRaised }}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <label className="block text-sm font-medium" style={{ color: textPrimary }}>
                Case
              </label>
              <select
                name="caseId"
                defaultValue={filterValue(filters?.caseId)}
                style={{ backgroundColor: surfaceInput, borderColor: borderDefault, color: textPrimary }}
                className="mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 transition-all"
              >
                <option value="">All Cases</option>
                <option value="C-2024-001">Martinez v. TechCorp</option>
                <option value="C-2024-112">OmniGlobal Merger</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium" style={{ color: textPrimary }}>
                Status
              </label>
              <select
                name="status"
                defaultValue={filterValue(filters?.status)}
                style={{ backgroundColor: surfaceInput, borderColor: borderDefault, color: textPrimary }}
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
                color: textPrimary,
              }}>
                Billable
              </label>
              <select
                name="billable"
                defaultValue={filterValue(filters?.billable)}
                style={{
                  marginTop: tokens.spacing.compact.xs,
                  display: 'block',
                  width: '100%',
                  borderRadius: tokens.borderRadius.md,
                  border: `1px solid ${borderDefault}`,
                  backgroundColor: surfaceInput,
                  padding: `${tokens.spacing.compact.sm} ${tokens.spacing.normal.md}`,
                  fontSize: tokens.typography.fontSize.sm,
                  boxShadow: tokens.shadows.sm,
                  color: textPrimary,
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
                  backgroundColor: primaryDefault,
                  padding: `${tokens.spacing.compact.sm} ${tokens.spacing.normal.lg}`,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: surfaceBase,
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
          border: `1px solid ${primaryDefault}30`,
          backgroundColor: `${primaryDefault}15`,
          padding: tokens.spacing.normal.lg,
        }}>
          <span style={{
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.medium,
            color: primaryDefault,
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
                backgroundColor: statusSuccessText,
                padding: `${tokens.spacing.compact.sm} ${tokens.spacing.normal.md}`,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: surfaceBase,
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
        border: `1px solid ${borderDefault}`,
        backgroundColor: surfaceBase,
        boxShadow: tokens.shadows.sm,
      }}>
        <table
          style={{ minWidth: '100%', borderColor: borderDefault }}
          className="divide-y"
        >
          <thead style={{ backgroundColor: surfaceElevated }}>
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
                color: textMuted,
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
                color: textMuted,
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
                color: textMuted,
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
                color: textMuted,
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
                color: textMuted,
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
                color: textMuted,
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
                color: textMuted,
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
                color: textMuted,
              }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody
            style={{ backgroundColor: surfaceBase, borderColor: borderDefault }}
            className="divide-y"
          >
            {entries.map((entry) => (
              <tr key={entry.id}
                className="transition-colors"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = surfaceHover;
                }}
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
                  color: textPrimary,
                }}>
                  {new Date(entry.date).toLocaleDateString()}
                </td>
                <td style={{
                  padding: `${tokens.spacing.normal.lg} ${tokens.spacing.normal['2xl']}`,
                  fontSize: tokens.typography.fontSize.sm,
                  color: textPrimary,
                }}>
                  {entry.caseId}
                </td>
                <td style={{
                  padding: `${tokens.spacing.normal.lg} ${tokens.spacing.normal['2xl']}`,
                  fontSize: tokens.typography.fontSize.sm,
                  color: textSecondary,
                }}>
                  <div className="max-w-xs truncate" title={entry.description}>
                    {entry.description}
                  </div>
                  {entry.ledesCode && (
                    <div style={{
                      marginTop: tokens.spacing.compact.xs,
                      fontSize: tokens.typography.fontSize.xs,
                      color: textMuted,
                    }}>
                      LEDES: {entry.ledesCode}
                    </div>
                  )}
                </td>
                <td style={{
                  whiteSpace: 'nowrap',
                  padding: `${tokens.spacing.normal.lg} ${tokens.spacing.normal['2xl']}`,
                  fontSize: tokens.typography.fontSize.sm,
                  color: textPrimary,
                }}>
                  {entry.duration.toFixed(2)}
                </td>
                <td style={{
                  whiteSpace: 'nowrap',
                  padding: `${tokens.spacing.normal.lg} ${tokens.spacing.normal['2xl']}`,
                  fontSize: tokens.typography.fontSize.sm,
                  color: textPrimary,
                }}>
                  ${entry.rate}
                </td>
                <td style={{
                  whiteSpace: 'nowrap',
                  padding: `${tokens.spacing.normal.lg} ${tokens.spacing.normal['2xl']}`,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: textPrimary,
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
                        style={{ color: statusSuccessText }}
                        className="transition-opacity"
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                      >
                        Approve
                      </button>
                    )}
                    <Link
                      to={`/billing/time/${entry.id}/edit`}
                      style={{ color: primaryDefault }}
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
                      style={{ color: statusErrorText }}
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
              color: textMuted,
            }} />
            <h3 style={{
              marginTop: tokens.spacing.compact.sm,
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              color: textPrimary,
            }}>
              No time entries
            </h3>
            <p style={{
              marginTop: tokens.spacing.compact.xs,
              fontSize: tokens.typography.fontSize.sm,
              color: textMuted,
            }}>
              Get started by creating a new time entry.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
