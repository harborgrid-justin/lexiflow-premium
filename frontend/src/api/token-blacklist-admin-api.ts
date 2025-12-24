/**
 * Token Blacklist Admin API Service
 * JWT token blacklist management
 */

import { apiClient } from '@services/infrastructure/apiClient';

export interface BlacklistedToken {
  id: string;
  token: string;
  userId?: string;
  reason: 'logout' | 'expired' | 'security' | 'admin';
  blacklistedAt: string;
  expiresAt: string;
  metadata?: Record<string, any>;
}

export class TokenBlacklistAdminApiService {
  private readonly baseUrl = '/token-blacklist-admin';

  async getAll(filters?: { userId?: string; reason?: BlacklistedToken['reason'] }): Promise<BlacklistedToken[]> {
    const params = new URLSearchParams();
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.reason) params.append('reason', filters.reason);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    return apiClient.get<BlacklistedToken[]>(url);
  }

  async blacklist(data: { token: string; userId?: string; reason: BlacklistedToken['reason'] }): Promise<BlacklistedToken> {
    return apiClient.post<BlacklistedToken>(this.baseUrl, data);
  }

  async check(token: string): Promise<{ blacklisted: boolean }> {
    return apiClient.post(`${this.baseUrl}/check`, { token });
  }

  async cleanup(): Promise<{ removed: number }> {
    return apiClient.post(`${this.baseUrl}/cleanup`, {});
  }
}
