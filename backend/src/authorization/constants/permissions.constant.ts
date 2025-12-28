/**
 * System-wide permission constants for LexiFlow Premium
 * All permissions are grouped by module for enterprise-grade authorization
 */

export const PERMISSIONS = {
  // Case Management Permissions
  CASES: {
    CREATE: 'cases:create',
    READ: 'cases:read',
    READ_OWN: 'cases:read:own',
    READ_ALL: 'cases:read:all',
    UPDATE: 'cases:update',
    UPDATE_OWN: 'cases:update:own',
    DELETE: 'cases:delete',
    DELETE_OWN: 'cases:delete:own',
    ASSIGN: 'cases:assign',
    CLOSE: 'cases:close',
    REOPEN: 'cases:reopen',
    ARCHIVE: 'cases:archive',
    EXPORT: 'cases:export',
  },

  // Document Management Permissions
  DOCUMENTS: {
    CREATE: 'documents:create',
    READ: 'documents:read',
    READ_OWN: 'documents:read:own',
    READ_ALL: 'documents:read:all',
    UPDATE: 'documents:update',
    UPDATE_OWN: 'documents:update:own',
    DELETE: 'documents:delete',
    DELETE_OWN: 'documents:delete:own',
    UPLOAD: 'documents:upload',
    DOWNLOAD: 'documents:download',
    SHARE: 'documents:share',
    VERSION: 'documents:version',
    SIGN: 'documents:sign',
    REDACT: 'documents:redact',
    EXPORT: 'documents:export',
  },

  // Billing & Time Entry Permissions
  BILLING: {
    CREATE: 'billing:create',
    READ: 'billing:read',
    READ_OWN: 'billing:read:own',
    READ_ALL: 'billing:read:all',
    UPDATE: 'billing:update',
    DELETE: 'billing:delete',
    APPROVE: 'billing:approve',
    INVOICE: 'billing:invoice',
    PAYMENT: 'billing:payment',
    REFUND: 'billing:refund',
    RATES: 'billing:rates',
    REPORTS: 'billing:reports',
    EXPORT: 'billing:export',
  },

  // Time Entry Permissions
  TIME_ENTRIES: {
    CREATE: 'timeEntries:create',
    READ: 'timeEntries:read',
    READ_OWN: 'timeEntries:read:own',
    READ_ALL: 'timeEntries:read:all',
    UPDATE: 'timeEntries:update',
    UPDATE_OWN: 'timeEntries:update:own',
    DELETE: 'timeEntries:delete',
    DELETE_OWN: 'timeEntries:delete:own',
    APPROVE: 'timeEntries:approve',
    EXPORT: 'timeEntries:export',
  },

  // Client Management Permissions
  CLIENTS: {
    CREATE: 'clients:create',
    READ: 'clients:read',
    READ_OWN: 'clients:read:own',
    READ_ALL: 'clients:read:all',
    UPDATE: 'clients:update',
    UPDATE_OWN: 'clients:update:own',
    DELETE: 'clients:delete',
    ASSIGN: 'clients:assign',
    CONTACT: 'clients:contact',
    EXPORT: 'clients:export',
  },

  // User Management Permissions
  USERS: {
    CREATE: 'users:create',
    READ: 'users:read',
    READ_ALL: 'users:read:all',
    UPDATE: 'users:update',
    DELETE: 'users:delete',
    INVITE: 'users:invite',
    ACTIVATE: 'users:activate',
    DEACTIVATE: 'users:deactivate',
    RESET_PASSWORD: 'users:resetPassword',
    IMPERSONATE: 'users:impersonate',
    MANAGE_ROLES: 'users:manageRoles',
    MANAGE_PERMISSIONS: 'users:managePermissions',
  },

  // Discovery & E-Discovery Permissions
  DISCOVERY: {
    CREATE: 'discovery:create',
    READ: 'discovery:read',
    READ_ALL: 'discovery:read:all',
    UPDATE: 'discovery:update',
    DELETE: 'discovery:delete',
    REVIEW: 'discovery:review',
    PRODUCE: 'discovery:produce',
    WITHHOLD: 'discovery:withhold',
    EXPORT: 'discovery:export',
  },

  // Evidence Management Permissions
  EVIDENCE: {
    CREATE: 'evidence:create',
    READ: 'evidence:read',
    READ_ALL: 'evidence:read:all',
    UPDATE: 'evidence:update',
    DELETE: 'evidence:delete',
    TAG: 'evidence:tag',
    CHAIN_OF_CUSTODY: 'evidence:chainOfCustody',
    EXPORT: 'evidence:export',
  },

  // Communications Permissions
  COMMUNICATIONS: {
    CREATE: 'communications:create',
    READ: 'communications:read',
    READ_OWN: 'communications:read:own',
    READ_ALL: 'communications:read:all',
    UPDATE: 'communications:update',
    DELETE: 'communications:delete',
    SEND: 'communications:send',
    PRIVILEGED: 'communications:privileged',
    EXPORT: 'communications:export',
  },

  // Compliance & Audit Permissions
  COMPLIANCE: {
    CREATE: 'compliance:create',
    READ: 'compliance:read',
    READ_ALL: 'compliance:read:all',
    UPDATE: 'compliance:update',
    DELETE: 'compliance:delete',
    AUDIT: 'compliance:audit',
    REPORTS: 'compliance:reports',
    EXPORT: 'compliance:export',
  },

  // Reports & Analytics Permissions
  REPORTS: {
    CREATE: 'reports:create',
    READ: 'reports:read',
    READ_OWN: 'reports:read:own',
    READ_ALL: 'reports:read:all',
    UPDATE: 'reports:update',
    DELETE: 'reports:delete',
    SCHEDULE: 'reports:schedule',
    EXPORT: 'reports:export',
    ANALYTICS: 'reports:analytics',
  },

  // Organization Management Permissions
  ORGANIZATIONS: {
    CREATE: 'organizations:create',
    READ: 'organizations:read',
    READ_ALL: 'organizations:read:all',
    UPDATE: 'organizations:update',
    DELETE: 'organizations:delete',
    SETTINGS: 'organizations:settings',
    BILLING: 'organizations:billing',
  },

  // Matter Management Permissions
  MATTERS: {
    CREATE: 'matters:create',
    READ: 'matters:read',
    READ_OWN: 'matters:read:own',
    READ_ALL: 'matters:read:all',
    UPDATE: 'matters:update',
    UPDATE_OWN: 'matters:update:own',
    DELETE: 'matters:delete',
    CLOSE: 'matters:close',
    ARCHIVE: 'matters:archive',
    EXPORT: 'matters:export',
  },

  // Task Management Permissions
  TASKS: {
    CREATE: 'tasks:create',
    READ: 'tasks:read',
    READ_OWN: 'tasks:read:own',
    READ_ALL: 'tasks:read:all',
    UPDATE: 'tasks:update',
    UPDATE_OWN: 'tasks:update:own',
    DELETE: 'tasks:delete',
    DELETE_OWN: 'tasks:delete:own',
    ASSIGN: 'tasks:assign',
    COMPLETE: 'tasks:complete',
  },

  // Calendar & Scheduling Permissions
  CALENDAR: {
    CREATE: 'calendar:create',
    READ: 'calendar:read',
    READ_OWN: 'calendar:read:own',
    READ_ALL: 'calendar:read:all',
    UPDATE: 'calendar:update',
    UPDATE_OWN: 'calendar:update:own',
    DELETE: 'calendar:delete',
    DELETE_OWN: 'calendar:delete:own',
  },

  // Docket Management Permissions
  DOCKET: {
    CREATE: 'docket:create',
    READ: 'docket:read',
    READ_ALL: 'docket:read:all',
    UPDATE: 'docket:update',
    DELETE: 'docket:delete',
    SYNC: 'docket:sync',
    EXPORT: 'docket:export',
  },

  // Parties Management Permissions
  PARTIES: {
    CREATE: 'parties:create',
    READ: 'parties:read',
    READ_ALL: 'parties:read:all',
    UPDATE: 'parties:update',
    DELETE: 'parties:delete',
    EXPORT: 'parties:export',
  },

  // Motions & Pleadings Permissions
  MOTIONS: {
    CREATE: 'motions:create',
    READ: 'motions:read',
    READ_ALL: 'motions:read:all',
    UPDATE: 'motions:update',
    DELETE: 'motions:delete',
    FILE: 'motions:file',
    EXPORT: 'motions:export',
  },

  // Trial Preparation Permissions
  TRIAL: {
    CREATE: 'trial:create',
    READ: 'trial:read',
    READ_ALL: 'trial:read:all',
    UPDATE: 'trial:update',
    DELETE: 'trial:delete',
    MANAGE_EXHIBITS: 'trial:manageExhibits',
    MANAGE_WITNESSES: 'trial:manageWitnesses',
    EXPORT: 'trial:export',
  },

  // Knowledge Management Permissions
  KNOWLEDGE: {
    CREATE: 'knowledge:create',
    READ: 'knowledge:read',
    READ_ALL: 'knowledge:read:all',
    UPDATE: 'knowledge:update',
    DELETE: 'knowledge:delete',
    PUBLISH: 'knowledge:publish',
    EXPORT: 'knowledge:export',
  },

  // Integration Permissions
  INTEGRATIONS: {
    CREATE: 'integrations:create',
    READ: 'integrations:read',
    UPDATE: 'integrations:update',
    DELETE: 'integrations:delete',
    CONFIGURE: 'integrations:configure',
    EXECUTE: 'integrations:execute',
  },

  // API Key Permissions
  API_KEYS: {
    CREATE: 'apiKeys:create',
    READ: 'apiKeys:read',
    READ_ALL: 'apiKeys:read:all',
    UPDATE: 'apiKeys:update',
    DELETE: 'apiKeys:delete',
    ROTATE: 'apiKeys:rotate',
  },

  // Workflow Permissions
  WORKFLOWS: {
    CREATE: 'workflows:create',
    READ: 'workflows:read',
    READ_ALL: 'workflows:read:all',
    UPDATE: 'workflows:update',
    DELETE: 'workflows:delete',
    EXECUTE: 'workflows:execute',
    MANAGE: 'workflows:manage',
  },

  // Risk Management Permissions
  RISKS: {
    CREATE: 'risks:create',
    READ: 'risks:read',
    READ_ALL: 'risks:read:all',
    UPDATE: 'risks:update',
    DELETE: 'risks:delete',
    ASSESS: 'risks:assess',
    MITIGATE: 'risks:mitigate',
    EXPORT: 'risks:export',
  },

  // HR & Personnel Permissions
  HR: {
    CREATE: 'hr:create',
    READ: 'hr:read',
    READ_ALL: 'hr:read:all',
    UPDATE: 'hr:update',
    DELETE: 'hr:delete',
    PAYROLL: 'hr:payroll',
    BENEFITS: 'hr:benefits',
    PERFORMANCE: 'hr:performance',
    EXPORT: 'hr:export',
  },

  // System Administration Permissions
  SYSTEM: {
    SETTINGS: 'system:settings',
    AUDIT_LOG: 'system:auditLog',
    BACKUP: 'system:backup',
    RESTORE: 'system:restore',
    MAINTENANCE: 'system:maintenance',
    MONITORING: 'system:monitoring',
    SECURITY: 'system:security',
  },
} as const;

/**
 * Flattened array of all permissions for easy iteration
 */
export const ALL_PERMISSIONS = Object.values(PERMISSIONS).flatMap(module =>
  Object.values(module)
) as string[];

/**
 * Permission resource mapping for resource-level authorization
 */
export const PERMISSION_RESOURCES = {
  cases: PERMISSIONS.CASES,
  documents: PERMISSIONS.DOCUMENTS,
  billing: PERMISSIONS.BILLING,
  timeEntries: PERMISSIONS.TIME_ENTRIES,
  clients: PERMISSIONS.CLIENTS,
  users: PERMISSIONS.USERS,
  discovery: PERMISSIONS.DISCOVERY,
  evidence: PERMISSIONS.EVIDENCE,
  communications: PERMISSIONS.COMMUNICATIONS,
  compliance: PERMISSIONS.COMPLIANCE,
  reports: PERMISSIONS.REPORTS,
  organizations: PERMISSIONS.ORGANIZATIONS,
  matters: PERMISSIONS.MATTERS,
  tasks: PERMISSIONS.TASKS,
  calendar: PERMISSIONS.CALENDAR,
  docket: PERMISSIONS.DOCKET,
  parties: PERMISSIONS.PARTIES,
  motions: PERMISSIONS.MOTIONS,
  trial: PERMISSIONS.TRIAL,
  knowledge: PERMISSIONS.KNOWLEDGE,
  integrations: PERMISSIONS.INTEGRATIONS,
  apiKeys: PERMISSIONS.API_KEYS,
  workflows: PERMISSIONS.WORKFLOWS,
  risks: PERMISSIONS.RISKS,
  hr: PERMISSIONS.HR,
  system: PERMISSIONS.SYSTEM,
} as const;

/**
 * Helper function to get all permissions for a specific resource
 */
export function getResourcePermissions(resource: keyof typeof PERMISSION_RESOURCES): string[] {
  return Object.values(PERMISSION_RESOURCES[resource]) as string[];
}

/**
 * Helper function to check if a permission string is valid
 */
export function isValidPermission(permission: string): boolean {
  return ALL_PERMISSIONS.includes(permission);
}

/**
 * Extract resource type from permission string
 * Example: 'cases:read:own' => 'cases'
 */
export function extractResourceFromPermission(permission: string): string {
  return permission.split(':')[0] ?? '';
}

/**
 * Extract action from permission string
 * Example: 'cases:read:own' => 'read'
 */
export function extractActionFromPermission(permission: string): string {
  const parts = permission.split(':');
  return parts[1] || '';
}

/**
 * Extract scope from permission string
 * Example: 'cases:read:own' => 'own'
 */
export function extractScopeFromPermission(permission: string): string | undefined {
  const parts = permission.split(':');
  return parts[2];
}
