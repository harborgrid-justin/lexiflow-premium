/**
 * Auth Domain Normalizers
 * Transform backend auth data to frontend format
 */

import {
  normalizeArray,
  normalizeBoolean,
  normalizeDate,
  normalizeId,
  normalizeString,
  type Normalizer,
} from "./index";

interface BackendUser {
  id: string | number;
  email?: string;
  name?: string;
  role?: string;
  is_active?: boolean;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
}

export const normalizeUser: Normalizer<BackendUser, any> = (backend) => {
  return {
    id: normalizeId(backend.id),
    email: normalizeString(backend.email),
    name: normalizeString(backend.name),
    role: normalizeString(backend.role),
    isActive: normalizeBoolean(backend.is_active),
    lastLogin: normalizeDate(backend.last_login),
    createdAt: normalizeDate(backend.created_at) || new Date(),
    updatedAt: normalizeDate(backend.updated_at) || new Date(),
  };
};

export function normalizeUsers(backendUsers: unknown): any[] {
  return normalizeArray(backendUsers, normalizeUser);
}
