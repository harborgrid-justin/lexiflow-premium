import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InsufficientPermissionsException } from '@common/exceptions';
import { IS_PUBLIC_KEY } from '@common/decorators/public.decorator';
import { ROLES_KEY } from '@common/decorators/roles.decorator';
import { UserRole } from '@users/entities/user.entity';

interface UserWithRole {
  id?: string;
  role?: string | UserRole;
  organizationId?: string;
  permissions?: string[];
}

interface RequestWithUser {
  user?: UserWithRole;
}

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      this.logger.warn('Access denied: No user found in request');
      throw new InsufficientPermissionsException(requiredRoles);
    }

    if (!user.role) {
      this.logger.warn(`Access denied: User ${user.id} has no role assigned`);
      throw new InsufficientPermissionsException(requiredRoles);
    }

    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      this.logger.warn(
        `Access denied: User ${user.id} with role ${user.role} does not have required roles: ${requiredRoles.join(', ')}`
      );
      throw new InsufficientPermissionsException(requiredRoles);
    }

    this.logger.debug(
      `Access granted: User ${user.id} with role ${user.role} has required role`
    );

    return true;
  }
}
