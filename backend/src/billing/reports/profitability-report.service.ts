import { Injectable, Logger } from '@nestjs/common';

/**
 * Profitability Report Service
 * Analyzes matter and client profitability
 */

export interface ProfitabilityReport {
  reportDate: Date;
  periodStart: Date;
  periodEnd: Date;
  overall: OverallProfitability;
  byMatter: MatterProfitability[];
  byClient: ClientProfitability[];
  byTimekeeper: TimekeeperProfitability[];
  byPracticeArea: PracticeAreaProfitability[];
}

export interface OverallProfitability {
  totalRevenue: number;
  totalCosts: number;
  totalProfit: number;
  profitMargin: number;
  roi: number; // Return on investment
  utilizationRate: number;
  billableHours: number;
  nonBillableHours: number;
}

export interface MatterProfitability {
  matterId: string;
  matterName: string;
  clientId: string;
  clientName: string;
  revenue: number;
  costs: MatterCosts;
  profit: number;
  profitMargin: number;
  roi: number;
  hours: HourBreakdown;
  status: 'profitable' | 'break_even' | 'unprofitable';
  riskLevel: 'low' | 'medium' | 'high';
}

export interface MatterCosts {
  personnel: number; // Attorney/paralegal costs
  expenses: number; // Hard costs
  overhead: number; // Allocated overhead
  total: number;
}

export interface HourBreakdown {
  billable: number;
  nonBillable: number;
  total: number;
  utilizationRate: number;
  realizationRate: number;
}

export interface ClientProfitability {
  clientId: string;
  clientName: string;
  revenue: number;
  costs: number;
  profit: number;
  profitMargin: number;
  matterCount: number;
  activeMatters: number;
  averageMatterProfit: number;
  lifetimeValue: number;
  riskScore: number;
}

export interface TimekeeperProfitability {
  timekeeperId: string;
  timekeeperName: string;
  classification: string;
  revenue: number;
  cost: number; // Salary + benefits allocated
  profit: number;
  profitMargin: number;
  billableHours: number;
  nonBillableHours: number;
  utilizationRate: number;
  realizationRate: number;
  effectiveRate: number;
}

export interface PracticeAreaProfitability {
  practiceArea: string;
  revenue: number;
  costs: number;
  profit: number;
  profitMargin: number;
  matterCount: number;
  timekeeperCount: number;
  averageHourlyRate: number;
  utilizationRate: number;
}

export interface ProfitabilityTrend {
  period: string;
  revenue: number;
  costs: number;
  profit: number;
  profitMargin: number;
  matterCount: number;
}

export interface ProfitabilityAnalysis {
  topPerformers: MatterProfitability[];
  bottomPerformers: MatterProfitability[];
  recommendations: string[];
  insights: string[];
  alerts: ProfitabilityAlert[];
}

export interface ProfitabilityAlert {
  type: 'warning' | 'critical' | 'info';
  matter?: string;
  client?: string;
  message: string;
  impact: number; // Dollar impact
  recommendation: string;
}

@Injectable()
export class ProfitabilityReportService {
  private readonly logger = new Logger(ProfitabilityReportService.name);

  // Standard overhead allocation rate (typically 40-60% of direct costs)
  private readonly OVERHEAD_RATE = 0.50;

  /**
   * Generate comprehensive profitability report
   */
  async generateProfitabilityReport(
    startDate: Date,
    endDate: Date,
    options: {
      clientId?: string;
      matterId?: string;
      practiceArea?: string;
    } = {},
  ): Promise<ProfitabilityReport> {
    this.logger.log(`Generating profitability report from ${startDate} to ${endDate}`);

    // Fetch financial data
    const financialData = await this.getFinancialData(startDate, endDate, options);

    // Calculate overall profitability
    const overall = this.calculateOverallProfitability(financialData);

    // Calculate profitability by dimensions
    const byMatter = await this.calculateMatterProfitability(financialData);
    const byClient = await this.calculateClientProfitability(financialData);
    const byTimekeeper = await this.calculateTimekeeperProfitability(financialData);
    const byPracticeArea = await this.calculatePracticeAreaProfitability(financialData);

    const report: ProfitabilityReport = {
      reportDate: new Date(),
      periodStart: startDate,
      periodEnd: endDate,
      overall,
      byMatter,
      byClient,
      byTimekeeper,
      byPracticeArea,
    };

    this.logger.log(
      `Profitability report complete: Total profit $${overall.totalProfit.toFixed(2)}, ` +
      `Margin ${overall.profitMargin.toFixed(1)}%, ROI ${overall.roi.toFixed(1)}%`,
    );

    return report;
  }

  /**
   * Calculate overall profitability
   */
  private calculateOverallProfitability(financialData: any[]): OverallProfitability {
    const totalRevenue = financialData.reduce((sum, item) => sum + (item.revenue || 0), 0);
    const totalPersonnelCosts = financialData.reduce((sum, item) => sum + (item.personnelCost || 0), 0);
    const totalExpenses = financialData.reduce((sum, item) => sum + (item.expenses || 0), 0);
    const allocatedOverhead = (totalPersonnelCosts + totalExpenses) * this.OVERHEAD_RATE;
    const totalCosts = totalPersonnelCosts + totalExpenses + allocatedOverhead;
    const totalProfit = totalRevenue - totalCosts;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    const roi = totalCosts > 0 ? (totalProfit / totalCosts) * 100 : 0;

    const billableHours = financialData.reduce((sum, item) => sum + (item.billableHours || 0), 0);
    const nonBillableHours = financialData.reduce((sum, item) => sum + (item.nonBillableHours || 0), 0);
    const totalHours = billableHours + nonBillableHours;
    const utilizationRate = totalHours > 0 ? (billableHours / totalHours) * 100 : 0;

    return {
      totalRevenue,
      totalCosts,
      totalProfit,
      profitMargin,
      roi,
      utilizationRate,
      billableHours,
      nonBillableHours,
    };
  }

  /**
   * Calculate matter profitability
   */
  private async calculateMatterProfitability(financialData: any[]): Promise<MatterProfitability[]> {
    const matterMap = new Map<string, any[]>();

    for (const item of financialData) {
      const items = matterMap.get(item.matterId) || [];
      items.push(item);
      matterMap.set(item.matterId, items);
    }

    const result: MatterProfitability[] = [];

    for (const [matterId, items] of matterMap.entries()) {
      const revenue = items.reduce((sum, item) => sum + (item.revenue || 0), 0);
      const personnelCost = items.reduce((sum, item) => sum + (item.personnelCost || 0), 0);
      const expenses = items.reduce((sum, item) => sum + (item.expenses || 0), 0);
      const overhead = (personnelCost + expenses) * this.OVERHEAD_RATE;

      const costs: MatterCosts = {
        personnel: personnelCost,
        expenses,
        overhead,
        total: personnelCost + expenses + overhead,
      };

      const profit = revenue - costs.total;
      const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
      const roi = costs.total > 0 ? (profit / costs.total) * 100 : 0;

      const billableHours = items.reduce((sum, item) => sum + (item.billableHours || 0), 0);
      const nonBillableHours = items.reduce((sum, item) => sum + (item.nonBillableHours || 0), 0);
      const totalHours = billableHours + nonBillableHours;
      const utilizationRate = totalHours > 0 ? (billableHours / totalHours) * 100 : 0;
      const billedValue = items.reduce((sum, item) => sum + (item.billedValue || 0), 0);
      const standardValue = items.reduce((sum, item) => sum + (item.standardValue || 0), 0);
      const realizationRate = standardValue > 0 ? (billedValue / standardValue) * 100 : 0;

      const hours: HourBreakdown = {
        billable: billableHours,
        nonBillable: nonBillableHours,
        total: totalHours,
        utilizationRate,
        realizationRate,
      };

      const status = profitMargin > 15 ? 'profitable'
        : profitMargin > 0 ? 'break_even' : 'unprofitable';

      const riskLevel = profitMargin < 0 ? 'high'
        : profitMargin < 10 ? 'medium' : 'low';

      result.push({
        matterId,
        matterName: items[0].matterName || '',
        clientId: items[0].clientId || '',
        clientName: items[0].clientName || '',
        revenue,
        costs,
        profit,
        profitMargin,
        roi,
        hours,
        status,
        riskLevel,
      });
    }

    return result.sort((a, b) => b.profit - a.profit);
  }

  /**
   * Calculate client profitability
   */
  private async calculateClientProfitability(financialData: any[]): Promise<ClientProfitability[]> {
    const clientMap = new Map<string, any[]>();

    for (const item of financialData) {
      const items = clientMap.get(item.clientId) || [];
      items.push(item);
      clientMap.set(item.clientId, items);
    }

    const result: ClientProfitability[] = [];

    for (const [clientId, items] of clientMap.entries()) {
      const revenue = items.reduce((sum, item) => sum + (item.revenue || 0), 0);
      const personnelCost = items.reduce((sum, item) => sum + (item.personnelCost || 0), 0);
      const expenses = items.reduce((sum, item) => sum + (item.expenses || 0), 0);
      const overhead = (personnelCost + expenses) * this.OVERHEAD_RATE;
      const costs = personnelCost + expenses + overhead;
      const profit = revenue - costs;
      const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

      const matters = new Set(items.map(item => item.matterId));
      const matterCount = matters.size;
      const activeMatters = items.filter(item => item.matterStatus === 'active').length;
      const averageMatterProfit = matterCount > 0 ? profit / matterCount : 0;

      // Simplified lifetime value calculation
      const lifetimeValue = profit * 1.5; // Assume 50% growth potential

      // Risk score based on profitability and payment history
      const riskScore = profitMargin < 10 ? 75 : profitMargin < 20 ? 50 : 25;

      result.push({
        clientId,
        clientName: items[0].clientName || '',
        revenue,
        costs,
        profit,
        profitMargin,
        matterCount,
        activeMatters,
        averageMatterProfit,
        lifetimeValue,
        riskScore,
      });
    }

    return result.sort((a, b) => b.profit - a.profit);
  }

  /**
   * Calculate timekeeper profitability
   */
  private async calculateTimekeeperProfitability(financialData: any[]): Promise<TimekeeperProfitability[]> {
    const timekeeperMap = new Map<string, any[]>();

    for (const item of financialData) {
      if (!item.timekeeperId) continue;
      const items = timekeeperMap.get(item.timekeeperId) || [];
      items.push(item);
      timekeeperMap.set(item.timekeeperId, items);
    }

    const result: TimekeeperProfitability[] = [];

    for (const [timekeeperId, items] of timekeeperMap.entries()) {
      const revenue = items.reduce((sum, item) => sum + (item.revenue || 0), 0);
      const cost = items.reduce((sum, item) => sum + (item.personnelCost || 0), 0);
      const profit = revenue - cost;
      const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

      const billableHours = items.reduce((sum, item) => sum + (item.billableHours || 0), 0);
      const nonBillableHours = items.reduce((sum, item) => sum + (item.nonBillableHours || 0), 0);
      const totalHours = billableHours + nonBillableHours;
      const utilizationRate = totalHours > 0 ? (billableHours / totalHours) * 100 : 0;

      const billedValue = items.reduce((sum, item) => sum + (item.billedValue || 0), 0);
      const standardValue = items.reduce((sum, item) => sum + (item.standardValue || 0), 0);
      const realizationRate = standardValue > 0 ? (billedValue / standardValue) * 100 : 0;

      const effectiveRate = billableHours > 0 ? revenue / billableHours : 0;

      result.push({
        timekeeperId,
        timekeeperName: items[0].timekeeperName || '',
        classification: items[0].classification || '',
        revenue,
        cost,
        profit,
        profitMargin,
        billableHours,
        nonBillableHours,
        utilizationRate,
        realizationRate,
        effectiveRate,
      });
    }

    return result.sort((a, b) => b.profit - a.profit);
  }

  /**
   * Calculate practice area profitability
   */
  private async calculatePracticeAreaProfitability(financialData: any[]): Promise<PracticeAreaProfitability[]> {
    const areaMap = new Map<string, any[]>();

    for (const item of financialData) {
      const area = item.practiceArea || 'General';
      const items = areaMap.get(area) || [];
      items.push(item);
      areaMap.set(area, items);
    }

    const result: PracticeAreaProfitability[] = [];

    for (const [practiceArea, items] of areaMap.entries()) {
      const revenue = items.reduce((sum, item) => sum + (item.revenue || 0), 0);
      const personnelCost = items.reduce((sum, item) => sum + (item.personnelCost || 0), 0);
      const expenses = items.reduce((sum, item) => sum + (item.expenses || 0), 0);
      const overhead = (personnelCost + expenses) * this.OVERHEAD_RATE;
      const costs = personnelCost + expenses + overhead;
      const profit = revenue - costs;
      const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

      const matterCount = new Set(items.map(item => item.matterId)).size;
      const timekeeperCount = new Set(items.map(item => item.timekeeperId).filter(Boolean)).size;
      const billableHours = items.reduce((sum, item) => sum + (item.billableHours || 0), 0);
      const averageHourlyRate = billableHours > 0 ? revenue / billableHours : 0;

      const totalHours = billableHours + items.reduce((sum, item) => sum + (item.nonBillableHours || 0), 0);
      const utilizationRate = totalHours > 0 ? (billableHours / totalHours) * 100 : 0;

      result.push({
        practiceArea,
        revenue,
        costs,
        profit,
        profitMargin,
        matterCount,
        timekeeperCount,
        averageHourlyRate,
        utilizationRate,
      });
    }

    return result.sort((a, b) => b.profit - a.profit);
  }

  /**
   * Analyze profitability and generate insights
   */
  async analyzeProfitability(
    report: ProfitabilityReport,
  ): Promise<ProfitabilityAnalysis> {
    const topPerformers = report.byMatter
      .filter(m => m.status === 'profitable')
      .slice(0, 10);

    const bottomPerformers = report.byMatter
      .filter(m => m.status === 'unprofitable')
      .slice(0, 10);

    const recommendations = this.generateRecommendations(report);
    const insights = this.generateInsights(report);
    const alerts = this.generateAlerts(report);

    return {
      topPerformers,
      bottomPerformers,
      recommendations,
      insights,
      alerts,
    };
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(report: ProfitabilityReport): string[] {
    const recommendations: string[] = [];

    if (report.overall.profitMargin < 30) {
      recommendations.push(
        'Overall profit margin is below industry benchmark of 30%. Consider reviewing billing rates and cost controls.',
      );
    }

    if (report.overall.utilizationRate < 75) {
      recommendations.push(
        `Utilization rate of ${report.overall.utilizationRate.toFixed(1)}% is below target of 75%. Increase billable work allocation.`,
      );
    }

    const unprofitableMatters = report.byMatter.filter(m => m.status === 'unprofitable');
    if (unprofitableMatters.length > 0) {
      recommendations.push(
        `${unprofitableMatters.length} matters are unprofitable. Review pricing, staffing, and scope management.`,
      );
    }

    const lowProfitClients = report.byClient.filter(c => c.profitMargin < 15);
    if (lowProfitClients.length > 0) {
      recommendations.push(
        `${lowProfitClients.length} clients have profit margins below 15%. Consider rate adjustments or service scope changes.`,
      );
    }

    return recommendations;
  }

  /**
   * Generate insights
   */
  private generateInsights(report: ProfitabilityReport): string[] {
    const insights: string[] = [];

    const topPracticeArea = report.byPracticeArea[0];
    if (topPracticeArea) {
      insights.push(
        `${topPracticeArea.practiceArea} is the most profitable practice area with ` +
        `${topPracticeArea.profitMargin.toFixed(1)}% margin.`,
      );
    }

    const topClient = report.byClient[0];
    if (topClient) {
      insights.push(
        `${topClient.clientName} is the most profitable client, contributing ` +
        `$${topClient.profit.toFixed(2)} in profit.`,
      );
    }

    const avgMatterProfit = report.byMatter.reduce((sum, m) => sum + m.profit, 0) / report.byMatter.length;
    insights.push(
      `Average matter profit is $${avgMatterProfit.toFixed(2)} with overall ROI of ${report.overall.roi.toFixed(1)}%.`,
    );

    return insights;
  }

  /**
   * Generate profitability alerts
   */
  private generateAlerts(report: ProfitabilityReport): ProfitabilityAlert[] {
    const alerts: ProfitabilityAlert[] = [];

    // Check for critical unprofitable matters
    const criticalMatters = report.byMatter.filter(m => m.profitMargin < -20);
    for (const matter of criticalMatters) {
      alerts.push({
        type: 'critical',
        matter: matter.matterName,
        message: `Matter ${matter.matterName} is severely unprofitable with ${matter.profitMargin.toFixed(1)}% margin`,
        impact: Math.abs(matter.profit),
        recommendation: 'Immediate review required. Consider discontinuing or restructuring engagement.',
      });
    }

    // Check for high-risk profitable matters
    const riskMatters = report.byMatter.filter(m => m.riskLevel === 'high' && m.profit > 0);
    for (const matter of riskMatters.slice(0, 5)) {
      alerts.push({
        type: 'warning',
        matter: matter.matterName,
        message: `Matter ${matter.matterName} is at high risk despite current profitability`,
        impact: matter.profit,
        recommendation: 'Monitor closely for scope creep or rate erosion.',
      });
    }

    return alerts;
  }

  /**
   * Get profitability trends
   */
  async getProfitabilityTrends(
    startDate: Date,
    endDate: Date,
  ): Promise<ProfitabilityTrend[]> {
    const trends: ProfitabilityTrend[] = [];
    const months = this.getMonthsBetween(startDate, endDate);

    for (const month of months) {
      const report = await this.generateProfitabilityReport(month.start, month.end);

      trends.push({
        period: month.period,
        revenue: report.overall.totalRevenue,
        costs: report.overall.totalCosts,
        profit: report.overall.totalProfit,
        profitMargin: report.overall.profitMargin,
        matterCount: report.byMatter.length,
      });
    }

    return trends;
  }

  /**
   * Helper methods
   */
  private getMonthsBetween(
    startDate: Date,
    endDate: Date,
  ): Array<{ period: string; start: Date; end: Date }> {
    const months: Array<{ period: string; start: Date; end: Date }> = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      const monthStart = new Date(current);
      const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);

      months.push({
        period: `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`,
        start: monthStart,
        end: monthEnd > endDate ? endDate : monthEnd,
      });

      current.setMonth(current.getMonth() + 1);
    }

    return months;
  }

  private async getFinancialData(
    startDate: Date,
    endDate: Date,
    options: any = {},
  ): Promise<any[]> {
    // Mock implementation - would query database
    return [];
  }
}
