/**
 * Admin Panel Types
 * Comprehensive TypeScript types for the admin module
 * Next.js 16 compliant with strict type safety
 */

// =============================================================================
// User Management Types
// =============================================================================

export type UserRole = 'admin' | 'attorney' | 'paralegal' | 'client' | 'staff';
export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended';

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  mfaEnabled: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
  department?: string;
  phone?: string;
  avatar?: string;
  permissions: string[];
}

export interface CreateUserInput {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  department?: string;
  phone?: string;
  sendInvite?: boolean;
}

export interface UpdateUserInput {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  status?: UserStatus;
  department?: string;
  phone?: string;
  mfaEnabled?: boolean;
}

export interface UserInvite {
  id: string;
  email: string;
  role: UserRole;
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'expired';
}

// =============================================================================
// Role & Permission Types
// =============================================================================

export interface Role {
  id: string;
  name: string;
  description: string;
  level: number;
  isSystem: boolean;
  permissions: string[];
  userCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleInput {
  name: string;
  description: string;
  level: number;
  permissions: string[];
}

export interface Permission {
  id: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'approve' | 'export' | 'admin';
  description: string;
  category: string;
  roleCount?: number;
}

export interface PermissionGroup {
  name: string;
  description: string;
  permissions: Permission[];
}

// =============================================================================
// System Metrics Types
// =============================================================================

export interface SystemMetrics {
  timestamp: string;
  system: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    uptime: number;
    loadAverage: number[];
  };
  application: {
    activeUsers: number;
    requestsPerMinute: number;
    averageResponseTime: number;
    errorRate: number;
    totalRequests: number;
  };
  database: {
    connections: number;
    activeConnections: number;
    queryTime: number;
    cacheHitRate: number;
    poolSize: number;
  };
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: HealthCheck[];
  timestamp: string;
}

export interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message?: string;
  duration?: number;
  timestamp: string;
}

// =============================================================================
// Audit Log Types
// =============================================================================

export type AuditAction =
  | 'CREATE'
  | 'READ'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'EXPORT'
  | 'PERMISSION_CHANGE'
  | 'PASSWORD_CHANGE'
  | 'MFA_ENABLE'
  | 'MFA_DISABLE'
  | 'INVITE_SENT'
  | 'ACCOUNT_DEACTIVATED';

export type AuditSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface AuditLogEntry {
  id: string;
  action: AuditAction;
  severity: AuditSeverity;
  userId: string;
  userName: string;
  userEmail: string;
  resourceType: string;
  resourceId?: string;
  resourceName?: string;
  ipAddress: string;
  userAgent?: string;
  timestamp: string;
  details?: Record<string, unknown>;
  changes?: {
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }[];
}

export interface AuditLogFilters {
  action?: AuditAction;
  severity?: AuditSeverity;
  userId?: string;
  resourceType?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

// =============================================================================
// System Settings Types
// =============================================================================

/**
 * Simplified system settings for the settings page
 */
export interface SystemSettings {
  backendUrl: string;
  dataSource: 'postgresql' | 'mongodb' | 'mysql';
  cacheEnabled: boolean;
  cacheTTL: number;
  maxUploadSize: number;
  sessionTimeout: number;
  auditLogging: boolean;
  maintenanceMode: boolean;
}

/**
 * Feature flags for toggling system features
 */
export interface FeatureFlags {
  ocr: boolean;
  aiAssistant: boolean;
  realTimeSync: boolean;
  advancedSearch: boolean;
  documentVersioning: boolean;
  [key: string]: boolean;
}

/**
 * Full system settings structure (for comprehensive configuration)
 */
export interface FullSystemSettings {
  general: {
    siteName: string;
    siteUrl: string;
    supportEmail: string;
    defaultTimezone: string;
    dateFormat: string;
    maintenanceMode: boolean;
    maintenanceMessage?: string;
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordMinLength: number;
    requireMfa: boolean;
    allowedIpRanges: string[];
    auditLogRetention: number;
  };
  performance: {
    cacheEnabled: boolean;
    cacheTTL: number;
    maxUploadSize: number;
    rateLimitRequests: number;
    rateLimitWindow: number;
  };
  features: FeatureFlags;
  email: {
    provider: 'smtp' | 'sendgrid' | 'ses';
    fromAddress: string;
    fromName: string;
    smtpHost?: string;
    smtpPort?: number;
  };
}

export interface UpdateSettingsInput {
  category: keyof SystemSettings;
  key: string;
  value: unknown;
}

// =============================================================================
// Integration Types
// =============================================================================

export type IntegrationCategory =
  | 'storage'
  | 'ai'
  | 'communication'
  | 'calendar'
  | 'billing'
  | 'analytics'
  | 'court';

export type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'pending';

export interface Integration {
  id: string;
  name: string;
  description: string;
  category: IntegrationCategory;
  status: IntegrationStatus;
  icon: string;
  lastSync?: string;
  errorMessage?: string;
  config?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ConnectIntegrationInput {
  integrationId: string;
  credentials?: {
    apiKey?: string;
    clientId?: string;
    clientSecret?: string;
    accessToken?: string;
    refreshToken?: string;
  };
  config?: Record<string, unknown>;
}

export interface WebhookConfig {
  id: string;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
  lastTriggered?: string;
  createdAt: string;
}

export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  permissions: string[];
  lastUsed?: string;
  expiresAt?: string;
  createdAt: string;
  createdBy: string;
}

// =============================================================================
// System Logs Types
// =============================================================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface SystemLog {
  id: string;
  level: LogLevel;
  message: string;
  source: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
  stackTrace?: string;
  requestId?: string;
  userId?: string;
}

export interface LogFilters {
  level?: LogLevel;
  source?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

// =============================================================================
// API Response Types
// =============================================================================

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ActionResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// =============================================================================
// Page Props Types (Next.js 16)
// =============================================================================

export interface AdminPageProps {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export interface UserDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}
