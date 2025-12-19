/**
 * @module services/api/data-platform/ai-ops-api
 * @description AI operations API service
 * Handles vector embeddings, AI model management, and similarity search
 * 
 * @responsibility Manage AI/ML operations and embeddings
 */

import { apiClient, type PaginatedResponse } from '../../infrastructure/apiClient';

/**
 * Vector embedding interface
 */
export interface VectorEmbedding {
  id: string;
  entityType: string;
  entityId: string;
  embedding: number[];
  model: string;
  content: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

/**
 * AI model interface
 */
export interface AIModel {
  id: string;
  name: string;
  type: string;
  provider: string;
  version: string;
  configuration: Record<string, any>;
  active: boolean;
  usageCount: number;
  lastUsed?: string;
  createdAt: string;
}

/**
 * AI operations API service class
 * Provides methods for AI/ML operations
 */
export class AiOpsApiService {
  // ==================== Embeddings ====================
  
  /**
   * Get vector embeddings
   */
  async getEmbeddings(filters?: any): Promise<PaginatedResponse<VectorEmbedding>> {
    try {
      return await apiClient.get<PaginatedResponse<VectorEmbedding>>('/ai-ops/embeddings', filters);
    } catch (error) {
      return { data: [], total: 0, page: 1, limit: 50, totalPages: 0 };
    }
  }

  /**
   * Store a new embedding
   */
  async storeEmbedding(data: Partial<VectorEmbedding>): Promise<VectorEmbedding> {
    return await apiClient.post<VectorEmbedding>('/ai-ops/embeddings', data);
  }

  /**
   * Search for similar embeddings (vector similarity search)
   */
  async searchSimilar(embedding: number[], limit = 10): Promise<{ results: any[] }> {
    try {
      return await apiClient.post('/ai-ops/embeddings/search', { embedding, limit });
    } catch (error) {
      return { results: [] };
    }
  }

  // ==================== Models ====================
  
  /**
   * Get all AI models
   */
  async getModels(): Promise<AIModel[]> {
    try {
      return await apiClient.get<AIModel[]>('/ai-ops/models');
    } catch (error) {
      return [];
    }
  }

  /**
   * Register a new AI model
   */
  async registerModel(data: Partial<AIModel>): Promise<AIModel> {
    return await apiClient.post<AIModel>('/ai-ops/models', data);
  }

  /**
   * Update an AI model
   */
  async updateModel(id: string, data: Partial<AIModel>): Promise<AIModel> {
    return await apiClient.put<AIModel>(`/ai-ops/models/${id}`, data);
  }

  /**
   * Delete an AI model
   */
  async deleteModel(id: string): Promise<void> {
    await apiClient.delete(`/ai-ops/models/${id}`);
  }

  // ==================== Statistics ====================
  
  /**
   * Get AI operations statistics
   */
  async getStats(): Promise<{
    totalEmbeddings: number;
    totalModels: number;
    activeModels: number;
    totalUsage: number;
  }> {
    try {
      return await apiClient.get('/ai-ops/stats');
    } catch (error) {
      return { totalEmbeddings: 0, totalModels: 0, activeModels: 0, totalUsage: 0 };
    }
  }
}
