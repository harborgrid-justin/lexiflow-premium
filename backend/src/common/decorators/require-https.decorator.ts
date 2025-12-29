import { SetMetadata } from '@nestjs/common';

export const REQUIRE_HTTPS_KEY = 'requireHttps';

/**
 * Require HTTPS Decorator
 *
 * Enforces HTTPS for sensitive endpoints.
 * Requests over HTTP will be rejected with 403 Forbidden.
 *
 * @example
 * @RequireHttps()
 * @Post('payment')
 * async processPayment(@Body() paymentDto: PaymentDto) {}
 */
export const RequireHttps = () => SetMetadata(REQUIRE_HTTPS_KEY, true);
