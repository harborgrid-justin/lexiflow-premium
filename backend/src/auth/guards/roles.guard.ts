import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../common/enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { hasAnyRole } from '../utils/role-hierarchy.util';

/**
 * Enhanced Roles Guard with role hierarchy support
 * Users with higher privilege roles can access resources meant for lower roles
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    const authenticatedUser = user as AuthenticatedUser;

    // Use role hierarchy to check if user has sufficient privilege
    return hasAnyRole(authenticatedUser.role, requiredRoles);
  }
}
