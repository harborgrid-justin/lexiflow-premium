import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InsufficientPermissionsException } from '../exceptions';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

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
    // Skip permission checks in development mode
    if (process.env.NODE_ENV === 'development') {
      return true;
    }

    // Check if route is public - skip all permission checks
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

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
