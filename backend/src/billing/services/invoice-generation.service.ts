import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Invoice, InvoiceStatus } from '../invoices/entities/invoice.entity';
import { InvoiceItem, InvoiceItemType } from '../invoices/entities/invoice-item.entity';
import { TimeEntry, TimeEntryStatus } from '../time-entries/entities/time-entry.entity';
import { Expense, ExpenseStatus } from '../expenses/entities/expense.entity';
import { Case } from '@cases/entities/case.entity';
import { Client } from '@clients/entities/client.entity';

export interface GenerateInvoiceDto {
  caseId: string;
  clientId: string;
  periodStart: Date;
  periodEnd: Date;
  timeEntryIds?: string[];
  expenseIds?: string[];
  includeAllUnbilled?: boolean;
  taxRate?: number;
  discountAmount?: number;
  notes?: string;
  terms?: string;
  dueInDays?: number;
  createdBy?: string;
}

export interface InvoiceGenerationResult {
  invoice: Invoice;
  items: InvoiceItem[];
  timeEntriesCount: number;
  expensesCount: number;
  totalTimeCharges: number;
  totalExpenseCharges: number;
  subtotal: number;
  total: number;
}

/**
 * Invoice Generation Service
 *
 * Handles automated invoice generation from time entries and expenses:
 * - Aggregate billable time entries and expenses
 * - Calculate totals, taxes, and discounts
 * - Generate invoice numbers
 * - Create invoice items with proper categorization
 * - Support for partial billing and selective item inclusion
 * - Batch invoice generation
 */
@Injectable()
export class InvoiceGenerationService {
  private readonly logger = new Logger(InvoiceGenerationService.name);

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
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Generate invoice from time entries and expenses
   */
  async generateInvoice(dto: GenerateInvoiceDto): Promise<InvoiceGenerationResult> {
    this.logger.log(`Generating invoice for case ${dto.caseId}`);

    return await this.dataSource.transaction(async (manager) => {
      // Fetch case and client
      const caseEntity = await manager.findOne(Case, {
        where: { id: dto.caseId },
      });

      if (!caseEntity) {
        throw new NotFoundException(`Case ${dto.caseId} not found`);
      }

      const client = await manager.findOne(Client, {
        where: { id: dto.clientId },
      });

      if (!client) {
        throw new NotFoundException(`Client ${dto.clientId} not found`);
      }

      // Fetch billable time entries
      let timeEntries: TimeEntry[] = [];
      if (dto.includeAllUnbilled) {
        timeEntries = await manager.find(TimeEntry, {
          where: {
            caseId: dto.caseId,
            billable: true,
            status: In([TimeEntryStatus.APPROVED, TimeEntryStatus.SUBMITTED]),
            deletedAt: null,
          },
          order: { date: 'ASC' },
        });
      } else if (dto.timeEntryIds && dto.timeEntryIds.length > 0) {
        timeEntries = await manager.find(TimeEntry, {
          where: {
            id: In(dto.timeEntryIds),
            billable: true,
            deletedAt: null,
          },
          order: { date: 'ASC' },
        });
      }

      // Fetch billable expenses
      let expenses: Expense[] = [];
      if (dto.includeAllUnbilled) {
        expenses = await manager.find(Expense, {
          where: {
            caseId: dto.caseId,
            billable: true,
            status: In([ExpenseStatus.APPROVED, ExpenseStatus.SUBMITTED]),
            deletedAt: null,
          },
          order: { expenseDate: 'ASC' },
        });
      } else if (dto.expenseIds && dto.expenseIds.length > 0) {
        expenses = await manager.find(Expense, {
          where: {
            id: In(dto.expenseIds),
            billable: true,
            deletedAt: null,
          },
          order: { expenseDate: 'ASC' },
        });
      }

      // Calculate totals
      const totalTimeCharges = timeEntries.reduce(
        (sum, entry) => sum + Number(entry.discountedTotal || entry.total),
        0,
      );

      const totalExpenseCharges = expenses.reduce(
        (sum, expense) => sum + Number(expense.markedUpAmount || expense.amount),
        0,
      );

      const subtotal = totalTimeCharges + totalExpenseCharges;
      const taxRate = dto.taxRate || 0;
      const taxAmount = subtotal * (taxRate / 100);
      const discountAmount = dto.discountAmount || 0;
      const totalAmount = subtotal + taxAmount - discountAmount;

      // Generate invoice number
      const invoiceNumber = await this.generateInvoiceNumber();

      // Calculate due date
      const invoiceDate = new Date();
      const dueDate = new Date(invoiceDate);
      dueDate.setDate(dueDate.getDate() + (dto.dueInDays || 30));

      // Create invoice
      const invoice = manager.create(Invoice, {
        invoiceNumber,
        caseId: dto.caseId,
        clientId: dto.clientId,
        clientName: client.name,
        matterDescription: caseEntity.title || caseEntity.caseNumber,
        invoiceDate,
        dueDate,
        periodStart: dto.periodStart,
        periodEnd: dto.periodEnd,
        status: InvoiceStatus.DRAFT,
        subtotal,
        taxRate,
        taxAmount,
        discountAmount,
        totalAmount,
        balanceDue: totalAmount,
        paidAmount: 0,
        timeCharges: totalTimeCharges,
        expenseCharges: totalExpenseCharges,
        notes: dto.notes,
        terms: dto.terms || this.getDefaultTerms(),
        currency: 'USD',
        createdBy: dto.createdBy,
      });

      const savedInvoice = await manager.save(Invoice, invoice);

      // Create invoice items from time entries
      const timeItems: InvoiceItem[] = [];
      for (const entry of timeEntries) {
        const item = manager.create(InvoiceItem, {
          invoiceId: savedInvoice.id,
          type: InvoiceItemType.TIME,
          date: entry.date,
          description: entry.description,
          quantity: entry.duration,
          rate: entry.rate,
          amount: entry.discountedTotal || entry.total,
          timeEntryId: entry.id,
          userId: entry.userId,
          activity: entry.activity,
          ledesCode: entry.ledesCode,
          phaseCode: entry.phaseCode,
          taskCode: entry.taskCode,
        });
        timeItems.push(item);

        // Mark time entry as billed
        await manager.update(TimeEntry, entry.id, {
          status: TimeEntryStatus.BILLED,
          invoiceId: savedInvoice.id,
          billedAt: new Date(),
          billedBy: dto.createdBy,
        });
      }

      // Create invoice items from expenses
      const expenseItems: InvoiceItem[] = [];
      for (const expense of expenses) {
        const item = manager.create(InvoiceItem, {
          invoiceId: savedInvoice.id,
          type: InvoiceItemType.EXPENSE,
          date: expense.expenseDate,
          description: expense.description,
          quantity: expense.quantity || 1,
          rate: expense.unitPrice || expense.amount,
          amount: expense.markedUpAmount || expense.amount,
          expenseId: expense.id,
          userId: expense.userId,
          activity: expense.category,
        });
        expenseItems.push(item);

        // Mark expense as billed
        await manager.update(Expense, expense.id, {
          status: ExpenseStatus.BILLED,
          invoiceId: savedInvoice.id,
          billedAt: new Date(),
          billedBy: dto.createdBy,
        });
      }

      const allItems = [...timeItems, ...expenseItems];
      await manager.save(InvoiceItem, allItems);

      this.logger.log(
        `Invoice ${invoiceNumber} generated with ${timeItems.length} time entries and ${expenseItems.length} expenses`,
      );

      return {
        invoice: savedInvoice,
        items: allItems,
        timeEntriesCount: timeEntries.length,
        expensesCount: expenses.length,
        totalTimeCharges,
        totalExpenseCharges,
        subtotal,
        total: totalAmount,
      };
    });
  }

  /**
   * Generate batch invoices for multiple cases
   */
  async generateBatchInvoices(
    dtos: GenerateInvoiceDto[],
  ): Promise<InvoiceGenerationResult[]> {
    this.logger.log(`Generating batch of ${dtos.length} invoices`);

    const results: InvoiceGenerationResult[] = [];

    for (const dto of dtos) {
      try {
        const result = await this.generateInvoice(dto);
        results.push(result);
      } catch (error) {
        this.logger.error(
          `Failed to generate invoice for case ${dto.caseId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
        // Continue with next invoice
      }
    }

    return results;
  }

  /**
   * Preview invoice before generation
   */
  async previewInvoice(dto: GenerateInvoiceDto): Promise<{
    timeEntries: TimeEntry[];
    expenses: Expense[];
    summary: {
      timeCharges: number;
      expenseCharges: number;
      subtotal: number;
      taxAmount: number;
      discountAmount: number;
      total: number;
    };
  }> {
    // Fetch billable time entries
    let timeEntries: TimeEntry[] = [];
    if (dto.includeAllUnbilled) {
      timeEntries = await this.timeEntryRepository.find({
        where: {
          caseId: dto.caseId,
          billable: true,
          status: In([TimeEntryStatus.APPROVED, TimeEntryStatus.SUBMITTED]),
          deletedAt: null,
        },
        order: { date: 'ASC' },
      });
    } else if (dto.timeEntryIds && dto.timeEntryIds.length > 0) {
      timeEntries = await this.timeEntryRepository.find({
        where: {
          id: In(dto.timeEntryIds),
          billable: true,
          deletedAt: null,
        },
        order: { date: 'ASC' },
      });
    }

    // Fetch billable expenses
    let expenses: Expense[] = [];
    if (dto.includeAllUnbilled) {
      expenses = await this.expenseRepository.find({
        where: {
          caseId: dto.caseId,
          billable: true,
          status: In([ExpenseStatus.APPROVED, ExpenseStatus.SUBMITTED]),
          deletedAt: null,
        },
        order: { expenseDate: 'ASC' },
      });
    } else if (dto.expenseIds && dto.expenseIds.length > 0) {
      expenses = await this.expenseRepository.find({
        where: {
          id: In(dto.expenseIds),
          billable: true,
          deletedAt: null,
        },
        order: { expenseDate: 'ASC' },
      });
    }

    // Calculate totals
    const timeCharges = timeEntries.reduce(
      (sum, entry) => sum + Number(entry.discountedTotal || entry.total),
      0,
    );

    const expenseCharges = expenses.reduce(
      (sum, expense) => sum + Number(expense.markedUpAmount || expense.amount),
      0,
    );

    const subtotal = timeCharges + expenseCharges;
    const taxRate = dto.taxRate || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const discountAmount = dto.discountAmount || 0;
    const total = subtotal + taxAmount - discountAmount;

    return {
      timeEntries,
      expenses,
      summary: {
        timeCharges,
        expenseCharges,
        subtotal,
        taxAmount,
        discountAmount,
        total,
      },
    };
  }

  /**
   * Generate unique invoice number
   */
  private async generateInvoiceNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    // Find the last invoice for this month
    const prefix = `INV-${year}${month}`;
    const lastInvoice = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .where('invoice.invoiceNumber LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('invoice.invoiceNumber', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastInvoice && lastInvoice.invoiceNumber) {
      const lastSequence = parseInt(lastInvoice.invoiceNumber.split('-').pop() || '0');
      sequence = lastSequence + 1;
    }

    const sequenceStr = String(sequence).padStart(4, '0');
    return `${prefix}-${sequenceStr}`;
  }

  /**
   * Get default payment terms
   */
  private getDefaultTerms(): string {
    return `Payment is due within 30 days of invoice date. Late payments may be subject to interest charges at the maximum rate permitted by law. Please reference the invoice number with all payments.`;
  }

  /**
   * Regenerate invoice (if draft)
   */
  async regenerateInvoice(invoiceId: string, dto: Partial<GenerateInvoiceDto>): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice ${invoiceId} not found`);
    }

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Can only regenerate draft invoices');
    }

    return await this.dataSource.transaction(async (manager) => {
      // Delete existing invoice items
      await manager.delete(InvoiceItem, { invoiceId });

      // Reset time entries and expenses to unbilled
      await manager.update(
        TimeEntry,
        { invoiceId },
        {
          status: TimeEntryStatus.APPROVED,
          invoiceId: null,
          billedAt: null,
          billedBy: null,
        },
      );

      await manager.update(
        Expense,
        { invoiceId },
        {
          status: ExpenseStatus.APPROVED,
          invoiceId: null,
          billedAt: null,
          billedBy: null,
        },
      );

      // Delete the invoice
      await manager.delete(Invoice, { id: invoiceId });

      // Generate new invoice
      const newDto: GenerateInvoiceDto = {
        caseId: dto.caseId || invoice.caseId,
        clientId: dto.clientId || invoice.clientId,
        periodStart: dto.periodStart || invoice.periodStart,
        periodEnd: dto.periodEnd || invoice.periodEnd,
        includeAllUnbilled: dto.includeAllUnbilled,
        taxRate: dto.taxRate || invoice.taxRate,
        discountAmount: dto.discountAmount || invoice.discountAmount,
        notes: dto.notes || invoice.notes,
        terms: dto.terms || invoice.terms,
        dueInDays: dto.dueInDays,
        createdBy: dto.createdBy,
      };

      const result = await this.generateInvoice(newDto);
      return result.invoice;
    });
  }

  /**
   * Get unbilled items for a case
   */
  async getUnbilledItems(caseId: string): Promise<{
    timeEntries: TimeEntry[];
    expenses: Expense[];
    summary: {
      timeCharges: number;
      expenseCharges: number;
      total: number;
    };
  }> {
    const timeEntries = await this.timeEntryRepository.find({
      where: {
        caseId,
        billable: true,
        status: In([TimeEntryStatus.APPROVED, TimeEntryStatus.SUBMITTED]),
        deletedAt: null,
      },
      order: { date: 'ASC' },
    });

    const expenses = await this.expenseRepository.find({
      where: {
        caseId,
        billable: true,
        status: In([ExpenseStatus.APPROVED, ExpenseStatus.SUBMITTED]),
        deletedAt: null,
      },
      order: { expenseDate: 'ASC' },
    });

    const timeCharges = timeEntries.reduce(
      (sum, entry) => sum + Number(entry.discountedTotal || entry.total),
      0,
    );

    const expenseCharges = expenses.reduce(
      (sum, expense) => sum + Number(expense.markedUpAmount || expense.amount),
      0,
    );

    return {
      timeEntries,
      expenses,
      summary: {
        timeCharges,
        expenseCharges,
        total: timeCharges + expenseCharges,
      },
    };
  }
}
