/**
 * CSV Export
 * @module components/enterprise/data/export/csvExport
 */

import { escapeCSVValue, getColumnValue, formatValueForExport, downloadBlob } from './utils';

import type { ColumnDefinition } from '../DataGridColumn';
import type { CSVExportOptions } from './types';

/** Exports data to CSV format */
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: ColumnDefinition<T>[],
  filename: string = 'export.csv',
  options: CSVExportOptions = {}
): void {
  const { delimiter = ',', includeHeaders = true, encoding = 'utf-8', includeByteOrderMark = true, visibleColumnsOnly = true } = options;

  const exportColumns = visibleColumnsOnly ? columns.filter(col => !col.hidden) : columns;
  const rows: string[] = [];

  if (includeHeaders) {
    rows.push(exportColumns.map(col => escapeCSVValue(col.header, delimiter)).join(delimiter));
  }

  data.forEach(row => {
    rows.push(exportColumns.map(col => escapeCSVValue(formatValueForExport(getColumnValue(row, col)), delimiter)).join(delimiter));
  });

  const csvContent = rows.join('\n');
  const blob = includeByteOrderMark && encoding === 'utf-8'
    ? new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    : new Blob([csvContent], { type: 'text/csv;charset=' + encoding + ';' });

  downloadBlob(blob, filename);
}
