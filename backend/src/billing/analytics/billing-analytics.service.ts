import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { TimeEntry, TimeEntryStatus } from '../time-entries/entities/time-entry.entity';
import { Expense, ExpenseStatus } from '../expenses/entities/expense.entity';
import { Invoice, InvoiceStatus } from '../invoices/entities/invoice.entity';
import {
  AnalyticsFilterDto,
  WipStatsResponse,
  RealizationResponse,
  OperatingSummaryResponse,
  ArAgingResponse,
} from './dto/analytics-filter.dto';

@Injectable()
export class BillingAnalyticsService {
  constructor(
    @InjectRepository(TimeEntry)
    private readonly timeEntryRepository: Repository<TimeEntry>,
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
  ) {}

  async getWipStats(filterDto: AnalyticsFilterDto): Promise<WipStatsResponse> {
    const { caseId, userId, startDate, endDate } = filterDto;

    // Build queries for unbilled time entries
    let timeQuery = this.timeEntryRepository
      .createQueryBuilder('te')
      .where('te.status IN (:...statuses)', {
        statuses: [TimeEntryStatus.APPROVED, TimeEntryStatus.SUBMITTED],
      })
      .andWhere('te.billable = :billable', { billable: true })
      .andWhere('te.deletedAt IS NULL');

    if (caseId) {
      timeQuery = timeQuery.andWhere('te.caseId = :caseId', { caseId });
    }
    if (userId) {
      timeQuery = timeQuery.andWhere('te.userId = :userId', { userId });
    }
    if (startDate && endDate) {
      timeQuery = timeQuery.andWhere('te.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const unbilledTimeEntries = await timeQuery.getMany();

    // Build queries for unbilled expenses
    let expenseQuery = this.expenseRepository
      .createQueryBuilder('exp')
      .where('exp.status IN (:...statuses)', {
        statuses: [ExpenseStatus.APPROVED, ExpenseStatus.SUBMITTED],
      })
      .andWhere('exp.billable = :billable', { billable: true })
      .andWhere('exp.deletedAt IS NULL');

    if (caseId) {
      expenseQuery = expenseQuery.andWhere('exp.caseId = :caseId', { caseId });
    }
    if (userId) {
      expenseQuery = expenseQuery.andWhere('exp.userId = :userId', { userId });
    }
    if (startDate && endDate) {
      expenseQuery = expenseQuery.andWhere('exp.expenseDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const unbilledExpenses = await expenseQuery.getMany();

    // Calculate totals
    const unbilledTime = unbilledTimeEntries.reduce(
      (sum, entry) => sum + Number(entry.discountedTotal || entry.total),
      0,
    );
    const unbilledExpensesTotal = unbilledExpenses.reduce(
      (sum, exp) => sum + Number(exp.markedUpAmount || exp.amount),
      0,
    );
    const totalWip = unbilledTime + unbilledExpensesTotal;

    // WIP by case
    const wipByCaseMap = new Map<string, { caseName: string; amount: number; oldestDate: Date | string }>();
    unbilledTimeEntries.forEach((entry) => {
      const existing = wipByCaseMap.get(entry.caseId) || {
        caseName: entry.caseId,
        amount: 0,
        oldestDate: entry.date,
      };
      existing.amount += Number(entry.discountedTotal || entry.total);
      if (entry.date < existing.oldestDate) {
        existing.oldestDate = entry.date;
      }
      wipByCaseMap.set(entry.caseId, existing);
    });

    unbilledExpenses.forEach((exp) => {
      const existing = wipByCaseMap.get(exp.caseId) || {
        caseName: exp.caseId,
        amount: 0,
        oldestDate: exp.expenseDate,
      };
      existing.amount += Number(exp.markedUpAmount || exp.amount);
      if (exp.expenseDate < existing.oldestDate) {
        existing.oldestDate = exp.expenseDate;
      }
      wipByCaseMap.set(exp.caseId, existing);
    });

    const today = new Date();
    const wipByCase = Array.from(wipByCaseMap.entries()).map(([caseId, data]) => {
      const oldestDate = new Date(data.oldestDate);
      const ageInDays = Math.floor((today.getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24));
      return {
        caseId,
        caseName: data.caseName,
        wipAmount: data.amount,
        ageInDays,
      };
    });

    // WIP by attorney
    const wipByAttorneyMap = new Map<string, { userName: string; amount: number; hours: number }>();
    unbilledTimeEntries.forEach((entry) => {
      const existing = wipByAttorneyMap.get(entry.userId) || {
        userName: entry.userId,
        amount: 0,
        hours: 0,
      };
      existing.amount += Number(entry.discountedTotal || entry.total);
      existing.hours += Number(entry.duration);
      wipByAttorneyMap.set(entry.userId, existing);
    });

    const wipByAttorney = Array.from(wipByAttorneyMap.entries()).map(([userId, data]) => ({
      userId,
      userName: data.userName,
      wipAmount: data.amount,
      hours: data.hours,
    }));

    // WIP aging
    const wipAging = {
      current: 0,
      days30: 0,
      days60: 0,
      days90: 0,
      over120: 0,
    };

    wipByCase.forEach((item) => {
      if (item.ageInDays <= 30) {
        wipAging.current += item.wipAmount;
      } else if (item.ageInDays <= 60) {
        wipAging.days30 += item.wipAmount;
      } else if (item.ageInDays <= 90) {
        wipAging.days60 += item.wipAmount;
      } else if (item.ageInDays <= 120) {
        wipAging.days90 += item.wipAmount;
      } else {
        wipAging.over120 += item.wipAmount;
      }
    });

    return {
      totalWip,
      unbilledTime,
      unbilledExpenses: unbilledExpensesTotal,
      wipByCase,
      wipByAttorney,
      wipAging,
    };
  }

  async getRealizationRates(filterDto: AnalyticsFilterDto): Promise<RealizationResponse> {
    const { startDate, endDate } = filterDto;

    let invoiceQuery = this.invoiceRepository
      .createQueryBuilder('inv')
      .where('inv.status IN (:...statuses)', {
        statuses: [InvoiceStatus.PAID, InvoiceStatus.PARTIAL],
      })
      .andWhere('inv.deletedAt IS NULL');

    if (startDate && endDate) {
      invoiceQuery = invoiceQuery.andWhere('inv.invoiceDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const invoices = await invoiceQuery.getMany();

    const standardAmount = invoices.reduce((sum, inv) => sum + Number(inv.subtotal), 0);
    const collectedAmount = invoices.reduce((sum, inv) => sum + Number(inv.paidAmount), 0);
    const discounts = invoices.reduce((sum, inv) => sum + Number(inv.discountAmount), 0);
    const writeOffs = standardAmount - collectedAmount - discounts;
    const realizationRate = standardAmount > 0 ? (collectedAmount / standardAmount) * 100 : 0;

    // For detailed breakdowns, we'd need additional queries
    // This is a simplified version
    return {
      realizationRate,
      standardAmount,
      collectedAmount,
      writeOffs,
      discounts,
      byAttorney: [],
      byPracticeArea: [],
      trend: [],
    };
  }

  async getOperatingSummary(filterDto: AnalyticsFilterDto): Promise<OperatingSummaryResponse> {
    const { startDate, endDate } = filterDto;

    let invoiceQuery = this.invoiceRepository
      .createQueryBuilder('inv')
      .where('inv.deletedAt IS NULL');

    if (startDate && endDate) {
      invoiceQuery = invoiceQuery.andWhere('inv.invoiceDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const invoices = await invoiceQuery.getMany();

    const totalRevenue = invoices
      .filter((inv) => inv.status === InvoiceStatus.PAID || inv.status === InvoiceStatus.PARTIAL)
      .reduce((sum, inv) => sum + Number(inv.paidAmount), 0);

    const outstandingAR = invoices
      .filter(
        (inv) =>
          inv.status !== InvoiceStatus.PAID && inv.status !== InvoiceStatus.WRITTEN_OFF,
      )
      .reduce((sum, inv) => sum + Number(inv.balanceDue), 0);

    // Count active matters (unique cases with recent activity)
    const activeCaseIds = new Set(invoices.map((inv) => inv.caseId));
    const activeMatters = activeCaseIds.size;

    // Calculate billable hours
    let timeQuery = this.timeEntryRepository
      .createQueryBuilder('te')
      .where('te.billable = :billable', { billable: true })
      .andWhere('te.deletedAt IS NULL');

    if (startDate && endDate) {
      timeQuery = timeQuery.andWhere('te.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const timeEntries = await timeQuery.getMany();
    const billableHours = timeEntries.reduce((sum, entry) => sum + Number(entry.duration), 0);
    const totalTimeRevenue = timeEntries.reduce(
      (sum, entry) => sum + Number(entry.discountedTotal || entry.total),
      0,
    );
    const averageHourlyRate = billableHours > 0 ? totalTimeRevenue / billableHours : 0;

    return {
      totalRevenue,
      totalExpenses: 0, // Would need expense data
      netIncome: totalRevenue,
      outstandingAR,
      averageCollectionDays: 0, // Would need payment date tracking
      activeMatters,
      billableHours,
      averageHourlyRate,
      revenueByMonth: [],
      topClients: [],
    };
  }

  async getArAging(_filterDto: AnalyticsFilterDto): Promise<ArAgingResponse> {
    const today = new Date();

    const invoices = await this.invoiceRepository.find({
      where: { deletedAt: IsNull() },
    });

    const unpaidInvoices = invoices.filter(
      (inv) =>
        inv.status !== InvoiceStatus.PAID && inv.status !== InvoiceStatus.WRITTEN_OFF,
    );

    const aging = {
      totalAR: 0,
      current: 0,
      days30: 0,
      days60: 0,
      days90: 0,
      over90: 0,
    };

    const clientAgingMap = new Map<
      string,
      {
        clientName: string;
        totalDue: number;
        current: number;
        days30: number;
        days60: number;
        days90: number;
        over90: number;
        oldestInvoiceDate: Date | string;
      }
    >();

    unpaidInvoices.forEach((invoice) => {
      const dueDate = new Date(invoice.dueDate);
      const daysOverdue = Math.floor(
        (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      const balance = Number(invoice.balanceDue);

      aging.totalAR += balance;

      let ageCategory: 'current' | 'days30' | 'days60' | 'days90' | 'over90';
      if (daysOverdue <= 0) {
        aging.current += balance;
        ageCategory = 'current';
      } else if (daysOverdue <= 30) {
        aging.days30 += balance;
        ageCategory = 'days30';
      } else if (daysOverdue <= 60) {
        aging.days60 += balance;
        ageCategory = 'days60';
      } else if (daysOverdue <= 90) {
        aging.days90 += balance;
        ageCategory = 'days90';
      } else {
        aging.over90 += balance;
        ageCategory = 'over90';
      }

      // Update client aging
      const clientData = clientAgingMap.get(invoice.clientId) || {
        clientName: invoice.clientName,
        totalDue: 0,
        current: 0,
        days30: 0,
        days60: 0,
        days90: 0,
        over90: 0,
        oldestInvoiceDate: invoice.invoiceDate,
      };

      clientData.totalDue += balance;
      clientData[ageCategory] += balance;
      if (invoice.invoiceDate < clientData.oldestInvoiceDate) {
        clientData.oldestInvoiceDate = invoice.invoiceDate;
      }

      clientAgingMap.set(invoice.clientId, clientData);
    });

    const byClient = Array.from(clientAgingMap.entries()).map(([clientId, data]) => ({
      clientId,
      ...data,
      oldestInvoiceDate: data.oldestInvoiceDate instanceof Date ? data.oldestInvoiceDate.toISOString() : String(data.oldestInvoiceDate),
    }));

    return {
      ...aging,
      byClient,
    };
  }
}
