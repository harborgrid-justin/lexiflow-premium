/**
 * Custom hook for Rate Table Management data operations
 * Extracts data fetching and CRUD logic from component per enterprise architecture
 *
 * @module routes/billing/hooks/useRateTables
 */

import { useCallback } from "react";

import { useNotify } from "@/hooks/useNotify";
import { useQuery } from "@/hooks/useQueryHooks";
import { billingApi } from "@/lib/frontend-api";
import { queryKeys } from "@/utils/queryKeys";

export interface RateTable {
  id: string;
  name: string;
  description: string;
  defaultRate: number;
  currency: string;
  status: "Active" | "Inactive" | "Draft";
  effectiveDate: string;
  expirationDate?: string;
  rates: { role: string; rate: number }[];
  createdAt: string;
}

export interface RateTablesData {
  rateTables: RateTable[];
  isLoading: boolean;
  createRateTable: (table: Partial<RateTable>) => Promise<boolean>;
  updateRateTable: (id: string, data: Partial<RateTable>) => Promise<boolean>;
  deleteRateTable: (id: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useRateTables(): RateTablesData {
  const notify = useNotify();

  // Fetch rate tables from backend API
  const {
    data: rateTables = [],
    refetch,
    isLoading,
  } = useQuery<RateTable[]>(
    queryKeys.billing.rateTables?.() || ["billing", "rateTables"],
    async () => {
      const result = await billingApi.getRateTables();
      return result.ok ? result.data : [];
    },
  );

  const createRateTable = useCallback(
    async (formData: Partial<RateTable>): Promise<boolean> => {
      if (!formData.name || !formData.defaultRate) {
        notify.error("Name and default rate are required");
        return false;
      }
      try {
        const newTable: Partial<RateTable> = {
          name: formData.name,
          description: formData.description || "",
          defaultRate: formData.defaultRate,
          currency: "USD",
          status: "Draft",
          effectiveDate:
            formData.effectiveDate || new Date().toISOString().split("T")[0],
          rates: formData.rates || [],
        };
        const result = await billingApi.createRateTable(newTable);
        if (!result.ok) {
          throw new Error(result.error.message);
        }
        await refetch();
        notify.success("Rate table created successfully");
        return true;
      } catch {
        notify.error("Failed to create rate table");
        return false;
      }
    },
    [notify, refetch],
  );

  const updateRateTable = useCallback(
    async (id: string, formData: Partial<RateTable>): Promise<boolean> => {
      try {
        const result = await billingApi.updateRateTable(id, formData);
        if (!result.ok) {
          throw new Error(result.error.message);
        }
        await refetch();
        notify.success("Rate table updated successfully");
        return true;
      } catch (error) {
        console.error("[useRateTables.updateRateTable] Error:", error);
        notify.error("Failed to update rate table");
        return false;
      }
    },
    [notify, refetch],
  );

  const deleteRateTable = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const result = await billingApi.deleteRateTable(id);
        if (!result.ok) {
          throw new Error(result.error.message);
        }
        await refetch();
        notify.success("Rate table deleted successfully");
        return true;
      } catch {
        notify.error("Failed to delete rate table");
        return false;
      }
    },
    [notify, refetch],
  );

  return {
    rateTables,
    isLoading,
    createRateTable,
    updateRateTable,
    deleteRateTable,
    refetch,
  };
}
