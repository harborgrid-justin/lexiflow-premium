import { adminApi, analyticsApi, complianceApi } from "@/lib/frontend-api";
import { api } from "@/services/api";
import { AdminService } from "@/services/domain/admin.service";
import { DataCatalogService } from "@/services/domain/data-catalog.service";

import { getDataQualityService } from "../factories/repository-factories.service";

export const AdminDescriptors: PropertyDescriptorMap = {
  admin: { get: () => AdminService, enumerable: true },
  reports: {
    get: () => complianceApi.complianceReporting,
    enumerable: true,
  },
  quality: { get: () => getDataQualityService(), enumerable: true },
  catalog: { get: () => DataCatalogService, enumerable: true },
  dataSources: {
    get: () => api.dataSources,
    enumerable: true,
  },
  schemaManagement: {
    get: () => api.schemaManagement,
    enumerable: true,
  },
  queryWorkbench: {
    get: () => api.queryWorkbench,
    enumerable: true,
  },
  backup: {
    get: () => adminApi.backups,
    enumerable: true,
  },
  dashboard: {
    get: () => ({
      getDashboardMetrics: analyticsApi.getDashboardMetrics,
      getCaseAnalytics: analyticsApi.getCaseAnalytics,
      getRevenueAnalytics: analyticsApi.getRevenueAnalytics,
      getTeamMetrics: analyticsApi.getTeamMetrics,
      getCustomReport: analyticsApi.getCustomReport,
    }),
    enumerable: true,
  },
  metrics: {
    get: () => ({
      getSystemMetrics: adminApi.getSystemMetrics,
      getSystemHealth: adminApi.getSystemHealth,
    }),
    enumerable: true,
  },
  serviceJobs: {
    get: () => adminApi.processingJobs,
    enumerable: true,
  },
  dataSourcesIntegration: {
    get: () => api.dataSources,
    enumerable: true,
  },
};
