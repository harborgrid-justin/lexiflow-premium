import { SetMetadata, applyDecorators } from '@nestjs/common';
import { ApiHeader, ApiResponse } from '@nestjs/swagger';

export const DEPRECATION_KEY = 'api:deprecated';
export const SUNSET_KEY = 'api:sunset';

export interface DeprecationOptions {
  /**
   * Date when the API was deprecated
   */
  deprecatedAt?: Date;

  /**
   * Date when the API will be sunset (removed)
   */
  sunsetAt?: Date;

  /**
   * Reason for deprecation
   */
  reason?: string;

  /**
   * Alternative endpoint or version to use
   */
  alternative?: string;

  /**
   * Migration guide URL
   */
  migrationGuide?: string;

  /**
   * Severity of deprecation warning
   */
  severity?: 'info' | 'warning' | 'critical';

  /**
   * Custom deprecation message
   */
  message?: string;
}

export interface SunsetOptions {
  /**
   * Date when the API will be sunset (removed)
   */
  sunsetAt: Date;

  /**
   * URL to information about the sunset
   */
  link?: string;

  /**
   * Custom sunset message
   */
  message?: string;
}

/**
 * Marks an API endpoint as deprecated
 *
 * This decorator adds deprecation metadata and response headers
 * to inform clients that the endpoint is deprecated and will be removed
 *
 * @example
 * @Deprecated({
 *   deprecatedAt: new Date('2024-01-01'),
 *   sunsetAt: new Date('2024-06-01'),
 *   reason: 'Replaced by v2 endpoint',
 *   alternative: '/api/v2/cases',
 *   migrationGuide: 'https://docs.lexiflow.ai/migration/v1-to-v2'
 * })
 * @Get('cases')
 * async getCases() { ... }
 */
export function Deprecated(options: DeprecationOptions = {}) {
  const deprecationMessage =
    options.message ||
    buildDeprecationMessage(options);

  const headers: any = {
    'X-API-Deprecation': {
      description: 'Deprecation warning',
      schema: {
        type: 'string',
        example: deprecationMessage,
      },
    },
  };

  if (options.sunsetAt) {
    headers['X-API-Sunset'] = {
      description: 'Sunset date (ISO 8601)',
      schema: {
        type: 'string',
        format: 'date-time',
        example: options.sunsetAt.toISOString(),
      },
    };

    headers['Sunset'] = {
      description: 'HTTP Sunset header (RFC 8594)',
      schema: {
        type: 'string',
        example: formatSunsetHeader(options.sunsetAt),
      },
    };
  }

  if (options.alternative) {
    headers['X-API-Alternative'] = {
      description: 'Alternative endpoint to use',
      schema: {
        type: 'string',
        example: options.alternative,
      },
    };
  }

  if (options.migrationGuide) {
    headers['Link'] = {
      description: 'Migration guide link',
      schema: {
        type: 'string',
        example: `<${options.migrationGuide}>; rel="deprecation"`,
      },
    };
  }

  return applyDecorators(
    SetMetadata(DEPRECATION_KEY, options),
    ...Object.keys(headers).map((key) =>
      ApiHeader({
        name: key,
        description: headers[key].description,
        required: false,
        schema: headers[key].schema,
      }),
    ),
    ApiResponse({
      status: 299,
      description: 'Deprecation warning (informational)',
      headers,
    }),
  );
}

/**
 * Marks an API endpoint as sunset (scheduled for removal)
 *
 * This decorator adds sunset metadata and response headers
 * following RFC 8594 for HTTP Sunset header
 *
 * @example
 * @Sunset({
 *   sunsetAt: new Date('2024-06-01'),
 *   link: 'https://docs.lexiflow.ai/sunset/cases-v1',
 *   message: 'This endpoint will be removed on June 1, 2024'
 * })
 * @Get('cases')
 * async getCases() { ... }
 */
export function Sunset(options: SunsetOptions) {
  const sunsetMessage =
    options.message ||
    `This API will be sunset on ${options.sunsetAt.toISOString()}`;

  const headers: any = {
    'Sunset': {
      description: 'HTTP Sunset header (RFC 8594)',
      schema: {
        type: 'string',
        example: formatSunsetHeader(options.sunsetAt),
      },
    },
    'X-API-Sunset': {
      description: 'Sunset date (ISO 8601)',
      schema: {
        type: 'string',
        format: 'date-time',
        example: options.sunsetAt.toISOString(),
      },
    },
  };

  if (options.link) {
    headers['Link'] = {
      description: 'Sunset information link',
      schema: {
        type: 'string',
        example: `<${options.link}>; rel="sunset"`,
      },
    };
  }

  return applyDecorators(
    SetMetadata(SUNSET_KEY, options),
    ...Object.keys(headers).map((key) =>
      ApiHeader({
        name: key,
        description: headers[key].description,
        required: false,
        schema: headers[key].schema,
      }),
    ),
    ApiResponse({
      status: 410,
      description: 'Gone - API has been sunset',
      headers,
    }),
  );
}

/**
 * Marks an API version as deprecated
 *
 * @example
 * @DeprecatedVersion({
 *   version: '1',
 *   deprecatedAt: new Date('2024-01-01'),
 *   sunsetAt: new Date('2024-06-01'),
 *   alternative: 'v2',
 *   migrationGuide: 'https://docs.lexiflow.ai/migration/v1-to-v2'
 * })
 * @Controller({ version: '1' })
 * export class CasesV1Controller { ... }
 */
export function DeprecatedVersion(
  options: DeprecationOptions & { version: string },
) {
  return Deprecated({
    ...options,
    message:
      options.message ||
      `API version ${options.version} is deprecated. Please migrate to ${options.alternative || 'the latest version'}.`,
  });
}

/**
 * Build deprecation message from options
 */
function buildDeprecationMessage(options: DeprecationOptions): string {
  const parts: string[] = ['This API endpoint is deprecated.'];

  if (options.reason) {
    parts.push(options.reason);
  }

  if (options.deprecatedAt) {
    parts.push(
      `Deprecated on ${options.deprecatedAt.toISOString().split('T')[0]}.`,
    );
  }

  if (options.sunsetAt) {
    const daysUntilSunset = Math.floor(
      (options.sunsetAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );

    if (daysUntilSunset > 0) {
      parts.push(
        `Will be removed on ${options.sunsetAt.toISOString().split('T')[0]} (${daysUntilSunset} days).`,
      );
    } else {
      parts.push(
        `Scheduled for removal on ${options.sunsetAt.toISOString().split('T')[0]}.`,
      );
    }
  }

  if (options.alternative) {
    parts.push(`Please use ${options.alternative} instead.`);
  }

  if (options.migrationGuide) {
    parts.push(`Migration guide: ${options.migrationGuide}`);
  }

  return parts.join(' ');
}

/**
 * Format sunset date according to RFC 8594
 * @example "Sat, 31 Dec 2024 23:59:59 GMT"
 */
function formatSunsetHeader(date: Date): string {
  return date.toUTCString();
}

/**
 * Check if deprecation is critical (close to sunset)
 */
export function isDeprecationCritical(options: DeprecationOptions): boolean {
  if (!options.sunsetAt) return false;

  const daysUntilSunset = Math.floor(
    (options.sunsetAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );

  return daysUntilSunset <= 30; // Critical if less than 30 days until sunset
}

/**
 * Get deprecation severity
 */
export function getDeprecationSeverity(
  options: DeprecationOptions,
): 'info' | 'warning' | 'critical' {
  if (options.severity) return options.severity;

  if (!options.sunsetAt) return 'info';

  const daysUntilSunset = Math.floor(
    (options.sunsetAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );

  if (daysUntilSunset <= 30) return 'critical';
  if (daysUntilSunset <= 90) return 'warning';
  return 'info';
}

/**
 * Example usage in controllers:
 *
 * // Deprecate a single endpoint
 * @Deprecated({
 *   deprecatedAt: new Date('2024-01-01'),
 *   sunsetAt: new Date('2024-06-01'),
 *   reason: 'Replaced by GraphQL API',
 *   alternative: '/graphql',
 *   migrationGuide: 'https://docs.lexiflow.ai/migration/rest-to-graphql'
 * })
 * @Get('cases')
 * async getCases() { ... }
 *
 * // Deprecate an entire version
 * @Controller({ version: '1' })
 * @DeprecatedVersion({
 *   version: '1',
 *   deprecatedAt: new Date('2024-01-01'),
 *   sunsetAt: new Date('2024-06-01'),
 *   alternative: 'v2',
 *   migrationGuide: 'https://docs.lexiflow.ai/migration/v1-to-v2'
 * })
 * export class CasesV1Controller { ... }
 *
 * // Mark endpoint as sunset (already removed or will be soon)
 * @Sunset({
 *   sunsetAt: new Date('2024-06-01'),
 *   link: 'https://docs.lexiflow.ai/sunset/legacy-api',
 *   message: 'This API has been sunset. Please use v2 API.'
 * })
 * @Get('legacy-endpoint')
 * async legacyEndpoint() { ... }
 */
