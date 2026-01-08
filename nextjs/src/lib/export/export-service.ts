/**
 * Export Service
 * @module lib/export/export-service
 *
 * Main export orchestration service that provides a unified API for
 * exporting data to PDF, Excel, and CSV formats. Includes pre-configured
 * report templates for billing, trust accounts, and time entries.
 */

import {
  type ExportFormat,
  type ReportType,
  type ExportResult,
  type ExportProgress,
  type ExportProgressCallback,
  type PDFExportOptions,
  type ExcelExportOptions,
  type CSVExportOptions,
  type ExportColumn,
  type ReportTemplate,
  type ExportServiceConfig,
  type BillingReportRow,
  type TrustReportRow,
  type TimeEntryReportRow,
  type TrustTransactionReportRow,
  type ExpenseReportRow,
  type DateRange,
  type FirmInfo,
  type OptionsForFormat,
  MIME_TYPES,
  FILE_EXTENSIONS,
  DEFAULT_EXPORT_CONFIG,
  isExportFormat,
} from './types';

import { exportToPDF, validatePDFOptions } from './pdf-generator';
import { exportToExcel, validateExcelOptions } from './excel-generator';
import { exportToCSV, validateCSVOptions } from './csv-generator';

// =============================================================================
// Report Templates
// =============================================================================

/**
 * Billing report column definitions
 */
const BILLING_REPORT_COLUMNS: readonly ExportColumn<BillingReportRow>[] = [
  { header: 'Invoice #', accessor: 'invoiceNumber', width: 80 },
  { header: 'Client', accessor: 'clientName', width: 150 },
  { header: 'Matter', accessor: 'matterDescription', width: 180 },
  { header: 'Invoice Date', accessor: 'invoiceDate', dataType: 'date', width: 90 },
  { header: 'Due Date', accessor: 'dueDate', dataType: 'date', width: 90 },
  { header: 'Time Charges', accessor: 'timeCharges', dataType: 'currency', width: 100, align: 'right', includeInTotals: true },
  { header: 'Expenses', accessor: 'expenseCharges', dataType: 'currency', width: 90, align: 'right', includeInTotals: true },
  { header: 'Total Amount', accessor: 'amount', dataType: 'currency', width: 100, align: 'right', includeInTotals: true },
  { header: 'Paid', accessor: 'paidAmount', dataType: 'currency', width: 90, align: 'right', includeInTotals: true },
  { header: 'Balance Due', accessor: 'balanceDue', dataType: 'currency', width: 100, align: 'right', includeInTotals: true },
  { header: 'Status', accessor: 'status', width: 80 },
];

/**
 * Trust account report column definitions
 */
const TRUST_REPORT_COLUMNS: readonly ExportColumn<TrustReportRow>[] = [
  { header: 'Account #', accessor: 'accountNumber', width: 100 },
  { header: 'Account Name', accessor: 'accountName', width: 180 },
  { header: 'Client', accessor: 'clientName', width: 150 },
  { header: 'Type', accessor: 'accountType', width: 100 },
  { header: 'Balance', accessor: 'balance', dataType: 'currency', width: 120, align: 'right', includeInTotals: true },
  { header: 'Last Reconciled', accessor: 'lastReconciled', dataType: 'date', width: 100 },
  { header: 'Jurisdiction', accessor: 'jurisdiction', width: 80 },
  { header: 'Status', accessor: 'status', width: 80 },
];

/**
 * Time entry report column definitions
 */
const TIME_ENTRY_REPORT_COLUMNS: readonly ExportColumn<TimeEntryReportRow>[] = [
  { header: 'Date', accessor: 'date', dataType: 'date', width: 80 },
  { header: 'Timekeeper', accessor: 'timekeeper', width: 120 },
  { header: 'Client', accessor: 'clientName', width: 130 },
  { header: 'Matter', accessor: 'matterDescription', width: 150 },
  { header: 'Activity', accessor: 'activity', width: 100 },
  { header: 'Description', accessor: 'description', width: 200 },
  { header: 'Hours', accessor: 'duration', dataType: 'number', width: 60, align: 'right', includeInTotals: true },
  { header: 'Rate', accessor: 'rate', dataType: 'currency', width: 80, align: 'right' },
  { header: 'Amount', accessor: 'total', dataType: 'currency', width: 90, align: 'right', includeInTotals: true },
  { header: 'Billable', accessor: 'billable', dataType: 'boolean', width: 60 },
  { header: 'Status', accessor: 'status', width: 80 },
];

/**
 * Trust transaction report column definitions
 */
const TRUST_TRANSACTION_COLUMNS: readonly ExportColumn<TrustTransactionReportRow>[] = [
  { header: 'Date', accessor: 'transactionDate', dataType: 'date', width: 80 },
  { header: 'Type', accessor: 'transactionType', width: 80 },
  { header: 'Client', accessor: 'clientName', width: 130 },
  { header: 'Description', accessor: 'description', width: 200 },
  { header: 'Check #', accessor: 'checkNumber', width: 70 },
  { header: 'Payee/Payor', accessor: (row) => row.payee || row.payor, width: 120 },
  { header: 'Amount', accessor: 'amount', dataType: 'currency', width: 100, align: 'right', includeInTotals: true },
  { header: 'Balance', accessor: 'balanceAfter', dataType: 'currency', width: 100, align: 'right' },
  { header: 'Status', accessor: 'status', width: 80 },
];

/**
 * Expense report column definitions
 */
const EXPENSE_REPORT_COLUMNS: readonly ExportColumn<ExpenseReportRow>[] = [
  { header: 'Date', accessor: 'date', dataType: 'date', width: 80 },
  { header: 'Category', accessor: 'category', width: 100 },
  { header: 'Description', accessor: 'description', width: 200 },
  { header: 'Vendor', accessor: 'vendor', width: 120 },
  { header: 'Client', accessor: 'clientName', width: 120 },
  { header: 'Matter', accessor: 'matterDescription', width: 150 },
  { header: 'Amount', accessor: 'amount', dataType: 'currency', width: 100, align: 'right', includeInTotals: true },
  { header: 'Billable', accessor: 'billable', dataType: 'boolean', width: 60 },
  { header: 'Status', accessor: 'status', width: 80 },
];

/**
 * Pre-configured report templates
 */
const REPORT_TEMPLATES: Record<ReportType, ReportTemplate<unknown>> = {
  billing: {
    id: 'billing-report',
    name: 'Billing Report',
    description: 'Invoice and billing summary report',
    reportType: 'billing',
    supportedFormats: ['pdf', 'excel', 'csv'],
    columns: BILLING_REPORT_COLUMNS as readonly ExportColumn<unknown>[],
    pdfDefaults: {
      orientation: 'landscape',
      includePageNumbers: true,
      includeSummary: true,
    },
    excelDefaults: {
      autoFilter: true,
      freezeHeader: true,
      includeTotals: true,
    },
  },
  trust: {
    id: 'trust-account-report',
    name: 'Trust Account Report',
    description: 'Client trust account balances and status',
    reportType: 'trust',
    supportedFormats: ['pdf', 'excel', 'csv'],
    columns: TRUST_REPORT_COLUMNS as readonly ExportColumn<unknown>[],
    pdfDefaults: {
      orientation: 'landscape',
      includePageNumbers: true,
    },
    excelDefaults: {
      autoFilter: true,
      freezeHeader: true,
      includeTotals: true,
    },
  },
  'time-entries': {
    id: 'time-entry-report',
    name: 'Time Entry Report',
    description: 'Detailed time entry records',
    reportType: 'time-entries',
    supportedFormats: ['pdf', 'excel', 'csv'],
    columns: TIME_ENTRY_REPORT_COLUMNS as readonly ExportColumn<unknown>[],
    pdfDefaults: {
      orientation: 'landscape',
      includePageNumbers: true,
      includeSummary: true,
    },
    excelDefaults: {
      autoFilter: true,
      freezeHeader: true,
      includeTotals: true,
    },
  },
  invoices: {
    id: 'invoice-report',
    name: 'Invoice Report',
    description: 'Invoice details and payment status',
    reportType: 'invoices',
    supportedFormats: ['pdf', 'excel', 'csv'],
    columns: BILLING_REPORT_COLUMNS as readonly ExportColumn<unknown>[],
    pdfDefaults: {
      orientation: 'landscape',
      includePageNumbers: true,
    },
    excelDefaults: {
      autoFilter: true,
      freezeHeader: true,
      includeTotals: true,
    },
  },
  expenses: {
    id: 'expense-report',
    name: 'Expense Report',
    description: 'Firm and client expense records',
    reportType: 'expenses',
    supportedFormats: ['pdf', 'excel', 'csv'],
    columns: EXPENSE_REPORT_COLUMNS as readonly ExportColumn<unknown>[],
    pdfDefaults: {
      orientation: 'landscape',
      includePageNumbers: true,
    },
    excelDefaults: {
      autoFilter: true,
      freezeHeader: true,
      includeTotals: true,
    },
  },
  clients: {
    id: 'client-report',
    name: 'Client Report',
    description: 'Client listing and details',
    reportType: 'clients',
    supportedFormats: ['pdf', 'excel', 'csv'],
    columns: [],
    pdfDefaults: {
      orientation: 'portrait',
      includePageNumbers: true,
    },
  },
  reconciliation: {
    id: 'reconciliation-report',
    name: 'Trust Reconciliation Report',
    description: 'Three-way trust account reconciliation',
    reportType: 'reconciliation',
    supportedFormats: ['pdf', 'excel', 'csv'],
    columns: TRUST_TRANSACTION_COLUMNS as readonly ExportColumn<unknown>[],
    pdfDefaults: {
      orientation: 'landscape',
      includePageNumbers: true,
      includeSummary: true,
    },
  },
  compliance: {
    id: 'compliance-report',
    name: 'Compliance Audit Report',
    description: 'Trust account compliance status',
    reportType: 'compliance',
    supportedFormats: ['pdf'],
    columns: [],
    pdfDefaults: {
      orientation: 'portrait',
      includePageNumbers: true,
      includeCoverPage: true,
    },
  },
  custom: {
    id: 'custom-report',
    name: 'Custom Report',
    description: 'User-defined report format',
    reportType: 'custom',
    supportedFormats: ['pdf', 'excel', 'csv'],
    columns: [],
  },
};

// =============================================================================
// Export Service Class
// =============================================================================

/**
 * Export service for generating reports in various formats
 *
 * @example
 * ```typescript
 * const exportService = new ExportService({
 *   defaultFirmInfo: {
 *     name: 'Smith & Associates LLP',
 *     address: '123 Main St, City, ST 12345',
 *   },
 * });
 *
 * // Export billing report
 * const result = await exportService.exportReport({
 *   format: 'pdf',
 *   reportType: 'billing',
 *   title: 'Monthly Billing Report',
 *   data: invoices,
 * });
 *
 * // Download the file
 * exportService.downloadFile(result);
 * ```
 */
export class ExportService {
  private config: ExportServiceConfig;

  constructor(config: Partial<ExportServiceConfig> = {}) {
    this.config = {
      ...DEFAULT_EXPORT_CONFIG,
      ...config,
    };
  }

  /**
   * Export data to the specified format
   *
   * @param options - Export options
   * @param onProgress - Optional progress callback
   * @returns Promise resolving to ExportResult
   */
  async export<T>(
    format: ExportFormat,
    options: PDFExportOptions<T> | ExcelExportOptions<T> | CSVExportOptions<T>,
    onProgress?: ExportProgressCallback
  ): Promise<ExportResult> {
    // Apply firm info if not provided
    const mergedOptions = {
      ...options,
      firmInfo: options.firmInfo ?? this.config.defaultFirmInfo,
    };

    switch (format) {
      case 'pdf':
        return exportToPDF(mergedOptions as PDFExportOptions<T>, onProgress);
      case 'excel':
        return exportToExcel(mergedOptions as ExcelExportOptions<T>, onProgress);
      case 'csv':
        return exportToCSV(mergedOptions as CSVExportOptions<T>, onProgress);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Export using a pre-configured report template
   *
   * @param options - Report export options
   * @param onProgress - Optional progress callback
   * @returns Promise resolving to ExportResult
   */
  async exportReport<T>(
    options: {
      format: ExportFormat;
      reportType: ReportType;
      title: string;
      subtitle?: string;
      data: readonly T[];
      columns?: readonly ExportColumn<T>[];
      dateRange?: DateRange;
      additionalOptions?: Partial<PDFExportOptions<T> | ExcelExportOptions<T> | CSVExportOptions<T>>;
    },
    onProgress?: ExportProgressCallback
  ): Promise<ExportResult> {
    const template = REPORT_TEMPLATES[options.reportType];

    if (!template) {
      throw new Error(`Unknown report type: ${options.reportType}`);
    }

    if (!template.supportedFormats.includes(options.format)) {
      throw new Error(
        `Format ${options.format} is not supported for ${options.reportType} reports`
      );
    }

    // Build export options from template
    const columns = options.columns ?? (template.columns as readonly ExportColumn<T>[]);

    const baseOptions = {
      title: options.title,
      subtitle: options.subtitle,
      columns,
      data: options.data,
      reportType: options.reportType,
      dateRange: options.dateRange,
      firmInfo: this.config.defaultFirmInfo,
      includeTimestamp: true,
    };

    // Merge with format-specific defaults from template
    let exportOptions: PDFExportOptions<T> | ExcelExportOptions<T> | CSVExportOptions<T>;

    switch (options.format) {
      case 'pdf':
        exportOptions = {
          ...baseOptions,
          ...template.pdfDefaults,
          ...options.additionalOptions,
        } as PDFExportOptions<T>;
        break;
      case 'excel':
        exportOptions = {
          ...baseOptions,
          ...template.excelDefaults,
          ...options.additionalOptions,
        } as ExcelExportOptions<T>;
        break;
      case 'csv':
        exportOptions = {
          ...baseOptions,
          ...template.csvDefaults,
          ...options.additionalOptions,
        } as CSVExportOptions<T>;
        break;
    }

    return this.export(options.format, exportOptions, onProgress);
  }

  /**
   * Export to PDF
   */
  async exportToPDF<T>(
    options: PDFExportOptions<T>,
    onProgress?: ExportProgressCallback
  ): Promise<ExportResult> {
    return this.export('pdf', options, onProgress);
  }

  /**
   * Export to Excel
   */
  async exportToExcel<T>(
    options: ExcelExportOptions<T>,
    onProgress?: ExportProgressCallback
  ): Promise<ExportResult> {
    return this.export('excel', options, onProgress);
  }

  /**
   * Export to CSV
   */
  async exportToCSV<T>(
    options: CSVExportOptions<T>,
    onProgress?: ExportProgressCallback
  ): Promise<ExportResult> {
    return this.export('csv', options, onProgress);
  }

  /**
   * Download the exported file
   * Triggers a browser download for the generated file
   *
   * @param result - The export result containing the blob and filename
   */
  downloadFile(result: ExportResult): void {
    downloadBlob(result.blob, result.filename);
  }

  /**
   * Get available report templates
   */
  getReportTemplates(): Record<ReportType, ReportTemplate<unknown>> {
    return REPORT_TEMPLATES;
  }

  /**
   * Get template for specific report type
   */
  getTemplate(reportType: ReportType): ReportTemplate<unknown> | undefined {
    return REPORT_TEMPLATES[reportType];
  }

  /**
   * Validate export options for a specific format
   */
  validateOptions<T>(
    format: ExportFormat,
    options: Partial<PDFExportOptions<T> | ExcelExportOptions<T> | CSVExportOptions<T>>
  ): { valid: boolean; errors: string[] } {
    switch (format) {
      case 'pdf':
        return validatePDFOptions(options as Partial<PDFExportOptions<T>>);
      case 'excel':
        return validateExcelOptions(options as Partial<ExcelExportOptions<T>>);
      case 'csv':
        return validateCSVOptions(options as Partial<CSVExportOptions<T>>);
      default:
        return { valid: false, errors: [`Unknown format: ${format}`] };
    }
  }

  /**
   * Update service configuration
   */
  updateConfig(config: Partial<ExportServiceConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };
  }

  /**
   * Get current configuration
   */
  getConfig(): ExportServiceConfig {
    return { ...this.config };
  }
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Trigger browser download for a blob
 *
 * @param blob - The blob to download
 * @param filename - The filename for the download
 */
export function downloadBlob(blob: Blob, filename: string): void {
  // Create object URL
  const url = URL.createObjectURL(blob);

  // Create temporary anchor element
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;

  // Append to body, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Revoke the object URL to free memory
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Generate filename with date and format extension
 *
 * @param baseName - Base filename
 * @param format - Export format
 * @param options - Optional filename options
 * @returns Generated filename with extension
 */
export function generateFilename(
  baseName: string,
  format: ExportFormat,
  options: { includeDate?: boolean; dateFormat?: 'short' | 'long' } = {}
): string {
  const { includeDate = true, dateFormat = 'short' } = options;

  // Sanitize base name
  let sanitizedName = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  // Add date suffix
  if (includeDate) {
    const now = new Date();
    let dateSuffix: string;

    if (dateFormat === 'long') {
      dateSuffix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    } else {
      dateSuffix = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    }

    sanitizedName = `${sanitizedName}-${dateSuffix}`;
  }

  return `${sanitizedName}${FILE_EXTENSIONS[format]}`;
}

/**
 * Get MIME type for export format
 */
export function getMimeType(format: ExportFormat): string {
  return MIME_TYPES[format];
}

/**
 * Get file extension for export format
 */
export function getFileExtension(format: ExportFormat): string {
  return FILE_EXTENSIONS[format];
}

/**
 * Check if a format is supported
 */
export function isSupportedFormat(format: unknown): format is ExportFormat {
  return isExportFormat(format);
}

/**
 * Format file size for display
 *
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, exponent);

  return `${value.toFixed(exponent === 0 ? 0 : 2)} ${units[exponent]}`;
}

// =============================================================================
// Quick Export Functions
// =============================================================================

/**
 * Quick export to PDF with minimal configuration
 */
export async function quickExportToPDF<T>(
  title: string,
  columns: readonly ExportColumn<T>[],
  data: readonly T[],
  options?: Partial<PDFExportOptions<T>>
): Promise<ExportResult> {
  return exportToPDF({
    title,
    columns,
    data,
    includeTimestamp: true,
    includePageNumbers: true,
    ...options,
  });
}

/**
 * Quick export to Excel with minimal configuration
 */
export async function quickExportToExcel<T>(
  title: string,
  columns: readonly ExportColumn<T>[],
  data: readonly T[],
  options?: Partial<ExcelExportOptions<T>>
): Promise<ExportResult> {
  return exportToExcel({
    title,
    columns,
    data,
    autoFilter: true,
    freezeHeader: true,
    ...options,
  });
}

/**
 * Quick export to CSV with minimal configuration
 */
export async function quickExportToCSV<T>(
  title: string,
  columns: readonly ExportColumn<T>[],
  data: readonly T[],
  options?: Partial<CSVExportOptions<T>>
): Promise<ExportResult> {
  return exportToCSV({
    title,
    columns,
    data,
    includeBOM: true,
    includeHeaders: true,
    ...options,
  });
}

// =============================================================================
// Default Export Service Instance
// =============================================================================

/**
 * Default export service instance
 * Can be used directly without instantiation
 */
export const exportService = new ExportService();

// =============================================================================
// Re-exports
// =============================================================================

// Re-export generators for direct use
export { exportToPDF, validatePDFOptions, createPDFOptions } from './pdf-generator';
export { exportToExcel, validateExcelOptions, createExcelOptions } from './excel-generator';
export { exportToCSV, validateCSVOptions, createCSVOptions, parseCSV } from './csv-generator';

// Re-export types
export * from './types';
