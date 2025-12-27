import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InsufficientPermissionsException } from '@common/exceptions';
import { IS_PUBLIC_KEY } from '@common/decorators/public.decorator';

interface UserWithPermissions {
  permissions?: string[];
}

interface RequestWithUser {
  user?: UserWithPermissions;
}

/**
 * Consolidated Permissions Guard
 * Validates user permissions against required permissions for routes
 * Supports both 'permissions' and 'PERMISSIONS_KEY' metadata keys
 * Respects @Public() decorator for NestJS compliance
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
    // SECURITY: Permission checks are NEVER bypassed regardless of environment
    // Use @Public() decorator for routes that should be accessible without permission checks

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

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

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user || !user.permissions) {
      throw new InsufficientPermissionsException(requiredPermissions);
    }

    const hasAllPermissions = requiredPermissions.every((permission) =>
      user.permissions!.includes(permission),
    );

    if (!hasAllPermissions) {
      throw new InsufficientPermissionsException(requiredPermissions);
    }

    return true;
  }
}
