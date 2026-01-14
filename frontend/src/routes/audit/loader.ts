/**
 * Audit Domain - Data Loader
 * Enterprise React Architecture Pattern
 */

import { defer } from "react-router";
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

export async function auditLoader() {
  const logsPromise = DataService.audit.getAll().catch(() => []);
  const logs = await logsPromise;

  return defer({
    logs: logs || [],
  });
}
