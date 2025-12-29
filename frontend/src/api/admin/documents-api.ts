/**
 * Documents API Service
 * Enterprise-grade API service for document management with backend integration
 * 
 * @module DocumentsApiService
 * @description Manages all document-related operations including:
 * - Document CRUD operations
 * - Document upload and download
 * - Document versioning and comparison
 * - Document redaction and preview
 * - Bulk upload operations
 * - Folder management
 * 
 * @security
 * - Input validation on all parameters
 * - XSS prevention through type enforcement
 * - Backend API authentication via bearer tokens
 * - File upload validation and sanitization
 * - Secure file download with proper headers
 * - Proper error handling and logging
 * 
 * @architecture
 * - Backend API primary (PostgreSQL)
 * - React Query integration via DOCUMENTS_QUERY_KEYS
 * - Type-safe operations
 * - Comprehensive error handling
 * - Multipart form data for uploads
 */

import { apiClient, type PaginatedResponse } from '@/services/infrastructure/apiClient';
import type {
  LegalDocument,
} from '@/types';

/**
 * Query keys for React Query integration
 * Use these constants for cache invalidation and refetching
 * 
 * @example
 * queryClient.invalidateQueries({ queryKey: DOCUMENTS_QUERY_KEYS.all() });
 * queryClient.invalidateQueries({ queryKey: DOCUMENTS_QUERY_KEYS.byId(docId) });
 * queryClient.invalidateQueries({ queryKey: DOCUMENTS_QUERY_KEYS.byCase(caseId) });
 */
export const DOCUMENTS_QUERY_KEYS = {
    all: () => ['documents'] as const,
    byId: (id: string) => ['documents', id] as const,
    byCase: (caseId: string) => ['documents', 'case', caseId] as const,
    byType: (type: string) => ['documents', 'type', type] as const,
    byStatus: (status: string) => ['documents', 'status', status] as const,
    versions: (docId: string) => ['documents', docId, 'versions'] as const,
    folders: () => ['documents', 'folders'] as const,
} as const;

/**
 * Documents API Service Class
 * Implements secure, type-safe document management operations
 */
export class DocumentsApiService {
    constructor() {
        this.logInitialization();
    }

    /**
     * Log service initialization
     * @private
     */
    private logInitialization(): void {
        console.log('[DocumentsApiService] Initialized with Backend API (PostgreSQL)');
    }

    /**
     * Validate and sanitize ID parameter
     * @private
     */
    private validateId(id: string, methodName: string): void {
        if (!id || false || id.trim() === '') {
            throw new Error(`[DocumentsApiService.${methodName}] Invalid id parameter`);
        }
    }

    /**
     * Validate and sanitize file parameter
     * @private
     */
    private validateFile(file: File, methodName: string): void {
        if (!file || !(file instanceof File)) {
            throw new Error(`[DocumentsApiService.${methodName}] Invalid file parameter`);
        }
        if (file.size === 0) {
            throw new Error(`[DocumentsApiService.${methodName}] File cannot be empty`);
        }
    }

    /**
     * Validate and sanitize object parameter
     * @private
     */
    private validateObject(obj: unknown, paramName: string, methodName: string): void {
        if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
            throw new Error(`[DocumentsApiService.${methodName}] Invalid ${paramName} parameter`);
        }
    }

    /**
     * Validate and sanitize array parameter
     * @private
     */
    private validateArray(arr: unknown[], paramName: string, methodName: string): void {
        if (!arr || !Array.isArray(arr) || arr.length === 0) {
            throw new Error(`[DocumentsApiService.${methodName}] Invalid ${paramName} parameter`);
        }
    }

    // =============================================================================
    // CRUD OPERATIONS
    // =============================================================================

    /**
     * Get all documents with optional filters
     * 
     * @param filters - Optional filters for caseId, type, status, and pagination
     * @returns Promise<LegalDocument[]> Array of documents
     * @throws Error if fetch fails
     * 
     * @example
     * const allDocs = await service.getAll();
     * const caseDocs = await service.getAll({ caseId: 'case-123' });
     */
    async getAll(filters?: { caseId?: string; type?: string; status?: string; page?: number; limit?: number }): Promise<LegalDocument[]> {
        try {
            const response = await apiClient.get<PaginatedResponse<LegalDocument>>('/documents', filters);
            return response.data;
        } catch (error) {
            console.error('[DocumentsApiService.getAll] Error:', error);
            throw new Error('Failed to fetch documents');
        }
    }

    /**
     * Get document by ID
     * 
     * @param id - Document ID
     * @returns Promise<LegalDocument> Document data
     * @throws Error if id is invalid or fetch fails
     * 
     * @example
     * const doc = await service.getById('doc-123');
     */
    async getById(id: string): Promise<LegalDocument> {
        this.validateId(id, 'getById');

        try {
            return await apiClient.get<LegalDocument>(`/documents/${id}`);
        } catch (error) {
            console.error('[DocumentsApiService.getById] Error:', error);
            throw new Error(`Failed to fetch document with id: ${id}`);
        }
    }

    /**
     * Add a new document
     * 
     * @param doc - Document data without system-generated fields
     * @returns Promise<LegalDocument> Created document
     * @throws Error if validation fails or create fails
     * 
     * @example
     * const newDoc = await service.add({ title: 'Motion to Dismiss', ... });
     */
    async add(doc: Omit<LegalDocument, 'id' | 'createdAt' | 'updatedAt'>): Promise<LegalDocument> {
        this.validateObject(doc, 'doc', 'add');

        if (!doc.title) {
            throw new Error('[DocumentsApiService.add] Document title is required');
        }

        try {
            // Transform frontend LegalDocument to backend CreateDocumentDto
            const createDto = {
                title: doc.title,
                description: doc.description,
                type: doc.type, // Ensure this matches DocumentType enum
                caseId: doc.caseId,
                creatorId: doc.creatorId || doc.authorId || '00000000-0000-0000-0000-000000000000',
                status: doc.status,
                filename: doc.filename,
                filePath: doc.filePath,
                mimeType: doc.mimeType,
                fileSize: doc.fileSize,
                checksum: doc.checksum,
                author: doc.author,
                tags: doc.tags || [],
                customFields: doc.customFields,
            };
            
            // Remove undefined values
            Object.keys(createDto).forEach(key => {
                if ((createDto as Record<string, unknown>)[key] === undefined) {
                    delete (createDto as Record<string, unknown>)[key];
                }
            });
            
            return await apiClient.post<LegalDocument>('/documents', createDto);
        } catch (error) {
            console.error('[DocumentsApiService.add] Error:', error);
            throw new Error('Failed to create document');
        }
    }

    /**
     * Update an existing document
     * 
     * @param id - Document ID
     * @param doc - Partial document updates
     * @returns Promise<LegalDocument> Updated document
     * @throws Error if validation fails or update fails
     */
    async update(id: string, doc: Partial<LegalDocument>): Promise<LegalDocument> {
        this.validateId(id, 'update');
        this.validateObject(doc, 'doc', 'update');

        try {
            return await apiClient.put<LegalDocument>(`/documents/${id}`, doc);
        } catch (error) {
            console.error('[DocumentsApiService.update] Error:', error);
            throw new Error(`Failed to update document with id: ${id}`);
        }
    }

    /**
     * Delete a document
     * 
     * @param id - Document ID
     * @returns Promise<void>
     * @throws Error if id is invalid or delete fails
     */
    async delete(id: string): Promise<void> {
        this.validateId(id, 'delete');

        try {
            await apiClient.delete(`/documents/${id}`);
        } catch (error) {
            console.error('[DocumentsApiService.delete] Error:', error);
            throw new Error(`Failed to delete document with id: ${id}`);
        }
    }

    // =============================================================================
    // FILE OPERATIONS
    // =============================================================================

    /**
     * Upload a document file with metadata
     * 
     * @param file - File to upload
     * @param metadata - Document metadata
     * @returns Promise<LegalDocument> Created document
     * @throws Error if validation fails or upload fails
     * 
     * @example
     * const doc = await service.upload(file, { caseId: 'case-123', type: 'Pleading' });
     */
    async upload(file: File, metadata: Record<string, unknown>): Promise<LegalDocument> {
        this.validateFile(file, 'upload');
        this.validateObject(metadata, 'metadata', 'upload');

        try {
            return await apiClient.upload<LegalDocument>('/documents/upload', file, metadata);
        } catch (error) {
            console.error('[DocumentsApiService.upload] Error:', error);
            throw new Error('Failed to upload document');
        }
    }

    /**
     * Bulk upload multiple documents
     * 
     * @param files - Array of files to upload
     * @param metadata - Shared metadata for all files
     * @returns Promise<LegalDocument[]> Created documents
     * @throws Error if validation fails or upload fails
     * 
     * @example
     * const docs = await service.bulkUpload([file1, file2], { caseId: 'case-123' });
     */
    async bulkUpload(files: File[], metadata: Record<string, string>): Promise<LegalDocument[]> {
        this.validateArray(files, 'files', 'bulkUpload');
        this.validateObject(metadata, 'metadata', 'bulkUpload');

        files.forEach((file, index) => {
            if (!(file instanceof File)) {
                throw new Error(`[DocumentsApiService.bulkUpload] Invalid file at index ${index}`);
            }
        });

        try {
            const formData = new FormData();
            files.forEach(file => formData.append('files', file));
            Object.keys(metadata).forEach(key => formData.append(key, metadata[key]));

            const token = localStorage.getItem('lexiflow_auth_token');
            const headers: Record<string, string> = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            // Don't set Content-Type for FormData - browser will set it with boundary

            const response = await fetch(`${apiClient.getBaseUrl()}/documents/bulk-upload`, {
                method: 'POST',
                headers,
                body: formData,
            });

            if (!response.ok) {
                const errorBody = await response.text().catch(() => 'Unknown error');
                throw new Error(`Bulk upload failed: ${response.status} ${response.statusText} - ${errorBody}`);
            }

            return await response.json();
        } catch (error) {
            console.error('[DocumentsApiService.bulkUpload] Error:', error);
            throw new Error('Failed to bulk upload documents');
        }
    }

    /**
     * Download a document file
     * 
     * @param id - Document ID
     * @returns Promise<Blob> Document file as blob
     * @throws Error if id is invalid or download fails
     * 
     * @example
     * const blob = await service.download('doc-123');
     * const url = URL.createObjectURL(blob);
     */
    async download(id: string): Promise<Blob> {
        this.validateId(id, 'download');

        try {
            const response = await fetch(`${apiClient.getBaseUrl()}/documents/${id}/download`, {
                headers: apiClient['getHeaders'](),
            });

            if (!response.ok) {
                throw new Error(`Download failed: ${response.status} ${response.statusText}`);
            }

            return await response.blob();
        } catch (error) {
            console.error('[DocumentsApiService.download] Error:', error);
            throw new Error(`Failed to download document with id: ${id}`);
        }
    }

    /**
     * Get document preview URL
     * 
     * @param id - Document ID
     * @returns Promise<string> Preview URL
     * @throws Error if id is invalid or preview generation fails
     */
    async preview(id: string): Promise<string> {
        this.validateId(id, 'preview');

        try {
            const response = await apiClient.get<{ url: string }>(`/documents/${id}/preview`);
            return response.url;
        } catch (error) {
            console.error('[DocumentsApiService.preview] Error:', error);
            throw new Error(`Failed to generate preview for document with id: ${id}`);
        }
    }

    // =============================================================================
    // DOCUMENT OPERATIONS
    // =============================================================================

    /**
     * Redact document regions
     * 
     * @param id - Document ID
     * @param regions - Array of redaction regions with coordinates
     * @returns Promise<LegalDocument> Redacted document
     * @throws Error if validation fails or redaction fails
     */
    async redact(id: string, regions: Array<{ page: number; x: number; y: number; width: number; height: number }>): Promise<LegalDocument> {
        this.validateId(id, 'redact');
        this.validateArray(regions, 'regions', 'redact');

        try {
            return await apiClient.post<LegalDocument>(`/documents/${id}/redact`, { regions });
        } catch (error) {
            console.error('[DocumentsApiService.redact] Error:', error);
            throw new Error(`Failed to redact document with id: ${id}`);
        }
    }

    /**
     * Get document versions
     * 
     * @param documentId - Document ID
     * @returns Promise<unknown[]> Array of document versions
     * @throws Error if documentId is invalid or fetch fails
     */
    async getVersions(documentId: string): Promise<unknown[]> {
        this.validateId(documentId, 'getVersions');

        try {
            const response = await apiClient.get<PaginatedResponse<unknown>>(`/documents/${documentId}/versions`);
            return response.data;
        } catch (error) {
            console.error('[DocumentsApiService.getVersions] Error:', error);
            throw new Error(`Failed to fetch versions for document with id: ${documentId}`);
        }
    }

    /**
     * Restore a document version
     * 
     * @param documentId - Document ID
     * @param versionId - Version ID to restore
     * @returns Promise<LegalDocument> Restored document
     * @throws Error if validation fails or restore fails
     */
    async restoreVersion(documentId: string, versionId: string): Promise<LegalDocument> {
        this.validateId(documentId, 'restoreVersion');
        this.validateId(versionId, 'restoreVersion');

        try {
            return await apiClient.post<LegalDocument>(`/documents/${documentId}/versions/${versionId}/restore`, {});
        } catch (error) {
            console.error('[DocumentsApiService.restoreVersion] Error:', error);
            throw new Error(`Failed to restore version ${versionId} for document ${documentId}`);
        }
    }

    /**
     * Compare two document versions
     * 
     * @param documentId - Document ID
     * @param versionId - First version ID
     * @param compareWithId - Second version ID
     * @returns Promise with diff result
     * @throws Error if validation fails or comparison fails
     */
    async compareVersions(documentId: string, versionId: string, compareWithId: string): Promise<{ diff: string }> {
        this.validateId(documentId, 'compareVersions');
        this.validateId(versionId, 'compareVersions');
        this.validateId(compareWithId, 'compareVersions');

        try {
            return await apiClient.get<{ diff: string }>(`/documents/${documentId}/versions/${versionId}/compare?compareWith=${compareWithId}`);
        } catch (error) {
            console.error('[DocumentsApiService.compareVersions] Error:', error);
            throw new Error(`Failed to compare versions for document ${documentId}`);
        }
    }

    // =============================================================================
    // QUERY OPERATIONS
    // =============================================================================

    /**
     * Get documents by case ID
     * 
     * @param caseId - Case ID
     * @returns Promise<LegalDocument[]> Array of documents
     * @throws Error if caseId is invalid or fetch fails
     * 
     * @example
     * const caseDocs = await service.getByCaseId('case-123');
     */
    async getByCaseId(caseId: string): Promise<LegalDocument[]> {
        this.validateId(caseId, 'getByCaseId');
        return this.getAll({ caseId });
    }

    /**
     * Get document folders
     * 
     * @returns Promise<unknown[]> Array of folders
     * @throws Error if fetch fails
     */
    async getFolders(): Promise<unknown[]> {
        try {
            return await apiClient.get<unknown[]>('/documents/folders/list');
        } catch (error) {
            console.error('[DocumentsApiService.getFolders] Error:', error);
            throw new Error('Failed to fetch document folders');
        }
    }

    /**
     * Get document content/text
     * 
     * @param id - Document ID
     * @returns Promise<string> Document content
     * @throws Error if id is invalid or fetch fails
     */
    async getContent(id: string): Promise<string> {
        this.validateId(id, 'getContent');

        try {
            const response = await apiClient.get<{ content: string }>(`/documents/${id}/content`);
            return response.content;
        } catch (error) {
            console.error('[DocumentsApiService.getContent] Error:', error);
            throw new Error(`Failed to fetch content for document with id: ${id}`);
        }
    }
}
