/**
 * Research Hook
 * Production implementation for legal research
 */

import { useQuery } from "@/hooks/useQueryHooks";
import { DataService } from "@/services/data/data-service.service";

export function useResearch() {
  const { data: citations = [], isLoading: citationsLoading } = useQuery(
    ["citations"],
    async () => {
      const data = await DataService.citations.getAll();
      return data || [];
    },
  );

  return {
    citations,
    isLoading: citationsLoading,
  };
}
