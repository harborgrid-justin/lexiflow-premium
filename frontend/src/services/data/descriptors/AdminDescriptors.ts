import {
  adminApi,
  analyticsApi,
  api,
  complianceApi,
  isBackendApiEnabled,
} from "@/api";
import { repositoryRegistry as legacyRepositoryRegistry } from "@/services/core/RepositoryFactory";
import { AdminService } from "@/services/domain/AdminDomain";
import { BackupService } from "@/services/domain/BackupDomain";
import { DataCatalogService } from "@/services/domain/DataCatalogDomain";
import { STORES } from "../db";
import { getDataQualityService } from "../factories/RepositoryFactories";

export const AdminDescriptors: PropertyDescriptorMap = {
  admin: { get: () => AdminService, enumerable: true },
  reports: {
    get: () =>
      isBackendApiEnabled()
        ? complianceApi.reports
        : legacyRepositoryRegistry.getOrCreate(STORES.REPORTERS),
    enumerable: true,
  },
  quality: { get: () => getDataQualityService(), enumerable: true },
  catalog: { get: () => DataCatalogService, enumerable: true },
  dataSources: {
    get: () => (isBackendApiEnabled() ? api.dataSources : null),
    enumerable: true,
  },
  schemaManagement: {
    get: () => (isBackendApiEnabled() ? api.schemaManagement : null),
    enumerable: true,
  },
  queryWorkbench: {
    get: () => (isBackendApiEnabled() ? api.queryWorkbench : null),
    enumerable: true,
  },
  backup: {
    get: () => (isBackendApiEnabled() ? adminApi.backups : BackupService),
    enumerable: true,
  },
  dashboard: {
    get: () =>
      isBackendApiEnabled()
        ? analyticsApi.dashboard
        : import("@/services/domain/DashboardDomain").then(
            (m) => m.DashboardService
          ),
    enumerable: true,
  },
  metrics: {
    get: () =>
      isBackendApiEnabled()
        ? adminApi.metrics
        : {
            getSystem: async () => ({ cpu: 0, memory: 0, disk: 0, network: 0 }),
            getApplication: async () => ({
              requests: 0,
              errors: 0,
              responseTime: 0,
            }),
          },
    enumerable: true,
  },
  serviceJobs: {
    get: () =>
      isBackendApiEnabled()
        ? adminApi.serviceJobs
        : legacyRepositoryRegistry.getOrCreate("serviceJobs"),
    enumerable: true,
  },
  dataSourcesIntegration: {
    get: () =>
      isBackendApiEnabled()
        ? api.dataSources
        : legacyRepositoryRegistry.getOrCreate("dataSources"),
    enumerable: true,
  },
};
