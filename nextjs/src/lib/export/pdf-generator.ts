/**
 * PDF Generator
 * @module lib/export/pdf-generator
 *
 * Generates PDF documents with tables, headers, footers, and styling.
 * Uses a pure JavaScript implementation to create valid PDF 1.4 files
 * without external dependencies.
 */

import {
  type ColumnDataType,
  type ExportColumn,
  type ExportProgressCallback,
  type ExportResult,
  type PDFExportOptions,
  type PDFMargins,
  type PDFStyling,
  type PageSize,
  type ReportSummary,
  DEFAULT_EXPORT_CONFIG,
  FILE_EXTENSIONS,
  MIME_TYPES,
} from "./types";

// =============================================================================
// Constants
// =============================================================================

/** Page dimensions in points (1 point = 1/72 inch) */
const PAGE_SIZES: Record<PageSize, { width: number; height: number }> = {
  A4: { width: 595.28, height: 841.89 },
  Letter: { width: 612, height: 792 },
  Legal: { width: 612, height: 1008 },
  A3: { width: 841.89, height: 1190.55 },
};

/** Default margins in points */
const DEFAULT_MARGINS: PDFMargins = {
  top: 72, // 1 inch
  right: 72,
  bottom: 72,
  left: 72,
};

/** Standard fonts available in PDF */
type PDFFont = "Helvetica" | "Helvetica-Bold" | "Times-Roman" | "Courier";

// =============================================================================
// PDF Object Builder
// =============================================================================

/**
 * PDF document builder class
 * Constructs PDF objects and manages object references
 */
class PDFBuilder {
  private objects: Map<number, string> = new Map();
  private objectId = 0;
  private pageIds: number[] = [];
  private fontIds: Map<PDFFont, number> = new Map();
  private currentContent: string[] = [];

  /**
   * Add a new PDF object
   */
  addObject(content: string): number {
    const id = ++this.objectId;
    this.objects.set(id, content);
    return id;
  }

  /**
   * Get next object ID without adding
   */
  getNextId(): number {
    return this.objectId + 1;
  }

  /**
   * Add page reference
   */
  addPage(id: number): void {
    this.pageIds.push(id);
  }

  /**
   * Get all page IDs
   */
  getPageIds(): number[] {
    return this.pageIds;
  }

  /**
   * Register font
   */
  registerFont(font: PDFFont, id: number): void {
    this.fontIds.set(font, id);
  }

  /**
   * Get font reference
   */
  getFontRef(font: PDFFont): string {
    const id = this.fontIds.get(font);
    return id ? `${id} 0 R` : "2 0 R";
  }

  /**
   * Build final PDF document
   */
  build(): Uint8Array {
    const encoder = new TextEncoder();
    const chunks: Uint8Array[] = [];
    const offsets: number[] = [];
    let position = 0;

    // PDF Header
    const header = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
    chunks.push(encoder.encode(header));
    position += header.length;

    // Write objects
    for (const [id, content] of Array.from(this.objects.entries())) {
      offsets[id] = position;
      const objContent = `${id} 0 obj\n${content}\nendobj\n`;
      chunks.push(encoder.encode(objContent));
      position += objContent.length;
    }

    // Cross-reference table
    const xrefOffset = position;
    let xref = `xref\n0 ${this.objectId + 1}\n`;
    xref += "0000000000 65535 f \n";
    for (let i = 1; i <= this.objectId; i++) {
      xref += `${String(offsets[i] || 0).padStart(10, "0")} 00000 n \n`;
    }
    chunks.push(encoder.encode(xref));
    position += xref.length;

    // Trailer
    const trailer = `trailer\n<< /Size ${this.objectId + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
    chunks.push(encoder.encode(trailer));

    // Combine chunks
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }

    return result;
  }
}

// =============================================================================
// PDF Content Stream Helpers
// =============================================================================

/**
 * Escape string for PDF
 */
function escapeString(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n");
}

/**
 * Convert hex color to RGB values (0-1 range)
 */
function hexToRGB(hex: string): { r: number; g: number; b: number } {
  const cleanHex = hex.replace("#", "");
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
  return { r, g, b };
}

/**
 * Set fill color in content stream
 */
function setFillColor(hex: string): string {
  const { r, g, b } = hexToRGB(hex);
  return `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg`;
}

/**
 * Set stroke color in content stream
 */
function setStrokeColor(hex: string): string {
  const { r, g, b } = hexToRGB(hex);
  return `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} RG`;
}

/**
 * Draw rectangle
 */
function drawRect(
  x: number,
  y: number,
  width: number,
  height: number,
  fill: boolean = true
): string {
  const ops: string[] = [
    `${x.toFixed(2)} ${y.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re`,
  ];
  ops.push(fill ? "f" : "S");
  return ops.join("\n");
}

/**
 * Draw line
 */
function drawLine(x1: number, y1: number, x2: number, y2: number): string {
  return `${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`;
}

/**
 * Show text at position (utility function reserved for future use)
 */
export function showText(text: string, x: number, y: number): string {
  return `BT ${x.toFixed(2)} ${y.toFixed(2)} Td (${escapeString(text)}) Tj ET`;
}

/**
 * Set font (utility function reserved for future use)
 */
export function setFont(fontName: string, size: number): string {
  return `BT /${fontName} ${size} Tf ET`.replace("BT ", "").replace(" ET", "");
}

// =============================================================================
// Value Formatting
// =============================================================================

/**
 * Format value based on data type
 */
function formatValue(
  value: unknown,
  dataType: ColumnDataType = "string"
): string {
  if (value === null || value === undefined) {
    return "";
  }

  switch (dataType) {
    case "number":
      if (typeof value === "number") {
        return value.toLocaleString("en-US");
      }
      return String(value);

    case "currency":
      if (typeof value === "number") {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(value);
      }
      return String(value);

    case "percentage":
      if (typeof value === "number") {
        return (value * 100).toFixed(2) + "%";
      }
      return String(value);

    case "date":
      if (value instanceof Date) {
        return formatDate(value);
      }
      if (typeof value === "string") {
        const parsed = new Date(value);
        return isNaN(parsed.getTime()) ? value : formatDate(parsed);
      }
      return String(value);

    case "datetime":
      if (value instanceof Date) {
        return formatDateTime(value);
      }
      if (typeof value === "string") {
        const parsed = new Date(value);
        return isNaN(parsed.getTime()) ? value : formatDateTime(parsed);
      }
      return String(value);

    case "boolean":
      return value ? "Yes" : "No";

    case "string":
    default:
      return String(value);
  }
}

/**
 * Format date as MM/DD/YYYY
 */
function formatDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

/**
 * Format datetime as MM/DD/YYYY HH:MM
 */
function formatDateTime(date: Date): string {
  const datePart = formatDate(date);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${datePart} ${hours}:${minutes}`;
}

/**
 * Extract value from data row using column accessor
 */
function extractValue<T>(row: T, column: ExportColumn<T>): unknown {
  if (typeof column.accessor === "function") {
    return column.accessor(row);
  }
  return row[column.accessor as keyof T];
}

/**
 * Get formatted cell value
 */
function getCellValue<T>(row: T, column: ExportColumn<T>): string {
  const rawValue = extractValue(row, column);

  if (column.formatter) {
    return column.formatter(rawValue, row);
  }

  return formatValue(rawValue, column.dataType);
}

/**
 * Truncate text to fit within width (approximate)
 */
function truncateText(text: string, maxChars: number): string {
  if (text.length <= maxChars) {
    return text;
  }
  return text.substring(0, maxChars - 3) + "...";
}

// =============================================================================
// PDF Page Content Generation
// =============================================================================

interface TableLayout {
  columns: { width: number; x: number }[];
  rowHeight: number;
  headerHeight: number;
  startX: number;
  startY: number;
  tableWidth: number;
  maxRowsPerPage: number;
}

/**
 * Calculate table layout
 */
function calculateTableLayout<T>(
  options: PDFExportOptions<T>,
  pageWidth: number,
  pageHeight: number,
  margins: PDFMargins,
  styling: PDFStyling
): TableLayout {
  const visibleColumns = options.columns.filter((col) => !col.hidden);
  const tableWidth = pageWidth - margins.left - margins.right;
  const rowHeight =
    styling.fontSize! * styling.lineHeight! + styling.cellPadding! * 2;
  const headerHeight =
    styling.headerFontSize! * styling.lineHeight! + styling.cellPadding! * 2;

  // Calculate available height for table (accounting for header/footer)
  const headerSpace = options.title ? styling.titleFontSize! * 2 + 20 : 0;
  const footerSpace = options.includePageNumbers ? 30 : 0;
  const availableHeight =
    pageHeight - margins.top - margins.bottom - headerSpace - footerSpace;

  // Calculate rows per page
  const maxRowsPerPage = Math.floor(
    (availableHeight - headerHeight) / rowHeight
  );

  // Calculate column widths
  const totalSpecifiedWidth = visibleColumns.reduce(
    (sum, col) => sum + (col.width ?? 0),
    0
  );
  const unspecifiedCount = visibleColumns.filter((col) => !col.width).length;
  const remainingWidth = tableWidth - totalSpecifiedWidth;
  const defaultWidth =
    unspecifiedCount > 0 ? remainingWidth / unspecifiedCount : 0;

  let currentX = margins.left;
  const columns = visibleColumns.map((col) => {
    const width = col.width ?? defaultWidth;
    const column = { width, x: currentX };
    currentX += width;
    return column;
  });

  return {
    columns,
    rowHeight,
    headerHeight,
    startX: margins.left,
    startY: pageHeight - margins.top - headerSpace,
    tableWidth,
    maxRowsPerPage,
  };
}

/**
 * Generate page content stream for table
 */
function generateTablePageContent<T>(
  options: PDFExportOptions<T>,
  data: readonly T[],
  startRow: number,
  layout: TableLayout,
  pageNumber: number,
  totalPages: number,
  pageWidth: number,
  pageHeight: number,
  margins: PDFMargins,
  styling: PDFStyling,
  isFirstPage: boolean
): string {
  const content: string[] = [];
  const visibleColumns = options.columns.filter((col) => !col.hidden);
  let currentY = layout.startY;

  // Draw title on first page
  if (isFirstPage && options.title) {
    content.push("q");
    content.push(setFillColor(styling.primaryColor!));
    content.push(
      `BT /F2 ${styling.titleFontSize} Tf ${margins.left} ${pageHeight - margins.top + 10} Td (${escapeString(options.title)}) Tj ET`
    );

    if (options.subtitle) {
      content.push(
        `BT /F1 ${styling.fontSize} Tf ${margins.left} ${pageHeight - margins.top - 10} Td (${escapeString(options.subtitle)}) Tj ET`
      );
    }
    content.push("Q");

    currentY = layout.startY - 10;
  }

  // Draw summary on first page if provided
  if (isFirstPage && options.includeSummary && options.summaryData) {
    currentY = drawSummary(
      content,
      options.summaryData,
      margins.left,
      currentY,
      layout.tableWidth,
      styling
    );
    currentY -= 20;
  }

  // Draw table header
  const headerY = currentY - layout.headerHeight;

  // Header background
  content.push("q");
  content.push(setFillColor(styling.primaryColor!));
  content.push(
    drawRect(layout.startX, headerY, layout.tableWidth, layout.headerHeight)
  );
  content.push("Q");

  // Header text
  content.push("q");
  content.push("1 1 1 rg"); // White text
  layout.columns.forEach((col, idx) => {
    const column = visibleColumns[idx];
    const textX = col.x + styling.cellPadding!;
    const textY = headerY + styling.cellPadding!;
    const maxChars = Math.floor(
      (col.width - styling.cellPadding! * 2) / (styling.headerFontSize! * 0.5)
    );
    const text = truncateText(column.header, maxChars);
    content.push(
      `BT /F2 ${styling.headerFontSize} Tf ${textX.toFixed(2)} ${textY.toFixed(2)} Td (${escapeString(text)}) Tj ET`
    );
  });
  content.push("Q");

  currentY = headerY;

  // Draw data rows
  const endRow = Math.min(startRow + layout.maxRowsPerPage, data.length);

  for (let rowIdx = startRow; rowIdx < endRow; rowIdx++) {
    const row = data[rowIdx];
    const rowY = currentY - layout.rowHeight;
    const isAlternate = (rowIdx - startRow) % 2 === 1;

    // Row background (alternating)
    if (isAlternate) {
      content.push("q");
      content.push(setFillColor(styling.secondaryColor!));
      content.push(
        drawRect(layout.startX, rowY, layout.tableWidth, layout.rowHeight)
      );
      content.push("Q");
    }

    // Row border
    content.push("q");
    content.push(setStrokeColor(styling.borderColor!));
    content.push(`${styling.borderWidth} w`);
    content.push(
      drawLine(layout.startX, rowY, layout.startX + layout.tableWidth, rowY)
    );
    content.push("Q");

    // Cell text
    content.push("q");
    content.push("0 0 0 rg"); // Black text
    layout.columns.forEach((col, colIdx) => {
      const column = visibleColumns[colIdx];
      const value = getCellValue(row, column);
      const textX = col.x + styling.cellPadding!;
      const textY = rowY + styling.cellPadding!;
      const maxChars = Math.floor(
        (col.width - styling.cellPadding! * 2) / (styling.fontSize! * 0.5)
      );
      const text = truncateText(value, maxChars);

      // Align right for numbers/currency
      let finalX = textX;
      if (
        column.align === "right" ||
        column.dataType === "currency" ||
        column.dataType === "number"
      ) {
        const textWidth = text.length * styling.fontSize! * 0.5;
        finalX = col.x + col.width - styling.cellPadding! - textWidth;
      } else if (column.align === "center") {
        const textWidth = text.length * styling.fontSize! * 0.5;
        finalX = col.x + (col.width - textWidth) / 2;
      }

      content.push(
        `BT /F1 ${styling.fontSize} Tf ${finalX.toFixed(2)} ${textY.toFixed(2)} Td (${escapeString(text)}) Tj ET`
      );
    });
    content.push("Q");

    currentY = rowY;
  }

  // Draw table border
  content.push("q");
  content.push(setStrokeColor(styling.borderColor!));
  content.push(`${styling.borderWidth} w`);
  // Top border
  content.push(
    drawLine(
      layout.startX,
      layout.startY,
      layout.startX + layout.tableWidth,
      layout.startY
    )
  );
  // Bottom border
  content.push(
    drawLine(
      layout.startX,
      currentY,
      layout.startX + layout.tableWidth,
      currentY
    )
  );
  // Left border
  content.push(drawLine(layout.startX, layout.startY, layout.startX, currentY));
  // Right border
  content.push(
    drawLine(
      layout.startX + layout.tableWidth,
      layout.startY,
      layout.startX + layout.tableWidth,
      currentY
    )
  );
  // Column borders
  layout.columns.forEach((col) => {
    content.push(drawLine(col.x, layout.startY, col.x, currentY));
  });
  content.push("Q");

  // Draw page number
  if (options.includePageNumbers) {
    const pageText = `Page ${pageNumber} of ${totalPages}`;
    const textWidth = pageText.length * styling.fontSize! * 0.5;
    content.push("q");
    content.push("0.5 0.5 0.5 rg");
    content.push(
      `BT /F1 ${styling.fontSize} Tf ${(pageWidth - textWidth) / 2} ${margins.bottom / 2} Td (${escapeString(pageText)}) Tj ET`
    );
    content.push("Q");
  }

  // Draw timestamp if enabled
  if (options.includeTimestamp && isFirstPage) {
    const timestamp = `Generated: ${formatDateTime(new Date())}`;
    content.push("q");
    content.push("0.5 0.5 0.5 rg");
    content.push(
      `BT /F1 8 Tf ${pageWidth - margins.right - 150} ${margins.bottom / 2} Td (${escapeString(timestamp)}) Tj ET`
    );
    content.push("Q");
  }

  // Draw watermark if provided
  if (options.watermark) {
    content.push("q");
    content.push("0.9 0.9 0.9 rg");
    content.push(
      `BT /F2 48 Tf ${pageWidth / 3} ${pageHeight / 2} Td (${escapeString(options.watermark)}) Tj ET`
    );
    content.push("Q");
  }

  return content.join("\n");
}

/**
 * Draw summary section
 */
function drawSummary(
  content: string[],
  summary: ReportSummary,
  x: number,
  y: number,
  width: number,
  styling: PDFStyling
): number {
  const itemHeight = styling.fontSize! * styling.lineHeight! + 4;
  let currentY = y;

  if (summary.title) {
    content.push("q");
    content.push(setFillColor(styling.primaryColor!));
    content.push(
      `BT /F2 ${styling.headerFontSize} Tf ${x} ${currentY} Td (${escapeString(summary.title)}) Tj ET`
    );
    content.push("Q");
    currentY -= itemHeight + 5;
  }

  // Draw summary items in two columns
  const midX = x + width / 2;

  summary.items.forEach((item, idx) => {
    const itemX = idx % 2 === 0 ? x : midX;
    if (idx % 2 === 0 && idx > 0) {
      currentY -= itemHeight;
    }

    const value =
      item.dataType === "currency" && typeof item.value === "number"
        ? formatValue(item.value, "currency")
        : String(item.value);

    content.push("q");
    content.push("0 0 0 rg");
    content.push(
      `BT /F2 ${styling.fontSize} Tf ${itemX} ${currentY} Td (${escapeString(item.label)}:) Tj ET`
    );
    content.push(
      `BT /F1 ${styling.fontSize} Tf ${itemX + 120} ${currentY} Td (${escapeString(value)}) Tj ET`
    );
    content.push("Q");
  });

  if (summary.items.length % 2 === 1) {
    currentY -= itemHeight;
  }

  return currentY - 10;
}

// =============================================================================
// Filename Generation
// =============================================================================

/**
 * Generate filename with date suffix
 */
function generateFilename<T>(options: PDFExportOptions<T>): string {
  const baseName = options.filename ?? options.title ?? "export";
  const sanitizedName = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const now = new Date();
  const dateSuffix = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;

  return `${sanitizedName}-${dateSuffix}${FILE_EXTENSIONS.pdf}`;
}

// =============================================================================
// Main Export Function
// =============================================================================

/**
 * Export data to PDF format
 *
 * @param options - PDF export options including data and column definitions
 * @param onProgress - Optional callback for progress updates
 * @returns Promise resolving to ExportResult with blob, filename, and metadata
 *
 * @example
 * ```typescript
 * const result = await exportToPDF({
 *   title: 'Trust Account Statement',
 *   subtitle: 'January 2025',
 *   columns: [
 *     { header: 'Date', accessor: 'transactionDate', dataType: 'date', width: 80 },
 *     { header: 'Description', accessor: 'description', width: 200 },
 *     { header: 'Debit', accessor: 'debit', dataType: 'currency', width: 80, align: 'right' },
 *     { header: 'Credit', accessor: 'credit', dataType: 'currency', width: 80, align: 'right' },
 *     { header: 'Balance', accessor: 'balance', dataType: 'currency', width: 80, align: 'right' },
 *   ],
 *   data: transactions,
 *   orientation: 'landscape',
 *   includePageNumbers: true,
 *   includeSummary: true,
 *   summaryData: {
 *     title: 'Summary',
 *     items: [
 *       { label: 'Beginning Balance', value: 10000, dataType: 'currency' },
 *       { label: 'Ending Balance', value: 15000, dataType: 'currency' },
 *     ],
 *   },
 * });
 *
 * // Trigger download
 * downloadBlob(result.blob, result.filename);
 * ```
 */
export async function exportToPDF<T>(
  options: PDFExportOptions<T>,
  onProgress?: ExportProgressCallback
): Promise<ExportResult> {
  // Validate input
  if (!options.columns || options.columns.length === 0) {
    throw new Error("PDF export requires at least one column definition");
  }

  if (!options.data) {
    throw new Error("PDF export requires data array");
  }

  onProgress?.({
    phase: "preparing",
    percentage: 0,
    message: "Preparing PDF export...",
  });

  const styling: PDFStyling = {
    ...DEFAULT_EXPORT_CONFIG.defaultPDFStyling,
    ...options.styling,
  };

  const margins: PDFMargins = {
    ...DEFAULT_MARGINS,
    ...options.margins,
  };

  const pageSize = options.pageSize ?? "Letter";
  const orientation = options.orientation ?? "portrait";

  // Get page dimensions (swap for landscape)
  let { width: pageWidth, height: pageHeight } = PAGE_SIZES[pageSize];
  if (orientation === "landscape") {
    [pageWidth, pageHeight] = [pageHeight, pageWidth];
  }

  // Calculate table layout
  const layout = calculateTableLayout(
    options,
    pageWidth,
    pageHeight,
    margins,
    styling
  );

  // Calculate number of pages needed
  const totalPages = Math.ceil(options.data.length / layout.maxRowsPerPage);

  onProgress?.({
    phase: "generating",
    percentage: 10,
    message: `Generating ${totalPages} page(s)...`,
  });

  // Create PDF builder
  const pdf = new PDFBuilder();

  // Add catalog (object 1)
  const pagesId = pdf.getNextId() + 1;
  pdf.addObject(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);

  // We'll update pages object after creating all pages
  const pagesObjId = pdf.addObject("PLACEHOLDER");

  // Add fonts
  const helveticaId = pdf.addObject(
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"
  );
  pdf.registerFont("Helvetica", helveticaId);

  const helveticaBoldId = pdf.addObject(
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>"
  );
  pdf.registerFont("Helvetica-Bold", helveticaBoldId);

  // Generate pages
  for (let pageNum = 0; pageNum < totalPages; pageNum++) {
    const startRow = pageNum * layout.maxRowsPerPage;
    const isFirstPage = pageNum === 0;

    onProgress?.({
      phase: "generating",
      percentage: 10 + Math.round((pageNum / totalPages) * 80),
      currentRow: startRow,
      totalRows: options.data.length,
      message: `Generating page ${pageNum + 1} of ${totalPages}...`,
    });

    // Generate page content
    const contentStream = generateTablePageContent(
      options,
      options.data,
      startRow,
      layout,
      pageNum + 1,
      totalPages,
      pageWidth,
      pageHeight,
      margins,
      styling,
      isFirstPage
    );

    // Add content stream object
    const streamLength = contentStream.length;
    const contentId = pdf.addObject(
      `<< /Length ${streamLength} >>\nstream\n${contentStream}\nendstream`
    );

    // Add resources object
    const resourcesId = pdf.addObject(
      `<< /Font << /F1 ${helveticaId} 0 R /F2 ${helveticaBoldId} 0 R >> >>`
    );

    // Add page object
    const pageId = pdf.addObject(
      `<< /Type /Page /Parent ${pagesObjId} 0 R /MediaBox [0 0 ${pageWidth.toFixed(2)} ${pageHeight.toFixed(2)}] /Contents ${contentId} 0 R /Resources ${resourcesId} 0 R >>`
    );

    pdf.addPage(pageId);
  }

  // Update pages object with actual page references
  const pageRefs = pdf
    .getPageIds()
    .map((id) => `${id} 0 R`)
    .join(" ");
  const pagesContent = `<< /Type /Pages /Kids [${pageRefs}] /Count ${totalPages} >>`;
  // pagesContent reserved for future PDF structure optimization
  void pagesContent;

  // We need to rebuild with correct pages object
  // For simplicity, we'll create a new builder with correct order
  const finalPdf = new PDFBuilder();

  // Catalog
  const finalPagesId = 2;
  finalPdf.addObject(`<< /Type /Catalog /Pages ${finalPagesId} 0 R >>`);

  // Pages (placeholder, will be filled with correct refs)
  const pageIdStart = 5; // After catalog, pages, and 2 fonts
  const finalPageRefs: string[] = [];
  for (let i = 0; i < totalPages; i++) {
    // Each page consists of: content stream, resources, page object
    const pageObjId = pageIdStart + i * 3 + 2; // page object is 3rd in each group
    finalPageRefs.push(`${pageObjId} 0 R`);
  }

  finalPdf.addObject(
    `<< /Type /Pages /Kids [${finalPageRefs.join(" ")}] /Count ${totalPages} >>`
  );

  // Fonts
  const finalHelveticaId = finalPdf.addObject(
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"
  );
  const finalHelveticaBoldId = finalPdf.addObject(
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>"
  );

  // Generate pages again for final PDF
  for (let pageNum = 0; pageNum < totalPages; pageNum++) {
    const startRow = pageNum * layout.maxRowsPerPage;
    const isFirstPage = pageNum === 0;

    const contentStream = generateTablePageContent(
      options,
      options.data,
      startRow,
      layout,
      pageNum + 1,
      totalPages,
      pageWidth,
      pageHeight,
      margins,
      styling,
      isFirstPage
    );

    const streamLength = contentStream.length;
    const contentId = finalPdf.addObject(
      `<< /Length ${streamLength} >>\nstream\n${contentStream}\nendstream`
    );

    const resourcesId = finalPdf.addObject(
      `<< /Font << /F1 ${finalHelveticaId} 0 R /F2 ${finalHelveticaBoldId} 0 R >> >>`
    );

    finalPdf.addObject(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth.toFixed(2)} ${pageHeight.toFixed(2)}] /Contents ${contentId} 0 R /Resources ${resourcesId} 0 R >>`
    );
  }

  onProgress?.({
    phase: "formatting",
    percentage: 95,
    message: "Finalizing PDF...",
  });

  // Build final PDF
  const pdfData = finalPdf.build();

  const blob = new Blob([new Uint8Array(pdfData)], { type: MIME_TYPES.pdf });
  const filename = generateFilename(options);

  onProgress?.({
    phase: "complete",
    percentage: 100,
    message: "PDF export complete",
  });

  return {
    blob,
    filename,
    mimeType: MIME_TYPES.pdf,
    size: blob.size,
    generatedAt: new Date(),
    format: "pdf",
    rowCount: options.data.length,
  };
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Validate PDF export options
 */
export function validatePDFOptions<T>(options: Partial<PDFExportOptions<T>>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!options.columns || options.columns.length === 0) {
    errors.push("At least one column definition is required");
  }

  if (!options.data) {
    errors.push("Data array is required");
  }

  if (options.pageSize && !PAGE_SIZES[options.pageSize]) {
    errors.push(`Invalid page size: ${options.pageSize}`);
  }

  if (
    options.orientation &&
    !["portrait", "landscape"].includes(options.orientation)
  ) {
    errors.push(`Invalid orientation: ${options.orientation}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Create default PDF options with sensible defaults
 */
export function createPDFOptions<T>(
  overrides: Partial<PDFExportOptions<T>>
): PDFExportOptions<T> {
  return {
    title: "Export",
    columns: [] as unknown as readonly ExportColumn<T>[],
    data: [] as unknown as readonly T[],
    orientation: "portrait",
    pageSize: "Letter",
    margins: DEFAULT_MARGINS,
    styling: DEFAULT_EXPORT_CONFIG.defaultPDFStyling,
    includeTimestamp: true,
    includePageNumbers: true,
    includeCoverPage: false,
    includeSummary: false,
    ...overrides,
  };
}

/**
 * Calculate optimal column widths based on content
 */
export function calculateColumnWidths<T>(
  columns: readonly ExportColumn<T>[],
  data: readonly T[],
  availableWidth: number,
  options: { minWidth?: number; maxWidth?: number; fontSize?: number } = {}
): Map<number, number> {
  const { minWidth = 50, maxWidth = 200, fontSize = 10 } = options;
  const charWidth = fontSize * 0.5;
  const padding = 16;

  const widths = new Map<number, number>();

  columns.forEach((col, idx) => {
    // Start with header width
    let maxContentWidth = col.header.length * charWidth + padding;

    // Check data rows (sample first 100 rows for performance)
    const sampleData = data.slice(0, 100);
    sampleData.forEach((row) => {
      const value = getCellValue(row, col);
      const contentWidth = value.length * charWidth + padding;
      maxContentWidth = Math.max(maxContentWidth, contentWidth);
    });

    // Apply constraints
    const width = Math.min(Math.max(maxContentWidth, minWidth), maxWidth);
    widths.set(idx, width);
  });

  // Scale to fit available width
  const totalWidth = Array.from(widths.values()).reduce((sum, w) => sum + w, 0);
  if (totalWidth > availableWidth) {
    const scale = availableWidth / totalWidth;
    widths.forEach((width, idx) => {
      widths.set(idx, Math.max(width * scale, minWidth));
    });
  }

  return widths;
}
