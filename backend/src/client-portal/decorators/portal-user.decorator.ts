import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { PortalUser } from '../entities/portal-user.entity';

/**
 * Portal User Decorator
 *
 * Extract the authenticated portal user from the request
 * Must be used with @UseGuards(PortalAuthGuard)
 *
 * Usage:
 * @Get('profile')
 * @UseGuards(PortalAuthGuard)
 * async getProfile(@CurrentPortalUser() portalUser: PortalUser) {
 *   return portalUser;
 * }
 */
export const CurrentPortalUser = createParamDecorator(
  (data: keyof PortalUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const portalUser = request.portalUser;

    if (!portalUser) {
      return null;
    }

    return data ? portalUser[data] : portalUser;
  },
);

/**
 * Portal User ID Decorator
 *
 * Extract only the portal user ID from the request
 * Convenience decorator for when you only need the ID
 *
 * Usage:
 * @Get('messages')
 * @UseGuards(PortalAuthGuard)
 * async getMessages(@CurrentPortalUserId() portalUserId: string) {
 *   return this.messagingService.getMessages(portalUserId);
 * }
 */
export const CurrentPortalUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.portalUser?.id;
  },
);

/**
 * Client ID Decorator
 *
 * Extract the client ID from the authenticated portal user
 *
 * Usage:
 * @Get('client-info')
 * @UseGuards(PortalAuthGuard)
 * async getClientInfo(@CurrentClientId() clientId: string) {
 *   return this.clientService.findOne(clientId);
 * }
 */
export const CurrentClientId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.portalUser?.clientId;
  },
);
