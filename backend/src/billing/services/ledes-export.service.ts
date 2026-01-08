import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../invoices/entities/invoice.entity';
import { InvoiceItem, InvoiceItemType } from '../invoices/entities/invoice-item.entity';
import { TimeEntry } from '../time-entries/entities/time-entry.entity';
import { Expense } from '../expenses/entities/expense.entity';
import { Case } from '@cases/entities/case.entity';
import { Client } from '@clients/entities/client.entity';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * LEDES (Legal Electronic Data Exchange Standard) Export Service
 *
 * Supports LEDES 1998B and LEDES 98BI formats for electronic billing
 * compliance with corporate legal departments and legal e-billing vendors.
 *
 * LEDES 1998B Format Specification:
 * - Pipe-delimited (|) format
 * - Fixed field order
 * - Specific date formats (YYYYMMDD)
 * - Decimal precision requirements
 * - Required vs. optional fields
 *
 * Standard UTBMS (Uniform Task-Based Management System) codes supported
 */
@Injectable()
export class LedesExportService {
  private readonly logger = new Logger(LedesExportService.name);
  private readonly LEDES_VERSION = '1998B';

  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private readonly invoiceItemRepository: Repository<InvoiceItem>,
    @InjectRepository(TimeEntry)
    private readonly timeEntryRepository: Repository<TimeEntry>,
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    @InjectRepository(Case)
    private readonly caseRepository: Repository<Case>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  /**
   * Export invoice to LEDES 1998B format
   */
  async exportInvoiceToLedes(invoiceId: string): Promise<{ content: string; filename: string }> {
    this.logger.log(`Exporting invoice ${invoiceId} to LEDES format`);

    const invoice = await this.invoiceRepository.findOne({
      where: { id: invoiceId },
      relations: ['client', 'case'],
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice ${invoiceId} not found`);
    }

    const items = await this.invoiceItemRepository.find({
      where: { invoiceId },
      order: { date: 'ASC' },
    });

    const ledesContent = await this.generateLedesContent(invoice, items);
    const filename = `LEDES_${invoice.invoiceNumber}_${this.formatLedesDate(new Date())}.txt`;

    // Store LEDES file reference in invoice
    await this.invoiceRepository.update(invoiceId, {
      pdfUrl: `/invoices/ledes/${filename}`, // Store LEDES file path
    });

    return { content: ledesContent, filename };
  }

  /**
   * Generate LEDES 1998B formatted content
   */
  private async generateLedesContent(invoice: Invoice, items: InvoiceItem[]): Promise<string> {
    const lines: string[] = [];

    // LEDES Header (required)
    lines.push(this.generateLedesHeader());

    // Process each line item
    for (const item of items) {
      const ledesLine = await this.generateLedesLine(invoice, item);
      lines.push(ledesLine);
    }

    return lines.join('\n');
  }

  /**
   * Generate LEDES header line
   * Format: LEDES1998B[Header Fields]
   */
  private generateLedesHeader(): string {
    const headerFields = [
      'INVOICE_DATE',
      'INVOICE_NUMBER',
      'CLIENT_ID',
      'LAW_FIRM_MATTER_ID',
      'BILLING_START_DATE',
      'BILLING_END_DATE',
      'INVOICE_TOTAL',
      'BILLING_CONTACT',
      'LINE_ITEM_NUMBER',
      'EXP/FEE/INV_ADJ_TYPE',
      'LINE_ITEM_DATE',
      'LINE_ITEM_TASK_CODE',
      'LINE_ITEM_EXPENSE_CODE',
      'LINE_ITEM_ACTIVITY_CODE',
      'TIMEKEEPER_ID',
      'LINE_ITEM_DESCRIPTION',
      'LINE_ITEM_UNIT_COST',
      'LINE_ITEM_NUMBER_OF_UNITS',
      'LINE_ITEM_ADJUSTMENT_AMOUNT',
      'LINE_ITEM_TOTAL',
      'LINE_ITEM_TOTAL_WITH_ADJUSTMENTS',
      'LAW_FIRM_ID',
      'CLIENT_MATTER_ID',
    ];

    return `LEDES1998B[${headerFields.join('|')}]`;
  }

  /**
   * Generate LEDES line item
   *
   * LEDES 1998B Format Fields:
   * 1. INVOICE_DATE (YYYYMMDD)
   * 2. INVOICE_NUMBER
   * 3. CLIENT_ID
   * 4. LAW_FIRM_MATTER_ID
   * 5. BILLING_START_DATE (YYYYMMDD)
   * 6. BILLING_END_DATE (YYYYMMDD)
   * 7. INVOICE_TOTAL (decimal)
   * 8. BILLING_CONTACT
   * 9. LINE_ITEM_NUMBER
   * 10. EXP/FEE/INV_ADJ_TYPE (F=Fee, E=Expense, I=Invoice Adjustment)
   * 11. LINE_ITEM_DATE (YYYYMMDD)
   * 12. LINE_ITEM_TASK_CODE (UTBMS code)
   * 13. LINE_ITEM_EXPENSE_CODE
   * 14. LINE_ITEM_ACTIVITY_CODE
   * 15. TIMEKEEPER_ID
   * 16. LINE_ITEM_DESCRIPTION
   * 17. LINE_ITEM_UNIT_COST (hourly rate or unit price)
   * 18. LINE_ITEM_NUMBER_OF_UNITS (hours or quantity)
   * 19. LINE_ITEM_ADJUSTMENT_AMOUNT
   * 20. LINE_ITEM_TOTAL
   * 21. LINE_ITEM_TOTAL_WITH_ADJUSTMENTS
   * 22. LAW_FIRM_ID
   * 23. CLIENT_MATTER_ID
   */
  private async generateLedesLine(invoice: Invoice, item: InvoiceItem): Promise<string> {
    const fields: string[] = [];

    // 1. INVOICE_DATE
    fields.push(this.formatLedesDate(invoice.invoiceDate));

    // 2. INVOICE_NUMBER
    fields.push(this.escapeLedesField(invoice.invoiceNumber || ''));

    // 3. CLIENT_ID
    fields.push(this.escapeLedesField(invoice.clientId || ''));

    // 4. LAW_FIRM_MATTER_ID
    fields.push(this.escapeLedesField(invoice.caseId || ''));

    // 5. BILLING_START_DATE
    fields.push(this.formatLedesDate(invoice.periodStart));

    // 6. BILLING_END_DATE
    fields.push(this.formatLedesDate(invoice.periodEnd));

    // 7. INVOICE_TOTAL
    fields.push(this.formatLedesAmount(invoice.totalAmount));

    // 8. BILLING_CONTACT (law firm contact)
    fields.push(this.escapeLedesField(invoice.clientName || ''));

    // 9. LINE_ITEM_NUMBER
    fields.push(item.id.substring(0, 10)); // Use part of UUID as line item number

    // 10. EXP/FEE/INV_ADJ_TYPE
    const lineType = this.getLedesLineType(item.type);
    fields.push(lineType);

    // 11. LINE_ITEM_DATE
    fields.push(this.formatLedesDate(item.date));

    // 12. LINE_ITEM_TASK_CODE (UTBMS Task Code)
    fields.push(this.escapeLedesField(item.taskCode || item.ledesCode || ''));

    // 13. LINE_ITEM_EXPENSE_CODE
    const expenseCode = item.type === InvoiceItemType.EXPENSE ? this.getUtbmsExpenseCode(item.activity) : '';
    fields.push(this.escapeLedesField(expenseCode));

    // 14. LINE_ITEM_ACTIVITY_CODE (UTBMS Activity Code)
    fields.push(this.escapeLedesField(item.activity || ''));

    // 15. TIMEKEEPER_ID
    fields.push(this.escapeLedesField(item.userId || ''));

    // 16. LINE_ITEM_DESCRIPTION
    fields.push(this.escapeLedesField(item.description || ''));

    // 17. LINE_ITEM_UNIT_COST
    fields.push(this.formatLedesAmount(item.rate || 0));

    // 18. LINE_ITEM_NUMBER_OF_UNITS
    fields.push(this.formatLedesQuantity(item.quantity || 1));

    // 19. LINE_ITEM_ADJUSTMENT_AMOUNT
    fields.push('0.00'); // No adjustments at line level

    // 20. LINE_ITEM_TOTAL
    fields.push(this.formatLedesAmount(item.amount));

    // 21. LINE_ITEM_TOTAL_WITH_ADJUSTMENTS
    fields.push(this.formatLedesAmount(item.amount));

    // 22. LAW_FIRM_ID
    fields.push(this.escapeLedesField('LEXIFLOW_FIRM'));

    // 23. CLIENT_MATTER_ID
    fields.push(this.escapeLedesField(invoice.caseId || ''));

    return fields.join('|');
  }

  /**
   * Get LEDES line type code
   */
  private getLedesLineType(itemType: InvoiceItemType): string {
    switch (itemType) {
      case InvoiceItemType.TIME:
        return 'F'; // Fee
      case InvoiceItemType.EXPENSE:
        return 'E'; // Expense
      case InvoiceItemType.ADJUSTMENT:
      case InvoiceItemType.CREDIT:
        return 'I'; // Invoice Adjustment
      case InvoiceItemType.FLAT_FEE:
        return 'F'; // Fee
      default:
        return 'F';
    }
  }

  /**
   * Get UTBMS expense code based on activity
   */
  private getUtbmsExpenseCode(activity: string): string {
    const activityLower = activity?.toLowerCase() || '';

    // UTBMS Expense Codes (examples)
    const expenseCodeMap: Record<string, string> = {
      'filing': 'E101',
      'court': 'E102',
      'service': 'E103',
      'transcript': 'E104',
      'deposition': 'E105',
      'expert': 'E106',
      'witness': 'E107',
      'travel': 'E201',
      'meals': 'E202',
      'lodging': 'E203',
      'copies': 'E301',
      'postage': 'E302',
      'courier': 'E303',
      'telephone': 'E304',
      'research': 'E401',
      'technology': 'E501',
    };

    for (const [key, code] of Object.entries(expenseCodeMap)) {
      if (activityLower.includes(key)) {
        return code;
      }
    }

    return 'E999'; // Other expense
  }

  /**
   * Format date for LEDES (YYYYMMDD)
   */
  private formatLedesDate(date: Date | string | null | undefined): string {
    if (!date) return '';

    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}${month}${day}`;
  }

  /**
   * Format amount for LEDES (decimal with 2 places)
   */
  private formatLedesAmount(amount: number | string): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return '0.00';
    return num.toFixed(2);
  }

  /**
   * Format quantity for LEDES (decimal with 2 places for hours)
   */
  private formatLedesQuantity(quantity: number | string): string {
    const num = typeof quantity === 'string' ? parseFloat(quantity) : quantity;
    if (isNaN(num)) return '0.00';
    return num.toFixed(2);
  }

  /**
   * Escape special characters for LEDES format
   * Remove pipes, newlines, and control characters
   */
  private escapeLedesField(value: string): string {
    if (!value) return '';
    return value
      .replace(/\|/g, ' ')
      .replace(/\n/g, ' ')
      .replace(/\r/g, ' ')
      .replace(/\t/g, ' ')
      .trim();
  }

  /**
   * Validate LEDES file format
   */
  async validateLedesFile(filePath: string): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim());

      if (lines.length === 0) {
        errors.push('File is empty');
        return { valid: false, errors, warnings };
      }

      // Validate header
      if (!lines[0].startsWith('LEDES1998B')) {
        errors.push('Missing or invalid LEDES header');
      }

      // Validate each line item
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const fields = line.split('|');

        if (fields.length < 23) {
          errors.push(`Line ${i + 1}: Insufficient fields (expected 23, got ${fields.length})`);
        }

        // Validate date formats
        const dateFields = [0, 4, 5, 10]; // INVOICE_DATE, START_DATE, END_DATE, LINE_ITEM_DATE
        for (const fieldIndex of dateFields) {
          if (fields[fieldIndex] && !/^\d{8}$/.test(fields[fieldIndex])) {
            warnings.push(`Line ${i + 1}: Invalid date format in field ${fieldIndex + 1}`);
          }
        }

        // Validate amount fields
        const amountFields = [6, 16, 17, 18, 19, 20]; // Various amount fields
        for (const fieldIndex of amountFields) {
          if (fields[fieldIndex] && !/^\d+\.\d{2}$/.test(fields[fieldIndex])) {
            warnings.push(`Line ${i + 1}: Invalid amount format in field ${fieldIndex + 1}`);
          }
        }
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      errors.push(`File read error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { valid: false, errors, warnings };
    }
  }

  /**
   * Export multiple invoices to a single LEDES file (batch export)
   */
  async exportBatchToLedes(invoiceIds: string[]): Promise<{ content: string; filename: string }> {
    this.logger.log(`Batch exporting ${invoiceIds.length} invoices to LEDES format`);

    const lines: string[] = [];
    lines.push(this.generateLedesHeader());

    for (const invoiceId of invoiceIds) {
      const invoice = await this.invoiceRepository.findOne({
        where: { id: invoiceId },
      });

      if (!invoice) {
        this.logger.warn(`Invoice ${invoiceId} not found, skipping`);
        continue;
      }

      const items = await this.invoiceItemRepository.find({
        where: { invoiceId },
        order: { date: 'ASC' },
      });

      for (const item of items) {
        const ledesLine = await this.generateLedesLine(invoice, item);
        lines.push(ledesLine);
      }
    }

    const content = lines.join('\n');
    const filename = `LEDES_Batch_${this.formatLedesDate(new Date())}.txt`;

    return { content, filename };
  }

  /**
   * Get UTBMS task code suggestions based on activity description
   */
  getUtbmsTaskCodeSuggestions(description: string): string[] {
    const descriptionLower = description.toLowerCase();
    const suggestions: string[] = [];

    // UTBMS Phase and Task Codes (examples)
    const taskCodeMap: Record<string, string[]> = {
      'case assessment': ['L110', 'L120'],
      'pleading': ['L210', 'L220', 'L230'],
      'discovery': ['L310', 'L320', 'L330'],
      'motion': ['L410', 'L420'],
      'trial': ['L510', 'L520', 'L530'],
      'appeal': ['L610', 'L620'],
      'settlement': ['L710'],
      'research': ['L810'],
      'document': ['L320', 'L330'],
      'deposition': ['L330'],
      'hearing': ['L420', 'L510'],
      'client': ['L120', 'L140'],
    };

    for (const [keyword, codes] of Object.entries(taskCodeMap)) {
      if (descriptionLower.includes(keyword)) {
        suggestions.push(...codes);
      }
    }

    return [...new Set(suggestions)]; // Remove duplicates
  }
}
