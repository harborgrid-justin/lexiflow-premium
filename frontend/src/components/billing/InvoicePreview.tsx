/**
 * InvoicePreview Component
 * PDF-like preview of invoice with professional formatting
 */

import { useTheme } from '@/theme';
import type { Invoice } from '@/types/financial';
import React from 'react';

interface InvoicePreviewProps {
  invoice: Invoice;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice }) => {
  const { theme, tokens } = useTheme();

  return (
    <div style={{
      borderRadius: tokens.borderRadius.lg,
      border: `1px solid ${theme.border.default}`,
      backgroundColor: theme.surface.base,
      padding: tokens.spacing.normal['2xl'],
      boxShadow: tokens.shadows.sm,
    }}>
      {/* Invoice Header */}
      <div style={{
        borderBottom: `1px solid ${theme.border.default}`,
        paddingBottom: tokens.spacing.normal['2xl'],
      }} className="flex items-start justify-between">
        <div>
          <h2 style={{
            fontSize: tokens.typography.fontSize['3xl'],
            fontWeight: tokens.typography.fontWeight.bold,
            color: theme.text.primary,
          }}>INVOICE</h2>
          <p style={{
            marginTop: tokens.spacing.normal.sm,
            fontSize: tokens.typography.fontSize.sm,
            color: theme.text.secondary,
          }}>
            Invoice #: {invoice.invoiceNumber}
          </p>
          <p style={{ fontSize: tokens.typography.fontSize.sm, color: theme.text.secondary }}>
            Date: {new Date(invoice.invoiceDate).toLocaleDateString()}
          </p>
          <p style={{ fontSize: tokens.typography.fontSize.sm, color: theme.text.secondary }}>
            Due Date: {new Date(invoice.dueDate).toLocaleDateString()}
          </p>
        </div>

        <div className="text-right">
          <h3 style={{
            fontSize: tokens.typography.fontSize.xl,
            fontWeight: tokens.typography.fontWeight.bold,
            color: theme.text.primary,
          }}>LexiFlow Law Firm</h3>
          <p style={{
            marginTop: tokens.spacing.normal.sm,
            fontSize: tokens.typography.fontSize.sm,
            color: theme.text.secondary,
          }}>
            123 Legal Avenue, Suite 400
          </p>
          <p style={{ fontSize: tokens.typography.fontSize.sm, color: theme.text.secondary }}>
            San Francisco, CA 94102
          </p>
          <p style={{ fontSize: tokens.typography.fontSize.sm, color: theme.text.secondary }}>
            (415) 555-0123
          </p>
          <p style={{ fontSize: tokens.typography.fontSize.sm, color: theme.text.secondary }}>
            billing@lexiflow.com
          </p>
        </div>
      </div>

      {/* Bill To Section */}
      <div style={{ marginTop: tokens.spacing.normal['2xl'] }}>
        <h3 style={{
          fontSize: tokens.typography.fontSize.sm,
          fontWeight: tokens.typography.fontWeight.semibold,
          textTransform: 'uppercase',
          color: theme.text.muted,
        }}>
          Bill To
        </h3>
        <div style={{ marginTop: tokens.spacing.normal.sm }}>
          <p style={{
            fontWeight: tokens.typography.fontWeight.medium,
            color: theme.text.primary,
          }}>{invoice.clientName}</p>
          {invoice.billingAddress && (
            <>
              <p style={{ fontSize: tokens.typography.fontSize.sm, color: theme.text.secondary }}>{invoice.billingAddress}</p>
            </>
          )}
        </div>
      </div>

      {/* Matter Information */}
      <div style={{ marginTop: tokens.spacing.normal.lg }}>
        <h3 style={{
          fontSize: tokens.typography.fontSize.sm,
          fontWeight: tokens.typography.fontWeight.semibold,
          textTransform: 'uppercase',
          color: theme.text.muted,
        }}>
          Matter
        </h3>
        <p style={{ marginTop: tokens.spacing.normal.xs, color: theme.text.primary }}>{invoice.matterDescription}</p>
        <p style={{ fontSize: tokens.typography.fontSize.sm, color: theme.text.secondary }}>
          Billing Model: {invoice.billingModel}
        </p>
        {invoice.periodStart && invoice.periodEnd && (
          <p style={{ fontSize: tokens.typography.fontSize.sm, color: theme.text.secondary }}>
            Period: {new Date(invoice.periodStart).toLocaleDateString()} - {new Date(invoice.periodEnd).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Line Items Table */}
      <div style={{ marginTop: tokens.spacing.normal['2xl'] }}>
        <table className="min-w-full">
          <thead>
            <tr style={{ borderBottom: `2px solid ${theme.border.default}` }}>
              <th style={{
                paddingBottom: tokens.spacing.normal.sm,
                textAlign: 'left',
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.semibold,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: theme.text.muted,
              }}>
                Description
              </th>
              <th style={{
                paddingBottom: tokens.spacing.normal.sm,
                textAlign: 'right',
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.semibold,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: theme.text.muted,
              }}>
                Quantity
              </th>
              <th style={{
                paddingBottom: tokens.spacing.normal.sm,
                textAlign: 'right',
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.semibold,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: theme.text.muted,
              }}>
                Rate
              </th>
              <th style={{
                paddingBottom: tokens.spacing.normal.sm,
                textAlign: 'right',
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.semibold,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: theme.text.muted,
              }}>
                Amount
              </th>
            </tr>
          </thead>
          <tbody style={{ borderTop: `1px solid ${theme.border.light}` }} className="divide-y">
            {/* Time Charges */}
            {invoice.timeCharges > 0 && (
              <tr style={{ borderBottom: `1px solid ${theme.border.light}` }}>
                <td style={{
                  paddingTop: tokens.spacing.normal.md,
                  paddingBottom: tokens.spacing.normal.md,
                  fontSize: tokens.typography.fontSize.sm,
                  color: theme.text.primary,
                }}>
                  Professional Services (Time)
                </td>
                <td style={{
                  paddingTop: tokens.spacing.normal.md,
                  paddingBottom: tokens.spacing.normal.md,
                  textAlign: 'right',
                  fontSize: tokens.typography.fontSize.sm,
                  color: theme.text.primary,
                }}>
                  -
                </td>
                <td style={{
                  paddingTop: tokens.spacing.normal.md,
                  paddingBottom: tokens.spacing.normal.md,
                  textAlign: 'right',
                  fontSize: tokens.typography.fontSize.sm,
                  color: theme.text.primary,
                }}>
                  -
                </td>
                <td style={{
                  paddingTop: tokens.spacing.normal.md,
                  paddingBottom: tokens.spacing.normal.md,
                  textAlign: 'right',
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: theme.text.primary,
                }}>
                  ${invoice.timeCharges.toLocaleString()}
                </td>
              </tr>
            )}

            {/* Expense Charges */}
            {invoice.expenseCharges > 0 && (
              <tr style={{ borderBottom: `1px solid ${theme.border.light}` }}>
                <td style={{
                  paddingTop: tokens.spacing.normal.md,
                  paddingBottom: tokens.spacing.normal.md,
                  fontSize: tokens.typography.fontSize.sm,
                  color: theme.text.primary,
                }}>
                  Expenses and Disbursements
                </td>
                <td style={{
                  paddingTop: tokens.spacing.normal.md,
                  paddingBottom: tokens.spacing.normal.md,
                  textAlign: 'right',
                  fontSize: tokens.typography.fontSize.sm,
                  color: theme.text.primary,
                }}>
                  -
                </td>
                <td style={{
                  paddingTop: tokens.spacing.normal.md,
                  paddingBottom: tokens.spacing.normal.md,
                  textAlign: 'right',
                  fontSize: tokens.typography.fontSize.sm,
                  color: theme.text.primary,
                }}>
                  -
                </td>
                <td style={{
                  paddingTop: tokens.spacing.normal.md,
                  paddingBottom: tokens.spacing.normal.md,
                  textAlign: 'right',
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: theme.text.primary,
                }}>
                  ${invoice.expenseCharges.toLocaleString()}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Totals Section */}
      <div style={{ marginTop: tokens.spacing.normal['2xl'] }} className="flex justify-end">
        <div className="w-64">
          <div style={{
            borderTop: `1px solid ${theme.border.default}`,
            paddingTop: tokens.spacing.normal.sm,
            paddingBottom: tokens.spacing.normal.sm,
          }} className="flex justify-between">
            <span style={{ fontSize: tokens.typography.fontSize.sm, color: theme.text.secondary }}>Subtotal:</span>
            <span style={{
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              color: theme.text.primary,
            }}>
              ${invoice.subtotal.toLocaleString()}
            </span>
          </div>

          {invoice.taxAmount > 0 && (
            <div style={{
              borderTop: `1px solid ${theme.border.default}`,
              paddingTop: tokens.spacing.normal.sm,
              paddingBottom: tokens.spacing.normal.sm,
            }} className="flex justify-between">
              <span style={{ fontSize: tokens.typography.fontSize.sm, color: theme.text.secondary }}>
                Tax ({invoice.taxRate}%):
              </span>
              <span style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: theme.text.primary,
              }}>
                ${invoice.taxAmount.toLocaleString()}
              </span>
            </div>
          )}

          {invoice.discountAmount > 0 && (
            <div style={{
              borderTop: `1px solid ${theme.border.default}`,
              paddingTop: tokens.spacing.normal.sm,
              paddingBottom: tokens.spacing.normal.sm,
            }} className="flex justify-between">
              <span style={{ fontSize: tokens.typography.fontSize.sm, color: theme.text.secondary }}>Discount:</span>
              <span style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: theme.status.error.text,
              }}>
                -${invoice.discountAmount.toLocaleString()}
              </span>
            </div>
          )}

          <div style={{
            borderTop: `2px solid ${theme.border.default}`,
            paddingTop: tokens.spacing.normal.sm,
            paddingBottom: tokens.spacing.normal.sm,
          }} className="flex justify-between">
            <span style={{
              fontSize: tokens.typography.fontSize.base,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: theme.text.primary,
            }}>
              Total:
            </span>
            <span style={{
              fontSize: tokens.typography.fontSize.base,
              fontWeight: tokens.typography.fontWeight.bold,
              color: theme.text.primary,
            }}>
              ${invoice.totalAmount.toLocaleString()}
            </span>
          </div>

          {invoice.paidAmount > 0 && (
            <>
              <div style={{
                borderTop: `1px solid ${theme.border.default}`,
                paddingTop: tokens.spacing.normal.sm,
                paddingBottom: tokens.spacing.normal.sm,
              }} className="flex justify-between">
                <span style={{ fontSize: tokens.typography.fontSize.sm, color: theme.text.secondary }}>Paid:</span>
                <span style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: theme.status.success.text,
                }}>
                  -${invoice.paidAmount.toLocaleString()}
                </span>
              </div>
              <div style={{
                borderTop: `2px solid ${theme.border.default}`,
                paddingTop: tokens.spacing.normal.sm,
                paddingBottom: tokens.spacing.normal.sm,
              }} className="flex justify-between">
                <span style={{
                  fontSize: tokens.typography.fontSize.base,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: theme.text.primary,
                }}>
                  Balance Due:
                </span>
                <span style={{
                  fontSize: tokens.typography.fontSize.base,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: theme.status.error.text,
                }}>
                  ${invoice.balanceDue.toLocaleString()}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Notes and Terms */}
      {(invoice.notes || invoice.terms) && (
        <div style={{
          marginTop: tokens.spacing.normal['3xl'],
          borderTop: `1px solid ${theme.border.default}`,
          paddingTop: tokens.spacing.normal['2xl'],
        }} className="space-y-4">
          {invoice.notes && (
            <div>
              <h3 style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                textTransform: 'uppercase',
                color: theme.text.muted,
              }}>
                Notes
              </h3>
              <p style={{
                marginTop: tokens.spacing.normal.xs,
                fontSize: tokens.typography.fontSize.sm,
                color: theme.text.secondary,
              }}>{invoice.notes}</p>
            </div>
          )}

          {invoice.terms && (
            <div>
              <h3 style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                textTransform: 'uppercase',
                color: theme.text.muted,
              }}>
                Terms
              </h3>
              <p style={{
                marginTop: tokens.spacing.normal.xs,
                fontSize: tokens.typography.fontSize.sm,
                color: theme.text.secondary,
              }}>{invoice.terms}</p>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{
        marginTop: tokens.spacing.normal['3xl'],
        borderTop: `1px solid ${theme.border.default}`,
        paddingTop: tokens.spacing.normal['2xl'],
        textAlign: 'center',
      }}>
        <p style={{ fontSize: tokens.typography.fontSize.xs, color: theme.text.muted }}>
          Thank you for your business. Please remit payment within {invoice.terms || '30 days'}.
        </p>
        <p style={{
          marginTop: tokens.spacing.normal.xs,
          fontSize: tokens.typography.fontSize.xs,
          color: theme.text.muted,
        }}>
          For questions about this invoice, please contact billing@lexiflow.com
        </p>
      </div>
    </div>
  );
};
