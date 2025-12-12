import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

export interface LateFeeConfig {
  id: string;
  clientId?: string;
  feeType: 'PERCENTAGE' | 'FLAT' | 'COMPOUND';
  feeAmount: number; // Percentage (e.g., 1.5) or flat amount
  gracePeriodDays: number;
  maxFeeAmount?: number; // Maximum late fee cap
  applyMonthly: boolean; // Apply fee monthly vs once
  compoundFrequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY'; // For compound interest
  isActive: boolean;
}

export interface LateFeeCalculation {
  invoiceId: string;
  principalAmount: number;
  daysOverdue: number;
  lateFeeAmount: number;
  totalAmount: number;
  calculationDate: Date;
  feeBreakdown: LateFeeBreakdownItem[];
}

export interface LateFeeBreakdownItem {
  date: Date;
  daysOverdue: number;
  feeAmount: number;
  cumulativeFee: number;
  calculation: string;
}

export interface LateFeeSchedule {
  invoiceId: string;
  dueDate: Date;
  gracePeriodEnd: Date;
  firstLateFeeDate: Date;
  projectedFees: {
    days30: number;
    days60: number;
    days90: number;
    days120: number;
  };
}

export interface Invoice {
  id: string;
  clientId: string;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  lateFees: number;
  appliedLateFees: LateFeeApplication[];
}

export interface LateFeeApplication {
  id: string;
  invoiceId: string;
  applicationDate: Date;
  daysOverdue: number;
  feeAmount: number;
  feeType: string;
  isWaived: boolean;
  waivedReason?: string;
  waivedBy?: string;
  waivedDate?: Date;
}

@Injectable()
export class LateFeeService {
  private readonly logger = new Logger(LateFeeService.name);

  // Default configuration
  private readonly DEFAULT_CONFIG: Omit<LateFeeConfig, 'id'> = {
    feeType: 'PERCENTAGE',
    feeAmount: 1.5, // 1.5% per month
    gracePeriodDays: 30,
    maxFeeAmount: 1000, // $1000 max late fee
    applyMonthly: true,
    isActive: true,
  };

  /**
   * Calculate late fee for an invoice
   */
  async calculateLateFee(
    invoice: Invoice,
    config?: LateFeeConfig,
  ): Promise<LateFeeCalculation> {
    const feeConfig = config || this.getDefaultConfig();
    const today = new Date();
    const dueDate = new Date(invoice.dueDate);

    // Calculate days overdue
    const daysOverdue = this.calculateDaysOverdue(dueDate, today);

    // Check if within grace period
    if (daysOverdue <= feeConfig.gracePeriodDays) {
      return {
        invoiceId: invoice.id,
        principalAmount: invoice.amount,
        daysOverdue,
        lateFeeAmount: 0,
        totalAmount: invoice.amount,
        calculationDate: today,
        feeBreakdown: [],
      };
    }

    // Calculate effective overdue days (after grace period)
    const effectiveOverdueDays = daysOverdue - feeConfig.gracePeriodDays;

    // Calculate fee based on type
    let lateFeeAmount = 0;
    const feeBreakdown: LateFeeBreakdownItem[] = [];

    switch (feeConfig.feeType) {
      case 'PERCENTAGE':
        lateFeeAmount = this.calculatePercentageFee(
          invoice.amount,
          effectiveOverdueDays,
          feeConfig,
          feeBreakdown,
        );
        break;
      case 'FLAT':
        lateFeeAmount = this.calculateFlatFee(
          effectiveOverdueDays,
          feeConfig,
          feeBreakdown,
        );
        break;
      case 'COMPOUND':
        lateFeeAmount = this.calculateCompoundFee(
          invoice.amount,
          effectiveOverdueDays,
          feeConfig,
          feeBreakdown,
        );
        break;
    }

    // Apply maximum fee cap if configured
    if (feeConfig.maxFeeAmount && lateFeeAmount > feeConfig.maxFeeAmount) {
      lateFeeAmount = feeConfig.maxFeeAmount;
    }

    return {
      invoiceId: invoice.id,
      principalAmount: invoice.amount,
      daysOverdue,
      lateFeeAmount: this.roundToTwoDecimals(lateFeeAmount),
      totalAmount: this.roundToTwoDecimals(invoice.amount + lateFeeAmount),
      calculationDate: today,
      feeBreakdown,
    };
  }

  /**
   * Calculate percentage-based late fee
   */
  private calculatePercentageFee(
    principalAmount: number,
    effectiveOverdueDays: number,
    config: LateFeeConfig,
    breakdown: LateFeeBreakdownItem[],
  ): number {
    const monthlyRate = config.feeAmount / 100; // Convert percentage to decimal

    if (config.applyMonthly) {
      // Calculate number of complete months overdue
      const monthsOverdue = Math.floor(effectiveOverdueDays / 30);

      for (let i = 1; i <= monthsOverdue; i++) {
        const feeAmount = principalAmount * monthlyRate;
        const cumulativeFee = feeAmount * i;

        breakdown.push({
          date: this.addDays(new Date(), effectiveOverdueDays - (monthsOverdue - i) * 30),
          daysOverdue: i * 30,
          feeAmount,
          cumulativeFee,
          calculation: `${principalAmount} × ${config.feeAmount}% × ${i} months`,
        });
      }

      return principalAmount * monthlyRate * monthsOverdue;
    } else {
      // Apply once
      const feeAmount = principalAmount * monthlyRate;
      breakdown.push({
        date: new Date(),
        daysOverdue: effectiveOverdueDays,
        feeAmount,
        cumulativeFee: feeAmount,
        calculation: `${principalAmount} × ${config.feeAmount}%`,
      });
      return feeAmount;
    }
  }

  /**
   * Calculate flat late fee
   */
  private calculateFlatFee(
    effectiveOverdueDays: number,
    config: LateFeeConfig,
    breakdown: LateFeeBreakdownItem[],
  ): number {
    if (config.applyMonthly) {
      const monthsOverdue = Math.floor(effectiveOverdueDays / 30);
      const totalFee = config.feeAmount * monthsOverdue;

      for (let i = 1; i <= monthsOverdue; i++) {
        breakdown.push({
          date: this.addDays(new Date(), effectiveOverdueDays - (monthsOverdue - i) * 30),
          daysOverdue: i * 30,
          feeAmount: config.feeAmount,
          cumulativeFee: config.feeAmount * i,
          calculation: `$${config.feeAmount} × ${i} months`,
        });
      }

      return totalFee;
    } else {
      breakdown.push({
        date: new Date(),
        daysOverdue: effectiveOverdueDays,
        feeAmount: config.feeAmount,
        cumulativeFee: config.feeAmount,
        calculation: `Flat fee: $${config.feeAmount}`,
      });
      return config.feeAmount;
    }
  }

  /**
   * Calculate compound interest late fee
   */
  private calculateCompoundFee(
    principalAmount: number,
    effectiveOverdueDays: number,
    config: LateFeeConfig,
    breakdown: LateFeeBreakdownItem[],
  ): number {
    const annualRate = config.feeAmount / 100;
    let periodsPerYear: number;
    let periodDays: number;

    switch (config.compoundFrequency) {
      case 'DAILY':
        periodsPerYear = 365;
        periodDays = 1;
        break;
      case 'WEEKLY':
        periodsPerYear = 52;
        periodDays = 7;
        break;
      case 'MONTHLY':
      default:
        periodsPerYear = 12;
        periodDays = 30;
        break;
    }

    const ratePerPeriod = annualRate / periodsPerYear;
    const numberOfPeriods = Math.floor(effectiveOverdueDays / periodDays);

    // Compound interest formula: A = P(1 + r)^n
    const totalAmount = principalAmount * Math.pow(1 + ratePerPeriod, numberOfPeriods);
    const compoundFee = totalAmount - principalAmount;

    // Add breakdown entries for each compounding period
    let currentAmount = principalAmount;
    for (let i = 1; i <= Math.min(numberOfPeriods, 12); i++) { // Limit breakdown to 12 entries
      const periodFee = currentAmount * ratePerPeriod;
      currentAmount += periodFee;

      breakdown.push({
        date: this.addDays(new Date(), effectiveOverdueDays - (numberOfPeriods - i) * periodDays),
        daysOverdue: i * periodDays,
        feeAmount: periodFee,
        cumulativeFee: currentAmount - principalAmount,
        calculation: `Compound: ${principalAmount} × (1 + ${(ratePerPeriod * 100).toFixed(4)}%)^${i}`,
      });
    }

    return compoundFee;
  }

  /**
   * Generate late fee schedule/projection
   */
  async generateLateFeeSchedule(
    invoice: Invoice,
    config?: LateFeeConfig,
  ): Promise<LateFeeSchedule> {
    const feeConfig = config || this.getDefaultConfig();
    const dueDate = new Date(invoice.dueDate);
    const gracePeriodEnd = this.addDays(dueDate, feeConfig.gracePeriodDays);
    const firstLateFeeDate = this.addDays(gracePeriodEnd, 1);

    // Calculate projected fees for 30, 60, 90, and 120 days
    const projections = {
      days30: 0,
      days60: 0,
      days90: 0,
      days120: 0,
    };

    for (const [key, days] of Object.entries({ days30: 30, days60: 60, days90: 90, days120: 120 })) {
      const mockInvoice = {
        ...invoice,
        dueDate: this.subtractDays(new Date(), days),
      };
      const calculation = await this.calculateLateFee(mockInvoice, feeConfig);
      projections[key] = calculation.lateFeeAmount;
    }

    return {
      invoiceId: invoice.id,
      dueDate,
      gracePeriodEnd,
      firstLateFeeDate,
      projectedFees: projections,
    };
  }

  /**
   * Apply late fees to overdue invoices - runs daily
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async applyLateFees(): Promise<void> {
    this.logger.log('Applying late fees to overdue invoices...');

    try {
      const overdueInvoices = await this.getOverdueInvoices();
      this.logger.log(`Found ${overdueInvoices.length} overdue invoices`);

      for (const invoice of overdueInvoices) {
        await this.applyLateFeeToInvoice(invoice);
      }

      this.logger.log('Completed applying late fees');
    } catch (error) {
      this.logger.error(`Error applying late fees: ${error.message}`);
    }
  }

  /**
   * Apply late fee to a single invoice
   */
  private async applyLateFeeToInvoice(invoice: Invoice): Promise<void> {
    try {
      const config = await this.getClientLateFeeConfig(invoice.clientId);

      if (!config.isActive) {
        this.logger.log(`Late fees disabled for client ${invoice.clientId}`);
        return;
      }

      const calculation = await this.calculateLateFee(invoice, config);

      if (calculation.lateFeeAmount > 0) {
        const application: LateFeeApplication = {
          id: this.generateId(),
          invoiceId: invoice.id,
          applicationDate: new Date(),
          daysOverdue: calculation.daysOverdue,
          feeAmount: calculation.lateFeeAmount,
          feeType: config.feeType,
          isWaived: false,
        };

        // Save late fee application
        invoice.lateFees += calculation.lateFeeAmount;
        invoice.appliedLateFees.push(application);

        this.logger.log(
          `Applied late fee of $${calculation.lateFeeAmount} to invoice ${invoice.id} ` +
          `(${calculation.daysOverdue} days overdue)`,
        );
      }
    } catch (error) {
      this.logger.error(`Failed to apply late fee to invoice ${invoice.id}: ${error.message}`);
    }
  }

  /**
   * Waive a late fee
   */
  async waiveLateFee(
    applicationId: string,
    reason: string,
    waivedBy: string,
  ): Promise<LateFeeApplication> {
    // Mock implementation
    const application: LateFeeApplication = {
      id: applicationId,
      invoiceId: 'inv_123',
      applicationDate: new Date(),
      daysOverdue: 45,
      feeAmount: 50,
      feeType: 'PERCENTAGE',
      isWaived: true,
      waivedReason: reason,
      waivedBy,
      waivedDate: new Date(),
    };

    this.logger.log(`Waived late fee ${applicationId}: ${reason}`);
    return application;
  }

  /**
   * Get client-specific late fee configuration
   */
  private async getClientLateFeeConfig(clientId: string): Promise<LateFeeConfig> {
    // Mock implementation - would query database
    return this.getDefaultConfig();
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): LateFeeConfig {
    return {
      id: 'default',
      ...this.DEFAULT_CONFIG,
    };
  }

  /**
   * Get overdue invoices
   */
  private async getOverdueInvoices(): Promise<Invoice[]> {
    // Mock implementation - would query database
    return [];
  }

  /**
   * Calculate days overdue
   */
  private calculateDaysOverdue(dueDate: Date, currentDate: Date): number {
    const diffTime = currentDate.getTime() - dueDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  /**
   * Add days to a date
   */
  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Subtract days from a date
   */
  private subtractDays(date: Date, days: number): Date {
    return this.addDays(date, -days);
  }

  /**
   * Round to two decimal places
   */
  private roundToTwoDecimals(value: number): number {
    return Math.round(value * 100) / 100;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `lf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get late fee summary for a client
   */
  async getClientLateFeesSummary(clientId: string): Promise<any> {
    return {
      clientId,
      totalLateFees: 0,
      activeLateFees: 0,
      waivedLateFees: 0,
      overdueInvoices: 0,
      averageDaysOverdue: 0,
      projectedLateFees30Days: 0,
    };
  }
}
