/**
 * Enterprise Data Hooks
 * Enhanced data fetching hooks using the enterprise API client
 *
 * @module hooks/useEnterpriseData
 * @description Provides React hooks for data fetching with:
 * - Automatic retry with exponential backoff
 * - Client-side rate limiting
 * - Request/response caching
 * - Optimistic updates
 * - Type-safe operations
 * - Error boundaries
 *
 * @example
 * ```typescript
 * import { useCasesQuery, useCreateCaseMutation } from '@/hooks/useEnterpriseData';
 *
 * function CasesList() {
 *   const { data: cases, isLoading, error } = useCasesQuery();
 *   const createCase = useCreateCaseMutation();
 *
 *   if (isLoading) return <Loading />;
 *   if (error) return <Error error={error} />;
 *
 *   return <CaseTable cases={cases} onCreate={createCase.mutate} />;
 * }
 * ```
 */

import { enterpriseApi } from "@/api/enterprise";
import { queryClient } from "@/services/infrastructure/queryClient";
import type {
  Case,
  Client,
  DocketEntry,
  EvidenceItem,
  LegalDocument,
  TrialExhibit,
  User,
  WorkflowTask,
} from "@/types";
import { useMutation, useQuery } from "./useQueryHooks";

interface UpdateCaseContext {
  previousCase?: { data: Case };
}

interface UpdateTaskContext {
  previousTask?: { data: WorkflowTask };
}

// ============================================================================
// QUERY KEY FACTORY
// ============================================================================

/**
 * Centralized query keys for cache invalidation
 */
export const enterpriseQueryKeys = {
  // Cases
  cases: {
    all: () => ["enterprise", "cases"] as const,
    byId: (id: string) => ["enterprise", "cases", id] as const,
    byStatus: (status: string) =>
      ["enterprise", "cases", "status", status] as const,
  },
  // Documents
  documents: {
    all: () => ["enterprise", "documents"] as const,
    byId: (id: string) => ["enterprise", "documents", id] as const,
    byCase: (caseId: string) =>
      ["enterprise", "documents", "case", caseId] as const,
  },
  // Docket
  docket: {
    all: () => ["enterprise", "docket"] as const,
    byCase: (caseId: string) =>
      ["enterprise", "docket", "case", caseId] as const,
  },
  // Tasks
  tasks: {
    all: () => ["enterprise", "tasks"] as const,
    byId: (id: string) => ["enterprise", "tasks", id] as const,
    byCase: (caseId: string) =>
      ["enterprise", "tasks", "case", caseId] as const,
    byAssignee: (userId: string) =>
      ["enterprise", "tasks", "assignee", userId] as const,
  },
  // Evidence
  evidence: {
    all: () => ["enterprise", "evidence"] as const,
    byId: (id: string) => ["enterprise", "evidence", id] as const,
    byCase: (caseId: string) =>
      ["enterprise", "evidence", "case", caseId] as const,
  },
  // Exhibits
  exhibits: {
    all: () => ["enterprise", "exhibits"] as const,
    byCase: (caseId: string) =>
      ["enterprise", "exhibits", "case", caseId] as const,
  },
  // Users
  users: {
    all: () => ["enterprise", "users"] as const,
    byId: (id: string) => ["enterprise", "users", id] as const,
    current: () => ["enterprise", "users", "current"] as const,
  },
  // Clients
  clients: {
    all: () => ["enterprise", "clients"] as const,
    byId: (id: string) => ["enterprise", "clients", id] as const,
  },
} as const;

// ============================================================================
// QUERY HOOKS - CASES
// ============================================================================

/**
 * Fetch all cases
 */
export function useCasesQuery(filters?: { status?: string }) {
  return useQuery<Case[]>(
    filters?.status
      ? enterpriseQueryKeys.cases.byStatus(filters.status)
      : enterpriseQueryKeys.cases.all(),
    (signal) => enterpriseApi.get<Case[]>("/cases", filters, { signal }),
    { staleTime: 30000 }
  );
}

/**
 * Fetch single case by ID
 */
export function useCaseQuery(id: string, options: { enabled?: boolean } = {}) {
  return useQuery<Case>(
    enterpriseQueryKeys.cases.byId(id),
    (signal) => enterpriseApi.get<Case>(`/cases/${id}`, undefined, { signal }),
    { staleTime: 60000, enabled: options.enabled !== false }
  );
}

/**
 * Create new case mutation
 */
export function useCreateCaseMutation() {
  return useMutation<Case, Partial<Case>>(
    async (data) => enterpriseApi.post<Case>("/cases", data),
    {
      onSuccess: () => {
        queryClient.invalidate(enterpriseQueryKeys.cases.all());
      },
      invalidateKeys: [enterpriseQueryKeys.cases.all()],
    }
  );
}

/**
 * Update case mutation with optimistic updates
 */
export function useUpdateCaseMutation() {
  return useMutation<Case, { id: string; data: Partial<Case> }>(
    async ({ id, data }) => enterpriseApi.patch<Case>(`/cases/${id}`, data),
    {
      onMutate: async ({ id, data }) => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries(enterpriseQueryKeys.cases.byId(id));

        // Snapshot current value
        const previousCase = queryClient.getQueryState<Case>(
          enterpriseQueryKeys.cases.byId(id)
        );

        // Optimistically update cache
        if (previousCase?.data) {
          queryClient.setQueryData<Case>(enterpriseQueryKeys.cases.byId(id), {
            ...previousCase.data,
            ...data,
          });
        }

        return { previousCase };
      },
      onError: (_error, { id }, context: UpdateCaseContext | undefined) => {
        // Rollback on error
        if (context?.previousCase) {
          queryClient.setQueryData(
            enterpriseQueryKeys.cases.byId(id),
            context.previousCase.data
          );
        }
      },
      onSuccess: (data, { id }) => {
        // Update cache with server response
        queryClient.setQueryData(enterpriseQueryKeys.cases.byId(id), data);
        queryClient.invalidate(enterpriseQueryKeys.cases.all());
      },
    }
  );
}

/**
 * Delete case mutation
 */
export function useDeleteCaseMutation() {
  return useMutation<void, string>(
    async (id) => enterpriseApi.delete<void>(`/cases/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidate(enterpriseQueryKeys.cases.all());
      },
    }
  );
}

// ============================================================================
// QUERY HOOKS - DOCUMENTS
// ============================================================================

/**
 * Fetch all documents
 */
export function useDocumentsQuery(caseId?: string) {
  return useQuery<LegalDocument[]>(
    caseId
      ? enterpriseQueryKeys.documents.byCase(caseId)
      : enterpriseQueryKeys.documents.all(),
    (signal) =>
      enterpriseApi.get<LegalDocument[]>(
        "/documents",
        caseId ? { caseId } : undefined,
        { signal }
      ),
    { staleTime: 30000 }
  );
}

/**
 * Upload document mutation
 */
export function useUploadDocumentMutation() {
  return useMutation<
    LegalDocument,
    { file: File; metadata?: Record<string, unknown> }
  >(
    async ({ file, metadata }) =>
      enterpriseApi.upload<LegalDocument>(
        "/documents/upload",
        file,
        metadata as Record<string, string | Blob>
      ),
    {
      onSuccess: () => {
        queryClient.invalidate(enterpriseQueryKeys.documents.all());
      },
    }
  );
}

// ============================================================================
// QUERY HOOKS - DOCKET
// ============================================================================

/**
 * Fetch docket entries
 */
export function useDocketQuery(caseId: string) {
  return useQuery<DocketEntry[]>(
    enterpriseQueryKeys.docket.byCase(caseId),
    (signal) =>
      enterpriseApi.get<DocketEntry[]>(`/docket`, { caseId }, { signal }),
    { staleTime: 60000 }
  );
}

// ============================================================================
// QUERY HOOKS - TASKS
// ============================================================================

/**
 * Fetch all tasks
 */
export function useTasksQuery(filters?: {
  caseId?: string;
  assignedTo?: string;
  status?: string;
}) {
  const queryKey = filters?.caseId
    ? enterpriseQueryKeys.tasks.byCase(filters.caseId)
    : filters?.assignedTo
      ? enterpriseQueryKeys.tasks.byAssignee(filters.assignedTo)
      : enterpriseQueryKeys.tasks.all();

  return useQuery<WorkflowTask[]>(
    queryKey,
    (signal) =>
      enterpriseApi.get<WorkflowTask[]>("/tasks", filters, { signal }),
    { staleTime: 30000 }
  );
}

/**
 * Create task mutation
 */
export function useCreateTaskMutation() {
  return useMutation<WorkflowTask, Partial<WorkflowTask>>(
    async (data) => enterpriseApi.post<WorkflowTask>("/tasks", data),
    {
      onSuccess: () => {
        queryClient.invalidate(enterpriseQueryKeys.tasks.all());
      },
    }
  );
}

/**
 * Update task mutation with optimistic updates
 */
export function useUpdateTaskMutation() {
  return useMutation<WorkflowTask, { id: string; data: Partial<WorkflowTask> }>(
    async ({ id, data }) =>
      enterpriseApi.patch<WorkflowTask>(`/tasks/${id}`, data),
    {
      onMutate: async ({ id, data }) => {
        await queryClient.cancelQueries(enterpriseQueryKeys.tasks.byId(id));

        const previousTask = queryClient.getQueryState<WorkflowTask>(
          enterpriseQueryKeys.tasks.byId(id)
        );

        if (previousTask?.data) {
          queryClient.setQueryData<WorkflowTask>(
            enterpriseQueryKeys.tasks.byId(id),
            {
              ...previousTask.data,
              ...data,
            }
          );
        }

        return { previousTask };
      },
      onError: (_error, { id }, context: UpdateTaskContext | undefined) => {
        if (context?.previousTask) {
          queryClient.setQueryData(
            enterpriseQueryKeys.tasks.byId(id),
            context.previousTask.data
          );
        }
      },
      onSuccess: (data, { id }) => {
        queryClient.setQueryData(enterpriseQueryKeys.tasks.byId(id), data);
        queryClient.invalidate(enterpriseQueryKeys.tasks.all());
      },
    }
  );
}

// ============================================================================
// QUERY HOOKS - EVIDENCE
// ============================================================================

/**
 * Fetch evidence items
 */
export function useEvidenceQuery(caseId?: string) {
  return useQuery<EvidenceItem[]>(
    caseId
      ? enterpriseQueryKeys.evidence.byCase(caseId)
      : enterpriseQueryKeys.evidence.all(),
    (signal) =>
      enterpriseApi.get<EvidenceItem[]>(
        "/evidence",
        caseId ? { caseId } : undefined,
        { signal }
      ),
    { staleTime: 30000 }
  );
}

/**
 * Create evidence mutation
 */
export function useCreateEvidenceMutation() {
  return useMutation<EvidenceItem, Partial<EvidenceItem>>(
    async (data) => enterpriseApi.post<EvidenceItem>("/evidence", data),
    {
      onSuccess: () => {
        queryClient.invalidate(enterpriseQueryKeys.evidence.all());
      },
    }
  );
}

// ============================================================================
// QUERY HOOKS - TRIAL EXHIBITS
// ============================================================================

/**
 * Fetch trial exhibits
 */
export function useExhibitsQuery(caseId: string) {
  return useQuery<TrialExhibit[]>(
    enterpriseQueryKeys.exhibits.byCase(caseId),
    (signal) =>
      enterpriseApi.get<TrialExhibit[]>(
        `/trial/exhibits`,
        { caseId },
        { signal }
      ),
    { staleTime: 60000 }
  );
}

// ============================================================================
// QUERY HOOKS - USERS
// ============================================================================

/**
 * Fetch all users
 */
export function useUsersQuery() {
  return useQuery<User[]>(
    enterpriseQueryKeys.users.all(),
    (signal) => enterpriseApi.get<User[]>("/users", undefined, { signal }),
    { staleTime: 120000 }
  );
}

/**
 * Fetch current user
 */
export function useCurrentUserQuery() {
  return useQuery<User>(
    enterpriseQueryKeys.users.current(),
    (signal) => enterpriseApi.get<User>("/auth/profile", undefined, { signal }),
    { staleTime: 300000 }
  );
}

// ============================================================================
// QUERY HOOKS - CLIENTS
// ============================================================================

/**
 * Fetch all clients
 */
export function useClientsQuery() {
  return useQuery<Client[]>(
    enterpriseQueryKeys.clients.all(),
    (signal) => enterpriseApi.get<Client[]>("/clients", undefined, { signal }),
    { staleTime: 60000 }
  );
}

/**
 * Create client mutation
 */
export function useCreateClientMutation() {
  return useMutation<Client, Partial<Client>>(
    async (data) => enterpriseApi.post<Client>("/clients", data),
    {
      onSuccess: () => {
        queryClient.invalidate(enterpriseQueryKeys.clients.all());
      },
    }
  );
}

/**
 * Update client mutation
 */
export function useUpdateClientMutation() {
  return useMutation<Client, { id: string; data: Partial<Client> }>(
    async ({ id, data }) => enterpriseApi.patch<Client>(`/clients/${id}`, data),
    {
      onSuccess: (data, { id }) => {
        queryClient.setQueryData(enterpriseQueryKeys.clients.byId(id), data);
        queryClient.invalidate(enterpriseQueryKeys.clients.all());
      },
    }
  );
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Prefetch data for smoother navigation
 */
export function usePrefetchCase(id: string) {
  return () => {
    queryClient.fetch(
      enterpriseQueryKeys.cases.byId(id),
      (signal) =>
        enterpriseApi.get<Case>(`/cases/${id}`, undefined, { signal }),
      0
    );
  };
}

/**
 * Invalidate all case-related queries
 */
export function useInvalidateCaseQueries() {
  return () => {
    queryClient.invalidate(enterpriseQueryKeys.cases.all());
    queryClient.invalidate(enterpriseQueryKeys.documents.all());
    queryClient.invalidate(enterpriseQueryKeys.docket.all());
    queryClient.invalidate(enterpriseQueryKeys.tasks.all());
    queryClient.invalidate(enterpriseQueryKeys.evidence.all());
  };
}
