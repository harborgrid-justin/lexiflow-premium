/**
 * @module services/api/jurisdiction-api
 * @description Production backend API integration for Jurisdiction Explorer
 */

import { apiClient } from '../apiClient';

export interface Jurisdiction {
  id: string;
  name: string;
  system: 'Federal' | 'State' | 'Regulatory' | 'International' | 'Arbitration' | 'Local';
  type: string;
  region?: string;
  description?: string;
  website?: string;
  rulesUrl?: string;
  code?: string;
  metadata?: {
    iconColor?: string;
    parties?: number;
    status?: string;
    fullName?: string;
    jurisdiction?: string;
  };
  rules?: JurisdictionRule[];
  createdAt?: string;
  updatedAt?: string;
}

export interface JurisdictionRule {
  id: string;
  jurisdictionId: string;
  code: string;
  name: string;
  type: 'Procedural' | 'Evidentiary' | 'Civil' | 'Criminal' | 'Administrative' | 'Local' | 'Standing Order' | 'Practice Guide';
  description?: string;
  fullText?: string;
  url?: string;
  citations?: string[];
  effectiveDate?: string;
  isActive?: boolean;
  jurisdiction?: Jurisdiction;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateJurisdictionDto {
  name: string;
  system: Jurisdiction['system'];
  type: string;
  region?: string;
  description?: string;
  website?: string;
  rulesUrl?: string;
  code?: string;
  metadata?: Jurisdiction['metadata'];
}

export interface JurisdictionFilters {
  system?: Jurisdiction['system'];
  type?: string;
  region?: string;
  search?: string;
}

export interface RuleFilters {
  jurisdictionId?: string;
  type?: JurisdictionRule['type'];
  search?: string;
  isActive?: boolean;
}

export interface CreateJurisdictionRuleDto {
  jurisdictionId: string;
  code: string;
  name: string;
  type: JurisdictionRule['type'];
  description?: string;
  fullText?: string;
  url?: string;
  citations?: string[];
  effectiveDate?: string;
  isActive?: boolean;
}

/**
 * Jurisdiction API Service - Production Backend Integration
 */
export const JurisdictionAPI = {
  // ============================================================================
  // JURISDICTIONS
  // ============================================================================

  async getAll(params?: { system?: string; search?: string }): Promise<Jurisdiction[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.system) queryParams.append('system', params.system);
      if (params?.search) queryParams.append('search', params.search);
      
      const url = `/jurisdictions${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      return await apiClient.get<Jurisdiction[]>(url);
    } catch (error) {
      console.error('Failed to fetch jurisdictions:', error);
      return [];
    }
  },

  async getById(id: string): Promise<Jurisdiction | null> {
    try {
      return await apiClient.get<Jurisdiction>(`/jurisdictions/${id}`);
    } catch (error) {
      console.error(`Failed to fetch jurisdiction ${id}:`, error);
      return null;
    }
  },

  async getFederal(): Promise<Jurisdiction[]> {
    try {
      return await apiClient.get<Jurisdiction[]>('/jurisdictions/federal');
    } catch (error) {
      console.error('Failed to fetch federal courts:', error);
      return [];
    }
  },

  async getState(): Promise<Jurisdiction[]> {
    try {
      return await apiClient.get<Jurisdiction[]>('/jurisdictions/state');
    } catch (error) {
      console.error('Failed to fetch state courts:', error);
      return [];
    }
  },

  async getRegulatory(): Promise<Jurisdiction[]> {
    try {
      return await apiClient.get<Jurisdiction[]>('/jurisdictions/regulatory');
    } catch (error) {
      console.error('Failed to fetch regulatory bodies:', error);
      return [];
    }
  },

  async getInternational(): Promise<Jurisdiction[]> {
    try {
      return await apiClient.get<Jurisdiction[]>('/jurisdictions/international');
    } catch (error) {
      console.error('Failed to fetch international treaties:', error);
      return [];
    }
  },

  async getArbitration(): Promise<Jurisdiction[]> {
    try {
      return await apiClient.get<Jurisdiction[]>('/jurisdictions/arbitration');
    } catch (error) {
      console.error('Failed to fetch arbitration providers:', error);
      return [];
    }
  },

  async getLocal(): Promise<Jurisdiction[]> {
    try {
      return await apiClient.get<Jurisdiction[]>('/jurisdictions/local');
    } catch (error) {
      console.error('Failed to fetch local rules:', error);
      return [];
    }
  },

  async getMapNodes(): Promise<any[]> {
    try {
      return await apiClient.get<any[]>('/jurisdictions/map-nodes');
    } catch (error) {
      console.error('Failed to fetch jurisdiction map nodes:', error);
      return [];
    }
  },

  async create(data: CreateJurisdictionDto): Promise<Jurisdiction | null> {
    try {
      return await apiClient.post<Jurisdiction>('/jurisdictions', data);
    } catch (error) {
      console.error('Failed to create jurisdiction:', error);
      return null;
    }
  },

  async update(id: string, data: Partial<CreateJurisdictionDto>): Promise<Jurisdiction | null> {
    try {
      return await apiClient.put<Jurisdiction>(`/jurisdictions/${id}`, data);
    } catch (error) {
      console.error(`Failed to update jurisdiction ${id}:`, error);
      return null;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/jurisdictions/${id}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete jurisdiction ${id}:`, error);
      return false;
    }
  },

  // ============================================================================
  // RULES
  // ============================================================================

  async getRules(jurisdictionId?: string): Promise<JurisdictionRule[]> {
    try {
      if (jurisdictionId) {
        return await apiClient.get<JurisdictionRule[]>(`/jurisdictions/${jurisdictionId}/rules`);
      }
      return await apiClient.get<JurisdictionRule[]>('/jurisdictions/rules');
    } catch (error) {
      console.error('Failed to fetch jurisdiction rules:', error);
      return [];
    }
  },

  async getRuleById(id: string): Promise<JurisdictionRule | null> {
    try {
      return await apiClient.get<JurisdictionRule>(`/jurisdictions/rules/${id}`);
    } catch (error) {
      console.error(`Failed to fetch rule ${id}:`, error);
      return null;
    }
  },

  async searchRules(query: string, jurisdictionId?: string): Promise<JurisdictionRule[]> {
    try {
      const params = new URLSearchParams({ q: query });
      if (jurisdictionId) params.append('jurisdictionId', jurisdictionId);
      
      return await apiClient.get<JurisdictionRule[]>(`/jurisdictions/rules/search?${params.toString()}`);
    } catch (error) {
      console.error('Failed to search jurisdiction rules:', error);
      return [];
    }
  },

  async createRule(data: CreateJurisdictionRuleDto): Promise<JurisdictionRule | null> {
    try {
      return await apiClient.post<JurisdictionRule>('/jurisdictions/rules', data);
    } catch (error) {
      console.error('Failed to create jurisdiction rule:', error);
      return null;
    }
  },

  async updateRule(id: string, data: Partial<Omit<CreateJurisdictionRuleDto, 'jurisdictionId'>>): Promise<JurisdictionRule | null> {
    try {
      return await apiClient.put<JurisdictionRule>(`/jurisdictions/rules/${id}`, data);
    } catch (error) {
      console.error(`Failed to update rule ${id}:`, error);
      return null;
    }
  },

  async deleteRule(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/jurisdictions/rules/${id}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete rule ${id}:`, error);
      return false;
    }
  },
};

// Export alias for consistency with other API services
export const JurisdictionApiService = JurisdictionAPI;
