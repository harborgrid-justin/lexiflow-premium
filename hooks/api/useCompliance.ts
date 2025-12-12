/**
 * React Query Hooks for Compliance API
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import * as complianceService from '../../services/api/complianceService';
import type { PaginationParams } from '../../types/api';

// Query Keys
export const complianceKeys = {
  all: ['compliance'] as const,
  auditLogs: {
    all: ['compliance', 'auditLogs'] as const,
    lists: () => [...complianceKeys.auditLogs.all, 'list'] as const,
    list: (filters?: any) => [...complianceKeys.auditLogs.lists(), { filters }] as const,
  },
  conflicts: {
    all: ['compliance', 'conflicts'] as const,
    lists: () => [...complianceKeys.conflicts.all, 'list'] as const,
    list: (filters?: any) => [...complianceKeys.conflicts.lists(), { filters }] as const,
  },
  ethicalWalls: {
    all: ['compliance', 'ethicalWalls'] as const,
    lists: () => [...complianceKeys.ethicalWalls.all, 'list'] as const,
  },
  metrics: () => [...complianceKeys.all, 'metrics'] as const,
};

/**
 * Hook to get audit logs
 */
export function useAuditLogs(
  filters?: PaginationParams & {
    userId?: string;
    action?: string;
    resource?: string;
    dateFrom?: string;
    dateTo?: string;
  },
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: complianceKeys.auditLogs.list(filters),
    queryFn: () => complianceService.getAuditLogs(filters),
    ...options,
  });
}

/**
 * Hook to get conflict checks
 */
export function useConflictChecks(
  filters?: PaginationParams & { status?: string; search?: string },
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: complianceKeys.conflicts.list(filters),
    queryFn: () => complianceService.getConflictChecks(filters),
    ...options,
  });
}

/**
 * Hook to perform conflict check
 */
export function usePerformConflictCheck(
  options?: UseMutationOptions<any, Error, { parties: string[]; matter: string }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ parties, matter }) => complianceService.performConflictCheck(parties, matter),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: complianceKeys.conflicts.lists() });
    },
    ...options,
  });
}

/**
 * Hook to get ethical walls
 */
export function useEthicalWalls(
  options?: Omit<UseQueryOptions<any[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: complianceKeys.ethicalWalls.lists(),
    queryFn: () => complianceService.getEthicalWalls(),
    ...options,
  });
}

/**
 * Hook to create ethical wall
 */
export function useCreateEthicalWall(
  options?: UseMutationOptions<any, Error, { name: string; description?: string; memberIds: string[] }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: complianceService.createEthicalWall,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: complianceKeys.ethicalWalls.lists() });
    },
    ...options,
  });
}

/**
 * Hook to get compliance metrics
 */
export function useComplianceMetrics(
  filters?: { dateFrom?: string; dateTo?: string },
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: complianceKeys.metrics(),
    queryFn: () => complianceService.getComplianceMetrics(filters),
    ...options,
  });
}

/**
 * Hook to export audit log
 */
export function useExportAuditLog(
  options?: UseMutationOptions<Blob, Error, { dateFrom: string; dateTo: string; format?: string }>
) {
  return useMutation({
    mutationFn: ({ dateFrom, dateTo, format }) =>
      complianceService.exportAuditLog(dateFrom, dateTo, format),
    ...options,
  });
}

export default {
  useAuditLogs,
  useConflictChecks,
  usePerformConflictCheck,
  useEthicalWalls,
  useCreateEthicalWall,
  useComplianceMetrics,
  useExportAuditLog,
};
