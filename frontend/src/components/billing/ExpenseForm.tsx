/**
 * ExpenseForm Component
 * Form for creating/editing expenses with receipt upload
 */

import React, { useState } from 'react';
import type { FirmExpense } from '@/types/financial';
import { FileText, Upload, X } from 'lucide-react';
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
          <div className="rounded-md bg-red-50 p-4 border border-red-200">
            <p className="text-sm text-red-800">{actionError}</p>
          </div>
        )}

        {/* Basic Information */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Case Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Case/Matter <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="caseId"
              defaultValue={expense?.id || ''}
              placeholder="Enter case ID"
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>

          {/* User (hidden, would come from auth) */}
          <input type="hidden" name="userId" value="usr-admin-justin" />

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              required
              defaultValue={expense?.date || new Date().toISOString().split('T')[0]}
              max={new Date().toISOString().split('T')[0]}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
        </div>

        {/* Category and Amount */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {/* Category */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              required
              defaultValue={expense?.category || ''}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Amount <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-gray-500 dark:text-gray-400">$</span>
              </div>
              <input
                type="number"
                name="amount"
                required
                min="0"
                step="0.01"
                defaultValue={expense?.amount || ''}
                className="block w-full rounded-md border border-gray-300 bg-white pl-7 pr-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            required
            rows={3}
            defaultValue={expense?.description || ''}
            placeholder="Detailed description of the expense..."
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          />
        </div>

        {/* Vendor and Payment Method */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Vendor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Vendor
            </label>
            <input
              type="text"
              name="vendor"
              defaultValue={expense?.vendor || ''}
              placeholder="Vendor or payee name"
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Payment Method
            </label>
            <select
              name="paymentMethod"
              defaultValue={expense?.paymentMethod || ''}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Receipt
          </label>
          <div className="mt-1">
            {!selectedFile ? (
              <label className="flex cursor-pointer justify-center rounded-md border-2 border-dashed border-gray-300 px-6 py-10 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Click to upload receipt
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
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
              <div className="rounded-md border border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {filePreview ? (
                      <img
                        src={filePreview}
                        alt="Receipt preview"
                        className="h-16 w-16 rounded object-cover"
                      />
                    ) : (
                      <FileText className="h-8 w-8 text-gray-400" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {selectedFile?.name || 'Receipt'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {selectedFile?.size
                          ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                          : selectedFile?.size
                            ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                            : ''}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Billable Checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="billable"
            id="billable"
            defaultChecked={true}
            value="true"
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="billable" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
            Billable to client
          </label>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {expense ? 'Update' : 'Create'} Expense
          </button>
        </div>
      </Form>
    </div>
  );
};
