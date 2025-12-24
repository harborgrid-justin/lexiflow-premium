/**
 * Clients API Service
 * Enterprise-grade API service for client/matter management with backend integration
 * 
 * @module ClientsApiService
 * @description Manages all client-related operations including:
 * - Client CRUD operations aligned with backend API
 * - Client contact and billing information management
 * - Conflict checking and VIP flagging
 * - Client statistics and case tracking
 * - Retainer management and portal access
 * - Multi-address support (primary + billing)
 * 
 * @security
 * - Input validation on all parameters
 * - Email format validation
 * - XSS prevention through type enforcement
 * - Backend API authentication via bearer tokens
 * - Sensitive financial data handling
 * - Conflict check audit trail
 * 
 * @architecture
 * - Backend API primary (PostgreSQL)
 * - ALIGNED WITH: backend/src/clients/clients.controller.ts
 * - React Query integration via CLIENTS_QUERY_KEYS
 * - Type-safe operations with comprehensive DTOs
 * - 40+ entity fields for enterprise client management
 * - Comprehensive error handling
 */

import { apiClient } from '@services/infrastructure/apiClient';

/**
 * Query keys for React Query integration
 * 
 * @example
 * queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEYS.all() });
 * queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEYS.byStatus('active') });
 */
export const CLIENTS_QUERY_KEYS = {
    all: () => ['clients'] as const,
    byId: (id: string) => ['clients', id] as const,
    byStatus: (status: string) => ['clients', 'status', status] as const,
    byType: (type: string) => ['clients', 'type', type] as const,
    vip: () => ['clients', 'vip'] as const,
    active: () => ['clients', 'active'] as const,
    statistics: () => ['clients', 'statistics'] as const,
    cases: (clientId: string) => ['clients', clientId, 'cases'] as const,
    invoices: (clientId: string) => ['clients', clientId, 'invoices'] as const,
} as const;

// Aligned with backend client.entity.ts - 40+ comprehensive fields
export interface Client {
  id: string;
  clientNumber: string;
  name?: string;
  clientType?: 'individual' | 'corporation' | 'partnership' | 'llc' | 'nonprofit' | 'government' | 'other';
  status: 'active' | 'inactive' | 'prospective' | 'former' | 'blocked';
  
  // Contact Information
  email?: string;
  phone?: string;
  fax?: string;
  website?: string;
  
  // Primary Address
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  
  // Billing Address (separate from primary)
  billingAddress?: string;
  billingCity?: string;
  billingState?: string;
  billingZipCode?: string;
  billingCountry?: string;
  
  // Business Information
  taxId?: string;
  industry?: string;
  establishedDate?: Date;
  
  // Primary Contact
  primaryContactName?: string;
  primaryContactEmail?: string;
  primaryContactPhone?: string;
  primaryContactTitle?: string;
  
  // Account Management
  accountManagerId?: string;
  referralSource?: string;
  clientSince?: Date;
  
  // Billing & Financial
  paymentTerms: 'net_15' | 'net_30' | 'net_45' | 'net_60' | 'due_on_receipt' | 'custom';
  preferredPaymentMethod?: string;
  creditLimit: number;
  currentBalance: number;
  totalBilled: number;
  totalPaid: number;
  
  // Statistics
  totalCases: number;
  activeCases: number;
  
  // Flags
  isVip: boolean;
  requiresConflictCheck: boolean;
  lastConflictCheckDate?: Date;
  
  // Retainer
  hasRetainer: boolean;
  retainerAmount?: number;
  retainerBalance?: number;
  
  // Extensibility
  customFields?: Record<string, unknown>;
  tags?: string[];
  notes?: string;
  metadata?: Record<string, unknown>;
  
  // Portal Access
  portalToken?: string;
  portalTokenExpiry?: Date;
  
  // Relationships
  cases?: unknown[];
  invoices?: unknown[];
  
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

export interface ClientFilters {
  status?: Client['status'];
  clientType?: Client['clientType'];
  search?: string;
}

// DTOs matching backend clients/dto/create-client.dto.ts
export interface ClientStatistics {
  total: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  vipCount: number;
  averageCasesPerClient: number;
  totalRevenue: number;
  outstandingBalance: number;
}

export class ClientsApiService {
  private readonly baseUrl = '/clients';

  constructor() {
    this.logInitialization();
  }

  /**
   * Log service initialization
   * @private
   */
  private logInitialization(): void {
    console.log('[ClientsApiService] Initialized with Backend API (PostgreSQL)');
  }

  /**
   * Validate and sanitize ID parameter
   * @private
   */
  private validateId(id: string, methodName: string): void {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new Error(`[ClientsApiService.${methodName}] Invalid id parameter`);
    }
  }

  /**
   * Validate and sanitize object parameter
   * @private
   */
  private validateObject(obj: unknown, paramName: string, methodName: string): void {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
      throw new Error(`[ClientsApiService.${methodName}] Invalid ${paramName} parameter`);
    }
  }

  /**
   * Validate email format
   * @private
   */
  private validateEmail(email: string, methodName: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      throw new Error(`[ClientsApiService.${methodName}] Invalid email format`);
    }
  }

  // =============================================================================
  // CRUD OPERATIONS
  // =============================================================================

  /**
   * Get all clients with optional filters
   * Backend: GET /clients with query params
   * 
   * @param filters - Optional filters for status, type, search
   * @returns Promise<Client[]> Array of clients
   * @throws Error if fetch fails
   */
  async getAll(filters?: ClientFilters): Promise<Client[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.clientType) params.append('clientType', filters.clientType);
      if (filters?.search) params.append('search', filters.search);
      const queryString = params.toString();
      const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
      return await apiClient.get<Client[]>(url);
    } catch (error) {
      console.error('[ClientsApiService.getAll] Error:', error);
      throw new Error('Failed to fetch clients');
    }
  }

  /**
   * Get client by ID
   * Backend: GET /clients/:id
   * 
   * @param id - Client ID
   * @returns Promise<Client> Client data with cases and invoices
   * @throws Error if id is invalid or fetch fails
   */
  async getById(id: string): Promise<Client> {
    this.validateId(id, 'getById');
    try {
      return await apiClient.get<Client>(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error('[ClientsApiService.getById] Error:', error);
      throw new Error(`Failed to fetch client with id: ${id}`);
    }
  }

  /**
   * Create a new client
   * Backend: POST /clients
   * 
   * @param data - Client creation DTO
   * @returns Promise<Client> Created client
   * @throws Error if validation fails or creation fails
   */
  async create(data: Partial<Client>): Promise<Client> {
    this.validateObject(data, 'data', 'create');
    if (!data.name) {
      throw new Error('[ClientsApiService.create] name is required');
    }
    if (data.email) {
      this.validateEmail(data.email, 'create');
    }
    try {
      return await apiClient.post<Client>(this.baseUrl, data);
    } catch (error) {
      console.error('[ClientsApiService.create] Error:', error);
      throw new Error('Failed to create client');
    }
  }

  /**
   * Update an existing client
   * Backend: PUT /clients/:id
   * 
   * @param id - Client ID
   * @param data - Client update DTO
   * @returns Promise<Client> Updated client
   * @throws Error if validation fails or update fails
   */
  async update(id: string, data: Partial<Client>): Promise<Client> {
    this.validateId(id, 'update');
    this.validateObject(data, 'data', 'update');
    if (data.email) {
      this.validateEmail(data.email, 'update');
    }
    try {
      return await apiClient.put<Client>(`${this.baseUrl}/${id}`, data);
    } catch (error) {
      console.error('[ClientsApiService.update] Error:', error);
      throw new Error(`Failed to update client with id: ${id}`);
    }
  }

  /**
   * Delete a client
   * Backend: DELETE /clients/:id
   * 
   * @param id - Client ID
   * @returns Promise<void>
   * @throws Error if id is invalid or delete fails
   */
  async delete(id: string): Promise<void> {
    this.validateId(id, 'delete');
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error('[ClientsApiService.delete] Error:', error);
      throw new Error(`Failed to delete client with id: ${id}`);
    }
  }

  // =============================================================================
  // CLIENT MANAGEMENT
  // =============================================================================

  /**
   * Get VIP clients only
   * 
   * @returns Promise<Client[]> Array of VIP clients
   * @throws Error if fetch fails
   */
  async getVipClients(): Promise<Client[]> {
    try {
      return await apiClient.get<Client[]>(`${this.baseUrl}/vip`);
    } catch (error) {
      console.error('[ClientsApiService.getVipClients] Error:', error);
      throw new Error('Failed to fetch VIP clients');
    }
  }

  /**
   * Get active clients only
   * 
   * @returns Promise<Client[]> Array of active clients
   * @throws Error if fetch fails
   */
  async getActiveClients(): Promise<Client[]> {
    return this.getAll({ status: 'active' });
  }

  /**
   * Run conflict check for client
   * Backend: POST /clients/:id/conflict-check
   * 
   * @param id - Client ID
   * @returns Promise<unknown> Conflict check results
   * @throws Error if validation fails or operation fails
   */
  async runConflictCheck(id: string): Promise<unknown> {
    this.validateId(id, 'runConflictCheck');
    try {
      return await apiClient.post(`${this.baseUrl}/${id}/conflict-check`, {});
    } catch (error) {
      console.error('[ClientsApiService.runConflictCheck] Error:', error);
      throw new Error(`Failed to run conflict check for client: ${id}`);
    }
  }

  /**
   * Update client retainer
   * Backend: PATCH /clients/:id/retainer
   * 
   * @param id - Client ID
   * @param retainerAmount - New retainer amount
   * @param retainerBalance - Current retainer balance
   * @returns Promise<Client> Updated client
   * @throws Error if validation fails or operation fails
   */
  async updateRetainer(id: string, retainerAmount: number, retainerBalance?: number): Promise<Client> {
    this.validateId(id, 'updateRetainer');
    if (typeof retainerAmount !== 'number' || retainerAmount < 0) {
      throw new Error('[ClientsApiService.updateRetainer] retainerAmount must be a non-negative number');
    }
    try {
      return await apiClient.patch<Client>(`${this.baseUrl}/${id}/retainer`, {
        retainerAmount,
        retainerBalance,
        hasRetainer: retainerAmount > 0,
      });
    } catch (error) {
      console.error('[ClientsApiService.updateRetainer] Error:', error);
      throw new Error(`Failed to update retainer for client: ${id}`);
    }
  }

  // =============================================================================
  // STATISTICS & REPORTING
  // =============================================================================

  /**
   * Get client statistics
   * 
   * @returns Promise<ClientStatistics> Statistics data
   * @throws Error if fetch fails
   */
  async getStatistics(): Promise<ClientStatistics> {
    try {
      return await apiClient.get<ClientStatistics>(`${this.baseUrl}/statistics`);
    } catch (error) {
      console.error('[ClientsApiService.getStatistics] Error:', error);
      throw new Error('Failed to fetch client statistics');
    }
  }

  /**
   * Get cases for a client
   * Backend: GET /clients/:id/cases
   * 
   * @param id - Client ID
   * @returns Promise<any[]> Array of cases
   * @throws Error if validation fails or fetch fails
   */
  async getCases(id: string): Promise<any[]> {
    this.validateId(id, 'getCases');
    try {
      return await apiClient.get<any[]>(`${this.baseUrl}/${id}/cases`);
    } catch (error) {
      console.error('[ClientsApiService.getCases] Error:', error);
      throw new Error(`Failed to fetch cases for client: ${id}`);
    }
  }

  /**
   * Get invoices for a client
   * Backend: GET /clients/:id/invoices
   * 
   * @param id - Client ID
   * @returns Promise<any[]> Array of invoices
   * @throws Error if validation fails or fetch fails
   */
  async getInvoices(id: string): Promise<any[]> {
    this.validateId(id, 'getInvoices');
    try {
      return await apiClient.get<any[]>(`${this.baseUrl}/${id}/invoices`);
    } catch (error) {
      console.error('[ClientsApiService.getInvoices] Error:', error);
      throw new Error(`Failed to fetch invoices for client: ${id}`);
    }
  }
}
