import { type AuditLog } from "@/api/admin/audit-logs-api";
import { adminApi } from "@/api/domains/admin.api";
import { authApi } from "@/lib/frontend-api";
import { apiClient } from "@/services/infrastructure/apiClient";
import {
  type EntityId,
  type ExtendedUserProfile,
  type GranularPermission,
  type UpdateUserDto,
  type UserId,
  type UserPreferences,
  type UserSecurityProfile,
} from "@/types";

import type { UserProfile } from "@/lib/frontend-api/auth";

export const ProfileDomain = {
  getCurrentProfile: async (): Promise<ExtendedUserProfile> => {
    try {
      const userResult = await authApi.auth.getCurrentUser();
      if (!userResult.ok) {
        throw userResult.error;
      }

      const user: UserProfile = userResult.data;

      let permissions: GranularPermission[] = [];
      try {
        permissions = await apiClient.get<GranularPermission[]>(
          `/users/${user.id}/permissions`,
        );
      } catch (e) {
        console.warn("Failed to fetch permissions", e);
      }

      const defaultPreferences: UserPreferences = {
        theme: "system",
        notifications: {
          email: true,
          push: true,
          slack: false,
          digestFrequency: "Daily",
        },
        dashboardLayout: [],
        density: "comfortable",
        locale: "en-US",
        timezone: "UTC",
      };

      const defaultSecurity: UserSecurityProfile = {
        mfaEnabled: false,
        mfaMethod: "App",
        lastPasswordChange: new Date(0).toISOString(),
        passwordExpiry: new Date(0).toISOString(),
        activeSessions: [],
      };

      const [firstName, ...lastNameParts] = user.name.split(" ");
      const lastName = lastNameParts.join(" ");

      return {
        ...user,
        id: user.id as UserId,
        firstName:
          (user as unknown as ExtendedUserProfile).firstName || firstName || "",
        lastName:
          (user as unknown as ExtendedUserProfile).lastName || lastName || "",
        entityId: user.id as unknown as EntityId,
        title: (user as unknown as ExtendedUserProfile).title || "",
        department: (user as unknown as ExtendedUserProfile).department || "",
        managerId: (user as unknown as ExtendedUserProfile).managerId,
        preferences:
          (user as unknown as ExtendedUserProfile).preferences ||
          defaultPreferences,
        security:
          (user as unknown as ExtendedUserProfile).security || defaultSecurity,
        accessMatrix: permissions,
        skills: (user as unknown as ExtendedUserProfile).skills || [],
        barAdmissions:
          (user as unknown as ExtendedUserProfile).barAdmissions || [],
      } as ExtendedUserProfile;
    } catch (error) {
      console.warn("Failed to fetch profile from backend", error);
      throw error;
    }
  },
  updateProfile: async (
    updates: Partial<ExtendedUserProfile>,
  ): Promise<ExtendedUserProfile> => {
    const current = await ProfileDomain.getCurrentProfile();
    const updated = { ...current, ...updates };

    try {
      // Map ExtendedUserProfile updates to UpdateUserDto
      const dto: UpdateUserDto = {
        ...(updates.firstName ? { firstName: updates.firstName } : {}),
        ...(updates.lastName ? { lastName: updates.lastName } : {}),
        ...(updates.email ? { email: updates.email } : {}),
        ...(updates.role ? { role: updates.role } : {}),
        ...(updates.department ? { department: updates.department } : {}),
        ...(updates.title ? { title: updates.title } : {}),
        // Add other fields if they exist in UpdateUserDto
      };
      const updateResult = await authApi.users.update(current.id, dto);
      if (!updateResult.ok) {
        throw updateResult.error;
      }
    } catch (error) {
      console.warn("Backend update for profile failed", error);
      throw error;
    }

    return updated;
  },
  updatePreferences: async (
    prefs: Partial<ExtendedUserProfile["preferences"]>,
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
    sec: Partial<ExtendedUserProfile["security"]>,
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
    perm: GranularPermission,
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
