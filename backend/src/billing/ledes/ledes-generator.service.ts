import { Injectable, Logger } from '@nestjs/common';
import { LEDESValidatorService } from './ledes-validator.service';

/**
 * LEDES Generator Service
 * Generates LEDES 1998B and LEDES 2000 format files for e-billing
 */

export enum LEDESFormat {
  LEDES_1998B = 'LEDES_1998B',
  LEDES_2000 = 'LEDES_2000',
}

export interface LEDESRecord {
  // LEDES 1998B Fields (26 fields)
  invoiceNumber: string;
  invoiceDate: string; // YYYYMMDD
  invoiceDescription: string;
  lineItemNumber: number;
  expenseDate: string; // YYYYMMDD
  expenseDescription: string;
  timeKeeperID: string;
  timeKeeperName: string;
  timeKeeperClassification: string;
  hoursWorked?: number;
  hourlyRate?: number;
  lineItemTotal: number;
  expenseAmount?: number;
  clientMatterNumber: string;
  lawFirmMatterNumber: string;
  billingCode: string;
  activityCode: string;
  taskCode: string;
  expenseCode?: string;
  utbmsCode?: string; // Uniform Task-Based Management System
  lineItemAdjustmentAmount?: number;
  lineItemAdjustmentReason?: string;
  unit?: string;
  quantity?: number;
  unitCost?: number;
  discount?: number;
  metadata?: Record<string, any>;
}

export interface LEDES2000Record extends LEDESRecord {
  // Additional LEDES 2000 fields
  lawFirmName: string;
  lawFirmAddress: string;
  clientID: string;
  clientName: string;
  invoiceTotalAmount: number;
  invoiceDueDate: string;
  invoicePeriodStart: string;
  invoicePeriodEnd: string;
  currency: string;
  taxAmount?: number;
  previousBalance?: number;
  paymentsReceived?: number;
  currentAmountDue?: number;
}

export interface LEDESGenerationOptions {
  format: LEDESFormat;
  includeHeader: boolean;
  delimiter: string;
  dateFormat: string;
  currencyPrecision: number;
  validate: boolean;
  includeMetadata: boolean;
}

@Injectable()
export class LEDESGeneratorService {
  private readonly logger = new Logger(LEDESGeneratorService.name);

  // LEDES 1998B field order (26 fields)
  private readonly LEDES_1998B_FIELDS = [
    'INVOICE_NUMBER',
    'CLIENT_MATTER_NUMBER',
    'LAW_FIRM_MATTER_NUMBER',
    'INVOICE_DATE',
    'INVOICE_DESCRIPTION',
    'LINE_ITEM_NUMBER',
    'EXP/FEE/INV_ADJ_DATE',
    'EXP/FEE/INV_ADJ_DESCRIPTION',
    'TIMEKEEPER_ID',
    'TIMEKEEPER_NAME',
    'TIMEKEEPER_CLASSIFICATION',
    'HOURS_WORKED',
    'HOURLY_RATE',
    'LINE_ITEM_NUMBER_OF_UNITS',
    'LINE_ITEM_UNIT_COST',
    'LINE_ITEM_ADJUSTMENT_AMOUNT',
    'LINE_ITEM_TOTAL',
    'LINE_ITEM_TASK_CODE',
    'LINE_ITEM_EXPENSE_CODE',
    'LINE_ITEM_ACTIVITY_CODE',
    'LINE_ITEM_ADJUSTMENT_REASON',
    'LAW_FIRM_ID',
    'LINE_ITEM_TAX_AMOUNT',
    'CLIENT_ID',
    'LAW_FIRM_NAME',
    'BILLING_AMOUNT',
  ];

  constructor(private readonly validatorService: LEDESValidatorService) {}

  /**
   * Generate LEDES file from records
   */
  async generateLEDESFile(
    records: LEDESRecord[],
    options: Partial<LEDESGenerationOptions> = {},
  ): Promise<string> {
    const opts: LEDESGenerationOptions = {
      format: options.format || LEDESFormat.LEDES_1998B,
      includeHeader: options.includeHeader !== false,
      delimiter: options.delimiter || '|',
      dateFormat: options.dateFormat || 'YYYYMMDD',
      currencyPrecision: options.currencyPrecision || 2,
      validate: options.validate !== false,
      includeMetadata: options.includeMetadata || false,
    };

    this.logger.log(`Generating ${opts.format} file with ${records.length} records`);

    let ledesContent = '';

    // Add header if requested
    if (opts.includeHeader) {
      ledesContent += this.generateHeader(opts) + '\n';
    }

    // Generate records
    for (const record of records) {
      const line = opts.format === LEDESFormat.LEDES_1998B
        ? this.generate1998BRecord(record, opts)
        : this.generate2000Record(record as LEDES2000Record, opts);

      // Validate if requested
      if (opts.validate) {
        const validation = await this.validatorService.validateRecord(line, opts.format);
        if (!validation.isValid) {
          this.logger.warn(`Validation warnings for record ${record.lineItemNumber}: ${validation.errors.join(', ')}`);
        }
      }

      ledesContent += line + '\n';
    }

    this.logger.log(`Generated LEDES file with ${records.length} records`);
    return ledesContent;
  }

  /**
   * Generate LEDES 1998B header
   */
  private generateHeader(options: LEDESGenerationOptions): string {
    if (options.format === LEDESFormat.LEDES_1998B) {
      return this.LEDES_1998B_FIELDS.join(options.delimiter);
    } else {
      // LEDES 2000 has additional fields
      return [...this.LEDES_1998B_FIELDS, 'CURRENCY', 'TAX_AMOUNT', 'PREVIOUS_BALANCE', 'PAYMENTS_RECEIVED']
        .join(options.delimiter);
    }
  }

  /**
   * Generate LEDES 1998B record
   */
  private generate1998BRecord(record: LEDESRecord, options: LEDESGenerationOptions): string {
    const fields = [
      this.escapeField(record.invoiceNumber),
      this.escapeField(record.clientMatterNumber),
      this.escapeField(record.lawFirmMatterNumber),
      this.formatDate(record.invoiceDate),
      this.escapeField(record.invoiceDescription),
      record.lineItemNumber.toString(),
      this.formatDate(record.expenseDate),
      this.escapeField(record.expenseDescription),
      this.escapeField(record.timeKeeperID),
      this.escapeField(record.timeKeeperName),
      this.escapeField(record.timeKeeperClassification),
      this.formatNumber(record.hoursWorked, 2),
      this.formatCurrency(record.hourlyRate, options.currencyPrecision),
      this.formatNumber(record.quantity, 2),
      this.formatCurrency(record.unitCost, options.currencyPrecision),
      this.formatCurrency(record.lineItemAdjustmentAmount, options.currencyPrecision),
      this.formatCurrency(record.lineItemTotal, options.currencyPrecision),
      this.escapeField(record.taskCode),
      this.escapeField(record.expenseCode),
      this.escapeField(record.activityCode),
      this.escapeField(record.lineItemAdjustmentReason),
      '', // LAW_FIRM_ID - typically empty in 1998B
      '', // LINE_ITEM_TAX_AMOUNT
      '', // CLIENT_ID
      '', // LAW_FIRM_NAME
      this.formatCurrency(record.lineItemTotal, options.currencyPrecision), // BILLING_AMOUNT
    ];

    return fields.join(options.delimiter);
  }

  /**
   * Generate LEDES 2000 record
   */
  private generate2000Record(record: LEDES2000Record, options: LEDESGenerationOptions): string {
    // Start with 1998B fields
    const baseFields = this.generate1998BRecord(record, options);

    // Add LEDES 2000 specific fields
    const additionalFields = [
      this.escapeField(record.currency || 'USD'),
      this.formatCurrency(record.taxAmount, options.currencyPrecision),
      this.formatCurrency(record.previousBalance, options.currencyPrecision),
      this.formatCurrency(record.paymentsReceived, options.currencyPrecision),
      this.formatCurrency(record.currentAmountDue, options.currencyPrecision),
      this.escapeField(record.lawFirmName),
      this.escapeField(record.lawFirmAddress),
      this.escapeField(record.clientID),
      this.escapeField(record.clientName),
    ];

    return baseFields + options.delimiter + additionalFields.join(options.delimiter);
  }

  /**
   * Generate LEDES from invoice data
   */
  async generateFromInvoice(
    invoiceId: string,
    format: LEDESFormat = LEDESFormat.LEDES_1998B,
  ): Promise<string> {
    this.logger.log(`Generating LEDES for invoice ${invoiceId}`);

    // Fetch invoice data (mock implementation)
    const invoiceData = await this.fetchInvoiceData(invoiceId);

    // Convert to LEDES records
    const records = this.convertInvoiceToLEDES(invoiceData, format);

    // Generate file
    return this.generateLEDESFile(records, { format });
  }

  /**
   * Convert invoice data to LEDES records
   */
  private convertInvoiceToLEDES(invoiceData: any, format: LEDESFormat): LEDESRecord[] {
    const records: LEDESRecord[] = [];
    let lineNumber = 1;

    // Convert time entries
    if (invoiceData.timeEntries) {
      for (const entry of invoiceData.timeEntries) {
        records.push({
          invoiceNumber: invoiceData.invoiceNumber,
          invoiceDate: this.formatDateToLEDES(invoiceData.invoiceDate),
          invoiceDescription: invoiceData.description || '',
          lineItemNumber: lineNumber++,
          expenseDate: this.formatDateToLEDES(entry.date),
          expenseDescription: entry.description,
          timeKeeperID: entry.timekeeperId,
          timeKeeperName: entry.timekeeperName,
          timeKeeperClassification: entry.classification || 'PARTNER',
          hoursWorked: entry.hours,
          hourlyRate: entry.rate,
          lineItemTotal: entry.hours * entry.rate,
          clientMatterNumber: invoiceData.clientMatterNumber,
          lawFirmMatterNumber: invoiceData.lawFirmMatterNumber,
          billingCode: entry.billingCode || '',
          activityCode: entry.activityCode || '',
          taskCode: entry.taskCode || entry.utbmsCode || '',
          utbmsCode: entry.utbmsCode,
        });
      }
    }

    // Convert expenses
    if (invoiceData.expenses) {
      for (const expense of invoiceData.expenses) {
        records.push({
          invoiceNumber: invoiceData.invoiceNumber,
          invoiceDate: this.formatDateToLEDES(invoiceData.invoiceDate),
          invoiceDescription: invoiceData.description || '',
          lineItemNumber: lineNumber++,
          expenseDate: this.formatDateToLEDES(expense.date),
          expenseDescription: expense.description,
          timeKeeperID: expense.submittedBy || '',
          timeKeeperName: expense.submittedByName || '',
          timeKeeperClassification: '',
          expenseAmount: expense.amount,
          lineItemTotal: expense.amount,
          clientMatterNumber: invoiceData.clientMatterNumber,
          lawFirmMatterNumber: invoiceData.lawFirmMatterNumber,
          billingCode: '',
          activityCode: '',
          taskCode: '',
          expenseCode: expense.expenseCode || '',
          quantity: expense.quantity || 1,
          unitCost: expense.unitCost || expense.amount,
        });
      }
    }

    return records;
  }

  /**
   * Generate LEDES summary report
   */
  async generateSummaryReport(records: LEDESRecord[]): Promise<any> {
    const summary = {
      totalRecords: records.length,
      totalFees: 0,
      totalExpenses: 0,
      totalHours: 0,
      uniqueTimekeepers: new Set<string>(),
      taskCodeBreakdown: {} as Record<string, number>,
      expenseCodeBreakdown: {} as Record<string, number>,
      dateRange: {
        start: '',
        end: '',
      },
    };

    for (const record of records) {
      summary.totalFees += record.lineItemTotal || 0;
      summary.totalHours += record.hoursWorked || 0;

      if (record.timeKeeperID) {
        summary.uniqueTimekeepers.add(record.timeKeeperID);
      }

      if (record.taskCode) {
        summary.taskCodeBreakdown[record.taskCode] =
          (summary.taskCodeBreakdown[record.taskCode] || 0) + (record.lineItemTotal || 0);
      }

      if (record.expenseCode) {
        summary.expenseCodeBreakdown[record.expenseCode] =
          (summary.expenseCodeBreakdown[record.expenseCode] || 0) + (record.expenseAmount || 0);
        summary.totalExpenses += record.expenseAmount || 0;
      }

      // Track date range
      if (!summary.dateRange.start || record.expenseDate < summary.dateRange.start) {
        summary.dateRange.start = record.expenseDate;
      }
      if (!summary.dateRange.end || record.expenseDate > summary.dateRange.end) {
        summary.dateRange.end = record.expenseDate;
      }
    }

    return {
      ...summary,
      uniqueTimekeepers: summary.uniqueTimekeepers.size,
      totalAmount: summary.totalFees + summary.totalExpenses,
    };
  }

  /**
   * Batch generate LEDES for multiple invoices
   */
  async batchGenerateLEDES(
    invoiceIds: string[],
    format: LEDESFormat = LEDESFormat.LEDES_1998B,
  ): Promise<Map<string, string>> {
    this.logger.log(`Batch generating LEDES for ${invoiceIds.length} invoices`);

    const results = new Map<string, string>();

    for (const invoiceId of invoiceIds) {
      try {
        const ledesContent = await this.generateFromInvoice(invoiceId, format);
        results.set(invoiceId, ledesContent);
      } catch (error) {
        this.logger.error(`Failed to generate LEDES for invoice ${invoiceId}: ${error.message}`);
        results.set(invoiceId, `ERROR: ${error.message}`);
      }
    }

    return results;
  }

  /**
   * Helper methods
   */
  private escapeField(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }
    return String(value).replace(/[|"]/g, ''); // Remove delimiter and quotes
  }

  private formatDate(date: string): string {
    // Ensure date is in YYYYMMDD format
    return date.replace(/[-/]/g, '');
  }

  private formatDateToLEDES(date: Date | string): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  private formatNumber(value: number | undefined, decimals: number): string {
    if (value === null || value === undefined) {
      return '';
    }
    return value.toFixed(decimals);
  }

  private formatCurrency(value: number | undefined, decimals: number): string {
    if (value === null || value === undefined) {
      return '0.00';
    }
    return value.toFixed(decimals);
  }

  private async fetchInvoiceData(invoiceId: string): Promise<any> {
    // Mock implementation - would fetch from database
    return {
      invoiceNumber: 'INV-2024-001',
      invoiceDate: new Date(),
      description: 'Legal Services - January 2024',
      clientMatterNumber: 'CLI-001-MAT-001',
      lawFirmMatterNumber: 'LF-2024-001',
      timeEntries: [],
      expenses: [],
    };
  }
}
