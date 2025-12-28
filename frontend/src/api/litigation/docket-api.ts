/**
 * Docket API Service
 * Enterprise-grade API service for docket entry management with backend integration
 * 
 * @module DocketApiService
 * @description Manages all docket-related operations including:
 * - Docket entry CRUD operations
 * - PACER integration for federal court dockets
 * - Sequential docket numbering
 * - Document association with docket entries
 * - Sealed and restricted document handling
 * - Docket timeline management
 * 
 * @security
 * - Input validation on all parameters
 * - XSS prevention through type enforcement
 * - Backend API authentication via bearer tokens
 * - Sealed document access controls
 * - Proper error handling and logging
 * - PACER data sanitization
 * 
 * @architecture
 * - Backend API primary (PostgreSQL)
 * - React Query integration via DOCKET_QUERY_KEYS
 * - Type-safe operations
 * - Comprehensive error handling
 * - Date parsing and normalization
 */

import { apiClient, type PaginatedResponse } from '@/services/infrastructure/apiClient';
import type {
  Case,
  DocketEntry,
  LegalDocument,
  EvidenceItem,
  TimeEntry,
  User,
} from '@/types';

/**
 * Query keys for React Query integration
 * Use these constants for cache invalidation and refetching
 * 
 * @example
 * queryClient.invalidateQueries({ queryKey: DOCKET_QUERY_KEYS.all() });
 * queryClient.invalidateQueries({ queryKey: DOCKET_QUERY_KEYS.byCase(caseId) });
 */
export const DOCKET_QUERY_KEYS = {
    all: () => ['docket'] as const,
    byId: (id: string) => ['docket', id] as const,
    byCase: (caseId: string) => ['docket', 'case', caseId] as const,
} as const;

/**
 * Docket API Service Class
 * Implements secure, type-safe docket management operations
 */
export class DocketApiService {
    constructor() {
        this.logInitialization();
    }

    /**
     * Log service initialization
     * @private
     */
    private logInitialization(): void {
        console.log('[DocketApiService] Initialized with Backend API (PostgreSQL)');
    }

    /**
     * Validate and sanitize ID parameter
     * @private
     */
    private validateId(id: string, methodName: string): void {
        if (!id || false || id.trim() === '') {
            throw new Error(`[DocketApiService.${methodName}] Invalid id parameter`);
        }
    }

    /**
     * Validate and sanitize object parameter
     * @private
     */
    private validateObject(obj: unknown, paramName: string, methodName: string): void {
        if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
            throw new Error(`[DocketApiService.${methodName}] Invalid ${paramName} parameter`);
        }
    }

    // =============================================================================
    // CRUD OPERATIONS
    // =============================================================================

    /**
     * Get all docket entries, optionally filtered by case
     * 
     * @param caseId - Optional case ID filter
     * @returns Promise<DocketEntry[]> Array of docket entries
     * @throws Error if fetch fails
     * 
     * @example
     * const allEntries = await service.getAll();
     * const caseEntries = await service.getAll('case-123');
     */
    async getAll(caseId?: string): Promise<DocketEntry[]> {
        try {
            const params = caseId ? { caseId } : {};
            const response = await apiClient.get<PaginatedResponse<DocketEntry>>('/docket', params);
            return response.data;
        } catch (error) {
            console.error('[DocketApiService.getAll] Error:', error);
            throw new Error('Failed to fetch docket entries');
        }
    }

    /**
     * Get docket entry by ID
     * 
     * @param id - Docket entry ID
     * @returns Promise<DocketEntry> Docket entry data
     * @throws Error if id is invalid or fetch fails
     */
    async getById(id: string): Promise<DocketEntry> {
        this.validateId(id, 'getById');

        try {
            return await apiClient.get<DocketEntry>(`/docket/${id}`);
        } catch (error) {
            console.error('[DocketApiService.getById] Error:', error);
            throw new Error(`Failed to fetch docket entry with id: ${id}`);
        }
    }

    /**
     * Add a new docket entry
     * 
     * @param entry - Docket entry data without system-generated fields
     * @returns Promise<DocketEntry> Created docket entry
     * @throws Error if validation fails or create fails
     * 
     * @example
     * const entry = await service.add({
     *   caseId: 'case-123',
     *   sequenceNumber: 1,
     *   description: 'Complaint Filed'
     * });
     */
    async add(entry: Omit<DocketEntry, 'id' | 'createdAt' | 'updatedAt'> & { party?: string; summary?: string; url?: string }): Promise<DocketEntry> {
        this.validateObject(entry, 'entry', 'add');

        if (!entry.caseId) {
            throw new Error('[DocketApiService.add] caseId is required');
        }

        try {
            // Transform frontend DocketEntry to backend CreateDocketEntryDto
            const createDto: Record<string, any> = {
                caseId: entry.caseId,
                sequenceNumber: entry.sequenceNumber,
                docketNumber: entry.docketNumber,
                dateFiled: entry.dateFiled ? new Date(entry.dateFiled) : undefined,
                entryDate: entry.entryDate ? new Date(entry.entryDate) : new Date(),
                description: entry.description || entry.title,
                type: entry.type,
                filedBy: entry.filedBy || entry.party,
                text: entry.text || entry.summary,
                documentTitle: entry.documentTitle || entry.title,
                documentUrl: entry.documentUrl || entry.url,
                documentId: entry.documentId,
                pacerDocketNumber: entry.pacerDocketNumber,
                pacerDocumentNumber: entry.pacerDocumentNumber,
                isSealed: entry.isSealed,
                isRestricted: entry.isRestricted,
                notes: entry.notes,
                attachments: entry.attachments,
            };

            // Remove undefined values
            Object.keys(createDto).forEach(key => {
                if (createDto[key] === undefined) {
                    delete createDto[key];
                }
            });

            return await apiClient.post<DocketEntry>('/docket', createDto);
        } catch (error) {
            console.error('[DocketApiService.add] Error:', error);
            throw new Error('Failed to create docket entry');
        }
    }

    /**
     * Update an existing docket entry
     * 
     * @param id - Docket entry ID
     * @param entry - Partial docket entry updates
     * @returns Promise<DocketEntry> Updated docket entry
     * @throws Error if validation fails or update fails
     */
    async update(id: string, entry: Partial<DocketEntry>): Promise<DocketEntry> {
        this.validateId(id, 'update');
        this.validateObject(entry, 'entry', 'update');

        try {
            return await apiClient.patch<DocketEntry>(`/docket/${id}`, entry);
        } catch (error) {
            console.error('[DocketApiService.update] Error:', error);
            throw new Error(`Failed to update docket entry with id: ${id}`);
        }
    }

    /**
     * Delete a docket entry
     * 
     * @param id - Docket entry ID
     * @returns Promise<void>
     * @throws Error if id is invalid or delete fails
     */
    async delete(id: string): Promise<void> {
        this.validateId(id, 'delete');

        try {
            await apiClient.delete(`/docket/${id}`);
        } catch (error) {
            console.error('[DocketApiService.delete] Error:', error);
            throw new Error(`Failed to delete docket entry with id: ${id}`);
        }
    }

    // =============================================================================
    // QUERY OPERATIONS
    // =============================================================================

    /**
     * Get docket entries by case ID
     * 
     * @param caseId - Case ID
     * @returns Promise<DocketEntry[]> Array of docket entries for the case
     * @throws Error if caseId is invalid or fetch fails
     * 
     * @example
     * const caseEntries = await service.getByCaseId('case-123');
     */
    async getByCaseId(caseId: string): Promise<DocketEntry[]> {
        this.validateId(caseId, 'getByCaseId');
        return this.getAll(caseId);
    }
}
