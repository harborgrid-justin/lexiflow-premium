import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './entities/invoice.entity';
import { TimeEntry } from './entities/time-entry.entity';
import { Expense } from './entities/expense.entity';

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

  async findAllInvoices(): Promise<Invoice[]> {
    return this.invoiceRepository.find();
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
    invoice.status = 'sent';
    return this.invoiceRepository.save(invoice);
  }

  async markInvoicePaid(id: string): Promise<Invoice> {
    const invoice = await this.findInvoiceById(id);
    invoice.status = 'paid';
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
    if (data.hours && data.rate) {
      (timeEntry as any).amount = data.hours * data.rate;
    }
    return this.timeEntryRepository.save(timeEntry);
  }

  async updateTimeEntry(id: string, data: any): Promise<TimeEntry> {
    const timeEntry = await this.timeEntryRepository.findOne({ where: { id } });
    if (!timeEntry) {
      throw new NotFoundException(`Time entry with ID ${id} not found`);
    }
    Object.assign(timeEntry, data);
    if (timeEntry.hours && timeEntry.rate) {
      timeEntry.amount = timeEntry.hours * timeEntry.rate;
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
      where: { caseId, billed: false, billable: true },
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
      where: { caseId } as any,
    });
  }

  async generateInvoice(caseId: string, clientId: string): Promise<Invoice> {
    const timeEntries = await this.getUnbilledTimeEntries(caseId);
    const expenses = await this.getUnbilledExpenses(caseId);

    const totalTime = timeEntries.reduce((sum, entry) => sum + (entry.amount || 0), 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + ((expense as any).amount || 0), 0);
    const amount = totalTime + totalExpenses;

    const invoice = this.invoiceRepository.create({
      caseId,
      clientId,
      amount,
      status: 'draft',
    });

    return this.invoiceRepository.save(invoice);
  }

  async getBillingSummary(caseId: string): Promise<any> {
    const timeEntries = await this.findTimeEntriesByCaseId(caseId);
    const expenses = await this.expenseRepository.find({ where: { caseId } });

    const totalHours = timeEntries.reduce((sum, entry) => sum + (entry.hours || 0), 0);
    const totalBilled = timeEntries
      .filter(e => (e as any).billed)
      .reduce((sum, entry) => sum + (entry.amount || 0), 0) +
      expenses
        .filter(e => (e as any).billed)
        .reduce((sum, expense) => sum + ((expense as any).amount || 0), 0);
    
    const totalUnbilled = timeEntries
      .filter(e => !(e as any).billed && (e as any).billable)
      .reduce((sum, entry) => sum + (entry.amount || 0), 0) +
      expenses
        .filter(e => !(e as any).billed && (e as any).billable)
        .reduce((sum, expense) => sum + ((expense as any).amount || 0), 0);

    return {
      totalHours,
      totalBilled,
      totalUnbilled,
    };
  }

  async getWIPStats(): Promise<any[]> {
    const unbilledTimeEntries = await this.timeEntryRepository.find({
      where: { billed: false, billable: true },
    });

    const unbilledExpenses = await this.expenseRepository.find({
      where: { billed: false } as any,
    });

    // Group by case
    const wipByCase = new Map<string, number>();

    unbilledTimeEntries.forEach(entry => {
      const current = wipByCase.get(entry.caseId) || 0;
      wipByCase.set(entry.caseId, current + (entry.amount || 0));
    });

    unbilledExpenses.forEach(expense => {
      const caseId = (expense as any).caseId;
      if (caseId) {
        const current = wipByCase.get(caseId) || 0;
        wipByCase.set(caseId, current + ((expense as any).amount || 0));
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
      .filter(e => (e as any).billed)
      .reduce((sum, e) => sum + (e.amount || 0), 0);
    
    const writeOff = allTimeEntries
      .filter(e => (e as any).billable && !(e as any).billed)
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    return [
      { name: 'Billed', value: Math.round(billed), color: '#10b981' },
      { name: 'Write-off', value: Math.round(writeOff), color: '#ef4444' },
    ];
  }
}
