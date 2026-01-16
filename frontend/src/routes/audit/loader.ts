/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Audit Domain - Data Loader
 * Enterprise React Architecture Pattern
 */

import { adminApi } from "@/lib/frontend-api";

type AuditLog = {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  severity: "Info" | "Warning" | "Critical";
  ipAddress: string;
};

export interface AuditLoaderData {
  logs: AuditLog[];
}

export async function auditLoader() {
  const result = await adminApi.getAuditLogs({ page: 1, limit: 200 });
  const logs = result.ok ? result.data.data : [];

  return {
    logs: logs || [],
  };
}
