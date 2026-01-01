/**
 * Statistics and Analytics Types
 * Aggregate statistics and metrics types
 */

export interface CaseStats {
  totalActive: number;
  intakePipeline: number;
  upcomingDeadlines: number;
  atRisk: number;
  totalValue: number;
  utilizationRate: number;
  averageAge: number;
  conversionRate: number;
}

export interface MatterStatistics {
  total: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  byPracticeArea: Record<string, number>;
}

export interface UserStatistics {
  total: number;
  active: number;
  inactive: number;
  byRole: Record<string, number>;
  byDepartment: Record<string, number>;
}

export interface ClientStatistics {
  total: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  vipCount: number;
  averageCasesPerClient: number;
  totalRevenue: number;
  outstandingBalance: number;
}
