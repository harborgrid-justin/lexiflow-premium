/**
 * @module components/billing/LEDESExport
 * @category Billing
 * @description LEDES format export interface for electronic billing compliance
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useState, memo } from 'react';
import { FileText, Download, CheckCircle, AlertCircle, Info, Upload } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
import { useTheme } from '@/contexts/theme/ThemeContext';
import { cn } from '@/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface LEDESExportProps {
  invoiceIds?: string[];
  onExport?: (format: string, invoiceIds: string[]) => void;
  className?: string;
}

interface ExportOptions {
  format: 'LEDES1998B' | 'LEDES98BI';
  includeTimeEntries: boolean;
  includeExpenses: boolean;
  validateBeforeExport: boolean;
  generateChecksum: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

const LEDESExportComponent: React.FC<LEDESExportProps> = ({
  invoiceIds = [],
  onExport,
  className
}) => {
  const { theme } = useTheme();

  const [selectedInvoices, setSelectedInvoices] = useState<string[]>(invoiceIds);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'LEDES1998B',
    includeTimeEntries: true,
    includeExpenses: true,
    validateBeforeExport: true,
    generateChecksum: false
  });
  const [validationResults, setValidationResults] = useState<any>(null);

  // Mock invoice list
  const availableInvoices = [
    { id: '1', number: 'INV-202601-0001', client: 'Acme Corp', date: '2026-01-08', amount: 4284.23, status: 'sent' },
    { id: '2', number: 'INV-202601-0002', client: 'TechStart Inc', date: '2026-01-07', amount: 3567.50, status: 'sent' },
    { id: '3', number: 'INV-202601-0003', client: 'Global Industries', date: '2026-01-06', amount: 5128.00, status: 'sent' }
  ];

  const handleExport = async () => {
    if (selectedInvoices.length === 0) {
      alert('Please select at least one invoice to export');
      return;
    }

    if (exportOptions.validateBeforeExport) {
      // Simulate validation
      setValidationResults({
        valid: true,
        errors: [],
        warnings: ['Invoice INV-202601-0001: Missing UTBMS task code for 2 line items']
      });

      // In a real implementation, wait for user confirmation
      setTimeout(() => {
        onExport?.(exportOptions.format, selectedInvoices);
      }, 1000);
    } else {
      onExport?.(exportOptions.format, selectedInvoices);
    }
  };

  const toggleInvoiceSelection = (invoiceId: string) => {
    setSelectedInvoices(prev =>
      prev.includes(invoiceId)
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className={cn(
        "rounded-lg shadow-sm border p-4",
        theme.surface.default,
        theme.border.default
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className={cn("h-6 w-6", theme.primary.text)} />
            <div>
              <h2 className={cn("text-xl font-bold", theme.text.primary)}>LEDES Export</h2>
              <p className={cn("text-sm", theme.text.secondary)}>
                Export invoices in LEDES format for electronic billing
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className={cn(
        "rounded-lg border p-4",
        "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
      )}>
        <div className="flex gap-3">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-blue-900 dark:text-blue-100 mb-1">
              About LEDES Format
            </h3>
            <p className="text-xs text-blue-800 dark:text-blue-200">
              LEDES (Legal Electronic Data Exchange Standard) is the industry-standard format for
              submitting electronic legal bills to corporate legal departments and e-billing vendors.
              This export generates pipe-delimited files compliant with LEDES 1998B specifications.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Export Options */}
        <div className="lg:col-span-2 space-y-4">
          {/* Format Selection */}
          <div className={cn(
            "rounded-lg shadow-sm border p-4",
            theme.surface.default,
            theme.border.default
          )}>
            <h3 className={cn("font-bold mb-4", theme.text.primary)}>Export Options</h3>

            <div className="space-y-4">
              <div>
                <label className={cn("block text-sm font-medium mb-2", theme.text.secondary)}>
                  LEDES Format
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="format"
                      value="LEDES1998B"
                      checked={exportOptions.format === 'LEDES1998B'}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as any }))}
                      className="rounded-full"
                    />
                    <span className={cn("text-sm", theme.text.primary)}>LEDES 1998B</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="format"
                      value="LEDES98BI"
                      checked={exportOptions.format === 'LEDES98BI'}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as any }))}
                      className="rounded-full"
                    />
                    <span className={cn("text-sm", theme.text.primary)}>LEDES 98BI</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeTimeEntries}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeTimeEntries: e.target.checked }))}
                    className="rounded"
                  />
                  <span className={cn("text-sm", theme.text.primary)}>Include time entries</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeExpenses}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeExpenses: e.target.checked }))}
                    className="rounded"
                  />
                  <span className={cn("text-sm", theme.text.primary)}>Include expenses</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={exportOptions.validateBeforeExport}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, validateBeforeExport: e.target.checked }))}
                    className="rounded"
                  />
                  <span className={cn("text-sm", theme.text.primary)}>Validate before export</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={exportOptions.generateChecksum}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, generateChecksum: e.target.checked }))}
                    className="rounded"
                  />
                  <span className={cn("text-sm", theme.text.primary)}>Generate checksum file</span>
                </label>
              </div>
            </div>
          </div>

          {/* Invoice Selection */}
          <div className={cn(
            "rounded-lg shadow-sm border",
            theme.surface.default,
            theme.border.default
          )}>
            <div className={cn("p-4 border-b", theme.border.default)}>
              <h3 className={cn("font-bold", theme.text.primary)}>Select Invoices</h3>
              <p className={cn("text-sm mt-1", theme.text.secondary)}>
                {selectedInvoices.length} of {availableInvoices.length} selected
              </p>
            </div>
            <div className="divide-y dark:divide-slate-700">
              {availableInvoices.map(invoice => (
                <div
                  key={invoice.id}
                  className={cn(
                    "p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer",
                    selectedInvoices.includes(invoice.id) && "bg-blue-50 dark:bg-blue-900/20"
                  )}
                  onClick={() => toggleInvoiceSelection(invoice.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedInvoices.includes(invoice.id)}
                    onChange={() => toggleInvoiceSelection(invoice.id)}
                    className="rounded"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={cn("font-medium", theme.text.primary)}>{invoice.number}</span>
                      <span className={cn("text-xs px-2 py-0.5 rounded", "bg-emerald-100 text-emerald-700")}>
                        {invoice.status}
                      </span>
                    </div>
                    <p className={cn("text-sm", theme.text.secondary)}>{invoice.client}</p>
                    <p className={cn("text-xs", theme.text.tertiary)}>
                      {new Date(invoice.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={cn("text-right font-medium", theme.text.primary)}>
                    ${invoice.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Validation Results */}
          {validationResults && (
            <div className={cn(
              "rounded-lg border p-4",
              validationResults.valid
                ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
                : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
            )}>
              <div className="flex gap-3">
                {validationResults.valid ? (
                  <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <h3 className={cn(
                    "text-sm font-bold mb-2",
                    validationResults.valid ? "text-emerald-900 dark:text-emerald-100" : "text-red-900 dark:text-red-100"
                  )}>
                    Validation {validationResults.valid ? 'Passed' : 'Failed'}
                  </h3>

                  {validationResults.errors.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs font-medium text-red-800 dark:text-red-200 mb-1">Errors:</p>
                      <ul className="text-xs text-red-700 dark:text-red-300 list-disc list-inside">
                        {validationResults.errors.map((error: string, index: number) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {validationResults.warnings.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-amber-800 dark:text-amber-200 mb-1">Warnings:</p>
                      <ul className="text-xs text-amber-700 dark:text-amber-300 list-disc list-inside">
                        {validationResults.warnings.map((warning: string, index: number) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Export Summary */}
        <div className="space-y-4">
          <div className={cn(
            "rounded-lg shadow-sm border p-4 sticky top-4",
            theme.surface.default,
            theme.border.default
          )}>
            <h3 className={cn("font-bold mb-4", theme.text.primary)}>Export Summary</h3>

            <div className="space-y-3">
              <div>
                <p className={cn("text-xs", theme.text.secondary)}>Format</p>
                <p className={cn("font-medium", theme.text.primary)}>{exportOptions.format}</p>
              </div>

              <div>
                <p className={cn("text-xs", theme.text.secondary)}>Invoices Selected</p>
                <p className={cn("font-medium", theme.text.primary)}>{selectedInvoices.length}</p>
              </div>

              <div>
                <p className={cn("text-xs", theme.text.secondary)}>Include</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {exportOptions.includeTimeEntries && (
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700">Time Entries</span>
                  )}
                  {exportOptions.includeExpenses && (
                    <span className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-700">Expenses</span>
                  )}
                </div>
              </div>

              <div className={cn("pt-4 border-t", theme.border.default)}>
                <button
                  onClick={handleExport}
                  disabled={selectedInvoices.length === 0}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors",
                    selectedInvoices.length > 0
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
                  )}
                >
                  <Download className="h-4 w-4" />
                  Export LEDES File
                </button>
              </div>

              <p className={cn("text-xs", theme.text.tertiary)}>
                The exported file will be in pipe-delimited format (.txt) ready for submission to
                e-billing vendors.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const LEDESExport = memo(LEDESExportComponent);
LEDESExport.displayName = 'LEDESExport';
