/**
 * User-related API Types
 */

import type { PaginatedResponse, AuditFields, ID } from './common';

// User role
export type UserRole = 'admin' | 'attorney' | 'paralegal' | 'legal_assistant' | 'client' | 'guest';

// User status
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

// User
export interface User extends AuditFields {
  id: ID;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  department?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  isActive: boolean;
  isTwoFactorEnabled: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
  timezone?: string;
  language?: string;
  organizationId?: ID;
  organizationName?: string;
}

// User profile (extended)
export interface UserProfile extends User {
  bio?: string;
  preferredWorkingHours?: string;
  barNumber?: string;
  licenseState?: string;
  specializations?: string[];
  hourlyRate?: number;
  settings?: UserSettings;
}

// User settings
export interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  emailSignature?: string;
}

// User preferences
export interface UserPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  digestFrequency: 'immediate' | 'hourly' | 'daily' | 'weekly' | 'never';
  notificationCategories: {
    caseUpdates: boolean;
    deadlines: boolean;
    mentions: boolean;
    assignments: boolean;
    billingAlerts: boolean;
    systemNotifications: boolean;
  };
}

// Security settings
export interface SecuritySettings {
  twoFactorEnabled: boolean;
  passwordLastChanged?: Date;
  activeSessions: number;
  trustedDevices: number;
  loginAttempts: number;
  lastFailedLoginAt?: Date;
}

// User session
export interface UserSession {
  id: ID;
  userId: ID;
  deviceName: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  ipAddress: string;
  location?: string;
  current: boolean;
  lastActivity: Date;
  createdAt: Date;
  expiresAt: Date;
}

// Create user request
export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  department?: string;
  phoneNumber?: string;
  password?: string;
  sendInvitation?: boolean;
}

// Update user request
export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  department?: string;
  bio?: string;
  timezone?: string;
  language?: string;
  hourlyRate?: number;
  specializations?: string[];
}

// Update profile request
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  bio?: string;
  timezone?: string;
  language?: string;
  preferredWorkingHours?: string;
}

// User list response
export interface UserListResponse extends PaginatedResponse<User> {}

// User activity
export interface UserActivity {
  id: ID;
  userId: ID;
  activityType: string;
  description: string;
  resourceType?: string;
  resourceId?: ID;
  metadata?: Record<string, any>;
  timestamp: Date;
}

// User statistics
export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  byRole: Array<{ role: UserRole; count: number }>;
  byDepartment: Array<{ department: string; count: number }>;
  newUsersThisMonth: number;
  averageSessionDuration: number;
}

// Trusted device
export interface TrustedDevice {
  id: ID;
  userId: ID;
  deviceName: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  fingerprint: string;
  lastUsedAt: Date;
  createdAt: Date;
}
