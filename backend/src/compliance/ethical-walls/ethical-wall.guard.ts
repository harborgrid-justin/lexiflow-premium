import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { EthicalWallsService } from './ethical-walls.service';

@Injectable()
export class EthicalWallGuard implements CanActivate {
  constructor(private readonly ethicalWallsService: EthicalWallsService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }

  private async validateRequest(request: unknown): Promise<boolean> {
    const user = (request as any).user;
    if (!user) {
      // No user context, allow (auth should be handled by another guard)
      return true;
    }

    // Extract entity information from the request
    const entityInfo = this.extractEntityInfo(request);
    if (!entityInfo) {
      // Can't determine entity, allow (specific endpoints may not need wall checks)
      return true;
    }

    // Check if user has access
    const checkResult = await this.ethicalWallsService.checkAccess({
      userId: user.id,
      entityType: entityInfo.entityType,
      entityId: entityInfo.entityId,
    });

    if (checkResult.blocked) {
      throw new Error(
        `Access denied: ${checkResult.message}. Ethical wall restrictions apply.`,
      );
    }

    return true;
  }

  private extractEntityInfo(request: unknown): {
    entityType: string;
    entityId: string;
  } | null {
    // Extract from URL params
    const url = (request as any).url;

    // Pattern matching for common entity routes
    const patterns = [
      { regex: //cases/([^/]+)/, type: 'Case' },
      { regex: //clients/([^/]+)/, type: 'Client' },
      { regex: //documents/([^/]+)/, type: 'Document' },
      { regex: //matters/([^/]+)/, type: 'Matter' },
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern.regex);
      if (match) {
        return {
          entityType: pattern.type,
          entityId: match[1],
        };
      }
    }

    // Check body for entity information
    if ((request as any).body) {
      if ((request as any).body.caseId) {
        return { entityType: 'Case', entityId: (request as any).body.caseId };
      }
      if ((request as any).body.clientId) {
        return { entityType: 'Client', entityId: (request as any).body.clientId };
      }
      if ((request as any).body.documentId) {
        return { entityType: 'Document', entityId: (request as any).body.documentId };
      }
    }

    return null;
  }
}
