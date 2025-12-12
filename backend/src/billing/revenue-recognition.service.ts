import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

/**
 * Revenue Recognition Service implementing GAAP-compliant revenue recognition
 * Following ASC 606 (Revenue from Contracts with Customers)
 */

export enum RecognitionMethod {
  CASH_BASIS = 'CASH_BASIS', // Recognize when paid
  ACCRUAL_BASIS = 'ACCRUAL_BASIS', // Recognize when earned
  PERCENTAGE_COMPLETION = 'PERCENTAGE_COMPLETION', // Recognize based on completion %
  MILESTONE = 'MILESTONE', // Recognize at specific milestones
  RETAINER_AMORTIZATION = 'RETAINER_AMORTIZATION', // Amortize retainer over time
}

export enum RevenueStatus {
  UNEARNED = 'UNEARNED', // Not yet earned
  EARNED_UNBILLED = 'EARNED_UNBILLED', // Work in progress
  BILLED_UNPAID = 'BILLED_UNPAID', // Accounts receivable
  RECOGNIZED = 'RECOGNIZED', // Fully recognized
  DEFERRED = 'DEFERRED', // Deferred revenue
}

export interface RevenueRecognition {
  id: string;
  matterId: string;
  clientId: string;
  contractAmount: number;
  recognizedAmount: number;
  deferredAmount: number;
  unbilledAmount: number;
  method: RecognitionMethod;
  status: RevenueStatus;
  periodStart: Date;
  periodEnd: Date;
  recognitionSchedule: RevenueScheduleItem[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface RevenueScheduleItem {
  id: string;
  period: string; // e.g., "2024-01"
  periodStart: Date;
  periodEnd: Date;
  amount: number;
  recognizedAmount: number;
  deferredAmount: number;
  percentageComplete?: number;
  milestone?: string;
  status: 'scheduled' | 'recognized' | 'adjusted';
  recognitionDate?: Date;
  adjustmentReason?: string;
}

export interface RevenueAllocation {
  performanceObligation: string;
  allocatedAmount: number;
  recognizedAmount: number;
  remainingAmount: number;
  completionPercentage: number;
}

export interface DeferredRevenue {
  id: string;
  clientId: string;
  matterId?: string;
  totalAmount: number;
  remainingAmount: number;
  amortizationPeriod: number; // months
  startDate: Date;
  endDate: Date;
  monthlyAmount: number;
  recognizedToDate: number;
  scheduleItems: DeferredRevenueItem[];
}

export interface DeferredRevenueItem {
  month: string;
  amount: number;
  recognitionDate: Date;
  isRecognized: boolean;
  actualRecognitionDate?: Date;
}

export interface RevenueJournalEntry {
  id: string;
  date: Date;
  revenueRecognitionId: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  description: string;
  fiscalPeriod: string;
}

@Injectable()
export class RevenueRecognitionService {
  private readonly logger = new Logger(RevenueRecognitionService.name);

  /**
   * Create revenue recognition schedule
   */
  async createRevenueRecognition(
    matterId: string,
    clientId: string,
    contractAmount: number,
    method: RecognitionMethod,
    periodStart: Date,
    periodEnd: Date,
    options: {
      milestones?: Array<{ name: string; percentage: number; date: Date }>;
      retainerMonths?: number;
      metadata?: Record<string, any>;
    } = {},
  ): Promise<RevenueRecognition> {
    this.logger.log(`Creating revenue recognition for matter ${matterId} using ${method}`);

    const schedule = await this.generateRecognitionSchedule(
      contractAmount,
      method,
      periodStart,
      periodEnd,
      options,
    );

    const recognition: RevenueRecognition = {
      id: this.generateId(),
      matterId,
      clientId,
      contractAmount,
      recognizedAmount: 0,
      deferredAmount: contractAmount,
      unbilledAmount: 0,
      method,
      status: RevenueStatus.UNEARNED,
      periodStart,
      periodEnd,
      recognitionSchedule: schedule,
      metadata: options.metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.logger.log(`Created revenue recognition schedule with ${schedule.length} periods`);
    return recognition;
  }

  /**
   * Generate recognition schedule based on method
   */
  private async generateRecognitionSchedule(
    contractAmount: number,
    method: RecognitionMethod,
    periodStart: Date,
    periodEnd: Date,
    options: any,
  ): Promise<RevenueScheduleItem[]> {
    switch (method) {
      case RecognitionMethod.CASH_BASIS:
        return this.generateCashBasisSchedule(contractAmount);

      case RecognitionMethod.ACCRUAL_BASIS:
        return this.generateAccrualBasisSchedule(contractAmount, periodStart, periodEnd);

      case RecognitionMethod.PERCENTAGE_COMPLETION:
        return this.generatePercentageCompletionSchedule(contractAmount, periodStart, periodEnd);

      case RecognitionMethod.MILESTONE:
        return this.generateMilestoneSchedule(contractAmount, options.milestones);

      case RecognitionMethod.RETAINER_AMORTIZATION:
        return this.generateRetainerAmortizationSchedule(
          contractAmount,
          periodStart,
          options.retainerMonths || 12,
        );

      default:
        return this.generateAccrualBasisSchedule(contractAmount, periodStart, periodEnd);
    }
  }

  /**
   * Generate cash basis schedule
   */
  private generateCashBasisSchedule(contractAmount: number): RevenueScheduleItem[] {
    return [{
      id: this.generateId(),
      period: 'on-payment',
      periodStart: new Date(),
      periodEnd: new Date(),
      amount: contractAmount,
      recognizedAmount: 0,
      deferredAmount: contractAmount,
      status: 'scheduled',
    }];
  }

  /**
   * Generate accrual basis schedule
   */
  private generateAccrualBasisSchedule(
    contractAmount: number,
    periodStart: Date,
    periodEnd: Date,
  ): RevenueScheduleItem[] {
    const months = this.getMonthsBetween(periodStart, periodEnd);
    const monthlyAmount = contractAmount / months.length;

    return months.map((month, index) => ({
      id: this.generateId(),
      period: month.period,
      periodStart: month.start,
      periodEnd: month.end,
      amount: monthlyAmount,
      recognizedAmount: 0,
      deferredAmount: monthlyAmount,
      percentageComplete: ((index + 1) / months.length) * 100,
      status: 'scheduled' as const,
    }));
  }

  /**
   * Generate percentage of completion schedule
   */
  private generatePercentageCompletionSchedule(
    contractAmount: number,
    periodStart: Date,
    periodEnd: Date,
  ): RevenueScheduleItem[] {
    // Similar to accrual but recognition depends on actual completion percentage
    return this.generateAccrualBasisSchedule(contractAmount, periodStart, periodEnd).map(item => ({
      ...item,
      percentageComplete: 0, // Will be updated based on actual work completion
    }));
  }

  /**
   * Generate milestone-based schedule
   */
  private generateMilestoneSchedule(
    contractAmount: number,
    milestones: Array<{ name: string; percentage: number; date: Date }>,
  ): RevenueScheduleItem[] {
    if (!milestones || milestones.length === 0) {
      return this.generateCashBasisSchedule(contractAmount);
    }

    return milestones.map((milestone, index) => ({
      id: this.generateId(),
      period: `milestone-${index + 1}`,
      periodStart: milestone.date,
      periodEnd: milestone.date,
      amount: (contractAmount * milestone.percentage) / 100,
      recognizedAmount: 0,
      deferredAmount: (contractAmount * milestone.percentage) / 100,
      percentageComplete: milestone.percentage,
      milestone: milestone.name,
      status: 'scheduled' as const,
    }));
  }

  /**
   * Generate retainer amortization schedule
   */
  private generateRetainerAmortizationSchedule(
    contractAmount: number,
    periodStart: Date,
    months: number,
  ): RevenueScheduleItem[] {
    const monthlyAmount = contractAmount / months;
    const schedule: RevenueScheduleItem[] = [];

    for (let i = 0; i < months; i++) {
      const monthStart = new Date(periodStart);
      monthStart.setMonth(monthStart.getMonth() + i);

      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      monthEnd.setDate(0); // Last day of month

      schedule.push({
        id: this.generateId(),
        period: `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`,
        periodStart: monthStart,
        periodEnd: monthEnd,
        amount: monthlyAmount,
        recognizedAmount: 0,
        deferredAmount: monthlyAmount,
        percentageComplete: ((i + 1) / months) * 100,
        status: 'scheduled',
      });
    }

    return schedule;
  }

  /**
   * Recognize revenue for a period
   */
  async recognizeRevenue(
    recognitionId: string,
    periodId: string,
    options: {
      actualAmount?: number;
      completionPercentage?: number;
      recognitionDate?: Date;
      notes?: string;
    } = {},
  ): Promise<RevenueRecognition> {
    this.logger.log(`Recognizing revenue for period ${periodId}`);

    // Fetch recognition record (mock)
    const recognition = await this.getRevenueRecognition(recognitionId);
    const scheduleItem = recognition.recognitionSchedule.find(s => s.id === periodId);

    if (!scheduleItem) {
      throw new Error(`Schedule item ${periodId} not found`);
    }

    // Calculate amount to recognize
    let amountToRecognize = scheduleItem.amount;

    if (recognition.method === RecognitionMethod.PERCENTAGE_COMPLETION && options.completionPercentage) {
      amountToRecognize = (recognition.contractAmount * options.completionPercentage) / 100;
      amountToRecognize -= recognition.recognizedAmount; // Only recognize the incremental amount
    }

    if (options.actualAmount) {
      amountToRecognize = options.actualAmount;
    }

    // Update schedule item
    scheduleItem.recognizedAmount = amountToRecognize;
    scheduleItem.deferredAmount -= amountToRecognize;
    scheduleItem.status = 'recognized';
    scheduleItem.recognitionDate = options.recognitionDate || new Date();

    if (options.completionPercentage) {
      scheduleItem.percentageComplete = options.completionPercentage;
    }

    // Update recognition totals
    recognition.recognizedAmount += amountToRecognize;
    recognition.deferredAmount -= amountToRecognize;
    recognition.updatedAt = new Date();

    // Update status
    if (recognition.recognizedAmount >= recognition.contractAmount) {
      recognition.status = RevenueStatus.RECOGNIZED;
    } else if (recognition.recognizedAmount > 0) {
      recognition.status = RevenueStatus.EARNED_UNBILLED;
    }

    // Create journal entry
    await this.createJournalEntry(recognition, scheduleItem, amountToRecognize);

    this.logger.log(`Recognized revenue: $${amountToRecognize.toFixed(2)}`);
    return recognition;
  }

  /**
   * Create deferred revenue schedule
   */
  async createDeferredRevenue(
    clientId: string,
    amount: number,
    amortizationMonths: number,
    startDate: Date,
    matterId?: string,
  ): Promise<DeferredRevenue> {
    const monthlyAmount = amount / amortizationMonths;
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + amortizationMonths);

    const scheduleItems: DeferredRevenueItem[] = [];

    for (let i = 0; i < amortizationMonths; i++) {
      const recognitionDate = new Date(startDate);
      recognitionDate.setMonth(recognitionDate.getMonth() + i);

      scheduleItems.push({
        month: `${recognitionDate.getFullYear()}-${String(recognitionDate.getMonth() + 1).padStart(2, '0')}`,
        amount: monthlyAmount,
        recognitionDate,
        isRecognized: false,
      });
    }

    const deferredRevenue: DeferredRevenue = {
      id: this.generateId(),
      clientId,
      matterId,
      totalAmount: amount,
      remainingAmount: amount,
      amortizationPeriod: amortizationMonths,
      startDate,
      endDate,
      monthlyAmount,
      recognizedToDate: 0,
      scheduleItems,
    };

    this.logger.log(`Created deferred revenue schedule for $${amount} over ${amortizationMonths} months`);
    return deferredRevenue;
  }

  /**
   * Process monthly revenue recognition - runs on 1st of each month
   */
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async processMonthlyRevenue(): Promise<void> {
    this.logger.log('Processing monthly revenue recognition...');

    try {
      const currentMonth = this.getCurrentPeriod();
      const dueRecognitions = await this.getDueRevenueRecognitions(currentMonth);

      this.logger.log(`Found ${dueRecognitions.length} revenue items to recognize`);

      for (const recognition of dueRecognitions) {
        await this.processMonthlyRecognition(recognition, currentMonth);
      }

      this.logger.log('Completed monthly revenue recognition');
    } catch (error) {
      this.logger.error(`Error processing monthly revenue: ${error.message}`);
    }
  }

  /**
   * Process single revenue recognition for the month
   */
  private async processMonthlyRecognition(
    recognition: RevenueRecognition,
    period: string,
  ): Promise<void> {
    const scheduleItem = recognition.recognitionSchedule.find(
      s => s.period === period && s.status === 'scheduled',
    );

    if (scheduleItem) {
      await this.recognizeRevenue(recognition.id, scheduleItem.id);
    }
  }

  /**
   * Create journal entry for revenue recognition
   */
  private async createJournalEntry(
    recognition: RevenueRecognition,
    scheduleItem: RevenueScheduleItem,
    amount: number,
  ): Promise<RevenueJournalEntry> {
    const entry: RevenueJournalEntry = {
      id: this.generateId(),
      date: scheduleItem.recognitionDate || new Date(),
      revenueRecognitionId: recognition.id,
      debitAccount: recognition.method === RecognitionMethod.CASH_BASIS ? 'Cash' : 'Accounts Receivable',
      creditAccount: 'Revenue',
      amount,
      description: `Revenue recognition for matter ${recognition.matterId} - ${scheduleItem.period}`,
      fiscalPeriod: scheduleItem.period,
    };

    this.logger.log(`Created journal entry: DR ${entry.debitAccount} / CR ${entry.creditAccount} $${amount}`);
    return entry;
  }

  /**
   * Get revenue recognition report
   */
  async getRevenueReport(
    startDate: Date,
    endDate: Date,
    clientId?: string,
  ): Promise<any> {
    return {
      period: {
        start: startDate,
        end: endDate,
      },
      summary: {
        totalRecognized: 0,
        totalDeferred: 0,
        totalUnbilled: 0,
        totalBilledUnpaid: 0,
      },
      byMethod: {},
      byClient: {},
      byMatter: {},
    };
  }

  /**
   * Helper methods
   */
  private getMonthsBetween(startDate: Date, endDate: Date): Array<{ period: string; start: Date; end: Date }> {
    const months: Array<{ period: string; start: Date; end: Date }> = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);

      months.push({
        period: `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`,
        start: new Date(current),
        end: monthEnd > endDate ? endDate : monthEnd,
      });

      current.setMonth(current.getMonth() + 1);
    }

    return months;
  }

  private getCurrentPeriod(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  private async getRevenueRecognition(id: string): Promise<RevenueRecognition> {
    // Mock implementation
    throw new Error('Not implemented');
  }

  private async getDueRevenueRecognitions(period: string): Promise<RevenueRecognition[]> {
    // Mock implementation
    return [];
  }

  private generateId(): string {
    return `rev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
