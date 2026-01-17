/**
 * InvoiceList Component
 * Display and filter invoices with status tracking
 */

import { FileText, Filter, Send } from 'lucide-react';
import React, { useState } from 'react';
import { Form, Link } from 'react-router';

import { useTheme } from "@/hooks/useTheme";

import type { Invoice } from '@/types/financial';

interface InvoiceListProps {
  invoices: Invoice[];
  filters?: Record<string, unknown>;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({ invoices, filters }) => {
  const { theme, tokens } = useTheme();
  const [showFilters, setShowFilters] = useState(false);
  const toStyleValue = (value: unknown) => String(value);
  const filterValue = (value: unknown) => (typeof value === 'string' ? value : '');
  const borderDefault = toStyleValue(theme.border.default);
  const borderLight = toStyleValue(theme.border.light);
  const surfaceBase = toStyleValue(theme.surface.base);
  const surfaceElevated = toStyleValue(theme.surface.elevated);
  const surfaceHover = toStyleValue(theme.surface.hover);
  const surfaceInput = toStyleValue(theme.surface.input);
  const surfaceMuted = toStyleValue(theme.surface.muted);
  const textPrimary = toStyleValue(theme.text.primary);
  const textSecondary = toStyleValue(theme.text.secondary);
  const textMuted = toStyleValue(theme.text.muted);
  const primaryDefault = toStyleValue(theme.primary.DEFAULT);
  const statusSuccessBg = toStyleValue(theme.status.success.bg);
  const statusSuccessText = toStyleValue(theme.status.success.text);
  const statusErrorBg = toStyleValue(theme.status.error.bg);
  const statusErrorText = toStyleValue(theme.status.error.text);
  const statusWarningBg = toStyleValue(theme.status.warning.bg);
  const statusWarningText = toStyleValue(theme.status.warning.text);
  const blue400 = toStyleValue(tokens.colors.blue400);
  const blue600 = toStyleValue(tokens.colors.blue600);

  const getStatusBadge = (status: string) => {
    const styles = {
      Draft: { bg: surfaceMuted, text: textSecondary },
      Sent: { bg: `${blue400}20`, text: blue600 },
      Paid: { bg: statusSuccessBg, text: statusSuccessText },
      Overdue: { bg: statusErrorBg, text: statusErrorText },
      Cancelled: { bg: surfaceMuted, text: textSecondary },
      'Partially Paid': { bg: statusWarningBg, text: statusWarningText },
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

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            borderRadius: tokens.borderRadius.md,
            border: `1px solid ${borderDefault}`,
            backgroundColor: surfaceBase,
            padding: `${tokens.spacing.normal.sm} ${tokens.spacing.normal.md}`,
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.medium,
            color: textPrimary,
            boxShadow: tokens.shadows.sm,
          }}
          className="transition-colors"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = surfaceHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = surfaceBase;
          }}
        >
          <Filter className="h-4 w-4" />
          Filters
        </button>
      </div>

      {showFilters && (
        <Form method="get" style={{
          borderRadius: tokens.borderRadius.lg,
          border: `1px solid ${borderDefault}`,
          backgroundColor: surfaceElevated,
          padding: tokens.spacing.normal.md,
        }}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <label style={{
                display: 'block',
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: textPrimary,
              }}>
                Case
              </label>
              <select
                name="caseId"
                defaultValue={filterValue(filters?.caseId)}
                style={{
                  marginTop: tokens.spacing.normal.xs,
                  width: '100%',
                  borderRadius: tokens.borderRadius.md,
                  border: `1px solid ${borderDefault}`,
                  backgroundColor: surfaceInput,
                  padding: `${tokens.spacing.normal.sm} ${tokens.spacing.normal.md}`,
                  fontSize: tokens.typography.fontSize.sm,
                  color: textPrimary,
                  boxShadow: tokens.shadows.sm,
                }}
                className="focus:outline-none focus:ring-2"
              >
                <option value="">All Cases</option>
                <option value="C-2024-001">Martinez v. TechCorp</option>
                <option value="C-2024-112">OmniGlobal Merger</option>
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: textPrimary,
              }}>
                Client
              </label>
              <input
                type="text"
                name="clientId"
                defaultValue={filterValue(filters?.clientId)}
                placeholder="Client ID or name"
                style={{
                  marginTop: tokens.spacing.normal.xs,
                  width: '100%',
                  borderRadius: tokens.borderRadius.md,
                  border: `1px solid ${borderDefault}`,
                  backgroundColor: surfaceInput,
                  padding: `${tokens.spacing.normal.sm} ${tokens.spacing.normal.md}`,
                  fontSize: tokens.typography.fontSize.sm,
                  color: textPrimary,
                  boxShadow: tokens.shadows.sm,
                }}
                className="focus:outline-none focus:ring-2"
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: textPrimary,
              }}>
                Status
              </label>
              <select
                name="status"
                defaultValue={filterValue(filters?.status)}
                style={{
                  marginTop: tokens.spacing.normal.xs,
                  width: '100%',
                  borderRadius: tokens.borderRadius.md,
                  border: `1px solid ${borderDefault}`,
                  backgroundColor: surfaceInput,
                  padding: `${tokens.spacing.normal.sm} ${tokens.spacing.normal.md}`,
                  fontSize: tokens.typography.fontSize.sm,
                  color: textPrimary,
                  boxShadow: tokens.shadows.sm,
                }}
                className="focus:outline-none focus:ring-2"
              >
                <option value="">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Sent">Sent</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                style={{
                  width: '100%',
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: primaryDefault,
                  padding: `${tokens.spacing.normal.sm} ${tokens.spacing.normal.md}`,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: surfaceBase,
                  boxShadow: tokens.shadows.sm,
                }}
                className="focus:outline-none focus:ring-2 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </Form>
      )}

      {/* Invoices Table */}
      <div style={{
        overflow: 'hidden',
        borderRadius: tokens.borderRadius.lg,
        border: `1px solid ${borderDefault}`,
        backgroundColor: surfaceBase,
        boxShadow: tokens.shadows.sm,
      }}>
        <table className="min-w-full" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead style={{ backgroundColor: surfaceElevated }}>
            <tr style={{ borderBottom: `1px solid ${borderDefault}` }}>
              <th style={{
                padding: `${tokens.spacing.normal.md} ${tokens.spacing.normal.lg}`,
                textAlign: 'left',
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: textMuted,
              }}>
                Invoice #
              </th>
              <th style={{
                padding: `${tokens.spacing.normal.md} ${tokens.spacing.normal.lg}`,
                textAlign: 'left',
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: textMuted,
              }}>
                Client
              </th>
              <th style={{
                padding: `${tokens.spacing.normal.md} ${tokens.spacing.normal.lg}`,
                textAlign: 'left',
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: textMuted,
              }}>
                Matter
              </th>
              <th style={{
                padding: `${tokens.spacing.normal.md} ${tokens.spacing.normal.lg}`,
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
                padding: `${tokens.spacing.normal.md} ${tokens.spacing.normal.lg}`,
                textAlign: 'left',
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: textMuted,
              }}>
                Due Date
              </th>
              <th style={{
                padding: `${tokens.spacing.normal.md} ${tokens.spacing.normal.lg}`,
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
                padding: `${tokens.spacing.normal.md} ${tokens.spacing.normal.lg}`,
                textAlign: 'left',
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: textMuted,
              }}>
                Balance Due
              </th>
              <th style={{
                padding: `${tokens.spacing.normal.md} ${tokens.spacing.normal.lg}`,
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
                padding: `${tokens.spacing.normal.md} ${tokens.spacing.normal.lg}`,
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
          <tbody style={{ backgroundColor: surfaceBase }}>
            {invoices.map((invoice) => (
              <tr key={invoice.id} style={{ borderBottom: `1px solid ${borderLight}` }}
                className="transition-colors"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = surfaceHover;
                }}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <td style={{
                  whiteSpace: 'nowrap',
                  padding: `${tokens.spacing.normal.md} ${tokens.spacing.normal.lg}`,
                }}>
                  <Link
                    to={`/billing/invoices/${invoice.id}`}
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.medium,
                      color: primaryDefault,
                    }}
                    className="transition-colors"
                  >
                    {invoice.invoiceNumber}
                  </Link>
                </td>
                <td style={{
                  whiteSpace: 'nowrap',
                  padding: `${tokens.spacing.normal.md} ${tokens.spacing.normal.lg}`,
                  fontSize: tokens.typography.fontSize.sm,
                  color: textPrimary,
                }}>
                  {invoice.clientName}
                </td>
                <td style={{
                  padding: `${tokens.spacing.normal.md} ${tokens.spacing.normal.lg}`,
                  fontSize: tokens.typography.fontSize.sm,
                  color: textSecondary,
                }}>
                  <div className="max-w-xs truncate" title={invoice.matterDescription}>
                    {invoice.matterDescription}
                  </div>
                </td>
                <td style={{
                  whiteSpace: 'nowrap',
                  padding: `${tokens.spacing.normal.md} ${tokens.spacing.normal.lg}`,
                  fontSize: tokens.typography.fontSize.sm,
                  color: textPrimary,
                }}>
                  {new Date(invoice.invoiceDate).toLocaleDateString()}
                </td>
                <td style={{
                  whiteSpace: 'nowrap',
                  padding: `${tokens.spacing.normal.md} ${tokens.spacing.normal.lg}`,
                  fontSize: tokens.typography.fontSize.sm,
                  color: textPrimary,
                }}>
                  {new Date(invoice.dueDate).toLocaleDateString()}
                </td>
                <td style={{
                  whiteSpace: 'nowrap',
                  padding: `${tokens.spacing.normal.md} ${tokens.spacing.normal.lg}`,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: textPrimary,
                }}>
                  ${invoice.totalAmount.toLocaleString()}
                </td>
                <td style={{
                  whiteSpace: 'nowrap',
                  padding: `${tokens.spacing.normal.md} ${tokens.spacing.normal.lg}`,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: textPrimary,
                }}>
                  ${invoice.balanceDue.toLocaleString()}
                </td>
                <td style={{
                  whiteSpace: 'nowrap',
                  padding: `${tokens.spacing.normal.md} ${tokens.spacing.normal.lg}`,
                }}>
                  {getStatusBadge(invoice.status)}
                </td>
                <td style={{
                  whiteSpace: 'nowrap',
                  padding: `${tokens.spacing.normal.md} ${tokens.spacing.normal.lg}`,
                  textAlign: 'right',
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                }}>
                  <div className="flex justify-end gap-2">
                    {invoice.status === 'Draft' && (
                      <Form method="post" className="inline">
                        <input type="hidden" name="id" value={invoice.id} />
                        <button
                          type="submit"
                          name="intent"
                          value="send"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            color: primaryDefault,
                          }}
                          className="transition-colors"
                        >
                          <Send className="h-4 w-4" />
                          Send
                        </button>
                      </Form>
                    )}
                    <Link
                      to={`/billing/invoices/${invoice.id}`}
                      style={{ color: primaryDefault }}
                      className="transition-colors"
                    >
                      View
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {invoices.length === 0 && (
          <div style={{
            padding: `${tokens.spacing.normal['3xl']} 0`,
            textAlign: 'center',
          }}>
            <FileText style={{
              margin: '0 auto',
              height: '3rem',
              width: '3rem',
              color: textMuted,
            }} />
            <h3 style={{
              marginTop: tokens.spacing.normal.sm,
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              color: textPrimary,
            }}>
              No invoices
            </h3>
            <p style={{
              marginTop: tokens.spacing.normal.xs,
              fontSize: tokens.typography.fontSize.sm,
              color: textMuted,
            }}>
              Get started by creating a new invoice.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
