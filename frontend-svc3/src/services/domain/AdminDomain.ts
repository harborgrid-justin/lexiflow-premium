import {
  ApiKey,
  ApiServiceSpec,
  AuditLogEntry,
  Connector,
  DataAnomaly,
  GovernancePolicy,
  GovernanceRule,
  PipelineJob,
  RLSPolicy,
  TenantConfig,
  type Permission,
  type RolePermissions,
} from "@/types";
/**
 * ? Migrated to backend API (2025-12-21)
 */
import { authApi, isBackendApiEnabled } from "@/api";
import { adminApi } from "@/api/domains/admin.api";
import { apiClient } from "@/services/infrastructure/apiClient";

export const AdminService = {
  // Real backend API access
  getLogs: async (): Promise<AuditLogEntry[]> => {
    try {
      const response = await adminApi.auditLogs?.getAll?.();
      if (!response) return [];

      // Handle paginated response from backend
      const logs = Array.isArray(response)
        ? response
        : response && typeof response === "object" && "data" in response
          ? (response as { data: unknown }).data
          : [];

      const auditLogs: AuditLogEntry[] = Array.isArray(logs) ? logs : [];

      return auditLogs.sort(
        (a: AuditLogEntry, b: AuditLogEntry) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch (error) {
      console.error("[AdminService.getLogs] Error fetching audit logs:", error);
      return [];
    }
  },

  // Integrations from backend
  getIntegrations: async (): Promise<
    Array<{
      id: string;
      name: string;
      type: string;
      status: string;
      icon: string;
      color: string;
    }>
  > => {
    try {
      // Use integrations API from backend
      const integrations = await apiClient.get<
        Array<{
          id: string;
          name: string;
          type: string;
          status: string;
        }>
      >("/integrations");

      if (integrations) {
        return integrations.map((int) => ({
          id: int.id,
          name: int.name,
          type: int.type,
          status: int.status,
          icon: int.name.charAt(0).toUpperCase(),
          color:
            int.status === "Connected"
              ? "bg-blue-600"
              : int.status === "Error"
                ? "bg-red-600"
                : "bg-gray-600",
        }));
      }
      return [];
    } catch (error) {
      console.error(
        "[AdminService.getIntegrations] Backend unavailable:",
        error
      );
      return [];
    }
  },

  getSecuritySettings: async (): Promise<
    Array<{
      id: string;
      label: string;
      desc: string;
      type: string;
      enabled: boolean;
    }>
  > => {
    if (isBackendApiEnabled()) {
      try {
        return await apiClient.get<
          Array<{
            id: string;
            label: string;
            desc: string;
            type: string;
            enabled: boolean;
          }>
        >("/admin/security-settings");
      } catch (error) {
        console.error(
          "[AdminService.getSecuritySettings] Backend unavailable:",
          error
        );
      }
    }

    // Fallback to default security settings
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [
      {
        id: "sec1",
        label: "Require MFA",
        desc: "All internal users must use 2-factor authentication.",
        type: "Lock",
        enabled: true,
      },
      {
        id: "sec2",
        label: "Session Timeout",
        desc: "Inactive sessions are logged out after 4 hours.",
        type: "Clock",
        enabled: true,
      },
      {
        id: "sec3",
        label: "IP Whitelisting",
        desc: "Restrict access to specific IP ranges.",
        type: "Globe",
        enabled: false,
      },
    ];
  },

  // RLS Policies from backend
  getRLSPolicies: async (): Promise<RLSPolicy[]> => {
    if (isBackendApiEnabled()) {
      try {
        return await apiClient.get("/data-platform/rls-policies");
      } catch (error) {
        console.warn("Failed to fetch RLS policies from backend", error);
        return [];
      }
    }
    return [];
  },
  saveRLSPolicy: async (policy: Partial<RLSPolicy>): Promise<unknown> => {
    if (isBackendApiEnabled()) {
      return await apiClient.post("/data-platform/rls-policies", policy);
    }
    return policy;
  },
  deleteRLSPolicy: async (id: string): Promise<void> => {
    if (isBackendApiEnabled()) {
      await apiClient.delete(`/data-platform/rls-policies/${id}`);
    }
  },

  // Permissions from backend
  getRolePermissions: async (roleId: string): Promise<RolePermissions> => {
    if (isBackendApiEnabled()) {
      try {
        return await authApi.permissions.getRolePermissions(roleId);
      } catch (error) {
        console.warn("Failed to fetch permissions from backend", error);
        throw error;
      }
    }
    throw new Error("Backend API required");
  },
  updateRolePermissions: async (
    roleId: string,
    permissions: Permission[]
  ): Promise<RolePermissions> => {
    if (isBackendApiEnabled()) {
      return await authApi.permissions.updateRolePermissions(
        roleId,
        permissions
      );
    }
    throw new Error("Backend API required");
  },

  // Data Platform - ETL Pipelines
  getPipelines: async (): Promise<PipelineJob[]> => {
    if (isBackendApiEnabled()) {
      try {
        return await apiClient.get("/data-platform/pipelines");
      } catch (error) {
        console.warn("Failed to fetch pipelines from backend", error);
        return [];
      }
    }
    return [];
  },
  getApiKeys: async (): Promise<ApiKey[]> => {
    if (isBackendApiEnabled()) {
      try {
        return await authApi.apiKeys.getAll();
      } catch (error) {
        console.warn("Failed to fetch API keys from backend", error);
        return [];
      }
    }
    return [];
  },

  getAnomalies: async (): Promise<DataAnomaly[]> => {
    if (isBackendApiEnabled()) {
      try {
        return await apiClient.get("/data-platform/anomalies");
      } catch (error) {
        console.warn("Failed to fetch anomalies from backend", error);
        return [];
      }
    }
    return [];
  },

  getDataDomains: async (): Promise<
    Array<{ name: string; count: number; desc: string }>
  > => {
    if (isBackendApiEnabled()) {
      try {
        return await apiClient.get<
          Array<{ name: string; count: number; desc: string }>
        >("/data-platform/domains");
      } catch (error) {
        console.error(
          "[AdminService.getDataDomains] Backend unavailable:",
          error
        );
        return [];
      }
    }
    return [];
  },

  getTenantConfig: async (): Promise<TenantConfig> => {
    if (isBackendApiEnabled()) {
      try {
        return await apiClient.get<TenantConfig>("/admin/tenant/config");
      } catch (error) {
        console.warn("Failed to fetch tenant config from backend", error);
        throw error;
      }
    }
    throw new Error("Backend API disabled");
  },

  getConnectors: async (): Promise<Connector[]> => {
    if (isBackendApiEnabled()) {
      try {
        // Fetch from backend data-sources API
        const connections = await apiClient.get<
          Array<{
            id: string;
            name: string;
            type: string;
            status: string;
          }>
        >("/integrations/data-sources");

        // Transform backend response to connector format
        return connections.map((conn) => {
          // Map status to valid Connector status
          let connectorStatus: "Healthy" | "Syncing" | "Degraded" | "Error" =
            "Error";
          if (conn.status === "active") connectorStatus = "Healthy";
          else if (conn.status === "syncing") connectorStatus = "Syncing";
          else if (conn.status === "degraded") connectorStatus = "Degraded";

          return {
            id: conn.id,
            name: conn.name,
            type: conn.type,
            status: connectorStatus,
            color:
              conn.type === "PostgreSQL"
                ? "text-blue-600"
                : conn.type === "Snowflake"
                  ? "text-sky-500"
                  : "text-gray-600",
          };
        });
      } catch (error) {
        console.error(
          "[AdminService.getConnectors] Backend unavailable:",
          error
        );
        return [];
      }
    }
    return [];
  },

  getGovernanceRules: async (): Promise<GovernanceRule[]> => {
    if (isBackendApiEnabled()) {
      try {
        return await apiClient.get<GovernanceRule[]>("/admin/governance/rules");
      } catch (error) {
        console.warn("Failed to fetch governance rules", error);
        return [];
      }
    }
    return [];
  },

  getGovernancePolicies: async (): Promise<GovernancePolicy[]> => {
    if (isBackendApiEnabled()) {
      try {
        return await apiClient.get<GovernancePolicy[]>(
          "/admin/governance/policies"
        );
      } catch (error) {
        console.warn("Failed to fetch governance policies", error);
        return [];
      }
    }
    return [];
  },

  getApiSpec: async (): Promise<ApiServiceSpec[]> => {
    if (isBackendApiEnabled()) {
      try {
        return await apiClient.get<ApiServiceSpec[]>("/admin/api-specs");
      } catch (error) {
        console.warn("Failed to fetch API specs", error);
        return [];
      }
    }
    return [];
  },

  getSystemSettings: async (): Promise<Record<string, unknown>> => {
    if (isBackendApiEnabled()) {
      try {
        return await apiClient.get("/admin/settings");
      } catch (error) {
        console.warn("Failed to fetch system settings", error);
      }
    }
    // Fallback or default
    return {
      backendUrl: process.env.VITE_API_URL || "/api",
      dataSource: "postgresql",
      cacheEnabled: true,
      cacheTTL: 300,
      maxUploadSize: 50 * 1024 * 1024,
      sessionTimeout: 30,
      auditLogging: true,
      maintenanceMode: false,
      features: {
        ocr: true,
        aiAssistant: true,
        realTimeSync: true,
        advancedSearch: true,
        documentVersioning: true,
      },
    };
  },
};
