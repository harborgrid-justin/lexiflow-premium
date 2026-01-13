# LexiFlow Premium Authorization System

Enterprise-grade authorization and role-based access control (RBAC) system for LexiFlow Premium legal application.

## Overview

This authorization system provides:

- **Fine-grained permissions** - Resource-level and action-level permission checking
- **Role-based access control (RBAC)** - Comprehensive role and permission mappings
- **Attribute-based access control (ABAC)** - Policy-based authorization with context awareness
- **Ownership validation** - Resource ownership and delegation support
- **Multi-tenant isolation** - Organization-level access control
- **Time-based restrictions** - Temporal access control
- **Location-based restrictions** - Geographic access control
- **Performance caching** - Built-in permission caching for optimal performance
- **Audit trail** - Full audit logging for permission grants and revocations

## Architecture

### Core Components

1. **PermissionService** - Fine-grained permission checking with caching
2. **PolicyService** - ABAC policy evaluation engine
3. **ResourceAccessGuard** - NestJS guard for resource-level authorization
4. **Permission decorators** - TypeScript decorators for declarative authorization
5. **Permission entities** - TypeORM entities for permission persistence

## Directory Structure

```
authorization/
├── constants/
│   └── permissions.constant.ts    # All system permissions
├── decorators/
│   └── permissions.decorator.ts   # Authorization decorators
├── entities/
│   ├── permission.entity.ts       # Permission definitions
│   └── role.permission.entity.ts  # Role-permission mappings
├── guards/
│   └── resource.access.guard.ts   # Resource access guard
├── services/
│   ├── permission.service.ts      # Permission service
│   └── policy.service.ts          # Policy service
├── examples/
│   └── usage.example.ts           # Usage examples
├── authorization.module.ts        # Main module
└── index.ts                       # Exports
```

## Installation

1. Import `AuthorizationModule` in your `AppModule`:

```typescript
import { AuthorizationModule } from './authorization';

@Module({
  imports: [
    // ... other imports
    AuthorizationModule,
  ],
})
export class AppModule {}
```

2. The module is marked as `@Global()`, so services are available throughout the application.

## Usage

### Basic Permission Checking

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ResourceAccessGuard } from '../authorization/guards/resource.access.guard';
import { RequirePermissions } from '../authorization/decorators/permissions.decorator';
import { PERMISSIONS } from '../authorization/constants/permissions.constant';

@Controller('cases')
@UseGuards(JwtAuthGuard, ResourceAccessGuard)
export class CasesController {
  @Get()
  @RequirePermissions(PERMISSIONS.CASES.READ)
  async findAll() {
    return { cases: [] };
  }
}
```

### Multiple Permissions (ALL)

```typescript
@Post()
@RequireAllPermissions(
  PERMISSIONS.CASES.CREATE,
  PERMISSIONS.CASES.ASSIGN
)
async create(@Body() createDto: CreateCaseDto) {
  // User must have BOTH permissions
}
```

### Multiple Permissions (ANY)

```typescript
@Get(':id')
@RequireAnyPermission(
  PERMISSIONS.CASES.READ_OWN,
  PERMISSIONS.CASES.READ_ALL
)
async findOne(@Param('id') id: string) {
  // User needs at least ONE permission
}
```

### Ownership Validation

```typescript
@Put(':id')
@RequirePermissions(PERMISSIONS.CASES.UPDATE)
@RequireOwnership({ field: 'createdBy', allowDelegation: true })
@ResourceType('cases')
async update(@Param('id') id: string, @Body() updateDto: UpdateCaseDto) {
  // User must be the owner or have delegation
}
```

### Policy-Based Access

```typescript
@Delete(':id')
@RequirePermissions(PERMISSIONS.CASES.DELETE)
@PermissionPolicy('sensitive-data-access', { requireMfa: true })
@ResourceType('cases')
async remove(@Param('id') id: string) {
  // Evaluated against ABAC policy
}
```

### Complex Permission Rules

```typescript
@Post(':id/close')
@PermissionRules({
  anyOf: [PERMISSIONS.CASES.CLOSE, PERMISSIONS.CASES.UPDATE],
  requireOwnership: { field: 'createdBy', allowTeamMembers: true },
  resourceType: 'cases',
  policy: { name: 'standard-access' },
})
async closeCase(@Param('id') id: string) {
  // Combines multiple authorization requirements
}
```

## Decorators

### @RequirePermissions(...permissions)
Require all specified permissions.

### @RequireAllPermissions(...permissions)
Require all specified permissions (explicit).

### @RequireAnyPermission(...permissions)
Require at least one of the specified permissions.

### @RequireOwnership(options?)
Require user to be the owner of the resource.

Options:
- `field`: Field containing owner ID (default: 'createdBy')
- `allowDelegation`: Allow delegated access (default: false)
- `allowTeamMembers`: Allow team members (default: false)

### @RequireDelegation()
Require delegation to access the resource.

### @PermissionPolicy(name, config?)
Apply ABAC policy to the endpoint.

### @ResourceType(type)
Specify the resource type for the endpoint.

### @BypassPermissionCheck()
Bypass permission checks (use with caution).

### @PermissionRules(rules)
Combine multiple permission rules.

## Permission System

### Permission Structure

Permissions follow the format: `resource:action:scope`

Examples:
- `cases:read` - Read cases
- `cases:read:own` - Read own cases
- `cases:read:all` - Read all cases
- `documents:update` - Update documents
- `billing:approve` - Approve billing

### Available Permissions

All permissions are defined in `constants/permissions.constant.ts`:

- **Cases**: create, read, update, delete, assign, close, archive, export
- **Documents**: create, read, update, delete, upload, download, share, version, sign, redact
- **Billing**: create, read, update, approve, invoice, payment, refund, rates, reports
- **Users**: create, read, update, delete, invite, activate, manage roles/permissions
- **Discovery**: create, read, update, delete, review, produce, withhold
- **Evidence**: create, read, update, delete, tag, chain of custody
- **Communications**: create, read, update, delete, send, privileged
- **Compliance**: create, read, update, audit, reports
- **Reports**: create, read, update, delete, schedule, analytics
- And many more...

## Policy System (ABAC)

### Built-in Policies

1. **standard-access** - Default access for standard users
2. **sensitive-data-access** - Sensitive data with MFA requirement
3. **client-data-access** - Client users accessing their own data
4. **business-hours-only** - Restrict to business hours
5. **geo-restricted** - Geographic restrictions
6. **admin-override** - Admin override policy

### Creating Custom Policies

```typescript
import { Injectable } from '@nestjs/common';
import { PolicyService, Policy, PolicyEffect, ConditionType, ConditionOperator } from '../authorization';

@Injectable()
export class CustomPolicyService {
  constructor(private readonly policyService: PolicyService) {
    this.registerCustomPolicies();
  }

  private registerCustomPolicies(): void {
    const policy: Policy = {
      id: 'custom-access',
      name: 'Custom Access Policy',
      description: 'Custom policy for specific use case',
      effect: PolicyEffect.ALLOW,
      priority: 200,
      conditions: [
        {
          type: ConditionType.USER_ATTRIBUTE,
          operator: ConditionOperator.EQUALS,
          attribute: 'department',
          value: 'legal',
        },
        {
          type: ConditionType.TIME_BASED,
          operator: ConditionOperator.BETWEEN,
          attribute: 'hour',
          value: [9, 17],
        },
      ],
      metadata: {
        requiresMfa: true,
      },
    };

    this.policyService.registerPolicy(policy);
  }
}
```

## Service-Level Usage

### Programmatic Permission Checking

```typescript
import { Injectable } from '@nestjs/common';
import { PermissionService } from '../authorization';
import { PERMISSIONS } from '../authorization/constants/permissions.constant';

@Injectable()
export class CasesService {
  constructor(private readonly permissionService: PermissionService) {}

  async canUserAccessCase(userId: string, userRole: UserRole, caseId: string): Promise<boolean> {
    return this.permissionService.hasPermission(
      PERMISSIONS.CASES.READ,
      {
        userId,
        userRole,
        resourceId: caseId,
        timestamp: new Date(),
      }
    );
  }
}
```

### Get User Permissions

```typescript
async getUserPermissions(userId: string, userRole: UserRole): Promise<string[]> {
  return this.permissionService.getUserPermissions(userId, userRole, true);
}
```

### Grant/Revoke Permissions

```typescript
// Grant permission
await this.permissionService.grantPermissionToRole(
  UserRole.ATTORNEY,
  PERMISSIONS.CASES.CREATE,
  adminUserId,
  { requiresMfa: false, isActive: true }
);

// Revoke permission
await this.permissionService.revokePermissionFromRole(
  UserRole.ATTORNEY,
  PERMISSIONS.CASES.DELETE,
  adminUserId
);
```

## Database Schema

### Permissions Table

```sql
CREATE TABLE permissions (
  id UUID PRIMARY KEY,
  code VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  resource VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  scope VARCHAR(20) DEFAULT 'global',
  status VARCHAR(20) DEFAULT 'active',
  is_system BOOLEAN DEFAULT false,
  requires_ownership BOOLEAN DEFAULT false,
  requires_delegation BOOLEAN DEFAULT false,
  parent_permission_id UUID,
  child_permissions TEXT[],
  constraints JSONB,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);
```

### Role Permissions Table

```sql
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY,
  role VARCHAR(50) NOT NULL,
  permission_id UUID NOT NULL REFERENCES permissions(id),
  grant_type VARCHAR(20) DEFAULT 'allow',
  inheritance_type VARCHAR(20) DEFAULT 'direct',
  effective_from TIMESTAMP,
  effective_to TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  conditions JSONB,
  overrides JSONB,
  requires_mfa BOOLEAN DEFAULT false,
  requires_approval BOOLEAN DEFAULT false,
  audit_required BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 0,
  granted_by UUID,
  revoked_by UUID,
  revoked_at TIMESTAMP,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Multi-Tenant Isolation

The system automatically enforces multi-tenant isolation:

```typescript
// Automatically checks if user.organizationId === resource.organizationId
// Admins can override this check
```

## Performance & Caching

- Permission lookups are cached in-memory
- Role permissions are cached per role
- User permissions are cached per user
- Caches automatically expire after 5 minutes
- Manual cache clearing available via `permissionService.clearCaches()`

## Security Best Practices

1. **Always use guards** - Apply `ResourceAccessGuard` to protected routes
2. **Principle of least privilege** - Grant minimum required permissions
3. **Audit critical operations** - Enable `auditRequired` for sensitive permissions
4. **MFA for sensitive data** - Use `requiresMfa` metadata
5. **Time-based restrictions** - Apply temporal constraints where needed
6. **Location restrictions** - Use geographic constraints for compliance
7. **Regular permission audits** - Review and update permissions regularly

## Migration Guide

To migrate existing role-based checks to the new system:

### Before:
```typescript
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN, UserRole.PARTNER)
@Get()
async findAll() {}
```

### After:
```typescript
@UseGuards(JwtAuthGuard, ResourceAccessGuard)
@RequireAnyPermission(PERMISSIONS.CASES.READ, PERMISSIONS.CASES.READ_ALL)
@Get()
async findAll() {}
```

## Troubleshooting

### Permission Denied

1. Check user has required role
2. Verify permission is granted to role in database
3. Check permission is active (not revoked)
4. Verify time/location restrictions
5. Check policy evaluation results
6. Review audit logs

### Cache Issues

Clear caches manually:
```typescript
this.permissionService.clearCaches();
```

## Examples

See `examples/usage.example.ts` for comprehensive usage examples covering:
- Basic permission checking
- Multiple permissions (ALL/ANY)
- Ownership validation
- Policy-based access
- Service-level usage
- Permission management

## Support

For questions or issues, contact the LexiFlow Premium development team.

## License

Proprietary - LexiFlow Premium Enterprise Edition
