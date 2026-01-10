/**
 * CSV Generator
 * @module lib/export/csv-generator
 *
 * Generates CSV (Comma-Separated Values) files with proper escaping,
 * encoding support, and configurable formatting options.
 */

import {
  type ColumnDataType,
  type CSVExportOptions,
  type ExportColumn,
  type ExportProgressCallback,
  type ExportResult,
  FILE_EXTENSIONS,
  MIME_TYPES,
} from "./types";

// =============================================================================
// Constants
// =============================================================================

/** UTF-8 BOM bytes for Excel compatibility */
const UTF8_BOM = "\ufeff";

/** Characters that require quoting in CSV - UNUSED */
// const SPECIAL_CHARS_PATTERN = /[",\n\r]/;

// =============================================================================
// Value Formatting
// =============================================================================

/**
 * Format a value based on its data type
 *
 * @param value - The value to format
 * @param dataType - The data type for formatting
 * @param nullValue - Value to use for null/undefined
 * @returns Formatted string representation
 */
function formatValue(
  value: unknown,
  dataType: ColumnDataType = "string",
  nullValue: string = ""
): string {
  if (value === null || value === undefined) {
    return nullValue;
  }

  switch (dataType) {
    case "number":
      return typeof value === "number" ? value.toString() : String(value);

    case "currency":
      if (typeof value === "number") {
        // Format as number without currency symbol for CSV (easier for parsing)
        return value.toFixed(2);
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
      if (typeof value === "boolean") {
        return value ? "Yes" : "No";
      }
      return String(value);

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

// =============================================================================
// CSV Escaping
// =============================================================================

/**
 * Options needed for CSV escaping
 */
interface CSVEscapeOptions {
  readonly quoteChar?: '"' | "'";
  readonly escapeChar?: '"' | "\\";
  readonly delimiter?: string;
  readonly quoteAll?: boolean;
}

/**
 * Escape a CSV field value
 *
 * @param value - The string value to escape
 * @param options - CSV export options
 * @returns Properly escaped CSV field
 */
function escapeCSVField(value: string, options: CSVEscapeOptions): string {
  const quoteChar = options.quoteChar ?? '"';
  const escapeChar = options.escapeChar ?? '"';
  const delimiter = options.delimiter ?? ",";

  // Check if quoting is needed
  const needsQuoting =
    options.quoteAll ||
    value.includes(quoteChar) ||
    value.includes(delimiter) ||
    value.includes("\n") ||
    value.includes("\r");

  if (!needsQuoting) {
    return value;
  }

  // Escape quote characters within the value
  const escapedValue = value.replace(
    new RegExp(quoteChar, "g"),
    escapeChar + quoteChar
  );

  return `${quoteChar}${escapedValue}${quoteChar}`;
}

// =============================================================================
// Value Extraction
// =============================================================================

/**
 * Extract value from a data row using column accessor
 *
 * @param row - The data row
 * @param column - The column definition
 * @returns Extracted value
 */
function extractValue<T>(row: T, column: ExportColumn<T>): unknown {
  if (typeof column.accessor === "function") {
    return column.accessor(row);
  }
  return row[column.accessor as keyof T];
}

/**
 * Get formatted cell value
 *
 * @param row - The data row
 * @param column - The column definition
 * @param options - CSV export options
 * @returns Formatted string value
 */
function getCellValue<T>(
  row: T,
  column: ExportColumn<T>,
  options: CSVExportOptions<T>
): string {
  const rawValue = extractValue(row, column);

  // Use custom formatter if provided
  if (column.formatter) {
    return column.formatter(rawValue, row);
  }

  return formatValue(rawValue, column.dataType, options.nullValue ?? "");
}

// =============================================================================
// CSV Generation
// =============================================================================

/**
 * Generate CSV content from data
 *
 * @param options - CSV export options
 * @param onProgress - Optional progress callback
 * @returns CSV content as string
 */
function generateCSVContent<T>(
  options: CSVExportOptions<T>,
  onProgress?: ExportProgressCallback
): string {
  const {
    columns,
    data,
    delimiter = ",",
    lineEnding = "\n",
    includeBOM = true,
    includeHeaders = true,
    encoding = "utf-8",
  } = options;

  // Filter out hidden columns
  const visibleColumns = columns.filter((col) => !col.hidden);

  const lines: string[] = [];
  const totalRows = data.length + (includeHeaders ? 1 : 0);
  let processedRows = 0;

  // Report initial progress
  onProgress?.({
    phase: "preparing",
    percentage: 0,
    totalRows: data.length,
    message: "Preparing CSV export...",
  });

  // Generate header row
  if (includeHeaders) {
    const headerRow = visibleColumns
      .map((col) => escapeCSVField(col.header, options))
      .join(delimiter);
    lines.push(headerRow);
    processedRows++;

    onProgress?.({
      phase: "generating",
      percentage: Math.round((processedRows / totalRows) * 100),
      currentRow: 0,
      totalRows: data.length,
      message: "Generated headers",
    });
  }

  // Generate data rows
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowValues = visibleColumns
      .map((col) => {
        const value = getCellValue(row, col, options);
        return escapeCSVField(value, options);
      })
      .join(delimiter);

    lines.push(rowValues);
    processedRows++;

    // Report progress every 100 rows or at completion
    if (i % 100 === 0 || i === data.length - 1) {
      onProgress?.({
        phase: "generating",
        percentage: Math.round((processedRows / totalRows) * 100),
        currentRow: i + 1,
        totalRows: data.length,
        message: `Processing row ${i + 1} of ${data.length}`,
      });
    }
  }

  // Combine lines with line ending
  let content = lines.join(lineEnding);

  // Add BOM for Excel compatibility if requested
  if (includeBOM || encoding === "utf-8-bom") {
    content = UTF8_BOM + content;
  }

  onProgress?.({
    phase: "complete",
    percentage: 100,
    currentRow: data.length,
    totalRows: data.length,
    message: "CSV generation complete",
  });

  return content;
}

// =============================================================================
// Filename Generation
// =============================================================================

/**
 * Generate filename with date suffix
 *
 * @param options - CSV export options
 * @returns Generated filename with extension
 */
function generateFilename<T>(options: CSVExportOptions<T>): string {
  const baseName = options.filename ?? options.title ?? "export";
  const sanitizedName = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const now = new Date();
  const dateSuffix = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;

  return `${sanitizedName}-${dateSuffix}${FILE_EXTENSIONS.csv}`;
}

// =============================================================================
// Main Export Function
// =============================================================================

/**
 * Export data to CSV format
 *
 * @param options - CSV export options including data and column definitions
 * @param onProgress - Optional callback for progress updates
 * @returns Promise resolving to ExportResult with blob, filename, and metadata
 *
 * @example
 * ```typescript
 * const result = await exportToCSV({
 *   title: 'Time Entries Report',
 *   columns: [
 *     { header: 'Date', accessor: 'date', dataType: 'date' },
 *     { header: 'Description', accessor: 'description' },
 *     { header: 'Hours', accessor: 'duration', dataType: 'number' },
 *     { header: 'Amount', accessor: 'total', dataType: 'currency' },
 *   ],
 *   data: timeEntries,
 *   delimiter: ',',
 *   includeBOM: true,
 * });
 *
 * // Trigger download
 * downloadBlob(result.blob, result.filename);
 * ```
 */
export async function exportToCSV<T>(
  options: CSVExportOptions<T>,
  onProgress?: ExportProgressCallback
): Promise<ExportResult> {
  // Validate input
  if (!options.columns || options.columns.length === 0) {
    throw new Error("CSV export requires at least one column definition");
  }

  if (!options.data) {
    throw new Error("CSV export requires data array");
  }

  // Generate CSV content
  const content = generateCSVContent(options, onProgress);

  // Create blob with proper encoding
  const blob = new Blob([content], {
    type: `${MIME_TYPES.csv};charset=utf-8`,
  });

  const filename = generateFilename(options);

  return {
    blob,
    filename,
    mimeType: MIME_TYPES.csv,
    size: blob.size,
    generatedAt: new Date(),
    format: "csv",
    rowCount: options.data.length,
  };
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Parse CSV content back to array of objects
 * Useful for testing and round-trip validation
 *
 * @param content - CSV string content
 * @param options - Parsing options
 * @returns Array of parsed objects
 */
export function parseCSV(
  content: string,
  options: { delimiter?: string; hasHeaders?: boolean } = {}
): Record<string, string>[] {
  const { delimiter = ",", hasHeaders = true } = options;

  // Remove BOM if present
  const cleanContent = content.replace(/^\ufeff/, "");

  // Split into lines, handling both \r\n and \n
  const lines = cleanContent.split(/\r?\n/).filter((line) => line.trim());

  if (lines.length === 0) {
    return [];
  }

  // Parse a single row, handling quoted fields
  const parseRow = (row: string): string[] => {
    const fields: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      const nextChar = row[i + 1];

      if (inQuotes) {
        if (char === '"' && nextChar === '"') {
          current += '"';
          i++; // Skip next quote
        } else if (char === '"') {
          inQuotes = false;
        } else {
          current += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === delimiter) {
          fields.push(current);
          current = "";
        } else {
          current += char;
        }
      }
    }

    fields.push(current);
    return fields;
  };

  // Parse headers
  const headers = hasHeaders ? parseRow(lines[0]) : [];
  const dataStartIndex = hasHeaders ? 1 : 0;

  // Parse data rows
  const result: Record<string, string>[] = [];

  for (let i = dataStartIndex; i < lines.length; i++) {
    const values = parseRow(lines[i]);
    const obj: Record<string, string> = {};

    if (hasHeaders) {
      headers.forEach((header, idx) => {
        obj[header] = values[idx] ?? "";
      });
    } else {
      values.forEach((value, idx) => {
        obj[`column_${idx}`] = value;
      });
    }

    result.push(obj);
  }

  return result;
}

/**
 * Validate CSV export options
 *
 * @param options - Options to validate
 * @returns Validation result with errors if any
 */
export function validateCSVOptions<T>(options: Partial<CSVExportOptions<T>>): {
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

  if (options.delimiter && options.delimiter.length !== 1) {
    errors.push("Delimiter must be a single character");
  }

  if (options.quoteChar && options.quoteChar.length !== 1) {
    errors.push("Quote character must be a single character");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Create default CSV options with sensible defaults
 *
 * @param overrides - Options to override defaults
 * @returns Complete CSV options object
 */
export function createCSVOptions<T>(
  overrides: Partial<CSVExportOptions<T>>
): CSVExportOptions<T> {
  return {
    title: "Export",
    columns: [] as unknown as readonly ExportColumn<T>[],
    data: [] as unknown as readonly T[],
    delimiter: ",",
    lineEnding: "\n",
    includeBOM: true,
    encoding: "utf-8",
    quoteAll: false,
    quoteChar: '"',
    escapeChar: '"',
    includeHeaders: true,
    nullValue: "",
    includeTimestamp: true,
    ...overrides,
  };
}
