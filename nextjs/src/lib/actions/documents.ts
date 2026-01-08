'use server';

/**
 * Document Server Actions
 * Next.js 16 Strict Compliance with Server Actions
 *
 * CRUD operations for documents with:
 * - File upload handling
 * - Version management
 * - Folder operations
 * - OCR processing triggers
 */

import { revalidateTag } from 'next/cache';
import type { LegalDocument, DocumentVersion } from '@/types/documents';
import { API_BASE_URL } from '@/lib/api-config';
import {
  createAction,
  createMutation,
  createQuery,
  parseInput,
  ActionResult,
  success,
  failure,
  ActionContext,
  getActionContext,
} from './index';
import {
  createDocumentSchema,
  updateDocumentSchema,
  documentFilterSchema,
  uploadDocumentSchema,
  idInputSchema,
  CreateDocumentInput,
  UpdateDocumentInput,
  DocumentFilterInput,
  UploadDocumentInput,
} from '@/lib/validation';
import {
  CacheTags,
  CacheProfiles,
  invalidateDocumentData,
  invalidateTags,
} from '@/lib/cache';

// ============================================================================
// Types
// ============================================================================

interface DocumentFolder {
  id: string;
  name: string;
  parentId?: string;
  caseId?: string;
  documentCount: number;
  createdAt: string;
  updatedAt: string;
}

interface UploadResult {
  document: LegalDocument;
  uploadUrl?: string;
}

// ============================================================================
// API Helper
// ============================================================================

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  context?: ActionContext
): Promise<T> {
  const ctx = context ?? await getActionContext();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(ctx.userId && { 'X-User-Id': ctx.userId }),
      ...(ctx.organizationId && { 'X-Organization-Id': ctx.organizationId }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `API error: ${response.status}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// ============================================================================
// Query Actions (Read Operations)
// ============================================================================

/**
 * Get all documents with optional filtering
 */
export const getDocuments = createQuery<DocumentFilterInput | undefined, LegalDocument[]>(
  async (input, context) => {
    const params = input ? parseInput(documentFilterSchema, input) : {};

    const queryString = new URLSearchParams();
    if (params.page) queryString.set('page', String(params.page));
    if (params.pageSize) queryString.set('limit', String(params.pageSize));
    if (params.status?.length) queryString.set('status', params.status.join(','));
    if (params.type?.length) queryString.set('type', params.type.join(','));
    if (params.caseId) queryString.set('caseId', params.caseId);
    if (params.folderId) queryString.set('folderId', params.folderId);
    if (params.searchQuery) queryString.set('search', params.searchQuery);
    if (params.sortBy) queryString.set('sortBy', params.sortBy);
    if (params.sortOrder) queryString.set('sortOrder', params.sortOrder);

    const query = queryString.toString();
    const endpoint = `/documents${query ? `?${query}` : ''}`;

    return apiRequest<LegalDocument[]>(endpoint, {
      method: 'GET',
      next: {
        tags: [CacheTags.DOCUMENTS],
        revalidate: CacheProfiles.FAST,
      },
    }, context);
  },
  { requireAuth: false }
);

/**
 * Get a single document by ID
 */
export const getDocumentById = createQuery<{ id: string }, LegalDocument | null>(
  async (input, context) => {
    const { id } = parseInput(idInputSchema, input);

    try {
      return await apiRequest<LegalDocument>(`/documents/${id}`, {
        method: 'GET',
        next: {
          tags: [CacheTags.DOCUMENT(id)],
          revalidate: CacheProfiles.FAST,
        },
      }, context);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  },
  { requireAuth: false }
);

/**
 * Get document versions
 */
export const getDocumentVersions = createQuery<{ documentId: string }, DocumentVersion[]>(
  async (input, context) => {
    const { id: documentId } = parseInput(idInputSchema, { id: input.documentId });

    return apiRequest<DocumentVersion[]>(`/documents/${documentId}/versions`, {
      method: 'GET',
      next: {
        tags: [CacheTags.DOCUMENT_VERSIONS(documentId)],
        revalidate: CacheProfiles.DEFAULT,
      },
    }, context);
  },
  { requireAuth: false }
);

/**
 * Get documents by case
 */
export const getDocumentsByCase = createQuery<{ caseId: string }, LegalDocument[]>(
  async (input, context) => {
    const { caseId } = input;

    return apiRequest<LegalDocument[]>(`/documents?caseId=${caseId}`, {
      method: 'GET',
      next: {
        tags: [CacheTags.DOCUMENTS, CacheTags.CASE(caseId)],
        revalidate: CacheProfiles.FAST,
      },
    }, context);
  },
  { requireAuth: false }
);

/**
 * Get all folders
 */
export const getFolders = createQuery<{ parentId?: string } | undefined, DocumentFolder[]>(
  async (input, context) => {
    const query = input?.parentId ? `?parentId=${input.parentId}` : '';

    return apiRequest<DocumentFolder[]>(`/documents/folders/list${query}`, {
      method: 'GET',
      next: {
        tags: [CacheTags.FOLDERS],
        revalidate: CacheProfiles.DEFAULT,
      },
    }, context);
  },
  { requireAuth: false }
);

/**
 * Search documents
 */
export const searchDocuments = createQuery<
  { query: string; caseId?: string; limit?: number },
  LegalDocument[]
>(
  async (input, context) => {
    const { query, caseId, limit = 20 } = input;

    if (!query.trim()) {
      return [];
    }

    const params = new URLSearchParams({
      q: query.trim(),
      limit: String(limit),
    });
    if (caseId) params.set('caseId', caseId);

    return apiRequest<LegalDocument[]>(`/search/documents?${params}`, {
      method: 'GET',
      next: {
        tags: [CacheTags.DOCUMENTS],
        revalidate: CacheProfiles.FAST,
      },
    }, context);
  },
  { requireAuth: false }
);

// ============================================================================
// Mutation Actions (Write Operations)
// ============================================================================

/**
 * Create a new document (metadata only)
 */
export const createDocument = createMutation<CreateDocumentInput, LegalDocument>(
  async (input, context) => {
    const validated = parseInput(createDocumentSchema, input);

    const newDocument = await apiRequest<LegalDocument>('/documents', {
      method: 'POST',
      body: JSON.stringify(validated),
    }, context);

    // Invalidate caches
    revalidateTag(CacheTags.DOCUMENTS);
    if (validated.folderId) {
      revalidateTag(CacheTags.DOCUMENT_FOLDER(validated.folderId));
    }

    return newDocument;
  },
  {
    revalidateTags: [CacheTags.DOCUMENTS],
    auditLog: true,
  }
);

/**
 * Update document metadata
 */
export const updateDocument = createMutation<UpdateDocumentInput, LegalDocument>(
  async (input, context) => {
    const validated = parseInput(updateDocumentSchema, input);
    const { id, ...data } = validated;

    const updatedDocument = await apiRequest<LegalDocument>(`/documents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, context);

    // Invalidate document caches
    invalidateDocumentData(id, data.folderId);

    return updatedDocument;
  },
  { auditLog: true }
);

/**
 * Delete a document
 */
export const deleteDocument = createMutation<{ id: string }, { success: boolean }>(
  async (input, context) => {
    const { id } = parseInput(idInputSchema, input);

    // Get document first to know which folder to invalidate
    const document = await apiRequest<LegalDocument>(`/documents/${id}`, {
      method: 'GET',
    }, context);

    await apiRequest<void>(`/documents/${id}`, {
      method: 'DELETE',
    }, context);

    // Invalidate caches
    invalidateDocumentData(id, document.folderId);

    return { success: true };
  },
  {
    revalidateTags: [CacheTags.DOCUMENTS],
    auditLog: true,
  }
);

/**
 * Upload a document file
 */
export const uploadDocument = createMutation<
  UploadDocumentInput & { file: File },
  UploadResult
>(
  async (input, context) => {
    const { file, ...metadata } = input;
    const validated = parseInput(uploadDocumentSchema, metadata);

    // Create form data for multipart upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(validated));

    const ctx = context ?? await getActionContext();

    const response = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      headers: {
        ...(ctx.userId && { 'X-User-Id': ctx.userId }),
        ...(ctx.organizationId && { 'X-Organization-Id': ctx.organizationId }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || 'Document upload failed');
    }

    const result = await response.json();

    // Invalidate caches
    revalidateTag(CacheTags.DOCUMENTS);
    if (validated.folderId) {
      revalidateTag(CacheTags.DOCUMENT_FOLDER(validated.folderId));
    }

    return result;
  },
  {
    revalidateTags: [CacheTags.DOCUMENTS],
    auditLog: true,
  }
);

/**
 * Create a new version of a document
 */
export const createDocumentVersion = createMutation<
  { documentId: string; content: string; notes?: string },
  DocumentVersion
>(
  async (input, context) => {
    const { documentId, content, notes } = input;

    const newVersion = await apiRequest<DocumentVersion>(`/documents/${documentId}/versions`, {
      method: 'POST',
      body: JSON.stringify({ content, notes }),
    }, context);

    // Invalidate version cache
    revalidateTag(CacheTags.DOCUMENT_VERSIONS(documentId));
    revalidateTag(CacheTags.DOCUMENT(documentId));

    return newVersion;
  },
  { auditLog: true }
);

/**
 * Update document content
 */
export const updateDocumentContent = createMutation<
  { id: string; content: string },
  LegalDocument
>(
  async (input, context) => {
    const { id, content } = input;

    const updatedDocument = await apiRequest<LegalDocument>(`/documents/${id}/content`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    }, context);

    invalidateDocumentData(id);

    return updatedDocument;
  },
  { auditLog: true }
);

/**
 * Move document to folder
 */
export const moveDocument = createMutation<
  { documentId: string; folderId: string | null },
  LegalDocument
>(
  async (input, context) => {
    const { documentId, folderId } = input;

    // Get current document to know old folder
    const document = await apiRequest<LegalDocument>(`/documents/${documentId}`, {
      method: 'GET',
    }, context);

    const updatedDocument = await apiRequest<LegalDocument>(`/documents/${documentId}`, {
      method: 'PATCH',
      body: JSON.stringify({ folderId }),
    }, context);

    // Invalidate old and new folder caches
    if (document.folderId) {
      revalidateTag(CacheTags.DOCUMENT_FOLDER(document.folderId));
    }
    if (folderId) {
      revalidateTag(CacheTags.DOCUMENT_FOLDER(folderId));
    }
    revalidateTag(CacheTags.DOCUMENT(documentId));

    return updatedDocument;
  },
  { auditLog: true }
);

/**
 * Create a folder
 */
export const createFolder = createMutation<
  { name: string; parentId?: string; caseId?: string },
  DocumentFolder
>(
  async (input, context) => {
    const { name, parentId, caseId } = input;

    const newFolder = await apiRequest<DocumentFolder>('/documents/folders', {
      method: 'POST',
      body: JSON.stringify({ name, parentId, caseId }),
    }, context);

    revalidateTag(CacheTags.FOLDERS);
    if (parentId) {
      revalidateTag(CacheTags.DOCUMENT_FOLDER(parentId));
    }

    return newFolder;
  },
  {
    revalidateTags: [CacheTags.FOLDERS],
    auditLog: true,
  }
);

/**
 * Delete a folder
 */
export const deleteFolder = createMutation<{ id: string }, { success: boolean }>(
  async (input, context) => {
    const { id } = parseInput(idInputSchema, input);

    await apiRequest<void>(`/documents/folders/${id}`, {
      method: 'DELETE',
    }, context);

    revalidateTag(CacheTags.FOLDERS);
    revalidateTag(CacheTags.DOCUMENT_FOLDER(id));

    return { success: true };
  },
  {
    revalidateTags: [CacheTags.FOLDERS],
    auditLog: true,
  }
);

/**
 * Rename a folder
 */
export const renameFolder = createMutation<{ id: string; name: string }, DocumentFolder>(
  async (input, context) => {
    const { id, name } = input;

    const updatedFolder = await apiRequest<DocumentFolder>(`/documents/folders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    }, context);

    revalidateTag(CacheTags.FOLDERS);
    revalidateTag(CacheTags.DOCUMENT_FOLDER(id));

    return updatedFolder;
  },
  { auditLog: true }
);

/**
 * Trigger OCR processing for a document
 */
export const triggerOCR = createMutation<{ documentId: string }, { jobId: string }>(
  async (input, context) => {
    const { documentId } = input;

    const result = await apiRequest<{ jobId: string }>(`/ocr/process`, {
      method: 'POST',
      body: JSON.stringify({ documentId }),
    }, context);

    return result;
  },
  { auditLog: true }
);

/**
 * Update document status
 */
export const updateDocumentStatus = createMutation<
  { id: string; status: string },
  LegalDocument
>(
  async (input, context) => {
    const { id, status } = input;

    const updatedDocument = await apiRequest<LegalDocument>(`/documents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }, context);

    invalidateDocumentData(id);

    return updatedDocument;
  },
  { auditLog: true }
);

// ============================================================================
// Bulk Operations
// ============================================================================

/**
 * Delete multiple documents
 */
export const deleteDocuments = createMutation<
  { ids: string[] },
  { success: boolean; count: number }
>(
  async (input, context) => {
    const { ids } = input;

    await Promise.all(
      ids.map((id) =>
        apiRequest<void>(`/documents/${id}`, { method: 'DELETE' }, context)
      )
    );

    invalidateTags([CacheTags.DOCUMENTS, ...ids.map((id) => CacheTags.DOCUMENT(id))]);

    return { success: true, count: ids.length };
  },
  {
    revalidateTags: [CacheTags.DOCUMENTS],
    auditLog: true,
  }
);

/**
 * Move multiple documents to folder
 */
export const moveDocuments = createMutation<
  { documentIds: string[]; folderId: string | null },
  { success: boolean; count: number }
>(
  async (input, context) => {
    const { documentIds, folderId } = input;

    await Promise.all(
      documentIds.map((id) =>
        apiRequest<LegalDocument>(`/documents/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({ folderId }),
        }, context)
      )
    );

    invalidateTags([
      CacheTags.DOCUMENTS,
      ...documentIds.map((id) => CacheTags.DOCUMENT(id)),
      ...(folderId ? [CacheTags.DOCUMENT_FOLDER(folderId)] : []),
    ]);

    return { success: true, count: documentIds.length };
  },
  { auditLog: true }
);

// ============================================================================
// Form Actions
// ============================================================================

/**
 * Form action for uploading a document
 */
export async function uploadDocumentFormAction(
  prevState: ActionResult<UploadResult> | null,
  formData: FormData
): Promise<ActionResult<UploadResult>> {
  const file = formData.get('file') as File | null;
  const caseId = formData.get('caseId') as string;
  const title = formData.get('title') as string;
  const folderId = formData.get('folderId') as string | null;
  const description = formData.get('description') as string | null;
  const type = formData.get('type') as string | null;

  if (!file) {
    return failure('File is required', 'VALIDATION_ERROR');
  }

  if (!caseId) {
    return failure('Case ID is required', 'VALIDATION_ERROR');
  }

  const tags = formData.get('tags');
  let parsedTags: string[] = [];
  if (tags) {
    try {
      parsedTags = JSON.parse(tags as string);
    } catch {
      parsedTags = (tags as string).split(',').map((t) => t.trim()).filter(Boolean);
    }
  }

  return uploadDocument({
    file,
    caseId,
    title: title || file.name,
    folderId: folderId || undefined,
    description: description || undefined,
    type: (type as 'Contract' | 'Pleading' | 'Motion' | 'Brief' | 'Discovery' | 'Correspondence' | 'Evidence' | 'Exhibit' | 'Template' | 'Other') || 'Other',
    tags: parsedTags,
  });
}

/**
 * Form action for creating a folder
 */
export async function createFolderFormAction(
  prevState: ActionResult<DocumentFolder> | null,
  formData: FormData
): Promise<ActionResult<DocumentFolder>> {
  const name = formData.get('name') as string;
  const parentId = formData.get('parentId') as string | null;
  const caseId = formData.get('caseId') as string | null;

  if (!name) {
    return failure('Folder name is required', 'VALIDATION_ERROR');
  }

  return createFolder({
    name,
    parentId: parentId || undefined,
    caseId: caseId || undefined,
  });
}
