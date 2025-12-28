/**
 * Analytics & Intelligence Domain API Services
 * Search, analytics dashboards, AI/ML predictions, bluebook, knowledge
 */

import { SearchApiService } from '../analytics/search-api';
import { DashboardApiService } from '../analytics/dashboard-api';
import { AIOpsApiService } from '../analytics/ai-ops-api';
import { AnalyticsDashboardApiService } from '../analytics/analytics-dashboard-api';
import { BillingAnalyticsApiService } from '../billing/billing-analytics-api';
import { CaseAnalyticsApiService } from '../analytics/case-analytics-api';
import { DiscoveryAnalyticsApiService } from '../discovery/discovery-analytics-api';
import { OutcomePredictionsApiService } from '../analytics/outcome-predictions-api';
import { JudgeStatsApiService } from '../analytics/judge-stats-api';
import { BluebookApiService } from '../analytics/bluebook-api';
import { KnowledgeApiService } from '../analytics/knowledge-api';
import { CitationsApiService } from '../analytics/citations-api';
import { ClausesApiService } from '../analytics/clauses-api';
import { JurisdictionApiService } from '../analytics/jurisdiction-api';

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
