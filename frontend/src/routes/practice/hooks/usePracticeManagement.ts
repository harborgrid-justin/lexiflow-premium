/**
 * Practice Management Hook
 * Production implementation using actual DataService repositories
 */

import { queryClient, useMutation, useQuery } from "@/hooks/useQueryHooks";
import { DataService } from "@/services/data/data-service.service";

export function usePracticeManagement() {
  // HR data - using actual HR repository
  const { data: employees = [], isLoading: employeesLoading } = useQuery(
    ["hr", "employees"],
    async () => {
      const data = await DataService.hr.getAll();
      return data || [];
    },
  );

  // Organizations - using actual organization repository
  const { data: organizations = [], isLoading: organizationsLoading } =
    useQuery(["organizations"], async () => {
      const data = await DataService.organizations.getAll();
      return data || [];
    });

  // Mutations
  const createEmployeeMutation = useMutation(
    async (employee: any) => {
      return await DataService.hr.add(employee);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["hr", "employees"]);
      },
    },
  );

  const updateEmployeeMutation = useMutation(
    async ({ id, data }: { id: string; data: any }) => {
      return await DataService.hr.update(id, data);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["hr", "employees"]);
      },
    },
  );

  return {
    employees,
    organizations,
    isLoading: employeesLoading || organizationsLoading,
    createEmployee: createEmployeeMutation.mutateAsync,
    updateEmployee: updateEmployeeMutation.mutateAsync,
  };
}
