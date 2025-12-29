import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  jti?: string;
  iat?: number;
  exp?: number;
  [key: string]: unknown;
}

interface RequestWithAuth {
  headers: {
    authorization?: string;
  };
  user?: JwtPayload;
}

/**
 * Enterprise JWT Authentication Guard
 * Validates JWT tokens using ConfigService for secure configuration management
 *
 * Features:
 * - Uses ConfigService instead of direct process.env access
 * - Supports @Public() decorator for unauthenticated routes
 * - Comprehensive error handling and logging
 * - Token payload validation
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
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
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
      // Use ConfigService for secure JWT secret access
      const jwtSecret = this.configService.get<string>('app.jwt.secret');
      if (!jwtSecret) {
        this.logger.error('JWT secret not configured - check environment variables');
        throw new UnauthorizedException('Server configuration error');
      }

      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: jwtSecret,
      });

      // Validate required payload fields
      if (!payload.sub || !payload.email) {
        throw new UnauthorizedException('Invalid token payload');
      }

      request.user = payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.debug(`Token verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
