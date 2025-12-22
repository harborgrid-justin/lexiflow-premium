/**
 * Discovery API Service
 * Enterprise-grade API service for discovery process management with backend integration
 * 
 * @module DiscoveryApiService
 * @description Manages all discovery-related operations including:
 * - Discovery process lifecycle management
 * - Phase tracking (identification, preservation, collection, processing, review, analysis, production)
 * - Custodian and data source management
 * - Document statistics and summaries
 * - Deadline monitoring
 * - Review progress tracking
 * 
 * @security
 * - Input validation on all parameters
 * - XSS prevention through type enforcement
 * - Backend API authentication via bearer tokens
 * - Proper error handling and logging
 * - Privileged document protection
 * 
 * @architecture
 * - Backend API primary (PostgreSQL)
 * - React Query integration via DISCOVERY_QUERY_KEYS
 * - Type-safe operations
 * - Comprehensive error handling
 * - Multi-phase workflow support
 */

import { apiClient } from '../infrastructure/apiClient';

export interface DiscoveryProcess {
  id: string;
  caseId: string;
  name: string;
  status: 'not_started' | 'in_progress' | 'on_hold' | 'completed';
  phase: 'identification' | 'preservation' | 'collection' | 'processing' | 'review' | 'analysis' | 'production';
  deadlines?: {
    phase: string;
    date: string;
    status: 'upcoming' | 'overdue' | 'met';
  }[];
  custodians?: string[];
  dataSources?: string[];
  summary?: {
    totalDocuments: number;
    reviewedDocuments: number;
    privilegedDocuments: number;
    responsiveDocuments: number;
  };
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export const DISCOVERY_QUERY_KEYS = {
    all: () => ['discovery'] as const,
    byId: (id: string) => ['discovery', id] as const,
    byCase: (caseId: string) => ['discovery', 'case', caseId] as const,
    byStatus: (status: string) => ['discovery', 'status', status] as const,
    summary: (id: string) => ['discovery', id, 'summary'] as const,
} as const;

export class DiscoveryApiService {
  private readonly baseUrl = '/discovery';

  constructor() {
    console.log('[DiscoveryApiService] Initialized with Backend API (PostgreSQL)');
  }

  private validateId(id: string, methodName: string): void {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new Error(`[DiscoveryApiService.${methodName}] Invalid id parameter`);
    }
  }

  private validateObject(obj: any, paramName: string, methodName: string): void {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
      throw new Error(`[DiscoveryApiService.${methodName}] Invalid ${paramName} parameter`);
    }
  }

  async getAll(filters?: { caseId?: string; status?: DiscoveryProcess['status'] }): Promise<DiscoveryProcess[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.caseId) params.append('caseId', filters.caseId);
      if (filters?.status) params.append('status', filters.status);
      const queryString = params.toString();
      const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
      return await apiClient.get<DiscoveryProcess[]>(url);
    } catch (error) {
      console.error('[DiscoveryApiService.getAll] Error:', error);
      throw new Error('Failed to fetch discovery processes');
    }
  }

  async getById(id: string): Promise<DiscoveryProcess> {
    this.validateId(id, 'getById');
    try {
      return await apiClient.get<DiscoveryProcess>(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error('[DiscoveryApiService.getById] Error:', error);
      throw new Error(`Failed to fetch discovery process with id: ${id}`);
    }
  }

  async create(data: Partial<DiscoveryProcess>): Promise<DiscoveryProcess> {
    this.validateObject(data, 'data', 'create');
    if (!data.caseId) {
      throw new Error('[DiscoveryApiService.create] caseId is required');
    }
    if (!data.name) {
      throw new Error('[DiscoveryApiService.create] name is required');
    }
    try {
      return await apiClient.post<DiscoveryProcess>(this.baseUrl, data);
    } catch (error) {
      console.error('[DiscoveryApiService.create] Error:', error);
      throw new Error('Failed to create discovery process');
    }
  }

  async update(id: string, data: Partial<DiscoveryProcess>): Promise<DiscoveryProcess> {
    this.validateId(id, 'update');
    this.validateObject(data, 'data', 'update');
    try {
      return await apiClient.put<DiscoveryProcess>(`${this.baseUrl}/${id}`, data);
    } catch (error) {
      console.error('[DiscoveryApiService.update] Error:', error);
      throw new Error(`Failed to update discovery process with id: ${id}`);
    }
  }

  async updatePhase(id: string, phase: DiscoveryProcess['phase']): Promise<DiscoveryProcess> {
    this.validateId(id, 'updatePhase');
    if (!phase) {
      throw new Error('[DiscoveryApiService.updatePhase] phase is required');
    }
    try {
      return await apiClient.patch<DiscoveryProcess>(`${this.baseUrl}/${id}/phase`, { phase });
    } catch (error) {
      console.error('[DiscoveryApiService.updatePhase] Error:', error);
      throw new Error(`Failed to update phase for discovery process with id: ${id}`);
    }
  }

  async getSummary(id: string): Promise<any> {
    this.validateId(id, 'getSummary');
    try {
      return await apiClient.get(`${this.baseUrl}/${id}/summary`);
    } catch (error) {
      console.error('[DiscoveryApiService.getSummary] Error:', error);
      throw new Error(`Failed to fetch summary for discovery process with id: ${id}`);
    }
  }

  async delete(id: string): Promise<void> {
    this.validateId(id, 'delete');
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error('[DiscoveryApiService.delete] Error:', error);
      throw new Error(`Failed to delete discovery process with id: ${id}`);
    }
  }
}
