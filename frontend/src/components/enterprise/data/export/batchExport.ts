/**
 * Batch Export
 * @module components/enterprise/data/export/batchExport
 */

import { exportToCSV } from './csvExport';
import { exportToExcel } from './excelExport';
import { exportToPDF } from './pdfExport';

import type { ColumnDefinition } from '../DataGridColumn';

/** Exports data in multiple formats */
export function exportToMultipleFormats<T extends Record<string, unknown>>(
  data: T[],
  columns: ColumnDefinition<T>[],
  formats: Array<'csv' | 'excel' | 'pdf'>,
  baseFilename: string = 'export'
): void {
  const timestamp = new Date().toISOString().split('T')[0];
  formats.forEach(format => {
    const filename = `${baseFilename}_${timestamp}`;
    switch (format) {
      case 'csv': exportToCSV(data, columns, `${filename}.csv`); break;
      case 'excel': exportToExcel(data, columns, `${filename}.xlsx`); break;
      case 'pdf': exportToPDF(data, columns, `${filename}.pdf`); break;
    }
  });
}

/** Exports selected rows only */
export function exportSelectedRows<T extends Record<string, unknown>>(
  data: T[],
  selectedRowIds: Set<string | number>,
  columns: ColumnDefinition<T>[],
  format: 'csv' | 'excel' | 'pdf',
  filename: string,
  rowIdKey: keyof T = 'id' as keyof T
): void {
  const selectedData = data.filter(row => selectedRowIds.has(row[rowIdKey] as string | number));
  switch (format) {
    case 'csv': exportToCSV(selectedData, columns, filename); break;
    case 'excel': exportToExcel(selectedData, columns, filename); break;
    case 'pdf': exportToPDF(selectedData, columns, filename); break;
  }
}
