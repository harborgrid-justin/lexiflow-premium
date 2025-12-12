/**
 * React Query Hooks for Discovery API
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import * as discoveryService from '../../services/api/discoveryService';
import type { PaginationParams } from '../../types/api';

// Query Keys
export const discoveryKeys = {
  all: ['discovery'] as const,
  requests: {
    all: ['discovery', 'requests'] as const,
    lists: () => [...discoveryKeys.requests.all, 'list'] as const,
    list: (filters?: any) => [...discoveryKeys.requests.lists(), { filters }] as const,
    detail: (id: string) => [...discoveryKeys.requests.all, 'detail', id] as const,
  },
  depositions: {
    all: ['discovery', 'depositions'] as const,
    lists: () => [...discoveryKeys.depositions.all, 'list'] as const,
    list: (filters?: any) => [...discoveryKeys.depositions.lists(), { filters }] as const,
    detail: (id: string) => [...discoveryKeys.depositions.all, 'detail', id] as const,
  },
  legalHolds: {
    all: ['discovery', 'legalHolds'] as const,
    lists: () => [...discoveryKeys.legalHolds.all, 'list'] as const,
    list: (filters?: any) => [...discoveryKeys.legalHolds.lists(), { filters }] as const,
  },
};

/**
 * Hook to get discovery requests
 */
export function useDiscoveryRequests(
  filters?: PaginationParams & { caseId?: string; status?: string },
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: discoveryKeys.requests.list(filters),
    queryFn: () => discoveryService.getDiscoveryRequests(filters),
    ...options,
  });
}

/**
 * Hook to get discovery request by ID
 */
export function useDiscoveryRequest(
  id: string,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: discoveryKeys.requests.detail(id),
    queryFn: () => discoveryService.getDiscoveryRequestById(id),
    enabled: !!id,
    ...options,
  });
}

/**
 * Hook to create discovery request
 */
export function useCreateDiscoveryRequest(
  options?: UseMutationOptions<any, Error, any>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: discoveryService.createDiscoveryRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: discoveryKeys.requests.lists() });
    },
    ...options,
  });
}

/**
 * Hook to update discovery request
 */
export function useUpdateDiscoveryRequest(
  options?: UseMutationOptions<any, Error, { id: string; data: any }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => discoveryService.updateDiscoveryRequest(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: discoveryKeys.requests.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: discoveryKeys.requests.lists() });
    },
    ...options,
  });
}

/**
 * Hook to get depositions
 */
export function useDepositions(
  filters?: PaginationParams & { caseId?: string; status?: string },
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: discoveryKeys.depositions.list(filters),
    queryFn: () => discoveryService.getDepositions(filters),
    ...options,
  });
}

/**
 * Hook to get deposition by ID
 */
export function useDeposition(
  id: string,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: discoveryKeys.depositions.detail(id),
    queryFn: () => discoveryService.getDepositionById(id),
    enabled: !!id,
    ...options,
  });
}

/**
 * Hook to create deposition
 */
export function useCreateDeposition(
  options?: UseMutationOptions<any, Error, any>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: discoveryService.createDeposition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: discoveryKeys.depositions.lists() });
    },
    ...options,
  });
}

/**
 * Hook to get legal holds
 */
export function useLegalHolds(
  filters?: PaginationParams & { caseId?: string; status?: string },
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: discoveryKeys.legalHolds.list(filters),
    queryFn: () => discoveryService.getLegalHolds(filters),
    ...options,
  });
}

/**
 * Hook to create legal hold
 */
export function useCreateLegalHold(
  options?: UseMutationOptions<any, Error, any>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: discoveryService.createLegalHold,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: discoveryKeys.legalHolds.lists() });
    },
    ...options,
  });
}

/**
 * Hook to issue legal hold
 */
export function useIssueLegalHold(
  options?: UseMutationOptions<any, Error, { id: string; custodianIds: string[] }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, custodianIds }) => discoveryService.issueLegalHold(id, custodianIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: discoveryKeys.legalHolds.lists() });
    },
    ...options,
  });
}

export default {
  useDiscoveryRequests,
  useDiscoveryRequest,
  useCreateDiscoveryRequest,
  useUpdateDiscoveryRequest,
  useDepositions,
  useDeposition,
  useCreateDeposition,
  useLegalHolds,
  useCreateLegalHold,
  useIssueLegalHold,
};
