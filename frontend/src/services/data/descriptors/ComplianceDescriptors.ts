import { adminApi, authApi, complianceApi } from "@/lib/frontend-api";
import { api } from "@/services/api";
import { ComplianceService } from "@/services/domain/compliance.service";
import { SecurityService } from "@/services/domain/security.service";

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
