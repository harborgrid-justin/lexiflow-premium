import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DefaultAdminConfig,
  DefaultAdminUserConfig,
  DefaultAdminProfileConfig,
} from '@config/config.types';
import * as MasterConfig from '@config/master.config';

/**
 * DefaultAdminConfigService
 *
 * Provides globally injectable access to the default admin configuration.
 * This service is registered in CoreModule and available across all 40+ feature modules.
 *
 * Configuration Sources (in priority order):
 * 1. Environment variables (via ConfigService)
 * 2. master.config.ts constants (fallback defaults)
 *
 * Usage in any module:
 * @Injectable()
 * export class MyService {
 *   constructor(private defaultAdminConfig: DefaultAdminConfigService) {}
 *
 *   someMethod() {
 *     if (this.defaultAdminConfig.isEnabled) {
 *       const email = this.defaultAdminConfig.user.email;
 *       // ...
 *     }
 *   }
 * }
 */
/**
 * ╔=================================================================================================================╗
 * ║DEFAULTADMINCONFIG                                                                                               ║
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
export class DefaultAdminConfigService {
  private readonly config: DefaultAdminConfig;

  constructor(private readonly configService: ConfigService) {
    // Initialize from ConfigService with MasterConfig fallbacks
    this.config = this.loadConfiguration();
  }

  /**
   * Load configuration from ConfigService with fallbacks to MasterConfig
   */
  private loadConfiguration(): DefaultAdminConfig {
    // Try to get from ConfigService first (registered via configuration.ts)
    const appConfig = this.configService.get<DefaultAdminConfig>('app.defaultAdmin');

    if (appConfig) {
      return appConfig;
    }

    // Fallback to MasterConfig constants
    return MasterConfig.DEFAULT_ADMIN_CONFIG;
  }

  // =============================================================================
  // ENABLED FLAGS
  // =============================================================================

  /**
   * Whether default admin creation is enabled
   */
  get isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Whether default admin profile creation is enabled
   */
  get isProfileEnabled(): boolean {
    return this.config.profile.enabled;
  }

  // =============================================================================
  // USER CONFIGURATION
  // =============================================================================

  /**
   * Get the complete user configuration
   */
  get user(): DefaultAdminUserConfig {
    return this.config.user;
  }

  /**
   * Get the admin email
   */
  get email(): string {
    return this.config.user.email;
  }

  /**
   * Get the admin password (for initial creation only)
   */
  get password(): string {
    return this.config.user.password;
  }

  /**
   * Get the admin first name
   */
  get firstName(): string {
    return this.config.user.firstName;
  }

  /**
   * Get the admin last name
   */
  get lastName(): string {
    return this.config.user.lastName;
  }

  /**
   * Get the admin full name
   */
  get fullName(): string {
    return `${this.config.user.firstName} ${this.config.user.lastName}`;
  }

  /**
   * Get the admin title
   */
  get title(): string {
    return this.config.user.title;
  }

  /**
   * Get the admin department
   */
  get department(): string {
    return this.config.user.department;
  }

  // =============================================================================
  // PROFILE CONFIGURATION
  // =============================================================================

  /**
   * Get the complete profile configuration
   */
  get profile(): DefaultAdminProfileConfig {
    return this.config.profile;
  }

  /**
   * Get the admin bar number (if applicable)
   */
  get barNumber(): string | null {
    return this.config.profile.barNumber;
  }

  /**
   * Get the admin jurisdictions
   */
  get jurisdictions(): string[] {
    return this.config.profile.jurisdictions;
  }

  /**
   * Get the admin practice areas
   */
  get practiceAreas(): string[] {
    return this.config.profile.practiceAreas;
  }

  /**
   * Get the admin bio
   */
  get bio(): string {
    return this.config.profile.bio;
  }

  /**
   * Get years of experience
   */
  get yearsOfExperience(): number {
    return this.config.profile.yearsOfExperience;
  }

  /**
   * Get default hourly rate
   */
  get defaultHourlyRate(): number {
    return this.config.profile.defaultHourlyRate;
  }

  // =============================================================================
  // FULL CONFIG ACCESS
  // =============================================================================

  /**
   * Get the complete default admin configuration object
   */
  get fullConfig(): DefaultAdminConfig {
    return this.config;
  }

  /**
   * Check if the provided email matches the default admin email
   */
  isDefaultAdminEmail(email: string): boolean {
    return email.toLowerCase() === this.config.user.email.toLowerCase();
  }

  /**
   * Get a summary of the configuration for logging purposes
   * (excludes sensitive data like password)
   */
  getSummary(): Record<string, unknown> {
    return {
      enabled: this.config.enabled,
      email: this.config.user.email,
      firstName: this.config.user.firstName,
      lastName: this.config.user.lastName,
      title: this.config.user.title,
      department: this.config.user.department,
      profileEnabled: this.config.profile.enabled,
      jurisdictions: this.config.profile.jurisdictions,
      practiceAreas: this.config.profile.practiceAreas,
    };
  }
}
