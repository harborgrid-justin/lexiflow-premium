import { SetMetadata } from '@nestjs/common';

export const SANITIZE_OUTPUT_KEY = 'sanitizeOutput';

/**
 * Output Sanitization Strategy
 */
export enum SanitizationStrategy {
  /** HTML encode all special characters */
  HTML_ENCODE = 'html_encode',

  /** Remove all HTML tags */
  STRIP_HTML = 'strip_html',

  /** Allow safe HTML tags only (whitelist) */
  SAFE_HTML = 'safe_html',

  /** JSON encode for API responses */
  JSON_ENCODE = 'json_encode',

  /** No sanitization (use with caution) */
  NONE = 'none',
}

/**
 * Output Sanitization Options
 */
export interface OutputSanitizationOptions {
  strategy?: SanitizationStrategy;
  fields?: string[];
  excludeFields?: string[];
  allowedTags?: string[];
}

/**
 * Sanitize Output Decorator
 *
 * Automatically sanitizes response data to prevent XSS attacks.
 * Use this decorator on routes that return user-generated content.
 *
 * @example
 * @SanitizeOutput({
 *   strategy: SanitizationStrategy.HTML_ENCODE,
 *   fields: ['username', 'bio', 'comment']
 * })
 * @Get('profile')
 * async getProfile(@Param('id') id: string) {}
 */
export const SanitizeOutput = (
  options: OutputSanitizationOptions = {
    strategy: SanitizationStrategy.HTML_ENCODE,
  },
) => SetMetadata(SANITIZE_OUTPUT_KEY, options);
