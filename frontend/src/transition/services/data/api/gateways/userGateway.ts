/**
 * User Gateway
 *
 * Domain-specific wrapper for user-related API operations.
 * Provides identity resolution and user management.
 *
 * Enterprise pattern: Features consume gateways, not raw API clients.
 *
 * @module services/data/api/gateways/userGateway
 */

import { authDelete, authGet, authPut } from "../../client/authTransport";

// Domain types (will be replaced by generated types when available)
export interface UserIdentity {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  permissions: string[];
  avatar?: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string;
}

/**
 * User Gateway
 *
 * Provides typed access to user-related backend operations.
 */
export const userGateway = {
  /**
   * Get current authenticated user identity
   *
   * Called by AuthProvider to resolve identity from backend.
   * Backend validates session via cookie.
   */
  async getCurrentIdentity(): Promise<UserIdentity> {
    return authGet<UserIdentity>("/users/me");
  },

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<UserIdentity> {
    return authGet<UserIdentity>(`/users/${id}`);
  },

  /**
   * Get all users (admin only)
   */
  async getAllUsers(): Promise<UserIdentity[]> {
    return authGet<UserIdentity[]>("/users");
  },

  /**
   * Update user profile
   */
  async updateUser(id: string, data: UpdateUserDto): Promise<UserIdentity> {
    return authPut<UserIdentity>(`/users/${id}`, data);
  },

  /**
   * Delete user (admin only)
   */
  async deleteUser(id: string): Promise<void> {
    return authDelete<void>(`/users/${id}`);
  },

  /**
   * Check if user has specific permission
   */
  async checkPermission(permission: string): Promise<boolean> {
    try {
      const identity = await this.getCurrentIdentity();
      return identity.permissions.includes(permission);
    } catch {
      return false;
    }
  },

  /**
   * Check if user has specific role
   */
  async checkRole(role: string): Promise<boolean> {
    try {
      const identity = await this.getCurrentIdentity();
      return identity.roles.includes(role);
    } catch {
      return false;
    }
  },
};
