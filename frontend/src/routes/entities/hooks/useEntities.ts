/**
 * Entities Management Hook
 * Production implementation using DataService
 */

import { useNotify } from "@/hooks/useNotify";
import { queryClient, useMutation, useQuery } from "@/hooks/useQueryHooks";
import { DataService } from "@/services/data/data-service.service";
import { queryKeys } from "@/utils/queryKeys";

export function useEntities() {
  const notify = useNotify();

  const { data: entities = [], isLoading: entitiesLoading } = useQuery(
    queryKeys.entities.all(),
    async () => {
      const data = await DataService.entities.getAll();
      return data || [];
    },
    {
      onError: (error) => {
        console.error("Failed to fetch entities:", error);
        notify.error("Failed to load entities");
      },
    },
  );

  const updateEntityMutation = useMutation(
    async ({ id, data }: { id: string; data: any }) => {
      return await DataService.entities.update(id, data);
    },
    {
      onSuccess: () => {
        queryClient.invalidate(queryKeys.entities.all());
        notify.success("Entity updated successfully");
      },
      onError: (error) => {
        console.error("Failed to update entity:", error);
        notify.error("Failed to update entity");
      },
    },
  );

  return {
    entities,
    isLoading: entitiesLoading,
    updateEntity: updateEntityMutation.mutateAsync,
  };
}
