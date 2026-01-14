export interface CaseMetrics {
  totalCases: number;
  activeCases: number;
  wonCases: number;
  winRate: number;
  avgDuration: number;
  avgSettlement: number;
}

export interface CaseAnalyticsLoaderData {
  metrics: CaseMetrics;
}
