/**
 * Clients API Service
 * Manages client entities
 */

import { apiClient } from '../infrastructure/apiClient';

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
  customFields?: Record<string, any>;
  tags?: string[];
  notes?: string;
  metadata?: Record<string, any>;
  
  // Portal Access
  portalToken?: string;
  portalTokenExpiry?: Date;
  
  // Relationships
  cases?: any[];
  invoices?: any[];
  
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
export interface CreateClientDto {
  name: string;
  email: string;
  type: 'individual' | 'corporation' | 'partnership' | 'llc' | 'nonprofit' | 'government' | 'other';
  status: 'active' | 'inactive' | 'prospective' | 'former' | 'blocked';
  phone?: string;
  address?: string;
  industry?: string;
  taxId?: string;
  primaryContact?: string;
  notes?: string;
}

export interface UpdateClientDto {
  name?: string;
  email?: string;
  type?: 'individual' | 'corporation' | 'partnership' | 'llc' | 'nonprofit' | 'government' | 'other';
  status?: 'active' | 'inactive' | 'prospective' | 'former' | 'blocked';
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  billingAddress?: string;
  billingCity?: string;
  billingState?: string;
  billingZipCode?: string;
  billingCountry?: string;
  industry?: string;
  taxId?: string;
  primaryContactName?: string;
  primaryContactEmail?: string;
  primaryContactPhone?: string;
  primaryContactTitle?: string;
  accountManagerId?: string;
  paymentTerms?: 'net_15' | 'net_30' | 'net_45' | 'net_60' | 'due_on_receipt' | 'custom';
  preferredPaymentMethod?: string;
  creditLimit?: number;
  isVip?: boolean;
  requiresConflictCheck?: boolean;
  notes?: string;
}

export class ClientsApiService {
  private readonly baseUrl = '/clients';

  async getAll(filters?: ClientFilters): Promise<Client[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.clientType) params.append('clientType', filters.clientType);
    if (filters?.search) params.append('search', filters.search);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    return apiClient.get<Client[]>(url);
  }

  async getById(id: string): Promise<Client> {
    return apiClient.get<Client>(`${this.baseUrl}/${id}`);
  }

  async create(data: Partial<Client>): Promise<Client> {
    return apiClient.post<Client>(this.baseUrl, data);
  }

  async update(id: string, data: Partial<Client>): Promise<Client> {
    return apiClient.put<Client>(`${this.baseUrl}/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }
}
