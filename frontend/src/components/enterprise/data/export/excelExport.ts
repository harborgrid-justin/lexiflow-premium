/**
 * Excel Export
 * @module components/enterprise/data/export/excelExport
 */

import { escapeXML, getCellClass, getColumnValue, formatValueForExport, downloadBlob } from './utils';

import type { ColumnDefinition } from '../DataGridColumn';
import type { ExcelExportOptions } from './types';

/** Exports data to Excel format (XLSX) */
export function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  columns: ColumnDefinition<T>[],
  filename: string = 'export.xlsx',
  options: ExcelExportOptions = {}
): void {
  const { sheetName = 'Sheet1', includeHeaders = true, visibleColumnsOnly = true, title } = options;
  const exportColumns = visibleColumnsOnly ? columns.filter(col => !col.hidden) : columns;

  let html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
  html += '<head><meta charset="UTF-8">';
  html += '<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>';
  html += '<x:Name>' + escapeXML(sheetName) + '</x:Name>';
  html += '<x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->';
  html += '<style>table { border-collapse: collapse; width: 100%; } th { background-color: #4472C4; color: white; font-weight: bold; padding: 8px; border: 1px solid #ddd; text-align: left; } td { padding: 8px; border: 1px solid #ddd; } tr:nth-child(even) { background-color: #f2f2f2; } .number { text-align: right; mso-number-format:"#,##0.00"; } .date { mso-number-format:"mm/dd/yyyy"; }</style>';
  html += '</head><body>';

  if (title) html += '<h1>' + escapeXML(title) + '</h1>';
  html += '<table>';

  if (includeHeaders) {
    html += '<thead><tr>' + exportColumns.map(col => '<th>' + escapeXML(col.header) + '</th>').join('') + '</tr></thead>';
  }

  html += '<tbody>' + data.map(row =>
    '<tr>' + exportColumns.map(col => {
      const value = getColumnValue(row, col);
      return '<td class="' + getCellClass(col, value) + '">' + escapeXML(formatValueForExport(value)) + '</td>';
    }).join('') + '</tr>'
  ).join('') + '</tbody></table></body></html>';

  downloadBlob(new Blob([html], { type: 'application/vnd.ms-excel' }), filename);
}
