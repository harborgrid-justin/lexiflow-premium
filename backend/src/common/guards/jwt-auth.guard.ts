import { IS_PUBLIC_KEY } from "@common/decorators/public.decorator";
import { BusinessException } from "@errors/exceptions/business.exceptions";
import { ErrorCodes } from "@errors/constants/error.codes.constant";
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";

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
export class JwtAuthGuard extends AuthGuard("jwt") {
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

  handleRequest<TUser = unknown>(
    err: unknown,
    user: unknown,
    info: unknown,
    _context: unknown,
    _status?: unknown
  ): TUser {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      if (info instanceof Error) {
        if (info.message === "jwt expired") {
          throw new BusinessException(ErrorCodes.AUTH_TOKEN_EXPIRED);
        }
        // Map other specific JWT errors to BusinessException if needed
        // For now, treat others as generic Unauthorized or let them fall through
      }

      throw err || new UnauthorizedException();
    }
    return user as TUser;
  }
}
