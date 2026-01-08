'use client';

/**
 * New Production Set Modal Component
 * Form for creating a new production set
 */

import { useState, useTransition } from 'react';
import { Button, Input, Card, CardBody } from '@/components/ui';
import { X, FileText, Settings, Hash, FolderPlus } from 'lucide-react';
import { createProductionSet } from '../../../_actions';
import type { CreateProductionSetInput, ProductionFormatValue } from '../../../_types';

interface NewProductionModalProps {
  discoveryRequestId: string;
  onClose: () => void;
  onCreated: () => void;
}

const formatOptions: { value: ProductionFormatValue; label: string; description: string }[] = [
  { value: 'native', label: 'Native', description: 'Original file formats' },
  { value: 'pdf', label: 'PDF', description: 'Converted to PDF format' },
  { value: 'tiff', label: 'TIFF', description: 'Single-page TIFF images' },
  { value: 'pdf_searchable', label: 'Searchable PDF', description: 'PDF with OCR text layer' },
];

export function NewProductionModal({
  discoveryRequestId,
  onClose,
  onCreated,
}: NewProductionModalProps) {
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<Partial<CreateProductionSetInput>>({
    name: '',
    batesPrefix: 'PROD',
    batesStart: 1,
    format: 'pdf',
    includeNative: true,
    includeText: true,
    redactConfidential: false,
  });

  const handleChange = (field: keyof CreateProductionSetInput, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Production name is required';
    }
    if (!formData.batesPrefix?.trim()) {
      newErrors.batesPrefix = 'Bates prefix is required';
    }
    if (!formData.batesStart || formData.batesStart < 1) {
      newErrors.batesStart = 'Starting number must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    startTransition(async () => {
      const result = await createProductionSet({
        ...formData,
        discoveryRequestId,
      } as CreateProductionSetInput);

      if (result.success) {
        onCreated();
        onClose();
      } else {
        setErrors({ submit: result.error || 'Failed to create production set' });
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="max-w-lg w-full mx-4">
        <CardBody>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Create Production Set
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <X className="h-5 w-5 text-slate-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Production Name *
              </label>
              <Input
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., First Production to Defendant"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name}</p>
              )}
            </div>

            {/* Bates Numbering */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                <Hash className="h-4 w-4 inline mr-1" />
                Bates Numbering
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Prefix
                  </label>
                  <Input
                    value={formData.batesPrefix || ''}
                    onChange={(e) => handleChange('batesPrefix', e.target.value.toUpperCase())}
                    placeholder="PROD"
                    className={errors.batesPrefix ? 'border-red-500' : ''}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Starting Number
                  </label>
                  <Input
                    type="number"
                    min={1}
                    value={formData.batesStart || 1}
                    onChange={(e) => handleChange('batesStart', parseInt(e.target.value, 10))}
                    className={errors.batesStart ? 'border-red-500' : ''}
                  />
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Preview: {formData.batesPrefix || 'PROD'}{(formData.batesStart || 1).toString().padStart(6, '0')}
              </p>
              {errors.batesPrefix && (
                <p className="text-sm text-red-600 mt-1">{errors.batesPrefix}</p>
              )}
              {errors.batesStart && (
                <p className="text-sm text-red-600 mt-1">{errors.batesStart}</p>
              )}
            </div>

            {/* Format */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                <FileText className="h-4 w-4 inline mr-1" />
                Production Format
              </label>
              <div className="grid grid-cols-2 gap-2">
                {formatOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleChange('format', option.value)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      formData.format === option.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <p className="font-medium text-slate-900 dark:text-white text-sm">
                      {option.label}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {option.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Options */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                <Settings className="h-4 w-4 inline mr-1" />
                Options
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.includeNative || false}
                    onChange={(e) => handleChange('includeNative', e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    Include native files
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.includeText || false}
                    onChange={(e) => handleChange('includeText', e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    Include extracted text files
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.redactConfidential || false}
                    onChange={(e) => handleChange('redactConfidential', e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    Apply confidential redactions
                  </span>
                </label>
              </div>
            </div>

            {/* Error */}
            {errors.submit && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onClose}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isPending}
                icon={<FolderPlus className="h-4 w-4" />}
              >
                {isPending ? 'Creating...' : 'Create Production'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
