// src/contexts/data/DataContext.tsx
import { adminApi } from "@/api/domains/admin.api";
import { litigationApi } from "@/api/domains/litigation.api";
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useEntitlements } from "../entitlements/EntitlementsContext";

export type DashboardItem =
  | { type: 'case'; id: string; label: string; status: string }
  | { type: 'audit'; id: string; label: string; action: string }
  | { type: 'public'; id: string; label: string };

type DataContextValue = {
  items: DashboardItem[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const DataContext = createContext<DataContextValue | null>(null);

export const DataProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { auth } = useAuth();
  const { entitlements } = useEntitlements();
  const [items, setItems] = useState<DashboardItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (auth.status === "anonymous") {
        setItems([{ type: 'public', id: "p1", label: "Welcome to LexiFlow Public Portal" }]);
        return;
      }

      // Admin Data Fetch
      if (entitlements.plan === "enterprise" && auth.user?.role === "Administrator") {
        try {
          // Try to fetch audit logs or system metrics
          const logs = await adminApi.auditLogs.getAll();
          const logList = Array.isArray(logs) ? logs : (logs as any).data || [];

          const mappedLogs: DashboardItem[] = logList.map((log: any) => ({
            type: 'audit',
            id: log.id,
            label: `Audit: ${log.action} by ${log.userId}`,
            action: log.action
          }));
          setItems(mappedLogs);
          return;
        } catch (e) {
          console.warn("Failed to fetch admin data", e);
          // Fallthrough to member data if admin fetch fails
        }
      }

      // Member Data Fetch (Cases)
      try {
        const cases = await litigationApi.cases.getAll();
        // cases might be PaginatedResponse or array. Assuming array or .data
        const caseList = Array.isArray(cases) ? cases : (cases as any).data || [];

        const mappedCases: DashboardItem[] = caseList.map((c: any) => ({
          type: 'case',
          id: c.id,
          label: c.title || c.caseNumber || "Untitled Case",
          status: c.status
        }));
        setItems(mappedCases);
      } catch (e) {
        console.error("Failed to fetch cases", e);
        setError("Failed to load dashboard data");
      }

    } catch (err: any) {
      setError(err.message || "Data refresh failed");
    } finally {
      setIsLoading(false);
    }
  }, [auth.status, auth.user, entitlements.plan]);

  const value = useMemo(() => ({ items, isLoading, error, refresh }), [items, isLoading, error, refresh]);
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextValue => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
};
