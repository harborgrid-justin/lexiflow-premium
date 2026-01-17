/**
 * Practice Management Hook
 * Production implementation using actual DataService repositories
 */

import { queryClient, useMutation, useQuery } from "@/hooks/useQueryHooks";
import { DataService } from "@/services/data/data-service.service";

type Employee = Record<string, unknown>;
type Organization = Record<string, unknown>;

export function usePracticeManagement() {
  // HR data - using actual HR repository
  const { data: employees = [], isLoading: employeesLoading } = useQuery<
    Employee[]
  >(["hr", "employees"], async () => {
    const data = await DataService.hr.getAll();
    return data || [];
  });

  // Organizations - using actual organization repository
  const { data: organizations = [], isLoading: organizationsLoading } =
    useQuery<Organization[]>(["organizations"], async () => {
      const data = await DataService.organizations.getAll();
      return data || [];
    });

  // Mutations
  const createEmployeeMutation = useMutation(
    async (employee: Employee) => {
      return await DataService.hr.add(employee);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["hr", "employees"]);
      },
    },
  );

  const updateEmployeeMutation = useMutation(
    async ({ id, data }: { id: string; data: Employee }) => {
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
