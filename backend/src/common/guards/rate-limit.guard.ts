import { RateLimitService } from "@api-security/services/rate.limit.service";
import {
  RATE_LIMIT_KEY,
  RateLimitOptions,
} from "@common/decorators/rate-limit.decorator";
import { UserRole as AppUserRole } from "@common/enums/role.enum";
import { UserRole as RateLimitUserRole } from "@api-security/services/rate.limit.service";
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request, Response } from "express";

interface RequestWithUser extends Request {
  user?: {
    id: string;
    role: string;
    email?: string;
  };
  ip: string;
}

/**
 * Enterprise Rate Limiting Guard
 *
 * Implements distributed rate limiting with multiple strategies:
 * - Per-user rate limiting based on role
 * - Per-endpoint rate limiting
 * - Per-IP rate limiting
 * - Burst protection
 *
 * Features:
 * - Redis-based distributed rate limiting
 * - Automatic fallback to in-memory storage
 * - Configurable limits per endpoint using @RateLimit() decorator
 * - Role-based rate limits
 * - Standard rate limit headers (X-RateLimit-*)
 * - Retry-After header for 429 responses
 *
 * @example
 * @UseGuards(RateLimitGuard)
 * @RateLimit({ points: 10, duration: 60 })
 * @Get('search')
 * async search() { ... }
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly logger = new Logger(RateLimitGuard.name);

  constructor(
    private readonly rateLimitService: RateLimitService,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const response = context.switchToHttp().getResponse<Response>();

    // Get custom rate limit options from decorator
    const customLimit = this.reflector.get<RateLimitOptions>(
      RATE_LIMIT_KEY,
      context.getHandler()
    );

    // Check if rate limiting should be applied
    if (this.shouldSkipRateLimiting(request)) {
      return true;
    }

    try {
      // Apply multiple rate limiting strategies
      await this.applyRateLimits(request, response, customLimit);
      return true;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error("Rate limit check failed:", error);
      // Fail open - allow request if rate limiting system has errors
      return true;
    }
  }

  /**
   * Apply all rate limiting strategies
   */
  private async applyRateLimits(
    request: RequestWithUser,
    response: Response,
    customLimit?: RateLimitOptions
  ): Promise<void> {
    const userId = request.user?.id || "anonymous";
    const userRole = request.user?.role || "guest";

    // Map app UserRole to rate limit UserRole
    function mapToRateLimitUserRole(role: string): RateLimitUserRole {
      switch (role) {
        case AppUserRole.SUPER_ADMIN:
        case AppUserRole.ADMIN:
        case AppUserRole.IT_ADMIN:
          return RateLimitUserRole.ADMIN;
        case AppUserRole.PARTNER:
        case AppUserRole.SENIOR_ASSOCIATE:
        case AppUserRole.ASSOCIATE:
        case AppUserRole.JUNIOR_ASSOCIATE:
        case AppUserRole.ATTORNEY:
        case AppUserRole.PARALEGAL:
        case AppUserRole.LEGAL_ASSISTANT:
        case AppUserRole.CLERK:
        case AppUserRole.INTERN:
        case AppUserRole.ACCOUNTANT:
        case AppUserRole.BILLING_SPECIALIST:
        case AppUserRole.STAFF:
        case AppUserRole.USER:
        case AppUserRole.CLIENT:
          return RateLimitUserRole.BASIC;
        default:
          return RateLimitUserRole.GUEST;
      }
    }
    const ip = this.getClientIp(request);
    const endpoint = `${request.method}:${request.path}`;

    // 1. Check IP-based rate limit (first line of defense)
    const ipResult = await this.rateLimitService.checkIpLimit(ip);
    this.setRateLimitHeaders(response, ipResult, "ip");

    if (!ipResult.allowed) {
      this.logger.warn(`IP rate limit exceeded for ${ip}`);
      this.throwRateLimitError(ipResult);
    }

    // 2. Check endpoint-specific rate limit (if custom limit provided)
    if (customLimit) {
      const endpointResult = await this.rateLimitService.checkRateLimit(
        `${endpoint}:${userId}`,
        "endpoint",
        {
          limit: customLimit.points,
          windowMs: customLimit.duration * 1000,
        }
      );

      this.setRateLimitHeaders(response, endpointResult, "endpoint");

      if (!endpointResult.allowed) {
        this.logger.warn(
          `Endpoint rate limit exceeded for ${endpoint} by user ${userId}`
        );
        this.throwRateLimitError(endpointResult);
      }
    } else {
      // Use default endpoint limits
      const endpointResult = await this.rateLimitService.checkEndpointLimit(
        endpoint,
        userId
      );

      this.setRateLimitHeaders(response, endpointResult, "endpoint");

      if (!endpointResult.allowed) {
        this.logger.warn(
          `Endpoint rate limit exceeded for ${endpoint} by user ${userId}`
        );
        this.throwRateLimitError(endpointResult);
      }
    }

    // 3. Check role-based rate limit (if user is authenticated)
    if (request.user) {
      const roleResult = await this.rateLimitService.checkRoleBased(
        userId,
        mapToRateLimitUserRole(userRole)
      );

      this.setRateLimitHeaders(response, roleResult, "role");

      if (!roleResult.allowed) {
        this.logger.warn(
          `Role rate limit exceeded for user ${userId} with role ${userRole}`
        );
        this.throwRateLimitError(roleResult);
      }

      // 4. Check burst protection
      const burstResult = await this.rateLimitService.checkBurst(
        userId,
        mapToRateLimitUserRole(userRole)
      );

      if (!burstResult.allowed) {
        this.logger.warn(`Burst rate limit exceeded for user ${userId}`);
        this.throwRateLimitError(burstResult);
      }
    }
  }

  /**
   * Set standard rate limit headers
   */
  private setRateLimitHeaders(
    response: Response,
    result: unknown,
    type: string
  ): void {
    const rateLimitResult = result as {
      limit: number;
      remaining: number;
      resetAt: Date;
    };
    response.setHeader(`X-RateLimit-Limit-${type}`, rateLimitResult.limit);
    response.setHeader(
      `X-RateLimit-Remaining-${type}`,
      Math.max(0, rateLimitResult.remaining)
    );
    response.setHeader(
      `X-RateLimit-Reset-${type}`,
      rateLimitResult.resetAt.toISOString()
    );
  }

  /**
   * Throw rate limit exceeded error
   */
  private throwRateLimitError(result: unknown): never {
    const rateLimitResult = result as { retryAfter?: number; resetAt: Date };
    const retryAfter = rateLimitResult.retryAfter || 60;

    throw new HttpException(
      {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: "Rate limit exceeded. Please try again later.",
        error: "Too Many Requests",
        retryAfter,
        resetAt: rateLimitResult.resetAt,
      },
      HttpStatus.TOO_MANY_REQUESTS,
      {
        cause: new Error("Rate limit exceeded"),
      }
    );
  }

  /**
   * Get client IP address
   */
  private getClientIp(request: RequestWithUser): string {
    // Check various headers for IP (in order of trust)
    const cfConnectingIp = request.headers["cf-connecting-ip"] as string;
    const xRealIp = request.headers["x-real-ip"] as string;
    const xForwardedFor = request.headers["x-forwarded-for"] as string;

    if (cfConnectingIp) {
      return cfConnectingIp;
    }

    if (xRealIp) {
      return xRealIp;
    }

    if (xForwardedFor) {
      // X-Forwarded-For can contain multiple IPs, take the first one
      return xForwardedFor.split(",")[0]?.trim() || "unknown";
    }

    return request.ip || request.socket?.remoteAddress || "unknown";
  }

  /**
   * Check if rate limiting should be skipped for this request
   */
  private shouldSkipRateLimiting(request: RequestWithUser): boolean {
    // Skip rate limiting for health checks
    const healthCheckPaths = ["/health", "/api/health", "/ping"];
    if (healthCheckPaths.includes(request.path)) {
      return true;
    }

    // Skip for internal service calls (if identified by special header)
    const isInternalCall = request.headers["x-internal-service"] === "true";
    if (isInternalCall) {
      return true;
    }

    return false;
  }
}
