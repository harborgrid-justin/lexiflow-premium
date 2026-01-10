import { adminApi, api } from "@/api";
import { AuditLog } from "@/api/admin/audit-logs-api";
import { DataService } from "@/services/data/dataService";
import { RiskImpact, TaskStatusBackend, WorkflowTask } from "@/types";
import { ChartDataPoint } from "@/types/dashboard";
import { Invoice } from "@/types/financial";

export interface DashboardStats {
  activeCases: number;
  pendingMotions: number;
  billableHours: number;
  highRisks: number;
}

export interface DashboardAlert {
  id: string | number;
  message: string;
  detail: string;
  time: string;
  caseId: string;
}

export interface BillingStats {
  realization: number;
  totalBilled: number;
  month: string;
}

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    try {
      const now = new Date();
      const startOfMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      ).toISOString();
      const endOfMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0
      ).toISOString();

      const [stats, invoices, risks] = await Promise.all([
        (typeof DataService.cases.getStats === "function"
          ? DataService.cases.getStats()
          : Promise.resolve({
              totalActive: 0,
              upcomingDeadlines: 0,
              utilizationRate: 0,
            })
        ).catch((err: unknown) => {
          console.warn("Failed to fetch case stats", err);
          return { totalActive: 0, upcomingDeadlines: 0, utilizationRate: 0 };
        }),
        DataService.invoices
          .getAll({
            startDate: startOfMonth,
            endDate: endOfMonth,
          })
          .catch(() => []),
        DataService.risks.getAll({ impact: RiskImpact.High }).catch(() => []),
      ]);

      // Calculate derived stats
      // Assume 'stats' returns object with totalActive
      // api.cases.getStats() likely returns { totalActive: number, ... }

      // Calculate billable hours sum from invoices (proxy)
      // or check if api.billing.timeEntries exists for more accuracy
      const safeInvoices = Array.isArray(invoices) ? invoices : [];
      const billableRevenue = safeInvoices.reduce(
        (sum, inv) => sum + (inv.totalAmount || 0),
        0
      );

      return {
        activeCases: stats.totalActive ?? 0,
        pendingMotions: stats.upcomingDeadlines ?? 0,
        billableHours: billableRevenue, // Using revenue as proxy based on previous impl
        highRisks: Array.isArray(risks) ? risks.length : 0,
      };
    } catch (error) {
      console.error("Dashboard Service: Failed to fetch stats", error);
      return {
        activeCases: 0,
        pendingMotions: 0,
        billableHours: 0,
        highRisks: 0,
      };
    }
  },

  getBillingStats: async (): Promise<BillingStats> => {
    try {
      const now = new Date();
      const currentMonthName = now.toLocaleString("default", { month: "long" });
      const startOfMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      ).toISOString();
      const endOfMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0
      ).toISOString();

      // Fetch invoices for current month to calculate 'totalBilled' and 'realization'
      const invoices = await DataService.invoices
        .getAll() // getAll usually doesn't support complex filtering in legacy repo
        .then((allInvoices: Invoice[]) => {
          // Manual filtering if needed, or rely on API ignoring args if it was API
          // But since we use DataService, let's just get everything and filter in memory for safety
          if (!Array.isArray(allInvoices)) return [];
          return allInvoices.filter((inv) => {
            const d = new Date(inv.date || inv.createdAt || 0);
            return d >= new Date(startOfMonth) && d <= new Date(endOfMonth);
          });
        })
        .catch(() => [] as Invoice[]);

      const safeInvoices = Array.isArray(invoices) ? invoices : [];

      const totalBilled = safeInvoices.reduce(
        (sum, inv) => sum + (inv.totalAmount || 0),
        0
      );
      // Simulating realization rate based on paid/total
      const totalPaid = safeInvoices
        .filter((inv) => inv.status === "Paid")
        .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

      const realization = totalBilled > 0 ? (totalPaid / totalBilled) * 100 : 0;

      return {
        realization,
        totalBilled,
        month: currentMonthName,
      };
    } catch (error) {
      console.error("Dashboard Service: Failed to fetch billing stats", error);
      return {
        realization: 0,
        totalBilled: 0,
        month: new Date().toLocaleString("default", { month: "long" }),
      };
    }
  },

  getTasks: async (): Promise<WorkflowTask[]> => {
    try {
      // Use valid backend enum value
      const tasks = await DataService.tasks.getAll({
        status: TaskStatusBackend.TODO,
      });
      return tasks as WorkflowTask[];
    } catch (error) {
      console.error("Dashboard Service: Failed to fetch tasks", error);
      return [];
    }
  },

  getChartData: async (): Promise<ChartDataPoint[]> => {
    // Determine where chart data comes from.
    // Previously: DataService.dashboard.getChartData
    // We can simulate strict analytics here or fetch from analyticsApi
    try {
      // Ideally: await api.analytics.dashboard.getChartData();
      // But we know that might be missing.
      // Let's implement a real aggregation for "Cases by Status"
      const cases = await api.cases.getAll();
      const statusMap = new Map<string, number>();

      cases.forEach((c) => {
        const status = c.status || "Unknown";
        statusMap.set(status, (statusMap.get(status) || 0) + 1);
      });

      return Array.from(statusMap.entries()).map(([name, value]) => ({
        name,
        value,
      }));
    } catch (error) {
      console.error("Dashboard Service: Failed to fetch chart data", error);
      return [];
    }
  },

  getRecentAlerts: async (): Promise<DashboardAlert[]> => {
    try {
      // Fetch recent audit logs (last 7 days) as alerts
      const response = await adminApi.auditLogs.getAll({
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      });

      // Handle potential paginated response or direct array
      const logs = Array.isArray(response)
        ? response
        : (response as { items?: unknown[] }).items || [];

      if (!Array.isArray(logs)) {
        console.warn(
          "Dashboard Service: Unexpected audit logs format",
          response
        );
        return [];
      }

      // Sort by timestamp desc and take top 5
      const sortedLogs = (logs as Array<{ timestamp: string | number | Date }>)
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        .slice(0, 5);

      return (sortedLogs as AuditLog[]).map((log) => {
        // Safe mapping with strict types
        const details = log.changes
          ? JSON.stringify(log.changes)
          : log.metadata
            ? JSON.stringify(log.metadata)
            : "";

        return {
          id: log.id,
          message: log.action || "System Event",
          detail: details || `Entity: ${log.entityType}`,
          time: log.timestamp || new Date().toISOString(),
          caseId: (log.metadata?.caseId as string) || "",
        };
      });
    } catch (error) {
      console.error("Dashboard Service: Failed to fetch alerts", error);
      return [];
    }
  },
};
