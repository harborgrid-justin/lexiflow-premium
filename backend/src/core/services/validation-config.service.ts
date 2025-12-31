import { Injectable } from '@nestjs/common';
import * as MasterConfig from '@config/master.config';

/**
 * ValidationConfigService
 *
 * Provides globally injectable access to validation configuration.
 * Consolidates whitelist, transform, and implicit conversion settings.
 */
/**
 * ╔=================================================================================================================╗
 * ║VALIDATIONCONFIG                                                                                                 ║
 * ╠=================================================================================================================╣
 * ║                                                                                                                 ║
 * ║  External Request                   Controller                            Service                                ║
 * ║       │                                   │                                     │                                ║
 * ║       │  HTTP Endpoints                  │                                     │                                ║
 * ║       └───────────────────────────────────►                                     │                                ║
 * ║                                                                                                                 ║
 * ║                                                                 ┌───────────────┴───────────────┐                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          Repository                    Database                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          PostgreSQL                                          ║
 * ║                                                                                                                 ║
 * ║  DATA IN:  Data input                                                                                         ║

 * ║                                                                                                                 ║
 * ║  DATA OUT: Data output                                                                                        ║

 * ║                                                                                                                 ║

 * ╚=================================================================================================================╝
 */

@Injectable()
export class ValidationConfigService {
  // Core Validation Settings
  get whitelist(): boolean {
    return MasterConfig.VALIDATION_WHITELIST;
  }

  get forbidNonWhitelisted(): boolean {
    return MasterConfig.VALIDATION_FORBID_NON_WHITELISTED;
  }

  get transform(): boolean {
    return MasterConfig.VALIDATION_TRANSFORM;
  }

  get enableImplicitConversion(): boolean {
    return MasterConfig.VALIDATION_ENABLE_IMPLICIT_CONVERSION;
  }

  get disableErrorMessages(): boolean {
    return MasterConfig.VALIDATION_DISABLE_ERROR_MESSAGES;
  }

  get skipMissingProperties(): boolean {
    return MasterConfig.VALIDATION_SKIP_MISSING_PROPERTIES;
  }

  get validationErrorTarget(): boolean {
    return MasterConfig.VALIDATION_VALIDATION_ERROR_TARGET;
  }

  get stopAtFirstError(): boolean {
    return MasterConfig.VALIDATION_STOP_AT_FIRST_ERROR;
  }

  // Search Validation
  get searchMinQueryLength(): number {
    return MasterConfig.SEARCH_MIN_QUERY_LENGTH;
  }

  get searchEnableFuzzy(): boolean {
    return MasterConfig.SEARCH_ENABLE_FUZZY;
  }

  get searchFuzzyThreshold(): number {
    return MasterConfig.SEARCH_FUZZY_THRESHOLD;
  }

  /**
   * Get ValidationPipe options for NestJS
   */
  getValidationPipeOptions(): Record<string, unknown> {
    return {
      whitelist: this.whitelist,
      forbidNonWhitelisted: this.forbidNonWhitelisted,
      transform: this.transform,
      transformOptions: {
        enableImplicitConversion: this.enableImplicitConversion,
      },
      disableErrorMessages: this.disableErrorMessages,
      skipMissingProperties: this.skipMissingProperties,
      validationError: {
        target: this.validationErrorTarget,
      },
      stopAtFirstError: this.stopAtFirstError,
    };
  }

  /**
   * Get class-transformer options
   */
  getTransformOptions(): Record<string, unknown> {
    return {
      enableImplicitConversion: this.enableImplicitConversion,
      excludeExtraneousValues: false,
    };
  }

  /**
   * Get search validation options
   */
  getSearchValidationOptions(): Record<string, unknown> {
    return {
      minQueryLength: this.searchMinQueryLength,
      enableFuzzy: this.searchEnableFuzzy,
      fuzzyThreshold: this.searchFuzzyThreshold,
    };
  }

  /**
   * Validate search query
   */
  isValidSearchQuery(query: string): { valid: boolean; reason?: string } {
    if (!query || query.trim().length < this.searchMinQueryLength) {
      return {
        valid: false,
        reason: `Query must be at least ${this.searchMinQueryLength} characters`,
      };
    }
    return { valid: true };
  }

  /**
   * Get summary of configuration
   */
  getSummary(): Record<string, unknown> {
    return {
      validation: {
        whitelist: this.whitelist,
        forbidNonWhitelisted: this.forbidNonWhitelisted,
        transform: this.transform,
        implicitConversion: this.enableImplicitConversion,
        stopAtFirstError: this.stopAtFirstError,
      },
      search: {
        minQueryLength: this.searchMinQueryLength,
        fuzzyEnabled: this.searchEnableFuzzy,
        fuzzyThreshold: this.searchFuzzyThreshold,
      },
    };
  }
}
