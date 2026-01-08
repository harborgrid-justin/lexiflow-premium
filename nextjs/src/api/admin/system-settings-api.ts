/**
 * @module services/api/admin/system-settings-api
 * @description System Settings API Service
 * Handles global configuration, security settings, and usage limits
 */

import { apiClient } from "@/services/infrastructure/apiClient";

export interface SecuritySetting {
  id: string;
  label: string;
  desc: string;
  type: string;
  enabled: boolean;
}

export class SystemSettingsApiService {
  private readonly baseUrl = "/admin/settings";

  async getSecuritySettings(): Promise<SecuritySetting[]> {
    return apiClient.get<SecuritySetting[]>(`${this.baseUrl}/security`);
  }

  async updateSecuritySetting(
    id: string,
    enabled: boolean
  ): Promise<SecuritySetting> {
    return apiClient.patch<SecuritySetting>(`${this.baseUrl}/security/${id}`, {
      enabled,
    });
  }
}
