/**
 * Clients API Service
 * Manages client entities
 */

import { apiClient } from '../apiClient';

export interface Client {
  id: string;
  name: string;
  legalName?: string;
  clientType: 'individual' | 'corporate' | 'government' | 'nonprofit';
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  status: 'active' | 'inactive' | 'prospective' | 'former';
  primaryContact?: {
    name?: string;
    email?: string;
    phone?: string;
    title?: string;
  };
  billingSettings?: {
    billingModel?: 'hourly' | 'flat_fee' | 'contingency' | 'retainer' | 'hybrid';
    paymentTerms?: string;
    creditLimit?: number;
  };
  notes?: string;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClientFilters {
  status?: Client['status'];
  clientType?: Client['clientType'];
  search?: string;
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
