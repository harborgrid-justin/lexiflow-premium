import { adminApi, api, authApi, complianceApi } from "@/api";
import { ComplianceService } from "@/services/domain/ComplianceDomain";
import { SecurityService } from "@/services/domain/SecurityDomain";

export const ComplianceDescriptors: PropertyDescriptorMap = {
  compliance: {
    get: () => ComplianceService,
    enumerable: true,
  },
  conflictChecks: {
    get: () => complianceApi.conflictChecks,
    enumerable: true,
  },
  ethicalWalls: {
    get: () => authApi.ethicalWalls,
    enumerable: true,
  },
  auditLogs: {
    get: () => adminApi.auditLogs,
    enumerable: true,
  },
  permissions: {
    get: () => authApi.permissions,
    enumerable: true,
  },
  rlsPolicies: {
    get: () => api.rlsPolicies,
    enumerable: true,
  },
  complianceReporting: {
    get: () => complianceApi.complianceReporting,
    enumerable: true,
  },
  security: { get: () => SecurityService, enumerable: true },
  tokenBlacklist: {
    get: () => authApi.tokenBlacklist,
    enumerable: true,
  },
};
