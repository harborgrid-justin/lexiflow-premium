import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export enum ClauseCategory {
  GENERAL = 'general',
  CONTRACT = 'contract',
  MOTION = 'motion',
  PLEADING = 'pleading',
  DISCOVERY = 'discovery',
  CUSTOM = 'custom',
}

export interface Clause {
  id: string;
  title: string;
  content: string;
  description?: string;
  category: ClauseCategory;
  tags?: string[];
  variables?: Record<string, any>;
  isActive: boolean;
  usageCount: number;
  lastUsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

export const clauseApiService = {
  // CRUD operations
  async getClauses(
    category?: ClauseCategory,
    search?: string,
    tag?: string,
    isActive?: boolean,
  ): Promise<Clause[]> {
    const response = await axios.get(`${API_BASE_URL}/api/v1/clauses`, {
      params: { category, search, tag, isActive },
    });
    return response.data;
  },

  async getClause(id: string): Promise<Clause> {
    const response = await axios.get(`${API_BASE_URL}/api/v1/clauses/${id}`);
    return response.data;
  },

  async createClause(data: Partial<Clause>): Promise<Clause> {
    const response = await axios.post(`${API_BASE_URL}/api/v1/clauses`, data);
    return response.data;
  },

  async updateClause(id: string, data: Partial<Clause>): Promise<Clause> {
    const response = await axios.put(`${API_BASE_URL}/api/v1/clauses/${id}`, data);
    return response.data;
  },

  async deleteClause(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/api/v1/clauses/${id}`);
  },

  // Utility operations
  async getMostUsed(limit: number = 10): Promise<Clause[]> {
    const response = await axios.get(`${API_BASE_URL}/api/v1/clauses/most-used`, {
      params: { limit },
    });
    return response.data;
  },

  async searchByContent(searchTerm: string): Promise<Clause[]> {
    const response = await axios.get(`${API_BASE_URL}/api/v1/clauses/search`, {
      params: { q: searchTerm },
    });
    return response.data;
  },

  async getByCategory(category: ClauseCategory): Promise<Clause[]> {
    const response = await axios.get(`${API_BASE_URL}/api/v1/clauses/category/${category}`);
    return response.data;
  },

  // Variable interpolation operations
  async interpolateClause(
    id: string,
    variables: Record<string, any>,
  ): Promise<{ clause: Clause; interpolatedContent: string }> {
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/clauses/${id}/interpolate`,
      { variables },
    );
    return response.data;
  },

  async validateClauseVariables(
    id: string,
    variables: Record<string, any>,
  ): Promise<{
    valid: boolean;
    missingVariables: string[];
    extraVariables: string[];
  }> {
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/clauses/${id}/validate-variables`,
      { variables },
    );
    return response.data;
  },

  async batchInterpolate(
    clauseIds: string[],
    variables: Record<string, any>,
  ): Promise<Array<{ clauseId: string; interpolatedContent: string }>> {
    const response = await axios.post(`${API_BASE_URL}/api/v1/clauses/batch-interpolate`, {
      clauseIds,
      variables,
    });
    return response.data;
  },

  async previewClause(
    id: string,
    variables: Record<string, any>,
  ): Promise<{
    original: string;
    interpolated: string;
    variables: string[];
    missingVariables: string[];
  }> {
    const response = await axios.post(`${API_BASE_URL}/api/v1/clauses/${id}/preview`, {
      variables,
    });
    return response.data;
  },

  // Increment usage count
  async incrementUsage(id: string): Promise<void> {
    await axios.post(`${API_BASE_URL}/api/v1/clauses/${id}/increment-usage`);
  },
};

export default clauseApiService;
