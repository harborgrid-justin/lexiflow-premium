import { Injectable } from '@nestjs/common';
import * as MasterConfig from '@config/master.config';

/**
 * AuditConfigService
 *
 * Provides globally injectable access to audit configuration.
 * Consolidates retention days, what to log, and sensitive data settings.
 */
/**
 * ╔=================================================================================================================╗
 * ║AUDITCONFIG                                                                                                      ║
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
export class AuditConfigService {
  // Audit Settings
  get enabled(): boolean {
    return MasterConfig.AUDIT_ENABLED;
  }

  get logRetentionDays(): number {
    return MasterConfig.AUDIT_LOG_RETENTION_DAYS;
  }

  get logSensitiveData(): boolean {
    return MasterConfig.AUDIT_LOG_SENSITIVE_DATA;
  }

  get logRequestBody(): boolean {
    return MasterConfig.AUDIT_LOG_REQUEST_BODY;
  }

  get logResponseBody(): boolean {
    return MasterConfig.AUDIT_LOG_RESPONSE_BODY;
  }

  get logQueryParams(): boolean {
    return MasterConfig.AUDIT_LOG_QUERY_PARAMS;
  }

  // Cleanup Settings
  get cleanupOldJobsDays(): number {
    return MasterConfig.CLEANUP_OLD_JOBS_DAYS;
  }

  get cleanupTempFilesHours(): number {
    return MasterConfig.CLEANUP_TEMP_FILES_HOURS;
  }

  get cleanupFailedJobsDays(): number {
    return MasterConfig.CLEANUP_FAILED_JOBS_DAYS;
  }

  get cleanupCompletedJobsDays(): number {
    return MasterConfig.CLEANUP_COMPLETED_JOBS_DAYS;
  }

  // Sensitive Fields (should not be logged)
  get sensitiveFields(): string[] {
    return [
      'password',
      'passwordHash',
      'token',
      'accessToken',
      'refreshToken',
      'apiKey',
      'secret',
      'creditCard',
      'ssn',
      'socialSecurityNumber',
      'totpSecret',
      'mfaSecret',
    ];
  }

  // Auditable Actions
  get auditableActions(): string[] {
    return [
      'CREATE',
      'READ',
      'UPDATE',
      'DELETE',
      'LOGIN',
      'LOGOUT',
      'PASSWORD_CHANGE',
      'PASSWORD_RESET',
      'MFA_ENABLE',
      'MFA_DISABLE',
      'PERMISSION_CHANGE',
      'ROLE_CHANGE',
      'EXPORT',
      'IMPORT',
      'BULK_OPERATION',
    ];
  }

  /**
   * Check if a field is sensitive
   */
  isSensitiveField(fieldName: string): boolean {
    const lowerField = fieldName.toLowerCase();
    return this.sensitiveFields.some(
      sensitive => lowerField.includes(sensitive.toLowerCase())
    );
  }

  /**
   * Redact sensitive data from an object
   */
  redactSensitiveData(data: Record<string, unknown>): Record<string, unknown> {
    const redacted: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data)) {
      if (this.isSensitiveField(key)) {
        redacted[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        redacted[key] = this.redactSensitiveData(value as Record<string, unknown>);
      } else {
        redacted[key] = value;
      }
    }

    return redacted;
  }

  /**
   * Get audit log configuration
   */
  getAuditLogConfig(): Record<string, unknown> {
    return {
      enabled: this.enabled,
      retentionDays: this.logRetentionDays,
      logSensitiveData: this.logSensitiveData,
      logRequestBody: this.logRequestBody,
      logResponseBody: this.logResponseBody,
      logQueryParams: this.logQueryParams,
    };
  }

  /**
   * Get cleanup configuration
   */
  getCleanupConfig(): Record<string, number> {
    return {
      oldJobsDays: this.cleanupOldJobsDays,
      tempFilesHours: this.cleanupTempFilesHours,
      failedJobsDays: this.cleanupFailedJobsDays,
      completedJobsDays: this.cleanupCompletedJobsDays,
    };
  }

  /**
   * Get summary of configuration
   */
  getSummary(): Record<string, unknown> {
    return {
      audit: this.getAuditLogConfig(),
      cleanup: this.getCleanupConfig(),
      sensitiveFieldsCount: this.sensitiveFields.length,
      auditableActionsCount: this.auditableActions.length,
    };
  }
}
