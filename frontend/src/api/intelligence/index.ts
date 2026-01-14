/**
 * Analytics & Intelligence API Services
 * Dashboards, AI operations, predictions, legal research, and knowledge management
 */

export { AIOpsApiService, type AIOperation } from "./ai-ops-api";
export {
  AnalyticsApiService,
  type AnalyticsEvent,
  type Dashboard,
  type MetricData,
  type TimeSeriesData,
} from "./analytics-api";
export {
  AnalyticsDashboardApiService,
  type AnalyticsDashboard,
} from "./analytics-dashboard-api";
export {
  bluebookApi,
  BluebookApiService,
  type CitationParseResult,
  type CitationValidation,
} from "./bluebook-api";
export {
  CaseAnalyticsApiService,
  type CaseAnalytics,
} from "./case-analytics-api";
export {
  OutcomePredictionsApiService,
  type OutcomePrediction,
} from "./case-forecasts-api";
export {
  CitationsApiService,
  type Citation,
  type CitationFilters,
} from "./citations-api";
export {
  ClausesApiService,
  type Clause,
  type ClauseFilters,
} from "./clauses-api";
export { DashboardApiService, type DashboardConfig } from "./dashboard-api";
export { JudgeStatsApiService, type JudgeStatistics } from "./judge-stats-api";
export {
  JurisdictionAPI,
  JurisdictionApiService,
  type CreateJurisdictionDto,
  type CreateJurisdictionRuleDto,
  type Jurisdiction,
  type JurisdictionFilters,
  type JurisdictionRule,
  type RuleFilters,
} from "./jurisdiction-api";
export {
  KnowledgeApiService,
  type KnowledgeArticle,
  type KnowledgeFilters,
} from "./knowledge-api";
export {
  SearchApiService,
  type ReindexResult,
  type SearchQuery,
  type SearchStats,
  type SearchSuggestion,
} from "./search-api";
import { ClausesApiService } from "./clauses-api";
import { KnowledgeApiService as KnowledgeAPI } from "./knowledge-api";
export const catalogApi = new ClausesApiService();
export const knowledgeApi = new KnowledgeAPI();
