/**
 * Jurisdiction Management Hook
 * Production implementation using DataService repositories
 */

import { useQuery } from "@/hooks/useQueryHooks";
import { DataService } from "@/services/data/data-service.service";

export function useJurisdiction() {
  const { data: rules = [], isLoading: rulesLoading } = useQuery(
    ["rules"],
    async () => {
      const data = await DataService.rules.getAll();
      return data || [];
    },
  );

  return {
    rules,
    isLoading: rulesLoading,
  };
}

export function useRules() {
  return useJurisdiction();
}

export function useJurisdictionAndRules() {
  return useJurisdiction();
}
