import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '@common/decorators/public.decorator';

/**
 * Enterprise JWT Authentication Guard
 * Extends NestJS Passport AuthGuard to support @Public() decorator
 * Delegates user validation to JwtStrategy
 *
 * Features:
 * - Uses Passport Strategy for robust validation
 * - Supports @Public() decorator for unauthenticated routes
 * - Loads full user context (including permissions) via Strategy
 *
 * @example Usage
 * @UseGuards(JwtAuthGuard)
 * @Controller('api')
 * export class MyController {}
 *
 * @Public() // Skip authentication for this route
 * @Get('public')
 * publicRoute() {}
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // SECURITY: Check for @Public() decorator
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, _info: any) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
