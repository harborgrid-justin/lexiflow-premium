/**
 * User Provider Types
 * Type definitions for current user context
 *
 * @module lib/user/types
 */

import type { User } from "@/types/system";

export interface UserProfile extends User {
  avatar?: string;
  bio?: string;
  preferences?: Record<string, unknown>;
}

export interface UserStateValue {
  currentUser: UserProfile | null;
  isLoading: boolean;
  error: Error | null;
  permissions: string[];
  roles: string[];
}

export interface UserActionsValue {
  loadCurrentUser: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
  clearUser: () => void;
  refreshPermissions: () => Promise<void>;
}

export interface UserProviderProps {
  children: React.ReactNode;
  autoLoad?: boolean;
}
