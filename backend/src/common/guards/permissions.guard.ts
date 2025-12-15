import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InsufficientPermissionsException } from '../exceptions';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>('permissions', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions) {
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
