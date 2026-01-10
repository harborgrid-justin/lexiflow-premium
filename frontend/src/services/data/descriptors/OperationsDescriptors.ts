import { adminApi, api, discoveryApi, workflowApi } from "@/api";
import { AssetService } from "@/services/domain/AssetDomain";
import { OperationsService } from "@/services/domain/OperationsDomain";

export const OperationsDescriptors: PropertyDescriptorMap = {
  ocr: {
    get: () => adminApi.ocr,
    enumerable: true,
  },
  processingJobs: {
    get: () => adminApi.processingJobs,
    enumerable: true,
  },
  documentVersions: {
    get: () => adminApi.documentVersions,
    enumerable: true,
  },
  operations: { get: () => OperationsService, enumerable: true },
  assets: { get: () => AssetService, enumerable: true },
  production: {
    get: () => discoveryApi.productions,
    enumerable: true,
  },
  tasks: {
    get: () => api.tasks,
    enumerable: true,
  },
  projects: {
    get: () => api.projects,
    enumerable: true,
  },
  workflow: {
    get: () => api.workflow,
    enumerable: true,
  },
  warRoom: {
    get: () => workflowApi.warRoom,
    enumerable: true,
  },
};
