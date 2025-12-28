/**
 * AI Ops API Service
 * AI operations and model management
 */

import { apiClient } from '@/services/infrastructure/apiClient';

export interface AIOperation {
  id: string;
  operationType: 'summarization' | 'classification' | 'extraction' | 'prediction' | 'generation';
  model: string;
  input: Record<string, any>;
  output?: Record<string, any>;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  confidence?: number;
  processingTime?: number;
  error?: string;
  metadata?: Record<string, any>;
  createdAt?: string;
  completedAt?: string;
}

export class AIOpsApiService {
  private readonly baseUrl = '/ai-ops';

  async execute(data: {
    operationType: AIOperation['operationType'];
    model: string;
    input: Record<string, any>;
  }): Promise<AIOperation> {
    return apiClient.post<AIOperation>(`${this.baseUrl}/execute`, data);
  }

  async getAll(filters?: { operationType?: AIOperation['operationType']; status?: AIOperation['status'] }): Promise<AIOperation[]> {
    const params = new URLSearchParams();
    if (filters?.operationType) params.append('operationType', filters.operationType);
    if (filters?.status) params.append('status', filters.status);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    return apiClient.get<AIOperation[]>(url);
  }

  async getById(id: string): Promise<AIOperation> {
    return apiClient.get<AIOperation>(`${this.baseUrl}/${id}`);
  }
}
