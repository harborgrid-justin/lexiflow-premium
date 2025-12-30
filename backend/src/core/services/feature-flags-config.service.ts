import { Injectable } from '@nestjs/common';
import * as MasterConfig from '@config/master.config';

/**
 * FeatureFlagsConfigService
 *
 * Provides globally injectable access to all feature flags.
 * Consolidates 14 feature flags from master.config.ts into a single injectable service.
 */
@Injectable()
export class FeatureFlagsConfigService {
  // Core Features
  get graphqlEnabled(): boolean {
    return MasterConfig.FEATURE_GRAPHQL_ENABLED;
  }

  get swaggerEnabled(): boolean {
    return MasterConfig.FEATURE_SWAGGER_ENABLED;
  }

  get websocketsEnabled(): boolean {
    return MasterConfig.FEATURE_WEBSOCKETS_ENABLED;
  }

  get realtimeEnabled(): boolean {
    return MasterConfig.FEATURE_REALTIME_ENABLED;
  }

  // File & Document Features
  get fileUploadEnabled(): boolean {
    return MasterConfig.FEATURE_FILE_UPLOAD_ENABLED;
  }

  get ocrEnabled(): boolean {
    return MasterConfig.FEATURE_OCR_ENABLED;
  }

  // Communication Features
  get emailEnabled(): boolean {
    return MasterConfig.FEATURE_EMAIL_ENABLED;
  }

  get smsEnabled(): boolean {
    return MasterConfig.FEATURE_SMS_ENABLED;
  }

  // Security Features
  get mfaEnabled(): boolean {
    return MasterConfig.FEATURE_MFA_ENABLED;
  }

  get apiVersioningEnabled(): boolean {
    return MasterConfig.FEATURE_API_VERSIONING_ENABLED;
  }

  // Integration Features
  get pacerIntegrationEnabled(): boolean {
    return MasterConfig.FEATURE_PACER_INTEGRATION_ENABLED;
  }

  get calendarIntegrationEnabled(): boolean {
    return MasterConfig.FEATURE_CALENDAR_INTEGRATION_ENABLED;
  }

  // Advanced Features
  get bulkOperationsEnabled(): boolean {
    return MasterConfig.FEATURE_BULK_OPERATIONS_ENABLED;
  }

  get advancedSearchEnabled(): boolean {
    return MasterConfig.FEATURE_ADVANCED_SEARCH_ENABLED;
  }

  /**
   * Check if a feature is enabled by name
   */
  isEnabled(featureName: string): boolean {
    const featureMap: Record<string, boolean> = {
      graphql: this.graphqlEnabled,
      swagger: this.swaggerEnabled,
      websockets: this.websocketsEnabled,
      realtime: this.realtimeEnabled,
      fileUpload: this.fileUploadEnabled,
      ocr: this.ocrEnabled,
      email: this.emailEnabled,
      sms: this.smsEnabled,
      mfa: this.mfaEnabled,
      apiVersioning: this.apiVersioningEnabled,
      pacerIntegration: this.pacerIntegrationEnabled,
      calendarIntegration: this.calendarIntegrationEnabled,
      bulkOperations: this.bulkOperationsEnabled,
      advancedSearch: this.advancedSearchEnabled,
    };
    return featureMap[featureName] ?? false;
  }

  /**
   * Get all feature flags as an object
   */
  getAllFlags(): Record<string, boolean> {
    return {
      graphql: this.graphqlEnabled,
      swagger: this.swaggerEnabled,
      websockets: this.websocketsEnabled,
      realtime: this.realtimeEnabled,
      fileUpload: this.fileUploadEnabled,
      ocr: this.ocrEnabled,
      email: this.emailEnabled,
      sms: this.smsEnabled,
      mfa: this.mfaEnabled,
      apiVersioning: this.apiVersioningEnabled,
      pacerIntegration: this.pacerIntegrationEnabled,
      calendarIntegration: this.calendarIntegrationEnabled,
      bulkOperations: this.bulkOperationsEnabled,
      advancedSearch: this.advancedSearchEnabled,
    };
  }

  /**
   * Get enabled features only
   */
  getEnabledFeatures(): string[] {
    return Object.entries(this.getAllFlags())
      .filter(([, enabled]) => enabled)
      .map(([name]) => name);
  }

  /**
   * Get disabled features only
   */
  getDisabledFeatures(): string[] {
    return Object.entries(this.getAllFlags())
      .filter(([, enabled]) => !enabled)
      .map(([name]) => name);
  }
}
