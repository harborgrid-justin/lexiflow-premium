import { Injectable, Logger } from '@nestjs/common';
import { LEDESFormat } from './ledes-generator.service';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fieldErrors: Map<string, string[]>;
  recordNumber?: number;
}

export interface ValidationRule {
  field: string;
  rule: (value: any, record?: any) => boolean;
  errorMessage: string;
  severity: 'error' | 'warning';
}

@Injectable()
export class LEDESValidatorService {
  private readonly logger = new Logger(LEDESValidatorService.name);

  // LEDES 1998B field count
  private readonly LEDES_1998B_FIELD_COUNT = 26;
  private readonly LEDES_2000_FIELD_COUNT = 35;

  // Validation rules for LEDES 1998B
  private readonly LEDES_1998B_RULES: ValidationRule[] = [
    {
      field: 'INVOICE_NUMBER',
      rule: (value) => !!value && value.length > 0,
      errorMessage: 'Invoice number is required',
      severity: 'error',
    },
    {
      field: 'CLIENT_MATTER_NUMBER',
      rule: (value) => !!value && value.length > 0,
      errorMessage: 'Client matter number is required',
      severity: 'error',
    },
    {
      field: 'INVOICE_DATE',
      rule: (value) => this.isValidLEDESDate(value),
      errorMessage: 'Invoice date must be in YYYYMMDD format',
      severity: 'error',
    },
    {
      field: 'LINE_ITEM_NUMBER',
      rule: (value) => !isNaN(Number(value)) && Number(value) > 0,
      errorMessage: 'Line item number must be a positive integer',
      severity: 'error',
    },
    {
      field: 'EXP/FEE/INV_ADJ_DATE',
      rule: (value) => this.isValidLEDESDate(value),
      errorMessage: 'Expense/fee date must be in YYYYMMDD format',
      severity: 'error',
    },
    {
      field: 'HOURS_WORKED',
      rule: (value, record) => {
        if (!value || value === '') return true; // Optional for expenses
        const hours = Number(value);
        return !isNaN(hours) && hours >= 0 && hours <= 24;
      },
      errorMessage: 'Hours worked must be between 0 and 24',
      severity: 'warning',
    },
    {
      field: 'HOURLY_RATE',
      rule: (value, record) => {
        if (!value || value === '') return true; // Optional for expenses
        const rate = Number(value);
        return !isNaN(rate) && rate >= 0;
      },
      errorMessage: 'Hourly rate must be a non-negative number',
      severity: 'error',
    },
    {
      field: 'LINE_ITEM_TOTAL',
      rule: (value) => {
        const total = Number(value);
        return !isNaN(total) && total !== null && total !== undefined;
      },
      errorMessage: 'Line item total is required and must be a valid number',
      severity: 'error',
    },
    {
      field: 'TIMEKEEPER_ID',
      rule: (value, record) => {
        // Required for time entries (when hours worked is present)
        const hoursWorked = record?.split('|')[11];
        if (hoursWorked && Number(hoursWorked) > 0) {
          return !!value && value.length > 0;
        }
        return true;
      },
      errorMessage: 'Timekeeper ID is required for time entries',
      severity: 'error',
    },
    {
      field: 'LINE_ITEM_TASK_CODE',
      rule: (value) => {
        if (!value || value === '') return true;
        return this.isValidUTBMSCode(value);
      },
      errorMessage: 'Invalid UTBMS task code format',
      severity: 'warning',
    },
  ];

  /**
   * Validate a complete LEDES file
   */
  async validateFile(
    fileContent: string,
    format: LEDESFormat = LEDESFormat.LEDES_1998B,
  ): Promise<ValidationResult> {
    this.logger.log(`Validating LEDES file (${format})`);

    const lines = fileContent.trim().split('\n');
    const errors: string[] = [];
    const warnings: string[] = [];
    const fieldErrors = new Map<string, string[]>();

    if (lines.length === 0) {
      errors.push('File is empty');
      return {
        isValid: false,
        errors,
        warnings,
        fieldErrors,
      };
    }

    // Check if first line is header
    let startIndex = 0;
    if (this.isHeaderLine(lines[0])) {
      startIndex = 1;
    }

    // Validate each record
    for (let i = startIndex; i < lines.length; i++) {
      const lineNumber = i + 1;
      const line = lines[i].trim();

      if (!line) continue; // Skip empty lines

      const result = await this.validateRecord(line, format, lineNumber);

      if (!result.isValid) {
        errors.push(...result.errors.map(e => `Line ${lineNumber}: ${e}`));
      }

      warnings.push(...result.warnings.map(w => `Line ${lineNumber}: ${w}`));

      // Merge field errors
      result.fieldErrors.forEach((errs, field) => {
        const existing = fieldErrors.get(field) || [];
        fieldErrors.set(field, [...existing, ...errs]);
      });
    }

    const isValid = errors.length === 0;

    this.logger.log(
      `Validation complete: ${isValid ? 'PASSED' : 'FAILED'} ` +
      `(${errors.length} errors, ${warnings.length} warnings)`,
    );

    return {
      isValid,
      errors,
      warnings,
      fieldErrors,
    };
  }

  /**
   * Validate a single LEDES record
   */
  async validateRecord(
    record: string,
    format: LEDESFormat = LEDESFormat.LEDES_1998B,
    recordNumber?: number,
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const fieldErrors = new Map<string, string[]>();

    // Check field count
    const fields = record.split('|');
    const expectedFieldCount = format === LEDESFormat.LEDES_1998B
      ? this.LEDES_1998B_FIELD_COUNT
      : this.LEDES_2000_FIELD_COUNT;

    if (fields.length !== expectedFieldCount) {
      errors.push(
        `Invalid field count: expected ${expectedFieldCount}, got ${fields.length}`,
      );
    }

    // Apply validation rules
    for (const rule of this.LEDES_1998B_RULES) {
      const fieldIndex = this.getFieldIndex(rule.field, format);
      if (fieldIndex === -1) continue;

      const fieldValue = fields[fieldIndex];
      const isValid = rule.rule(fieldValue, record);

      if (!isValid) {
        const errorList = fieldErrors.get(rule.field) || [];
        errorList.push(rule.errorMessage);
        fieldErrors.set(rule.field, errorList);

        if (rule.severity === 'error') {
          errors.push(`${rule.field}: ${rule.errorMessage}`);
        } else {
          warnings.push(`${rule.field}: ${rule.errorMessage}`);
        }
      }
    }

    // Cross-field validations
    const crossFieldValidation = this.validateCrossFields(fields, format);
    errors.push(...crossFieldValidation.errors);
    warnings.push(...crossFieldValidation.warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      fieldErrors,
      recordNumber,
    };
  }

  /**
   * Validate cross-field relationships
   */
  private validateCrossFields(
    fields: string[],
    format: LEDESFormat,
  ): { errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // For time entries: hours * rate should equal line item total (with tolerance)
    const hoursWorked = Number(fields[11]);
    const hourlyRate = Number(fields[12]);
    const lineItemTotal = Number(fields[16]);

    if (hoursWorked && hourlyRate && lineItemTotal) {
      const expectedTotal = hoursWorked * hourlyRate;
      const tolerance = 0.01; // $0.01 tolerance for rounding

      if (Math.abs(expectedTotal - lineItemTotal) > tolerance) {
        warnings.push(
          `Line item total mismatch: ${hoursWorked} hours × $${hourlyRate} = ` +
          `$${expectedTotal.toFixed(2)}, but total is $${lineItemTotal.toFixed(2)}`,
        );
      }
    }

    // Expense date should not be after invoice date
    const invoiceDate = fields[3];
    const expenseDate = fields[6];

    if (invoiceDate && expenseDate) {
      if (expenseDate > invoiceDate) {
        warnings.push(
          `Expense date (${expenseDate}) is after invoice date (${invoiceDate})`,
        );
      }
    }

    // For expenses: quantity * unit cost should equal line item total
    const quantity = Number(fields[13]);
    const unitCost = Number(fields[14]);

    if (quantity && unitCost && lineItemTotal && !hoursWorked) {
      const expectedTotal = quantity * unitCost;
      const tolerance = 0.01;

      if (Math.abs(expectedTotal - lineItemTotal) > tolerance) {
        warnings.push(
          `Expense total mismatch: ${quantity} × $${unitCost} = ` +
          `$${expectedTotal.toFixed(2)}, but total is $${lineItemTotal.toFixed(2)}`,
        );
      }
    }

    return { errors, warnings };
  }

  /**
   * Check if line is a header
   */
  private isHeaderLine(line: string): boolean {
    const upperLine = line.toUpperCase();
    return (
      upperLine.includes('INVOICE_NUMBER') ||
      upperLine.includes('CLIENT_MATTER_NUMBER') ||
      upperLine.includes('TIMEKEEPER')
    );
  }

  /**
   * Validate LEDES date format (YYYYMMDD)
   */
  private isValidLEDESDate(dateStr: string): boolean {
    if (!dateStr || dateStr.length !== 8) {
      return false;
    }

    const year = parseInt(dateStr.substring(0, 4), 10);
    const month = parseInt(dateStr.substring(4, 6), 10);
    const day = parseInt(dateStr.substring(6, 8), 10);

    // Check if valid date
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      return false;
    }

    if (year < 1900 || year > 2100) {
      return false;
    }

    if (month < 1 || month > 12) {
      return false;
    }

    if (day < 1 || day > 31) {
      return false;
    }

    // Check if date is valid (e.g., not Feb 30)
    const date = new Date(year, month - 1, day);
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }

  /**
   * Validate UTBMS (Uniform Task-Based Management System) code
   */
  private isValidUTBMSCode(code: string): boolean {
    if (!code) return false;

    // UTBMS codes are typically in format: L110 (Letter + 3 digits)
    // or A101 for activities
    const utbmsPattern = /^[A-Z]\d{3}$/;
    return utbmsPattern.test(code);
  }

  /**
   * Get field index for a given field name
   */
  private getFieldIndex(fieldName: string, format: LEDESFormat): number {
    const fieldMap1998B: Record<string, number> = {
      'INVOICE_NUMBER': 0,
      'CLIENT_MATTER_NUMBER': 1,
      'LAW_FIRM_MATTER_NUMBER': 2,
      'INVOICE_DATE': 3,
      'INVOICE_DESCRIPTION': 4,
      'LINE_ITEM_NUMBER': 5,
      'EXP/FEE/INV_ADJ_DATE': 6,
      'EXP/FEE/INV_ADJ_DESCRIPTION': 7,
      'TIMEKEEPER_ID': 8,
      'TIMEKEEPER_NAME': 9,
      'TIMEKEEPER_CLASSIFICATION': 10,
      'HOURS_WORKED': 11,
      'HOURLY_RATE': 12,
      'LINE_ITEM_NUMBER_OF_UNITS': 13,
      'LINE_ITEM_UNIT_COST': 14,
      'LINE_ITEM_ADJUSTMENT_AMOUNT': 15,
      'LINE_ITEM_TOTAL': 16,
      'LINE_ITEM_TASK_CODE': 17,
      'LINE_ITEM_EXPENSE_CODE': 18,
      'LINE_ITEM_ACTIVITY_CODE': 19,
      'LINE_ITEM_ADJUSTMENT_REASON': 20,
    };

    return fieldMap1998B[fieldName] ?? -1;
  }

  /**
   * Validate LEDES file structure
   */
  async validateFileStructure(fileContent: string): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const fieldErrors = new Map<string, string[]>();

    const lines = fileContent.trim().split('\n');

    // Check for minimum content
    if (lines.length < 2) {
      errors.push('File must contain at least a header and one record');
    }

    // Check for consistent delimiter
    const delimiter = this.detectDelimiter(fileContent);
    if (!delimiter) {
      errors.push('Unable to detect delimiter (expected | or ,)');
    } else {
      // Check all lines have same field count
      const fieldCounts = new Set<number>();
      lines.forEach((line, index) => {
        if (line.trim()) {
          fieldCounts.add(line.split(delimiter).length);
        }
      });

      if (fieldCounts.size > 1) {
        warnings.push(
          `Inconsistent field counts detected: ${Array.from(fieldCounts).join(', ')}`,
        );
      }
    }

    // Check file encoding
    if (fileContent.includes('\uFFFD')) {
      warnings.push('File may have encoding issues (replacement characters detected)');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      fieldErrors,
    };
  }

  /**
   * Detect delimiter used in file
   */
  private detectDelimiter(fileContent: string): string | null {
    const firstLine = fileContent.split('\n')[0];

    if (firstLine.includes('|')) {
      return '|';
    } else if (firstLine.includes(',')) {
      return ',';
    } else if (firstLine.includes('\t')) {
      return '\t';
    }

    return null;
  }

  /**
   * Generate validation report
   */
  async generateValidationReport(
    validationResult: ValidationResult,
    fileName: string,
  ): Promise<string> {
    let report = `LEDES Validation Report\n`;
    report += `File: ${fileName}\n`;
    report += `Date: ${new Date().toISOString()}\n`;
    report += `\n`;
    report += `Status: ${validationResult.isValid ? 'PASSED ✓' : 'FAILED ✗'}\n`;
    report += `Errors: ${validationResult.errors.length}\n`;
    report += `Warnings: ${validationResult.warnings.length}\n`;
    report += `\n`;

    if (validationResult.errors.length > 0) {
      report += `ERRORS:\n`;
      validationResult.errors.forEach((error, index) => {
        report += `  ${index + 1}. ${error}\n`;
      });
      report += `\n`;
    }

    if (validationResult.warnings.length > 0) {
      report += `WARNINGS:\n`;
      validationResult.warnings.forEach((warning, index) => {
        report += `  ${index + 1}. ${warning}\n`;
      });
      report += `\n`;
    }

    if (validationResult.fieldErrors.size > 0) {
      report += `FIELD-SPECIFIC ERRORS:\n`;
      validationResult.fieldErrors.forEach((errors, field) => {
        report += `  ${field}:\n`;
        errors.forEach(error => {
          report += `    - ${error}\n`;
        });
      });
    }

    return report;
  }

  /**
   * Quick validation check (basic structural check only)
   */
  async quickValidate(fileContent: string): Promise<boolean> {
    const lines = fileContent.trim().split('\n');
    if (lines.length < 2) return false;

    const delimiter = this.detectDelimiter(fileContent);
    if (!delimiter) return false;

    // Check first data line has minimum required fields
    const dataLine = this.isHeaderLine(lines[0]) ? lines[1] : lines[0];
    const fields = dataLine.split(delimiter);

    return fields.length >= 17; // Minimum fields for basic LEDES
  }
}
