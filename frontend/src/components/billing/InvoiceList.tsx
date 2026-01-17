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

  const getStatusBadge = (status: string) => {
    const styles = {
      Draft: { bg: theme.surface.muted, text: theme.text.secondary },
      Sent: { bg: tokens.colors.blue400 + '20', text: tokens.colors.blue600 },
      Paid: { bg: theme.status.success.bg, text: theme.status.success.text },
      Overdue: { bg: theme.status.error.bg, text: theme.status.error.text },
      Cancelled: { bg: theme.surface.muted, text: theme.text.secondary },
      'Partially Paid': { bg: theme.status.warning.bg, text: theme.status.warning.text },
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
            border: `1px solid ${theme.border.default}`,
            backgroundColor: theme.surface.base,
            padding: `${tokens.spacing.normal.sm} ${tokens.spacing.normal.md}`,
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.medium,
            color: theme.text.primary,
            boxShadow: tokens.shadows.sm,
          }}
          className="transition-colors"
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.surface.hover}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.surface.base}
        >
          <Filter className="h-4 w-4" />
          Filters
        </button>
      </div>

      {showFilters && (
        <Form method="get" style={{
          borderRadius: tokens.borderRadius.lg,
          border: `1px solid ${theme.border.default}`,
          backgroundColor: theme.surface.elevated,
          padding: tokens.spacing.normal.md,
        }}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <label style={{
                display: 'block',
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: theme.text.primary,
              }}>
                Case
              </label>
              <select
                name="caseId"
                defaultValue={(filters?.caseId as string) || ''}
                style={{
                  marginTop: tokens.spacing.normal.xs,
                  width: '100%',
                  borderRadius: tokens.borderRadius.md,
                  border: `1px solid ${theme.border.default}`,
                  backgroundColor: theme.surface.input,
                  padding: `${tokens.spacing.normal.sm} ${tokens.spacing.normal.md}`,
                  fontSize: tokens.typography.fontSize.sm,
                  color: theme.text.primary,
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
                color: theme.text.primary,
              }}>
                Client
              </label>
              <input
                type="text"
                name="clientId"
                defaultValue={(filters?.clientId as string) || ''}
                placeholder="Client ID or name"
                style={{
                  marginTop: tokens.spacing.normal.xs,
                  width: '100%',
                  borderRadius: tokens.borderRadius.md,
                  border: `1px solid ${theme.border.default}`,
                  backgroundColor: theme.surface.input,
                  padding: `${tokens.spacing.normal.sm} ${tokens.spacing.normal.md}`,
                  fontSize: tokens.typography.fontSize.sm,
                  color: theme.text.primary,
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
                color: theme.text.primary,
              }}>
                Status
              </label>
              <select
                name="status"
                defaultValue={(filters?.status as string) || ''}
                style={{
                  marginTop: tokens.spacing.normal.xs,
                  width: '100%',
                  borderRadius: tokens.borderRadius.md,
                  border: `1px solid ${theme.border.default}`,
                  backgroundColor: theme.surface.input,
                  padding: `${tokens.spacing.normal.sm} ${tokens.spacing.normal.md}`,
                  fontSize: tokens.typography.fontSize.sm,
                  color: theme.text.primary,
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
                  backgroundColor: theme.primary.DEFAULT,
                  padding: `${tokens.spacing.normal.sm} ${tokens.spacing.normal.md}`,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: theme.surface.base,
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
        border: `1px solid ${theme.border.default}`,
        backgroundColor: theme.surface.base,
        boxShadow: tokens.shadows.sm,
      }}>
        <table className="min-w-full" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead style={{ backgroundColor: theme.surface.elevated }}>
            <tr style={{ borderBottom: `1px solid ${theme.border.default}` }}>
              <th style={{
                padding: `${tokens.spacing.normal.md} ${tokens.spacing.normal.lg}`,
                textAlign: 'left',
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: theme.text.muted,
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
                color: theme.text.muted,
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
                color: theme.text.muted,
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
                color: theme.text.muted,
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
                color: theme.text.muted,
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
                color: theme.text.muted,
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
                color: theme.text.muted,
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
          <tbody style={{ backgroundColor: theme.surface.base }}>
            {invoices.map((invoice) => (
              <tr key={invoice.id} style={{ borderBottom: `1px solid ${theme.border.light}` }}
                className="transition-colors"
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.surface.hover}
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
                      color: theme.primary.DEFAULT,
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
                  color: theme.text.primary,
                }}>
                  {invoice.clientName}
                </td>
                <td style={{
                  padding: `${tokens.spacing.normal.md} ${tokens.spacing.normal.lg}`,
                  fontSize: tokens.typography.fontSize.sm,
                  color: theme.text.secondary,
                }}>
                  <div className="max-w-xs truncate" title={invoice.matterDescription}>
                    {invoice.matterDescription}
                  </div>
                </td>
                <td style={{
                  whiteSpace: 'nowrap',
                  padding: `${tokens.spacing.normal.md} ${tokens.spacing.normal.lg}`,
                  fontSize: tokens.typography.fontSize.sm,
                  color: theme.text.primary,
                }}>
                  {new Date(invoice.invoiceDate).toLocaleDateString()}
                </td>
                <td style={{
                  whiteSpace: 'nowrap',
                  padding: `${tokens.spacing.normal.md} ${tokens.spacing.normal.lg}`,
                  fontSize: tokens.typography.fontSize.sm,
                  color: theme.text.primary,
                }}>
                  {new Date(invoice.dueDate).toLocaleDateString()}
                </td>
                <td style={{
                  whiteSpace: 'nowrap',
                  padding: `${tokens.spacing.normal.md} ${tokens.spacing.normal.lg}`,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: theme.text.primary,
                }}>
                  ${invoice.totalAmount.toLocaleString()}
                </td>
                <td style={{
                  whiteSpace: 'nowrap',
                  padding: `${tokens.spacing.normal.md} ${tokens.spacing.normal.lg}`,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: theme.text.primary,
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
                            color: theme.primary.DEFAULT,
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
                      style={{ color: theme.primary.DEFAULT }}
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
              color: theme.text.muted,
            }} />
            <h3 style={{
              marginTop: tokens.spacing.normal.sm,
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              color: theme.text.primary,
            }}>
              No invoices
            </h3>
            <p style={{
              marginTop: tokens.spacing.normal.xs,
              fontSize: tokens.typography.fontSize.sm,
              color: theme.text.muted,
            }}>
              Get started by creating a new invoice.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
