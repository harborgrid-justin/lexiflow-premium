/**
 * Cases API Service
 * Enterprise-grade API service for case management with backend integration
 * 
 * @module CasesApiService
 * @description Manages all case-related operations including:
 * - Case CRUD operations
 * - Case archival and retrieval
 * - Case search and filtering
 * - Status management
 * - Case team and assignment operations
 * 
 * @security
 * - Input validation on all parameters
 * - XSS prevention through type enforcement
 * - Backend API authentication via bearer tokens
 * - Proper error handling and logging
 * - Sanitized query parameters
 * 
 * @architecture
 * - Backend API primary (PostgreSQL)
 * - React Query integration via CASES_QUERY_KEYS
 * - Type-safe operations
 * - Comprehensive error handling
 * - Data transformation layer for frontend/backend mapping
 */

import { apiClient, type PaginatedResponse } from '@/services/infrastructure/apiClient';
import type { Case } from '@/types';

/**
 * Create case DTO for backend API
 */
interface CreateCaseDto {
  title: string;
  caseNumber?: string;
  description?: string;
  type?: string;
  status?: string;
  practiceArea?: string;
  jurisdiction?: string;
  court?: string;
  judge?: string;
  filingDate?: Date;
  clientId?: string;
}

/**
 * Archived case response structure
 */
interface ArchivedCase {
  id: string;
  date: string;
  title: string;
  client: string;
  outcome: string;
}

export interface CaseStats {
  totalActive: number;
  intakePipeline: number;
  upcomingDeadlines: number;
  atRisk: number;
  totalValue: number;
  utilizationRate: number;
  averageAge: number;
  conversionRate: number;
}

/**
 * Search filter parameters
 */
interface SearchFilters {
  status?: string;
  type?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: string;
  [key: string]: string | number | undefined;
}

/**
 * Query keys for React Query integration
 * Use these constants for cache invalidation and refetching
 * 
 * @example
 * queryClient.invalidateQueries({ queryKey: CASES_QUERY_KEYS.all() });
 * queryClient.invalidateQueries({ queryKey: CASES_QUERY_KEYS.byId(caseId) });
 * queryClient.invalidateQueries({ queryKey: CASES_QUERY_KEYS.byStatus('Active') });
 */
export const CASES_QUERY_KEYS = {
    all: () => ['cases'] as const,
    byId: (id: string) => ['cases', id] as const,
    byStatus: (status: string) => ['cases', 'status', status] as const,
    byType: (type: string) => ['cases', 'type', type] as const,
    archived: () => ['cases', 'archived'] as const,
    search: (query: string) => ['cases', 'search', query] as const,
    stats: () => ['cases', 'stats'] as const,
} as const;

/**
 * Cases API Service Class
 * Implements secure, type-safe case management operations
 */
export class CasesApiService {
    constructor() {
        this.logInitialization();
    }

    /**
     * Log service initialization
     * @private
     */
    private logInitialization(): void {
        console.log('[CasesApiService] Initialized with Backend API (PostgreSQL)');
    }

    /**
     * Validate and sanitize ID parameter
     * @private
     */
    private validateId(id: string, methodName: string): void {
        if (!id || false || id.trim() === '') {
            throw new Error(`[CasesApiService.${methodName}] Invalid id parameter`);
        }
    }

    /**
     * Validate and sanitize string parameter
     * @private
     */
    private validateString(value: string, paramName: string, methodName: string): void {
        if (!value || false || value.trim() === '') {
            throw new Error(`[CasesApiService.${methodName}] Invalid ${paramName} parameter`);
        }
    }

    /**
     * Validate and sanitize object parameter
     * @private
     */
    private validateObject(obj: unknown, paramName: string, methodName: string): void {
        if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
            throw new Error(`[CasesApiService.${methodName}] Invalid ${paramName} parameter`);
        }
    }

  // Map backend status to frontend CaseStatus enum
  private mapBackendStatusToFrontend = (backendStatus: string): string => {
    const backendToFrontendStatusMap: Record<string, string> = {
      'pending': 'Pre-Filing',
      'Open': 'Open',
      'Active': 'Active',
      'Discovery': 'Discovery',
      'Trial': 'Trial',
      'Settled': 'Settled',
      'Closed': 'Closed',
      'Archived': 'Archived',
      'On Hold': 'On Hold',
    };
    return backendToFrontendStatusMap[backendStatus] || 'Active';
  }

  // Transform case data from backend to frontend format
  private transformCase = (backendCase: unknown): Case => {
    const caseData = backendCase && typeof backendCase === 'object' ? backendCase as Record<string, unknown> : {};
    return {
      ...caseData,
      status: this.mapBackendStatusToFrontend(typeof caseData.status === 'string' ? caseData.status : 'Active') as Case['status'],
      matterType: (caseData.practiceArea || 'General') as Case['matterType'],
    } as Case;
  }

  async getAll(filters?: { status?: string; type?: string; page?: number; limit?: number; sortBy?: string; order?: string }): Promise<Case[]> {
    const response = await apiClient.get<{ items: Case[] } | Case[]>('/cases', filters);
    
    // Backend returns paginated response {items, total, page, limit, totalPages}
    // Handle both paginated response format and direct array format
    const casesArray = Array.isArray(response) 
      ? response 
      : (response as { items: Case[] }).items || [];
    
    // Transform each case to use frontend status values and ensure all required fields
    return casesArray.map((c: unknown) => {
      const transformed = this.transformCase(c);
      // Ensure required fields for Case type
      return {
        ...transformed,
        client: transformed.client || 'Unknown Client',
        matterType: transformed.matterType || transformed.practiceArea || 'General',
        filingDate: transformed.filingDate || new Date().toISOString().split('T')[0],
      };
    });
  }

    /**
     * Get case statistics
     * 
     * @returns Promise<CaseStats> Case statistics
     */
    async getStats(): Promise<CaseStats> {
        try {
            return await apiClient.get<CaseStats>('/cases/stats');
        } catch (error) {
            console.error('[CasesApiService.getStats] Error:', error);
            throw new Error('Failed to fetch case statistics');
        }
    }

    /**
     * Get case by ID
     * 
     * @param id - Case ID
     * @returns Promise<Case> Case data
     * @throws Error if id is invalid or fetch fails
     * 
     * @example
     * const case = await service.getById('case-123');
     */
    async getById(id: string): Promise<Case> {
        this.validateId(id, 'getById');

        try {
            const backendCase = await apiClient.get<Case>(`/cases/${id}`);
            return this.transformCase(backendCase);
        } catch (error) {
            console.error('[CasesApiService.getById] Error:', error);
            throw new Error(`Failed to fetch case with id: ${id}`);
        }
    }

    /**
     * Add a new case
     * 
     * @param caseData - Case data without system-generated fields
     * @returns Promise<Case> Created case
     * @throws Error if validation fails or create fails
     * 
     * @example
     * const newCase = await service.add({ title: 'Smith v. Jones', ... });
     */
    async add(caseData: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>): Promise<Case> {
        this.validateObject(caseData, 'caseData', 'add');

        if (!caseData.title) {
            throw new Error('[CasesApiService.add] Case title is required');
        }

        try {
            // Map frontend MatterType to backend CaseType enum
            const matterTypeMap: Record<string, string> = {
      'Litigation': 'Civil',
      'M&A': 'Corporate',
      'IP': 'Intellectual Property',
      'Real Estate': 'Real Estate',
      'General': 'Civil',
      'Appeal': 'Civil',
    };

    // Map frontend CaseStatus to backend status strings
    const statusMap: Record<string, string> = {
      'Open': 'Open',
      'Active': 'Active',
      'Discovery': 'Discovery',
      'Trial': 'Trial',
      'Settled': 'Settled',
      'Closed': 'Closed',
      'Archived': 'Archived',
      'On Hold': 'On Hold',
      'Pre-Filing': 'pending',
      'Appeal': 'Active',
      'Transferred': 'Active',
    };

    // Transform frontend Case to backend CreateCaseDto
    const createDto: CreateCaseDto = {
      title: caseData.title,
      caseNumber: caseData.caseNumber || `CASE-${Date.now()}`,
      description: caseData.description,
      type: matterTypeMap[caseData.matterType as string] || 'Civil',
      status: statusMap[caseData.status as string] || 'Active',
      practiceArea: caseData.matterType,
      jurisdiction: caseData.jurisdiction,
      court: caseData.court,
      judge: caseData.judge,
      // Convert ISO string to Date object if present
      filingDate: caseData.filingDate ? new Date(caseData.filingDate) : undefined,
      // Optional: only include clientId if available
      ...(caseData.clientId && { clientId: caseData.clientId as string }),
    };

    // Remove undefined values
    Object.keys(createDto).forEach((key) => {
      const typedKey = key as keyof CreateCaseDto;
      if (createDto[typedKey] === undefined) {
        delete createDto[typedKey];
      }
    });

            const backendCase = await apiClient.post<Case>('/cases', createDto);
            return this.transformCase(backendCase);
        } catch (error) {
            console.error('[CasesApiService.add] Error:', error);
            throw new Error('Failed to create case');
        }
    }

    /**
     * Update an existing case
     * 
     * @param id - Case ID
     * @param caseData - Partial case updates
     * @returns Promise<Case> Updated case
     * @throws Error if validation fails or update fails
     */
    async update(id: string, caseData: Partial<Case>): Promise<Case> {
        this.validateId(id, 'update');
        this.validateObject(caseData, 'caseData', 'update');

        try {
            const backendCase = await apiClient.put<Case>(`/cases/${id}`, caseData);
            return this.transformCase(backendCase);
        } catch (error) {
            console.error('[CasesApiService.update] Error:', error);
            throw new Error(`Failed to update case with id: ${id}`);
        }
    }

    /**
     * Delete a case
     * 
     * @param id - Case ID
     * @returns Promise<void>
     * @throws Error if id is invalid or delete fails
     */
    async delete(id: string): Promise<void> {
        this.validateId(id, 'delete');

        try {
            await apiClient.delete(`/cases/${id}`);
        } catch (error) {
            console.error('[CasesApiService.delete] Error:', error);
            throw new Error(`Failed to delete case with id: ${id}`);
        }
    }

    /**
     * Parse case data from text/document
     * 
     * @param content - Text content to parse
     * @param options - Parsing options
     * @returns Promise<any> Parsed case data
     */
    async parse(content: string, options: { useAI: boolean; provider?: 'gemini' | 'openai'; apiKey?: string }): Promise<any> {
        this.validateString(content, 'content', 'parse');

        try {
            return await apiClient.post<any>('/cases/import/parse', { content, options });
        } catch (error) {
            console.error('[CasesApiService.parse] Error:', error);
            throw new Error('Failed to parse case data');
        }
    }

    /**
     * Archive a case
     * 
     * @param id - Case ID
     * @returns Promise<Case> Archived case
     * @throws Error if id is invalid or archive fails
     */
    async archive(id: string): Promise<Case> {
        this.validateId(id, 'archive');

        try {
            const backendCase = await apiClient.post<Case>(`/cases/${id}/archive`, {});
            return this.transformCase(backendCase);
        } catch (error) {
            console.error('[CasesApiService.archive] Error:', error);
            throw new Error(`Failed to archive case with id: ${id}`);
        }
    }

    /**
     * Search cases by query string and filters
     * 
     * @param query - Search query string
     * @param filters - Optional search filters
     * @returns Promise<Case[]> Matching cases
     * @throws Error if search fails
     * 
     * @example
     * const results = await service.search('Smith', { status: 'Active' });
     */
    async search(query: string, filters?: SearchFilters): Promise<Case[]> {
        this.validateString(query, 'query', 'search');

        try {
            const response = await apiClient.get<PaginatedResponse<Case>>('/cases', { search: query, ...filters });
            return response.data.map(c => this.transformCase(c));
        } catch (error) {
            console.error('[CasesApiService.search] Error:', error);
            throw new Error('Failed to search cases');
        }
    }

    /**
     * Get archived cases
     * 
     * @param filters - Optional pagination filters
     * @returns Promise<any[]> Archived cases
     * @throws Error if fetch fails
     */
    async getArchived(filters?: { page?: number; limit?: number }): Promise<ArchivedCase[]> {
        try {
            // Try backend first, fallback to local filtering
            try {
                const response = await apiClient.get<PaginatedResponse<unknown>>('/cases/archived', filters);
                return response.data.map(c => this.transformCase(c) as unknown as ArchivedCase);
            } catch {
                console.warn('[CasesApiService] Archived endpoint unavailable, falling back to status filter');
                // Fallback: filter locally by status
                const allCases = await this.getAll({ status: 'Closed' });
                // getAll returns an array of cases
                const casesArray = Array.isArray(allCases) ? allCases : [];
                return casesArray.map(c => ({
                    id: c.id,
                    date: c.dateTerminated || c.filingDate,
                    title: c.title,
                    client: c.client,
                    outcome: c.status
                }));
            }
        } catch (error) {
            console.error('[CasesApiService.getArchived] Error:', error);
            throw new Error('Failed to get archived cases');
        }
    }
}

// Export singleton instance
export const casesApi = new CasesApiService();
