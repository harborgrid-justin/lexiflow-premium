/**
 * Analytics & Intelligence Domain API Services
 * Search, analytics dashboards, AI/ML predictions, bluebook, knowledge
 */

import { BillingAnalyticsApiService } from '../billing/billing-analytics-api';
import { DiscoveryAnalyticsApiService } from '../discovery/discovery-analytics-api';
import { AIOpsApiService } from '../intelligence/ai-ops-api';
import { AnalyticsDashboardApiService } from '../intelligence/analytics-dashboard-api';
import { BluebookApiService } from '../intelligence/bluebook-api';
import { CaseAnalyticsApiService } from '../intelligence/case-analytics-api';
import { OutcomePredictionsApiService } from '../intelligence/case-forecasts-api';
import { CitationsApiService } from '../intelligence/citations-api';
import { ClausesApiService } from '../intelligence/clauses-api';
import { DashboardApiService } from '../intelligence/dashboard-api';
import { JudgeStatsApiService } from '../intelligence/judge-stats-api';
import { JurisdictionApiService } from '../intelligence/jurisdiction-api';
import { KnowledgeApiService } from '../intelligence/knowledge-api';
import { SearchApiService } from '../intelligence/search-api';

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
