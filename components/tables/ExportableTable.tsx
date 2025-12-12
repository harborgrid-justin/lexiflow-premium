import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, FileSpreadsheet, FileJson, Printer } from 'lucide-react';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  exportable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  exportRender?: (value: any, row: T) => string;
  width?: string;
}

export interface ExportableTableProps<T> {
  data: T[];
  columns: Column<T>[];
  title?: string;
  filename?: string;
  exportFormats?: Array<'csv' | 'json' | 'excel' | 'pdf'>;
  className?: string;
}

export function ExportableTable<T extends Record<string, any>>({
  data,
  columns,
  title,
  filename = 'export',
  exportFormats = ['csv', 'json', 'excel'],
  className = '',
}: ExportableTableProps<T>) {
  const [showExportMenu, setShowExportMenu] = useState(false);

  const exportableColumns = columns.filter((col) => col.exportable !== false);

  const exportToCSV = () => {
    const headers = exportableColumns.map((col) => col.header);
    const rows = data.map((row) =>
      exportableColumns.map((col) => {
        const value = row[col.key as keyof T];
        const exportValue = col.exportRender
          ? col.exportRender(value, row)
          : String(value || '');
        // Escape quotes and wrap in quotes if contains comma or newline
        return exportValue.includes(',') || exportValue.includes('\n')
          ? `"${exportValue.replace(/"/g, '""')}"`
          : exportValue;
      })
    );

    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    downloadFile(csv, `${filename}.csv`, 'text/csv');
  };

  const exportToJSON = () => {
    const exportData = data.map((row) => {
      const exportRow: Record<string, any> = {};
      exportableColumns.forEach((col) => {
        const value = row[col.key as keyof T];
        exportRow[col.key as string] = col.exportRender
          ? col.exportRender(value, row)
          : value;
      });
      return exportRow;
    });

    const json = JSON.stringify(exportData, null, 2);
    downloadFile(json, `${filename}.json`, 'application/json');
  };

  const exportToExcel = () => {
    // Simple Excel-compatible HTML format
    const headers = exportableColumns.map((col) => `<th>${col.header}</th>`).join('');
    const rows = data
      .map(
        (row) =>
          `<tr>${exportableColumns
            .map((col) => {
              const value = row[col.key as keyof T];
              const exportValue = col.exportRender
                ? col.exportRender(value, row)
                : String(value || '');
              return `<td>${exportValue}</td>`;
            })
            .join('')}</tr>`
      )
      .join('');

    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
        <head>
          <meta charset="utf-8">
          <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
          </style>
        </head>
        <body>
          <table>
            <thead><tr>${headers}</tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>
    `;

    downloadFile(html, `${filename}.xls`, 'application/vnd.ms-excel');
  };

  const exportToPDF = () => {
    // Basic HTML print for PDF
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const headers = exportableColumns.map((col) => `<th>${col.header}</th>`).join('');
    const rows = data
      .map(
        (row) =>
          `<tr>${exportableColumns
            .map((col) => {
              const value = row[col.key as keyof T];
              const exportValue = col.exportRender
                ? col.exportRender(value, row)
                : String(value || '');
              return `<td>${exportValue}</td>`;
            })
            .join('')}</tr>`
      )
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title || 'Table Export'}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
            table { border-collapse: collapse; width: 100%; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #4a5568; color: white; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9fafb; }
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          ${title ? `<h1>${title}</h1>` : ''}
          <table>
            <thead><tr>${headers}</tr></thead>
            <tbody>${rows}</tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const exportHandlers = {
    csv: {
      label: 'Export as CSV',
      icon: FileText,
      handler: exportToCSV,
    },
    json: {
      label: 'Export as JSON',
      icon: FileJson,
      handler: exportToJSON,
    },
    excel: {
      label: 'Export to Excel',
      icon: FileSpreadsheet,
      handler: exportToExcel,
    },
    pdf: {
      label: 'Export to PDF',
      icon: Printer,
      handler: exportToPDF,
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
      role="region"
      aria-label={title || 'Exportable Table'}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          )}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>

            {/* Export Menu */}
            {showExportMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
              >
                {exportFormats.map((format) => {
                  const config = exportHandlers[format];
                  const Icon = config.icon;

                  return (
                    <button
                      key={format}
                      onClick={config.handler}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Icon className="w-4 h-4" />
                      {config.label}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full" role="table">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider ${
                    column.width || ''
                  }`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((row, rowIndex) => (
              <motion.tr
                key={rowIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: rowIndex * 0.02 }}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-6 py-4 text-sm text-gray-900 dark:text-white"
                  >
                    {column.render
                      ? column.render(row[column.key as keyof T], row)
                      : String(row[column.key as keyof T] || '')}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>

        {data.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No data available</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {data.length} row{data.length !== 1 ? 's' : ''} available for export
        </p>
      </div>

      {/* Backdrop */}
      {showExportMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowExportMenu(false)}
        />
      )}
    </motion.div>
  );
}

export default ExportableTable;
