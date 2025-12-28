import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException, SetMetadata, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ApiKeyService } from '@api-keys/services/api.key.service';
import { ApiKeyScope } from '@api-security/dto';

interface RequestWithApiKey extends Request {
  apiKey?: {
    id: string;
    name: string;
    scopes: string[];
    userId: string;
  };
}

export const REQUIRED_SCOPES_KEY = 'requiredScopes';
export const RequiredScopes = (...scopes: ApiKeyScope[]) => SetMetadata(REQUIRED_SCOPES_KEY, scopes);

export const SKIP_API_KEY_AUTH_KEY = 'skipApiKeyAuth';
export const SkipApiKeyAuth = () => SetMetadata(SKIP_API_KEY_AUTH_KEY, true);

@Injectable()
export class ApiKeyScopeGuard implements CanActivate {
  private readonly logger = new Logger(ApiKeyScopeGuard.name);

  constructor(
    private readonly apiKeyService: ApiKeyService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if API key auth should be skipped
    const skipAuth = this.reflector.getAllAndOverride<boolean>(SKIP_API_KEY_AUTH_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skipAuth) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithApiKey>();

    // Extract API key from header
    const apiKey = this.extractApiKey(request);

    if (!apiKey) {
      throw new UnauthorizedException('API key is required');
    }

    // Get required scopes from decorator
    const requiredScopes = this.reflector.getAllAndOverride<ApiKeyScope[]>(REQUIRED_SCOPES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) || [];

    // Get client IP
    const clientIp = this.getClientIp(request);

    try {
      // Validate API key with scopes and IP
      const validatedKey = await this.apiKeyService.validate(apiKey, {
        requiredScopes,
        clientIp,
      });

      // Attach API key info to request for use in controllers
      request.apiKey = {
        id: validatedKey.id,
        name: validatedKey.name,
        scopes: validatedKey.scopes,
        userId: validatedKey.userId,
      };

      this.logger.debug(
        `API key "${validatedKey.name}" validated successfully for ${request.method} ${request.path}`
      );

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof ForbiddenException) {
        throw error;
      }

      this.logger.error('API key validation failed', error);
      throw new UnauthorizedException('Invalid API key');
    }
  }

  private extractApiKey(request: Request): string | null {
    // Check X-API-Key header
    const apiKeyHeader = request.headers['x-api-key'] as string;
    if (apiKeyHeader) {
      return apiKeyHeader;
    }

    // Check Authorization header with Bearer scheme
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Check query parameter (less secure, but supported for some use cases)
    const apiKeyQuery = request.query['api_key'] as string;
    if (apiKeyQuery) {
      return apiKeyQuery;
    }

    return null;
  }

  private getClientIp(request: Request): string {
    // Check for forwarded IP (behind proxy/load balancer)
    const forwardedFor = request.headers['x-forwarded-for'];
    if (forwardedFor && typeof forwardedFor === 'string') {
      // Get the first IP in the chain
      const firstIp = forwardedFor.split(',')[0];
      if (firstIp) {
        return firstIp.trim();
      }
    }

    // Check for real IP (some proxies use this)
    const realIp = request.headers['x-real-ip'] as string;
    if (realIp) {
      return realIp;
    }

    // Fall back to connection IP
    return request.ip || request.socket.remoteAddress || 'unknown';
  }
}
