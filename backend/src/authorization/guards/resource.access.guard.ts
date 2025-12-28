import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InsufficientPermissionsException } from '@common/exceptions';
import { PermissionService } from '@authorization/services/permission.service';
import { PolicyService, PolicyEvaluationContext } from '@authorization/services/policy.service';
import { UserRole } from '@users/entities/user.entity';
import {
  PERMISSIONS_KEY,
  REQUIRE_ALL_PERMISSIONS_KEY,
  REQUIRE_ANY_PERMISSION_KEY,
  REQUIRE_OWNERSHIP_KEY,
  REQUIRE_DELEGATION_KEY,
  PERMISSION_POLICY_KEY,
  RESOURCE_TYPE_KEY,
  BYPASS_PERMISSION_CHECK_KEY,
} from '@authorization/decorators/permissions.decorator';
import { IS_PUBLIC_KEY } from '@common/decorators/public.decorator';

interface AuthenticatedUser {
  id: string;
  role: UserRole;
  organizationId?: string;
  departmentId?: string;
  permissions?: string[];
}

interface RequestWithUser {
  user?: AuthenticatedUser;
  params?: Record<string, string>;
  body?: Record<string, unknown>;
  query?: Record<string, string>;
  ip?: string;
  headers?: Record<string, string>;
}

interface ResourceWithOwner {
  id: string;
  createdBy?: string;
  userId?: string;
  ownerId?: string;
  organizationId?: string;
  status?: string;
  [key: string]: unknown;
}

interface OwnershipRequirement {
  field?: string;
  allowDelegation?: boolean;
  allowTeamMembers?: boolean;
}

interface PolicyConfig {
  name: string;
  config?: Record<string, unknown>;
}

@Injectable()
export class ResourceAccessGuard implements CanActivate {
  private readonly logger = new Logger(ResourceAccessGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly permissionService: PermissionService,
    private readonly policyService: PolicyService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const bypassPermissionCheck = this.reflector.getAllAndOverride<boolean>(
      BYPASS_PERMISSION_CHECK_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (bypassPermissionCheck) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new InsufficientPermissionsException([]);
    }

    const allPermissions = this.reflector.getAllAndOverride<string[]>(
      REQUIRE_ALL_PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()]
    );

    const anyPermissions = this.reflector.getAllAndOverride<string[]>(
      REQUIRE_ANY_PERMISSION_KEY,
      [context.getHandler(), context.getClass()]
    );

    const standardPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()]
    );

    const ownershipRequirement = this.reflector.getAllAndOverride<OwnershipRequirement>(
      REQUIRE_OWNERSHIP_KEY,
      [context.getHandler(), context.getClass()]
    );

    const delegationRequired = this.reflector.getAllAndOverride<boolean>(
      REQUIRE_DELEGATION_KEY,
      [context.getHandler(), context.getClass()]
    );

    const policyConfig = this.reflector.getAllAndOverride<PolicyConfig>(
      PERMISSION_POLICY_KEY,
      [context.getHandler(), context.getClass()]
    );

    const resourceType = this.reflector.getAllAndOverride<string>(
      RESOURCE_TYPE_KEY,
      [context.getHandler(), context.getClass()]
    );

    const resource = await this.extractResource(request, resourceType);

    const permissionContext = {
      userId: user.id,
      userRole: user.role,
      organizationId: user.organizationId,
      resourceId: resource?.id,
      resourceOwnerId: this.extractOwnerId(resource, ownershipRequirement),
      userPermissions: user.permissions,
      ipAddress: request.ip,
      userAgent: request.headers?.['user-agent'],
      timestamp: new Date(),
    };

    if (allPermissions && allPermissions.length > 0) {
      const result = await this.permissionService.checkPermissions(
        allPermissions,
        permissionContext,
        true
      );

      if (!result.granted) {
        this.logger.warn(
          `User ${user.id} denied access - missing required permissions: ${allPermissions.join(', ')}`
        );
        throw new InsufficientPermissionsException(allPermissions);
      }
    }

    if (anyPermissions && anyPermissions.length > 0) {
      const result = await this.permissionService.checkPermissions(
        anyPermissions,
        permissionContext,
        false
      );

      if (!result.granted) {
        this.logger.warn(
          `User ${user.id} denied access - missing any of permissions: ${anyPermissions.join(', ')}`
        );
        throw new InsufficientPermissionsException(anyPermissions);
      }
    }

    if (standardPermissions && standardPermissions.length > 0) {
      const result = await this.permissionService.checkPermissions(
        standardPermissions,
        permissionContext,
        true
      );

      if (!result.granted) {
        this.logger.warn(
          `User ${user.id} denied access - missing permissions: ${standardPermissions.join(', ')}`
        );
        throw new InsufficientPermissionsException(standardPermissions);
      }
    }

    if (ownershipRequirement) {
      const hasOwnership = await this.validateOwnership(
        user,
        resource,
        ownershipRequirement
      );

      if (!hasOwnership) {
        this.logger.warn(
          `User ${user.id} denied access - ownership requirement not met for resource ${resource?.id}`
        );
        throw new InsufficientPermissionsException(['ownership']);
      }
    }

    if (delegationRequired) {
      const hasDelegation = await this.validateDelegation(resource);

      if (!hasDelegation) {
        this.logger.warn(
          `User ${user.id} denied access - delegation requirement not met for resource ${resource?.id}`
        );
        throw new InsufficientPermissionsException(['delegation']);
      }
    }

    if (policyConfig) {
      const policyContext = this.buildPolicyContext(
        user,
        resource,
        request,
        resourceType
      );

      const policyResult = await this.policyService.evaluatePolicy(
        policyConfig.name,
        policyContext
      );

      if (policyResult.decision === 'deny') {
        this.logger.warn(
          `User ${user.id} denied access by policy ${policyConfig.name}: ${policyResult.reason}`
        );
        throw new InsufficientPermissionsException([policyConfig.name]);
      }

      if (policyResult.requiresMfa) {
        this.logger.debug(`MFA required for user ${user.id} by policy ${policyConfig.name}`);
      }

      if (policyResult.requiresApproval) {
        this.logger.debug(`Approval required for user ${user.id} by policy ${policyConfig.name}`);
      }
    }

    if (user.organizationId && resource?.organizationId) {
      if (user.organizationId !== resource.organizationId) {
        const isAdmin = [UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(user.role);
        if (!isAdmin) {
          this.logger.warn(
            `User ${user.id} denied access - multi-tenant isolation: user org ${user.organizationId} !== resource org ${resource.organizationId}`
          );
          throw new InsufficientPermissionsException(['multi-tenant-isolation']);
        }
      }
    }

    return true;
  }

  private async extractResource(
    request: RequestWithUser,
    resourceType?: string
  ): Promise<ResourceWithOwner | null> {
    const resourceId = request.params?.id || request.params?.resourceId;

    if (!resourceId) {
      return null;
    }

    // Log resource access for audit purposes
    if (resourceType) {
      this.logger.debug(`Accessing resource type: ${resourceType}, id: ${resourceId}`);
    }

    if (request.body && typeof request.body === 'object' && request.body.id === resourceId) {
      return request.body as ResourceWithOwner;
    }

    return {
      id: resourceId,
    };
  }

  private extractOwnerId(
    resource: ResourceWithOwner | null,
    ownershipRequirement: OwnershipRequirement | null
  ): string | undefined {
    if (!resource || !ownershipRequirement) {
      return undefined;
    }

    const ownerField = ownershipRequirement.field || 'createdBy';
    const ownerValue = resource[ownerField];

    return (
      (typeof ownerValue === 'string' ? ownerValue : undefined) ||
      resource.createdBy ||
      resource.userId ||
      resource.ownerId
    );
  }

  private async validateOwnership(
    user: AuthenticatedUser,
    resource: ResourceWithOwner | null,
    ownershipRequirement: OwnershipRequirement
  ): Promise<boolean> {
    if (!resource) {
      return true;
    }

    const ownerId = this.extractOwnerId(resource, ownershipRequirement);

    if (!ownerId) {
      return false;
    }

    if (user.id === ownerId) {
      return true;
    }

    if (ownershipRequirement.allowDelegation) {
      return this.validateDelegation(resource);
    }

    if (ownershipRequirement.allowTeamMembers) {
      return this.validateTeamMembership(resource);
    }

    const isAdmin = [UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(user.role);
    if (isAdmin) {
      return true;
    }

    return false;
  }

  private async validateDelegation(
    resource: ResourceWithOwner | null
  ): Promise<boolean> {
    if (!resource) {
      return false;
    }

    return false;
  }

  private async validateTeamMembership(
    resource: ResourceWithOwner | null
  ): Promise<boolean> {
    if (!resource) {
      return false;
    }

    return false;
  }

  private buildPolicyContext(
    user: AuthenticatedUser,
    resource: ResourceWithOwner | null,
    request: RequestWithUser,
    resourceType?: string
  ): PolicyEvaluationContext {
    return {
      user: {
        id: user.id,
        role: user.role,
        organizationId: user.organizationId,
        departmentId: user.departmentId,
        permissions: user.permissions,
      },
      resource: resource
        ? {
            id: resource.id,
            type: resourceType || 'unknown',
            ownerId: resource.createdBy || resource.userId || resource.ownerId,
            organizationId: resource.organizationId,
            status: resource.status,
            attributes: resource,
          }
        : undefined,
      environment: {
        timestamp: new Date(),
        ipAddress: request.ip,
        userAgent: request.headers?.['user-agent'],
        requestMethod: request.headers?.['method'],
        requestPath: request.headers?.['path'],
      },
      action: 'access',
    };
  }
}
