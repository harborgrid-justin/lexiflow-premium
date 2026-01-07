import { analyticsApi, isBackendApiEnabled, workflowApi } from "@/api";
import { AnalyticsService } from "@/services/domain/AnalyticsDomain";
import {
  getCitationsRepository,
  getKnowledgeRepository,
  getRisksRepository,
} from "../factories/RepositoryFactories";

export const AnalyticsDescriptors: PropertyDescriptorMap = {
  knowledge: {
    get: () =>
      isBackendApiEnabled() ? analyticsApi.knowledge : getKnowledgeRepository(),
    enumerable: true,
  },
  citations: {
    get: () =>
      isBackendApiEnabled() ? analyticsApi.citations : getCitationsRepository(),
    enumerable: true,
  },
  analytics: { get: () => AnalyticsService, enumerable: true },
  judgeStats: {
    get: () =>
      isBackendApiEnabled()
        ? analyticsApi.judgeStats
        : {
            getAll: async () => [],
            getById: async (_id: string) => undefined,
            search: async (_query: string) => [],
          },
    enumerable: true,
  },
  outcomePredictions: {
    get: () =>
      isBackendApiEnabled()
        ? analyticsApi.outcomePredictions
        : {
            predict: async (caseId: string) => ({
              caseId,
              prediction: "unavailable",
              confidence: 0,
              factors: [],
            }),
            getHistory: async () => [],
          },
    enumerable: true,
  },
  risks: {
    get: () =>
      isBackendApiEnabled() ? workflowApi.risks : getRisksRepository(),
    enumerable: true,
  },
  search: {
    get: () => (isBackendApiEnabled() ? analyticsApi.search : SearchService),
    enumerable: true,
  },
};
