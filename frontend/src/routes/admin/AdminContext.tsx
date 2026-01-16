/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

import { createContext, useContext, useMemo } from 'react';

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  timestamp: any; // Can be string or Date
}

interface AdminContextValue {
  metrics: SystemMetrics;
  auditLogs: AuditLogEntry[];
  user: any; // Session user
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({
  children,
  metrics,
  auditLogs,
  user
}: {
  children: React.ReactNode;
  metrics: SystemMetrics;
  auditLogs: AuditLogEntry[];
  user: any;
}) {
  const value = useMemo<AdminContextValue>(() => ({
    metrics,
    auditLogs,
    user
  }), [metrics, auditLogs, user]);

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within AdminProvider');
  return context;
}
