// src/contexts/data/DataContext.tsx
import { adminApi } from "@/api/domains/admin.api";
import { litigationApi } from "@/api/domains/litigation.api";
import { useAuth } from "@/hooks/useAuth";
import { useEntitlements } from "@/lib/entitlements/context";
import { freezeInDev } from "@/lib/immutability";
import React, { createContext, useCallback, useContext, useMemo, useState, useTransition } from "react";

export type DashboardItem =
  | { type: 'case'; id: string; label: string; status: string }
  | { type: 'audit'; id: string; label: string; action: string }
  | { type: 'public'; id: string; label: string };

interface DataStateValue {
  items: DashboardItem[];
  isLoading: boolean;
  isPending: boolean; // GUIDELINE #33: Expose transitional state
  error: string | null;
}

interface DataActionsValue {
  refresh: () => Promise<void>;
}

export type DataContextValue = DataStateValue & DataActionsValue;

const DataStateContext = createContext<DataStateValue | undefined>(undefined);
const DataActionsContext = createContext<DataActionsValue | undefined>(undefined);

export function DataProvider({ children }: React.PropsWithChildren) {
  const auth = useAuth();
  const { entitlements } = useEntitlements();
  const [items, setItems] = useState<DashboardItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // GUIDELINE #25-26: Use startTransition for non-urgent context updates
  const [isPending, startTransition] = useTransition();

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!auth.isAuthenticated) {
        // GUIDELINE #25: Wrap non-urgent state updates in startTransition
        startTransition(() => {
          setItems([{ type: 'public', id: "p1", label: "Welcome to LexiFlow Public Portal" }]);
        });
        return;
      }

      // Admin Data Fetch
      if (entitlements.plan === "enterprise" && auth.user?.role === "Administrator") {
        try {
          // Try to fetch audit logs or system metrics
          const logs = await adminApi.auditLogs.getAll();
          const logList = (Array.isArray(logs) ? logs : (logs as Record<string, unknown>).data || []) as Record<string, unknown>[];

          const mappedLogs: DashboardItem[] = logList.map((log: Record<string, unknown>) => ({
            type: 'audit',
            id: log.id as string,
            label: `Audit: ${log.action} by ${log.userId}`,
            action: log.action as string
          }));

          // GUIDELINE #25: Dashboard data refresh is not urgent
          startTransition(() => {
            setItems(mappedLogs);
          });
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
        const caseList = (Array.isArray(cases) ? cases : (cases as Record<string, unknown>).data || []) as Record<string, unknown>[];

        const mappedCases: DashboardItem[] = caseList.map((c: Record<string, unknown>) => ({
          type: 'case',
          id: c.id as string,
          label: (c.title || c.caseNumber || "Untitled Case") as string,
          status: c.status as string
        }));

        // GUIDELINE #25: Dashboard refresh is not urgent - UI can show stale data during transition
        startTransition(() => {
          setItems(mappedCases);
        });
      } catch (e) {
        console.error("Failed to fetch cases", e);
        setError("Failed to load dashboard data");
      }

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Data refresh failed");
    } finally {
      setIsLoading(false);
    }
  }, [auth.isAuthenticated, auth.user, entitlements.plan]);

  // GUIDELINE #33: Expose isPending to consumers for transitional UI
  const stateValue = useMemo<DataStateValue>(
    () => freezeInDev({ items, isLoading, isPending, error }),
    [items, isLoading, isPending, error]
  );
  const actionsValue = useMemo<DataActionsValue>(() => freezeInDev({ refresh }), [refresh]);

  return (
    <DataStateContext.Provider value={stateValue}>
      <DataActionsContext.Provider value={actionsValue}>
        {children}
      </DataActionsContext.Provider>
    </DataStateContext.Provider>
  );
};

export function useDataState(): DataStateValue {
  const context = useContext(DataStateContext);
  if (!context) {
    throw new Error("useDataState must be used within DataProvider");
  }
  return context;
}

export function useDataActions(): DataActionsValue {
  const context = useContext(DataActionsContext);
  if (!context) {
    throw new Error("useDataActions must be used within DataProvider");
  }
  return context;
}

export function useData(): DataContextValue {
  return {
    ...useDataState(),
    ...useDataActions(),
  };
}
