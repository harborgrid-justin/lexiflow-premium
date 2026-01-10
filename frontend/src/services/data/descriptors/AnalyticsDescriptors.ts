import { analyticsApi, workflowApi } from "@/api";
import { AnalysisService } from "@/services/domain/AnalysisDomain";
import { AnalyticsService } from "@/services/domain/AnalyticsDomain";

export const AnalyticsDescriptors: PropertyDescriptorMap = {
  knowledge: {
    get: () => analyticsApi.knowledge,
    enumerable: true,
  },
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
