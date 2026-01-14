// ================================================================================
// PROFILE DOMAIN SERVICE
// ================================================================================
//
// POSITION IN ARCHITECTURE:
//   Context/Loader → ProfileService → Frontend API → Backend
//
// PURPOSE:
//   - User profile management and preferences
//   - Permission and role management
//   - Audit log tracking for user activities
//
// USAGE:
//   Called by ProfileContext and route loaders for profile operations.
//   Never called directly from view components.
//
// ================================================================================

import { AuditLog } from "@/api/admin/audit-logs-api";
import { adminApi } from "@/api/domains/admin.api";
import { authApi } from "@/lib/frontend-api";
import { apiClient } from "@/services/infrastructure/apiClient";
import {
  ExtendedUserProfile,
  GranularPermission,
  UpdateUserDto,
  UserId,
} from "@/types";

export const ProfileDomain = {
  getCurrentProfile: async (): Promise<ExtendedUserProfile> => {
    try {
      const user = await authApi.auth.getCurrentUser();

      let permissions: GranularPermission[] = [];
      try {
        permissions = await apiClient.get<GranularPermission[]>(
          `/users/${user.id}/permissions`
        );
      } catch (e) {
        console.warn("Failed to fetch permissions", e);
      }

      return {
        ...user,
        id: user.id as UserId,
        preferences: (user as unknown as ExtendedUserProfile).preferences || {},
        security: (user as unknown as ExtendedUserProfile).security || {},
        accessMatrix: permissions,
      } as ExtendedUserProfile;
    } catch (error) {
      console.warn("Failed to fetch profile from backend", error);
      throw error;
    }
  },
  updateProfile: async (
    updates: Partial<ExtendedUserProfile>
  ): Promise<ExtendedUserProfile> => {
    const current = await ProfileDomain.getCurrentProfile();
    const updated = { ...current, ...updates };

    try {
      // Map ExtendedUserProfile updates to UpdateUserDto
      const dto: UpdateUserDto = {
        firstName: updates.firstName,
        lastName: updates.lastName,
        email: updates.email,
        role: updates.role,
        department: updates.department,
        title: updates.title,
        // Add other fields if they exist in UpdateUserDto
      };
      await authApi.users.update(current.id, dto);
    } catch (error) {
      console.warn("Backend update for profile failed", error);
      throw error;
    }

    return updated;
  },
  updatePreferences: async (
    prefs: Partial<ExtendedUserProfile["preferences"]>
  ): Promise<void> => {
    const current = await ProfileDomain.getCurrentProfile();

    try {
      await apiClient.patch(`/users/${current.id}/preferences`, prefs);
    } catch (error) {
      console.warn("Backend update for preferences failed", error);
      throw error;
    }
  },
  updateSecurity: async (
    sec: Partial<ExtendedUserProfile["security"]>
  ): Promise<void> => {
    const current = await ProfileDomain.getCurrentProfile();

    try {
      await apiClient.patch(`/users/${current.id}/security`, sec);
    } catch (error) {
      console.warn("Backend update for security failed", error);
      throw error;
    }
  },
  addPermission: async (
    perm: GranularPermission
  ): Promise<GranularPermission> => {
    const current = await ProfileDomain.getCurrentProfile();
    const newPerm = { ...perm, id: `perm-${Date.now()}` };

    try {
      await apiClient.post(`/users/${current.id}/permissions`, perm);
    } catch (error) {
      console.warn("Backend update for permissions failed", error);
      throw error;
    }

    return newPerm;
  },
  revokePermission: async (id: string): Promise<void> => {
    const current = await ProfileDomain.getCurrentProfile();

    try {
      await apiClient.delete(`/users/${current.id}/permissions/${id}`);
    } catch (error) {
      console.warn("Backend update for permissions failed", error);
      throw error;
    }
  },
  getAuditLog: async (userId: string) => {
    try {
      const logs = await adminApi.auditLogs.getAll({ userId });
      return logs.map((log: AuditLog) => ({
        id: log.id,
        action: log.action,
        timestamp: log.timestamp,
        ip: log.ipAddress,
        device: log.userAgent,
        resource: log.entityType,
      }));
    } catch (error) {
      console.warn("Failed to fetch audit logs from backend", error);
      return [];
    }
  },
};
