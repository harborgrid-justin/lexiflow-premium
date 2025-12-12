import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, Between } from 'typeorm';
import { AuditLog } from '../../entities/audit-log.entity';
import { User } from '../../entities/user.entity';

export interface SecurityEvent {
  userId?: string;
  email?: string;
  eventType: SecurityEventType;
  ipAddress: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  success: boolean;
}

export enum SecurityEventType {
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILED = 'login_failed',
  LOGOUT = 'logout',
  PASSWORD_CHANGED = 'password_changed',
  PASSWORD_RESET_REQUESTED = 'password_reset_requested',
  PASSWORD_RESET_COMPLETED = 'password_reset_completed',
  MFA_ENABLED = 'mfa_enabled',
  MFA_DISABLED = 'mfa_disabled',
  MFA_FAILED = 'mfa_failed',
  ACCOUNT_LOCKED = 'account_locked',
  ACCOUNT_UNLOCKED = 'account_unlocked',
  SESSION_REVOKED = 'session_revoked',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  BRUTE_FORCE_ATTEMPT = 'brute_force_attempt',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  API_KEY_CREATED = 'api_key_created',
  API_KEY_REVOKED = 'api_key_revoked',
  PERMISSION_CHANGED = 'permission_changed',
  SSO_LOGIN_SUCCESS = 'sso_login_success',
  SSO_LOGIN_FAILED = 'sso_login_failed',
}

export interface LoginHistoryEntry {
  id: string;
  userId: string;
  email: string;
  eventType: string;
  ipAddress: string;
  userAgent: string;
  location: string;
  country: string;
  city: string;
  success: boolean;
  failureReason?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface SecurityAnomalyReport {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedUsers: string[];
  occurrences: number;
  firstSeen: Date;
  lastSeen: Date;
  ipAddresses: string[];
}

/**
 * Security Audit Service
 * Tracks security events, failed logins, and anomaly detection
 * OWASP ASVS V7.1 - Log Content Requirements
 */
@Injectable()
export class SecurityAuditService {
  private readonly logger = new Logger(SecurityAuditService.name);

  // Failed login tracking (in-memory for performance)
  private failedLoginAttempts: Map<
    string,
    { count: number; firstAttempt: Date; attempts: Date[] }
  > = new Map();

  // Brute force detection thresholds
  private readonly MAX_FAILED_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION_MINUTES = 30;
  private readonly BRUTE_FORCE_WINDOW_MINUTES = 15;

  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    // Clean up old failed login attempts periodically
    setInterval(() => this.cleanupFailedAttempts(), 300000); // Every 5 minutes
  }

  /**
   * Log security event
   */
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      // Create audit log entry
      const auditLog = this.auditLogRepository.create({
        userId: event.userId || null,
        action: event.eventType,
        entityType: 'authentication',
        entityId: event.userId || 'system',
        changes: event.metadata || {},
        ipAddress: event.ipAddress,
        userAgent: event.userAgent || null,
        metadata: {
          severity: event.severity,
          success: event.success,
          email: event.email,
        },
      });

      await this.auditLogRepository.save(auditLog);

      // Log to console for monitoring
      const logMessage = `[SECURITY] ${event.eventType} - User: ${event.email || event.userId || 'unknown'} - IP: ${event.ipAddress} - Success: ${event.success}`;

      if (event.severity === 'critical' || event.severity === 'high') {
        this.logger.warn(logMessage);
      } else {
        this.logger.log(logMessage);
      }

      // Handle specific event types
      if (event.eventType === SecurityEventType.LOGIN_FAILED) {
        await this.handleFailedLogin(event);
      } else if (event.eventType === SecurityEventType.LOGIN_SUCCESS) {
        await this.handleSuccessfulLogin(event);
      }
    } catch (error) {
      this.logger.error(
        `Failed to log security event: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Handle failed login attempt
   */
  private async handleFailedLogin(event: SecurityEvent): Promise<void> {
    const identifier = event.email || event.ipAddress;

    // Get or create failed login tracking
    let tracking = this.failedLoginAttempts.get(identifier);
    const now = new Date();

    if (!tracking) {
      tracking = {
        count: 0,
        firstAttempt: now,
        attempts: [],
      };
      this.failedLoginAttempts.set(identifier, tracking);
    }

    tracking.count++;
    tracking.attempts.push(now);

    // Check for brute force attack
    const recentAttempts = this.getRecentAttempts(
      tracking.attempts,
      this.BRUTE_FORCE_WINDOW_MINUTES,
    );

    if (recentAttempts.length >= this.MAX_FAILED_ATTEMPTS) {
      await this.handleBruteForceAttempt(event, recentAttempts.length);
    }

    // Lock user account if threshold exceeded
    if (event.userId && tracking.count >= this.MAX_FAILED_ATTEMPTS) {
      await this.lockUserAccount(event.userId, event.ipAddress);
    }
  }

  /**
   * Handle successful login
   */
  private async handleSuccessfulLogin(event: SecurityEvent): Promise<void> {
    const identifier = event.email || event.ipAddress;

    // Clear failed login attempts on successful login
    this.failedLoginAttempts.delete(identifier);

    // Detect suspicious login patterns
    if (event.userId) {
      await this.detectSuspiciousLogin(event.userId, event.ipAddress);
    }
  }

  /**
   * Handle brute force attempt
   */
  private async handleBruteForceAttempt(
    event: SecurityEvent,
    attemptCount: number,
  ): Promise<void> {
    this.logger.warn(
      `[BRUTE FORCE] Detected brute force attempt - IP: ${event.ipAddress} - Attempts: ${attemptCount}`,
    );

    await this.logSecurityEvent({
      ...event,
      eventType: SecurityEventType.BRUTE_FORCE_ATTEMPT,
      severity: 'high',
      success: false,
      metadata: {
        attemptCount,
        window: `${this.BRUTE_FORCE_WINDOW_MINUTES} minutes`,
      },
    });

    // In production, trigger alerts, block IP, etc.
    // await this.blockIpAddress(event.ipAddress);
    // await this.sendSecurityAlert('Brute Force Attempt', event);
  }

  /**
   * Lock user account
   */
  private async lockUserAccount(
    userId: string,
    ipAddress: string,
  ): Promise<void> {
    try {
      const lockUntil = new Date(
        Date.now() + this.LOCKOUT_DURATION_MINUTES * 60 * 1000,
      );

      await this.userRepository.update(userId, {
        lockedUntil: lockUntil,
      });

      await this.logSecurityEvent({
        userId,
        eventType: SecurityEventType.ACCOUNT_LOCKED,
        ipAddress,
        severity: 'high',
        success: true,
        metadata: {
          lockDuration: `${this.LOCKOUT_DURATION_MINUTES} minutes`,
          reason: 'Too many failed login attempts',
        },
      });

      this.logger.warn(
        `[ACCOUNT LOCKED] User ${userId} locked until ${lockUntil.toISOString()}`,
      );
    } catch (error) {
      this.logger.error(`Failed to lock user account: ${error.message}`);
    }
  }

  /**
   * Check if user account is locked
   */
  async isAccountLocked(userId: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user || !user.lockedUntil) {
      return false;
    }

    const now = new Date();
    if (user.lockedUntil > now) {
      return true;
    }

    // Unlock account if lock period has expired
    await this.userRepository.update(userId, {
      lockedUntil: null,
      loginAttempts: 0,
    });

    await this.logSecurityEvent({
      userId,
      eventType: SecurityEventType.ACCOUNT_UNLOCKED,
      ipAddress: 'system',
      severity: 'low',
      success: true,
      metadata: {
        reason: 'Lock period expired',
      },
    });

    return false;
  }

  /**
   * Detect suspicious login patterns
   */
  private async detectSuspiciousLogin(
    userId: string,
    ipAddress: string,
  ): Promise<void> {
    // Get recent login history
    const recentLogins = await this.auditLogRepository.find({
      where: {
        userId,
        action: SecurityEventType.LOGIN_SUCCESS,
        createdAt: MoreThan(
          new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        ),
      },
      order: {
        createdAt: 'DESC',
      },
      take: 10,
    });

    if (recentLogins.length < 2) {
      return; // Not enough data
    }

    // Check for impossible travel
    const lastLogin = recentLogins[1]; // Previous login
    if (lastLogin.ipAddress && lastLogin.ipAddress !== ipAddress) {
      const timeDiff =
        new Date().getTime() - new Date(lastLogin.createdAt).getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);

      // If login from different location within 1 hour, flag as suspicious
      if (hoursDiff < 1) {
        await this.logSecurityEvent({
          userId,
          eventType: SecurityEventType.SUSPICIOUS_ACTIVITY,
          ipAddress,
          severity: 'medium',
          success: true,
          metadata: {
            reason: 'Possible impossible travel detected',
            previousIp: lastLogin.ipAddress,
            currentIp: ipAddress,
            timeDiff: `${hoursDiff.toFixed(2)} hours`,
          },
        });

        this.logger.warn(
          `[SUSPICIOUS] Possible impossible travel detected for user ${userId}`,
        );
      }
    }

    // Check for login from new country
    // In production, use GeoIP to detect country changes
  }

  /**
   * Get login history for user
   */
  async getLoginHistory(
    userId: string,
    limit: number = 50,
  ): Promise<LoginHistoryEntry[]> {
    const logs = await this.auditLogRepository.find({
      where: [
        {
          userId,
          action: SecurityEventType.LOGIN_SUCCESS,
        },
        {
          userId,
          action: SecurityEventType.LOGIN_FAILED,
        },
        {
          userId,
          action: SecurityEventType.SSO_LOGIN_SUCCESS,
        },
        {
          userId,
          action: SecurityEventType.SSO_LOGIN_FAILED,
        },
      ],
      order: {
        createdAt: 'DESC',
      },
      take: limit,
    });

    return logs.map((log) => this.mapToLoginHistoryEntry(log));
  }

  /**
   * Get security events for user
   */
  async getSecurityEvents(
    userId: string,
    limit: number = 100,
  ): Promise<AuditLog[]> {
    return await this.auditLogRepository.find({
      where: {
        userId,
        entityType: 'authentication',
      },
      order: {
        createdAt: 'DESC',
      },
      take: limit,
    });
  }

  /**
   * Get failed login attempts for IP
   */
  getFailedLoginCount(identifier: string): number {
    const tracking = this.failedLoginAttempts.get(identifier);
    return tracking ? tracking.count : 0;
  }

  /**
   * Detect security anomalies
   */
  async detectAnomalies(
    startDate: Date,
    endDate: Date,
  ): Promise<SecurityAnomalyReport[]> {
    const anomalies: SecurityAnomalyReport[] = [];

    // Detect multiple failed logins from same IP
    const failedLogins = await this.auditLogRepository.find({
      where: {
        action: SecurityEventType.LOGIN_FAILED,
        createdAt: Between(startDate, endDate),
      },
    });

    const ipFailures: Map<string, AuditLog[]> = new Map();
    for (const log of failedLogins) {
      const ip = log.ipAddress || 'unknown';
      const logs = ipFailures.get(ip) || [];
      logs.push(log);
      ipFailures.set(ip, logs);
    }

    for (const [ip, logs] of ipFailures.entries()) {
      if (logs.length >= 10) {
        const users = new Set(logs.map((l) => l.userId).filter(Boolean));
        anomalies.push({
          type: 'Multiple Failed Logins',
          severity: logs.length >= 50 ? 'critical' : 'high',
          description: `${logs.length} failed login attempts from IP ${ip}`,
          affectedUsers: Array.from(users) as string[],
          occurrences: logs.length,
          firstSeen: logs[logs.length - 1].createdAt,
          lastSeen: logs[0].createdAt,
          ipAddresses: [ip],
        });
      }
    }

    // Detect suspicious activity patterns
    const suspiciousEvents = await this.auditLogRepository.find({
      where: {
        action: SecurityEventType.SUSPICIOUS_ACTIVITY,
        createdAt: Between(startDate, endDate),
      },
    });

    if (suspiciousEvents.length > 0) {
      const users = new Set(
        suspiciousEvents.map((e) => e.userId).filter(Boolean),
      );
      const ips = new Set(
        suspiciousEvents.map((e) => e.ipAddress).filter(Boolean),
      );

      anomalies.push({
        type: 'Suspicious Activity',
        severity: 'medium',
        description: `${suspiciousEvents.length} suspicious activity events detected`,
        affectedUsers: Array.from(users) as string[],
        occurrences: suspiciousEvents.length,
        firstSeen: suspiciousEvents[suspiciousEvents.length - 1].createdAt,
        lastSeen: suspiciousEvents[0].createdAt,
        ipAddresses: Array.from(ips) as string[],
      });
    }

    return anomalies;
  }

  /**
   * Get recent attempts within time window
   */
  private getRecentAttempts(attempts: Date[], windowMinutes: number): Date[] {
    const cutoff = new Date(Date.now() - windowMinutes * 60 * 1000);
    return attempts.filter((attempt) => attempt > cutoff);
  }

  /**
   * Clean up old failed login attempts
   */
  private cleanupFailedAttempts(): void {
    const cutoff = new Date(
      Date.now() - this.BRUTE_FORCE_WINDOW_MINUTES * 60 * 1000 * 2,
    );

    for (const [identifier, tracking] of this.failedLoginAttempts.entries()) {
      if (tracking.firstAttempt < cutoff) {
        this.failedLoginAttempts.delete(identifier);
      }
    }
  }

  /**
   * Map audit log to login history entry
   */
  private mapToLoginHistoryEntry(log: AuditLog): LoginHistoryEntry {
    return {
      id: log.id,
      userId: log.userId!,
      email: (log.metadata as any)?.email || 'unknown',
      eventType: log.action,
      ipAddress: log.ipAddress || 'unknown',
      userAgent: log.userAgent || 'unknown',
      location: 'Unknown', // Would come from GeoIP in production
      country: 'Unknown',
      city: 'Unknown',
      success: (log.metadata as any)?.success || false,
      failureReason: (log.changes as any)?.reason,
      timestamp: log.createdAt,
      metadata: log.metadata,
    };
  }

  /**
   * Export security audit logs
   */
  async exportAuditLogs(
    startDate: Date,
    endDate: Date,
    format: 'json' | 'csv' = 'json',
  ): Promise<any> {
    const logs = await this.auditLogRepository.find({
      where: {
        entityType: 'authentication',
        createdAt: Between(startDate, endDate),
      },
      order: {
        createdAt: 'DESC',
      },
    });

    if (format === 'csv') {
      // Convert to CSV format
      const headers = [
        'ID',
        'User ID',
        'Action',
        'IP Address',
        'User Agent',
        'Success',
        'Timestamp',
      ];
      const rows = logs.map((log) => [
        log.id,
        log.userId || '',
        log.action,
        log.ipAddress || '',
        log.userAgent || '',
        (log.metadata as any)?.success || false,
        log.createdAt.toISOString(),
      ]);

      return [headers, ...rows];
    }

    return logs;
  }
}
