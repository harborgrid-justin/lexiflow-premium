/**
 * User domain model
 */

import type { Permission } from "./permissions";
import type { Role } from "./roles";

export type { Permission, Role };

export interface User {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  roles: Role[];
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  phone?: string;
  organization?: string;
  department?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme?: "light" | "dark";
  locale?: string;
  notifications?: boolean;
}
