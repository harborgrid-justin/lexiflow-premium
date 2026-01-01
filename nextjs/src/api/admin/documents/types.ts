/**
 * Documents API Types
 * @module api/admin/documents/types
 */

/** Query keys for React Query integration */
export const DOCUMENTS_QUERY_KEYS = {
  all: () => ['documents'] as const,
  byId: (id: string) => ['documents', id] as const,
  byCase: (caseId: string) => ['documents', 'case', caseId] as const,
  byType: (type: string) => ['documents', 'type', type] as const,
  byStatus: (status: string) => ['documents', 'status', status] as const,
  versions: (docId: string) => ['documents', docId, 'versions'] as const,
  folders: () => ['documents', 'folders'] as const,
} as const;
