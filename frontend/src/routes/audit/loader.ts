/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Audit Domain - Data Loader
 * Enterprise React Architecture Pattern
 */

import { DataService } from "@/services/data/data-service.service";

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
  const logsPromise = DataService.audit.getAll().catch(() => []);
  const logs = await logsPromise;

  return {
    logs: logs || [],
  };
}
