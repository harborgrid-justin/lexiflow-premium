import { DataService } from "@/services/data/data-service.service";
import { requireAdmin } from "@/utils/route-guards";
import type { LoaderFunctionArgs } from "react-router";

/**
 * Admin Dashboard Loader
 *
 * Fetches high-level system metrics and recent audit logs
 * for the dashboard view. Does not load full user/settings lists
 * to avoid over-fetching (those belong to sub-routes).
 */
export async function adminLoader({ request }: LoaderFunctionArgs) {
  // Security Check
  const session = requireAdmin(request);

  try {
    // Parallel Data Fetching
    // Note: We use try/catch inside to provide fallback for metrics if service is down
    const [metrics, auditLogs] = await Promise.all([
      DataService.metrics.getCurrent().catch(() => ({
        timestamp: new Date().toISOString(),
        system: { cpuUsage: 0, memoryUsage: 0, diskUsage: 0, uptime: 0 },
        application: {
          activeUsers: 0,
          requestsPerMinute: 0,
          averageResponseTime: 0,
          errorRate: 0,
        },
        database: { connections: 0, queryTime: 0, cacheHitRate: 0 },
      })),
      DataService.admin.getLogs().catch(() => []),
    ]);

    return {
      user: session.user,
      metrics,
      auditLogs: Array.isArray(auditLogs) ? auditLogs.slice(0, 5) : [],
    };
  } catch (error) {
    console.error("Admin loader failed", error);
    throw error; // Let RouteErrorBoundary handle critical failures
  }
}
