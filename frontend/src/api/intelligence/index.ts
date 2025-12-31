/**
 * Analytics & Intelligence API Services
 * Dashboards, AI operations, predictions, legal research, and knowledge management
 */

export { SearchApiService, type SearchQuery, type SearchSuggestion, type SearchStats, type ReindexResult } from './search-api';
export { DashboardApiService, type DashboardConfig } from './dashboard-api';
export { AIOpsApiService, type AIOperation } from './ai-ops-api';
export { AnalyticsDashboardApiService, type AnalyticsDashboard } from './analytics-dashboard-api';
export { AnalyticsApiService, type AnalyticsEvent, type Dashboard, type MetricData, type TimeSeriesData } from './analytics-api';
export { CaseAnalyticsApiService, type CaseAnalytics } from './case-analytics-api';
export { OutcomePredictionsApiService, type OutcomePrediction } from './outcome-predictions-api';
export { JudgeStatsApiService, type JudgeStatistics } from './judge-stats-api';
export { BluebookApiService, bluebookApi, type CitationValidation, type CitationParseResult } from './bluebook-api';
export { KnowledgeApiService, type KnowledgeArticle, type KnowledgeFilters } from './knowledge-api';
export { CitationsApiService, type Citation, type CitationFilters } from './citations-api';
export { ClausesApiService, type Clause, type ClauseFilters } from './clauses-api';
export { JurisdictionApiService, JurisdictionAPI, type Jurisdiction, type JurisdictionRule, type CreateJurisdictionDto, type JurisdictionFilters, type RuleFilters, type CreateJurisdictionRuleDto } from './jurisdiction-api';
