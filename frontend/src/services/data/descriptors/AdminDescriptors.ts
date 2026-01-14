import { adminApi, analyticsApi, api, complianceApi } from "@/lib/frontend-api";
import { AdminService } from "@/services/domain/admin.service";
import { DataCatalogService } from "@/services/domain/data-catalog.service";
import { getDataQualityService } from "../factories/repository-factories.service";

export const AdminDescriptors: PropertyDescriptorMap = {
  admin: { get: () => AdminService, enumerable: true },
  reports: {
    get: () => complianceApi.reports,
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
    get: () => analyticsApi.dashboard,
    enumerable: true,
  },
  metrics: {
    get: () => adminApi.metrics,
    enumerable: true,
  },
  serviceJobs: {
    get: () => adminApi.serviceJobs,
    enumerable: true,
  },
  dataSourcesIntegration: {
    get: () => api.dataSources,
    enumerable: true,
  },
};
