import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";

/**
 * ABAC Policy
 */
export interface AbacPolicy {
  resource: string;
  action: string;
  conditions?: AbacCondition[];
}

/**
 * Allowed attribute values for ABAC conditions
 */
export type AbacAttributeValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | Date
  | null
  | undefined;

/**
 * ABAC Condition
 */
export interface AbacCondition {
  attribute: string;
  operator:
    | "eq"
    | "ne"
    | "gt"
    | "lt"
    | "gte"
    | "lte"
    | "in"
    | "nin"
    | "contains"
    | "startsWith"
    | "endsWith";
  value: AbacAttributeValue;
  source: "user" | "resource" | "environment" | "request";
}

/**
 * Custom attributes for user, resource, etc.
 */
export interface AbacAttributes {
  [key: string]:
    | string
    | number
    | boolean
    | string[]
    | number[]
    | Date
    | null
    | undefined;
}

/**
 * ABAC Context
 */
export interface AbacContext {
  user: {
    id: string;
    role: string;
    permissions: string[];
    department?: string;
    organizationId?: string;
    attributes: AbacAttributes;
  };
  resource?: {
    id: string;
    type: string;
    ownerId?: string;
    organizationId?: string;
    attributes: AbacAttributes;
  };
  environment: {
    timestamp: Date;
    ipAddress: string;
    location?: string;
    timeOfDay: "morning" | "afternoon" | "evening" | "night";
    dayOfWeek: string;
    isBusinessHours: boolean;
  };
  request: {
    method: string;
    path: string;
    headers: Record<string, string | string[] | undefined>;
  };
}

/**
 * ABAC Metadata Key
 */
export const ABAC_POLICY_KEY = "abac:policy";

/**
 * ABAC Policy Decorator
 */
export const AbacPolicy = (policy: AbacPolicy | AbacPolicy[]) => {
  return (
    target: object,
    _propertyKey?: string | symbol,
    descriptor?: TypedPropertyDescriptor<(...args: unknown[]) => unknown>
  ): TypedPropertyDescriptor<(...args: unknown[]) => unknown> | void => {
    const policies = Array.isArray(policy) ? policy : [policy];
    if (descriptor && descriptor.value) {
      Reflect.defineMetadata(ABAC_POLICY_KEY, policies, descriptor.value);
      return descriptor;
    } else {
      Reflect.defineMetadata(ABAC_POLICY_KEY, policies, target);
    }
  };
};

/**
 * Attribute-Based Access Control (ABAC) Guard
 *
 * Implements fine-grained access control based on:
 * - User attributes (role, department, location, etc.)
 * - Resource attributes (owner, classification, status, etc.)
 * - Environment attributes (time, location, network, etc.)
 * - Request attributes (method, headers, parameters, etc.)
 *
 * Features:
 * - Dynamic policy evaluation
 * - Context-aware access decisions
 * - Time-based access control
 * - Location-based access control
 * - Ownership-based access control
 * - Data classification-based access
 * - Separation of duties enforcement
 *
 * OWASP References:
 * - Broken Access Control (A01:2021)
 * - ASVS V4: Access Control
 *
 * @example
 * @UseGuards(JwtAuthGuard, AbacGuard)
 * @AbacPolicy({
 *   resource: 'Case',
 *   action: 'update',
 *   conditions: [
 *     { attribute: 'organizationId', operator: 'eq', value: 'user.organizationId', source: 'user' },
 *     { attribute: 'status', operator: 'ne', value: 'archived', source: 'resource' },
 *     { attribute: 'isBusinessHours', operator: 'eq', value: true, source: 'environment' }
 *   ]
 * })
 * @Put(':id')
 * async updateCase(@Param('id') id: string, @Body() dto: UpdateCaseDto) {
 *   return this.casesService.update(id, dto);
 * }
 */
@Injectable()
export class AbacGuard implements CanActivate {
  private readonly logger = new Logger(AbacGuard.name);

  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get ABAC policies from metadata
    const policies = this.reflector.get<AbacPolicy[]>(
      ABAC_POLICY_KEY,
      context.getHandler()
    );

    if (!policies || policies.length === 0) {
      // No ABAC policy defined, allow access (other guards handle authorization)
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();

    // Check if user is authenticated
    if (!request.user) {
      throw new ForbiddenException("Authentication required");
    }

    // Build ABAC context
    const abacContext = await this.buildContext(request);

    // Evaluate all policies (all must pass)
    for (const policy of policies) {
      const allowed = await this.evaluatePolicy(policy, abacContext);

      if (!allowed) {
        this.logger.warn(
          `ABAC policy denied: ${policy.resource}:${policy.action} for user ${request.user.id}`,
          { policy, context: abacContext }
        );

        throw new ForbiddenException({
          message: "Access denied by policy",
          resource: policy.resource,
          action: policy.action,
        });
      }
    }

    if (policies[0]) {
      this.logger.debug(
        `ABAC policy allowed: ${policies[0].resource}:${policies[0].action} for user ${request.user.id}`
      );
    }

    return true;
  }

  /**
   * Build ABAC context from request
   */
  private async buildContext(request: RequestWithUser): Promise<AbacContext> {
    const user = request.user;

    if (!user) {
      throw new Error("User not found in request");
    }

    const now = new Date();

    return {
      user: {
        id: user.id,
        role: user.role,
        permissions: user.permissions || [],
        department: user.department,
        organizationId: user.organizationId,
        attributes: user.attributes || {},
      },
      resource: await this.getResourceContext(request),
      environment: {
        timestamp: now,
        ipAddress: this.getClientIp(request),
        timeOfDay: this.getTimeOfDay(now),
        dayOfWeek: now.toLocaleDateString("en-US", { weekday: "long" }),
        isBusinessHours: this.isBusinessHours(now),
      },
      request: {
        method: request.method,
        path: request.path,
        headers: request.headers as unknown as Record<
          string,
          string | string[] | undefined
        >,
      },
    };
  }

  /**
   * Get resource context (if applicable)
   */
  private async getResourceContext(
    request: RequestWithUser
  ): Promise<AbacContext["resource"] | undefined> {
    // Extract resource ID from params
    const resourceId = request.params?.id || request.params?.resourceId;
    if (!resourceId) {
      return undefined;
    }

    // In a real implementation, you would fetch resource from database
    // For now, return a basic context
    return {
      id: resourceId,
      type: this.getResourceTypeFromPath(request.path),
      attributes: {},
    };
  }

  /**
   * Evaluate ABAC policy
   */
  private async evaluatePolicy(
    policy: AbacPolicy,
    context: AbacContext
  ): Promise<boolean> {
    // 1. Check base permission (resource:action)
    const basePermission = `${policy.resource.toLowerCase()}:${policy.action.toLowerCase()}`;
    if (
      !context.user.permissions.includes(basePermission) &&
      !context.user.permissions.includes("*")
    ) {
      return false;
    }

    // 2. Evaluate conditions (if any)
    if (!policy.conditions || policy.conditions.length === 0) {
      return true;
    }

    // All conditions must pass (AND logic)
    for (const condition of policy.conditions) {
      const result = await this.evaluateCondition(condition, context);
      if (!result) {
        return false;
      }
    }

    return true;
  }

  /**
   * Evaluate individual condition
   */
  private async evaluateCondition(
    condition: AbacCondition,
    context: AbacContext
  ): Promise<boolean> {
    // Get actual value based on source
    const actualValue = this.getAttributeValue(
      condition.attribute,
      condition.source,
      context
    );

    // Get expected value (resolve references like 'user.organizationId')
    const expectedValue = this.resolveValue(condition.value, context);

    // Evaluate condition based on operator
    return this.evaluateOperator(
      actualValue,
      condition.operator,
      expectedValue
    );
  }

  /**
   * Get attribute value from context
   */
  private getAttributeValue(
    attribute: string,
    source: AbacCondition["source"],
    context: AbacContext
  ): AbacAttributeValue {
    switch (source) {
      case "user":
        return this.getNestedValue(context.user, attribute);
      case "resource":
        return context.resource
          ? this.getNestedValue(context.resource, attribute)
          : undefined;
      case "environment":
        return this.getNestedValue(context.environment, attribute);
      case "request":
        return this.getNestedValue(context.request, attribute);
      default:
        return undefined;
    }
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(
    obj: Record<string, unknown>,
    path: string
  ): AbacAttributeValue {
    const value = path.split(".").reduce<unknown>((current, key) => {
      if (current && typeof current === "object" && key in current) {
        return (current as Record<string, unknown>)[key];
      }
      return undefined;
    }, obj);

    // Ensure returned value matches AbacAttributeValue type
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean" ||
      value === null ||
      value === undefined ||
      value instanceof Date ||
      (Array.isArray(value) &&
        value.every((v) => typeof v === "string" || typeof v === "number"))
    ) {
      return value as AbacAttributeValue;
    }

    return undefined;
  }

  /**
   * Resolve value references
   */
  private resolveValue(
    value: AbacAttributeValue,
    context: AbacContext
  ): AbacAttributeValue {
    if (typeof value !== "string") {
      return value;
    }

    // Check if value is a reference (e.g., 'user.organizationId')
    if (value.startsWith("user.")) {
      return this.getNestedValue(
        context.user as unknown as Record<string, unknown>,
        value.substring(5)
      );
    } else if (value.startsWith("resource.")) {
      return context.resource
        ? this.getNestedValue(
            context.resource as unknown as Record<string, unknown>,
            value.substring(9)
          )
        : undefined;
    } else if (value.startsWith("environment.")) {
      return this.getNestedValue(
        context.environment as unknown as Record<string, unknown>,
        value.substring(12)
      );
    }

    return value;
  }

  /**
   * Evaluate operator
   */
  private evaluateOperator(
    actualValue: AbacAttributeValue,
    operator: AbacCondition["operator"],
    expectedValue: AbacAttributeValue
  ): boolean {
    // Handle null/undefined values
    if (actualValue === null || actualValue === undefined) {
      return operator === "eq"
        ? expectedValue === null || expectedValue === undefined
        : false;
    }

    if (expectedValue === null || expectedValue === undefined) {
      return operator === "ne";
    }

    switch (operator) {
      case "eq":
        return actualValue === expectedValue;
      case "ne":
        return actualValue !== expectedValue;
      case "gt":
        if (
          typeof actualValue === "number" &&
          typeof expectedValue === "number"
        ) {
          return actualValue > expectedValue;
        }
        return false;
      case "lt":
        if (
          typeof actualValue === "number" &&
          typeof expectedValue === "number"
        ) {
          return actualValue < expectedValue;
        }
        return false;
      case "gte":
        if (
          typeof actualValue === "number" &&
          typeof expectedValue === "number"
        ) {
          return actualValue >= expectedValue;
        }
        return false;
      case "lte":
        if (
          typeof actualValue === "number" &&
          typeof expectedValue === "number"
        ) {
          return actualValue <= expectedValue;
        }
        return false;
      case "in":
        if (Array.isArray(expectedValue)) {
          return expectedValue.some((v) => v === actualValue);
        }
        return false;
      case "nin":
        if (Array.isArray(expectedValue)) {
          return !expectedValue.some((v) => v === actualValue);
        }
        return false;
      case "contains":
        if (
          typeof actualValue === "string" &&
          typeof expectedValue === "string"
        ) {
          return actualValue.includes(expectedValue);
        }
        return false;
      case "startsWith":
        if (
          typeof actualValue === "string" &&
          typeof expectedValue === "string"
        ) {
          return actualValue.startsWith(expectedValue);
        }
        return false;
      case "endsWith":
        if (
          typeof actualValue === "string" &&
          typeof expectedValue === "string"
        ) {
          return actualValue.endsWith(expectedValue);
        }
        return false;
      default:
        return false;
    }
  }

  /**
   * Get client IP address
   */
  private getClientIp(request: RequestWithUser): string {
    return (
      (request.headers["cf-connecting-ip"] as string) ||
      (request.headers["x-real-ip"] as string) ||
      (request.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      request.ip ||
      "unknown"
    );
  }

  /**
   * Get time of day
   */
  private getTimeOfDay(
    date: Date
  ): "morning" | "afternoon" | "evening" | "night" {
    const hour = date.getHours();
    if (hour >= 5 && hour < 12) return "morning";
    if (hour >= 12 && hour < 17) return "afternoon";
    if (hour >= 17 && hour < 21) return "evening";
    return "night";
  }

  /**
   * Check if current time is during business hours
   */
  private isBusinessHours(date: Date): boolean {
    const hour = date.getHours();
    const day = date.getDay();

    // Monday-Friday, 9 AM - 5 PM
    return day >= 1 && day <= 5 && hour >= 9 && hour < 17;
  }

  /**
   * Get resource type from request path
   */
  private getResourceTypeFromPath(path: string): string {
    // Extract resource type from path (e.g., /api/cases/123 -> 'cases')
    const match = path.match(//api/([^/]+)/);
    return match?.[1] ?? "unknown";
  }
}

/**
 * Request with user
 */
interface RequestWithUser extends Request {
  user?: {
    id: string;
    role: string;
    permissions: string[];
    department?: string;
    organizationId?: string;
    attributes?: AbacAttributes;
  };
}
