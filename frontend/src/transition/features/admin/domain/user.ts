/**
 * System user domain model (admin context)
 */

export interface SystemUser {
  id: string;
  email: string;
  name: string;
  roles: string[];
  status: UserStatus;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserStatus = "active" | "inactive" | "suspended" | "deleted";
