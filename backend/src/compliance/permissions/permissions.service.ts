import { Injectable } from "@nestjs/common";
import {
  PermissionDto,
  GrantPermissionDto,
  RevokePermissionDto,
  QueryPermissionsDto,
  CheckAccessDto,
  AccessCheckResult,
  AccessMatrixDto,
  AccessMatrixResult,
  PermissionAction,
  PermissionScope,
  PermissionCondition,
} from "./dto/permission.dto";

/**
 * ╔=================================================================================================================╗
 * ║PERMISSIONS                                                                                                      ║
 * ╠=================================================================================================================╣
 * ║                                                                                                                 ║
 * ║  External Request                   Controller                            Service                                ║
 * ║       │                                   │                                     │                                ║
 * ║       │  HTTP Endpoints                  │                                     │                                ║
 * ║       └───────────────────────────────────►                                     │                                ║
 * ║                                                                                                                 ║
 * ║                                                                 ┌───────────────┴───────────────┐                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          Repository                    Database                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          PostgreSQL                                          ║
 * ║                                                                                                                 ║
 * ║  DATA IN:  Data input                                                                                         ║

 * ║                                                                                                                 ║
 * ║  DATA OUT: Data output                                                                                        ║

 * ║                                                                                                                 ║

 * ╚=================================================================================================================╝
 */

@Injectable()
export class PermissionsService {
  private permissions: Map<string, PermissionDto> = new Map();

  async grant(dto: GrantPermissionDto): Promise<PermissionDto> {
    const permission: PermissionDto = {
      id: this.generateId(),
      ...dto,
      grantedAt: new Date(),
    };

    this.permissions.set(permission.id, permission);
    return permission;
  }

  async revoke(id: string, _dto: RevokePermissionDto): Promise<void> {
    const permission = this.permissions.get(id);
    if (!permission) {
      throw new Error(`Permission with ID ${id} not found`);
    }
    this.permissions.delete(id);
  }

  async findAll(query: QueryPermissionsDto): Promise<{
    data: PermissionDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    let perms = Array.from(this.permissions.values());

    // Filter out expired permissions unless explicitly requested
    if (!query.includeExpired) {
      const now = new Date();
      perms = perms.filter((perm) => !perm.expiresAt || perm.expiresAt > now);
    }

    // Apply filters
    if (query.userId) {
      perms = perms.filter((perm) => perm.userId === query.userId);
    }
    if (query.role) {
      perms = perms.filter((perm) => perm.role === query.role);
    }
    if (query.resource) {
      perms = perms.filter((perm) => perm.resource === query.resource);
    }
    if (query.action) {
      perms = perms.filter((perm) => perm.actions.includes(query.action ?? ""));
    }
    if (query.scope) {
      perms = perms.filter((perm) => perm.scope === query.scope);
    }

    // Sort by granted date (newest first)
    perms.sort((a, b) => b.grantedAt.getTime() - a.grantedAt.getTime());

    // Paginate
    const page = query.page || 1;
    const limit = query.limit || 50;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPerms = perms.slice(startIndex, endIndex);

    return {
      data: paginatedPerms,
      total: perms.length,
      page,
      limit,
    };
  }

  async checkAccess(dto: CheckAccessDto): Promise<AccessCheckResult> {
    const now = new Date();

    // Find all applicable permissions
    const applicablePerms = Array.from(this.permissions.values()).filter(
      (perm) => {
        // Check expiration
        if (perm.expiresAt && perm.expiresAt < now) return false;

        // Check user
        if (perm.userId !== dto.userId) return false;

        // Check resource
        if (perm.resource !== dto.resource) return false;

        // Check resource ID (if specified)
        if (perm.scope === PermissionScope.SPECIFIC) {
          if (!perm.resourceId || perm.resourceId !== dto.resourceId)
            return false;
        }

        // Check action
        if (!perm.actions.includes(dto.action)) return false;

        // Check conditions
        if (perm.conditions && dto.context) {
          if (!this.evaluateConditions(perm.conditions, dto.context))
            return false;
        }

        return true;
      }
    );

    if (applicablePerms.length > 0) {
      return {
        allowed: true,
        matchedPermissions: applicablePerms,
        reason: `Access granted via ${applicablePerms.length} permission(s)`,
      };
    }

    return {
      allowed: false,
      matchedPermissions: [],
      reason: "No matching permissions found",
    };
  }

  async getAccessMatrix(dto: AccessMatrixDto): Promise<AccessMatrixResult> {
    const userId = dto.userId || "current-user";
    const actions = Object.values(PermissionAction);

    const matrix: Record<string, Record<string, boolean>> = {};

    for (const resource of dto.resources) {
      matrix[resource] = {};

      for (const action of actions) {
        const result = await this.checkAccess({
          userId,
          resource,
          action,
        });
        matrix[resource][action] = result.allowed;
      }
    }

    return {
      userId,
      matrix,
    };
  }

  private evaluateConditions(
    conditions: PermissionCondition[],
    context: Record<string, unknown>
  ): boolean {
    return conditions.every((condition) => {
      const contextValue = context[condition.field];

      switch (condition.operator) {
        case "equals":
          return contextValue === condition.value;
        case "not_equals":
          return contextValue !== condition.value;
        case "in":
          return Array.isArray(condition.value)
            ? condition.value.includes(contextValue)
            : false;
        case "not_in":
          return Array.isArray(condition.value)
            ? !condition.value.includes(contextValue)
            : true;
        case "contains":
          return String(contextValue).includes(String(condition.value));
        default:
          return false;
      }
    });
  }

  private generateId(): string {
    return `perm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
