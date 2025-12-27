import { applyDecorators, UseGuards, UseInterceptors, SetMetadata } from '@nestjs/common';
import { ApiTags, ApiSecurity, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { AuditLogInterceptor } from '../../compliance/audit-logs/audit-log.interceptor';
import { PerformanceInterceptor } from '../../monitoring/interceptors/performance.interceptor';

/**
 * Metadata keys for enterprise decorators
 */
export const ROLES_KEY = 'roles';
export const PERMISSIONS_KEY = 'permissions';
export const AUDIT_KEY = 'audit';
export const PERFORMANCE_TRACK_KEY = 'performanceTrack';
export const PUBLIC_KEY = 'isPublic';

/**
 * Enterprise Controller Decorator
 * Applies all standard security, monitoring, and documentation decorators
 *
 * @param tag - Swagger API tag for grouping endpoints
 * @param options - Additional options
 */
export function EnterpriseController(
  tag?: string,
  options?: {
    requireAuth?: boolean;
    apiSecurity?: boolean;
  }
) {
  const requireAuth = options?.requireAuth !== false;
  const apiSecurity = options?.apiSecurity !== false;

  const decorators = [
    ApiTags(tag || 'Enterprise'),
  ];

  if (requireAuth && apiSecurity) {
    decorators.push(
      ApiBearerAuth(),
      ApiSecurity('api-key'),
    );
  }

  return applyDecorators(...decorators);
}

/**
 * Enterprise Method Decorator
 * Applies logging, auditing, performance tracking to individual methods
 *
 * @param options - Configuration options
 */
export function EnterpriseMethod(options?: {
  audit?: boolean;
  performanceTrack?: boolean;
  roles?: string[];
  permissions?: string[];
  summary?: string;
}) {
  const audit = options?.audit !== false;
  const performanceTrack = options?.performanceTrack !== false;

  const decorators = [];

  // Add audit logging
  if (audit) {
    decorators.push(
      UseInterceptors(AuditLogInterceptor),
      SetMetadata(AUDIT_KEY, true),
    );
  }

  // Add performance tracking
  if (performanceTrack) {
    decorators.push(
      UseInterceptors(PerformanceInterceptor),
      SetMetadata(PERFORMANCE_TRACK_KEY, true),
    );
  }

  // Add role-based access control
  if (options?.roles && options.roles.length > 0) {
    decorators.push(
      UseGuards(RolesGuard),
      SetMetadata(ROLES_KEY, options.roles),
    );
  }

  // Add permission-based access control
  if (options?.permissions && options.permissions.length > 0) {
    decorators.push(
      UseGuards(PermissionsGuard),
      SetMetadata(PERMISSIONS_KEY, options.permissions),
    );
  }

  // Add API documentation
  if (options?.summary) {
    decorators.push(
      ApiOperation({ summary: options.summary }),
    );
  }

  return applyDecorators(...decorators);
}

/**
 * Secured Endpoint Decorator
 * Combines authentication, authorization, audit, and performance tracking
 *
 * @param roles - Required roles for access
 * @param permissions - Required permissions for access
 */
export function SecuredEndpoint(
  roles?: string[],
  permissions?: string[],
) {
  const decorators = [
    UseGuards(JwtAuthGuard),
    UseInterceptors(AuditLogInterceptor, PerformanceInterceptor),
  ];

  if (roles && roles.length > 0) {
    decorators.push(
      UseGuards(RolesGuard),
      SetMetadata(ROLES_KEY, roles),
    );
  }

  if (permissions && permissions.length > 0) {
    decorators.push(
      UseGuards(PermissionsGuard),
      SetMetadata(PERMISSIONS_KEY, permissions),
    );
  }

  return applyDecorators(...decorators);
}

/**
 * Public Endpoint Decorator
 * Marks an endpoint as public (no authentication required)
 * Still includes audit logging and performance tracking
 */
export function PublicEndpoint(options?: {
  audit?: boolean;
  performanceTrack?: boolean;
}) {
  const audit = options?.audit !== false;
  const performanceTrack = options?.performanceTrack !== false;

  const decorators = [
    SetMetadata(PUBLIC_KEY, true),
  ];

  if (audit) {
    decorators.push(UseInterceptors(AuditLogInterceptor));
  }

  if (performanceTrack) {
    decorators.push(UseInterceptors(PerformanceInterceptor));
  }

  return applyDecorators(...decorators);
}

/**
 * Admin Only Decorator
 * Restricts endpoint to admin users only
 */
export function AdminOnly() {
  return applyDecorators(
    UseGuards(JwtAuthGuard, RolesGuard),
    SetMetadata(ROLES_KEY, ['admin', 'superadmin']),
    UseInterceptors(AuditLogInterceptor, PerformanceInterceptor),
    ApiOperation({ summary: 'Admin only endpoint' }),
  );
}

/**
 * Audited Endpoint Decorator
 * Ensures all actions are logged in the audit trail
 */
export function AuditedEndpoint(action?: string) {
  const metadata: any = { enabled: true };
  if (action) {
    metadata.action = action;
  }

  return applyDecorators(
    UseInterceptors(AuditLogInterceptor),
    SetMetadata(AUDIT_KEY, metadata),
  );
}

/**
 * Performance Tracked Decorator
 * Tracks performance metrics for the endpoint
 */
export function PerformanceTracked(threshold?: number) {
  const metadata: any = { enabled: true };
  if (threshold) {
    metadata.threshold = threshold;
  }

  return applyDecorators(
    UseInterceptors(PerformanceInterceptor),
    SetMetadata(PERFORMANCE_TRACK_KEY, metadata),
  );
}

/**
 * Requires Roles Decorator
 * Shorthand for setting required roles
 */
export function RequiresRoles(...roles: string[]) {
  return applyDecorators(
    UseGuards(RolesGuard),
    SetMetadata(ROLES_KEY, roles),
  );
}

/**
 * Requires Permissions Decorator
 * Shorthand for setting required permissions
 */
export function RequiresPermissions(...permissions: string[]) {
  return applyDecorators(
    UseGuards(PermissionsGuard),
    SetMetadata(PERMISSIONS_KEY, permissions),
  );
}

/**
 * High Value Operation Decorator
 * For critical operations that require maximum security and monitoring
 * Combines all security features: auth, roles, permissions, audit, performance tracking
 */
export function HighValueOperation(options: {
  roles?: string[];
  permissions?: string[];
  action: string;
  performanceThreshold?: number;
}) {
  const decorators = [
    UseGuards(JwtAuthGuard),
    UseInterceptors(AuditLogInterceptor, PerformanceInterceptor),
    SetMetadata(AUDIT_KEY, { enabled: true, action: options.action }),
    SetMetadata(PERFORMANCE_TRACK_KEY, {
      enabled: true,
      threshold: options.performanceThreshold || 1000,
    }),
  ];

  if (options.roles && options.roles.length > 0) {
    decorators.push(
      UseGuards(RolesGuard),
      SetMetadata(ROLES_KEY, options.roles),
    );
  }

  if (options.permissions && options.permissions.length > 0) {
    decorators.push(
      UseGuards(PermissionsGuard),
      SetMetadata(PERMISSIONS_KEY, options.permissions),
    );
  }

  decorators.push(
    ApiOperation({ summary: `High value operation: ${options.action}` }),
  );

  return applyDecorators(...decorators);
}

/**
 * Compliance Required Decorator
 * For endpoints that require compliance tracking (GDPR, HIPAA, etc.)
 */
export function ComplianceRequired(complianceType?: string) {
  return applyDecorators(
    UseGuards(JwtAuthGuard),
    UseInterceptors(AuditLogInterceptor),
    SetMetadata(AUDIT_KEY, {
      enabled: true,
      compliance: complianceType || 'general',
    }),
    ApiOperation({ summary: `Compliance required: ${complianceType || 'general'}` }),
  );
}

/**
 * Data Access Decorator
 * For endpoints that access sensitive data
 */
export function SensitiveDataAccess(dataType: string) {
  return applyDecorators(
    UseGuards(JwtAuthGuard, PermissionsGuard),
    UseInterceptors(AuditLogInterceptor, PerformanceInterceptor),
    SetMetadata(AUDIT_KEY, {
      enabled: true,
      dataType,
      sensitive: true,
    }),
    ApiOperation({ summary: `Sensitive data access: ${dataType}` }),
  );
}

/**
 * Batch Operation Decorator
 * For endpoints that perform batch operations
 */
export function BatchOperation(options?: {
  maxBatchSize?: number;
  performanceThreshold?: number;
}) {
  return applyDecorators(
    UseGuards(JwtAuthGuard),
    UseInterceptors(AuditLogInterceptor, PerformanceInterceptor),
    SetMetadata(PERFORMANCE_TRACK_KEY, {
      enabled: true,
      threshold: options?.performanceThreshold || 5000,
      batch: true,
      maxBatchSize: options?.maxBatchSize || 1000,
    }),
    ApiOperation({ summary: 'Batch operation' }),
  );
}
