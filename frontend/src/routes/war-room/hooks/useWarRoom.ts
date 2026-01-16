/**
 * War Room Hook
 * Production implementation for command center operations
 */

import { useQuery } from "@/hooks/useQueryHooks";
import { DataService } from "@/services/data/data-service.service";

export function useWarRoom() {
  const { data: cases = [], isLoading: casesLoading } = useQuery(
    ["cases"],
    async () => {
      const data = await DataService.cases.getAll();
      return data || [];
    },
  );

  const { data: matters = [], isLoading: mattersLoading } = useQuery(
    ["matters"],
    async () => {
      const data = await DataService.matters.getAll();
      return data || [];
    },
  );

  return {
    cases,
    matters,
    isLoading: casesLoading || mattersLoading,
  };
}
