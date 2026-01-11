import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Request } from "express";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { AuditLogsService } from "./audit-logs.service";
import { AuditAction, AuditEntityType } from "./dto/audit-log.dto";

interface AuditUser {
  id: string;
  name?: string;
  email?: string;
  organizationId?: string;
}

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: AuditUser }>();
    const method = request.method;
    const url = request.url;
    const user = request.user || { id: "system", name: "System" };

    return next.handle().pipe(
      tap(async (response) => {
        // Extract audit information from the request/response
        const auditInfo = this.extractAuditInfo(method, url, response, user);

        if (auditInfo) {
          const responseObj = context.switchToHttp().getResponse() as {
            statusCode: number;
          };
          await this.auditLogsService.create({
            userId: user.id,
            userName: user.name || user.email || user.id,
            action: auditInfo.action,
            entityType: auditInfo.entityType,
            entityId: auditInfo.entityId,
            entityName: auditInfo.entityName,
            changes: auditInfo.changes,
            metadata: {
              method,
              url,
              statusCode: responseObj.statusCode,
            },
            ipAddress: request.ip || "unknown",
            userAgent: request.headers["user-agent"],
            organizationId: user.organizationId || "default",
          });
        }
      })
    );
  }

  private extractAuditInfo(
    method: string,
    url: string,
    response: unknown,
    _user: unknown
  ): {
    action: AuditAction;
    entityType: AuditEntityType;
    entityId: string;
    entityName?: string;
    changes?: Record<string, unknown>;
  } | null {
    // Map HTTP methods to audit actions
    const actionMap: Record<string, AuditAction> = {
      POST: AuditAction.CREATE,
      GET: AuditAction.READ,
      PUT: AuditAction.UPDATE,
      PATCH: AuditAction.UPDATE,
      DELETE: AuditAction.DELETE,
    };

    const action = actionMap[method];
    if (!action) return null;

    // Extract entity type and ID from URL
    // Pattern: /api/v1/{entityType}/{entityId}
    const urlPattern = /\/api\/v1\/([^/]+)(?:\/([^/?]+))?/;
    const match = url.match(urlPattern);

    if (!match) return null;

    const entityTypeStr = match[1];

    let responseId: string | undefined;
    let responseName: string | undefined;
    let responseChanges: Record<string, unknown> | undefined;

    if (response && typeof response === "object" && response !== null) {
      const resp = response as Record<string, unknown>;
      if (typeof resp.id === "string") responseId = resp.id;
      if (typeof resp.name === "string") responseName = resp.name;
      else if (typeof resp.title === "string") responseName = resp.title;

      if (method !== "GET") {
        responseChanges = resp;
      }
    }

    const entityId = match[2] || responseId || "unknown";

    // Map URL paths to entity types
    const entityTypeMap: Record<string, AuditEntityType> = {
      cases: AuditEntityType.CASE,
      documents: AuditEntityType.DOCUMENT,
      "time-entries": AuditEntityType.TIME_ENTRY,
      invoices: AuditEntityType.INVOICE,
      users: AuditEntityType.USER,
      clients: AuditEntityType.CLIENT,
      evidence: AuditEntityType.EVIDENCE,
      discovery: AuditEntityType.DISCOVERY,
      motions: AuditEntityType.MOTION,
    };

    const entityType = entityTypeStr ? entityTypeMap[entityTypeStr] : undefined;
    if (!entityType) return null;

    return {
      action,
      entityType,
      entityId,
      entityName: responseName,
      changes: responseChanges,
    };
  }
}
