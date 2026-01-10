/**
 * Excel Generator
 * @module lib/export/excel-generator
 *
 * Generates Excel (XLSX) files using pure JavaScript implementation.
 * Supports multiple sheets, styling, auto-filter, freeze panes, and formulas.
 *
 * This implementation creates valid XLSX files without external dependencies
 * by constructing the Open XML Spreadsheet format directly.
 */

import {
  type ColumnDataType,
  DEFAULT_EXPORT_CONFIG,
  type ExcelExportOptions,
  type ExcelSheet,
  type ExcelStyling,
  type ExportColumn,
  type ExportProgressCallback,
  type ExportResult,
  FILE_EXTENSIONS,
  MIME_TYPES,
} from "./types";

// =============================================================================
// Constants
// =============================================================================

/** Excel date epoch (January 1, 1900) */
const EXCEL_EPOCH = new Date(1899, 11, 30);

/** Maximum characters in sheet name */
const MAX_SHEET_NAME_LENGTH = 31;

/** Invalid characters in sheet names */
const INVALID_SHEET_NAME_CHARS = /[\\/*?:\[\]]/g;

/** Column letters for Excel (A-Z, AA-AZ, etc.) */
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Convert column index to Excel column letter (0 = A, 25 = Z, 26 = AA, etc.)
 */
function getColumnLetter(index: number): string {
  let letter = "";
  let temp = index;

  while (temp >= 0) {
    letter = ALPHABET[temp % 26] + letter;
    temp = Math.floor(temp / 26) - 1;
  }

  return letter;
}

/**
 * Get cell reference (e.g., A1, B2, etc.)
 */
function getCellRef(row: number, col: number): string {
  return `${getColumnLetter(col)}${row + 1}`;
}

/**
 * Convert JavaScript Date to Excel serial date number
 */
function dateToExcelSerial(date: Date): number {
  const diff = date.getTime() - EXCEL_EPOCH.getTime();
  return Math.floor(diff / (24 * 60 * 60 * 1000)) + 1;
}

/**
 * Sanitize sheet name for Excel compatibility
 */
function sanitizeSheetName(name: string): string {
  return name
    .replace(INVALID_SHEET_NAME_CHARS, "_")
    .substring(0, MAX_SHEET_NAME_LENGTH);
}

/**
 * Escape XML special characters
 */
function escapeXML(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Convert hex color to ARGB format (Excel uses ARGB)
 */
function hexToARGB(hex: string): string {
  const cleanHex = hex.replace("#", "");
  return "FF" + cleanHex.toUpperCase();
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
): { value: string; type: "n" | "s" | "d" | "b"; numFmt?: string } {
  if (value === null || value === undefined) {
    return { value: "", type: "s" };
  }

  switch (dataType) {
    case "number":
      if (typeof value === "number") {
        return { value: value.toString(), type: "n" };
      }
      return { value: String(value), type: "s" };

    case "currency":
      if (typeof value === "number") {
        return { value: value.toString(), type: "n", numFmt: '"$"#,##0.00' };
      }
      return { value: String(value), type: "s" };

    case "percentage":
      if (typeof value === "number") {
        return { value: value.toString(), type: "n", numFmt: "0.00%" };
      }
      return { value: String(value), type: "s" };

    case "date":
      if (value instanceof Date) {
        return {
          value: dateToExcelSerial(value).toString(),
          type: "d",
          numFmt: "mm/dd/yyyy",
        };
      }
      if (typeof value === "string") {
        const parsed = new Date(value);
        if (!isNaN(parsed.getTime())) {
          return {
            value: dateToExcelSerial(parsed).toString(),
            type: "d",
            numFmt: "mm/dd/yyyy",
          };
        }
      }
      return { value: String(value), type: "s" };

    case "datetime":
      if (value instanceof Date) {
        const serial =
          dateToExcelSerial(value) +
          (value.getHours() * 3600 +
            value.getMinutes() * 60 +
            value.getSeconds()) /
            86400;
        return {
          value: serial.toString(),
          type: "d",
          numFmt: "mm/dd/yyyy hh:mm",
        };
      }
      if (typeof value === "string") {
        const parsed = new Date(value);
        if (!isNaN(parsed.getTime())) {
          const serial =
            dateToExcelSerial(parsed) +
            (parsed.getHours() * 3600 +
              parsed.getMinutes() * 60 +
              parsed.getSeconds()) /
              86400;
          return {
            value: serial.toString(),
            type: "d",
            numFmt: "mm/dd/yyyy hh:mm",
          };
        }
      }
      return { value: String(value), type: "s" };

    case "boolean":
      return { value: value ? "1" : "0", type: "b" };

    case "string":
    default:
      return { value: String(value), type: "s" };
  }
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

// =============================================================================
// XML Generation
// =============================================================================

/**
 * Generate content types XML
 */
function generateContentTypes(sheetCount: number): string {
  let sheets = "";
  for (let i = 1; i <= sheetCount; i++) {
    sheets += `<Override PartName="/xl/worksheets/sheet${i}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`;
  }

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  <Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>
  ${sheets}
</Types>`;
}

/**
 * Generate root relationships XML
 */
function generateRootRels(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;
}

/**
 * Generate workbook relationships XML
 */
function generateWorkbookRels(sheetCount: number): string {
  let sheets = "";
  for (let i = 1; i <= sheetCount; i++) {
    sheets += `<Relationship Id="rId${i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i}.xml"/>`;
  }

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${sheets}
  <Relationship Id="rId${sheetCount + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId${sheetCount + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>
</Relationships>`;
}

/**
 * Generate workbook XML
 */
function generateWorkbook(sheetNames: string[]): string {
  let sheets = "";
  sheetNames.forEach((name, index) => {
    sheets += `<sheet name="${escapeXML(sanitizeSheetName(name))}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`;
  });

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    ${sheets}
  </sheets>
</workbook>`;
}

/**
 * Generate styles XML
 */
function generateStyles(styling: ExcelStyling): string {
  const headerBgColor = hexToARGB(styling.headerBgColor ?? "1e3a5f");
  const headerTextColor = hexToARGB(styling.headerTextColor ?? "ffffff");
  const altRowColor = hexToARGB(styling.alternateRowColor ?? "f8f9fa");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <numFmts count="3">
    <numFmt numFmtId="164" formatCode="&quot;$&quot;#,##0.00"/>
    <numFmt numFmtId="165" formatCode="mm/dd/yyyy"/>
    <numFmt numFmtId="166" formatCode="mm/dd/yyyy hh:mm"/>
  </numFmts>
  <fonts count="2">
    <font>
      <sz val="11"/>
      <name val="Calibri"/>
    </font>
    <font>
      <b/>
      <sz val="11"/>
      <color rgb="${headerTextColor}"/>
      <name val="Calibri"/>
    </font>
  </fonts>
  <fills count="4">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill>
      <patternFill patternType="solid">
        <fgColor rgb="${headerBgColor}"/>
        <bgColor indexed="64"/>
      </patternFill>
    </fill>
    <fill>
      <patternFill patternType="solid">
        <fgColor rgb="${altRowColor}"/>
        <bgColor indexed="64"/>
      </patternFill>
    </fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border>
      <left style="thin"><color auto="1"/></left>
      <right style="thin"><color auto="1"/></right>
      <top style="thin"><color auto="1"/></top>
      <bottom style="thin"><color auto="1"/></bottom>
      <diagonal/>
    </border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="6">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="center" vertical="center" wrapText="1"/>
    </xf>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1"/>
    <xf numFmtId="0" fontId="0" fillId="3" borderId="1" xfId="0" applyFill="1" applyBorder="1"/>
    <xf numFmtId="164" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1"/>
    <xf numFmtId="165" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1"/>
  </cellXfs>
</styleSheet>`;
}

/**
 * Generate shared strings XML
 */
function generateSharedStrings(strings: string[]): string {
  const uniqueStrings = Array.from(new Set(strings));
  const stringItems = uniqueStrings
    .map((str) => `<si><t>${escapeXML(str)}</t></si>`)
    .join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${strings.length}" uniqueCount="${uniqueStrings.length}">
  ${stringItems}
</sst>`;
}

/**
 * Generate worksheet XML
 */
function generateWorksheet<T>(
  columns: readonly ExportColumn<T>[],
  data: readonly T[],
  options: {
    autoFilter?: boolean;
    freezeHeader?: boolean;
    includeTotals?: boolean;
    sharedStrings: Map<string, number>;
    styling: ExcelStyling;
  }
): string {
  const visibleColumns = columns.filter((col) => !col.hidden);
  const colCount = visibleColumns.length;
  const rowCount = data.length + 1 + (options.includeTotals ? 1 : 0);

  // Generate column definitions
  let colDefs = "<cols>";
  visibleColumns.forEach((col, idx) => {
    const width = col.width ?? options.styling.defaultColumnWidth ?? 15;
    colDefs += `<col min="${idx + 1}" max="${idx + 1}" width="${width}" customWidth="1"/>`;
  });
  colDefs += "</cols>";

  // Generate rows
  let rows = "";

  // Header row
  rows += '<row r="1" ht="20" customHeight="1">';
  visibleColumns.forEach((col, idx) => {
    const ref = getCellRef(0, idx);
    const stringIndex = options.sharedStrings.get(col.header);
    rows += `<c r="${ref}" t="s" s="1"><v>${stringIndex}</v></c>`;
  });
  rows += "</row>";

  // Data rows
  data.forEach((row, rowIdx) => {
    const excelRow = rowIdx + 2; // 1-based, plus header
    const styleIndex = rowIdx % 2 === 0 ? 2 : 3; // Alternating row colors

    rows += `<row r="${excelRow}">`;
    visibleColumns.forEach((col, colIdx) => {
      const ref = getCellRef(rowIdx + 1, colIdx);
      const rawValue = extractValue(row, col);

      // Use custom formatter if provided
      let displayValue: unknown;
      if (col.formatter) {
        displayValue = col.formatter(rawValue, row);
      } else {
        displayValue = rawValue;
      }

      const formatted = formatValue(displayValue, col.dataType);

      if (formatted.type === "s") {
        const stringIndex = options.sharedStrings.get(formatted.value);
        rows += `<c r="${ref}" t="s" s="${styleIndex}"><v>${stringIndex ?? 0}</v></c>`;
      } else if (formatted.type === "n" || formatted.type === "d") {
        const numStyle =
          col.dataType === "currency"
            ? 4
            : col.dataType === "date" || col.dataType === "datetime"
              ? 5
              : styleIndex;
        rows += `<c r="${ref}" s="${numStyle}"><v>${formatted.value}</v></c>`;
      } else if (formatted.type === "b") {
        rows += `<c r="${ref}" t="b" s="${styleIndex}"><v>${formatted.value}</v></c>`;
      }
    });
    rows += "</row>";
  });

  // Totals row
  if (options.includeTotals) {
    const totalsRow = data.length + 2;
    rows += `<row r="${totalsRow}">`;
    visibleColumns.forEach((col, colIdx) => {
      const ref = getCellRef(data.length + 1, colIdx);
      if (
        col.includeInTotals &&
        (col.dataType === "number" || col.dataType === "currency")
      ) {
        const startRef = getCellRef(1, colIdx);
        const endRef = getCellRef(data.length, colIdx);
        const style = col.dataType === "currency" ? 4 : 2;
        rows += `<c r="${ref}" s="${style}"><f>SUM(${startRef}:${endRef})</f></c>`;
      } else if (colIdx === 0) {
        const stringIndex = options.sharedStrings.get("Total");
        rows += `<c r="${ref}" t="s" s="1"><v>${stringIndex}</v></c>`;
      } else {
        rows += `<c r="${ref}" s="2"/>`;
      }
    });
    rows += "</row>";
  }

  // Build dimension reference
  const lastCol = getColumnLetter(colCount - 1);
  const dimension = `A1:${lastCol}${rowCount}`;

  // Build freeze pane if needed
  let sheetViews = "";
  if (options.freezeHeader) {
    sheetViews = `<sheetViews>
      <sheetView tabSelected="1" workbookViewId="0">
        <pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>
      </sheetView>
    </sheetViews>`;
  }

  // Build auto filter if needed
  let autoFilter = "";
  if (options.autoFilter) {
    autoFilter = `<autoFilter ref="A1:${lastCol}${data.length + 1}"/>`;
  }

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <dimension ref="${dimension}"/>
  ${sheetViews}
  ${colDefs}
  <sheetData>
    ${rows}
  </sheetData>
  ${autoFilter}
</worksheet>`;
}

// =============================================================================
// ZIP Creation (Minimal Implementation)
// =============================================================================

/**
 * Create a simple ZIP file
 * This is a minimal implementation for XLSX which is a ZIP container
 */
async function createZip(files: Map<string, string>): Promise<Uint8Array> {
  const entries: { name: string; data: Uint8Array; offset: number }[] = [];
  const encoder = new TextEncoder();
  let offset = 0;
  const chunks: Uint8Array[] = [];

  // CRC-32 lookup table
  const crcTable: number[] = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[i] = c;
  }

  function crc32(data: Uint8Array): number {
    let crc = 0xffffffff;
    for (let i = 0; i < data.length; i++) {
      crc = crcTable[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  // Unused helpers
  /*
  function writeUint16LE(value: number): Uint8Array {
    return new Uint8Array([value & 0xff, (value >> 8) & 0xff]);
  }

  function writeUint32LE(value: number): Uint8Array {
    return new Uint8Array([
      value & 0xff,
      (value >> 8) & 0xff,
      (value >> 16) & 0xff,
      (value >> 24) & 0xff,
    ]);
  }
  */

  // Write local file headers and data
  for (const [path, content] of Array.from(files.entries())) {
    const data = encoder.encode(content);
    const crc = crc32(data);
    const nameBytes = encoder.encode(path);

    const localHeader = new Uint8Array(30 + nameBytes.length);
    const view = new DataView(localHeader.buffer);

    // Local file header signature
    view.setUint32(0, 0x04034b50, true);
    // Version needed to extract
    view.setUint16(4, 20, true);
    // General purpose bit flag
    view.setUint16(6, 0, true);
    // Compression method (0 = store)
    view.setUint16(8, 0, true);
    // File time
    view.setUint16(10, 0, true);
    // File date
    view.setUint16(12, 0, true);
    // CRC-32
    view.setUint32(14, crc, true);
    // Compressed size
    view.setUint32(18, data.length, true);
    // Uncompressed size
    view.setUint32(22, data.length, true);
    // File name length
    view.setUint16(26, nameBytes.length, true);
    // Extra field length
    view.setUint16(28, 0, true);

    // File name
    localHeader.set(nameBytes, 30);

    entries.push({
      name: path,
      data,
      offset,
    });

    chunks.push(localHeader);
    chunks.push(data);
    offset += localHeader.length + data.length;
  }

  const centralDirOffset = offset;

  // Write central directory
  for (const entry of entries) {
    const nameBytes = encoder.encode(entry.name);
    const crc = crc32(entry.data);

    const centralHeader = new Uint8Array(46 + nameBytes.length);
    const view = new DataView(centralHeader.buffer);

    // Central directory file header signature
    view.setUint32(0, 0x02014b50, true);
    // Version made by
    view.setUint16(4, 20, true);
    // Version needed to extract
    view.setUint16(6, 20, true);
    // General purpose bit flag
    view.setUint16(8, 0, true);
    // Compression method
    view.setUint16(10, 0, true);
    // File time
    view.setUint16(12, 0, true);
    // File date
    view.setUint16(14, 0, true);
    // CRC-32
    view.setUint32(16, crc, true);
    // Compressed size
    view.setUint32(20, entry.data.length, true);
    // Uncompressed size
    view.setUint32(24, entry.data.length, true);
    // File name length
    view.setUint16(28, nameBytes.length, true);
    // Extra field length
    view.setUint16(30, 0, true);
    // File comment length
    view.setUint16(32, 0, true);
    // Disk number start
    view.setUint16(34, 0, true);
    // Internal file attributes
    view.setUint16(36, 0, true);
    // External file attributes
    view.setUint32(38, 0, true);
    // Relative offset of local header
    view.setUint32(42, entry.offset, true);

    // File name
    centralHeader.set(nameBytes, 46);

    chunks.push(centralHeader);
    offset += centralHeader.length;
  }

  const centralDirSize = offset - centralDirOffset;

  // Write end of central directory record
  const eocd = new Uint8Array(22);
  const eocdView = new DataView(eocd.buffer);

  // End of central directory signature
  eocdView.setUint32(0, 0x06054b50, true);
  // Number of this disk
  eocdView.setUint16(4, 0, true);
  // Disk where central directory starts
  eocdView.setUint16(6, 0, true);
  // Number of central directory records on this disk
  eocdView.setUint16(8, entries.length, true);
  // Total number of central directory records
  eocdView.setUint16(10, entries.length, true);
  // Size of central directory
  eocdView.setUint32(12, centralDirSize, true);
  // Offset of start of central directory
  eocdView.setUint32(16, centralDirOffset, true);
  // Comment length
  eocdView.setUint16(20, 0, true);

  chunks.push(eocd);

  // Combine all chunks
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let pos = 0;
  for (const chunk of chunks) {
    result.set(chunk, pos);
    pos += chunk.length;
  }

  return result;
}

// =============================================================================
// Filename Generation
// =============================================================================

/**
 * Generate filename with date suffix
 */
function generateFilename<T>(options: ExcelExportOptions<T>): string {
  const baseName = options.filename ?? options.title ?? "export";
  const sanitizedName = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const now = new Date();
  const dateSuffix = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;

  return `${sanitizedName}-${dateSuffix}${FILE_EXTENSIONS.excel}`;
}

// =============================================================================
// Main Export Function
// =============================================================================

/**
 * Export data to Excel (XLSX) format
 *
 * @param options - Excel export options including data and column definitions
 * @param onProgress - Optional callback for progress updates
 * @returns Promise resolving to ExportResult with blob, filename, and metadata
 *
 * @example
 * ```typescript
 * const result = await exportToExcel({
 *   title: 'Billing Report',
 *   columns: [
 *     { header: 'Invoice #', accessor: 'invoiceNumber' },
 *     { header: 'Client', accessor: 'clientName' },
 *     { header: 'Amount', accessor: 'amount', dataType: 'currency', includeInTotals: true },
 *     { header: 'Date', accessor: 'invoiceDate', dataType: 'date' },
 *   ],
 *   data: invoices,
 *   autoFilter: true,
 *   freezeHeader: true,
 *   includeTotals: true,
 * });
 *
 * // Trigger download
 * downloadBlob(result.blob, result.filename);
 * ```
 */
export async function exportToExcel<T>(
  options: ExcelExportOptions<T>,
  onProgress?: ExportProgressCallback
): Promise<ExportResult> {
  // Validate input
  if (!options.columns || options.columns.length === 0) {
    throw new Error("Excel export requires at least one column definition");
  }

  if (!options.data) {
    throw new Error("Excel export requires data array");
  }

  onProgress?.({
    phase: "preparing",
    percentage: 0,
    message: "Preparing Excel export...",
  });

  const styling: ExcelStyling = {
    ...DEFAULT_EXPORT_CONFIG.defaultExcelStyling,
    ...options.styling,
  };

  // Determine sheets to generate
  const sheets: ExcelSheet<T>[] = options.sheets
    ? [...options.sheets]
    : [
        {
          name: options.title ?? "Sheet1",
          columns: options.columns,
          data: options.data,
          autoFilter: options.autoFilter,
          freezeHeader: options.freezeHeader,
          includeTotals: options.includeTotals,
        },
      ];

  // Collect all strings for shared strings table
  const allStrings: string[] = ["Total"]; // Always include Total for totals row
  sheets.forEach((sheet) => {
    const visibleColumns = sheet.columns.filter((col) => !col.hidden);

    // Headers
    visibleColumns.forEach((col) => allStrings.push(col.header));

    // Data values (strings only)
    sheet.data.forEach((row) => {
      visibleColumns.forEach((col) => {
        const rawValue = extractValue(row, col);
        let displayValue: unknown;
        if (col.formatter) {
          displayValue = col.formatter(rawValue, row);
        } else {
          displayValue = rawValue;
        }
        const formatted = formatValue(displayValue, col.dataType);
        if (formatted.type === "s" && formatted.value) {
          allStrings.push(formatted.value);
        }
      });
    });
  });

  // Create shared strings map
  const uniqueStrings = Array.from(new Set(allStrings));
  const sharedStrings = new Map<string, number>();
  uniqueStrings.forEach((str, idx) => {
    sharedStrings.set(str, idx);
  });

  onProgress?.({
    phase: "generating",
    percentage: 20,
    message: "Generating worksheets...",
  });

  // Generate all XML files
  const files = new Map<string, string>();

  // Content types
  files.set("[Content_Types].xml", generateContentTypes(sheets.length));

  // Root relationships
  files.set("_rels/.rels", generateRootRels());

  // Workbook relationships
  files.set("xl/_rels/workbook.xml.rels", generateWorkbookRels(sheets.length));

  // Workbook
  files.set("xl/workbook.xml", generateWorkbook(sheets.map((s) => s.name)));

  // Styles
  files.set("xl/styles.xml", generateStyles(styling));

  // Shared strings
  files.set("xl/sharedStrings.xml", generateSharedStrings(allStrings));

  onProgress?.({
    phase: "generating",
    percentage: 40,
    message: "Building worksheets...",
  });

  // Worksheets
  sheets.forEach((sheet, idx) => {
    const worksheetXml = generateWorksheet(sheet.columns, sheet.data, {
      autoFilter: sheet.autoFilter ?? options.autoFilter,
      freezeHeader: sheet.freezeHeader ?? options.freezeHeader,
      includeTotals: sheet.includeTotals ?? options.includeTotals,
      sharedStrings,
      styling,
    });
    files.set(`xl/worksheets/sheet${idx + 1}.xml`, worksheetXml);
  });

  onProgress?.({
    phase: "formatting",
    percentage: 70,
    message: "Creating XLSX file...",
  });

  // Create ZIP file
  const zipData = await createZip(files);

  const blob = new Blob([new Uint8Array(zipData)], { type: MIME_TYPES.excel });
  const filename = generateFilename(options);

  const totalRows = sheets.reduce((sum, sheet) => sum + sheet.data.length, 0);

  onProgress?.({
    phase: "complete",
    percentage: 100,
    message: "Excel export complete",
  });

  return {
    blob,
    filename,
    mimeType: MIME_TYPES.excel,
    size: blob.size,
    generatedAt: new Date(),
    format: "excel",
    rowCount: totalRows,
  };
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Validate Excel export options
 */
export function validateExcelOptions<T>(
  options: Partial<ExcelExportOptions<T>>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!options.columns || options.columns.length === 0) {
    if (!options.sheets || options.sheets.length === 0) {
      errors.push("At least one column definition or sheet is required");
    }
  }

  if (!options.data && !options.sheets) {
    errors.push("Data array or sheets configuration is required");
  }

  if (options.sheets) {
    options.sheets.forEach((sheet, idx) => {
      if (!sheet.name) {
        errors.push(`Sheet ${idx + 1} requires a name`);
      }
      if (sheet.name && sheet.name.length > MAX_SHEET_NAME_LENGTH) {
        errors.push(
          `Sheet name "${sheet.name}" exceeds ${MAX_SHEET_NAME_LENGTH} characters`
        );
      }
      if (!sheet.columns || sheet.columns.length === 0) {
        errors.push(`Sheet "${sheet.name}" requires at least one column`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Create default Excel options with sensible defaults
 */
export function createExcelOptions<T>(
  overrides: Partial<ExcelExportOptions<T>>
): ExcelExportOptions<T> {
  return {
    title: "Export",
    columns: [] as unknown as readonly ExportColumn<T>[],
    data: [] as unknown as readonly T[],
    autoFilter: true,
    freezeHeader: true,
    includeTotals: false,
    includeFormulas: true,
    includeTimestamp: true,
    styling: DEFAULT_EXPORT_CONFIG.defaultExcelStyling,
    ...overrides,
  };
}
