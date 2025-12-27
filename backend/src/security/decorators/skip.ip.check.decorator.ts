import { SetMetadata } from '@nestjs/common';

/**
 * Decorator to skip IP reputation check for a specific route
 * Use this for public endpoints or health checks that should not be blocked by IP reputation
 *
 * @example
 * @Get('health')
 * @SkipIpCheck()
 * async healthCheck() {
 *   return { status: 'ok' };
 * }
 */
export const SkipIpCheck = () => SetMetadata('skipIpCheck', true);
