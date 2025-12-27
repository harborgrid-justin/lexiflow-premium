import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  [key: string]: unknown;
}

interface RequestWithAuth {
  headers: {
    authorization?: string;
  };
  user?: JwtPayload;
}

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
    // SECURITY: Authentication is NEVER bypassed regardless of environment
    // Use @Public() decorator for routes that should be accessible without authentication

    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithAuth>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new UnauthorizedException('Server configuration error');
      }
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
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

  private extractTokenFromHeader(request: RequestWithAuth): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return undefined;
    }
    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
