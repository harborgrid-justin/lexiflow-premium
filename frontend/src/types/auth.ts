/**
 * Auth & Security Types
 * Types for authentication, permissions, and security
 */

import type { BaseEntity } from './primitives';

export interface ApiKey extends BaseEntity {
  name: string;
  key: string;
  scopes: string[];
  status: 'active' | 'revoked';
  expiresAt?: string;
  lastUsedAt?: string;
}

export interface Permission extends BaseEntity {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'execute' | '*';
  effect: 'allow' | 'deny';
  conditions?: {
    type: string;
    operator: string;
    value: unknown;
  }[];
  metadata?: Record<string, any>;
}

export interface RolePermissions {
  roleId: string;
  roleName: string;
  permissions: Permission[];
}

export interface BlacklistedToken extends BaseEntity {
  token: string;
  userId?: string;
  reason: 'logout' | 'expired' | 'security' | 'admin';
  blacklistedAt: string;
  expiresAt: string;
  metadata?: Record<string, any>;
}
