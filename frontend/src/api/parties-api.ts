/**
 * Parties API Service
 * Manages parties (plaintiffs, defendants, third-parties) in cases
 * 
 * ALIGNED WITH BACKEND:
 * - Entity: backend/src/parties/entities/party.entity.ts
 * - DTOs: backend/src/parties/dto/create-party.dto.ts, update-party.dto.ts
 */

import { apiClient } from '../infrastructure/apiClient';
import type { Party } from '../../types'; // Use centralized type definition

// Backend PartyType enum values
export type PartyTypeBackend = 
  | 'Plaintiff' 
  | 'Defendant' 
  | 'Petitioner' 
  | 'Respondent' 
  | 'Appellant' 
  | 'Appellee' 
  | 'Third Party' 
  | 'Witness' 
  | 'Expert Witness' 
  | 'Other'
  | 'individual'
  | 'corporation'
  | 'government'
  | 'organization';

// Backend PartyRole enum values
export type PartyRoleBackend = 
  | 'Primary' 
  | 'Co-Party' 
  | 'Interested Party' 
  | 'Guardian' 
  | 'Representative'
  | 'plaintiff'
  | 'defendant'
  | 'petitioner'
  | 'respondent'
  | 'appellant'
  | 'appellee'
  | 'third_party'
  | 'intervenor'
  | 'witness'
  | 'expert';

// DTO for creating a party (matches backend CreatePartyDto)
export interface CreatePartyDto {
  caseId: string; // Required
  name: string; // Required
  type: PartyTypeBackend; // Required
  role?: PartyRoleBackend; // Optional (default: 'Primary')
  organization?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  counsel?: string;
  primaryContactName?: string;
  primaryContactEmail?: string;
  primaryContactPhone?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

// DTO for updating a party
export interface UpdatePartyDto extends Partial<CreatePartyDto> {}

export interface PartyFilters {
  caseId?: string;
  type?: PartyTypeBackend;
  role?: PartyRoleBackend;
}

export class PartiesApiService {
  private readonly baseUrl = '/parties';

  async getAll(filters?: PartyFilters): Promise<Party[]> {
    const params = new URLSearchParams();
    if (filters?.caseId) params.append('caseId', filters.caseId);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.role) params.append('role', filters.role);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    return apiClient.get<Party[]>(url);
  }

  async getById(id: string): Promise<Party> {
    return apiClient.get<Party>(`${this.baseUrl}/${id}`);
  }

  async getByCaseId(caseId: string): Promise<Party[]> {
    return this.getAll({ caseId });
  }

  async create(data: CreatePartyDto): Promise<Party> {
    // Ensure required fields are present
    if (!data.caseId || !data.name || !data.type) {
      throw new Error('caseId, name, and type are required fields');
    }
    return apiClient.post<Party>(this.baseUrl, data);
  }

  async update(id: string, data: UpdatePartyDto): Promise<Party> {
    return apiClient.put<Party>(`${this.baseUrl}/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Search parties by query string
   * @param params Search parameters with query string
   * @returns Array of matching parties
   */
  async search(params: { query: string }): Promise<Party[]> {
    // Return empty array if query is empty or whitespace to prevent malformed API calls
    if (!params.query || params.query.trim().length === 0) {
      return [];
    }
    
    const searchParams = new URLSearchParams();
    searchParams.append('q', params.query);
    const url = `${this.baseUrl}/search?${searchParams.toString()}`;
    return apiClient.get<Party[]>(url);
  }
}
