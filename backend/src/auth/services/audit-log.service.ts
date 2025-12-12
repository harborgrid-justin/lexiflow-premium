import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export enum AuditEventType {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  REGISTER = 'REGISTER',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PASSWORD_RESET_REQUEST = 'PASSWORD_RESET_REQUEST',
  PASSWORD_RESET_COMPLETE = 'PASSWORD_RESET_COMPLETE',
  MFA_ENABLED = 'MFA_ENABLED',
  MFA_DISABLED = 'MFA_DISABLED',
  MFA_VERIFIED = 'MFA_VERIFIED',
  MFA_FAILED = 'MFA_FAILED',
  TOKEN_REFRESH = 'TOKEN_REFRESH',
  OAUTH_LOGIN = 'OAUTH_LOGIN',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_UNLOCKED = 'ACCOUNT_UNLOCKED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

export interface AuditLogEntry {
  timestamp: Date;
  eventType: AuditEventType;
  userId?: string;
  email?: string;
  ip?: string;
  userAgent?: string;
  success: boolean;
  metadata?: Record<string, any>;
  errorMessage?: string;
}

/**
 * Audit logging service for tracking authentication events
 * In production, this should write to a database or external logging service
 */
@Injectable()
export class AuditLogService {
  private logs: AuditLogEntry[] = [];
  private readonly maxLogsInMemory = 10000;

  constructor(private configService: ConfigService) {}

  /**
   * Log an authentication event
   */
  async log(entry: Omit<AuditLogEntry, 'timestamp'>): Promise<void> {
    const logEntry: AuditLogEntry = {
      ...entry,
      timestamp: new Date(),
    };

    // Log to console (in production, use proper logger like Winston)
    const logLevel = entry.success ? 'info' : 'warn';
    const logMessage = this.formatLogMessage(logEntry);

    if (logLevel === 'warn') {
      console.warn(`[AUDIT] ${logMessage}`);
    } else {
      console.log(`[AUDIT] ${logMessage}`);
    }

    // Store in memory (in production, persist to database)
    this.logs.push(logEntry);

    // Prevent memory overflow
    if (this.logs.length > this.maxLogsInMemory) {
      this.logs.shift();
    }

    // In production, write to database
    // await this.auditLogRepository.save(logEntry);
  }

  /**
   * Log a successful login
   */
  async logLoginSuccess(
    userId: string,
    email: string,
    ip?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.log({
      eventType: AuditEventType.LOGIN_SUCCESS,
      userId,
      email,
      ip,
      userAgent,
      success: true,
    });
  }

  /**
   * Log a failed login attempt
   */
  async logLoginFailed(
    email: string,
    reason: string,
    ip?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.log({
      eventType: AuditEventType.LOGIN_FAILED,
      email,
      ip,
      userAgent,
      success: false,
      errorMessage: reason,
    });
  }

  /**
   * Log a logout event
   */
  async logLogout(userId: string, email: string): Promise<void> {
    await this.log({
      eventType: AuditEventType.LOGOUT,
      userId,
      email,
      success: true,
    });
  }

  /**
   * Log a password change
   */
  async logPasswordChange(userId: string, email: string): Promise<void> {
    await this.log({
      eventType: AuditEventType.PASSWORD_CHANGE,
      userId,
      email,
      success: true,
    });
  }

  /**
   * Log MFA events
   */
  async logMfaEvent(
    eventType: AuditEventType,
    userId: string,
    email: string,
    success: boolean,
    errorMessage?: string,
  ): Promise<void> {
    await this.log({
      eventType,
      userId,
      email,
      success,
      errorMessage,
    });
  }

  /**
   * Log OAuth login
   */
  async logOAuthLogin(
    userId: string,
    email: string,
    provider: string,
    ip?: string,
  ): Promise<void> {
    await this.log({
      eventType: AuditEventType.OAUTH_LOGIN,
      userId,
      email,
      ip,
      success: true,
      metadata: { provider },
    });
  }

  /**
   * Log permission denied
   */
  async logPermissionDenied(
    userId: string,
    email: string,
    resource: string,
    ip?: string,
  ): Promise<void> {
    await this.log({
      eventType: AuditEventType.PERMISSION_DENIED,
      userId,
      email,
      ip,
      success: false,
      metadata: { resource },
    });
  }

  /**
   * Get recent audit logs (for admin view)
   */
  async getRecentLogs(limit: number = 100): Promise<AuditLogEntry[]> {
    return this.logs.slice(-limit).reverse();
  }

  /**
   * Get logs for a specific user
   */
  async getUserLogs(userId: string, limit: number = 50): Promise<AuditLogEntry[]> {
    return this.logs
      .filter((log) => log.userId === userId)
      .slice(-limit)
      .reverse();
  }

  /**
   * Get failed login attempts for an email
   */
  async getFailedLoginAttempts(
    email: string,
    since: Date,
  ): Promise<AuditLogEntry[]> {
    return this.logs.filter(
      (log) =>
        log.eventType === AuditEventType.LOGIN_FAILED &&
        log.email === email &&
        log.timestamp >= since,
    );
  }

  /**
   * Format log message for output
   */
  private formatLogMessage(entry: AuditLogEntry): string {
    const parts = [
      entry.eventType,
      entry.email || 'unknown',
      entry.userId || 'no-user-id',
      entry.success ? 'SUCCESS' : 'FAILED',
    ];

    if (entry.ip) {
      parts.push(`IP:${entry.ip}`);
    }

    if (entry.errorMessage) {
      parts.push(`Error:${entry.errorMessage}`);
    }

    if (entry.metadata) {
      parts.push(`Metadata:${JSON.stringify(entry.metadata)}`);
    }

    return parts.join(' | ');
  }

  /**
   * Clear old logs (cleanup task, run periodically)
   */
  async clearOldLogs(olderThan: Date): Promise<number> {
    const initialCount = this.logs.length;
    this.logs = this.logs.filter((log) => log.timestamp >= olderThan);
    return initialCount - this.logs.length;
  }
}
