import { api } from "@/api";
import { SecuritySetting } from "@/api/admin/system-settings-api";
import { RLSPolicy as ApiRLSPolicy } from "@/api/data-platform/rls-policies-api";
import { Integration } from "@/api/integrations/integrations-api";
import {
  ApiKey,
  ApiServiceSpec,
  AuditLogEntry,
  DataAnomaly,
  GovernancePolicy,
  GovernanceRule,
  PipelineJob,
  RLSPolicy,
  RolePermission,
} from "@/types";

export const AdminService = {
  getLogs: async (): Promise<AuditLogEntry[]> => {
    try {
      const logs = await api.auditLogs.getAll();
      return Array.isArray(logs)
        ? logs.map(
            (l) =>
              ({
                ...l,
                user: l.userName || l.userId || "Unknown",
                resource: l.entityType,
                ip: l.ipAddress || "",
              }) as unknown as AuditLogEntry
          )
        : [];
    } catch (error) {
      console.error("Failed to fetch logs", error);
      return [];
    }
  },

  getIntegrations: async () => {
    try {
      const integrations = await api.integrations.getAll();
      return integrations.map((int) => ({
        id: int.id,
        name: int.name,
        type: int.type,
        status: int.status === "active" ? "Connected" : "Disconnected",
        icon: int.name.charAt(0).toUpperCase(),
        color: int.status === "active" ? "bg-blue-600" : "bg-gray-600",
      }));
    } catch (error) {
      console.error("Failed to fetch integrations", error);
      return [];
    }
  },

  getSecuritySettings: async (): Promise<SecuritySetting[]> => {
    try {
      return await api.systemSettings.getSecuritySettings();
    } catch {
      return [];
    }
  },

  getRLSPolicies: async (): Promise<RLSPolicy[]> => {
    const policies = await api.rlsPolicies.getAll();
    return policies.map(
      (p) =>
        ({
          ...p,
          name: p.policyName,
          table: p.tableName,
          cmd: p.operation,
          status: p.enabled ? "Active" : "Disabled",
          roles: p.roles || [],
        }) as unknown as RLSPolicy
    );
  },

  saveRLSPolicy: async (policy: Partial<RLSPolicy>): Promise<unknown> => {
    // Map domain policy back to API format if needed, for now just pass as is or mock
    const apiPolicy = {
      tableName: policy.table,
      policyName: policy.name,
      operation: policy.cmd,
      enabled: policy.status === "Active",
      ...policy,
    };
    return api.rlsPolicies.create(apiPolicy as unknown as ApiRLSPolicy);
  },

  deleteRLSPolicy: async (id: string): Promise<void> => {
    return api.rlsPolicies.delete(id); // delete returns Promise<RLSPolicy> or void
  },

  getPermissions: async (): Promise<RolePermission[]> => {
    // api.permissions doesn't support getAll yet
    return [];
  },

  updatePermission: async (_payload: {
    role: string;
    resource: string;
    level: string;
  }) => {
    // Mock update: _payload
    console.log("Update permission mock", _payload);
    return {};
  },

  getPipelines: async (): Promise<PipelineJob[]> => {
    const response = await api.pipelines.getAll();
    return (response.data || []).map(
      (p) =>
        ({
          ...p,
          // map Pipeline to PipelineJob if needed
        }) as unknown as PipelineJob
    );
  },

  getApiKeys: async (): Promise<ApiKey[]> => {
    return api.apiKeys.getAll();
  },

  getAnomalies: async (): Promise<DataAnomaly[]> => {
    // api.aiOps.getAnomalies() not available
    return [];
  },

  getConnectors: async (): Promise<unknown[]> => {
    try {
      const integrations = await api.integrations.getAll();
      return integrations.map((conn: Integration) => ({
        id: conn.id,
        name: conn.name,
        type: conn.type,
        status: conn.status === "active" ? "Healthy" : "Error",
        color: conn.type === "PostgreSQL" ? "text-blue-600" : "text-gray-600",
      }));
    } catch {
      return [];
    }
  },

  getGovernanceRules: async (): Promise<GovernanceRule[]> => {
    return api.compliance.getGovernanceRules();
  },

  getGovernancePolicies: async (): Promise<GovernancePolicy[]> => {
    return api.compliance.getGovernancePolicies();
  },

  getApiSpec: async (): Promise<ApiServiceSpec[]> => {
    return api.monitoring.getApiSpecs();
  },
};
