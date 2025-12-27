/**
 * Analytics & Intelligence Domain API Services
 * Search, analytics dashboards, AI/ML predictions, bluebook, knowledge
 */

import { SearchApiService } from '@/api';
import { DashboardApiService } from '@/api';
import { AIOpsApiService } from '@/api';
import { AnalyticsDashboardApiService } from '@/api';
import { BillingAnalyticsApiService } from '@/api';
import { CaseAnalyticsApiService } from '@/api';
import { DiscoveryAnalyticsApiService } from '@/api';
import { OutcomePredictionsApiService } from '@/api';
import { JudgeStatsApiService } from '@/api';
import { BluebookApiService } from '@/api';
import { KnowledgeApiService } from '@/api';
import { CitationsApiService } from '@/api';
import { ClausesApiService } from '@/api';
import { JurisdictionApiService } from '@/api';

// Export singleton instances
export const analyticsApi = {
  search: new SearchApiService(),
  dashboard: new DashboardApiService(),
  aiOps: new AIOpsApiService(),
  analyticsDashboard: new AnalyticsDashboardApiService(),
  billingAnalytics: new BillingAnalyticsApiService(),
  caseAnalytics: new CaseAnalyticsApiService(),
  discoveryAnalytics: new DiscoveryAnalyticsApiService(),
  outcomePredictions: new OutcomePredictionsApiService(),
  judgeStats: new JudgeStatsApiService(),
  bluebook: new BluebookApiService(),
  knowledge: new KnowledgeApiService(),
  citations: new CitationsApiService(),
  clauses: new ClausesApiService(),
  jurisdiction: JurisdictionApiService, // Object export, not a class
} as const;
