/**
 * Analytics & Intelligence Domain API Services
 * Search, analytics dashboards, AI/ML predictions, bluebook, knowledge
 */

import { SearchApiService } from '../search/search-api';
import { DashboardApiService } from '../dashboard-api';
import { AIOpsApiService } from '../ai-ops-api';
import { AnalyticsDashboardApiService } from '../analytics-dashboard-api';
import { BillingAnalyticsApiService } from '../billing-analytics-api';
import { CaseAnalyticsApiService } from '../case-analytics-api';
import { DiscoveryAnalyticsApiService } from '../discovery-analytics-api';
import { OutcomePredictionsApiService } from '../outcome-predictions-api';
import { JudgeStatsApiService } from '../judge-stats-api';
import { BluebookApiService } from '../bluebook-api';
import { KnowledgeApiService } from '../knowledge-api';
import { CitationsApiService } from '../citations-api';
import { ClausesApiService } from '../clauses-api';
import { JurisdictionApiService } from '../jurisdiction-api';

// Export service classes
export {
  SearchApiService,
  DashboardApiService,
  AIOpsApiService,
  AnalyticsDashboardApiService,
  BillingAnalyticsApiService,
  CaseAnalyticsApiService,
  DiscoveryAnalyticsApiService,
  OutcomePredictionsApiService,
  JudgeStatsApiService,
  BluebookApiService,
  KnowledgeApiService,
  CitationsApiService,
  ClausesApiService,
  JurisdictionApiService,
};

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
