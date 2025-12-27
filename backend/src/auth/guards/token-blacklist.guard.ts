import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenBlacklistService } from '@auth/token-blacklist.service';
import { JwtPayload } from '@auth/interfaces/jwt-payload.interface';

interface RequestWithToken {
  headers: {
    authorization?: string;
  };
  tokenPayload?: JwtPayload;
}

/**
 * TokenBlacklistGuard
 *
 * Checks if a JWT token has been blacklisted before allowing access.
 * This guard should be applied globally or to protected routes.
 *
 * Use Cases:
 * - Prevent access with tokens after logout
 * - Enforce token revocation after password change
 * - Block compromised tokens immediately
 *
 * @example
 * // Apply globally in main.ts
 * app.useGlobalGuards(new TokenBlacklistGuard(tokenBlacklistService, jwtService, configService));
 *
 * // Or apply to specific routes
 * @UseGuards(JwtAuthGuard, TokenBlacklistGuard)
 * @Get('protected')
 * protectedRoute() {}
 */
@Injectable()
export class TokenBlacklistGuard implements CanActivate {
  private readonly logger = new Logger(TokenBlacklistGuard.name);

  constructor(
    private tokenBlacklistService: TokenBlacklistService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithToken>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      return true;
    }

    try {
      const jwtSecret = this.configService.get<string>('JWT_SECRET');
      if (!jwtSecret) {
        throw new UnauthorizedException('Server configuration error');
      }

      const payload = this.jwtService.decode(token) as JwtPayload;

      if (!payload || !payload.jti) {
        this.logger.warn('Token without JTI detected - consider regenerating all tokens');
        return true;
      }

      const isBlacklisted = await this.tokenBlacklistService.isBlacklisted(payload.jti);
      if (isBlacklisted) {
        this.logger.warn(`Blocked blacklisted token: ${payload.jti} for user: ${payload.sub}`);
        throw new UnauthorizedException('Token has been revoked');
      }

      if (payload.iat && payload.sub) {
        const isUserTokenBlacklisted = await this.tokenBlacklistService.isUserTokenBlacklisted(
          payload.sub,
          payload.iat,
        );
        if (isUserTokenBlacklisted) {
          this.logger.warn(
            `Blocked token issued before user blacklist for user: ${payload.sub}`,
          );
          throw new UnauthorizedException('Token has been revoked due to security event');
        }
      }

      request.tokenPayload = payload;

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.error('Error checking token blacklist:', error);
      return true;
    }
  }

  private extractTokenFromHeader(request: RequestWithToken): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return undefined;
    }
    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
