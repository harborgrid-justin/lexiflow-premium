/**
 * Interfaces for Matter Analytics and Statistics
 */

export interface MatterStatistics {
  total: number;
  byStatus: {
    active: number;
    intake: number;
    pending: number;
    closed: number;
  };
}

export interface MatterKPIs {
  totalActive: number;
  intakePipeline: number;
  upcomingDeadlines: number;
  atRisk: number;
  totalValue: number;
  utilizationRate: number;
  averageAge: number;
  conversionRate: number;
}

export interface PipelineStage {
  stage: string;
  count: number;
  value: number;
  avgDaysInStage: number;
  conversionRate: number;
}

export interface CalendarEvent {
  id: string;
  matterId: string;
  title: string;
  start: Date;
  end: Date;
  type: string;
  description?: string;
}

export interface RevenueByCategory {
  [key: string]: number;
}

export interface RevenueTrend {
  period: string;
  amount: number;
}

export interface RevenueAnalytics {
  totalRevenue: number;
  byPracticeArea: RevenueByCategory;
  byMatterType: RevenueByCategory;
  trend: RevenueTrend[];
}

export interface RiskFactor {
  factor: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface RiskInsight {
  matterId: string;
  matterTitle: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  factors: RiskFactor[];
}

export interface BudgetPerformance {
  matterId: string;
  matterTitle: string;
  budget: number;
  spent: number;
  variance: number;
}

export interface FinancialOverview {
  totalRevenue: number;
  billableHours: number;
  realizationRate: number;
  outstandingAR: number;
  budgetPerformance: BudgetPerformance[];
}
