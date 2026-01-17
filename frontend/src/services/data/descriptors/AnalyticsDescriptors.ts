import { analyticsApi, workflowApi } from "@/lib/frontend-api";
import { AnalysisService } from "@/services/domain/analysis.service";
import { AnalyticsService } from "@/services/domain/analytics.service";

export const AnalyticsDescriptors: PropertyDescriptorMap = {
  citations: {
    get: () => analyticsApi.citations,
    enumerable: true,
  },
  analysis: {
    get: () => AnalysisService,
    enumerable: true,
  },
  analytics: { get: () => AnalyticsService, enumerable: true },
  judgeStats: {
    get: () => analyticsApi.judgeStats,
    enumerable: true,
  },
  outcomePredictions: {
    get: () => analyticsApi.outcomePredictions,
    enumerable: true,
  },
  risks: {
    get: () => workflowApi.risks,
    enumerable: true,
  },
  search: {
    // Note: SearchService not yet implemented in analytics backend
    get: () => analyticsApi.search,
    enumerable: true,
  },
};
