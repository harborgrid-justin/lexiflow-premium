/**
 * CRM Domain API Services
 * Lead management, pipeline tracking, and conversion
 */

import { apiClient } from "@/services/infrastructure/apiClient";

export interface Lead {
  id: string;
  client: string;
  title: string;
  stage: string;
  value: string;
  date?: string;
  source?: string;
  notes?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface ConversionLock {
  leadId: string;
  acquiredAt: string;
  expiresAt: string;
  operationId: string;
}

export interface ConversionMapping {
  leadId: string;
  clientId?: string;
  caseId?: string;
  convertedAt: string;
}

export class CrmApiService {
  private readonly baseUrl = "/api/crm";

  async getLeads(): Promise<Lead[]> {
    return apiClient.get<Lead[]>(`${this.baseUrl}/leads`);
  }

  async getLead(id: string): Promise<Lead> {
    return apiClient.get<Lead>(`${this.baseUrl}/leads/${id}`);
  }

  async updateLead(id: string, data: Partial<Lead>): Promise<Lead> {
    return apiClient.patch<Lead>(`${this.baseUrl}/leads/${id}`, data);
  }

  /**
   * Acquire a distributed lock for lead conversion
   */
  async acquireConversionLock(leadId: string): Promise<ConversionLock> {
    return apiClient.post<ConversionLock>(
      `${this.baseUrl}/leads/${leadId}/lock`,
      {}
    );
  }

  /**
   * Release a distributed lock
   */
  async releaseConversionLock(
    leadId: string,
    operationId: string
  ): Promise<void> {
    return apiClient.delete(
      `${this.baseUrl}/leads/${leadId}/lock/${operationId}`
    );
  }

  /**
   * Check if a lead is currently locked
   */
  async getConversionLock(leadId: string): Promise<ConversionLock | null> {
    try {
      return await apiClient.get<ConversionLock>(
        `${this.baseUrl}/leads/${leadId}/lock`
      );
    } catch {
      return null;
    }
  }

  /**
   * Get conversion mapping record
   */
  async getConversionMapping(
    leadId: string
  ): Promise<ConversionMapping | null> {
    try {
      return await apiClient.get<ConversionMapping>(
        `${this.baseUrl}/conversions/${leadId}`
      );
    } catch {
      return null;
    }
  }

  /**
   * Store conversion mapping record
   */
  async storeConversionMapping(mapping: ConversionMapping): Promise<void> {
    return apiClient.post(`${this.baseUrl}/conversions`, mapping);
  }
}
