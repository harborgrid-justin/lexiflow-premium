/**
 * Legal Entities API Service
 * Entity management and relationship mapping
 */

import { apiClient } from '@/services/infrastructure/apiClient';

export interface EntityRelationship {
  id: string;
  relatedEntityId: string;
  relatedEntityName: string;
  relationshipType: string;
  effectiveDate?: string;
  endDate?: string;
  metadata?: Record<string, unknown>;
}

export interface LegalEntityApi {
  id: string;
  name: string;
  entityType: 'individual' | 'corporation' | 'llc' | 'partnership' | 'trust' | 'estate' | 'nonprofit' | 'government' | 'foreign_entity' | 'other';
  fullLegalName?: string;
  taxId?: string;
  registrationNumber?: string;
  jurisdiction?: string;
  formationDate?: string;
  status: 'active' | 'inactive' | 'dissolved' | 'suspended' | 'other';
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  relationships?: EntityRelationship[];
  parentEntityId?: string;
  parentEntityName?: string;
  subsidiaries?: EntityRelationship[];
  affiliates?: EntityRelationship[];
  representatives?: EntityRelationship[];
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export class LegalEntitiesApiService {
  private readonly baseUrl = '/legal-entities';

  async getAll(filters?: {
    entityType?: string;
    status?: string;
    jurisdiction?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<LegalEntityApi[]> {
    const params = new URLSearchParams();
    if (filters?.entityType) params.append('entityType', filters.entityType);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.jurisdiction) params.append('jurisdiction', filters.jurisdiction);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    const response = await apiClient.get<LegalEntityApi[]>(url);
    return Array.isArray(response) ? response : [];
  }

  async getById(id: string): Promise<LegalEntityApi> {
    return apiClient.get<LegalEntityApi>(`${this.baseUrl}/${id}`);
  }

  async create(data: Partial<LegalEntityApi>): Promise<LegalEntityApi> {
    return apiClient.post<LegalEntityApi>(this.baseUrl, data);
  }

  async update(id: string, data: Partial<LegalEntityApi>): Promise<LegalEntityApi> {
    return apiClient.put<LegalEntityApi>(`${this.baseUrl}/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }

  async getRelationships(id: string): Promise<EntityRelationship[]> {
    return apiClient.get<EntityRelationship[]>(`${this.baseUrl}/${id}/relationships`);
  }

  async getAllRelationships(): Promise<EntityRelationship[]> {
    return apiClient.get<EntityRelationship[]>(`${this.baseUrl}/relationships`);
  }

  async getStats(): Promise<{
    total: number;
    active: number;
    corporations: number;
    individuals: number;
  }> {
    return apiClient.get(`${this.baseUrl}/stats`);
  }
}
