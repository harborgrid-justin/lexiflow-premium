/**
 * React Query Hooks for Cases API
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import * as casesService from '../../services/api/casesService';
import type { CaseListResponse, CaseDetailsResponse, CaseItem, CreateCaseRequest, UpdateCaseRequest, CaseFilters } from '../../types/api';

// Query Keys
export const caseKeys = {
  all: ['cases'] as const,
  lists: () => [...caseKeys.all, 'list'] as const,
  list: (filters?: CaseFilters) => [...caseKeys.lists(), { filters }] as const,
  details: () => [...caseKeys.all, 'detail'] as const,
  detail: (id: string) => [...caseKeys.details(), id] as const,
  statistics: () => [...caseKeys.all, 'statistics'] as const,
  timeline: (id: string) => [...caseKeys.detail(id), 'timeline'] as const,
  parties: (id: string) => [...caseKeys.detail(id), 'parties'] as const,
  team: (id: string) => [...caseKeys.detail(id), 'team'] as const,
  phases: (id: string) => [...caseKeys.detail(id), 'phases'] as const,
};

/**
 * Hook to get list of cases
 */
export function useCases(
  filters?: CaseFilters,
  options?: Omit<UseQueryOptions<CaseListResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: caseKeys.list(filters),
    queryFn: () => casesService.getCases(filters),
    ...options,
  });
}

/**
 * Hook to get case by ID
 */
export function useCase(
  id: string,
  options?: Omit<UseQueryOptions<CaseDetailsResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: caseKeys.detail(id),
    queryFn: () => casesService.getCaseById(id),
    enabled: !!id,
    ...options,
  });
}

/**
 * Hook to search cases
 */
export function useSearchCases(
  query: string,
  filters?: CaseFilters,
  options?: Omit<UseQueryOptions<CaseListResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...caseKeys.lists(), 'search', query, filters],
    queryFn: () => casesService.searchCases(query, filters),
    enabled: query.length > 0,
    ...options,
  });
}

/**
 * Hook to get case statistics
 */
export function useCaseStatistics(
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: caseKeys.statistics(),
    queryFn: () => casesService.getCaseStatistics(),
    ...options,
  });
}

/**
 * Hook to get case timeline
 */
export function useCaseTimeline(
  caseId: string,
  options?: Omit<UseQueryOptions<any[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: caseKeys.timeline(caseId),
    queryFn: () => casesService.getCaseTimeline(caseId),
    enabled: !!caseId,
    ...options,
  });
}

/**
 * Hook to get case parties
 */
export function useCaseParties(
  caseId: string,
  options?: Omit<UseQueryOptions<any[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: caseKeys.parties(caseId),
    queryFn: () => casesService.getCaseParties(caseId),
    enabled: !!caseId,
    ...options,
  });
}

/**
 * Hook to get case team
 */
export function useCaseTeam(
  caseId: string,
  options?: Omit<UseQueryOptions<any[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: caseKeys.team(caseId),
    queryFn: () => casesService.getCaseTeam(caseId),
    enabled: !!caseId,
    ...options,
  });
}

/**
 * Hook to create case
 */
export function useCreateCase(
  options?: UseMutationOptions<CaseItem, Error, CreateCaseRequest>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: casesService.createCase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: caseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: caseKeys.statistics() });
    },
    ...options,
  });
}

/**
 * Hook to update case
 */
export function useUpdateCase(
  options?: UseMutationOptions<CaseItem, Error, { id: string; data: UpdateCaseRequest }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => casesService.updateCase(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: caseKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: caseKeys.lists() });
    },
    ...options,
  });
}

/**
 * Hook to delete case
 */
export function useDeleteCase(
  options?: UseMutationOptions<void, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: casesService.deleteCase,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: caseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: caseKeys.statistics() });
      queryClient.removeQueries({ queryKey: caseKeys.detail(id) });
    },
    ...options,
  });
}

/**
 * Hook to add party to case
 */
export function useAddCaseParty(
  options?: UseMutationOptions<any, Error, { caseId: string; party: any }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ caseId, party }) => casesService.addCaseParty(caseId, party),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: caseKeys.parties(variables.caseId) });
      queryClient.invalidateQueries({ queryKey: caseKeys.detail(variables.caseId) });
    },
    ...options,
  });
}

/**
 * Hook to add team member to case
 */
export function useAddCaseTeamMember(
  options?: UseMutationOptions<any, Error, { caseId: string; member: any }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ caseId, member }) => casesService.addCaseTeamMember(caseId, member),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: caseKeys.team(variables.caseId) });
      queryClient.invalidateQueries({ queryKey: caseKeys.detail(variables.caseId) });
    },
    ...options,
  });
}

/**
 * Hook to remove team member from case
 */
export function useRemoveCaseTeamMember(
  options?: UseMutationOptions<void, Error, { caseId: string; memberId: string }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ caseId, memberId }) => casesService.removeCaseTeamMember(caseId, memberId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: caseKeys.team(variables.caseId) });
      queryClient.invalidateQueries({ queryKey: caseKeys.detail(variables.caseId) });
    },
    ...options,
  });
}

/**
 * Hook to export case
 */
export function useExportCase(
  options?: UseMutationOptions<Blob, Error, { caseId: string; format?: 'pdf' | 'excel' | 'json' }>
) {
  return useMutation({
    mutationFn: ({ caseId, format }) => casesService.exportCase(caseId, format),
    ...options,
  });
}

export default {
  useCases,
  useCase,
  useSearchCases,
  useCaseStatistics,
  useCaseTimeline,
  useCaseParties,
  useCaseTeam,
  useCreateCase,
  useUpdateCase,
  useDeleteCase,
  useAddCaseParty,
  useAddCaseTeamMember,
  useRemoveCaseTeamMember,
  useExportCase,
};
