/**
 * Export Types
 * @module components/enterprise/data/export/types
 */

export interface ExportOptions {
  filename?: string;
  includeHeaders?: boolean;
  selectedRowsOnly?: boolean;
  visibleColumnsOnly?: boolean;
}

export interface CSVExportOptions extends ExportOptions {
  delimiter?: string;
  encoding?: 'utf-8' | 'utf-16le' | 'iso-8859-1';
  includeByteOrderMark?: boolean;
}

export interface ExcelExportOptions extends ExportOptions {
  sheetName?: string;
  author?: string;
  title?: string;
  subject?: string;
}

export interface PDFExportOptions extends ExportOptions {
  orientation?: 'portrait' | 'landscape';
  title?: string;
  subtitle?: string;
  pageSize?: 'a4' | 'letter' | 'legal';
  showPageNumbers?: boolean;
  margins?: { top?: number; bottom?: number; left?: number; right?: number };
}

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: unknown) => jsPDF;
    lastAutoTable?: { finalY: number };
  }
}
