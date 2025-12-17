import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

/**
 * Consolidated JWT Authentication Guard
 * Validates JWT tokens and checks public route access
 * Supports both 'isPublic' metadata key for backwards compatibility
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
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Skip authentication in development mode
    if (process.env.NODE_ENV === 'development') {
      return true;
    }

    // Check if route is public (supports both 'isPublic' and 'IS_PUBLIC_KEY')
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new UnauthorizedException('Server configuration error');
      }
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtSecret,
      });
      request.user = payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }

    return true;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
