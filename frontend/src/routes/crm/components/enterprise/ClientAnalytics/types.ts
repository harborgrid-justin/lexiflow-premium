/**
 * @module components/enterprise/CRM/ClientAnalytics/types
 * @description Type definitions for Client Analytics module
 */

export interface ClientProfitability {
  clientId: string;
  clientName: string;
  totalRevenue: number;
  totalCosts: number;
  profit: number;
  profitMargin: number;
  realization: number;
  collectionRate: number;
  trend: "up" | "down" | "stable";
}

export interface ClientLifetimeValue {
  clientId: string;
  clientName: string;
  ltv: number;
  acquisitionCost: number;
  retentionRate: number;
  avgAnnualRevenue: number;
  yearsAsClient: number;
  projectedFutureValue: number;
}

export interface ClientRiskAssessment {
  clientId: string;
  clientName: string;
  overallRisk: "Low" | "Medium" | "High" | "Critical";
  riskScore: number;
  factors: {
    paymentRisk: number;
    scopeCreepRisk: number;
    communicationRisk: number;
    expectationRisk: number;
    complianceRisk: number;
  };
  outstandingBalance: number;
  daysOutstanding: number;
  disputedInvoices: number;
  lastActivity: string;
}

export interface ClientSatisfaction {
  clientId: string;
  clientName: string;
  nps: number;
  csat: number;
  responsiveness: number;
  quality: number;
  value: number;
  likelihood: number;
  lastSurveyDate: string;
  totalSurveys: number;
}

export interface ClientSegment {
  segment: string;
  count: number;
  revenue: number;
  avgLifetimeValue: number;
  color: string;
}

export type TabType = "profitability" | "ltv" | "risk" | "satisfaction";
