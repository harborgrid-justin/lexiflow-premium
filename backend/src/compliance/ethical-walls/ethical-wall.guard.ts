import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Request } from "express";
import { Observable } from "rxjs";
import { EthicalWallsService } from "./ethical-walls.service";

interface RequestWithUser extends Request {
  user?: { id: string };
}

@Injectable()
export class EthicalWallGuard implements CanActivate {
  constructor(private readonly ethicalWallsService: EthicalWallsService) {}

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    return this.validateRequest(request);
  }

  private async validateRequest(request: RequestWithUser): Promise<boolean> {
    const user = request.user;
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
        `Access denied: ${checkResult.message}. Ethical wall restrictions apply.`
      );
    }

    return true;
  }

  private extractEntityInfo(request: RequestWithUser): {
    entityType: string;
    entityId: string;
  } | null {
    // Extract from URL params
    const url = request.url;

    // Pattern matching for common entity routes
    const patterns = [
      { regex: /\/cases\/([^/]+)\//, type: "Case" },
      { regex: /\/clients\/([^/]+)\//, type: "Client" },
      { regex: /\/documents\/([^/]+)\//, type: "Document" },
      { regex: /\/matters\/([^/]+)\//, type: "Matter" },
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern.regex);
      if (match && match[1]) {
        return {
          entityType: pattern.type,
          entityId: match[1],
        };
      }
    }

    // Check body for entity information
    const body = request.body as Record<string, unknown> | undefined;
    if (body) {
      if (typeof body.caseId === "string") {
        return { entityType: "Case", entityId: body.caseId };
      }
      if (typeof body.clientId === "string") {
        return {
          entityType: "Client",
          entityId: body.clientId,
        };
      }
      if (typeof body.documentId === "string") {
        return {
          entityType: "Document",
          entityId: body.documentId,
        };
      }
    }

    return null;
  }
}
