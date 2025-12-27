import { SetMetadata } from '@nestjs/common';
import { SKIP_CSRF_KEY } from '../guards/csrf.guard';

/**
 * Decorator to skip CSRF validation for specific routes
 *
 * Use this decorator for:
 * - Webhook endpoints that receive external callbacks
 * - Public API endpoints used by external services
 * - GraphQL endpoints (handled by Apollo's CSRF prevention)
 *
 * @example
 * @SkipCsrf()
 * @Post('webhook')
 * async handleWebhook(@Body() payload: WebhookPayload) {}
 */
export const SkipCsrf = () => SetMetadata(SKIP_CSRF_KEY, true);
