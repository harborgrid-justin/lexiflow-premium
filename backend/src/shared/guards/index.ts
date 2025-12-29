/**
 * Shared Guards
 * Central export point for all guards used in LexiFlow Premium
 *
 * This file provides a single import point for all guards across the application.
 * Guards are used for authentication, authorization, and request validation.
 */

// =============================================================================
// AUTHENTICATION GUARDS
// =============================================================================

/**
 * JwtAuthGuard
 * Validates JWT tokens and ensures user is authenticated
 *
 * Usage:
 * ```typescript
 * @UseGuards(JwtAuthGuard)
 * @Get('protected')
 * async protectedRoute() { ... }
 * ```
 *
 * Note: This guard is applied globally and can be bypassed with @Public() decorator
 */
export { JwtAuthGuard } from '@common/guards/jwt-auth.guard';

// =============================================================================
// AUTHORIZATION GUARDS
// =============================================================================

/**
 * RolesGuard
 * Validates user has required roles to access a route
 *
 * Usage:
 * ```typescript
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles('admin', 'manager')
 * @Get('admin')
 * async adminRoute() { ... }
 * ```
 *
 * Requires: @Roles() decorator on the route handler
 */
export { RolesGuard } from '@common/guards/roles.guard';

/**
 * PermissionsGuard
 * Validates user has required permissions to access a route
 *
 * Usage:
 * ```typescript
 * @UseGuards(JwtAuthGuard, PermissionsGuard)
 * @Permissions('case:read', 'case:write')
 * @Get('cases')
 * async getCases() { ... }
 * ```
 *
 * Requires: @Permissions() decorator on the route handler
 */
export { PermissionsGuard } from '@common/guards/permissions.guard';

// =============================================================================
// WEBSOCKET GUARDS
// =============================================================================

/**
 * WsRateLimitGuard
 * Rate limiting for WebSocket connections
 *
 * Usage:
 * ```typescript
 * @UseGuards(WsRateLimitGuard)
 * @SubscribeMessage('message')
 * handleMessage(client: Socket, payload: unknown) { ... }
 * ```
 *
 * Prevents abuse of WebSocket message endpoints
 */
export { WsRateLimitGuard } from '@common/guards/ws-rate-limit.guard';

/**
 * WsRoomLimitGuard
 * Limits number of WebSocket rooms a user can join
 *
 * Usage:
 * ```typescript
 * @UseGuards(WsRoomLimitGuard)
 * @SubscribeMessage('joinRoom')
 * handleJoinRoom(client: Socket, room: string) { ... }
 * ```
 *
 * Prevents resource exhaustion from unlimited room joins
 */
export { WsRoomLimitGuard } from '@common/guards/ws-room-limit.guard';

/**
 * WsConnectionLimitGuard
 * Limits concurrent WebSocket connections per user
 *
 * Usage:
 * ```typescript
 * @UseGuards(WsConnectionLimitGuard)
 * handleConnection(client: Socket) { ... }
 * ```
 *
 * Prevents abuse of WebSocket connections
 */
export { WsConnectionLimitGuard } from '@common/guards/ws-connection-limit.guard';

// =============================================================================
// SECURITY GUARDS
// =============================================================================

/**
 * IpReputationGuard
 * Blocks requests from IP addresses with bad reputation
 *
 * Usage:
 * ```typescript
 * @UseGuards(IpReputationGuard)
 * @Post('sensitive-operation')
 * async sensitiveOperation() { ... }
 * ```
 *
 * Can be bypassed with @SkipIpCheck() decorator
 */
export { IpReputationGuard } from '@security/guards/ip.reputation.guard';

// =============================================================================
// GUARD USAGE GUIDELINES
// =============================================================================

/**
 * GUARD BEST PRACTICES:
 *
 * 1. Authentication Flow:
 *    - JwtAuthGuard is typically applied globally via APP_GUARD
 *    - Use @Public() decorator to bypass authentication on public routes
 *    - Always validate JWT tokens before checking roles/permissions
 *
 * 2. Authorization Flow:
 *    - Apply guards in order: Authentication → Roles → Permissions
 *    - Use RolesGuard for coarse-grained access control
 *    - Use PermissionsGuard for fine-grained feature access
 *    - Combine both for layered security when needed
 *
 * 3. Guard Ordering:
 *    When using multiple guards, order matters:
 *    ```typescript
 *    @UseGuards(
 *      JwtAuthGuard,        // 1. Authenticate user
 *      RolesGuard,          // 2. Check user role
 *      PermissionsGuard,    // 3. Check specific permissions
 *      IpReputationGuard,   // 4. Check IP reputation
 *    )
 *    ```
 *
 * 4. WebSocket Guards:
 *    - Apply rate limiting guards to prevent message flooding
 *    - Use connection limit guards on gateway level
 *    - Use room limit guards to prevent resource exhaustion
 *    - Consider authentication guards for sensitive WebSocket events
 *
 * 5. Security Guards:
 *    - IpReputationGuard should be applied to sensitive operations
 *    - Use @SkipIpCheck() sparingly and only for trusted endpoints
 *    - Combine with rate limiting for defense in depth
 *
 * 6. Global Guards:
 *    Apply common guards globally in AppModule:
 *    ```typescript
 *    {
 *      provide: APP_GUARD,
 *      useClass: JwtAuthGuard,
 *    },
 *    {
 *      provide: APP_GUARD,
 *      useClass: RolesGuard,
 *    },
 *    ```
 *
 * 7. Custom Guards:
 *    When creating custom guards:
 *    - Implement CanActivate interface
 *    - Return boolean or Promise<boolean>
 *    - Throw appropriate exceptions (UnauthorizedException, ForbiddenException)
 *    - Consider reflection metadata for decorator-based configuration
 *    - Keep guards focused on a single responsibility
 *
 * 8. Error Handling:
 *    Guards should throw specific exceptions:
 *    - UnauthorizedException: User not authenticated
 *    - ForbiddenException: User authenticated but lacks permission
 *    - TooManyRequestsException: Rate limit exceeded
 *
 * COMMON PATTERNS:
 *
 * Pattern 1: Protected API endpoint with role check
 * ```typescript
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles('admin')
 * @Get('admin/users')
 * async getUsers() { ... }
 * ```
 *
 * Pattern 2: Public endpoint (no authentication)
 * ```typescript
 * @Public()
 * @Get('public/info')
 * async getPublicInfo() { ... }
 * ```
 *
 * Pattern 3: Fine-grained permission check
 * ```typescript
 * @UseGuards(JwtAuthGuard, PermissionsGuard)
 * @Permissions('case:delete')
 * @Delete('cases/:id')
 * async deleteCase() { ... }
 * ```
 *
 * Pattern 4: Combined authentication and security
 * ```typescript
 * @UseGuards(JwtAuthGuard, RolesGuard, IpReputationGuard)
 * @Roles('admin')
 * @Post('sensitive-operation')
 * async sensitiveOperation() { ... }
 * ```
 *
 * Pattern 5: WebSocket with authentication and rate limiting
 * ```typescript
 * @UseGuards(WsJwtAuthGuard, WsRateLimitGuard)
 * @SubscribeMessage('sendMessage')
 * handleMessage(client: Socket, payload: unknown) { ... }
 * ```
 */
