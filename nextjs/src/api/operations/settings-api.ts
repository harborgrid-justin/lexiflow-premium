/**
 * Settings API Service
 * Manages user preferences, notification settings, and system configuration
 */

import { apiClient } from "@/services/infrastructure/apiClient";

export interface NotificationPreferences {
  email?: {
    enabled: boolean;
    types?: string[];
  };
  push?: {
    enabled: boolean;
    types?: string[];
  };
  inApp?: {
    enabled: boolean;
    types?: string[];
  };
  [key: string]: any;
}

export class SettingsApiService {
  async getNotificationPreferences(): Promise<NotificationPreferences> {
    return apiClient.get<NotificationPreferences>("/settings/notifications");
  }

  async updateNotificationPreferences(
    preferences: NotificationPreferences
  ): Promise<NotificationPreferences> {
    return apiClient.put<NotificationPreferences>(
      "/settings/notifications",
      preferences
    );
  }

  async getPreferences(): Promise<any> {
    return apiClient.get("/settings/preferences");
  }

  async updatePreferences(preferences: any): Promise<any> {
    return apiClient.put("/settings/preferences", preferences);
  }

  async getProfile(): Promise<any> {
    return apiClient.get("/settings/profile");
  }

  async updateProfile(profile: any): Promise<any> {
    return apiClient.put("/settings/profile", profile);
  }
}
