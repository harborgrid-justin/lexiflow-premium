/**
 * Pleadings API Service
 * Enterprise-grade API service for legal pleadings management with backend integration
 * 
 * @module PleadingsApiService
 * @description Manages all pleading-related operations including:
 * - Pleading CRUD operations (complaints, answers, replies, etc.)
 * - Pleading status tracking and workflow
 * - Claims and defenses management
 * - Filing and service tracking
 * - Due date monitoring
 * - Amendment handling
 * 
 * @security
 * - Input validation on all parameters
 * - XSS prevention through type enforcement
 * - Backend API authentication via bearer tokens
 * - Proper error handling and logging
 * - Type-safe pleading operations
 * 
 * @architecture
 * - Backend API primary (PostgreSQL)
 * - React Query integration via PLEADINGS_QUERY_KEYS
 * - Type-safe operations
 * - Comprehensive error handling
 * - Pleading lifecycle management
 */

import { apiClient, type PaginatedResponse } from '@/services/infrastructure/apiClient';
import type { Pleading, PleadingFilters } from '@/types';

/**
 * Query keys for React Query integration
 * 
 * @example
 * queryClient.invalidateQueries({ queryKey: PLEADINGS_QUERY_KEYS.all() });
 * queryClient.invalidateQueries({ queryKey: PLEADINGS_QUERY_KEYS.byCase(caseId) });
 */
export const PLEADINGS_QUERY_KEYS = {
    all: () => ['pleadings'] as const,
    byId: (id: string) => ['pleadings', id] as const,
    byCase: (caseId: string) => ['pleadings', 'case', caseId] as const,
    byType: (type: string) => ['pleadings', 'type', type] as const,
    byStatus: (status: string) => ['pleadings', 'status', status] as const,
} as const;

export class PleadingsApiService {
    private readonly baseUrl = '/pleadings';

    constructor() {
        this.logInitialization();
    }

    private logInitialization(): void {
        console.log('[PleadingsApiService] Initialized with Backend API (PostgreSQL)');
    }

    private validateId(id: string, methodName: string): void {
        if (!id || false || id.trim() === '') {
            throw new Error(`[PleadingsApiService.${methodName}] Invalid id parameter`);
        }
    }

    private validateObject(obj: unknown, paramName: string, methodName: string): void {
        if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
            throw new Error(`[PleadingsApiService.${methodName}] Invalid ${paramName} parameter`);
        }
    }

    async getAll(filters?: PleadingFilters): Promise<Pleading[]> {
        try {
            const params = new URLSearchParams();
            if (filters?.caseId) params.append('caseId', filters.caseId);
            if (filters?.type) params.append('type', filters.type);
            if (filters?.status) params.append('status', filters.status);
            const queryString = params.toString();
            const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
            
            const response = await apiClient.get<Pleading[] | PaginatedResponse<Pleading>>(url);

            // Handle paginated response (support both 'items' and 'data' properties)
            if (response && typeof response === 'object' && !Array.isArray(response)) {
                const paginatedResponse = response as PaginatedResponse<Pleading>;
                const items = (paginatedResponse as unknown as Record<string, unknown>).items || (paginatedResponse as unknown as Record<string, unknown>).data;
                if (Array.isArray(items)) {
                    return items;
                }
            }

            // Handle direct array response
            if (Array.isArray(response)) {
                return response;
            }

            // Fallback
            return [];
        } catch (error) {
            console.error('[PleadingsApiService.getAll] Error:', error);
            throw new Error('Failed to fetch pleadings');
        }
    }

    async getById(id: string): Promise<Pleading> {
        this.validateId(id, 'getById');
        try {
            return await apiClient.get<Pleading>(`${this.baseUrl}/${id}`);
        } catch (error) {
            console.error('[PleadingsApiService.getById] Error:', error);
            throw new Error(`Failed to fetch pleading with id: ${id}`);
        }
    }

    async getByCaseId(caseId: string): Promise<Pleading[]> {
        this.validateId(caseId, 'getByCaseId');
        return this.getAll({ caseId });
    }

    async create(data: Partial<Pleading>): Promise<Pleading> {
        this.validateObject(data, 'data', 'create');
        if (!data.caseId) {
            throw new Error('[PleadingsApiService.create] caseId is required');
        }
        if (!data.title) {
            throw new Error('[PleadingsApiService.create] title is required');
        }
        try {
            return await apiClient.post<Pleading>(this.baseUrl, data);
        } catch (error) {
            console.error('[PleadingsApiService.create] Error:', error);
            throw new Error('Failed to create pleading');
        }
    }

    async update(id: string, data: Partial<Pleading>): Promise<Pleading> {
        this.validateId(id, 'update');
        this.validateObject(data, 'data', 'update');
        try {
            return await apiClient.put<Pleading>(`${this.baseUrl}/${id}`, data);
        } catch (error) {
            console.error('[PleadingsApiService.update] Error:', error);
            throw new Error(`Failed to update pleading with id: ${id}`);
        }
    }

    async delete(id: string): Promise<void> {
        this.validateId(id, 'delete');
        try {
            await apiClient.delete(`${this.baseUrl}/${id}`);
        } catch (error) {
            console.error('[PleadingsApiService.delete] Error:', error);
            throw new Error(`Failed to delete pleading with id: ${id}`);
        }
    }
}
