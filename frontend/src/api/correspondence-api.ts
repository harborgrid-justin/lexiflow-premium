/**
 * Correspondence API Service
 * Enterprise-grade API service for legal correspondence tracking and management
 * 
 * @module CorrespondenceApiService
 * @description Manages all correspondence-related operations including:
 * - Legal correspondence CRUD operations
 * - Multi-type correspondence (letters, emails, memos, notices, demands, responses)
 * - Case and client linkage
 * - Document attachment management
 * - Status tracking (draft, sent, received, filed)
 * - Recipient and sender management
 * 
 * @security
 * - Input validation on all parameters
 * - Email format validation for recipients
 * - XSS prevention through type enforcement
 * - Backend API authentication via bearer tokens
 * - Proper access control for case/client-linked correspondence
 * 
 * @architecture
 * - Backend API primary (PostgreSQL)
 * - React Query integration via CORRESPONDENCE_QUERY_KEYS
 * - Type-safe operations
 * - Comprehensive error handling
 * - Document integration for attachments
 */

import { apiClient } from '@services/infrastructure/apiClient';

export interface Correspondence {
  id: string;
  caseId?: string;
  clientId?: string;
  correspondenceType: 'letter' | 'email' | 'memo' | 'notice' | 'demand' | 'response';
  subject: string;
  sender?: string;
  recipients?: string[];
  date: string;
  documentId?: string;
  status: 'draft' | 'sent' | 'received' | 'filed';
  notes?: string;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CorrespondenceFilters {
  caseId?: string;
  clientId?: string;
  correspondenceType?: Correspondence['correspondenceType'];
  status?: Correspondence['status'];
  search?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Query keys for React Query integration
 * 
 * @example
 * queryClient.invalidateQueries({ queryKey: CORRESPONDENCE_QUERY_KEYS.all() });
 * queryClient.invalidateQueries({ queryKey: CORRESPONDENCE_QUERY_KEYS.byCase(caseId) });
 */
export const CORRESPONDENCE_QUERY_KEYS = {
    all: () => ['correspondence'] as const,
    byId: (id: string) => ['correspondence', id] as const,
    byCase: (caseId: string) => ['correspondence', 'case', caseId] as const,
    byClient: (clientId: string) => ['correspondence', 'client', clientId] as const,
    byType: (type: string) => ['correspondence', 'type', type] as const,
    byStatus: (status: string) => ['correspondence', 'status', status] as const,
} as const;

/**
 * Correspondence API Service Class
 * Implements secure, type-safe correspondence management operations
 */
export class CorrespondenceApiService {
  private readonly baseUrl = '/correspondence';

  constructor() {
    this.logInitialization();
  }

  /**
   * Log service initialization
   * @private
   */
  private logInitialization(): void {
    console.log('[CorrespondenceApiService] Initialized with Backend API (PostgreSQL)');
  }

  /**
   * Validate and sanitize ID parameter
   * @private
   */
  private validateId(id: string, methodName: string): void {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new Error(`[CorrespondenceApiService.${methodName}] Invalid id parameter`);
    }
  }

  /**
   * Validate and sanitize object parameter
   * @private
   */
  private validateObject(obj: unknown, paramName: string, methodName: string): void {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
      throw new Error(`[CorrespondenceApiService.${methodName}] Invalid ${paramName} parameter`);
    }
  }

  /**
   * Validate email format
   * @private
   */
  private validateEmail(email: string, methodName: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      throw new Error(`[CorrespondenceApiService.${methodName}] Invalid email format`);
    }
  }

  // =============================================================================
  // CRUD OPERATIONS
  // =============================================================================

  /**
   * Get all correspondence with optional filters
   * 
   * @param filters - Optional filters for caseId, clientId, type, status, date range
   * @returns Promise<Correspondence[]> Array of correspondence items
   * @throws Error if fetch fails
   */
  async getAll(filters?: CorrespondenceFilters): Promise<Correspondence[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.caseId) params.append('caseId', filters.caseId);
      if (filters?.clientId) params.append('clientId', filters.clientId);
      if (filters?.correspondenceType) params.append('correspondenceType', filters.correspondenceType);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      const queryString = params.toString();
      const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
      return await apiClient.get<Correspondence[]>(url);
    } catch (error) {
      console.error('[CorrespondenceApiService.getAll] Error:', error);
      throw new Error('Failed to fetch correspondence');
    }
  }

  /**
   * Get correspondence by ID
   * 
   * @param id - Correspondence ID
   * @returns Promise<Correspondence> Correspondence data
   * @throws Error if id is invalid or fetch fails
   */
  async getById(id: string): Promise<Correspondence> {
    this.validateId(id, 'getById');
    try {
      return await apiClient.get<Correspondence>(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error('[CorrespondenceApiService.getById] Error:', error);
      throw new Error(`Failed to fetch correspondence with id: ${id}`);
    }
  }

  /**
   * Create new correspondence
   * 
   * @param data - Correspondence creation data
   * @returns Promise<Correspondence> Created correspondence
   * @throws Error if validation fails or creation fails
   */
  async create(data: Partial<Correspondence>): Promise<Correspondence> {
    this.validateObject(data, 'data', 'create');
    if (!data.subject) {
      throw new Error('[CorrespondenceApiService.create] subject is required');
    }
    if (!data.correspondenceType) {
      throw new Error('[CorrespondenceApiService.create] correspondenceType is required');
    }
    if (!data.date) {
      throw new Error('[CorrespondenceApiService.create] date is required');
    }
    // Validate email recipients if provided
    if (data.recipients && Array.isArray(data.recipients)) {
      data.recipients.forEach((email, index) => {
        try {
          this.validateEmail(email, 'create');
        } catch (error) {
          throw new Error(`[CorrespondenceApiService.create] Invalid email at recipients[${index}]: ${email}`);
        }
      });
    }
    try {
      return await apiClient.post<Correspondence>(this.baseUrl, data);
    } catch (error) {
      console.error('[CorrespondenceApiService.create] Error:', error);
      throw new Error('Failed to create correspondence');
    }
  }

  /**
   * Update existing correspondence
   * 
   * @param id - Correspondence ID
   * @param data - Correspondence update data
   * @returns Promise<Correspondence> Updated correspondence
   * @throws Error if validation fails or update fails
   */
  async update(id: string, data: Partial<Correspondence>): Promise<Correspondence> {
    this.validateId(id, 'update');
    this.validateObject(data, 'data', 'update');
    // Validate email recipients if provided
    if (data.recipients && Array.isArray(data.recipients)) {
      data.recipients.forEach((email, index) => {
        try {
          this.validateEmail(email, 'update');
        } catch (error) {
          throw new Error(`[CorrespondenceApiService.update] Invalid email at recipients[${index}]: ${email}`);
        }
      });
    }
    try {
      return await apiClient.put<Correspondence>(`${this.baseUrl}/${id}`, data);
    } catch (error) {
      console.error('[CorrespondenceApiService.update] Error:', error);
      throw new Error(`Failed to update correspondence with id: ${id}`);
    }
  }

  /**
   * Delete correspondence
   * 
   * @param id - Correspondence ID
   * @returns Promise<void>
   * @throws Error if id is invalid or delete fails
   */
  async delete(id: string): Promise<void> {
    this.validateId(id, 'delete');
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error('[CorrespondenceApiService.delete] Error:', error);
      throw new Error(`Failed to delete correspondence with id: ${id}`);
    }
  }

  // =============================================================================
  // CONVENIENCE METHODS
  // =============================================================================

  /**
   * Get correspondence by case
   * 
   * @param caseId - Case ID
   * @returns Promise<Correspondence[]> Array of correspondence for case
   * @throws Error if validation fails or fetch fails
   */
  async getByCase(caseId: string): Promise<Correspondence[]> {
    this.validateId(caseId, 'getByCase');
    return this.getAll({ caseId });
  }

  /**
   * Get correspondence by client
   * 
   * @param clientId - Client ID
   * @returns Promise<Correspondence[]> Array of correspondence for client
   * @throws Error if validation fails or fetch fails
   */
  async getByClient(clientId: string): Promise<Correspondence[]> {
    this.validateId(clientId, 'getByClient');
    return this.getAll({ clientId });
  }

  /**
   * Update correspondence status
   * 
   * @param id - Correspondence ID
   * @param status - New status
   * @returns Promise<Correspondence> Updated correspondence
   * @throws Error if validation fails or update fails
   */
  async updateStatus(id: string, status: Correspondence['status']): Promise<Correspondence> {
    this.validateId(id, 'updateStatus');
    if (!status) {
      throw new Error('[CorrespondenceApiService.updateStatus] status is required');
    }
    return this.update(id, { status });
  }
}
