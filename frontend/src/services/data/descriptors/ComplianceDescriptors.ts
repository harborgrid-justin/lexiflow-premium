import {
  adminApi,
  api,
  authApi,
  complianceApi,
  isBackendApiEnabled,
} from "@/api";
import { repositoryRegistry as legacyRepositoryRegistry } from "@/services/core/RepositoryFactory";
import { ComplianceService } from "@/services/domain/ComplianceDomain";
import { SecurityService } from "@/services/domain/SecurityDomain";
import { STORES } from "../db";

export const ComplianceDescriptors: PropertyDescriptorMap = {
  compliance: {
    get: () => ComplianceService,
    enumerable: true,
  },
  conflictChecks: {
    get: () =>
      isBackendApiEnabled()
        ? complianceApi.conflictChecks
        : legacyRepositoryRegistry.getOrCreate("conflictChecks"),
    enumerable: true,
  },
  ethicalWalls: {
    get: () =>
      isBackendApiEnabled()
        ? authApi.ethicalWalls
        : legacyRepositoryRegistry.getOrCreate("ethicalWalls"),
    enumerable: true,
  },
  auditLogs: {
    get: () =>
      isBackendApiEnabled()
        ? adminApi.auditLogs
        : legacyRepositoryRegistry.getOrCreate("auditLogs"),
    enumerable: true,
  },
  permissions: {
    get: () =>
      isBackendApiEnabled()
        ? authApi.permissions
        : legacyRepositoryRegistry.getOrCreate("permissions"),
    enumerable: true,
  },
  rlsPolicies: {
    get: () =>
      isBackendApiEnabled()
        ? api.rlsPolicies
        : legacyRepositoryRegistry.getOrCreate(STORES.POLICIES),
    enumerable: true,
  },
  complianceReporting: {
    get: () =>
      isBackendApiEnabled()
        ? complianceApi.complianceReporting
        : legacyRepositoryRegistry.getOrCreate("complianceReports"),
    enumerable: true,
  },
  security: { get: () => SecurityService, enumerable: true },
  tokenBlacklist: {
    get: () =>
      isBackendApiEnabled()
        ? authApi.tokenBlacklist
        : {
            getAll: async () => [],
            add: async () => ({ success: false }),
            remove: async () => ({ success: false }),
          },
    enumerable: true,
  },
};
