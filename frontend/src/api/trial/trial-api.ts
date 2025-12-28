/**
 * Trial API Service
 * Enterprise-grade API service for trial management with backend integration
 * 
 * @module TrialApiService
 * @description Manages all trial-related operations including:
 * - Trial CRUD operations (jury, bench, arbitration, administrative)
 * - Trial status tracking and lifecycle management
 * - Trial events and witness preparation scheduling
 * - Jury management
 * - Courtroom and venue tracking
 * - Phase management (jury selection, opening statements, testimony, closing arguments, deliberation)
 * 
 * @security
 * - Input validation on all parameters
 * - XSS prevention through type enforcement
 * - Backend API authentication via bearer tokens
 * - Proper error handling and logging
 * - Secure trial data management
 * 
 * @architecture
 * - Backend API primary (PostgreSQL)
 * - React Query integration via TRIAL_QUERY_KEYS
 * - Type-safe operations
 * - Comprehensive error handling
 * - Multi-phase trial workflow support
 */

import { apiClient } from '@/services/infrastructure/apiClient';

export interface Trial {
  id: string;
  caseId: string;
  trialType: 'jury' | 'bench' | 'arbitration' | 'administrative';
  status: 'scheduled' | 'in_progress' | 'completed' | 'postponed' | 'settled';
  startDate?: string;
  endDate?: string;
  estimatedDuration?: number; // in days
  judge?: string;
  courtroom?: string;
  venue?: string;
  jury?: {
    size: number;
    alternates: number;
    selectedJurors?: string[];
  };
  phases?: {
    name: string;
    status: 'pending' | 'active' | 'completed';
    startDate?: string;
    endDate?: string;
  }[];
  notes?: string;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface TrialFilters {
  caseId?: string;
  status?: Trial['status'];
  trialType?: Trial['trialType'];
}

/**
 * Query keys for React Query integration
 * 
 * @example
 * queryClient.invalidateQueries({ queryKey: TRIAL_QUERY_KEYS.all() });
 * queryClient.invalidateQueries({ queryKey: TRIAL_QUERY_KEYS.byCase(caseId) });
 */
export const TRIAL_QUERY_KEYS = {
    all: () => ['trial'] as const,
    byId: (id: string) => ['trial', id] as const,
    byCase: (caseId: string) => ['trial', 'case', caseId] as const,
    byStatus: (status: string) => ['trial', 'status', status] as const,
    events: {
        all: () => ['trial', 'events'] as const,
        byTrial: (trialId: string) => ['trial', 'events', 'trial', trialId] as const,
    },
    witnessPrep: {
        all: () => ['trial', 'witness-prep'] as const,
        byTrial: (trialId: string) => ['trial', 'witness-prep', 'trial', trialId] as const,
    },
} as const;

/**
 * Trial API Service Class
 * Implements secure, type-safe trial management operations
 */
export class TrialApiService {
  private readonly baseUrl = '/trial';

  constructor() {
    this.logInitialization();
  }

  /**
   * Log service initialization
   * @private
   */
  private logInitialization(): void {
    console.log('[TrialApiService] Initialized with Backend API (PostgreSQL)');
  }

  /**
   * Validate and sanitize ID parameter
   * @private
   */
  private validateId(id: string, methodName: string): void {
    if (!id || false || id.trim() === '') {
      throw new Error(`[TrialApiService.${methodName}] Invalid id parameter`);
    }
  }

  /**
   * Validate and sanitize object parameter
   * @private
   */
  private validateObject(obj: unknown, paramName: string, methodName: string): void {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
      throw new Error(`[TrialApiService.${methodName}] Invalid ${paramName} parameter`);
    }
  }

  // =============================================================================
  // TRIAL CRUD OPERATIONS
  // =============================================================================

  /**
   * Get all trials with optional filters
   * 
   * @param filters - Optional filters for caseId, status, and trialType
   * @returns Promise<Trial[]> Array of trials
   * @throws Error if fetch fails
   */
  async getAll(filters?: TrialFilters): Promise<Trial[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.caseId) params.append('caseId', filters.caseId);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.trialType) params.append('trialType', filters.trialType);
      const queryString = params.toString();
      const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
      return await apiClient.get<Trial[]>(url);
    } catch (error) {
      console.error('[TrialApiService.getAll] Error:', error);
      throw new Error('Failed to fetch trials');
    }
  }

  /**
   * Get trial by ID
   * 
   * @param id - Trial ID
   * @returns Promise<Trial> Trial data
   * @throws Error if id is invalid or fetch fails
   */
  async getById(id: string): Promise<Trial> {
    this.validateId(id, 'getById');
    try {
      return await apiClient.get<Trial>(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error('[TrialApiService.getById] Error:', error);
      throw new Error(`Failed to fetch trial with id: ${id}`);
    }
  }

  /**
   * Get trials by case ID
   * 
   * @param caseId - Case ID
   * @returns Promise<Trial[]> Array of trials for the case
   * @throws Error if caseId is invalid or fetch fails
   */
  async getByCaseId(caseId: string): Promise<Trial[]> {
    this.validateId(caseId, 'getByCaseId');
    return this.getAll({ caseId });
  }

  /**
   * Create a new trial
   * 
   * @param data - Trial data
   * @returns Promise<Trial> Created trial
   * @throws Error if validation fails or create fails
   */
  async create(data: Partial<Trial>): Promise<Trial> {
    this.validateObject(data, 'data', 'create');
    if (!data.caseId) {
      throw new Error('[TrialApiService.create] caseId is required');
    }
    try {
      return await apiClient.post<Trial>(this.baseUrl, data);
    } catch (error) {
      console.error('[TrialApiService.create] Error:', error);
      throw new Error('Failed to create trial');
    }
  }

  /**
   * Update an existing trial
   * 
   * @param id - Trial ID
   * @param data - Partial trial updates
   * @returns Promise<Trial> Updated trial
   * @throws Error if validation fails or update fails
   */
  async update(id: string, data: Partial<Trial>): Promise<Trial> {
    this.validateId(id, 'update');
    this.validateObject(data, 'data', 'update');
    try {
      return await apiClient.put<Trial>(`${this.baseUrl}/${id}`, data);
    } catch (error) {
      console.error('[TrialApiService.update] Error:', error);
      throw new Error(`Failed to update trial with id: ${id}`);
    }
  }

  /**
   * Update trial status
   * 
   * @param id - Trial ID
   * @param status - New trial status
   * @returns Promise<Trial> Updated trial
   * @throws Error if validation fails or update fails
   */
  async updateStatus(id: string, status: Trial['status']): Promise<Trial> {
    this.validateId(id, 'updateStatus');
    if (!status) {
      throw new Error('[TrialApiService.updateStatus] status is required');
    }
    try {
      return await apiClient.patch<Trial>(`${this.baseUrl}/${id}/status`, { status });
    } catch (error) {
      console.error('[TrialApiService.updateStatus] Error:', error);
      throw new Error(`Failed to update status for trial with id: ${id}`);
    }
  }

  /**
   * Delete a trial
   * 
   * @param id - Trial ID
   * @returns Promise<void>
   * @throws Error if id is invalid or delete fails
   */
  async delete(id: string): Promise<void> {
    this.validateId(id, 'delete');
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error('[TrialApiService.delete] Error:', error);
      throw new Error(`Failed to delete trial with id: ${id}`);
    }
  }

  // =============================================================================
  // TRIAL EVENTS MANAGEMENT
  // =============================================================================

  /**
   * Get trial events with optional filters
   * 
   * @param filters - Optional filters for caseId and trialId
   * @returns Promise<any[]> Array of trial events
   * @throws Error if fetch fails
   */
  async getEvents(filters?: { caseId?: string; trialId?: string }): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.caseId) params.append('caseId', filters.caseId);
      if (filters?.trialId) params.append('trialId', filters.trialId);
      const queryString = params.toString();
      const url = queryString ? `${this.baseUrl}/events?${queryString}` : `${this.baseUrl}/events`;
      return await apiClient.get<any[]>(url);
    } catch (error) {
      console.error('[TrialApiService.getEvents] Error:', error);
      throw new Error('Failed to fetch trial events');
    }
  }

  /**
   * Create a trial event
   * 
   * @param data - Event data with trialId, eventType, scheduledAt, etc.
   * @returns Promise<unknown> Created event
   * @throws Error if validation fails or create fails
   */
  async createEvent(data: {
    trialId: string;
    eventType: string;
    scheduledAt: string;
    duration?: number;
    description?: string;
  }): Promise<unknown> {
    this.validateObject(data, 'data', 'createEvent');
    if (!data.trialId) {
      throw new Error('[TrialApiService.createEvent] trialId is required');
    }
    if (!data.eventType) {
      throw new Error('[TrialApiService.createEvent] eventType is required');
    }
    try {
      return await apiClient.post<unknown>(`${this.baseUrl}/events`, data);
    } catch (error) {
      console.error('[TrialApiService.createEvent] Error:', error);
      throw new Error('Failed to create trial event');
    }
  }

  /**
   * Update a trial event
   * 
   * @param id - Event ID
   * @param data - Partial event updates
   * @returns Promise<unknown> Updated event
   * @throws Error if validation fails or update fails
   */
  async updateEvent(id: string, data: Partial<{
    eventType: string;
    scheduledAt: string;
    duration?: number;
    description?: string;
  }>): Promise<unknown> {
    this.validateId(id, 'updateEvent');
    this.validateObject(data, 'data', 'updateEvent');
    try {
      return await apiClient.put<unknown>(`${this.baseUrl}/events/${id}`, data);
    } catch (error) {
      console.error('[TrialApiService.updateEvent] Error:', error);
      throw new Error(`Failed to update trial event with id: ${id}`);
    }
  }

  /**
   * Delete a trial event
   * 
   * @param id - Event ID
   * @returns Promise<void>
   * @throws Error if id is invalid or delete fails
   */
  async deleteEvent(id: string): Promise<void> {
    this.validateId(id, 'deleteEvent');
    try {
      await apiClient.delete(`${this.baseUrl}/events/${id}`);
    } catch (error) {
      console.error('[TrialApiService.deleteEvent] Error:', error);
      throw new Error(`Failed to delete trial event with id: ${id}`);
    }
  }

  // =============================================================================
  // WITNESS PREPARATION MANAGEMENT
  // =============================================================================

  /**
   * Get witness preparation records with optional filters
   * 
   * @param filters - Optional filters for trialId and witnessId
   * @returns Promise<any[]> Array of witness prep records
   * @throws Error if fetch fails
   */
  async getWitnessPrep(filters?: { trialId?: string; witnessId?: string }): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.trialId) params.append('trialId', filters.trialId);
      if (filters?.witnessId) params.append('witnessId', filters.witnessId);
      const queryString = params.toString();
      const url = queryString ? `${this.baseUrl}/witness-prep?${queryString}` : `${this.baseUrl}/witness-prep`;
      return await apiClient.get<any[]>(url);
    } catch (error) {
      console.error('[TrialApiService.getWitnessPrep] Error:', error);
      throw new Error('Failed to fetch witness preparation records');
    }
  }

  /**
   * Create a witness preparation record
   * 
   * @param data - Witness prep data with trialId, witnessId, prepDate, etc.
   * @returns Promise<unknown> Created witness prep record
   * @throws Error if validation fails or create fails
   */
  async createWitnessPrep(data: {
    trialId: string;
    witnessId: string;
    prepDate: string;
    duration?: number;
    topics?: string[];
    notes?: string;
  }): Promise<unknown> {
    this.validateObject(data, 'data', 'createWitnessPrep');
    if (!data.trialId) {
      throw new Error('[TrialApiService.createWitnessPrep] trialId is required');
    }
    if (!data.witnessId) {
      throw new Error('[TrialApiService.createWitnessPrep] witnessId is required');
    }
    try {
      return await apiClient.post<unknown>(`${this.baseUrl}/witness-prep`, data);
    } catch (error) {
      console.error('[TrialApiService.createWitnessPrep] Error:', error);
      throw new Error('Failed to create witness preparation record');
    }
  }
}
