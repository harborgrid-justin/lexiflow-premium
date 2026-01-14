/**
 * Audit Domain - Data Loader
 * Enterprise React Architecture Pattern
 */

import { DataService } from "../../services/data/dataService";

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

export async function auditLoader(): Promise<AuditLoaderData> {
  const logs = await DataService.audit.getAll().catch(() => []);

  return {
    logs: logs || [],
  };
}
