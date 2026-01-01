/**
 * Export Utilities
 * @module components/enterprise/data/export/utils
 */

import type { ColumnDefinition } from '../DataGridColumn';

/** Escapes a value for CSV format */
export function escapeCSVValue(value: string, delimiter: string): string {
  if (value == null) return '';
  const stringValue = String(value);
  if (stringValue.includes(delimiter) || stringValue.includes('"') || stringValue.includes('\n') || stringValue.includes('\r')) {
    return '"' + stringValue.replace(/"/g, '""') + '"';
  }
  return stringValue;
}

/** Escapes a value for XML/HTML */
export function escapeXML(value: unknown): string {
  if (value == null) return '';
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

/** Gets CSS class for Excel cell based on data type */
export function getCellClass<T extends Record<string, unknown>>(column: ColumnDefinition<T>, value: unknown): string {
  if (column.editorType === 'number' || typeof value === 'number') return 'number';
  if (column.editorType === 'date' || value instanceof Date) return 'date';
  return '';
}

/** Gets the value from a row using the column definition */
export function getColumnValue<T extends Record<string, unknown>>(row: T, column: ColumnDefinition<T>): unknown {
  const accessorKey = column.accessorKey || column.id;
  if (accessorKey.includes('.')) {
    return accessorKey.split('.').reduce((obj: unknown, key) => {
      if (obj && typeof obj === 'object' && key in obj) return (obj as Record<string, unknown>)[key];
      return undefined;
    }, row as unknown);
  }
  return row[accessorKey];
}

/** Formats a value for export */
export function formatValueForExport(value: unknown): string {
  if (value == null) return '';
  if (value instanceof Date) return value.toLocaleDateString();
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

/** Downloads a blob as a file */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}
