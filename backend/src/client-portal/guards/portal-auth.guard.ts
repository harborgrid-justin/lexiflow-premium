import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PortalUser } from '../entities/portal-user.entity';

/**
 * Portal Authentication Guard
 *
 * Validates JWT tokens for client portal access
 * Ensures:
 * - Valid JWT token in Authorization header
 * - Token belongs to an active portal user
 * - User account is not locked
 * - Email is verified
 * - Token has not expired
 */
@Injectable()
export class PortalAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(PortalUser)
    private readonly portalUserRepository: Repository<PortalUser>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No authentication token provided');
    }

    try {
      // Verify and decode the JWT token
      const payload = this.jwtService.verify(token);

      // Verify this is a portal token
      if (payload.type !== 'portal') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Get the portal user from the database
      const portalUser = await this.portalUserRepository.findOne({
        where: { id: payload.sub },
        relations: ['client'],
      });

      if (!portalUser) {
        throw new UnauthorizedException('Portal user not found');
      }

      // Check if account is locked
      if (portalUser.lockedUntil && portalUser.lockedUntil > new Date()) {
        throw new UnauthorizedException('Account is locked');
      }

      // Check if email is verified
      if (!portalUser.emailVerified) {
        throw new UnauthorizedException('Email not verified');
      }

      // Check if user status is active
      if (portalUser.status !== 'active') {
        throw new UnauthorizedException('Account is not active');
      }

      // Check if the stored token matches
      if (portalUser.accessToken !== token) {
        throw new UnauthorizedException('Token has been revoked');
      }

      // Check if token has expired
      if (portalUser.tokenExpiry && portalUser.tokenExpiry < new Date()) {
        throw new UnauthorizedException('Token has expired');
      }

      // Attach the portal user to the request
      request.portalUser = portalUser;
      request.user = {
        id: portalUser.id,
        email: portalUser.email,
        clientId: portalUser.clientId,
        type: 'portal',
      };

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid authentication token');
    }
  }

  /**
   * Extract JWT token from Authorization header
   */
  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
