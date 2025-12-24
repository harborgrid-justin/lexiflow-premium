/**
 * AuthApiService
 * API service split from apiServices.ts
 */

import { apiClient, type PaginatedResponse } from '../infrastructure/apiClient';
import type { 
  Case, 
  DocketEntry, 
  LegalDocument, 
  EvidenceItem,
  TimeEntry,
  User,
} from '../../types';

export class AuthApiService {
  async login(email: string, password: string): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    const response = await apiClient.post<{ accessToken: string; refreshToken: string; user: User }>('/auth/login', {
      email,
      password,
    });
    
    // Store tokens
    apiClient.setAuthTokens(response.accessToken, response.refreshToken);
    
    return response;
  }

  async register(userData: { email: string; password: string; firstName: string; lastName: string }): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    const response = await apiClient.post<{ accessToken: string; refreshToken: string; user: User }>('/auth/register', userData);
    
    // Store tokens
    apiClient.setAuthTokens(response.accessToken, response.refreshToken);
    
    return response;
  }

  async logout(): Promise<void> {
    apiClient.clearAuthTokens();
  }

  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/auth/profile');
  }

  async refreshToken(): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshToken = localStorage.getItem('lexiflow_refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await apiClient.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', { refreshToken });
    apiClient.setAuthTokens(response.accessToken, response.refreshToken);
    
    return response;
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/reset-password', { token, newPassword });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/change-password', { currentPassword, newPassword });
  }

  async enableMFA(): Promise<{ qrCode: string; secret: string }> {
    return apiClient.post<{ qrCode: string; secret: string }>('/auth/enable-mfa', {});
  }

  async verifyMFA(code: string): Promise<{ verified: boolean; backupCodes?: string[] }> {
    return apiClient.post<{ verified: boolean; backupCodes?: string[] }>('/auth/verify-mfa', { code });
  }

  async disableMFA(): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/disable-mfa', {});
  }
}
