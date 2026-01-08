export interface KPIData {
  value: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
  target?: number;
}

export interface ExecutiveDashboardData {
  kpis: {
    revenue: KPIData;
    profitMargin: KPIData;
    utilizationRate: KPIData;
    realizationRate: KPIData;
    activeCases: KPIData;
    activeClients: KPIData;
    billableHours: KPIData;
    collectionRate: KPIData;
  };
  charts: {
    revenueByMonth: Array<{ month: string; revenue: number; target: number }>;
    casesByStatus: Array<{ status: string; count: number }>;
    topPracticeGroups: Array<{ name: string; revenue: number; cases: number }>;
    attorneyUtilization: Array<{ name: string; utilization: number; target: number }>;
  };
  snapshot: {
    date: string;
    organizationId?: string;
    lastUpdated: Date;
  };
}

export interface PracticeGroupMetrics {
  practiceGroupId: string;
  name: string;
  revenue: number;
  revenueGrowth: number;
  activeCases: number;
  attorneys: number;
  utilizationRate: number;
  realizationRate: number;
  averageCaseValue: number;
  billableHours: number;
  profitMargin: number;
  clientCount: number;
}

export interface AttorneyPerformanceMetrics {
  attorneyId: string;
  name: string;
  title: string;
  practiceGroup: string;
  billableHours: number;
  nonBillableHours: number;
  utilizationRate: number;
  realizationRate: number;
  collectionRate: number;
  revenue: number;
  activeCases: number;
  averageHourlyRate: number;
  clientCount: number;
  performance: {
    score: number;
    rank: number;
    tier: 'top' | 'high' | 'average' | 'below';
  };
}

export interface ClientProfitabilityMetrics {
  clientId: string;
  name: string;
  revenue: number;
  expenses: number;
  profit: number;
  profitMargin: number;
  activeCases: number;
  totalCases: number;
  averageCaseValue: number;
  retentionMonths: number;
  lifetimeValue: number;
  satisfactionScore: number;
  billedHours: number;
  collectionRate: number;
  tier: 'platinum' | 'gold' | 'silver' | 'bronze';
}

export interface FinancialSummary {
  revenue: {
    total: number;
    billed: number;
    collected: number;
    outstanding: number;
  };
  expenses: {
    total: number;
    personnel: number;
    overhead: number;
    other: number;
  };
  profitability: {
    grossProfit: number;
    netProfit: number;
    grossMargin: number;
    netMargin: number;
  };
  workInProgress: {
    total: number;
    aged30: number;
    aged60: number;
    aged90: number;
  };
  accountsReceivable: {
    total: number;
    current: number;
    aged30: number;
    aged60: number;
    aged90plus: number;
  };
}
