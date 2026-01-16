/**
 * Drafting Hook
 * Production implementation using templates
 */

import { useQuery } from "@/hooks/useQueryHooks";
import { DataService } from "@/services/data/data-service.service";

export function useDrafting() {
  const { data: templates = [], isLoading } = useQuery(
    ["drafting", "templates"],
    async () => {
      const data = await DataService.templates.getAll();
      return data || [];
    },
  );

  return {
    templates,
    isLoading,
  };
}
