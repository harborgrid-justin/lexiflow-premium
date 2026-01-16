/**
 * ExpenseForm Component
 * Form for creating/editing expenses with receipt upload
 */

import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/cn";
import type { FirmExpense } from '@/types/financial';
import { FileText, Upload, X } from 'lucide-react';
import React, { useState } from 'react';
import { Form } from 'react-router';

interface ExpenseFormProps {
  expense?: Partial<FirmExpense>;
  onCancel?: () => void;
  actionError?: string;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  expense,
  onCancel,
  actionError,
}) => {
  const { theme, tokens } = useTheme();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const EXPENSE_CATEGORIES = [
    'Filing Fees',
    'Court Reporter',
    'Expert Witness',
    'Travel',
    'Meals',
    'Lodging',
    'Courier',
    'Postage',
    'Photocopying',
    'Research',
    'Translation',
    'Other',
  ];

  const PAYMENT_METHODS = [
    'Firm Credit Card',
    'Personal Reimbursement',
    'Client Advance',
    'Check',
    'Wire Transfer',
    'Cash',
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };

  return (
    <div className="max-w-4xl">
      <Form method="post" encType="multipart/form-data" className="space-y-6">
        {/* Error Message */}
        {actionError && (
          <div className={cn('rounded-md p-4 border', theme.status.error.background, 'border-red-200')}>
            <p className={cn('text-sm', theme.status.error.text)}>{actionError}</p>
          </div>
        )}

        {/* Basic Information */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Case Selection */}
          <div>
            <label className="block text-sm font-medium" style={{ color: theme.text.primary }}>
              Case/Matter <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="caseId"
              defaultValue={expense?.id || ''}
              placeholder="Enter case ID"
              style={{ backgroundColor: theme.surface.input, borderColor: theme.border.default, color: theme.text.primary }}
              className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 transition-all"
            />
          </div>

          {/* User (hidden, would come from auth) */}
          <input type="hidden" name="userId" value="usr-admin-justin" />

          {/* Date */}
          <div>
            <label className="block text-sm font-medium" style={{ color: theme.text.primary }}>
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              required
              defaultValue={expense?.date || new Date().toISOString().split('T')[0]}
              max={new Date().toISOString().split('T')[0]}
              style={{ backgroundColor: theme.surface.input, borderColor: theme.border.default, color: theme.text.primary }}
              className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 transition-all"
            />
          </div>
        </div>

        {/* Category and Amount */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {/* Category */}
          <div className="sm:col-span-2">
            <label style={{
              display: 'block',
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              color: theme.text.secondary,
            }}>
              Category <span style={{ color: theme.status.error.text }}>*</span>
            </label>
            <select
              name="category"
              required
              defaultValue={expense?.category || ''}
              style={{
                marginTop: tokens.spacing.compact.xs,
                display: 'block',
                width: '100%',
                borderRadius: tokens.borderRadius.md,
                border: `1px solid ${theme.border.default}`,
                backgroundColor: theme.surface.input,
                padding: `${tokens.spacing.compact.sm} ${tokens.spacing.normal.md}`,
                boxShadow: tokens.shadows.sm,
                color: theme.text.primary,
              }}
              className="focus:outline-none focus:ring-2"
            >
              <option value="">Select category...</option>
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label style={{
              display: 'block',
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              color: theme.text.secondary,
            }}>
              Amount <span style={{ color: theme.status.error.text }}>*</span>
            </label>
            <div style={{ position: 'relative', marginTop: tokens.spacing.compact.xs }}>
              <div style={{
                pointerEvents: 'none',
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: '0',
                display: 'flex',
                alignItems: 'center',
                paddingLeft: tokens.spacing.normal.md,
              }}>
                <span style={{ color: theme.text.muted }}>$</span>
              </div>
              <input
                type="number"
                name="amount"
                required
                min="0"
                step="0.01"
                defaultValue={expense?.amount || ''}
                style={{
                  display: 'block',
                  width: '100%',
                  borderRadius: tokens.borderRadius.md,
                  border: `1px solid ${theme.border.default}`,
                  backgroundColor: theme.surface.input,
                  paddingLeft: '1.75rem',
                  paddingRight: tokens.spacing.normal.md,
                  paddingTop: tokens.spacing.compact.sm,
                  paddingBottom: tokens.spacing.compact.sm,
                  boxShadow: tokens.shadows.sm,
                  color: theme.text.primary,
                }}
                className="focus:outline-none focus:ring-2"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label style={{
            display: 'block',
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.medium,
            color: theme.text.secondary,
          }}>
            Description <span style={{ color: theme.status.error.text }}>*</span>
          </label>
          <textarea
            name="description"
            required
            rows={3}
            defaultValue={expense?.description || ''}
            placeholder="Detailed description of the expense..."
            style={{
              marginTop: tokens.spacing.compact.xs,
              display: 'block',
              width: '100%',
              borderRadius: tokens.borderRadius.md,
              border: `1px solid ${theme.border.default}`,
              backgroundColor: theme.surface.input,
              padding: `${tokens.spacing.compact.sm} ${tokens.spacing.normal.md}`,
              boxShadow: tokens.shadows.sm,
              color: theme.text.primary,
            }}
            className="focus:outline-none focus:ring-2"
          />
        </div>

        {/* Vendor and Payment Method */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Vendor */}
          <div>
            <label style={{
              display: 'block',
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              color: theme.text.secondary,
            }}>
              Vendor
            </label>
            <input
              type="text"
              name="vendor"
              defaultValue={expense?.vendor || ''}
              placeholder="Vendor or payee name"
              style={{
                marginTop: tokens.spacing.compact.xs,
                display: 'block',
                width: '100%',
                borderRadius: tokens.borderRadius.md,
                border: `1px solid ${theme.border.default}`,
                backgroundColor: theme.surface.input,
                padding: `${tokens.spacing.compact.sm} ${tokens.spacing.normal.md}`,
                boxShadow: tokens.shadows.sm,
                color: theme.text.primary,
              }}
              className="focus:outline-none focus:ring-2"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label style={{
              display: 'block',
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              color: theme.text.secondary,
            }}>
              Payment Method
            </label>
            <select
              name="paymentMethod"
              defaultValue={expense?.paymentMethod || ''}
              style={{
                marginTop: tokens.spacing.compact.xs,
                display: 'block',
                width: '100%',
                borderRadius: tokens.borderRadius.md,
                border: `1px solid ${theme.border.default}`,
                backgroundColor: theme.surface.input,
                padding: `${tokens.spacing.compact.sm} ${tokens.spacing.normal.md}`,
                boxShadow: tokens.shadows.sm,
                color: theme.text.primary,
              }}
              className="focus:outline-none focus:ring-2"
            >
              <option value="">Select method...</option>
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Receipt Upload */}
        <div>
          <label style={{
            display: 'block',
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.medium,
            color: theme.text.secondary,
          }}>
            Receipt
          </label>
          <div style={{ marginTop: tokens.spacing.compact.xs }}>
            {!selectedFile ? (
              <label style={{
                display: 'flex',
                cursor: 'pointer',
                justifyContent: 'center',
                borderRadius: tokens.borderRadius.md,
                border: `2px dashed ${theme.border.default}`,
                padding: `${tokens.spacing.normal['2xl']} ${tokens.spacing.normal['2xl']}`,
              }}
                className="transition-colors"
                onMouseEnter={(e) => e.currentTarget.style.borderColor = theme.border.light}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = theme.border.default}
              >
                <div style={{ textAlign: 'center' }}>
                  <Upload style={{
                    margin: '0 auto',
                    height: '3rem',
                    width: '3rem',
                    color: theme.text.muted,
                  }} />
                  <p style={{
                    marginTop: tokens.spacing.compact.sm,
                    fontSize: tokens.typography.fontSize.sm,
                    color: theme.text.secondary,
                  }}>
                    Click to upload receipt
                  </p>
                  <p style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: theme.text.muted,
                  }}>
                    PNG, JPG, PDF up to 10MB
                  </p>
                </div>
                <input
                  type="file"
                  name="receipt"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div style={{
                borderRadius: tokens.borderRadius.md,
                border: `1px solid ${theme.border.default}`,
                backgroundColor: theme.surface.muted,
                padding: tokens.spacing.normal.lg,
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.normal.md }}>
                    {filePreview ? (
                      <img
                        src={filePreview}
                        alt="Receipt preview"
                        style={{
                          height: '4rem',
                          width: '4rem',
                          borderRadius: tokens.borderRadius.md,
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <FileText style={{ height: '2rem', width: '2rem', color: theme.text.muted }} />
                    )}
                    <div>
                      <p style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.medium,
                        color: theme.text.primary,
                      }}>
                        {selectedFile?.name || 'Receipt'}
                      </p>
                      <p style={{ fontSize: tokens.typography.fontSize.xs, color: theme.text.muted }}>
                        {selectedFile?.size
                          ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                          : ''}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    style={{
                      borderRadius: tokens.borderRadius.full,
                      padding: tokens.spacing.compact.xs,
                      color: theme.text.muted,
                    }}
                    className="transition-colors"
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.surface.hover; e.currentTarget.style.color = theme.text.secondary; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = theme.text.muted; }}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Billable Checkbox */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <input
            type="checkbox"
            name="billable"
            id="billable"
            defaultChecked={true}
            value="true"
            style={{
              height: '1rem',
              width: '1rem',
              borderRadius: tokens.borderRadius.sm,
              border: `1px solid ${theme.border.default}`,
            }}
            className="focus:ring-2"
          />
          <label htmlFor="billable" style={{
            marginLeft: tokens.spacing.compact.sm,
            display: 'block',
            fontSize: tokens.typography.fontSize.sm,
            color: theme.text.primary,
          }}>
            Billable to client
          </label>
        </div>

        {/* Form Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: tokens.spacing.normal.md,
          borderTop: `1px solid ${theme.border.default}`,
          paddingTop: tokens.spacing.normal['2xl'],
        }}>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              style={{
                borderRadius: tokens.borderRadius.md,
                border: `1px solid ${theme.border.default}`,
                backgroundColor: theme.surface.base,
                padding: `${tokens.spacing.compact.sm} ${tokens.spacing.normal.lg}`,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: theme.text.secondary,
                boxShadow: tokens.shadows.sm,
              }}
              className="transition-colors focus:outline-none focus:ring-2"
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.surface.hover}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.surface.base}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            style={{
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
            {expense ? 'Update' : 'Create'} Expense
          </button>
        </div>
      </Form>
    </div>
  );
};
