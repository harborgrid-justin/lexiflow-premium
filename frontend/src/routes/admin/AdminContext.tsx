/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

import { createContext, useMemo } from 'react';

interface SystemMetrics {
  timestamp: string;
  system: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    uptime: number;
  };
  application: {
    activeUsers: number;
    requestsPerMinute: number;
    averageResponseTime: number;
    errorRate: number;
  };
  database: {
    connections: number;
    queryTime: number;
    cacheHitRate: number;
  };
}

interface AuditLogEntry {
  id: string;
  severity: 'high' | 'medium' | 'low';
  action: string;
  entityType: string;
  userName: string;
  timestamp: string | Date;
}

type AdminUser = {
  id: string;
  name?: string;
} & Record<string, unknown>;

interface AdminContextValue {
  metrics: SystemMetrics;
  auditLogs: AuditLogEntry[];
  user: AdminUser; // Session user
}

const AdminContext = createContext<AdminContextValue | null>(null);

export { AdminContext };

export function AdminProvider({
  children,
  metrics,
  auditLogs,
  user
}: {
  children: React.ReactNode;
  metrics: SystemMetrics;
  auditLogs: AuditLogEntry[];
  user: AdminUser;
}) {
  const value = useMemo<AdminContextValue>(() => ({
    metrics,
    auditLogs,
    user
  }), [metrics, auditLogs, user]);

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}
