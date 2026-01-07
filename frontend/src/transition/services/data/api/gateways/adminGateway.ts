/**
 * Admin Gateway
 *
 * Domain-specific wrapper for system administration operations.
 * Handles user management, system settings, and configuration.
 *
 * @module services/data/api/gateways/adminGateway
 */

import {
  authDelete,
  authGet,
  authPost,
  authPut,
} from "../../client/authTransport";
import type { UserIdentity } from "./userGateway";

// Domain types
export interface SystemSettings {
  general: GeneralSettings;
  security: SecuritySettings;
  email: EmailSettings;
  billing: BillingSettings;
}

export interface GeneralSettings {
  firmName: string;
  timezone: string;
  dateFormat: string;
  currency: string;
}

export interface SecuritySettings {
  mfaRequired: boolean;
  sessionTimeout: number;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
}

export interface EmailSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  fromAddress: string;
  fromName: string;
}

export interface BillingSettings {
  currency: string;
  taxRate: number;
  paymentTerms: number;
  autoSendInvoices: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  metadata: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

export interface SystemHealth {
  status: "healthy" | "degraded" | "down";
  uptime: number;
  database: { status: string; responseTime: number };
  cache: { status: string; hitRate: number };
  queue: { status: string; pending: number };
}

/**
 * Admin Gateway
 */
export const adminGateway = {
  /**
   * Get all users
   */
  async getAllUsers(): Promise<UserIdentity[]> {
    return authGet<UserIdentity[]>("/admin/users");
  },

  /**
   * Create new user
   */
  async createUser(data: Omit<UserIdentity, "id">): Promise<UserIdentity> {
    return authPost<UserIdentity>("/admin/users", data);
  },

  /**
   * Update user
   */
  async updateUser(
    id: string,
    data: Partial<UserIdentity>
  ): Promise<UserIdentity> {
    return authPut<UserIdentity>(`/admin/users/${id}`, data);
  },

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<void> {
    return authDelete<void>(`/admin/users/${id}`);
  },

  /**
   * Update user roles
   */
  async updateUserRoles(
    userId: string,
    roles: string[]
  ): Promise<UserIdentity> {
    return authPut<UserIdentity>(`/admin/users/${userId}/roles`, { roles });
  },

  /**
   * Update user permissions
   */
  async updateUserPermissions(
    userId: string,
    permissions: string[]
  ): Promise<UserIdentity> {
    return authPut<UserIdentity>(`/admin/users/${userId}/permissions`, {
      permissions,
    });
  },

  /**
   * Get system settings
   */
  async getSettings(): Promise<SystemSettings> {
    return authGet<SystemSettings>("/admin/settings");
  },

  /**
   * Update system settings
   */
  async updateSettings(
    section: keyof SystemSettings,
    data: any
  ): Promise<SystemSettings> {
    return authPut<SystemSettings>(`/admin/settings/${section}`, data);
  },

  /**
   * Get audit logs
   */
  async getAuditLogs(filters?: {
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<AuditLog[]> {
    return authGet<AuditLog[]>("/admin/audit-logs", { params: filters });
  },

  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<SystemHealth> {
    return authGet<SystemHealth>("/admin/health");
  },

  /**
   * Clear application cache
   */
  async clearCache(): Promise<void> {
    return authPost<void>("/admin/cache/clear");
  },

  /**
   * Run database backup
   */
  async runBackup(): Promise<{ id: string; status: string }> {
    return authPost<{ id: string; status: string }>("/admin/backup");
  },

  /**
   * Get available roles
   */
  async getAvailableRoles(): Promise<string[]> {
    return authGet<string[]>("/admin/roles");
  },

  /**
   * Get available permissions
   */
  async getAvailablePermissions(): Promise<string[]> {
    return authGet<string[]>("/admin/permissions");
  },
};
