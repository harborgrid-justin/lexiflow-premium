# Authorization System Integration Guide

## Quick Start

### Step 1: Add Authorization Module to AppModule

```typescript
// src/app.module.ts
import { AuthorizationModule } from './authorization';

@Module({
  imports: [
    // ... existing imports
    AuthorizationModule, // Add this line
  ],
})
export class AppModule {}
```

### Step 2: Run Database Migrations

The authorization system requires two new tables:

```bash
# Generate migration
npm run typeorm migration:generate -- -n CreateAuthorizationTables

# Run migration
npm run typeorm migration:run
```

Alternatively, create the migration manually:

```typescript
// src/database/migrations/XXXXXX-create-authorization-tables.ts
import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateAuthorizationTables1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create permissions table
    await queryRunner.createTable(
      new Table({
        name: 'permissions',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'code', type: 'varchar', length: '100', isUnique: true },
          { name: 'name', type: 'varchar', length: '255' },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'resource', type: 'varchar', length: '50' },
          { name: 'action', type: 'varchar', length: '50' },
          { name: 'scope', type: 'enum', enum: ['global', 'organization', 'team', 'own'], default: "'global'" },
          { name: 'status', type: 'enum', enum: ['active', 'deprecated', 'disabled'], default: "'active'" },
          { name: 'is_system', type: 'boolean', default: false },
          { name: 'requires_ownership', type: 'boolean', default: false },
          { name: 'requires_delegation', type: 'boolean', default: false },
          { name: 'parent_permission_id', type: 'uuid', isNullable: true },
          { name: 'child_permissions', type: 'text[]', default: "'{}'" },
          { name: 'constraints', type: 'jsonb', isNullable: true },
          { name: 'metadata', type: 'jsonb', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'deleted_at', type: 'timestamp', isNullable: true },
          { name: 'created_by', type: 'varchar', isNullable: true },
          { name: 'updated_by', type: 'varchar', isNullable: true },
        ],
      }),
      true
    );

    // Create role_permissions table
    await queryRunner.createTable(
      new Table({
        name: 'role_permissions',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'role', type: 'varchar', length: '50' },
          { name: 'permission_id', type: 'uuid' },
          { name: 'grant_type', type: 'enum', enum: ['allow', 'deny'], default: "'allow'" },
          { name: 'inheritance_type', type: 'enum', enum: ['direct', 'inherited', 'override'], default: "'direct'" },
          { name: 'inherited_from_role', type: 'varchar', length: '50', isNullable: true },
          { name: 'effective_from', type: 'timestamp', isNullable: true },
          { name: 'effective_to', type: 'timestamp', isNullable: true },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'conditions', type: 'jsonb', isNullable: true },
          { name: 'overrides', type: 'jsonb', isNullable: true },
          { name: 'requires_mfa', type: 'boolean', default: false },
          { name: 'requires_approval', type: 'boolean', default: false },
          { name: 'approval_roles', type: 'text[]', default: "'{}'" },
          { name: 'audit_required', type: 'boolean', default: false },
          { name: 'priority', type: 'integer', default: 0 },
          { name: 'reason', type: 'text', isNullable: true },
          { name: 'granted_by', type: 'uuid', isNullable: true },
          { name: 'revoked_by', type: 'uuid', isNullable: true },
          { name: 'revoked_at', type: 'timestamp', isNullable: true },
          { name: 'metadata', type: 'jsonb', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'deleted_at', type: 'timestamp', isNullable: true },
          { name: 'created_by', type: 'varchar', isNullable: true },
          { name: 'updated_by', type: 'varchar', isNullable: true },
        ],
      }),
      true
    );

    // Add foreign key
    await queryRunner.createForeignKey(
      'role_permissions',
      new TableForeignKey({
        columnNames: ['permission_id'],
        referencedTableName: 'permissions',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      })
    );

    // Add indexes
    await queryRunner.createIndex('permissions', new TableIndex({ columnNames: ['code'] }));
    await queryRunner.createIndex('permissions', new TableIndex({ columnNames: ['resource', 'action'] }));
    await queryRunner.createIndex('permissions', new TableIndex({ columnNames: ['scope'] }));
    await queryRunner.createIndex('permissions', new TableIndex({ columnNames: ['status'] }));

    await queryRunner.createIndex('role_permissions', new TableIndex({ columnNames: ['role', 'permission_id'] }));
    await queryRunner.createIndex('role_permissions', new TableIndex({ columnNames: ['role', 'grant_type'] }));
    await queryRunner.createIndex('role_permissions', new TableIndex({ columnNames: ['is_active'] }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('role_permissions');
    await queryRunner.dropTable('permissions');
  }
}
```

### Step 3: Seed Initial Permissions

Create a seed script to populate initial permissions:

```typescript
// src/database/seeds/permissions.seed.ts
import { DataSource } from 'typeorm';
import { Permission, PermissionStatus, PermissionScope } from '../../authorization/entities/permission.entity';
import { PERMISSIONS } from '../../authorization/constants/permissions.constant';

export async function seedPermissions(dataSource: DataSource): Promise<void> {
  const permissionRepository = dataSource.getRepository(Permission);

  const permissionsToCreate = [
    // Cases
    { code: PERMISSIONS.CASES.CREATE, name: 'Create Case', resource: 'cases', action: 'create' },
    { code: PERMISSIONS.CASES.READ, name: 'Read Case', resource: 'cases', action: 'read' },
    { code: PERMISSIONS.CASES.READ_OWN, name: 'Read Own Cases', resource: 'cases', action: 'read', scope: PermissionScope.OWN },
    { code: PERMISSIONS.CASES.READ_ALL, name: 'Read All Cases', resource: 'cases', action: 'read', scope: PermissionScope.GLOBAL },
    { code: PERMISSIONS.CASES.UPDATE, name: 'Update Case', resource: 'cases', action: 'update' },
    { code: PERMISSIONS.CASES.DELETE, name: 'Delete Case', resource: 'cases', action: 'delete' },

    // Documents
    { code: PERMISSIONS.DOCUMENTS.CREATE, name: 'Create Document', resource: 'documents', action: 'create' },
    { code: PERMISSIONS.DOCUMENTS.READ, name: 'Read Document', resource: 'documents', action: 'read' },
    { code: PERMISSIONS.DOCUMENTS.UPLOAD, name: 'Upload Document', resource: 'documents', action: 'upload' },
    { code: PERMISSIONS.DOCUMENTS.DOWNLOAD, name: 'Download Document', resource: 'documents', action: 'download' },

    // Add more permissions as needed...
  ];

  for (const permData of permissionsToCreate) {
    const existing = await permissionRepository.findOne({ where: { code: permData.code } });

    if (!existing) {
      const permission = permissionRepository.create({
        ...permData,
        status: PermissionStatus.ACTIVE,
        isSystem: true,
      });

      await permissionRepository.save(permission);
      console.log(`Created permission: ${permData.code}`);
    }
  }
}
```

### Step 4: Seed Role Permissions

Map permissions to roles:

```typescript
// src/database/seeds/role-permissions.seed.ts
import { DataSource } from 'typeorm';
import { RolePermission, GrantType } from '../../authorization/entities/role.permission.entity';
import { Permission } from '../../authorization/entities/permission.entity';
import { UserRole } from '../../users/entities/user.entity';
import { PERMISSIONS } from '../../authorization/constants/permissions.constant';

export async function seedRolePermissions(dataSource: DataSource): Promise<void> {
  const rolePermissionRepository = dataSource.getRepository(RolePermission);
  const permissionRepository = dataSource.getRepository(Permission);

  // Super Admin - All permissions
  const allPermissions = await permissionRepository.find();
  for (const permission of allPermissions) {
    await createRolePermission(
      rolePermissionRepository,
      UserRole.SUPER_ADMIN,
      permission.id,
      'system'
    );
  }

  // Partner - Most permissions
  const partnerPermissions = [
    PERMISSIONS.CASES.READ_ALL,
    PERMISSIONS.CASES.CREATE,
    PERMISSIONS.CASES.UPDATE,
    PERMISSIONS.DOCUMENTS.READ_ALL,
    PERMISSIONS.DOCUMENTS.CREATE,
    PERMISSIONS.BILLING.READ_ALL,
    PERMISSIONS.BILLING.APPROVE,
  ];

  for (const permCode of partnerPermissions) {
    const permission = await permissionRepository.findOne({ where: { code: permCode } });
    if (permission) {
      await createRolePermission(
        rolePermissionRepository,
        UserRole.PARTNER,
        permission.id,
        'system'
      );
    }
  }

  // Attorney - Standard permissions
  const attorneyPermissions = [
    PERMISSIONS.CASES.READ,
    PERMISSIONS.CASES.CREATE,
    PERMISSIONS.CASES.UPDATE_OWN,
    PERMISSIONS.DOCUMENTS.READ,
    PERMISSIONS.DOCUMENTS.CREATE,
    PERMISSIONS.DOCUMENTS.UPLOAD,
  ];

  for (const permCode of attorneyPermissions) {
    const permission = await permissionRepository.findOne({ where: { code: permCode } });
    if (permission) {
      await createRolePermission(
        rolePermissionRepository,
        UserRole.ATTORNEY,
        permission.id,
        'system'
      );
    }
  }

  console.log('Role permissions seeded successfully');
}

async function createRolePermission(
  repository: any,
  role: UserRole,
  permissionId: string,
  grantedBy: string
): Promise<void> {
  const existing = await repository.findOne({
    where: { role, permissionId }
  });

  if (!existing) {
    const rolePermission = repository.create({
      role,
      permissionId,
      grantType: GrantType.ALLOW,
      isActive: true,
      grantedBy,
    });

    await repository.save(rolePermission);
  }
}
```

### Step 5: Update Controllers

Add guards and decorators to your controllers:

```typescript
// Before
@Controller('cases')
export class CasesController {
  @Get()
  async findAll() {
    return { cases: [] };
  }
}

// After
import { UseGuards } from '@nestjs/common';
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

  @Post()
  @RequirePermissions(PERMISSIONS.CASES.CREATE)
  async create(@Body() createDto: CreateCaseDto) {
    return { message: 'Case created' };
  }

  @Put(':id')
  @RequirePermissions(PERMISSIONS.CASES.UPDATE)
  @RequireOwnership({ field: 'createdBy' })
  @ResourceType('cases')
  async update(@Param('id') id: string, @Body() updateDto: UpdateCaseDto) {
    return { message: 'Case updated' };
  }
}
```

### Step 6: Testing

Test the authorization system:

```typescript
// src/authorization/authorization.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { PermissionService } from './services/permission.service';
import { UserRole } from '../users/entities/user.entity';
import { PERMISSIONS } from './constants/permissions.constant';

describe('PermissionService', () => {
  let service: PermissionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PermissionService],
    }).compile();

    service = module.get<PermissionService>(PermissionService);
  });

  it('should check permission successfully', async () => {
    const result = await service.checkPermission(
      PERMISSIONS.CASES.READ,
      {
        userId: 'test-user-id',
        userRole: UserRole.ATTORNEY,
        timestamp: new Date(),
      }
    );

    expect(result.granted).toBeDefined();
  });
});
```

## Common Integration Patterns

### Pattern 1: Simple CRUD Operations

```typescript
@Controller('resources')
@UseGuards(JwtAuthGuard, ResourceAccessGuard)
export class ResourcesController {
  @Get()
  @RequirePermissions(PERMISSIONS.RESOURCES.READ)
  findAll() {}

  @Get(':id')
  @RequireAnyPermission(PERMISSIONS.RESOURCES.READ_OWN, PERMISSIONS.RESOURCES.READ_ALL)
  findOne(@Param('id') id: string) {}

  @Post()
  @RequirePermissions(PERMISSIONS.RESOURCES.CREATE)
  create(@Body() dto: CreateDto) {}

  @Put(':id')
  @RequirePermissions(PERMISSIONS.RESOURCES.UPDATE)
  @RequireOwnership()
  update(@Param('id') id: string, @Body() dto: UpdateDto) {}

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.RESOURCES.DELETE)
  @RequireOwnership()
  @PermissionPolicy('sensitive-data-access')
  remove(@Param('id') id: string) {}
}
```

### Pattern 2: Admin Operations

```typescript
@Controller('admin')
@UseGuards(JwtAuthGuard, ResourceAccessGuard)
@PermissionPolicy('admin-override')
export class AdminController {
  @Get('users')
  @RequirePermissions(PERMISSIONS.USERS.READ_ALL)
  getAllUsers() {}

  @Post('users/:id/roles')
  @RequireAllPermissions(
    PERMISSIONS.USERS.UPDATE,
    PERMISSIONS.USERS.MANAGE_ROLES
  )
  updateUserRoles(@Param('id') id: string, @Body() dto: UpdateRolesDto) {}
}
```

### Pattern 3: Multi-Level Access

```typescript
@Controller('documents')
@UseGuards(JwtAuthGuard, ResourceAccessGuard)
export class DocumentsController {
  @Get()
  @PermissionRules({
    anyOf: [
      PERMISSIONS.DOCUMENTS.READ_OWN,
      PERMISSIONS.DOCUMENTS.READ_ALL
    ],
    resourceType: 'documents',
  })
  findAll(@CurrentUser() user: User) {
    // Service layer filters based on user permissions
  }
}
```

## Troubleshooting

### Issue: Permission Denied Despite Having Role

**Solution**: Check if permissions are seeded in database and mapped to role.

```sql
-- Check if permission exists
SELECT * FROM permissions WHERE code = 'cases:read';

-- Check if role has permission
SELECT rp.*, p.code
FROM role_permissions rp
JOIN permissions p ON p.id = rp.permission_id
WHERE rp.role = 'attorney' AND rp.is_active = true;
```

### Issue: Guard Not Being Applied

**Solution**: Ensure guards are in correct order and applied to controller/route.

```typescript
// Correct order
@UseGuards(JwtAuthGuard, ResourceAccessGuard)

// JwtAuthGuard must come first to populate request.user
```

### Issue: Ownership Check Failing

**Solution**: Ensure resource has ownership field and ResourceType decorator is applied.

```typescript
@Put(':id')
@RequireOwnership({ field: 'createdBy' }) // Specify ownership field
@ResourceType('cases') // Specify resource type
async update(@Param('id') id: string) {}
```

## Performance Optimization

1. **Enable Caching**: Already enabled by default (5-minute cache)
2. **Database Indexes**: Migration includes necessary indexes
3. **Batch Permission Checks**: Use `checkPermissions()` instead of multiple `checkPermission()` calls
4. **Lazy Loading**: Permissions are loaded on-demand

## Security Checklist

- [ ] Authorization module imported in AppModule
- [ ] Database migrations run
- [ ] Permissions seeded
- [ ] Role permissions mapped
- [ ] Guards applied to controllers
- [ ] Sensitive operations have MFA requirement
- [ ] Multi-tenant isolation verified
- [ ] Audit logging enabled for critical operations
- [ ] Regular permission audits scheduled

## Next Steps

1. Customize permissions for your specific needs
2. Create custom policies for your use cases
3. Implement audit logging integration
4. Set up permission management UI
5. Configure MFA for sensitive operations
6. Implement delegation system
7. Add team membership validation

For detailed examples, see `examples/usage.example.ts`
For API documentation, see `README.md`
