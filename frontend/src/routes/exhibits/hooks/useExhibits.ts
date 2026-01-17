/**
 * Exhibits Hook
 * Production implementation using DataService
 */

import { queryClient, useMutation, useQuery } from "@/hooks/useQueryHooks";
import { DataService } from "@/services/data/data-service.service";

type Exhibit = {
  id?: string;
} & Record<string, unknown>;

export function useExhibits() {
  const { data: exhibits = [], isLoading: exhibitsLoading } = useQuery<
    Exhibit[]
  >(["exhibits"], async () => {
    const data = await DataService.exhibits.getAll();
    return data || [];
  });

  const createExhibitMutation = useMutation(
    async (exhibit: Exhibit) => {
      return await DataService.exhibits.add(exhibit);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["exhibits"]);
      },
    },
  );

  const updateExhibitMutation = useMutation(
    async ({ id, data }: { id: string; data: Exhibit }) => {
      return await DataService.exhibits.update(id, data);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["exhibits"]);
      },
    },
  );

  return {
    exhibits,
    isLoading: exhibitsLoading,
    createExhibit: createExhibitMutation.mutateAsync,
    updateExhibit: updateExhibitMutation.mutateAsync,
  };
}
