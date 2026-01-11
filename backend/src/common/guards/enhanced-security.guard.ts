import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

/**
 * User information attached to request
 */
export interface UserPayload {
  id: string;
  email?: string;
  roles?: string[];
  permissions?: string[];
  organizationId?: string;
}

/**
 * Request with user attached
 */
export interface RequestWithUser extends Request {
  user: UserPayload;
  resourceOwnerId?: string;
  correlationId?: string;
}

/**
 * Metadata keys for security decorators
 */
export const ROLES_KEY = 'roles';
export const PERMISSIONS_KEY = 'permissions';
export const IP_WHITELIST_KEY = 'ipWhitelist';
export const RATE_LIMIT_KEY = 'rateLimit';

/**
 * Roles Guard
 * Checks if user has required roles
 */
@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
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
      throw new UnauthorizedException('User not authenticated');
    }

    const hasRole = requiredRoles.some((role: string) =>
      user.roles?.includes(role),
    );

    if (!hasRole) {
      this.logger.warn(
        `User ${user.id} attempted to access resource requiring roles: ${requiredRoles.join(', ')}`,
      );
      throw new ForbiddenException(
        `Insufficient permissions. Required roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}

/**
 * Permissions Guard
 * Checks if user has required permissions
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const hasPermission = requiredPermissions.every((permission: string) =>
      user.permissions?.includes(permission),
    );

    if (!hasPermission) {
      this.logger.warn(
        `User ${user.id} attempted to access resource requiring permissions: ${requiredPermissions.join(', ')}`,
      );
      throw new ForbiddenException(
        `Insufficient permissions. Required: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }
}

/**
 * IP Whitelist Guard
 * Checks if request is from whitelisted IP
 */
@Injectable()
export class IpWhitelistGuard implements CanActivate {
  private readonly logger = new Logger(IpWhitelistGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const whitelistedIps = this.reflector.getAllAndOverride<string[]>(
      IP_WHITELIST_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!whitelistedIps || whitelistedIps.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const clientIp = this.getClientIp(request);

    if (!clientIp) {
      throw new ForbiddenException('Unable to determine client IP address');
    }

    const isWhitelisted = whitelistedIps.some((ip: string) =>
      this.matchIp(clientIp, ip),
    );

    if (!isWhitelisted) {
      this.logger.warn(`Request from non-whitelisted IP: ${clientIp}`);
      throw new ForbiddenException('Access denied from your IP address');
    }

    return true;
  }

  /**
   * Get client IP from request
   */
  private getClientIp(request: Request): string | undefined {
    const forwarded = request.headers['x-forwarded-for'];

    if (forwarded) {
      const ips = Array.isArray(forwarded) ? forwarded : forwarded.split(',');
      return ips[0]?.trim();
    }

    return request.ip || request.socket.remoteAddress;
  }

  /**
   * Match IP address (supports CIDR notation)
   */
  private matchIp(clientIp: string, allowedIp: string): boolean {
    // Exact match
    if (clientIp === allowedIp) {
      return true;
    }

    // CIDR notation support (basic implementation)
    if (allowedIp.includes('/')) {
      // For production, use a proper CIDR library like 'ip-range-check'
      const [network, bits] = allowedIp.split('/');
      if (!network || !bits) {
        return false;
      }
      const prefixLength = parseInt(bits, 10) / 8;
      return clientIp.startsWith(
        network.split('.').slice(0, prefixLength).join('.'),
      );
    }

    // Wildcard support
    if (allowedIp.includes('*')) {
      const pattern = allowedIp.replace(/./g, '\.').replace(/\*/g, '.*');
      return new RegExp(`^${pattern}$`).test(clientIp);
    }

    return false;
  }
}

/**
 * Owner Guard
 * Checks if user is the owner of the resource
 */
@Injectable()
export class OwnerGuard implements CanActivate {
  private readonly logger = new Logger(OwnerGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Get resource ID from params
    const resourceId = request.params.id;
    if (!resourceId) {
      return true; // No resource ID, let other guards handle it
    }

    // Get resource owner ID from request metadata
    // This would typically be fetched from database
    const resourceOwnerId = request.resourceOwnerId;

    if (!resourceOwnerId) {
      // If no owner ID is set, allow access (other guards will handle authorization)
      return true;
    }

    const isOwner = user.id === resourceOwnerId;

    if (!isOwner) {
      this.logger.warn(
        `User ${user.id} attempted to access resource owned by ${resourceOwnerId}`,
      );
      throw new ForbiddenException('You do not have permission to access this resource');
    }

    return true;
  }
}

/**
 * API Key Guard
 * Validates API key from request headers
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(ApiKeyGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = this.extractApiKey(request);

    if (!apiKey) {
      throw new UnauthorizedException('API key is required');
    }

    // Validate API key (this would typically check against database)
    const isValid = this.validateApiKey(apiKey);

    if (!isValid) {
      this.logger.warn(`Invalid API key attempt: ${apiKey.substring(0, 10)}...`);
      throw new UnauthorizedException('Invalid API key');
    }

    return true;
  }

  /**
   * Extract API key from request
   */
  private extractApiKey(request: Request): string | undefined {
    // Check headers
    const headerKey = request.headers['x-api-key'] || request.headers['authorization'];

    if (headerKey) {
      if (typeof headerKey === 'string') {
        // Remove 'Bearer ' prefix if present
        return headerKey.replace(/^Bearer\s+/i, '');
      }
      if (Array.isArray(headerKey)) {
        return headerKey[0];
      }
    }

    // Check query params (less secure, but sometimes needed)
    return request.query.apiKey as string;
  }

  /**
   * Validate API key
   * In production, this would check against database
   */
  private validateApiKey(apiKey: string): boolean {
    // TODO: Implement actual API key validation
    // This is a placeholder implementation
    return apiKey.length >= 32;
  }
}

/**
 * Request Signature Guard
 * Validates HMAC signature of request
 */
@Injectable()
export class RequestSignatureGuard implements CanActivate {
  private readonly logger = new Logger(RequestSignatureGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const signature = request.headers['x-signature'];
    const timestamp = request.headers['x-timestamp'];

    if (!signature || !timestamp) {
      throw new UnauthorizedException('Request signature and timestamp required');
    }

    // Validate timestamp (prevent replay attacks)
    const requestTime = parseInt(timestamp as string, 10);
    const currentTime = Date.now();
    const timeDiff = Math.abs(currentTime - requestTime);

    // Allow 5 minute window
    if (timeDiff > 5 * 60 * 1000) {
      throw new UnauthorizedException('Request timestamp is too old');
    }

    // Validate signature
    const isValid = this.validateSignature(request, signature as string, timestamp as string);

    if (!isValid) {
      this.logger.warn('Invalid request signature');
      throw new UnauthorizedException('Invalid request signature');
    }

    return true;
  }

  /**
   * Validate HMAC signature
   */
  private validateSignature(
    request: Request,
    signature: string,
    timestamp: string,
  ): boolean {
    // TODO: Implement actual signature validation
    // This would use crypto.createHmac with a shared secret
     
    import crypto from \'crypto\';

    // Get secret from environment or database
    const secret = process.env.WEBHOOK_SECRET || 'default-secret';

    // Create signature payload
    const payload = `${timestamp}.${request.method}.${request.url}.${JSON.stringify(request.body)}`;

    // Generate expected signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    // Compare signatures (timing-safe comparison)
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );
  }
}

/**
 * CORS Guard
 * Enhanced CORS validation
 */
@Injectable()
export class CorsGuard implements CanActivate {
  private readonly logger = new Logger(CorsGuard.name);

  private readonly allowedOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const origin = request.headers.origin;

    if (!origin) {
      // No origin header, likely same-origin request
      return true;
    }

    if (this.allowedOrigins.length === 0) {
      // No specific origins configured, allow all (not recommended for production)
      return true;
    }

    const isAllowed = this.allowedOrigins.some((allowedOrigin) => {
      if (allowedOrigin === '*') {
        return true;
      }
      return origin === allowedOrigin || origin.endsWith(`.${allowedOrigin}`);
    });

    if (!isAllowed) {
      this.logger.warn(`Request from non-whitelisted origin: ${origin}`);
      throw new ForbiddenException('Origin not allowed');
    }

    return true;
  }
}
