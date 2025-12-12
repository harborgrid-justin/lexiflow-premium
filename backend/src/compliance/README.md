# LexiFlow Enterprise - Compliance & Audit Module

## Overview
The Compliance & Audit Module provides comprehensive compliance, security, and audit capabilities for the LexiFlow Enterprise Backend. This module is essential for legal practice management, ensuring ethical compliance, conflict checking, access control, and detailed audit trails.

## Module Architecture

```
compliance/
├── audit-logs/           # Audit logging system
├── conflict-checks/      # Conflict of interest checking
├── ethical-walls/        # Ethical wall management
├── rls-policies/        # Row-Level Security policies
├── permissions/         # Granular permissions system
├── reporting/           # Compliance reporting
└── compliance.module.ts # Main module
```

## Features

### 1. Audit Logging System
- **Automatic audit trail** for all system activities
- **Immutable audit logs** with comprehensive metadata
- **Entity tracking** for Cases, Documents, Time Entries, Invoices, etc.
- **Action tracking**: CREATE, READ, UPDATE, DELETE, LOGIN, LOGOUT, EXPORT, APPROVE, REJECT, FILE, SEND
- **Audit log interceptor** for automatic logging
- **Export capabilities** (CSV, JSON, PDF)

### 2. Conflict Check System
- **Multiple conflict types**:
  - Client vs Client
  - Client vs Opposing Party
  - Matter Overlap
  - Prior Representation
- **Advanced name matching** using Levenshtein distance
- **Soundex phonetic matching** for similar names
- **Conflict resolution tracking**
- **Waiver management** with approval workflow
- **Severity levels**: low, medium, high, critical

### 3. Ethical Walls Management
- **User restriction** based on entity access
- **Entity-based walls** (Cases, Clients, Documents, Matters)
- **Automatic enforcement** via guard
- **Expiration support**
- **Wall status tracking**: ACTIVE, INACTIVE, EXPIRED
- **Real-time access blocking**

### 4. Row-Level Security (RLS) Policies
- **Table-level policies** for data access
- **Operation-based rules**: SELECT, INSERT, UPDATE, DELETE, ALL
- **Role-based policies**
- **Dynamic condition evaluation**
- **Priority-based policy application**
- **Context interpolation** with variable substitution

### 5. Granular Permissions System
- **Fine-grained access control**
- **Action-based permissions**: CREATE, READ, UPDATE, DELETE, APPROVE, EXPORT, SHARE, ASSIGN
- **Scope levels**: GLOBAL, ORGANIZATION, TEAM, PERSONAL, SPECIFIC
- **Conditional permissions** with operators
- **Access matrix generation**
- **Permission expiration support**

### 6. Compliance Reporting
- **Access Reports**: Track access attempts, success/failure rates
- **Activity Reports**: Monitor user activities, entity changes
- **Conflicts Reports**: Analyze conflict checks and resolutions
- **Ethical Walls Reports**: Track wall effectiveness and coverage
- **Timeline visualization**
- **Metrics and KPIs**

## REST API Endpoints

### Audit Logs
```
GET    /api/v1/audit-logs                          - List audit logs with filtering
GET    /api/v1/audit-logs/:id                      - Get audit log entry
GET    /api/v1/audit-logs/entity/:entityType/:entityId - Get by entity
GET    /api/v1/audit-logs/user/:userId             - Get by user
GET    /api/v1/audit-logs/export                   - Export audit logs
```

### Conflict Checks
```
GET    /api/v1/compliance/conflicts                - List conflict checks
POST   /api/v1/compliance/conflicts/check          - Run conflict check
GET    /api/v1/compliance/conflicts/:id            - Get conflict check result
POST   /api/v1/compliance/conflicts/:id/resolve    - Resolve conflict
POST   /api/v1/compliance/conflicts/:id/waive      - Waive conflict
```

### Ethical Walls
```
GET    /api/v1/compliance/ethical-walls            - List ethical walls
POST   /api/v1/compliance/ethical-walls            - Create ethical wall
GET    /api/v1/compliance/ethical-walls/:id        - Get ethical wall
PUT    /api/v1/compliance/ethical-walls/:id        - Update ethical wall
DELETE /api/v1/compliance/ethical-walls/:id        - Delete ethical wall
GET    /api/v1/compliance/ethical-walls/user/:userId - Check walls for user
```

### RLS Policies
```
GET    /api/v1/security/rls-policies               - List RLS policies
POST   /api/v1/security/rls-policies               - Create RLS policy
PUT    /api/v1/security/rls-policies/:id           - Update RLS policy
DELETE /api/v1/security/rls-policies/:id           - Delete RLS policy
```

### Permissions
```
GET    /api/v1/security/permissions                - List permissions
POST   /api/v1/security/permissions                - Grant permission
DELETE /api/v1/security/permissions/:id            - Revoke permission
POST   /api/v1/security/check-access               - Check specific access
POST   /api/v1/security/permissions/access-matrix  - Get access matrix
```

### Compliance Reporting
```
GET    /api/v1/compliance/reports/access           - Generate access report
GET    /api/v1/compliance/reports/activity         - Generate activity report
GET    /api/v1/compliance/reports/conflicts        - Generate conflicts report
GET    /api/v1/compliance/reports/ethical-walls    - Generate ethical walls report
```

## Usage Examples

### 1. Automatic Audit Logging
```typescript
// Apply the AuditLogInterceptor globally
app.useGlobalInterceptors(new AuditLogInterceptor(auditLogsService));

// Or use it on specific controllers/routes
@UseInterceptors(AuditLogInterceptor)
@Controller('cases')
export class CasesController { }
```

### 2. Run Conflict Check
```typescript
POST /api/v1/compliance/conflicts/check
{
  "requestedBy": "user123",
  "requestedByName": "John Attorney",
  "checkType": "CLIENT_VS_CLIENT",
  "targetName": "Jane Smith",
  "organizationId": "org123"
}
```

### 3. Create Ethical Wall
```typescript
POST /api/v1/compliance/ethical-walls
{
  "name": "Case XYZ Ethical Wall",
  "description": "Prevents conflicts in Case XYZ",
  "restrictedUsers": ["user1", "user2"],
  "restrictedEntities": [
    {
      "entityType": "Case",
      "entityId": "case123",
      "entityName": "Smith v. Johnson"
    }
  ],
  "reason": "Prior representation conflict",
  "createdBy": "admin123",
  "createdByName": "Admin User",
  "organizationId": "org123"
}
```

### 4. Enforce Ethical Walls
```typescript
// Apply the EthicalWallGuard
@UseGuards(JwtAuthGuard, EthicalWallGuard)
@Controller('cases')
export class CasesController { }
```

### 5. Grant Permission
```typescript
POST /api/v1/security/permissions
{
  "userId": "user123",
  "userName": "John Attorney",
  "role": "attorney",
  "resource": "Case",
  "actions": ["READ", "UPDATE"],
  "scope": "SPECIFIC",
  "resourceId": "case123",
  "grantedBy": "admin123",
  "grantedByName": "Admin User",
  "organizationId": "org123"
}
```

### 6. Check Access
```typescript
POST /api/v1/security/check-access
{
  "userId": "user123",
  "resource": "Case",
  "resourceId": "case123",
  "action": "UPDATE"
}
```

## Data Retention

Audit logs are **immutable** and should be retained according to your organization's compliance requirements. The system supports:
- Automatic log rotation
- Export for archival
- Query optimization for historical data
- Compliance with legal retention periods

## Security Considerations

1. **Audit Log Integrity**: Logs are immutable once created
2. **Access Control**: All endpoints require authentication
3. **Ethical Wall Enforcement**: Guards prevent unauthorized access
4. **Permission Validation**: Fine-grained access control
5. **Conflict Detection**: Automatic name matching and phonetic analysis

## Integration

Import the ComplianceModule into your application:

```typescript
import { Module } from '@nestjs/common';
import { ComplianceModule } from './compliance/compliance.module';

@Module({
  imports: [ComplianceModule],
})
export class AppModule {}
```

## Dependencies

- `@nestjs/common`: NestJS core framework
- `rxjs`: Reactive extensions for interceptors
- TypeScript decorators for metadata

## Future Enhancements

- [ ] Real-time conflict alerts
- [ ] AI-powered conflict prediction
- [ ] Advanced analytics dashboards
- [ ] Blockchain-based audit trail
- [ ] Integration with external compliance systems
- [ ] Automated compliance reporting to regulatory bodies

## License

Copyright © 2024 LexiFlow Enterprise. All rights reserved.
