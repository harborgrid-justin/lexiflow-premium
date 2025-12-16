import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InsufficientPermissionsException } from '../exceptions';

/**
 * Consolidated Permissions Guard
 * Validates user permissions against required permissions for routes
 * Supports both 'permissions' and 'PERMISSIONS_KEY' metadata keys
 *
 * @example Usage
 * @UseGuards(JwtAuthGuard, PermissionsGuard)
 * @Permissions('cases:read', 'cases:write')
 * @Get()
 * findAll() {}
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Support both metadata keys for backwards compatibility
    const requiredPermissions =
      this.reflector.getAllAndOverride<string[]>('permissions', [
        context.getHandler(),
        context.getClass(),
      ]) ||
      this.reflector.getAllAndOverride<string[]>('PERMISSIONS_KEY', [
        context.getHandler(),
        context.getClass(),
      ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.permissions) {
      throw new InsufficientPermissionsException(requiredPermissions);
    }

    const hasAllPermissions = requiredPermissions.every((permission) =>
      user.permissions.includes(permission),
    );

    if (!hasAllPermissions) {
      throw new InsufficientPermissionsException(requiredPermissions);
    }

    return true;
  }
}
