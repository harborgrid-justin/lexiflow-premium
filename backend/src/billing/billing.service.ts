import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Invoice, InvoiceStatus } from './invoices/entities/invoice.entity';
import { TimeEntry, TimeEntryStatus } from './time-entries/entities/time-entry.entity';
import { Expense, ExpenseStatus } from './expenses/entities/expense.entity';

@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(TimeEntry)
    private timeEntryRepository: Repository<TimeEntry>,
    @InjectRepository(Expense)
    private expenseRepository: Repository<Expense>,
  ) {}

  async findAllInvoices(options?: { page?: number; limit?: number }): Promise<{ data: Invoice[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 50 } = options || {};
    const skip = (page - 1) * limit;

    const [invoices, total] = await this.invoiceRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: invoices,
      total,
      page,
      limit,
    };
  }

  async findInvoiceById(id: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({ where: { id } });
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }
    return invoice;
  }

  async createInvoice(data: any): Promise<Invoice> {
    const invoice = this.invoiceRepository.create(data) as unknown as Invoice;
    return this.invoiceRepository.save(invoice);
  }

  async updateInvoice(id: string, data: any): Promise<Invoice> {
    const invoice = await this.findInvoiceById(id);
    Object.assign(invoice, data);
    return this.invoiceRepository.save(invoice);
  }

  async deleteInvoice(id: string): Promise<void> {
    await this.findInvoiceById(id);
    await this.invoiceRepository.delete(id);
  }

  async sendInvoice(id: string): Promise<Invoice> {
    const invoice = await this.findInvoiceById(id);
    invoice.status = InvoiceStatus.SENT;
    return this.invoiceRepository.save(invoice);
  }

  async markInvoicePaid(id: string): Promise<Invoice> {
    const invoice = await this.findInvoiceById(id);
    invoice.status = InvoiceStatus.PAID;
    return this.invoiceRepository.save(invoice);
  }

  async findAllTimeEntries(): Promise<TimeEntry[]> {
    return this.timeEntryRepository.find();
  }

  async findTimeEntriesByCaseId(caseId: string): Promise<TimeEntry[]> {
    return this.timeEntryRepository.find({ where: { caseId } });
  }

  async createTimeEntry(data: any): Promise<TimeEntry> {
    const timeEntry = this.timeEntryRepository.create(data) as unknown as TimeEntry;
    if (data.duration && data.rate) {
      timeEntry.total = data.duration * data.rate;
    }
    return this.timeEntryRepository.save(timeEntry);
  }

  async updateTimeEntry(id: string, data: any): Promise<TimeEntry> {
    const timeEntry = await this.timeEntryRepository.findOne({ where: { id } });
    if (!timeEntry) {
      throw new NotFoundException(`Time entry with ID ${id} not found`);
    }
    Object.assign(timeEntry, data);
    if (timeEntry.duration && timeEntry.rate) {
      timeEntry.total = timeEntry.duration * timeEntry.rate;
    }
    return this.timeEntryRepository.save(timeEntry);
  }

  async deleteTimeEntry(id: string): Promise<void> {
    const timeEntry = await this.timeEntryRepository.findOne({ where: { id } });
    if (!timeEntry) {
      throw new NotFoundException(`Time entry with ID ${id} not found`);
    }
    await this.timeEntryRepository.delete(id);
  }

  async getUnbilledTimeEntries(caseId: string): Promise<TimeEntry[]> {
    return this.timeEntryRepository.find({
      where: { caseId, status: Not(TimeEntryStatus.BILLED), billable: true },
    });
  }

  async findAllExpenses(): Promise<Expense[]> {
    return this.expenseRepository.find();
  }

  async createExpense(data: any): Promise<Expense> {
    const expense = this.expenseRepository.create(data) as unknown as Expense;
    return this.expenseRepository.save(expense);
  }

  async getUnbilledExpenses(caseId: string): Promise<Expense[]> {
    return this.expenseRepository.find({
      where: { caseId, status: Not(ExpenseStatus.BILLED) } as any,
    });
  }

  async generateInvoice(caseId: string, clientId: string): Promise<Invoice> {
    const timeEntries = await this.getUnbilledTimeEntries(caseId);
    const expenses = await this.getUnbilledExpenses(caseId);

    const totalTime = timeEntries.reduce((sum, entry) => sum + (entry.total || 0), 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
    const totalAmount = totalTime + totalExpenses;

    const invoice = this.invoiceRepository.create({
      caseId,
      clientId,
      totalAmount,
      status: InvoiceStatus.DRAFT,
    });

    return this.invoiceRepository.save(invoice);
  }

  async getBillingSummary(caseId: string): Promise<any> {
    const timeEntries = await this.findTimeEntriesByCaseId(caseId);
    const expenses = await this.expenseRepository.find({ where: { caseId } });

    const totalHours = timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
    const totalBilled = timeEntries
      .filter(e => e.status === TimeEntryStatus.BILLED)
      .reduce((sum, entry) => sum + (entry.total || 0), 0) +
      expenses
        .filter(e => e.status === ExpenseStatus.BILLED)
        .reduce((sum, expense) => sum + (expense.amount || 0), 0);
    
    const totalUnbilled = timeEntries
      .filter(e => e.status !== TimeEntryStatus.BILLED && e.billable)
      .reduce((sum, entry) => sum + (entry.total || 0), 0) +
      expenses
        .filter(e => e.status !== ExpenseStatus.BILLED && e.billable)
        .reduce((sum, expense) => sum + (expense.amount || 0), 0);

    return {
      totalHours,
      totalBilled,
      totalUnbilled,
    };
  }

  async getWIPStats(): Promise<any[]> {
    const unbilledTimeEntries = await this.timeEntryRepository.find({
      where: { status: Not(TimeEntryStatus.BILLED), billable: true },
    });

    const unbilledExpenses = await this.expenseRepository.find({
      where: { status: Not(ExpenseStatus.BILLED) } as any,
    });

    // Group by case
    const wipByCase = new Map<string, number>();

    unbilledTimeEntries.forEach(entry => {
      const current = wipByCase.get(entry.caseId) || 0;
      wipByCase.set(entry.caseId, current + (entry.total || 0));
    });

    unbilledExpenses.forEach(expense => {
      const caseId = expense.caseId;
      if (caseId) {
        const current = wipByCase.get(caseId) || 0;
        wipByCase.set(caseId, current + (expense.amount || 0));
      }
    });

    // Convert to array format expected by frontend
    return Array.from(wipByCase.entries()).map(([caseId, wip]) => ({
      caseId,
      wip,
      name: `Case ${caseId.substring(0, 8)}`, // Shortened for display
    }));
  }

  async getRealizationStats(): Promise<any> {
    const allTimeEntries = await this.timeEntryRepository.find();
    
    const billed = allTimeEntries
      .filter(e => e.status === TimeEntryStatus.BILLED)
      .reduce((sum, e) => sum + (e.total || 0), 0);
    
    const writeOff = allTimeEntries
      .filter(e => e.billable && e.status !== TimeEntryStatus.BILLED)
      .reduce((sum, e) => sum + (e.total || 0), 0);

    return [
      { name: 'Billed', value: Math.round(billed), color: '#10b981' },
      { name: 'Write-off', value: Math.round(writeOff), color: '#ef4444' },
    ];
  }

  async getOverviewStats(): Promise<{ realization: number; totalBilled: number; month: string }> {
    try {
      const allTimeEntries = await this.timeEntryRepository.find();
      const allInvoices = await this.invoiceRepository.find();
      
      // Calculate total billed amount from invoices
      const totalBilled = allInvoices
        .filter(inv => inv.status === InvoiceStatus.SENT || inv.status === InvoiceStatus.PAID)
        .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
      
      // Calculate realization rate (billed vs total time)
      const totalTime = allTimeEntries.reduce((sum, e) => sum + (e.total || 0), 0);
      const billedTime = allTimeEntries
        .filter(e => e.status === TimeEntryStatus.BILLED)
        .reduce((sum, e) => sum + (e.total || 0), 0);
      
      const realization = totalTime > 0 ? (billedTime / totalTime) * 100 : 0;
      
      // Get current month name
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                         'July', 'August', 'September', 'October', 'November', 'December'];
      const currentMonth = monthNames[new Date().getMonth()];
      const currentYear = new Date().getFullYear();
      
      return {
        realization: Math.round(realization * 10) / 10,
        totalBilled: Math.round(totalBilled),
        month: `${currentMonth} ${currentYear}`
      };
    } catch {
      // Return default values if database queries fail (e.g., tables not initialized)
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                         'July', 'August', 'September', 'October', 'November', 'December'];
      const currentMonth = monthNames[new Date().getMonth()];
      const currentYear = new Date().getFullYear();

      return {
        realization: 0,
        totalBilled: 0,
        month: `${currentMonth} ${currentYear}`
      };
    }
  }
}
