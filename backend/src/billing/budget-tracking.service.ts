import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

export enum BudgetType {
  FIXED = 'FIXED', // Fixed matter budget
  PHASE = 'PHASE', // Budget by case phase
  CATEGORY = 'CATEGORY', // Budget by expense category
  MONTHLY = 'MONTHLY', // Monthly spending limit
  ANNUAL = 'ANNUAL', // Annual budget
}

export enum BudgetStatus {
  ACTIVE = 'ACTIVE',
  WARNING = 'WARNING', // Approaching limit
  EXCEEDED = 'EXCEEDED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum AlertThreshold {
  THRESHOLD_50 = 50,
  THRESHOLD_75 = 75,
  THRESHOLD_90 = 90,
  THRESHOLD_100 = 100,
}

export interface MatterBudget {
  id: string;
  matterId: string;
  clientId: string;
  type: BudgetType;
  totalBudget: number;
  spentAmount: number;
  committedAmount: number; // Committed but not yet billed
  availableAmount: number;
  currency: string;
  startDate: Date;
  endDate?: Date;
  status: BudgetStatus;
  alertThresholds: AlertThreshold[];
  notificationEmails: string[];
  phaseBudgets?: PhaseBudget[];
  categoryBudgets?: CategoryBudget[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface PhaseBudget {
  phaseId: string;
  phaseName: string;
  budgetAmount: number;
  spentAmount: number;
  percentageOfTotal: number;
  status: BudgetStatus;
}

export interface CategoryBudget {
  category: string; // e.g., 'Attorney Fees', 'Expert Fees', 'Court Costs'
  budgetAmount: number;
  spentAmount: number;
  percentageOfTotal: number;
  status: BudgetStatus;
}

export interface BudgetAlert {
  id: string;
  budgetId: string;
  matterId: string;
  alertType: 'threshold' | 'exceeded' | 'projected_overrun';
  threshold?: number;
  currentSpend: number;
  budgetAmount: number;
  utilizationPercentage: number;
  message: string;
  sentAt: Date;
  recipients: string[];
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

export interface BudgetProjection {
  budgetId: string;
  currentSpend: number;
  currentUtilization: number;
  projectedSpend: number;
  projectedUtilization: number;
  projectedCompletionDate: Date;
  daysRemaining: number;
  burnRate: number; // Daily burn rate
  projectedOverrun: number;
  confidence: number; // 0-100 confidence score
  recommendations: string[];
}

export interface BudgetVariance {
  budgetId: string;
  period: string;
  plannedAmount: number;
  actualAmount: number;
  variance: number;
  variancePercentage: number;
  isFavorable: boolean;
  explanation?: string;
}

export interface BudgetAllocation {
  budgetId: string;
  allocations: {
    attorney: string;
    allocatedAmount: number;
    spentAmount: number;
    hours: number;
    rate: number;
  }[];
}

@Injectable()
export class BudgetTrackingService {
  private readonly logger = new Logger(BudgetTrackingService.name);

  /**
   * Create a new matter budget
   */
  async createBudget(
    matterId: string,
    clientId: string,
    totalBudget: number,
    options: {
      type?: BudgetType;
      startDate?: Date;
      endDate?: Date;
      alertThresholds?: AlertThreshold[];
      notificationEmails?: string[];
      phaseBudgets?: Partial<PhaseBudget>[];
      categoryBudgets?: Partial<CategoryBudget>[];
      currency?: string;
      metadata?: Record<string, any>;
    } = {},
  ): Promise<MatterBudget> {
    this.logger.log(`Creating budget for matter ${matterId}: $${totalBudget}`);

    const budget: MatterBudget = {
      id: this.generateId(),
      matterId,
      clientId,
      type: options.type || BudgetType.FIXED,
      totalBudget,
      spentAmount: 0,
      committedAmount: 0,
      availableAmount: totalBudget,
      currency: options.currency || 'USD',
      startDate: options.startDate || new Date(),
      endDate: options.endDate,
      status: BudgetStatus.ACTIVE,
      alertThresholds: options.alertThresholds || [
        AlertThreshold.THRESHOLD_75,
        AlertThreshold.THRESHOLD_90,
        AlertThreshold.THRESHOLD_100,
      ],
      notificationEmails: options.notificationEmails || [],
      phaseBudgets: this.initializePhaseBudgets(options.phaseBudgets, totalBudget),
      categoryBudgets: this.initializeCategoryBudgets(options.categoryBudgets, totalBudget),
      metadata: options.metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.logger.log(`Created budget ${budget.id} for matter ${matterId}`);
    return budget;
  }

  /**
   * Initialize phase budgets
   */
  private initializePhaseBudgets(
    phaseBudgets: Partial<PhaseBudget>[] | undefined,
    totalBudget: number,
  ): PhaseBudget[] | undefined {
    if (!phaseBudgets || phaseBudgets.length === 0) {
      return undefined;
    }

    return phaseBudgets.map(pb => ({
      phaseId: pb.phaseId!,
      phaseName: pb.phaseName!,
      budgetAmount: pb.budgetAmount!,
      spentAmount: 0,
      percentageOfTotal: (pb.budgetAmount! / totalBudget) * 100,
      status: BudgetStatus.ACTIVE,
    }));
  }

  /**
   * Initialize category budgets
   */
  private initializeCategoryBudgets(
    categoryBudgets: Partial<CategoryBudget>[] | undefined,
    totalBudget: number,
  ): CategoryBudget[] | undefined {
    if (!categoryBudgets || categoryBudgets.length === 0) {
      return undefined;
    }

    return categoryBudgets.map(cb => ({
      category: cb.category!,
      budgetAmount: cb.budgetAmount!,
      spentAmount: 0,
      percentageOfTotal: (cb.budgetAmount! / totalBudget) * 100,
      status: BudgetStatus.ACTIVE,
    }));
  }

  /**
   * Update budget spending
   */
  async updateBudgetSpending(
    budgetId: string,
    amount: number,
    options: {
      phaseId?: string;
      category?: string;
      isCommitted?: boolean;
    } = {},
  ): Promise<MatterBudget> {
    const budget = await this.getBudget(budgetId);

    if (options.isCommitted) {
      budget.committedAmount += amount;
    } else {
      budget.spentAmount += amount;

      // Update phase budget if applicable
      if (options.phaseId && budget.phaseBudgets) {
        const phaseBudget = budget.phaseBudgets.find(pb => pb.phaseId === options.phaseId);
        if (phaseBudget) {
          phaseBudget.spentAmount += amount;
          phaseBudget.status = this.calculateBudgetStatus(
            phaseBudget.spentAmount,
            phaseBudget.budgetAmount,
          );
        }
      }

      // Update category budget if applicable
      if (options.category && budget.categoryBudgets) {
        const categoryBudget = budget.categoryBudgets.find(cb => cb.category === options.category);
        if (categoryBudget) {
          categoryBudget.spentAmount += amount;
          categoryBudget.status = this.calculateBudgetStatus(
            categoryBudget.spentAmount,
            categoryBudget.budgetAmount,
          );
        }
      }
    }

    budget.availableAmount = budget.totalBudget - budget.spentAmount - budget.committedAmount;
    budget.status = this.calculateBudgetStatus(budget.spentAmount, budget.totalBudget);
    budget.updatedAt = new Date();

    // Check for threshold alerts
    await this.checkBudgetThresholds(budget);

    this.logger.log(`Updated budget ${budgetId}: spent $${budget.spentAmount}/$${budget.totalBudget}`);
    return budget;
  }

  /**
   * Calculate budget status based on utilization
   */
  private calculateBudgetStatus(spent: number, budget: number): BudgetStatus {
    const utilization = (spent / budget) * 100;

    if (utilization >= 100) {
      return BudgetStatus.EXCEEDED;
    } else if (utilization >= 90) {
      return BudgetStatus.WARNING;
    } else {
      return BudgetStatus.ACTIVE;
    }
  }

  /**
   * Check budget thresholds and send alerts
   */
  private async checkBudgetThresholds(budget: MatterBudget): Promise<void> {
    const utilizationPercentage = (budget.spentAmount / budget.totalBudget) * 100;

    for (const threshold of budget.alertThresholds) {
      if (utilizationPercentage >= threshold) {
        // Check if alert was already sent for this threshold
        const existingAlert = await this.hasAlertBeenSent(budget.id, threshold);

        if (!existingAlert) {
          await this.sendBudgetAlert(budget, threshold, utilizationPercentage);
        }
      }
    }
  }

  /**
   * Send budget alert
   */
  private async sendBudgetAlert(
    budget: MatterBudget,
    threshold: number,
    utilizationPercentage: number,
  ): Promise<void> {
    const alert: BudgetAlert = {
      id: this.generateId(),
      budgetId: budget.id,
      matterId: budget.matterId,
      alertType: threshold >= 100 ? 'exceeded' : 'threshold',
      threshold,
      currentSpend: budget.spentAmount,
      budgetAmount: budget.totalBudget,
      utilizationPercentage,
      message: this.generateAlertMessage(budget, threshold, utilizationPercentage),
      sentAt: new Date(),
      recipients: budget.notificationEmails,
      acknowledged: false,
    };

    this.logger.warn(`Budget alert sent: ${alert.message}`);
    // Implementation would send email/notification here
  }

  /**
   * Generate alert message
   */
  private generateAlertMessage(
    budget: MatterBudget,
    threshold: number,
    utilizationPercentage: number,
  ): string {
    if (threshold >= 100) {
      return `Budget EXCEEDED for matter ${budget.matterId}: ` +
             `$${budget.spentAmount.toFixed(2)} of $${budget.totalBudget.toFixed(2)} ` +
             `(${utilizationPercentage.toFixed(1)}% utilized)`;
    } else {
      return `Budget threshold ${threshold}% reached for matter ${budget.matterId}: ` +
             `$${budget.spentAmount.toFixed(2)} of $${budget.totalBudget.toFixed(2)} ` +
             `(${utilizationPercentage.toFixed(1)}% utilized)`;
    }
  }

  /**
   * Project budget overrun
   */
  async projectBudget(budgetId: string): Promise<BudgetProjection> {
    const budget = await this.getBudget(budgetId);
    const daysSinceStart = this.daysBetween(budget.startDate, new Date());
    const burnRate = daysSinceStart > 0 ? budget.spentAmount / daysSinceStart : 0;

    let daysRemaining = 0;
    if (budget.endDate) {
      daysRemaining = this.daysBetween(new Date(), budget.endDate);
    }

    const projectedSpend = budget.spentAmount + (burnRate * daysRemaining);
    const projectedUtilization = (projectedSpend / budget.totalBudget) * 100;
    const projectedOverrun = Math.max(0, projectedSpend - budget.totalBudget);

    // Calculate confidence based on data points
    const confidence = Math.min(100, (daysSinceStart / 30) * 100);

    const recommendations = this.generateBudgetRecommendations(
      budget,
      projectedUtilization,
      burnRate,
    );

    const projection: BudgetProjection = {
      budgetId: budget.id,
      currentSpend: budget.spentAmount,
      currentUtilization: (budget.spentAmount / budget.totalBudget) * 100,
      projectedSpend,
      projectedUtilization,
      projectedCompletionDate: budget.endDate || new Date(),
      daysRemaining,
      burnRate,
      projectedOverrun,
      confidence,
      recommendations,
    };

    this.logger.log(
      `Budget projection for ${budgetId}: ` +
      `Current ${projection.currentUtilization.toFixed(1)}%, ` +
      `Projected ${projection.projectedUtilization.toFixed(1)}%`,
    );

    return projection;
  }

  /**
   * Generate budget recommendations
   */
  private generateBudgetRecommendations(
    budget: MatterBudget,
    projectedUtilization: number,
    burnRate: number,
  ): string[] {
    const recommendations: string[] = [];

    if (projectedUtilization > 100) {
      recommendations.push(
        `Projected to exceed budget by ${(projectedUtilization - 100).toFixed(1)}%. ` +
        `Consider requesting budget increase or reducing scope.`,
      );
    }

    if (burnRate > (budget.totalBudget / 90)) {
      recommendations.push(
        `Daily burn rate of $${burnRate.toFixed(2)} is high. ` +
        `Monitor staffing levels and hourly allocations.`,
      );
    }

    const currentUtilization = (budget.spentAmount / budget.totalBudget) * 100;
    if (currentUtilization > 75 && projectedUtilization > 100) {
      recommendations.push(
        'Approaching budget limit. Schedule client discussion about additional fees.',
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('Budget tracking is on target. Continue monitoring.');
    }

    return recommendations;
  }

  /**
   * Calculate budget variance
   */
  async calculateBudgetVariance(
    budgetId: string,
    period: string,
    plannedAmount: number,
  ): Promise<BudgetVariance> {
    const budget = await this.getBudget(budgetId);
    const actualAmount = budget.spentAmount;
    const variance = actualAmount - plannedAmount;
    const variancePercentage = (variance / plannedAmount) * 100;

    return {
      budgetId,
      period,
      plannedAmount,
      actualAmount,
      variance,
      variancePercentage,
      isFavorable: variance < 0, // Under budget is favorable
      explanation: variance < 0
        ? `Under budget by $${Math.abs(variance).toFixed(2)}`
        : `Over budget by $${variance.toFixed(2)}`,
    };
  }

  /**
   * Monitor budgets - runs daily
   */
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async monitorBudgets(): Promise<void> {
    this.logger.log('Monitoring matter budgets...');

    try {
      const activeBudgets = await this.getActiveBudgets();
      this.logger.log(`Monitoring ${activeBudgets.length} active budgets`);

      for (const budget of activeBudgets) {
        await this.checkBudgetThresholds(budget);

        // Check for projected overruns
        const projection = await this.projectBudget(budget.id);
        if (projection.projectedOverrun > 0 && projection.confidence > 50) {
          await this.sendProjectedOverrunAlert(budget, projection);
        }
      }

      this.logger.log('Completed budget monitoring');
    } catch (error) {
      this.logger.error(`Error monitoring budgets: ${error.message}`);
    }
  }

  /**
   * Send projected overrun alert
   */
  private async sendProjectedOverrunAlert(
    budget: MatterBudget,
    projection: BudgetProjection,
  ): Promise<void> {
    const alert: BudgetAlert = {
      id: this.generateId(),
      budgetId: budget.id,
      matterId: budget.matterId,
      alertType: 'projected_overrun',
      currentSpend: projection.currentSpend,
      budgetAmount: budget.totalBudget,
      utilizationPercentage: projection.currentUtilization,
      message: `Matter ${budget.matterId} is projected to exceed budget by ` +
               `$${projection.projectedOverrun.toFixed(2)} ` +
               `(${projection.confidence.toFixed(0)}% confidence)`,
      sentAt: new Date(),
      recipients: budget.notificationEmails,
      acknowledged: false,
    };

    this.logger.warn(`Projected overrun alert: ${alert.message}`);
  }

  /**
   * Get budget summary
   */
  async getBudgetSummary(clientId?: string): Promise<any> {
    return {
      totalBudgets: 0,
      activeBudgets: 0,
      totalBudgetAmount: 0,
      totalSpent: 0,
      totalAvailable: 0,
      averageUtilization: 0,
      budgetsAtRisk: 0,
      budgetsExceeded: 0,
    };
  }

  /**
   * Helper methods
   */
  private async getBudget(budgetId: string): Promise<MatterBudget> {
    // Mock implementation
    throw new Error('Budget not found');
  }

  private async getActiveBudgets(): Promise<MatterBudget[]> {
    // Mock implementation
    return [];
  }

  private async hasAlertBeenSent(budgetId: string, threshold: number): Promise<boolean> {
    // Mock implementation
    return false;
  }

  private daysBetween(startDate: Date, endDate: Date): number {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private generateId(): string {
    return `bdg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
