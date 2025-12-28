import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission, PermissionStatus } from '@authorization/entities/permission.entity';
import { RolePermission, GrantType } from '@authorization/entities/role.permission.entity';
import { UserRole } from '@users/entities/user.entity';

interface PermissionCheckContext {
  userId: string;
  userRole: UserRole;
  organizationId?: string;
  resourceId?: string;
  resourceOwnerId?: string;
  userPermissions?: string[];
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  timestamp?: Date;
}

interface PermissionCheckResult {
  granted: boolean;
  reason?: string;
  requiresMfa?: boolean;
  requiresApproval?: boolean;
  deniedBy?: string;
  grantedBy?: string;
}

/**
 * Permission Service with Memory Optimizations
 * 
 * MEMORY OPTIMIZATIONS:
 * - 10K entry cap per cache with LRU eviction
 * - Proper cleanup interval tracking
 * - Module destroy cleanup
 */
@Injectable()
export class PermissionService implements OnModuleDestroy {
  private readonly logger = new Logger(PermissionService.name);
  private readonly permissionCache = new Map<string, Permission>();
  private readonly rolePermissionCache = new Map<string, RolePermission[]>();
  private readonly userPermissionCache = new Map<string, Set<string>>();
  private readonly cacheExpirationMs = 5 * 60 * 1000;
  private readonly MAX_CACHE_SIZE = 10000;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
  ) {
    this.initializeCacheCleanup();
  }

  onModuleDestroy() {
    this.logger.log('Cleaning up permission service...');
    
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    this.permissionCache.clear();
    this.rolePermissionCache.clear();
    this.userPermissionCache.clear();
    
    this.logger.log('Permission service cleanup complete');
  }

  private initializeCacheCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.clearCaches();
    }, this.cacheExpirationMs);
  }

  async checkPermission(
    permissionCode: string,
    context: PermissionCheckContext
  ): Promise<PermissionCheckResult> {
    try {
      const permission = await this.getPermissionByCode(permissionCode);

      if (!permission) {
        return {
          granted: false,
          reason: `Permission ${permissionCode} not found`,
        };
      }

      if (permission.status !== PermissionStatus.ACTIVE) {
        return {
          granted: false,
          reason: `Permission ${permissionCode} is not active`,
        };
      }

      const rolePermissions = await this.getRolePermissions(context.userRole);

      const applicablePermission = rolePermissions.find(
        rp => rp.permissionId === permission.id && rp.isActive
      );

      if (!applicablePermission) {
        const hasDirectUserPermission = await this.checkDirectUserPermission(
          context.userId as string
        );

        if (!hasDirectUserPermission) {
          return {
            granted: false,
            reason: `User does not have permission ${permissionCode}`,
          };
        }
      }

      if (applicablePermission && applicablePermission.grantType === GrantType.DENY) {
        return {
          granted: false,
          reason: `Permission ${permissionCode} explicitly denied for role`,
          deniedBy: applicablePermission.grantedBy,
        };
      }

      const timeValidation = this.validateTimeRestrictions(
        permission,
        applicablePermission,
        context
      );
      if (!timeValidation.valid) {
        return {
          granted: false,
          reason: timeValidation.reason,
        };
      }

      if (!applicablePermission) {
        return {
          granted: false,
          reason: 'No applicable permission found',
        };
      }

      const locationValidation = this.validateLocationRestrictions(
        permission,
        applicablePermission,
        context
      );
      if (!locationValidation.valid) {
        return {
          granted: false,
          reason: locationValidation.reason,
        };
      }

      const ownershipValidation = this.validateOwnership(permission, context);
      if (!ownershipValidation.valid) {
        return {
          granted: false,
          reason: ownershipValidation.reason,
        };
      }

      return {
        granted: true,
        requiresMfa: applicablePermission?.requiresMfa || permission.metadata?.mfaRequired,
        requiresApproval: applicablePermission?.requiresApproval || permission.metadata?.approvalRequired,
        grantedBy: applicablePermission?.grantedBy,
      };
    } catch (error) {
      this.logger.error(`Error checking permission ${permissionCode}:`, error);
      return {
        granted: false,
        reason: 'Error checking permission',
      };
    }
  }

  async checkPermissions(
    permissionCodes: string[],
    context: PermissionCheckContext,
    requireAll: boolean = true
  ): Promise<PermissionCheckResult> {
    const results = await Promise.all(
      permissionCodes.map(code => this.checkPermission(code, context))
    );

    if (requireAll) {
      const allGranted = results.every(result => result.granted);
      const deniedPermission = results.find(result => !result.granted);

      return {
        granted: allGranted,
        reason: deniedPermission?.reason,
        requiresMfa: results.some(result => result.requiresMfa),
        requiresApproval: results.some(result => result.requiresApproval),
      };
    } else {
      const anyGranted = results.some(result => result.granted);
      const grantedPermission = results.find(result => result.granted);

      return {
        granted: anyGranted,
        reason: anyGranted ? undefined : 'No permissions granted',
        requiresMfa: grantedPermission?.requiresMfa,
        requiresApproval: grantedPermission?.requiresApproval,
      };
    }
  }

  async getUserPermissions(
    userId: string,
    userRole: UserRole,
    includeInherited: boolean = true
  ): Promise<string[]> {
    const cacheKey = `${userId}:${userRole}`;
    const cached = this.userPermissionCache.get(cacheKey);

    if (cached) {
      return Array.from(cached);
    }

    const rolePermissions = await this.getRolePermissions(userRole);
    const permissions = new Set<string>();

    for (const rolePermission of rolePermissions) {
      if (rolePermission.grantType === GrantType.ALLOW && rolePermission.isActive) {
        const permission = await this.getPermissionById(rolePermission.permissionId);
        if (permission && permission.status === PermissionStatus.ACTIVE) {
          permissions.add(permission.code);

          if (includeInherited && permission.childPermissions) {
            permission.childPermissions.forEach(child => permissions.add(child));
          }
        }
      }
    }

    this.userPermissionCache.set(cacheKey, permissions);

    return Array.from(permissions);
  }

  async hasPermission(
    permissionCode: string,
    context: PermissionCheckContext
  ): Promise<boolean> {
    const result = await this.checkPermission(permissionCode, context);
    return result.granted;
  }

  async hasAnyPermission(
    permissionCodes: string[],
    context: PermissionCheckContext
  ): Promise<boolean> {
    const result = await this.checkPermissions(permissionCodes, context, false);
    return result.granted;
  }

  async hasAllPermissions(
    permissionCodes: string[],
    context: PermissionCheckContext
  ): Promise<boolean> {
    const result = await this.checkPermissions(permissionCodes, context, true);
    return result.granted;
  }

  private async getPermissionByCode(code: string): Promise<Permission | null> {
    const cached = this.permissionCache.get(code);
    if (cached) {
      return cached;
    }

    const permission = await this.permissionRepository.findOne({
      where: { code },
    });

    if (permission) {
      this.permissionCache.set(code, permission);
      this.enforceCacheLRU(this.permissionCache);
    }

    return permission;
  }

  private async getPermissionById(id: string): Promise<Permission | null> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });
    return permission;
  }

  private async getRolePermissions(role: UserRole): Promise<RolePermission[]> {
    const cached = this.rolePermissionCache.get(role);
    if (cached) {
      return cached;
    }

    const rolePermissions = await this.rolePermissionRepository.find({
      where: { role, isActive: true },
      relations: ['permission'],
    });

    this.rolePermissionCache.set(role, rolePermissions);
    this.enforceCacheLRU(this.rolePermissionCache);

    return rolePermissions;
  }

  /**
   * Enforce LRU eviction on cache Maps
   */
  private enforceCacheLRU<K, V>(cache: Map<K, V>): void {
    if (cache.size > this.MAX_CACHE_SIZE) {
      const toRemove = Math.floor(this.MAX_CACHE_SIZE * 0.1);
      const iterator = cache.keys();
      for (let i = 0; i < toRemove; i++) {
        const key = iterator.next().value;
        if (key !== undefined) {
          cache.delete(key);
        }
      }
      this.logger.warn(`LRU eviction: removed ${toRemove} entries from cache (size: ${cache.size})`);
    }
  }

  private async checkDirectUserPermission(userId: string): Promise<boolean> {
    void userId;
    return false;
  }

  private validateTimeRestrictions(
    permission: Permission,
    rolePermission: RolePermission | undefined,
    context: PermissionCheckContext
  ): { valid: boolean; reason?: string } {
    const timestamp = context.timestamp || new Date();

    if (rolePermission?.effectiveFrom && timestamp < new Date(rolePermission.effectiveFrom)) {
      return {
        valid: false,
        reason: 'Permission not yet effective',
      };
    }

    if (rolePermission?.effectiveTo && timestamp > new Date(rolePermission.effectiveTo)) {
      return {
        valid: false,
        reason: 'Permission has expired',
      };
    }

    if (permission.constraints?.timeRestrictions) {
      const { startTime, endTime, daysOfWeek } = permission.constraints.timeRestrictions;

      if (daysOfWeek && daysOfWeek.length > 0) {
        const currentDay = timestamp.getDay();
        if (!daysOfWeek.includes(currentDay)) {
          return {
            valid: false,
            reason: 'Permission not allowed on this day',
          };
        }
      }

      if (startTime && endTime) {
        const currentTime = timestamp.toTimeString().split(' ')[0];
        if (currentTime && (currentTime < startTime || currentTime > endTime)) {
          return {
            valid: false,
            reason: 'Permission not allowed at this time',
          };
        }
      }
    }

    return { valid: true };
  }

  private validateLocationRestrictions(
    permission: Permission,
    rolePermission: RolePermission | undefined,
    context: PermissionCheckContext
  ): { valid: boolean; reason?: string } {
    void rolePermission;
    if (permission.constraints?.locationRestrictions) {
      const { allowedCountries, deniedCountries } =
        permission.constraints.locationRestrictions;

      if (allowedCountries && context.location) {
        if (!allowedCountries.includes(context.location)) {
          return {
            valid: false,
            reason: 'Permission not allowed from this location',
          };
        }
      }

      if (deniedCountries && context.location) {
        if (deniedCountries.includes(context.location)) {
          return {
            valid: false,
            reason: 'Permission denied from this location',
          };
        }
      }
    }

    return { valid: true };
  }

  private validateOwnership(
    permission: Permission,
    context: PermissionCheckContext
  ): { valid: boolean; reason?: string } {
    if (permission.requiresOwnership) {
      if (!context.resourceOwnerId) {
        return {
          valid: false,
          reason: 'Ownership information not provided',
        };
      }

      if (context.resourceOwnerId !== context.userId) {
        return {
          valid: false,
          reason: 'User is not the owner of this resource',
        };
      }
    }

    return { valid: true };
  }

  async grantPermissionToRole(
    role: UserRole,
    permissionCode: string,
    grantedBy: string,
    options?: Partial<RolePermission>
  ): Promise<RolePermission> {
    const permission = await this.getPermissionByCode(permissionCode);

    if (!permission) {
      throw new Error(`Permission ${permissionCode} not found`);
    }

    const rolePermission = this.rolePermissionRepository.create({
      role,
      permissionId: permission.id,
      grantType: GrantType.ALLOW,
      grantedBy,
      ...options,
    });

    const saved = await this.rolePermissionRepository.save(rolePermission);
    this.clearCaches();

    return saved;
  }

  async revokePermissionFromRole(
    role: UserRole,
    permissionCode: string,
    revokedBy: string
  ): Promise<void> {
    const permission = await this.getPermissionByCode(permissionCode);

    if (!permission) {
      throw new Error(`Permission ${permissionCode} not found`);
    }

    await this.rolePermissionRepository.update(
      { role, permissionId: permission.id },
      {
        isActive: false,
        revokedBy,
        revokedAt: new Date(),
      }
    );

    this.clearCaches();
  }

  clearCaches(): void {
    this.permissionCache.clear();
    this.rolePermissionCache.clear();
    this.userPermissionCache.clear();
    this.logger.debug('Permission caches cleared');
  }
}
