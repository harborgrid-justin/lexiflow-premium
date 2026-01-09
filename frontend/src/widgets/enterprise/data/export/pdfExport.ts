/**
 * PDF Export
 * @module components/enterprise/data/export/pdfExport
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { ColumnDefinition } from '../DataGridColumn';
import type { PDFExportOptions } from './types';
import { getColumnValue, formatValueForExport } from './utils';

/** Exports data to PDF format */
export function exportToPDF<T extends Record<string, unknown>>(
  data: T[],
  columns: ColumnDefinition<T>[],
  filename: string = 'export.pdf',
  options: PDFExportOptions = {}
): void {
  const { orientation = 'landscape', title, subtitle, pageSize = 'a4', showPageNumbers = true, margins = { top: 20, bottom: 20, left: 15, right: 15 }, includeHeaders = true, visibleColumnsOnly = true } = options;

  const exportColumns = visibleColumnsOnly ? columns.filter(col => !col.hidden) : columns;
  const doc = new jsPDF({ orientation, unit: 'mm', format: pageSize });
  let currentY = margins.top || 20;

  if (title) {
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(title, doc.internal.pageSize.getWidth() / 2, currentY, { align: 'center' });
    currentY += 10;
  }

  if (subtitle) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, doc.internal.pageSize.getWidth() / 2, currentY, { align: 'center' });
    currentY += 10;
  }

  const headers = includeHeaders ? [exportColumns.map(col => col.header)] : [];
  const body = data.map(row => exportColumns.map(col => formatValueForExport(getColumnValue(row, col))));

  const columnStyles = exportColumns.reduce((acc, col, i) => {
    acc[i] = { halign: col.align === 'center' ? 'center' : col.align === 'right' || col.editorType === 'number' ? 'right' : 'left' };
    return acc;
  }, {} as Record<number, { halign: 'left' | 'center' | 'right' }>);

  doc.autoTable({
    head: headers,
    body,
    startY: currentY,
    margin: margins,
    theme: 'grid',
    headStyles: { fillColor: [68, 114, 196], textColor: 255, fontStyle: 'bold', halign: 'left' },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles,
    didDrawPage: () => {
      if (showPageNumbers) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(`Page ${doc.getCurrentPageInfo().pageNumber} of ${doc.getNumberOfPages()}`, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
      }
    },
  });

  doc.save(filename);
}
