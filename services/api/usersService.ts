/**
 * Users Service
 * Handles user management, profile updates, preferences, and security settings
 */

import apiClient from './apiClient';
import { API_ENDPOINTS } from './config';
import { createApiError } from './errors';
import type { PaginationParams } from '../../types/api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  role: string;
  department?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  isActive: boolean;
  isTwoFactorEnabled: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends User {
  bio?: string;
  timezone?: string;
  language?: string;
  preferredWorkingHours?: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  bio?: string;
  department?: string;
  timezone?: string;
  language?: string;
}

export interface UserPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  digestFrequency: 'daily' | 'weekly' | 'never';
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  passwordLastChanged?: Date;
  activeSessions: number;
  trustedDevices: number;
}

export interface UserSession {
  id: string;
  deviceName: string;
  browser: string;
  os: string;
  ipAddress: string;
  location?: string;
  current: boolean;
  lastActivity: Date;
  createdAt: Date;
}

export interface UsersListResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Get list of users with pagination and filters
 */
export async function getUsers(params?: PaginationParams & {
  role?: string;
  department?: string;
  search?: string;
  isActive?: boolean;
}): Promise<UsersListResponse> {
  try {
    const response = await apiClient.get<UsersListResponse>(API_ENDPOINTS.USERS.BASE, {
      params,
    });
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get user by ID
 */
export async function getUserById(id: string): Promise<User> {
  try {
    const response = await apiClient.get<User>(API_ENDPOINTS.USERS.BY_ID(id));
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get current user profile
 */
export async function getProfile(): Promise<UserProfile> {
  try {
    const response = await apiClient.get<UserProfile>(API_ENDPOINTS.USERS.PROFILE);
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Update current user profile
 */
export async function updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
  try {
    const response = await apiClient.put<UserProfile>(
      API_ENDPOINTS.USERS.UPDATE_PROFILE,
      data
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Upload user avatar
 */
export async function uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
  try {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await apiClient.post<{ avatarUrl: string }>(
      API_ENDPOINTS.USERS.AVATAR,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Delete user avatar
 */
export async function deleteAvatar(): Promise<void> {
  try {
    await apiClient.delete(API_ENDPOINTS.USERS.AVATAR);
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get user preferences
 */
export async function getPreferences(): Promise<UserPreferences> {
  try {
    const response = await apiClient.get<UserPreferences>(API_ENDPOINTS.USERS.PREFERENCES);
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Update user preferences
 */
export async function updatePreferences(
  preferences: Partial<UserPreferences>
): Promise<UserPreferences> {
  try {
    const response = await apiClient.put<UserPreferences>(
      API_ENDPOINTS.USERS.PREFERENCES,
      preferences
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get security settings
 */
export async function getSecuritySettings(): Promise<SecuritySettings> {
  try {
    const response = await apiClient.get<SecuritySettings>(API_ENDPOINTS.USERS.SECURITY);
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get active sessions
 */
export async function getSessions(): Promise<UserSession[]> {
  try {
    const response = await apiClient.get<UserSession[]>(API_ENDPOINTS.USERS.SESSIONS);
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Revoke a specific session
 */
export async function revokeSession(sessionId: string): Promise<void> {
  try {
    await apiClient.delete(API_ENDPOINTS.USERS.REVOKE_SESSION(sessionId));
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Revoke all sessions except current
 */
export async function revokeAllSessions(): Promise<void> {
  try {
    await apiClient.post(`${API_ENDPOINTS.USERS.SESSIONS}/revoke-all`);
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Create new user (admin only)
 */
export async function createUser(data: {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  department?: string;
  phoneNumber?: string;
}): Promise<User> {
  try {
    const response = await apiClient.post<User>(API_ENDPOINTS.USERS.BASE, data);
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Update user (admin only)
 */
export async function updateUser(id: string, data: Partial<User>): Promise<User> {
  try {
    const response = await apiClient.put<User>(API_ENDPOINTS.USERS.BY_ID(id), data);
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Deactivate user (admin only)
 */
export async function deactivateUser(id: string): Promise<void> {
  try {
    await apiClient.post(`${API_ENDPOINTS.USERS.BY_ID(id)}/deactivate`);
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Activate user (admin only)
 */
export async function activateUser(id: string): Promise<void> {
  try {
    await apiClient.post(`${API_ENDPOINTS.USERS.BY_ID(id)}/activate`);
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Delete user permanently (admin only)
 */
export async function deleteUser(id: string): Promise<void> {
  try {
    await apiClient.delete(API_ENDPOINTS.USERS.BY_ID(id));
  } catch (error) {
    throw createApiError(error);
  }
}

export default {
  getUsers,
  getUserById,
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  getPreferences,
  updatePreferences,
  getSecuritySettings,
  getSessions,
  revokeSession,
  revokeAllSessions,
  createUser,
  updateUser,
  deactivateUser,
  activateUser,
  deleteUser,
};
