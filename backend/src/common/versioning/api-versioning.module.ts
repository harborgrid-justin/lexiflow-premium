import { Module, VersioningType } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ApiVersionInterceptor } from './interceptors/api-version.interceptor';

/**
 * API Versioning Module
 *
 * Provides URI-based versioning for the LexiFlow API
 * Current version: v1
 * Future versions will be supported concurrently
 *
 * Versioning Strategy:
 * - URI Versioning: /api/v1/resource, /api/v2/resource
 * - Backward compatibility maintained for at least 2 versions
 * - Deprecation warnings sent via headers
 * - Breaking changes only in major versions
 */
@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ApiVersionInterceptor,
    },
  ],
  exports: [],
})
export class ApiVersioningModule {
  /**
   * Get versioning configuration for NestJS application
   */
  static getConfig() {
    return {
      type: VersioningType.URI,
      defaultVersion: '1',
      prefix: 'api/v',
    };
  }

  /**
   * Get list of supported API versions
   */
  static getSupportedVersions(): string[] {
    return ['1'];
  }

  /**
   * Get deprecated versions
   */
  static getDeprecatedVersions(): string[] {
    return [];
  }

  /**
   * Check if a version is supported
   */
  static isVersionSupported(version: string): boolean {
    return this.getSupportedVersions().includes(version);
  }

  /**
   * Check if a version is deprecated
   */
  static isVersionDeprecated(version: string): boolean {
    return this.getDeprecatedVersions().includes(version);
  }
}
