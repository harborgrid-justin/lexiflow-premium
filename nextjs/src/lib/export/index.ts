/**
 * Export Module
 * @module lib/export
 *
 * Comprehensive report export functionality supporting PDF, Excel (XLSX), and CSV formats.
 * Provides pre-configured templates for billing, trust accounts, time entries, and more.
 *
 * @example
 * ```typescript
 * // Using the default export service
 * import { exportService, downloadBlob } from '@/lib/export';
 *
 * const result = await exportService.exportReport({
 *   format: 'pdf',
 *   reportType: 'billing',
 *   title: 'Monthly Billing Report',
 *   data: invoices,
 * });
 *
 * exportService.downloadFile(result);
 *
 * // Using quick export functions
 * import { quickExportToExcel, downloadBlob } from '@/lib/export';
 *
 * const result = await quickExportToExcel('Time Entries', columns, timeEntries);
 * downloadBlob(result.blob, result.filename);
 *
 * // Using individual generators directly
 * import { exportToCSV } from '@/lib/export';
 *
 * const result = await exportToCSV({
 *   title: 'Export',
 *   columns: [
 *     { header: 'Name', accessor: 'name' },
 *     { header: 'Amount', accessor: 'amount', dataType: 'currency' },
 *   ],
 *   data: items,
 * });
 * ```
 */

// Main export service and utilities
export {
  ExportService,
  exportService,
  downloadBlob,
  generateFilename,
  getMimeType,
  getFileExtension,
  isSupportedFormat,
  formatFileSize,
  quickExportToPDF,
  quickExportToExcel,
  quickExportToCSV,
} from './export-service';

// Individual generators
export { exportToPDF, validatePDFOptions, createPDFOptions, calculateColumnWidths } from './pdf-generator';
export { exportToExcel, validateExcelOptions, createExcelOptions } from './excel-generator';
export { exportToCSV, validateCSVOptions, createCSVOptions, parseCSV } from './csv-generator';

// Types
export {
  // Core types
  type ExportFormat,
  type ReportType,
  type ExportResult,
  type ExportProgress,
  type ExportProgressCallback,

  // Column types
  type ExportColumn,
  type ColumnAlignment,
  type ColumnDataType,

  // Option types
  type BaseExportOptions,
  type PDFExportOptions,
  type ExcelExportOptions,
  type CSVExportOptions,
  type AnyExportOptions,
  type FormatOptionsMap,
  type OptionsForFormat,

  // PDF-specific types
  type PageOrientation,
  type PageSize,
  type PDFStyling,
  type PDFMargins,
  type ReportSummary,
  type SummaryItem,

  // Excel-specific types
  type ExcelSheet,
  type ExcelStyling,

  // CSV-specific types
  type CSVDelimiter,
  type CSVLineEnding,
  type CSVEncoding,

  // Common types
  type DateRange,
  type FirmInfo,
  type ExportMetadata,
  type ExportServiceConfig,
  type ReportTemplate,

  // Report data types
  type BillingReportRow,
  type TrustReportRow,
  type TimeEntryReportRow,
  type TrustTransactionReportRow,
  type ExpenseReportRow,

  // Constants
  MIME_TYPES,
  FILE_EXTENSIONS,
  DEFAULT_EXPORT_CONFIG,

  // Type guards
  isExportFormat,
  isReportType,
} from './types';
