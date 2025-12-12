import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiKeysService } from '../api-keys.service';
import { Reflector } from '@nestjs/core';
import { ApiKeyScope } from '../dto';

export const API_KEY_SCOPES = 'apiKeyScopes';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private apiKeysService: ApiKeysService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = this.extractApiKey(request);

    if (!apiKey) {
      throw new UnauthorizedException('API key is required');
    }

    try {
      // Validate API key
      const validatedKey = await this.apiKeysService.validate(apiKey);

      // Check required scopes
      const requiredScopes = this.reflector.getAllAndOverride<ApiKeyScope[]>(
        API_KEY_SCOPES,
        [context.getHandler(), context.getClass()],
      );

      if (requiredScopes && requiredScopes.length > 0) {
        const hasRequiredScopes = requiredScopes.every(scope =>
          validatedKey.scopes.includes(scope),
        );

        if (!hasRequiredScopes) {
          throw new UnauthorizedException(
            'API key does not have required scopes',
          );
        }
      }

      // Attach validated key to request
      request.apiKey = validatedKey;

      return true;
    } catch (error) {
      throw new UnauthorizedException(error.message || 'Invalid API key');
    }
  }

  private extractApiKey(request: any): string | undefined {
    // Check Authorization header (Bearer token)
    const authHeader = request.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Check X-API-Key header
    const apiKeyHeader = request.headers['x-api-key'];
    if (apiKeyHeader) {
      return apiKeyHeader;
    }

    // Check query parameter
    const queryApiKey = request.query['api_key'];
    if (queryApiKey) {
      return queryApiKey;
    }

    return undefined;
  }
}
