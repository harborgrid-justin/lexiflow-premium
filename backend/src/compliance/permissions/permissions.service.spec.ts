import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsService } from './permissions.service';
import {
  GrantPermissionDto,
  RevokePermissionDto,
  QueryPermissionsDto,
  CheckAccessDto,
  AccessMatrixDto,
  PermissionAction,
  PermissionScope,
  PermissionCondition,
} from './dto/permission.dto';

describe('PermissionsService', () => {
  let service: PermissionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PermissionsService],
    }).compile();

    service = module.get<PermissionsService>(PermissionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('grant', () => {
    it('should grant a permission successfully', async () => {
      const grantDto: GrantPermissionDto = {
        userId: 'user-123',
        userName: 'John Doe',
        role: 'attorney',
        resource: 'cases',
        actions: [PermissionAction.READ, PermissionAction.UPDATE],
        scope: PermissionScope.ORGANIZATION,
        grantedBy: 'admin-456',
        grantedByName: 'Admin User',
        organizationId: 'org-789',
      };

      const result = await service.grant(grantDto);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.userId).toBe(grantDto.userId);
      expect(result.userName).toBe(grantDto.userName);
      expect(result.resource).toBe(grantDto.resource);
      expect(result.actions).toEqual(grantDto.actions);
      expect(result.scope).toBe(grantDto.scope);
      expect(result.grantedAt).toBeInstanceOf(Date);
    });

    it('should grant permission with expiration date', async () => {
      const expiresAt = new Date(Date.now() + 86400000);
      const grantDto: GrantPermissionDto = {
        userId: 'user-123',
        userName: 'John Doe',
        role: 'attorney',
        resource: 'documents',
        actions: [PermissionAction.READ],
        scope: PermissionScope.SPECIFIC,
        resourceId: 'doc-123',
        expiresAt,
        grantedBy: 'admin-456',
        grantedByName: 'Admin User',
        organizationId: 'org-789',
      };

      const result = await service.grant(grantDto);

      expect(result.expiresAt).toEqual(expiresAt);
    });

    it('should grant permission with conditions', async () => {
      const conditions: PermissionCondition[] = [
        { field: 'status', operator: 'equals', value: 'active' },
        { field: 'department', operator: 'in', value: ['legal', 'compliance'] },
      ];

      const grantDto: GrantPermissionDto = {
        userId: 'user-123',
        userName: 'John Doe',
        role: 'attorney',
        resource: 'cases',
        actions: [PermissionAction.READ],
        scope: PermissionScope.TEAM,
        conditions,
        grantedBy: 'admin-456',
        grantedByName: 'Admin User',
        organizationId: 'org-789',
      };

      const result = await service.grant(grantDto);

      expect(result.conditions).toEqual(conditions);
    });

    it('should grant permission with all actions', async () => {
      const allActions = Object.values(PermissionAction);
      const grantDto: GrantPermissionDto = {
        userId: 'admin-123',
        userName: 'Super Admin',
        role: 'super_admin',
        resource: 'users',
        actions: allActions,
        scope: PermissionScope.GLOBAL,
        grantedBy: 'system',
        grantedByName: 'System',
        organizationId: 'org-789',
      };

      const result = await service.grant(grantDto);

      expect(result.actions).toHaveLength(allActions.length);
      expect(result.actions).toEqual(allActions);
    });
  });

  describe('revoke', () => {
    it('should revoke a permission successfully', async () => {
      const grantDto: GrantPermissionDto = {
        userId: 'user-123',
        userName: 'John Doe',
        role: 'attorney',
        resource: 'cases',
        actions: [PermissionAction.READ],
        scope: PermissionScope.ORGANIZATION,
        grantedBy: 'admin-456',
        grantedByName: 'Admin User',
        organizationId: 'org-789',
      };

      const granted = await service.grant(grantDto);

      const revokeDto: RevokePermissionDto = {
        reason: 'User left organization',
        revokedBy: 'admin-456',
        revokedByName: 'Admin User',
      };

      await expect(service.revoke(granted.id, revokeDto)).resolves.not.toThrow();
    });

    it('should throw error when revoking non-existent permission', async () => {
      const revokeDto: RevokePermissionDto = {
        revokedBy: 'admin-456',
        revokedByName: 'Admin User',
      };

      await expect(service.revoke('non-existent-id', revokeDto)).rejects.toThrow(
        'Permission with ID non-existent-id not found'
      );
    });
  });

  describe('findAll', () => {
    beforeEach(async () => {
      await service.grant({
        userId: 'user-1',
        userName: 'User One',
        role: 'attorney',
        resource: 'cases',
        actions: [PermissionAction.READ, PermissionAction.UPDATE],
        scope: PermissionScope.ORGANIZATION,
        grantedBy: 'admin',
        grantedByName: 'Admin',
        organizationId: 'org-1',
      });

      await service.grant({
        userId: 'user-2',
        userName: 'User Two',
        role: 'paralegal',
        resource: 'documents',
        actions: [PermissionAction.READ],
        scope: PermissionScope.TEAM,
        grantedBy: 'admin',
        grantedByName: 'Admin',
        organizationId: 'org-1',
      });

      await service.grant({
        userId: 'user-1',
        userName: 'User One',
        role: 'attorney',
        resource: 'documents',
        actions: [PermissionAction.READ, PermissionAction.CREATE],
        scope: PermissionScope.PERSONAL,
        grantedBy: 'admin',
        grantedByName: 'Admin',
        organizationId: 'org-1',
      });
    });

    it('should return all permissions', async () => {
      const query: QueryPermissionsDto = {};
      const result = await service.findAll(query);

      expect(result.data).toHaveLength(3);
      expect(result.total).toBe(3);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(50);
    });

    it('should filter by userId', async () => {
      const query: QueryPermissionsDto = { userId: 'user-1' };
      const result = await service.findAll(query);

      expect(result.data).toHaveLength(2);
      expect(result.data.every(p => p.userId === 'user-1')).toBe(true);
    });

    it('should filter by role', async () => {
      const query: QueryPermissionsDto = { role: 'attorney' };
      const result = await service.findAll(query);

      expect(result.data).toHaveLength(2);
      expect(result.data.every(p => p.role === 'attorney')).toBe(true);
    });

    it('should filter by resource', async () => {
      const query: QueryPermissionsDto = { resource: 'documents' };
      const result = await service.findAll(query);

      expect(result.data).toHaveLength(2);
      expect(result.data.every(p => p.resource === 'documents')).toBe(true);
    });

    it('should filter by action', async () => {
      const query: QueryPermissionsDto = { action: PermissionAction.UPDATE };
      const result = await service.findAll(query);

      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data.every(p => p.actions.includes(PermissionAction.UPDATE))).toBe(true);
    });

    it('should filter by scope', async () => {
      const query: QueryPermissionsDto = { scope: PermissionScope.ORGANIZATION };
      const result = await service.findAll(query);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].scope).toBe(PermissionScope.ORGANIZATION);
    });

    it('should support pagination', async () => {
      const query: QueryPermissionsDto = { page: 1, limit: 2 };
      const result = await service.findAll(query);

      expect(result.data).toHaveLength(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(2);
      expect(result.total).toBe(3);
    });

    it('should exclude expired permissions by default', async () => {
      const expiredDate = new Date(Date.now() - 86400000);
      await service.grant({
        userId: 'user-3',
        userName: 'User Three',
        role: 'client',
        resource: 'billing',
        actions: [PermissionAction.READ],
        scope: PermissionScope.PERSONAL,
        expiresAt: expiredDate,
        grantedBy: 'admin',
        grantedByName: 'Admin',
        organizationId: 'org-1',
      });

      const query: QueryPermissionsDto = {};
      const result = await service.findAll(query);

      expect(result.data).toHaveLength(3);
    });

    it('should include expired permissions when requested', async () => {
      const expiredDate = new Date(Date.now() - 86400000);
      await service.grant({
        userId: 'user-3',
        userName: 'User Three',
        role: 'client',
        resource: 'billing',
        actions: [PermissionAction.READ],
        scope: PermissionScope.PERSONAL,
        expiresAt: expiredDate,
        grantedBy: 'admin',
        grantedByName: 'Admin',
        organizationId: 'org-1',
      });

      const query: QueryPermissionsDto = { includeExpired: true };
      const result = await service.findAll(query);

      expect(result.data).toHaveLength(4);
    });
  });

  describe('checkAccess', () => {
    beforeEach(async () => {
      await service.grant({
        userId: 'user-123',
        userName: 'John Doe',
        role: 'attorney',
        resource: 'cases',
        actions: [PermissionAction.READ, PermissionAction.UPDATE],
        scope: PermissionScope.ORGANIZATION,
        grantedBy: 'admin',
        grantedByName: 'Admin',
        organizationId: 'org-1',
      });
    });

    it('should allow access when permission exists', async () => {
      const checkDto: CheckAccessDto = {
        userId: 'user-123',
        resource: 'cases',
        action: PermissionAction.READ,
      };

      const result = await service.checkAccess(checkDto);

      expect(result.allowed).toBe(true);
      expect(result.matchedPermissions).toHaveLength(1);
      expect(result.reason).toContain('Access granted');
    });

    it('should deny access when permission does not exist', async () => {
      const checkDto: CheckAccessDto = {
        userId: 'user-123',
        resource: 'cases',
        action: PermissionAction.DELETE,
      };

      const result = await service.checkAccess(checkDto);

      expect(result.allowed).toBe(false);
      expect(result.matchedPermissions).toHaveLength(0);
      expect(result.reason).toBe('No matching permissions found');
    });

    it('should deny access when permission is expired', async () => {
      const expiredDate = new Date(Date.now() - 86400000);
      await service.grant({
        userId: 'user-456',
        userName: 'Jane Doe',
        role: 'paralegal',
        resource: 'documents',
        actions: [PermissionAction.READ],
        scope: PermissionScope.PERSONAL,
        expiresAt: expiredDate,
        grantedBy: 'admin',
        grantedByName: 'Admin',
        organizationId: 'org-1',
      });

      const checkDto: CheckAccessDto = {
        userId: 'user-456',
        resource: 'documents',
        action: PermissionAction.READ,
      };

      const result = await service.checkAccess(checkDto);

      expect(result.allowed).toBe(false);
    });

    it('should check specific resource access', async () => {
      await service.grant({
        userId: 'user-789',
        userName: 'Bob Smith',
        role: 'attorney',
        resource: 'cases',
        resourceId: 'case-123',
        actions: [PermissionAction.READ],
        scope: PermissionScope.SPECIFIC,
        grantedBy: 'admin',
        grantedByName: 'Admin',
        organizationId: 'org-1',
      });

      const allowedCheck: CheckAccessDto = {
        userId: 'user-789',
        resource: 'cases',
        resourceId: 'case-123',
        action: PermissionAction.READ,
      };

      const deniedCheck: CheckAccessDto = {
        userId: 'user-789',
        resource: 'cases',
        resourceId: 'case-456',
        action: PermissionAction.READ,
      };

      const allowedResult = await service.checkAccess(allowedCheck);
      const deniedResult = await service.checkAccess(deniedCheck);

      expect(allowedResult.allowed).toBe(true);
      expect(deniedResult.allowed).toBe(false);
    });

    it('should evaluate conditions correctly', async () => {
      const conditions: PermissionCondition[] = [
        { field: 'status', operator: 'equals', value: 'active' },
      ];

      await service.grant({
        userId: 'user-conditional',
        userName: 'Conditional User',
        role: 'attorney',
        resource: 'cases',
        actions: [PermissionAction.READ],
        scope: PermissionScope.TEAM,
        conditions,
        grantedBy: 'admin',
        grantedByName: 'Admin',
        organizationId: 'org-1',
      });

      const allowedCheck: CheckAccessDto = {
        userId: 'user-conditional',
        resource: 'cases',
        action: PermissionAction.READ,
        context: { status: 'active' },
      };

      const deniedCheck: CheckAccessDto = {
        userId: 'user-conditional',
        resource: 'cases',
        action: PermissionAction.READ,
        context: { status: 'inactive' },
      };

      const allowedResult = await service.checkAccess(allowedCheck);
      const deniedResult = await service.checkAccess(deniedCheck);

      expect(allowedResult.allowed).toBe(true);
      expect(deniedResult.allowed).toBe(false);
    });

    it('should evaluate "in" operator condition', async () => {
      const conditions: PermissionCondition[] = [
        { field: 'department', operator: 'in', value: ['legal', 'compliance'] },
      ];

      await service.grant({
        userId: 'user-in',
        userName: 'User In',
        role: 'attorney',
        resource: 'documents',
        actions: [PermissionAction.READ],
        scope: PermissionScope.TEAM,
        conditions,
        grantedBy: 'admin',
        grantedByName: 'Admin',
        organizationId: 'org-1',
      });

      const allowedCheck: CheckAccessDto = {
        userId: 'user-in',
        resource: 'documents',
        action: PermissionAction.READ,
        context: { department: 'legal' },
      };

      const deniedCheck: CheckAccessDto = {
        userId: 'user-in',
        resource: 'documents',
        action: PermissionAction.READ,
        context: { department: 'finance' },
      };

      expect((await service.checkAccess(allowedCheck)).allowed).toBe(true);
      expect((await service.checkAccess(deniedCheck)).allowed).toBe(false);
    });

    it('should evaluate "contains" operator condition', async () => {
      const conditions: PermissionCondition[] = [
        { field: 'tags', operator: 'contains', value: 'confidential' },
      ];

      await service.grant({
        userId: 'user-contains',
        userName: 'User Contains',
        role: 'attorney',
        resource: 'documents',
        actions: [PermissionAction.READ],
        scope: PermissionScope.TEAM,
        conditions,
        grantedBy: 'admin',
        grantedByName: 'Admin',
        organizationId: 'org-1',
      });

      const allowedCheck: CheckAccessDto = {
        userId: 'user-contains',
        resource: 'documents',
        action: PermissionAction.READ,
        context: { tags: 'confidential,important' },
      };

      expect((await service.checkAccess(allowedCheck)).allowed).toBe(true);
    });
  });

  describe('getAccessMatrix', () => {
    beforeEach(async () => {
      await service.grant({
        userId: 'user-matrix',
        userName: 'Matrix User',
        role: 'attorney',
        resource: 'cases',
        actions: [PermissionAction.READ, PermissionAction.UPDATE],
        scope: PermissionScope.ORGANIZATION,
        grantedBy: 'admin',
        grantedByName: 'Admin',
        organizationId: 'org-1',
      });

      await service.grant({
        userId: 'user-matrix',
        userName: 'Matrix User',
        role: 'attorney',
        resource: 'documents',
        actions: [PermissionAction.READ],
        scope: PermissionScope.TEAM,
        grantedBy: 'admin',
        grantedByName: 'Admin',
        organizationId: 'org-1',
      });
    });

    it('should generate access matrix for multiple resources', async () => {
      const matrixDto: AccessMatrixDto = {
        userId: 'user-matrix',
        resources: ['cases', 'documents', 'billing'],
      };

      const result = await service.getAccessMatrix(matrixDto);

      expect(result.userId).toBe('user-matrix');
      expect(result.matrix).toHaveProperty('cases');
      expect(result.matrix).toHaveProperty('documents');
      expect(result.matrix).toHaveProperty('billing');

      expect(result.matrix.cases[PermissionAction.READ]).toBe(true);
      expect(result.matrix.cases[PermissionAction.UPDATE]).toBe(true);
      expect(result.matrix.cases[PermissionAction.DELETE]).toBe(false);

      expect(result.matrix.documents[PermissionAction.READ]).toBe(true);
      expect(result.matrix.documents[PermissionAction.UPDATE]).toBe(false);

      expect(result.matrix.billing[PermissionAction.READ]).toBe(false);
    });

    it('should use current-user as default userId', async () => {
      const matrixDto: AccessMatrixDto = {
        resources: ['cases'],
      };

      const result = await service.getAccessMatrix(matrixDto);

      expect(result.userId).toBe('current-user');
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle permission with no actions', async () => {
      const grantDto: GrantPermissionDto = {
        userId: 'user-no-actions',
        userName: 'No Actions User',
        role: 'guest',
        resource: 'public',
        actions: [],
        scope: PermissionScope.GLOBAL,
        grantedBy: 'admin',
        grantedByName: 'Admin',
        organizationId: 'org-1',
      };

      const result = await service.grant(grantDto);

      expect(result.actions).toHaveLength(0);
    });

    it('should handle multiple permissions for same user and resource', async () => {
      await service.grant({
        userId: 'user-multi',
        userName: 'Multi User',
        role: 'attorney',
        resource: 'cases',
        actions: [PermissionAction.READ],
        scope: PermissionScope.TEAM,
        grantedBy: 'admin',
        grantedByName: 'Admin',
        organizationId: 'org-1',
      });

      await service.grant({
        userId: 'user-multi',
        userName: 'Multi User',
        role: 'attorney',
        resource: 'cases',
        actions: [PermissionAction.UPDATE],
        scope: PermissionScope.ORGANIZATION,
        grantedBy: 'admin',
        grantedByName: 'Admin',
        organizationId: 'org-1',
      });

      const checkDto: CheckAccessDto = {
        userId: 'user-multi',
        resource: 'cases',
        action: PermissionAction.READ,
      };

      const result = await service.checkAccess(checkDto);

      expect(result.allowed).toBe(true);
      expect(result.matchedPermissions.length).toBeGreaterThan(0);
    });

    it('should handle condition with non-existent context field', async () => {
      const conditions: PermissionCondition[] = [
        { field: 'nonExistent', operator: 'equals', value: 'test' },
      ];

      await service.grant({
        userId: 'user-missing-field',
        userName: 'Missing Field User',
        role: 'attorney',
        resource: 'cases',
        actions: [PermissionAction.READ],
        scope: PermissionScope.TEAM,
        conditions,
        grantedBy: 'admin',
        grantedByName: 'Admin',
        organizationId: 'org-1',
      });

      const checkDto: CheckAccessDto = {
        userId: 'user-missing-field',
        resource: 'cases',
        action: PermissionAction.READ,
        context: { otherField: 'value' },
      };

      const result = await service.checkAccess(checkDto);

      expect(result.allowed).toBe(false);
    });
  });
});
