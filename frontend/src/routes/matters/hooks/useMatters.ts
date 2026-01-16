/**
 * Matters Hook
 * Production implementation using DataService
 */

import { useQuery } from "@/hooks/useQueryHooks";
import { DataService } from "@/services/data/data-service.service";

export function useMatters() {
  const { data: matters = [], isLoading } = useQuery(["matters"], async () => {
    const data = await DataService.matters.getAll();
    return data || [];
  });

  return {
    matters,
    isLoading,
  };
}
