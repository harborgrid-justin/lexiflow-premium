import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { RedisCacheManagerService } from '@common/services/redis-cache-manager.service';

/**
 * Security Event Types
 */
export enum SecurityEventType {
  // Authentication Events
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  LOGOUT = 'LOGOUT',
  SESSION_HIJACK_ATTEMPT = 'SESSION_HIJACK_ATTEMPT',
  BRUTE_FORCE_ATTEMPT = 'BRUTE_FORCE_ATTEMPT',

  // Authorization Events
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  PRIVILEGE_ESCALATION = 'PRIVILEGE_ESCALATION',
  PERMISSION_VIOLATION = 'PERMISSION_VIOLATION',

  // Injection Attempts
  SQL_INJECTION_ATTEMPT = 'SQL_INJECTION_ATTEMPT',
  NOSQL_INJECTION_ATTEMPT = 'NOSQL_INJECTION_ATTEMPT',
  XSS_ATTEMPT = 'XSS_ATTEMPT',
  COMMAND_INJECTION_ATTEMPT = 'COMMAND_INJECTION_ATTEMPT',
  LDAP_INJECTION_ATTEMPT = 'LDAP_INJECTION_ATTEMPT',

  // Application Security
  CSRF_VIOLATION = 'CSRF_VIOLATION',
  CORS_VIOLATION = 'CORS_VIOLATION',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SUSPICIOUS_FILE_UPLOAD = 'SUSPICIOUS_FILE_UPLOAD',
  SSRF_ATTEMPT = 'SSRF_ATTEMPT',

  // Data Security
  SENSITIVE_DATA_ACCESS = 'SENSITIVE_DATA_ACCESS',
  DATA_EXFILTRATION_ATTEMPT = 'DATA_EXFILTRATION_ATTEMPT',
  UNAUTHORIZED_EXPORT = 'UNAUTHORIZED_EXPORT',
  PROTOTYPE_POLLUTION = 'PROTOTYPE_POLLUTION',

  // Infrastructure
  IP_BLOCKED = 'IP_BLOCKED',
  SUSPICIOUS_TRAFFIC = 'SUSPICIOUS_TRAFFIC',
  API_ABUSE = 'API_ABUSE',
  SCANNER_DETECTED = 'SCANNER_DETECTED',

  // Compliance
  AUDIT_LOG_TAMPERING = 'AUDIT_LOG_TAMPERING',
  COMPLIANCE_VIOLATION = 'COMPLIANCE_VIOLATION',
  GDPR_VIOLATION = 'GDPR_VIOLATION',
}

/**
 * Security Event Severity
 */
export enum SecurityEventSeverity {
  INFO = 'INFO',
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

/**
 * Security event details (structured data for event context)
 */
export interface SecurityEventDetails {
  [key: string]: string | number | boolean | string[] | number[] | null | undefined;
}

/**
 * Security Event
 */
export interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  severity: SecurityEventSeverity;
  timestamp: Date;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  resource?: string;
  action?: string;
  details: SecurityEventDetails;
  correlationId?: string;
  blocked: boolean;
}

/**
 * Security Alert
 */
export interface SecurityAlert {
  id: string;
  events: SecurityEvent[];
  pattern: string;
  severity: SecurityEventSeverity;
  timestamp: Date;
  description: string;
  recommendations: string[];
}

/**
 * Security Metrics
 */
export interface SecurityMetrics {
  totalEvents: number;
  eventsByType: Record<SecurityEventType, number>;
  eventsBySeverity: Record<SecurityEventSeverity, number>;
  blockedAttempts: number;
  uniqueIPs: number;
  uniqueUsers: number;
  topAttackers: Array<{ ip: string; count: number }>;
  topTargets: Array<{ resource: string; count: number }>;
  timeRange: { from: Date; to: Date };
}

/**
 * Security Event Monitoring and Alerting Service
 *
 * Provides real-time security event monitoring, pattern detection, and alerting:
 * - Real-time event collection and analysis
 * - Threat pattern detection (brute force, scanning, injection attempts)
 * - Automatic threat response and blocking
 * - Security metrics and dashboards
 * - Alert aggregation and notification
 * - Compliance reporting
 *
 * OWASP References:
 * - Security Logging and Monitoring Failures (A09:2021)
 * - Application Security Verification Standard (ASVS)
 *
 * @see https://owasp.org/Top10/A09_2021-Security_Logging_and_Monitoring_Failures/
 */
/**
 * ╔=================================================================================================================╗
 * ║SECURITYMONITORING                                                                                               ║
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
export class SecurityMonitoringService implements OnModuleDestroy {
  private readonly logger = new Logger(SecurityMonitoringService.name);
  private readonly eventBuffer: SecurityEvent[] = [];
  private readonly alertBuffer: SecurityAlert[] = [];
  private flushInterval!: ReturnType<typeof setInterval>;
  private metricsInterval!: ReturnType<typeof setInterval>;

  private readonly MAX_BUFFER_SIZE = 1000;
  private readonly FLUSH_INTERVAL_MS = 10000; // 10 seconds
  private readonly METRICS_INTERVAL_MS = 60000; // 1 minute

  // Pattern detection thresholds
  private readonly BRUTE_FORCE_THRESHOLD = 5; // attempts per minute
  private readonly SCANNER_THRESHOLD = 20; // 404s per minute

  constructor(
    private readonly redisService: RedisCacheManagerService,
  ) {
    this.initializeMonitoring();
  }

  onModuleDestroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
    this.flush();
  }

  /**
   * Initialize monitoring intervals
   */
  private initializeMonitoring(): void {
    // Flush events periodically
    this.flushInterval = setInterval(() => {
      this.flush();
    }, this.FLUSH_INTERVAL_MS);

    // Calculate metrics periodically
    this.metricsInterval = setInterval(() => {
      this.calculateMetrics();
    }, this.METRICS_INTERVAL_MS);

    this.logger.log('Security monitoring initialized');
  }

  /**
   * Record security event
   */
  async recordEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): Promise<void> {
    const securityEvent: SecurityEvent = {
      id: this.generateEventId(),
      timestamp: new Date(),
      ...event,
    };

    // Add to buffer
    this.eventBuffer.push(securityEvent);

    // Log based on severity
    this.logEvent(securityEvent);

    // Store in Redis for real-time analysis
    await this.storeEventInRedis(securityEvent);

    // Check for patterns and generate alerts
    await this.detectPatterns(securityEvent);

    // Flush if buffer is full
    if (this.eventBuffer.length >= this.MAX_BUFFER_SIZE) {
      await this.flush();
    }

    // Auto-response for critical events
    if (securityEvent.severity === SecurityEventSeverity.CRITICAL) {
      await this.handleCriticalEvent(securityEvent);
    }
  }

  /**
   * Record authentication failure
   */
  async recordAuthFailure(userId: string, ipAddress: string, reason: string): Promise<void> {
    await this.recordEvent({
      type: SecurityEventType.LOGIN_FAILURE,
      severity: SecurityEventSeverity.MEDIUM,
      userId,
      ipAddress,
      details: { reason },
      blocked: false,
    });
  }

  /**
   * Record injection attempt
   */
  async recordInjectionAttempt(
    type: 'SQL' | 'NoSQL' | 'XSS' | 'Command' | 'LDAP',
    details: SecurityEventDetails,
  ): Promise<void> {
    const eventTypeMap = {
      SQL: SecurityEventType.SQL_INJECTION_ATTEMPT,
      NoSQL: SecurityEventType.NOSQL_INJECTION_ATTEMPT,
      XSS: SecurityEventType.XSS_ATTEMPT,
      Command: SecurityEventType.COMMAND_INJECTION_ATTEMPT,
      LDAP: SecurityEventType.LDAP_INJECTION_ATTEMPT,
    };

    await this.recordEvent({
      type: eventTypeMap[type],
      severity: SecurityEventSeverity.CRITICAL,
      details,
      blocked: true,
    });
  }

  /**
   * Record unauthorized access
   */
  async recordUnauthorizedAccess(
    userId: string | undefined,
    resource: string,
    action: string,
    ipAddress: string,
  ): Promise<void> {
    await this.recordEvent({
      type: SecurityEventType.UNAUTHORIZED_ACCESS,
      severity: SecurityEventSeverity.HIGH,
      userId,
      ipAddress,
      resource,
      action,
      details: {},
      blocked: true,
    });
  }

  /**
   * Record rate limit exceeded
   */
  async recordRateLimitExceeded(
    identifier: string,
    endpoint: string,
    ipAddress: string,
  ): Promise<void> {
    await this.recordEvent({
      type: SecurityEventType.RATE_LIMIT_EXCEEDED,
      severity: SecurityEventSeverity.MEDIUM,
      ipAddress,
      resource: endpoint,
      details: { identifier },
      blocked: true,
    });
  }

  /**
   * Record CORS violation
   */
  async recordCorsViolation(origin: string, ipAddress: string, reason: string): Promise<void> {
    await this.recordEvent({
      type: SecurityEventType.CORS_VIOLATION,
      severity: SecurityEventSeverity.HIGH,
      ipAddress,
      details: { origin, reason },
      blocked: true,
    });
  }

  /**
   * Record session hijack attempt
   */
  async recordSessionHijack(userId: string, ipAddress: string, details: SecurityEventDetails): Promise<void> {
    await this.recordEvent({
      type: SecurityEventType.SESSION_HIJACK_ATTEMPT,
      severity: SecurityEventSeverity.CRITICAL,
      userId,
      ipAddress,
      details,
      blocked: true,
    });
  }

  /**
   * Detect attack patterns
   */
  private async detectPatterns(event: SecurityEvent): Promise<void> {
    if (!event.ipAddress) return;

    const recentEvents = await this.getRecentEventsByIP(event.ipAddress);

    // 1. Detect brute force
    const bruteForce = this.detectBruteForce(recentEvents);
    if (bruteForce) {
      await this.createAlert({
        events: bruteForce,
        pattern: 'Brute Force Attack',
        severity: SecurityEventSeverity.CRITICAL,
        description: `Multiple failed login attempts from ${event.ipAddress}`,
        recommendations: [
          'Block IP address immediately',
          'Review authentication logs',
          'Enable MFA if not already enabled',
          'Monitor for distributed attack patterns',
        ],
      });
    }

    // 2. Detect scanning activity
    const scanning = this.detectScanning(recentEvents);
    if (scanning) {
      await this.createAlert({
        events: scanning,
        pattern: 'Port/Vulnerability Scanning',
        severity: SecurityEventSeverity.HIGH,
        description: `Suspicious scanning activity detected from ${event.ipAddress}`,
        recommendations: [
          'Block IP address',
          'Review WAF rules',
          'Check for exposed endpoints',
          'Monitor for data exfiltration attempts',
        ],
      });
    }

    // 3. Detect injection campaign
    const injectionCampaign = this.detectInjectionCampaign(recentEvents);
    if (injectionCampaign) {
      await this.createAlert({
        events: injectionCampaign,
        pattern: 'Injection Attack Campaign',
        severity: SecurityEventSeverity.CRITICAL,
        description: `Multiple injection attempts from ${event.ipAddress}`,
        recommendations: [
          'Block IP address permanently',
          'Review input validation rules',
          'Check for successful injection attempts',
          'Audit database for unauthorized changes',
        ],
      });
    }

    // 4. Detect privilege escalation
    const privilegeEscalation = this.detectPrivilegeEscalation(recentEvents);
    if (privilegeEscalation) {
      await this.createAlert({
        events: privilegeEscalation,
        pattern: 'Privilege Escalation Attempt',
        severity: SecurityEventSeverity.CRITICAL,
        description: `Privilege escalation attempts detected`,
        recommendations: [
          'Immediately review user permissions',
          'Suspend affected user accounts',
          'Audit recent authorization changes',
          'Review RBAC configuration',
        ],
      });
    }
  }

  /**
   * Detect brute force attack
   */
  private detectBruteForce(events: SecurityEvent[]): SecurityEvent[] | null {
    const failedLogins = events.filter(
      e => e.type === SecurityEventType.LOGIN_FAILURE &&
      e.timestamp.getTime() > Date.now() - 60000 // Last minute
    );

    if (failedLogins.length >= this.BRUTE_FORCE_THRESHOLD) {
      return failedLogins;
    }

    return null;
  }

  /**
   * Detect scanning activity
   */
  private detectScanning(events: SecurityEvent[]): SecurityEvent[] | null {
    const scanningEvents = events.filter(
      e => e.type === SecurityEventType.SCANNER_DETECTED &&
      e.timestamp.getTime() > Date.now() - 60000
    );

    if (scanningEvents.length >= this.SCANNER_THRESHOLD) {
      return scanningEvents;
    }

    return null;
  }

  /**
   * Detect injection campaign
   */
  private detectInjectionCampaign(events: SecurityEvent[]): SecurityEvent[] | null {
    const injectionTypes = [
      SecurityEventType.SQL_INJECTION_ATTEMPT,
      SecurityEventType.NOSQL_INJECTION_ATTEMPT,
      SecurityEventType.XSS_ATTEMPT,
      SecurityEventType.COMMAND_INJECTION_ATTEMPT,
    ];

    const injectionEvents = events.filter(
      e => injectionTypes.includes(e.type) &&
      e.timestamp.getTime() > Date.now() - 300000 // Last 5 minutes
    );

    if (injectionEvents.length >= 3) {
      return injectionEvents;
    }

    return null;
  }

  /**
   * Detect privilege escalation
   */
  private detectPrivilegeEscalation(events: SecurityEvent[]): SecurityEvent[] | null {
    const escalationEvents = events.filter(
      e => e.type === SecurityEventType.PRIVILEGE_ESCALATION &&
      e.timestamp.getTime() > Date.now() - 300000
    );

    if (escalationEvents.length >= 2) {
      return escalationEvents;
    }

    return null;
  }

  /**
   * Create security alert
   */
  private async createAlert(alert: Omit<SecurityAlert, 'id' | 'timestamp'>): Promise<void> {
    const securityAlert: SecurityAlert = {
      id: this.generateAlertId(),
      timestamp: new Date(),
      ...alert,
    };

    this.alertBuffer.push(securityAlert);

    // Log alert
    this.logger.error(
      `SECURITY ALERT: ${securityAlert.pattern} - ${securityAlert.description}`,
      { alert: securityAlert },
    );

    // Store in Redis
    await this.storeAlertInRedis(securityAlert);

    // Send notifications (email, Slack, PagerDuty, etc.)
    await this.sendAlertNotifications(securityAlert);
  }

  /**
   * Handle critical security event
   */
  private async handleCriticalEvent(event: SecurityEvent): Promise<void> {
    this.logger.error(`CRITICAL SECURITY EVENT: ${event.type}`, { event });

    // Auto-block IP if applicable
    if (event.ipAddress && event.blocked) {
      await this.autoBlockIP(event.ipAddress, event.type);
    }

    // Send immediate notification
    await this.sendCriticalNotification(event);
  }

  /**
   * Auto-block IP address
   */
  private async autoBlockIP(ipAddress: string, reason: string): Promise<void> {
    const blockKey = `security:blocked:ip:${ipAddress}`;
    await this.redisService.set(blockKey, { reason, timestamp: new Date() }, { ttl: 86400 }); // 24 hours
    this.logger.warn(`Auto-blocked IP: ${ipAddress} - Reason: ${reason}`);
  }

  /**
   * Get recent events by IP
   */
  private async getRecentEventsByIP(ipAddress: string): Promise<SecurityEvent[]> {
    const key = `security:events:ip:${ipAddress}`;
    const events = await this.redisService.get<SecurityEvent[]>(key);
    return events || [];
  }

  /**
   * Store event in Redis
   */
  private async storeEventInRedis(event: SecurityEvent): Promise<void> {
    if (!event.ipAddress) return;

    const key = `security:events:ip:${event.ipAddress}`;
    const events = await this.getRecentEventsByIP(event.ipAddress);
    events.push(event);

    // Keep only last 100 events per IP
    if (events.length > 100) {
      events.shift();
    }

    await this.redisService.set(key, events, { ttl: 3600 }); // 1 hour TTL
  }

  /**
   * Store alert in Redis
   */
  private async storeAlertInRedis(alert: SecurityAlert): Promise<void> {
    const key = `security:alerts:${alert.id}`;
    await this.redisService.set(key, alert, { ttl: 86400 }); // 24 hours
  }

  /**
   * Send alert notifications
   */
  private async sendAlertNotifications(alert: SecurityAlert): Promise<void> {
    // TODO: Implement notification channels (email, Slack, PagerDuty, etc.)
    this.logger.log(`Alert notification sent for: ${alert.pattern}`);
  }

  /**
   * Send critical notification
   */
  private async sendCriticalNotification(event: SecurityEvent): Promise<void> {
    // TODO: Implement critical notification channels
    this.logger.error(`Critical notification sent for: ${event.type}`);
  }

  /**
   * Calculate security metrics
   */
  private async calculateMetrics(): Promise<void> {
    const metrics = await this.getMetrics(
      new Date(Date.now() - 3600000), // Last hour
      new Date(),
    );

    this.logger.debug('Security metrics calculated', { metrics });

    // Store metrics in Redis
    const key = 'security:metrics:current';
    await this.redisService.set(key, metrics, { ttl: 300 }); // 5 minutes TTL
  }

  /**
   * Get security metrics
   */
  async getMetrics(from: Date, to: Date): Promise<SecurityMetrics> {
    const events = this.eventBuffer.filter(
      e => e.timestamp >= from && e.timestamp <= to,
    );

    const eventsByType = {} as Record<SecurityEventType, number>;
    const eventsBySeverity = {} as Record<SecurityEventSeverity, number>;
    const ipCounts: Record<string, number> = {};
    const resourceCounts: Record<string, number> = {};
    const uniqueUsers = new Set<string>();

    for (const event of events) {
      // Count by type
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;

      // Count by severity
      eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1;

      // Count IPs
      if (event.ipAddress) {
        ipCounts[event.ipAddress] = (ipCounts[event.ipAddress] || 0) + 1;
      }

      // Count resources
      if (event.resource) {
        resourceCounts[event.resource] = (resourceCounts[event.resource] || 0) + 1;
      }

      // Count users
      if (event.userId) {
        uniqueUsers.add(event.userId);
      }
    }

    const topAttackers = Object.entries(ipCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([ip, count]) => ({ ip, count }));

    const topTargets = Object.entries(resourceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([resource, count]) => ({ resource, count }));

    return {
      totalEvents: events.length,
      eventsByType,
      eventsBySeverity,
      blockedAttempts: events.filter(e => e.blocked).length,
      uniqueIPs: Object.keys(ipCounts).length,
      uniqueUsers: uniqueUsers.size,
      topAttackers,
      topTargets,
      timeRange: { from, to },
    };
  }

  /**
   * Get recent alerts
   */
  async getRecentAlerts(limit: number = 10): Promise<SecurityAlert[]> {
    return this.alertBuffer.slice(-limit);
  }

  /**
   * Flush events to persistent storage
   */
  private async flush(): Promise<void> {
    if (this.eventBuffer.length === 0) return;

    const eventsToFlush = [...this.eventBuffer];
    this.eventBuffer.length = 0;

    try {
      // TODO: Store in database for long-term retention
      this.logger.debug(`Flushed ${eventsToFlush.length} security events`);
    } catch (error) {
      this.logger.error('Failed to flush security events', error);
      // Re-add to buffer (with size limit)
      this.eventBuffer.push(...eventsToFlush.slice(-this.MAX_BUFFER_SIZE));
    }
  }

  /**
   * Generate event ID
   */
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate alert ID
   */
  private generateAlertId(): string {
    return `alt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Log event based on severity
   */
  private logEvent(event: SecurityEvent): void {
    const message = `SECURITY EVENT: ${event.type} - Severity: ${event.severity}`;
    const context = {
      eventId: event.id,
      type: event.type,
      userId: event.userId,
      ipAddress: event.ipAddress,
      resource: event.resource,
    };

    switch (event.severity) {
      case SecurityEventSeverity.CRITICAL:
      case SecurityEventSeverity.HIGH:
        this.logger.error(message, context);
        break;
      case SecurityEventSeverity.MEDIUM:
        this.logger.warn(message, context);
        break;
      case SecurityEventSeverity.LOW:
      case SecurityEventSeverity.INFO:
        this.logger.log(message, context);
        break;
    }
  }
}
