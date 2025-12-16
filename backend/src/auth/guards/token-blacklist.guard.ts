import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenBlacklistService } from '../token-blacklist.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

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
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    // If no token, let JwtAuthGuard handle it
    if (!token) {
      return true;
    }

    try {
      // Decode token without full verification (JwtAuthGuard will verify)
      const jwtSecret = this.configService.get<string>('JWT_SECRET');
      if (!jwtSecret) {
        throw new UnauthorizedException('Server configuration error');
      }

      const payload = this.jwtService.decode(token) as JwtPayload;

      if (!payload || !payload.jti) {
        // Token doesn't have JTI - this is an old token, allow it for backwards compatibility
        // In strict mode, you could throw an error here
        this.logger.warn('Token without JTI detected - consider regenerating all tokens');
        return true;
      }

      // Check if token is in the blacklist
      const isBlacklisted = await this.tokenBlacklistService.isBlacklisted(payload.jti);
      if (isBlacklisted) {
        this.logger.warn(`Blocked blacklisted token: ${payload.jti} for user: ${payload.sub}`);
        throw new UnauthorizedException('Token has been revoked');
      }

      // Check if token was issued before user-level blacklist (e.g., after password change)
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

      // Attach payload to request for downstream use
      request.tokenPayload = payload;

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      // Log error but allow JwtAuthGuard to handle token validation
      this.logger.error('Error checking token blacklist:', error);
      return true;
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
