import { Injectable, Logger } from '@nestjs/common';

/**
 * Work in Progress (WIP) Report Service
 * Tracks unbilled time and expenses
 */

export interface WIPReport {
  reportDate: Date;
  totalWIP: number;
  totalTimeWIP: number;
  totalExpenseWIP: number;
  totalMatters: number;
  byMatter: WIPByMatter[];
  byTimekeeper: WIPByTimekeeper[];
  byClient: WIPByClient[];
  aging: WIPAging;
  metrics: WIPMetrics;
}

export interface WIPByMatter {
  matterId: string;
  matterName: string;
  clientId: string;
  clientName: string;
  timeWIP: number;
  expenseWIP: number;
  totalWIP: number;
  hours: number;
  oldestEntryDate: Date;
  ageDays: number;
  status: 'active' | 'hold' | 'ready_to_bill';
  lastBillingDate?: Date;
}

export interface WIPByTimekeeper {
  timekeeperId: string;
  timekeeperName: string;
  classification: string;
  totalWIP: number;
  hours: number;
  averageRate: number;
  matterCount: number;
  oldestEntry: Date;
}

export interface WIPByClient {
  clientId: string;
  clientName: string;
  totalWIP: number;
  timeWIP: number;
  expenseWIP: number;
  matterCount: number;
  oldestWIP: number; // Days
  readyToBill: number;
}

export interface WIPAging {
  current: number; // 0-30 days
  days30: number; // 31-60 days
  days60: number; // 61-90 days
  days90Plus: number; // 90+ days
  percentageCurrent: number;
  percentageStale: number; // 90+ days
}

export interface WIPMetrics {
  averageWIPPerMatter: number;
  averageAgeDays: number;
  realization Rate: number; // Billed vs WIP
  workToDateRevenue: number; // Total potential revenue
  unbilledToRevenue: number; // WIP as % of revenue
  wipTurnoverDays: number; // Average days to bill
  staleWIPPercentage: number; // WIP > 90 days
}

export interface WIPEntry {
  id: string;
  matterId: string;
  matterName: string;
  clientId: string;
  clientName: string;
  timekeeperId?: string;
  timekeeperName?: string;
  entryDate: Date;
  description: string;
  hours?: number;
  rate?: number;
  amount: number;
  type: 'time' | 'expense';
  status: 'unbilled' | 'billed' | 'written_off';
  billingHold: boolean;
}

@Injectable()
export class WIPReportService {
  private readonly logger = new Logger(WIPReportService.name);

  /**
   * Generate comprehensive WIP report
   */
  async generateWIPReport(
    asOfDate: Date = new Date(),
    options: {
      clientId?: string;
      matterId?: string;
      timekeeperId?: string;
      includeOnHold?: boolean;
    } = {},
  ): Promise<WIPReport> {
    this.logger.log(`Generating WIP report as of ${asOfDate.toISOString()}`);

    // Fetch unbilled entries
    const wipEntries = await this.getWIPEntries(asOfDate, options);

    // Calculate totals
    const totalWIP = wipEntries.reduce((sum, entry) => sum + entry.amount, 0);
    const totalTimeWIP = wipEntries
      .filter(e => e.type === 'time')
      .reduce((sum, entry) => sum + entry.amount, 0);
    const totalExpenseWIP = wipEntries
      .filter(e => e.type === 'expense')
      .reduce((sum, entry) => sum + entry.amount, 0);

    // Group by matter
    const byMatter = this.groupByMatter(wipEntries, asOfDate);

    // Group by timekeeper
    const byTimekeeper = this.groupByTimekeeper(wipEntries);

    // Group by client
    const byClient = this.groupByClient(wipEntries, asOfDate);

    // Calculate aging
    const aging = this.calculateWIPAging(wipEntries, asOfDate);

    // Calculate metrics
    const metrics = await this.calculateWIPMetrics(wipEntries, asOfDate);

    const report: WIPReport = {
      reportDate: new Date(),
      totalWIP,
      totalTimeWIP,
      totalExpenseWIP,
      totalMatters: new Set(wipEntries.map(e => e.matterId)).size,
      byMatter,
      byTimekeeper,
      byClient,
      aging,
      metrics,
    };

    this.logger.log(
      `WIP report complete: Total WIP $${totalWIP.toFixed(2)}, ` +
      `${wipEntries.length} entries, ${byMatter.length} matters`,
    );

    return report;
  }

  /**
   * Group WIP by matter
   */
  private groupByMatter(entries: WIPEntry[], asOfDate: Date): WIPByMatter[] {
    const matterMap = new Map<string, WIPEntry[]>();

    for (const entry of entries) {
      const matterEntries = matterMap.get(entry.matterId) || [];
      matterEntries.push(entry);
      matterMap.set(entry.matterId, matterEntries);
    }

    const result: WIPByMatter[] = [];

    for (const [matterId, matterEntries] of matterMap.entries()) {
      const timeWIP = matterEntries
        .filter(e => e.type === 'time')
        .reduce((sum, e) => sum + e.amount, 0);
      const expenseWIP = matterEntries
        .filter(e => e.type === 'expense')
        .reduce((sum, e) => sum + e.amount, 0);
      const hours = matterEntries
        .filter(e => e.type === 'time')
        .reduce((sum, e) => sum + (e.hours || 0), 0);

      const oldestEntry = matterEntries.reduce((oldest, e) =>
        e.entryDate < oldest.entryDate ? e : oldest,
      );
      const ageDays = this.calculateDaysSince(oldestEntry.entryDate, asOfDate);

      const hasHold = matterEntries.some(e => e.billingHold);
      const status = hasHold ? 'hold' : ageDays > 30 ? 'ready_to_bill' : 'active';

      result.push({
        matterId,
        matterName: matterEntries[0].matterName,
        clientId: matterEntries[0].clientId,
        clientName: matterEntries[0].clientName,
        timeWIP,
        expenseWIP,
        totalWIP: timeWIP + expenseWIP,
        hours,
        oldestEntryDate: oldestEntry.entryDate,
        ageDays,
        status,
      });
    }

    return result.sort((a, b) => b.totalWIP - a.totalWIP);
  }

  /**
   * Group WIP by timekeeper
   */
  private groupByTimekeeper(entries: WIPEntry[]): WIPByTimekeeper[] {
    const timekeeperMap = new Map<string, WIPEntry[]>();

    // Only process time entries
    const timeEntries = entries.filter(e => e.type === 'time' && e.timekeeperId);

    for (const entry of timeEntries) {
      const tkEntries = timekeeperMap.get(entry.timekeeperId!) || [];
      tkEntries.push(entry);
      timekeeperMap.set(entry.timekeeperId!, tkEntries);
    }

    const result: WIPByTimekeeper[] = [];

    for (const [timekeeperId, tkEntries] of timekeeperMap.entries()) {
      const totalWIP = tkEntries.reduce((sum, e) => sum + e.amount, 0);
      const hours = tkEntries.reduce((sum, e) => sum + (e.hours || 0), 0);
      const averageRate = hours > 0 ? totalWIP / hours : 0;
      const matterCount = new Set(tkEntries.map(e => e.matterId)).size;
      const oldestEntry = tkEntries.reduce((oldest, e) =>
        e.entryDate < oldest.entryDate ? e : oldest,
      );

      result.push({
        timekeeperId,
        timekeeperName: tkEntries[0].timekeeperName || '',
        classification: '', // Would fetch from timekeeper record
        totalWIP,
        hours,
        averageRate,
        matterCount,
        oldestEntry: oldestEntry.entryDate,
      });
    }

    return result.sort((a, b) => b.totalWIP - a.totalWIP);
  }

  /**
   * Group WIP by client
   */
  private groupByClient(entries: WIPEntry[], asOfDate: Date): WIPByClient[] {
    const clientMap = new Map<string, WIPEntry[]>();

    for (const entry of entries) {
      const clientEntries = clientMap.get(entry.clientId) || [];
      clientEntries.push(entry);
      clientMap.set(entry.clientId, clientEntries);
    }

    const result: WIPByClient[] = [];

    for (const [clientId, clientEntries] of clientMap.entries()) {
      const timeWIP = clientEntries
        .filter(e => e.type === 'time')
        .reduce((sum, e) => sum + e.amount, 0);
      const expenseWIP = clientEntries
        .filter(e => e.type === 'expense')
        .reduce((sum, e) => sum + e.amount, 0);
      const matterCount = new Set(clientEntries.map(e => e.matterId)).size;

      const oldestEntry = clientEntries.reduce((oldest, e) =>
        e.entryDate < oldest.entryDate ? e : oldest,
      );
      const oldestWIP = this.calculateDaysSince(oldestEntry.entryDate, asOfDate);

      const readyToBill = clientEntries
        .filter(e => !e.billingHold && this.calculateDaysSince(e.entryDate, asOfDate) > 30)
        .reduce((sum, e) => sum + e.amount, 0);

      result.push({
        clientId,
        clientName: clientEntries[0].clientName,
        totalWIP: timeWIP + expenseWIP,
        timeWIP,
        expenseWIP,
        matterCount,
        oldestWIP,
        readyToBill,
      });
    }

    return result.sort((a, b) => b.totalWIP - a.totalWIP);
  }

  /**
   * Calculate WIP aging buckets
   */
  private calculateWIPAging(entries: WIPEntry[], asOfDate: Date): WIPAging {
    let current = 0;
    let days30 = 0;
    let days60 = 0;
    let days90Plus = 0;

    for (const entry of entries) {
      const age = this.calculateDaysSince(entry.entryDate, asOfDate);

      if (age <= 30) {
        current += entry.amount;
      } else if (age <= 60) {
        days30 += entry.amount;
      } else if (age <= 90) {
        days60 += entry.amount;
      } else {
        days90Plus += entry.amount;
      }
    }

    const total = current + days30 + days60 + days90Plus;

    return {
      current,
      days30,
      days60,
      days90Plus,
      percentageCurrent: total > 0 ? (current / total) * 100 : 0,
      percentageStale: total > 0 ? (days90Plus / total) * 100 : 0,
    };
  }

  /**
   * Calculate WIP metrics
   */
  private async calculateWIPMetrics(entries: WIPEntry[], asOfDate: Date): Promise<WIPMetrics> {
    if (entries.length === 0) {
      return {
        averageWIPPerMatter: 0,
        averageAgeDays: 0,
        realizationRate: 0,
        workToDateRevenue: 0,
        unbilledToRevenue: 0,
        wipTurnoverDays: 0,
        staleWIPPercentage: 0,
      };
    }

    const totalWIP = entries.reduce((sum, e) => sum + e.amount, 0);
    const matterCount = new Set(entries.map(e => e.matterId)).size;
    const averageWIPPerMatter = matterCount > 0 ? totalWIP / matterCount : 0;

    // Average age
    const ages = entries.map(e => this.calculateDaysSince(e.entryDate, asOfDate));
    const averageAgeDays = ages.reduce((sum, age) => sum + age, 0) / ages.length;

    // Stale WIP (>90 days)
    const staleWIP = entries
      .filter(e => this.calculateDaysSince(e.entryDate, asOfDate) > 90)
      .reduce((sum, e) => sum + e.amount, 0);
    const staleWIPPercentage = totalWIP > 0 ? (staleWIP / totalWIP) * 100 : 0;

    // Mock additional metrics (would calculate from actual data)
    const realizationRate = 95; // Typically 90-100%
    const workToDateRevenue = totalWIP * 1.2; // Including billed amounts
    const unbilledToRevenue = (totalWIP / workToDateRevenue) * 100;
    const wipTurnoverDays = averageAgeDays; // Simplified

    return {
      averageWIPPerMatter,
      averageAgeDays,
      realizationRate,
      workToDateRevenue,
      unbilledToRevenue,
      wipTurnoverDays,
      staleWIPPercentage,
    };
  }

  /**
   * Generate WIP summary by practice area
   */
  async getWIPByPracticeArea(): Promise<any[]> {
    // Mock implementation
    return [
      { practiceArea: 'Litigation', totalWIP: 150000, matterCount: 15, averageAge: 45 },
      { practiceArea: 'Corporate', totalWIP: 120000, matterCount: 20, averageAge: 30 },
      { practiceArea: 'Real Estate', totalWIP: 85000, matterCount: 12, averageAge: 38 },
    ];
  }

  /**
   * Identify stale WIP for write-off consideration
   */
  async identifyStaleWIP(threshold: number = 180): Promise<any[]> {
    const entries = await this.getWIPEntries(new Date());
    const today = new Date();

    return entries
      .filter(e => this.calculateDaysSince(e.entryDate, today) > threshold)
      .map(e => ({
        entryId: e.id,
        matterId: e.matterId,
        matterName: e.matterName,
        clientName: e.clientName,
        amount: e.amount,
        ageDays: this.calculateDaysSince(e.entryDate, today),
        type: e.type,
        description: e.description,
        recommendation: 'Consider write-off or client discussion',
      }))
      .sort((a, b) => b.ageDays - a.ageDays);
  }

  /**
   * Generate prebill worksheet
   */
  async generatePrebillWorksheet(matterId: string): Promise<any> {
    const entries = await this.getWIPEntries(new Date(), { matterId });

    const timeEntries = entries.filter(e => e.type === 'time');
    const expenses = entries.filter(e => e.type === 'expense');

    const totalTime = timeEntries.reduce((sum, e) => sum + e.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalHours = timeEntries.reduce((sum, e) => sum + (e.hours || 0), 0);

    return {
      matterId,
      matterName: entries[0]?.matterName || '',
      clientName: entries[0]?.clientName || '',
      timeEntries: timeEntries.map(e => ({
        date: e.entryDate,
        timekeeper: e.timekeeperName,
        hours: e.hours,
        rate: e.rate,
        amount: e.amount,
        description: e.description,
      })),
      expenses: expenses.map(e => ({
        date: e.entryDate,
        description: e.description,
        amount: e.amount,
      })),
      summary: {
        totalHours,
        totalTime,
        totalExpenses,
        totalAmount: totalTime + totalExpenses,
      },
      readyToBill: !entries.some(e => e.billingHold),
    };
  }

  /**
   * Helper methods
   */
  private calculateDaysSince(date: Date, asOfDate: Date): number {
    const diffTime = asOfDate.getTime() - date.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  private async getWIPEntries(
    asOfDate: Date,
    options: {
      clientId?: string;
      matterId?: string;
      timekeeperId?: string;
      includeOnHold?: boolean;
    } = {},
  ): Promise<WIPEntry[]> {
    // Mock implementation - would query database
    return [];
  }
}
