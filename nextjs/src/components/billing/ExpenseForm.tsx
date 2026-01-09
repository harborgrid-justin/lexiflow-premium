/**
 * ExpenseForm Component
 * Form for creating/editing expenses with receipt upload
 */

'use client';

import React, { useState } from 'react';
import { Form } from 'react-router';
import { Upload, X, FileText } from 'lucide-react';

import { Button } from '@/components/ui/shadcn/button';
import { Input } from '@/components/ui/shadcn/input';
import { Label } from '@/components/ui/shadcn/label';
import { Textarea } from '@/components/ui/shadcn/textarea';
import { Checkbox } from '@/components/ui/shadcn/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/shadcn/select';
import { Card, CardContent } from '@/components/ui/shadcn/card';

interface ExpenseFormProps {
  expense?: any;
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
    <Card className="max-w-4xl border-none shadow-none">
      <CardContent className="p-0">
        <Form method="post" encType="multipart/form-data" className="space-y-6">
          {/* Error Message */}
          {actionError && (
            <div className="rounded-md bg-destructive/15 p-4 border border-destructive/20">
              <p className="text-sm text-destructive">{actionError}</p>
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Case Selection */}
            <div className="space-y-2">
              <Label htmlFor="caseId">
                Case/Matter <span className="text-destructive">*</span>
              </Label>
              <Select name="caseId" required defaultValue={expense?.caseId || ''}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a case..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="C-2024-001">Martinez v. TechCorp</SelectItem>
                  <SelectItem value="C-2024-112">OmniGlobal Merger</SelectItem>
                  <SelectItem value="C-2023-892">StartUp Inc - Series A</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* User (hidden, would come from auth) */}
            <input type="hidden" name="userId" value="usr-admin-justin" />

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">
                Date <span className="text-destructive">*</span>
              </Label>
              <Input
                type="date"
                name="date"
                id="date"
                required
                defaultValue={expense?.date || new Date().toISOString().split('T')[0]}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Category and Amount */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {/* Category */}
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="category">
                Category <span className="text-destructive">*</span>
              </Label>
              <Select name="category" required defaultValue={expense?.category || ''}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category..." />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">
                Amount <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-muted-foreground">$</span>
                </div>
                <Input
                  type="number"
                  name="amount"
                  id="amount"
                  required
                  min="0"
                  step="0.01"
                  defaultValue={expense?.amount || ''}
                  className="pl-7"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              name="description"
              id="description"
              required
              rows={3}
              defaultValue={expense?.description || ''}
              placeholder="Detailed description of the expense..."
            />
          </div>

          {/* Vendor and Payment Method */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Vendor */}
            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor</Label>
              <Input
                type="text"
                name="vendor"
                id="vendor"
                defaultValue={expense?.vendor || ''}
                placeholder="Vendor or payee name"
              />
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select name="paymentMethod" defaultValue={expense?.paymentMethod || ''}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method..." />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Receipt Upload */}
          <div className="space-y-2">
            <Label>Receipt</Label>
            <div className="mt-1">
              {!selectedFile && !expense?.receipt ? (
                <label className="flex cursor-pointer justify-center rounded-md border-2 border-dashed border-muted-foreground/25 px-6 py-10 hover:border-muted-foreground/50 transition-colors">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Click to upload receipt
                    </p>
                    <p className="text-xs text-muted-foreground/75">
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
                <div className="rounded-md border border-border bg-muted/50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {filePreview ? (
                        <img
                          src={filePreview}
                          alt="Receipt preview"
                          className="h-16 w-16 rounded object-cover"
                        />
                      ) : (
                        <FileText className="h-8 w-8 text-muted-foreground" />
                      )}
                      <div>
                        <p className="text-sm font-medium">
                          {selectedFile?.name || expense?.receipt?.filename || 'Receipt'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {selectedFile?.size
                            ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                            : expense?.receipt?.size
                              ? `${(expense.receipt.size / 1024).toFixed(1)} KB`
                              : ''}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={removeFile}
                      className="rounded-full"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Billable Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              name="billable"
              id="billable"
              defaultChecked={expense?.billable ?? true}
              value="true"
            />
            <Label htmlFor="billable" className="font-normal cursor-pointer">
              Billable to client
            </Label>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
            >
              {expense ? 'Update' : 'Create'} Expense
            </Button>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
};
