import { Injectable, Logger } from '@nestjs/common';

/**
 * Accounts Receivable Aging Report Service
 * Tracks outstanding invoices by aging buckets
 */

export interface ARAgingBucket {
  range: string;
  daysMin: number;
  daysMax: number;
  amount: number;
  invoiceCount: number;
  percentage: number;
}

export interface ARAgingReport {
  reportDate: Date;
  periodEnd: Date;
  totalAR: number;
  totalInvoices: number;
  buckets: ARAgingBucket[];
  byClient: ARAgingByClient[];
  byMatter: ARAgingByMatter[];
  summary: ARAgingSummary;
  metrics: ARMetrics;
}

export interface ARAgingByClient {
  clientId: string;
  clientName: string;
  totalOutstanding: number;
  current: number;
  days30: number;
  days60: number;
  days90: number;
  days120Plus: number;
  oldestInvoiceDate: Date;
  oldestInvoiceDays: number;
  contactInfo: string;
}

export interface ARAgingByMatter {
  matterId: string;
  matterName: string;
  clientId: string;
  clientName: string;
  totalOutstanding: number;
  agingCategory: '0-30' | '31-60' | '61-90' | '91-120' | '120+';
  oldestInvoiceDate: Date;
  invoiceCount: number;
}

export interface ARAgingSummary {
  current: number; // 0-30 days
  days30: number; // 31-60 days
  days60: number; // 61-90 days
  days90: number; // 91-120 days
  days120Plus: number; // 120+ days
  percentageCurrent: number;
  percentageOverdue: number;
}

export interface ARMetrics {
  averageDaysOutstanding: number;
  medianDaysOutstanding: number;
  daysalesOutstanding: number; // DSO
  collectionEffectiveness: number;
  badDebtRisk: number;
  largestOutstanding: {
    clientId: string;
    clientName: string;
    amount: number;
  };
  oldestOutstanding: {
    invoiceId: string;
    clientName: string;
    amount: number;
    daysOutstanding: number;
  };
}

export interface ARTrend {
  period: string;
  totalAR: number;
  current: number;
  overdue: number;
  collectionRate: number;
}

export interface Invoice {
  id: string;
  clientId: string;
  clientName: string;
  matterId: string;
  matterName: string;
  amount: number;
  paidAmount: number;
  outstandingAmount: number;
  invoiceDate: Date;
  dueDate: Date;
  status: string;
}

@Injectable()
export class ARAgingService {
  private readonly logger = new Logger(ARAgingService.name);

  // Standard aging buckets
  private readonly AGING_BUCKETS = [
    { range: '0-30 days', daysMin: 0, daysMax: 30 },
    { range: '31-60 days', daysMin: 31, daysMax: 60 },
    { range: '61-90 days', daysMin: 61, daysMax: 90 },
    { range: '91-120 days', daysMin: 91, daysMax: 120 },
    { range: '120+ days', daysMin: 121, daysMax: 99999 },
  ];

  /**
   * Generate comprehensive AR aging report
   */
  async generateARAgingReport(
    asOfDate: Date = new Date(),
    options: {
      includeByClient?: boolean;
      includeByMatter?: boolean;
      clientId?: string;
      matterId?: string;
    } = {},
  ): Promise<ARAgingReport> {
    this.logger.log(`Generating AR aging report as of ${asOfDate.toISOString()}`);

    // Fetch outstanding invoices
    const invoices = await this.getOutstandingInvoices(asOfDate, options);

    // Calculate aging buckets
    const buckets = this.calculateAgingBuckets(invoices, asOfDate);

    // Calculate summary
    const summary = this.calculateSummary(buckets);

    // Group by client
    const byClient = options.includeByClient !== false
      ? await this.groupByClient(invoices, asOfDate)
      : [];

    // Group by matter
    const byMatter = options.includeByMatter !== false
      ? await this.groupByMatter(invoices, asOfDate)
      : [];

    // Calculate metrics
    const metrics = await this.calculateMetrics(invoices, asOfDate);

    const totalAR = invoices.reduce((sum, inv) => sum + inv.outstandingAmount, 0);

    const report: ARAgingReport = {
      reportDate: new Date(),
      periodEnd: asOfDate,
      totalAR,
      totalInvoices: invoices.length,
      buckets,
      byClient,
      byMatter,
      summary,
      metrics,
    };

    this.logger.log(
      `AR aging report complete: Total AR $${totalAR.toFixed(2)}, ` +
      `${invoices.length} invoices, ${summary.percentageOverdue.toFixed(1)}% overdue`,
    );

    return report;
  }

  /**
   * Calculate aging buckets
   */
  private calculateAgingBuckets(invoices: Invoice[], asOfDate: Date): ARAgingBucket[] {
    const buckets: ARAgingBucket[] = this.AGING_BUCKETS.map(bucket => ({
      ...bucket,
      amount: 0,
      invoiceCount: 0,
      percentage: 0,
    }));

    const totalAR = invoices.reduce((sum, inv) => sum + inv.outstandingAmount, 0);

    for (const invoice of invoices) {
      const daysOutstanding = this.calculateDaysOutstanding(invoice.invoiceDate, asOfDate);
      const bucket = buckets.find(
        b => daysOutstanding >= b.daysMin && daysOutstanding <= b.daysMax,
      );

      if (bucket) {
        bucket.amount += invoice.outstandingAmount;
        bucket.invoiceCount++;
      }
    }

    // Calculate percentages
    buckets.forEach(bucket => {
      bucket.percentage = totalAR > 0 ? (bucket.amount / totalAR) * 100 : 0;
    });

    return buckets;
  }

  /**
   * Group invoices by client
   */
  private async groupByClient(invoices: Invoice[], asOfDate: Date): Promise<ARAgingByClient[]> {
    const clientMap = new Map<string, Invoice[]>();

    // Group invoices by client
    for (const invoice of invoices) {
      const clientInvoices = clientMap.get(invoice.clientId) || [];
      clientInvoices.push(invoice);
      clientMap.set(invoice.clientId, clientInvoices);
    }

    const result: ARAgingByClient[] = [];

    for (const [clientId, clientInvoices] of clientMap.entries()) {
      const totalOutstanding = clientInvoices.reduce(
        (sum, inv) => sum + inv.outstandingAmount,
        0,
      );

      // Calculate aging breakdown
      const current = this.sumInvoicesInRange(clientInvoices, asOfDate, 0, 30);
      const days30 = this.sumInvoicesInRange(clientInvoices, asOfDate, 31, 60);
      const days60 = this.sumInvoicesInRange(clientInvoices, asOfDate, 61, 90);
      const days90 = this.sumInvoicesInRange(clientInvoices, asOfDate, 91, 120);
      const days120Plus = this.sumInvoicesInRange(clientInvoices, asOfDate, 121, 99999);

      // Find oldest invoice
      const oldestInvoice = clientInvoices.reduce((oldest, inv) =>
        inv.invoiceDate < oldest.invoiceDate ? inv : oldest,
      );
      const oldestInvoiceDays = this.calculateDaysOutstanding(
        oldestInvoice.invoiceDate,
        asOfDate,
      );

      result.push({
        clientId,
        clientName: clientInvoices[0].clientName,
        totalOutstanding,
        current,
        days30,
        days60,
        days90,
        days120Plus,
        oldestInvoiceDate: oldestInvoice.invoiceDate,
        oldestInvoiceDays,
        contactInfo: '', // Would fetch from client record
      });
    }

    // Sort by total outstanding descending
    return result.sort((a, b) => b.totalOutstanding - a.totalOutstanding);
  }

  /**
   * Group invoices by matter
   */
  private async groupByMatter(invoices: Invoice[], asOfDate: Date): Promise<ARAgingByMatter[]> {
    const matterMap = new Map<string, Invoice[]>();

    for (const invoice of invoices) {
      const matterInvoices = matterMap.get(invoice.matterId) || [];
      matterInvoices.push(invoice);
      matterMap.set(invoice.matterId, matterInvoices);
    }

    const result: ARAgingByMatter[] = [];

    for (const [matterId, matterInvoices] of matterMap.entries()) {
      const totalOutstanding = matterInvoices.reduce(
        (sum, inv) => sum + inv.outstandingAmount,
        0,
      );

      const oldestInvoice = matterInvoices.reduce((oldest, inv) =>
        inv.invoiceDate < oldest.invoiceDate ? inv : oldest,
      );
      const oldestDays = this.calculateDaysOutstanding(oldestInvoice.invoiceDate, asOfDate);

      result.push({
        matterId,
        matterName: matterInvoices[0].matterName,
        clientId: matterInvoices[0].clientId,
        clientName: matterInvoices[0].clientName,
        totalOutstanding,
        agingCategory: this.getAgingCategory(oldestDays),
        oldestInvoiceDate: oldestInvoice.invoiceDate,
        invoiceCount: matterInvoices.length,
      });
    }

    return result.sort((a, b) => b.totalOutstanding - a.totalOutstanding);
  }

  /**
   * Calculate summary statistics
   */
  private calculateSummary(buckets: ARAgingBucket[]): ARAgingSummary {
    const current = buckets.find(b => b.range === '0-30 days')?.amount || 0;
    const days30 = buckets.find(b => b.range === '31-60 days')?.amount || 0;
    const days60 = buckets.find(b => b.range === '61-90 days')?.amount || 0;
    const days90 = buckets.find(b => b.range === '91-120 days')?.amount || 0;
    const days120Plus = buckets.find(b => b.range === '120+ days')?.amount || 0;

    const total = current + days30 + days60 + days90 + days120Plus;
    const overdue = days30 + days60 + days90 + days120Plus;

    return {
      current,
      days30,
      days60,
      days90,
      days120Plus,
      percentageCurrent: total > 0 ? (current / total) * 100 : 0,
      percentageOverdue: total > 0 ? (overdue / total) * 100 : 0,
    };
  }

  /**
   * Calculate AR metrics
   */
  private async calculateMetrics(invoices: Invoice[], asOfDate: Date): Promise<ARMetrics> {
    if (invoices.length === 0) {
      return {
        averageDaysOutstanding: 0,
        medianDaysOutstanding: 0,
        daysalesOutstanding: 0,
        collectionEffectiveness: 0,
        badDebtRisk: 0,
        largestOutstanding: { clientId: '', clientName: '', amount: 0 },
        oldestOutstanding: { invoiceId: '', clientName: '', amount: 0, daysOutstanding: 0 },
      };
    }

    // Calculate days outstanding for each invoice
    const daysOutstanding = invoices.map(inv =>
      this.calculateDaysOutstanding(inv.invoiceDate, asOfDate),
    );

    // Average days outstanding
    const averageDaysOutstanding =
      daysOutstanding.reduce((sum, days) => sum + days, 0) / daysOutstanding.length;

    // Median days outstanding
    const sortedDays = [...daysOutstanding].sort((a, b) => a - b);
    const medianDaysOutstanding =
      sortedDays.length % 2 === 0
        ? (sortedDays[sortedDays.length / 2 - 1] + sortedDays[sortedDays.length / 2]) / 2
        : sortedDays[Math.floor(sortedDays.length / 2)];

    // Days Sales Outstanding (DSO) - simplified calculation
    const totalAR = invoices.reduce((sum, inv) => sum + inv.outstandingAmount, 0);
    const averageDailySales = totalAR / 90; // Assume 90-day period
    const dso = totalAR / (averageDailySales || 1);

    // Collection effectiveness
    const totalBilled = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const totalCollected = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
    const collectionEffectiveness = totalBilled > 0 ? (totalCollected / totalBilled) * 100 : 0;

    // Bad debt risk (simplified - invoices > 120 days)
    const overdueAmount = invoices
      .filter(inv => this.calculateDaysOutstanding(inv.invoiceDate, asOfDate) > 120)
      .reduce((sum, inv) => sum + inv.outstandingAmount, 0);
    const badDebtRisk = totalAR > 0 ? (overdueAmount / totalAR) * 100 : 0;

    // Largest outstanding
    const largestInvoice = invoices.reduce((largest, inv) =>
      inv.outstandingAmount > largest.outstandingAmount ? inv : largest,
    );

    // Oldest outstanding
    const oldestInvoice = invoices.reduce((oldest, inv) =>
      inv.invoiceDate < oldest.invoiceDate ? inv : oldest,
    );
    const oldestDays = this.calculateDaysOutstanding(oldestInvoice.invoiceDate, asOfDate);

    return {
      averageDaysOutstanding,
      medianDaysOutstanding,
      daysalesOutstanding: dso,
      collectionEffectiveness,
      badDebtRisk,
      largestOutstanding: {
        clientId: largestInvoice.clientId,
        clientName: largestInvoice.clientName,
        amount: largestInvoice.outstandingAmount,
      },
      oldestOutstanding: {
        invoiceId: oldestInvoice.id,
        clientName: oldestInvoice.clientName,
        amount: oldestInvoice.outstandingAmount,
        daysOutstanding: oldestDays,
      },
    };
  }

  /**
   * Get AR aging trends over time
   */
  async getARTrends(
    startDate: Date,
    endDate: Date,
    interval: 'monthly' | 'quarterly' = 'monthly',
  ): Promise<ARTrend[]> {
    this.logger.log(`Getting AR trends from ${startDate} to ${endDate}`);

    const trends: ARTrend[] = [];
    const periods = this.generatePeriods(startDate, endDate, interval);

    for (const period of periods) {
      const report = await this.generateARAgingReport(period.end, {
        includeByClient: false,
        includeByMatter: false,
      });

      trends.push({
        period: period.label,
        totalAR: report.totalAR,
        current: report.summary.current,
        overdue: report.summary.days30 + report.summary.days60 + report.summary.days90 + report.summary.days120Plus,
        collectionRate: report.metrics.collectionEffectiveness,
      });
    }

    return trends;
  }

  /**
   * Generate collection reminder list
   */
  async generateCollectionReminders(threshold: number = 30): Promise<any[]> {
    const invoices = await this.getOutstandingInvoices(new Date());
    const today = new Date();

    return invoices
      .filter(inv => this.calculateDaysOutstanding(inv.invoiceDate, today) >= threshold)
      .map(inv => ({
        invoiceId: inv.id,
        clientId: inv.clientId,
        clientName: inv.clientName,
        amount: inv.outstandingAmount,
        daysOutstanding: this.calculateDaysOutstanding(inv.invoiceDate, today),
        priority: this.calculatePriority(inv, today),
        recommendedAction: this.recommendAction(inv, today),
      }))
      .sort((a, b) => b.priority - a.priority);
  }

  /**
   * Helper methods
   */
  private calculateDaysOutstanding(invoiceDate: Date, asOfDate: Date): number {
    const diffTime = asOfDate.getTime() - invoiceDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  private sumInvoicesInRange(
    invoices: Invoice[],
    asOfDate: Date,
    minDays: number,
    maxDays: number,
  ): number {
    return invoices
      .filter(inv => {
        const days = this.calculateDaysOutstanding(inv.invoiceDate, asOfDate);
        return days >= minDays && days <= maxDays;
      })
      .reduce((sum, inv) => sum + inv.outstandingAmount, 0);
  }

  private getAgingCategory(days: number): '0-30' | '31-60' | '61-90' | '91-120' | '120+' {
    if (days <= 30) return '0-30';
    if (days <= 60) return '31-60';
    if (days <= 90) return '61-90';
    if (days <= 120) return '91-120';
    return '120+';
  }

  private generatePeriods(
    startDate: Date,
    endDate: Date,
    interval: 'monthly' | 'quarterly',
  ): Array<{ label: string; start: Date; end: Date }> {
    const periods: Array<{ label: string; start: Date; end: Date }> = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      const periodStart = new Date(current);
      const periodEnd = new Date(current);

      if (interval === 'monthly') {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 3);
      }

      periods.push({
        label: `${periodStart.getFullYear()}-${String(periodStart.getMonth() + 1).padStart(2, '0')}`,
        start: periodStart,
        end: periodEnd > endDate ? endDate : periodEnd,
      });

      current.setTime(periodEnd.getTime());
    }

    return periods;
  }

  private calculatePriority(invoice: Invoice, asOfDate: Date): number {
    const days = this.calculateDaysOutstanding(invoice.invoiceDate, asOfDate);
    const amount = invoice.outstandingAmount;

    // Priority based on days and amount
    let priority = days / 10; // Base priority on days
    if (amount > 10000) priority += 5;
    else if (amount > 5000) priority += 3;
    else if (amount > 1000) priority += 1;

    return priority;
  }

  private recommendAction(invoice: Invoice, asOfDate: Date): string {
    const days = this.calculateDaysOutstanding(invoice.invoiceDate, asOfDate);

    if (days > 120) return 'Consider collection agency or write-off';
    if (days > 90) return 'Send final notice, consider legal action';
    if (days > 60) return 'Phone call required, payment plan discussion';
    if (days > 30) return 'Send second reminder email';
    return 'Send friendly reminder email';
  }

  private async getOutstandingInvoices(
    asOfDate: Date,
    options: { clientId?: string; matterId?: string } = {},
  ): Promise<Invoice[]> {
    // Mock implementation - would query database
    return [];
  }
}
