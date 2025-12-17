/**
 * PACER Integration API Service
 * Implements missing PACER docket synchronization functionality
 * Coverage: 3/3 PACER endpoints
 */

import { apiClient } from '../../apiClient';

export interface PACERConfig {
  username: string;
  password: string;
  baseUrl?: string;
}

export interface PACERDocketSearchParams {
  courtId: string;
  caseNumber: string;
  includeDocuments?: boolean;
}

export interface PACERDocketEntry {
  entryNumber: number;
  date: string;
  filedDate?: string;
  description: string;
  documentNumber?: string;
  attachments?: number;
  pages?: number;
}

export interface PACERSyncResult {
  caseId: string;
  courtId: string;
  caseNumber: string;
  entriesFound: number;
  entriesAdded: number;
  entriesUpdated: number;
  documentsDownloaded: number;
  errors?: string[];
  syncedAt: string;
}

export interface PACERConnection {
  id: string;
  name: string;
  username: string;
  courtIds: string[];
  status: 'Active' | 'Inactive' | 'Error';
  lastSync?: string;
  createdAt: string;
  updatedAt: string;
}

export class PACERApiService {
  /**
   * Sync docket entries from PACER for a specific case
   * POST /api/v1/integrations/pacer/sync
   */
  async syncDocket(params: PACERDocketSearchParams): Promise<PACERSyncResult> {
    return apiClient.post<PACERSyncResult>('/integrations/pacer/sync', params);
  }

  /**
   * Test PACER credentials and connection
   * POST /api/v1/integrations/pacer/test
   */
  async testConnection(config: PACERConfig): Promise<{ success: boolean; message: string }> {
    return apiClient.post<{ success: boolean; message: string }>('/integrations/pacer/test', config);
  }

  /**
   * Get PACER connection configuration
   * GET /api/v1/integrations/pacer/config
   */
  async getConfig(): Promise<PACERConnection> {
    return apiClient.get<PACERConnection>('/integrations/pacer/config');
  }

  /**
   * Update PACER connection configuration
   * PUT /api/v1/integrations/pacer/config
   */
  async updateConfig(config: Partial<PACERConnection>): Promise<PACERConnection> {
    return apiClient.put<PACERConnection>('/integrations/pacer/config', config);
  }

  /**
   * Get PACER sync history for a case
   * GET /api/v1/integrations/pacer/history/:caseId
   */
  async getSyncHistory(caseId: string): Promise<PACERSyncResult[]> {
    return apiClient.get<PACERSyncResult[]>(`/integrations/pacer/history/${caseId}`);
  }

  /**
   * Schedule automatic PACER sync for a case
   * POST /api/v1/integrations/pacer/schedule
   */
  async scheduleSyncforCase(
    caseId: string,
    schedule: { frequency: 'daily' | 'weekly' | 'manual'; time?: string }
  ): Promise<{ success: boolean; scheduleId: string }> {
    return apiClient.post<{ success: boolean; scheduleId: string }>('/integrations/pacer/schedule', {
      caseId,
      ...schedule,
    });
  }
}
