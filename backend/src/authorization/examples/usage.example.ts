/**
 * USAGE EXAMPLES FOR LEXIFLOW PREMIUM AUTHORIZATION SYSTEM
 *
 * This file demonstrates how to use the comprehensive authorization system
 * across different controllers and services in the application.
 */

import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { ResourceAccessGuard } from '@authorization/guards/resource.access.guard';
import {
  RequirePermissions,
  RequireAllPermissions,
  RequireAnyPermission,
  RequireOwnership,
  PermissionPolicy,
  ResourceType,
  PermissionRules,
} from '@authorization/decorators/permissions.decorator';
import { PERMISSIONS } from '@authorization/constants/permissions.constant';
import { CurrentUser } from '@common/decorators/current-user.decorator';

interface User {
  id: string;
  role: string;
}

@Controller('cases')
@UseGuards(JwtAuthGuard, ResourceAccessGuard)
export class CasesExampleController {
  /**
   * Example 1: Simple permission check
   * User must have 'cases:read' permission
   */
  @Get()
  @RequirePermissions(PERMISSIONS.CASES.READ)
  async findAll(@CurrentUser() user: User) {
    return { message: 'List all cases' };
  }

  /**
   * Example 2: Multiple permissions required (ALL)
   * User must have BOTH permissions
   */
  @Post()
  @RequireAllPermissions(PERMISSIONS.CASES.CREATE, PERMISSIONS.CASES.ASSIGN)
  async create(@Body() createDto: any, @CurrentUser() user: User) {
    return { message: 'Create case' };
  }

  /**
   * Example 3: Any permission required (OR)
   * User needs at least ONE of these permissions
   */
  @Get(':id')
  @RequireAnyPermission(PERMISSIONS.CASES.READ_OWN, PERMISSIONS.CASES.READ_ALL)
  @ResourceType('cases')
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return { message: 'Get case by ID' };
  }

  /**
   * Example 4: Ownership requirement
   * User must be the owner of the resource
   */
  @Put(':id')
  @RequirePermissions(PERMISSIONS.CASES.UPDATE)
  @RequireOwnership({ field: 'createdBy', allowDelegation: true })
  @ResourceType('cases')
  async update(
    @Param('id') id: string,
    @Body() updateDto: any,
    @CurrentUser() user: User
  ) {
    return { message: 'Update case' };
  }

  /**
   * Example 5: Policy-based access control
   * Apply custom policy with MFA requirement
   */
  @Delete(':id')
  @RequirePermissions(PERMISSIONS.CASES.DELETE)
  @PermissionPolicy('sensitive-data-access', { requireMfa: true })
  @ResourceType('cases')
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    return { message: 'Delete case' };
  }

  /**
   * Example 6: Complex permission rules
   * Combines multiple authorization requirements
   */
  @Post(':id/close')
  @PermissionRules({
    anyOf: [PERMISSIONS.CASES.CLOSE, PERMISSIONS.CASES.UPDATE],
    requireOwnership: { field: 'createdBy', allowTeamMembers: true },
    resourceType: 'cases',
    policy: { name: 'standard-access' },
  })
  async closeCase(@Param('id') id: string, @CurrentUser() user: User) {
    return { message: 'Close case' };
  }
}

@Controller('documents')
@UseGuards(JwtAuthGuard, ResourceAccessGuard)
export class DocumentsExampleController {
  /**
   * Example 7: Document upload with permission and policy
   */
  @Post('upload')
  @RequirePermissions(PERMISSIONS.DOCUMENTS.UPLOAD)
  @PermissionPolicy('standard-access')
  async upload(@Body() uploadDto: any, @CurrentUser() user: User) {
    return { message: 'Upload document' };
  }

  /**
   * Example 8: Download with ownership check
   */
  @Get(':id/download')
  @RequireAnyPermission(PERMISSIONS.DOCUMENTS.DOWNLOAD, PERMISSIONS.DOCUMENTS.READ_ALL)
  @RequireOwnership({ allowDelegation: true })
  @ResourceType('documents')
  async download(@Param('id') id: string, @CurrentUser() user: User) {
    return { message: 'Download document' };
  }

  /**
   * Example 9: Sensitive operation requiring MFA
   */
  @Post(':id/redact')
  @RequirePermissions(PERMISSIONS.DOCUMENTS.REDACT)
  @PermissionPolicy('sensitive-data-access', { requireMfa: true })
  @ResourceType('documents')
  async redact(@Param('id') id: string, @CurrentUser() user: User) {
    return { message: 'Redact document' };
  }
}

@Controller('billing')
@UseGuards(JwtAuthGuard, ResourceAccessGuard)
export class BillingExampleController {
  /**
   * Example 10: Read own billing records
   */
  @Get('my-invoices')
  @RequirePermissions(PERMISSIONS.BILLING.READ_OWN)
  async getMyInvoices(@CurrentUser() user: User) {
    return { message: 'Get user invoices' };
  }

  /**
   * Example 11: Admin-only operation
   */
  @Post('invoices/:id/approve')
  @RequireAllPermissions(PERMISSIONS.BILLING.APPROVE, PERMISSIONS.BILLING.UPDATE)
  @PermissionPolicy('admin-override')
  async approveInvoice(@Param('id') id: string, @CurrentUser() user: User) {
    return { message: 'Approve invoice' };
  }

  /**
   * Example 12: Payment processing with approval
   */
  @Post('payments')
  @RequirePermissions(PERMISSIONS.BILLING.PAYMENT)
  @PermissionPolicy('sensitive-data-access', { requireMfa: true, requiresApproval: true })
  async processPayment(@Body() paymentDto: any, @CurrentUser() user: User) {
    return { message: 'Process payment' };
  }
}

@Controller('users')
@UseGuards(JwtAuthGuard, ResourceAccessGuard)
export class UsersExampleController {
  /**
   * Example 13: User management
   */
  @Post()
  @RequireAllPermissions(PERMISSIONS.USERS.CREATE, PERMISSIONS.USERS.INVITE)
  @PermissionPolicy('admin-override')
  async createUser(@Body() createDto: any, @CurrentUser() user: User) {
    return { message: 'Create user' };
  }

  /**
   * Example 14: Manage roles and permissions
   */
  @Put(':id/roles')
  @RequirePermissions(PERMISSIONS.USERS.MANAGE_ROLES)
  @PermissionPolicy('sensitive-data-access', { requireMfa: true })
  async updateRoles(
    @Param('id') id: string,
    @Body() rolesDto: any,
    @CurrentUser() user: User
  ) {
    return { message: 'Update user roles' };
  }

  /**
   * Example 15: User impersonation (super admin only)
   */
  @Post(':id/impersonate')
  @RequirePermissions(PERMISSIONS.USERS.IMPERSONATE)
  @PermissionPolicy('admin-override')
  async impersonateUser(@Param('id') id: string, @CurrentUser() user: User) {
    return { message: 'Impersonate user' };
  }
}

/**
 * SERVICE-LEVEL USAGE EXAMPLES
 */

import { Injectable } from '@nestjs/common';
import { PermissionService } from '@authorization/services/permission.service';
import { PolicyService, PolicyEvaluationContext } from '@authorization/services/policy.service';
import { UserRole } from '@users/entities/user.entity';

@Injectable()
export class AuthorizationExampleService {
  constructor(
    private readonly permissionService: PermissionService,
    private readonly policyService: PolicyService,
  ) {}

  /**
   * Example: Check permission programmatically
   */
  async checkUserPermission(userId: string, userRole: UserRole): Promise<boolean> {
    const hasPermission = await this.permissionService.hasPermission(
      PERMISSIONS.CASES.CREATE,
      {
        userId,
        userRole,
        timestamp: new Date(),
      }
    );

    return hasPermission;
  }

  /**
   * Example: Get all user permissions
   */
  async getUserPermissions(userId: string, userRole: UserRole): Promise<string[]> {
    const permissions = await this.permissionService.getUserPermissions(
      userId,
      userRole,
      true
    );

    return permissions;
  }

  /**
   * Example: Evaluate custom policy
   */
  async evaluateAccessPolicy(
    userId: string,
    userRole: UserRole,
    resourceId: string
  ): Promise<boolean> {
    const context: PolicyEvaluationContext = {
      user: {
        id: userId,
        role: userRole,
      },
      resource: {
        id: resourceId,
        type: 'cases',
      },
      environment: {
        timestamp: new Date(),
      },
      action: 'read',
    };

    const result = await this.policyService.evaluatePolicy('standard-access', context);

    return result.decision === 'allow';
  }

  /**
   * Example: Grant permission to role
   */
  async grantPermission(
    role: UserRole,
    permissionCode: string,
    grantedBy: string
  ): Promise<void> {
    await this.permissionService.grantPermissionToRole(
      role,
      permissionCode,
      grantedBy,
      {
        requiresMfa: false,
        requiresApproval: false,
        isActive: true,
      }
    );
  }

  /**
   * Example: Revoke permission from role
   */
  async revokePermission(
    role: UserRole,
    permissionCode: string,
    revokedBy: string
  ): Promise<void> {
    await this.permissionService.revokePermissionFromRole(
      role,
      permissionCode,
      revokedBy
    );
  }
}
