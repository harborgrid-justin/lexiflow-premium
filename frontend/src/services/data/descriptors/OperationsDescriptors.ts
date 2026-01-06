import {
  adminApi,
  api,
  discoveryApi,
  isBackendApiEnabled,
  workflowApi,
} from "@/api";
import { repositoryRegistry as legacyRepositoryRegistry } from "@/services/core/RepositoryFactory";
import { AssetService } from "@/services/domain/AssetDomain";
import { OperationsService } from "@/services/domain/OperationsDomain";
import { STORES } from "../db";
import {
  getProjectsRepository,
  getTasksRepository,
  getWorkflowRepository,
} from "../factories/RepositoryFactories";

export const OperationsDescriptors: PropertyDescriptorMap = {
  ocr: {
    get: () =>
      isBackendApiEnabled()
        ? adminApi.ocr
        : {
            processDocument: async () => ({
              success: false,
              message: "Backend required",
            }),
            getStatus: async () => ({ status: "unavailable" }),
          },
    enumerable: true,
  },
  processingJobs: {
    get: () =>
      isBackendApiEnabled()
        ? adminApi.processingJobs
        : legacyRepositoryRegistry.getOrCreate(STORES.PROCESSING_JOBS),
    enumerable: true,
  },
  documentVersions: {
    get: () =>
      isBackendApiEnabled()
        ? adminApi.documentVersions
        : legacyRepositoryRegistry.getOrCreate("documentVersions"),
    enumerable: true,
  },
  operations: { get: () => OperationsService, enumerable: true },
  assets: { get: () => AssetService, enumerable: true },
  production: {
    get: () =>
      isBackendApiEnabled()
        ? discoveryApi.productions
        : {
            getStatus: async () => ({
              environment: "development",
              version: "1.0.0",
              healthy: true,
            }),
            deploy: async () => ({
              success: false,
              message: "Backend required",
            }),
          },
    enumerable: true,
  },
  tasks: {
    get: () => (isBackendApiEnabled() ? api.tasks : getTasksRepository()),
    enumerable: true,
  },
  projects: {
    get: () => (isBackendApiEnabled() ? api.projects : getProjectsRepository()),
    enumerable: true,
  },
  workflow: {
    get: () =>
      isBackendApiEnabled() && api.workflow
        ? api.workflow
        : getWorkflowRepository(),
    enumerable: true,
  },
  warRoom: {
    get: () =>
      isBackendApiEnabled()
        ? workflowApi.warRoom
        : import("@/services/domain/WarRoomDomain").then(
            (m) => m.WarRoomService
          ),
    enumerable: true,
  },
};
