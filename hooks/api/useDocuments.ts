/**
 * React Query Hooks for Documents API
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import * as documentsService from '../../services/api/documentsService';
import type { PaginationParams } from '../../types/api';

// Query Keys
export const documentKeys = {
  all: ['documents'] as const,
  lists: () => [...documentKeys.all, 'list'] as const,
  list: (filters?: any) => [...documentKeys.lists(), { filters }] as const,
  details: () => [...documentKeys.all, 'detail'] as const,
  detail: (id: string) => [...documentKeys.details(), id] as const,
  versions: (id: string) => [...documentKeys.detail(id), 'versions'] as const,
  tags: () => [...documentKeys.all, 'tags'] as const,
  statistics: (caseId?: string) => [...documentKeys.all, 'statistics', caseId] as const,
};

/**
 * Hook to get list of documents
 */
export function useDocuments(
  filters?: PaginationParams & { caseId?: string; search?: string },
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: documentKeys.list(filters),
    queryFn: () => documentsService.getDocuments(filters),
    ...options,
  });
}

/**
 * Hook to get document by ID
 */
export function useDocument(
  id: string,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: documentKeys.detail(id),
    queryFn: () => documentsService.getDocumentById(id),
    enabled: !!id,
    ...options,
  });
}

/**
 * Hook to search documents
 */
export function useSearchDocuments(
  query: string,
  filters?: any,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...documentKeys.lists(), 'search', query, filters],
    queryFn: () => documentsService.searchDocuments(query, filters),
    enabled: query.length > 0,
    ...options,
  });
}

/**
 * Hook to get document versions
 */
export function useDocumentVersions(
  documentId: string,
  options?: Omit<UseQueryOptions<any[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: documentKeys.versions(documentId),
    queryFn: () => documentsService.getDocumentVersions(documentId),
    enabled: !!documentId,
    ...options,
  });
}

/**
 * Hook to get document tags
 */
export function useDocumentTags(
  options?: Omit<UseQueryOptions<any[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: documentKeys.tags(),
    queryFn: () => documentsService.getDocumentTags(),
    ...options,
  });
}

/**
 * Hook to get document statistics
 */
export function useDocumentStatistics(
  caseId?: string,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: documentKeys.statistics(caseId),
    queryFn: () => documentsService.getDocumentStatistics(caseId),
    ...options,
  });
}

/**
 * Hook to upload document
 */
export function useUploadDocument(
  options?: UseMutationOptions<any, Error, { file: File; caseId: string; metadata?: any }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, caseId, metadata }) =>
      documentsService.uploadDocument(file, caseId, metadata),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
    },
    ...options,
  });
}

/**
 * Hook to update document
 */
export function useUpdateDocument(
  options?: UseMutationOptions<any, Error, { id: string; data: any }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => documentsService.updateDocument(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
    },
    ...options,
  });
}

/**
 * Hook to delete document
 */
export function useDeleteDocument(
  options?: UseMutationOptions<void, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: documentsService.deleteDocument,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      queryClient.removeQueries({ queryKey: documentKeys.detail(id) });
    },
    ...options,
  });
}

/**
 * Hook to download document
 */
export function useDownloadDocument(
  options?: UseMutationOptions<Blob, Error, string>
) {
  return useMutation({
    mutationFn: documentsService.downloadDocument,
    ...options,
  });
}

/**
 * Hook to tag document
 */
export function useTagDocument(
  options?: UseMutationOptions<any, Error, { id: string; tags: string[] }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, tags }) => documentsService.tagDocument(id, tags),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: documentKeys.tags() });
    },
    ...options,
  });
}

/**
 * Hook to share document
 */
export function useShareDocument(
  options?: UseMutationOptions<any, Error, { id: string; shareData: any }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, shareData }) => documentsService.shareDocument(id, shareData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.detail(variables.id) });
    },
    ...options,
  });
}

export default {
  useDocuments,
  useDocument,
  useSearchDocuments,
  useDocumentVersions,
  useDocumentTags,
  useDocumentStatistics,
  useUploadDocument,
  useUpdateDocument,
  useDeleteDocument,
  useDownloadDocument,
  useTagDocument,
  useShareDocument,
};
