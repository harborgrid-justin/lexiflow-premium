import { Injectable, Logger } from '@nestjs/common';
import { NotificationChannel } from './notification-preferences.service';

export enum AlertSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export enum AlertType {
  DEADLINE_IMMINENT = 'deadline_imminent',
  FILING_DUE = 'filing_due',
  COURT_DATE = 'court_date',
  SECURITY_BREACH = 'security_breach',
  SYSTEM_OUTAGE = 'system_outage',
  PAYMENT_FAILED = 'payment_failed',
  COMPLIANCE_VIOLATION = 'compliance_violation',
  CASE_EMERGENCY = 'case_emergency',
  DOCUMENT_EXPIRING = 'document_expiring',
  ACCESS_DENIED = 'access_denied',
}

export interface UrgentAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  userId: string;
  createdAt: Date;
  expiresAt?: Date;
  channels: NotificationChannel[];
  data?: any;
  acknowledged: boolean;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  escalated: boolean;
  escalatedAt?: Date;
  escalatedTo?: string[];
  retryCount: number;
  lastRetryAt?: Date;
}

export interface AlertRule {
  type: AlertType;
  severity: AlertSeverity;
  channels: NotificationChannel[];
  retryAttempts: number;
  retryInterval: number; // milliseconds
  escalateAfter?: number; // milliseconds
  escalateTo?: string[]; // user IDs or roles
  autoExpire?: number; // milliseconds
}

export interface EscalationChain {
  alertType: AlertType;
  chain: Array<{
    level: number;
    delay: number; // milliseconds
    recipients: string[]; // user IDs or roles
    channels: NotificationChannel[];
  }>;
}

@Injectable()
export class UrgentAlertsService {
  private readonly logger = new Logger(UrgentAlertsService.name);
  private alerts = new Map<string, UrgentAlert>();
  private alertRules = new Map<AlertType, AlertRule>();
  private escalationChains = new Map<AlertType, EscalationChain>();
  private userAlerts = new Map<string, Set<string>>(); // userId -> alertIds
  private retryTimeouts = new Map<string, NodeJS.Timeout>();
  private escalationTimeouts = new Map<string, NodeJS.Timeout>();

  constructor() {
    this.initializeDefaultRules();
  }

  private initializeDefaultRules(): void {
    // Critical alerts
    this.setAlertRule(AlertType.DEADLINE_IMMINENT, {
      type: AlertType.DEADLINE_IMMINENT,
      severity: AlertSeverity.CRITICAL,
      channels: [
        NotificationChannel.PUSH,
        NotificationChannel.EMAIL,
        NotificationChannel.SMS,
        NotificationChannel.IN_APP,
      ],
      retryAttempts: 3,
      retryInterval: 5 * 60 * 1000, // 5 minutes
      escalateAfter: 15 * 60 * 1000, // 15 minutes
      autoExpire: 24 * 60 * 60 * 1000, // 24 hours
    });

    this.setAlertRule(AlertType.SECURITY_BREACH, {
      type: AlertType.SECURITY_BREACH,
      severity: AlertSeverity.CRITICAL,
      channels: [
        NotificationChannel.PUSH,
        NotificationChannel.EMAIL,
        NotificationChannel.SMS,
        NotificationChannel.SLACK,
      ],
      retryAttempts: 5,
      retryInterval: 2 * 60 * 1000, // 2 minutes
      escalateAfter: 5 * 60 * 1000, // 5 minutes
    });

    this.setAlertRule(AlertType.FILING_DUE, {
      type: AlertType.FILING_DUE,
      severity: AlertSeverity.HIGH,
      channels: [
        NotificationChannel.PUSH,
        NotificationChannel.EMAIL,
        NotificationChannel.IN_APP,
      ],
      retryAttempts: 2,
      retryInterval: 10 * 60 * 1000, // 10 minutes
      escalateAfter: 30 * 60 * 1000, // 30 minutes
      autoExpire: 48 * 60 * 60 * 1000, // 48 hours
    });

    this.logger.log('Initialized default urgent alert rules');
  }

  /**
   * Create urgent alert
   */
  createAlert(
    userId: string,
    type: AlertType,
    title: string,
    message: string,
    data?: any,
  ): UrgentAlert {
    const rule = this.alertRules.get(type);

    if (!rule) {
      throw new Error(`No rule defined for alert type: ${type}`);
    }

    const alertId = this.generateAlertId();
    const now = new Date();

    const alert: UrgentAlert = {
      id: alertId,
      type,
      severity: rule.severity,
      title,
      message,
      userId,
      createdAt: now,
      expiresAt: rule.autoExpire
        ? new Date(now.getTime() + rule.autoExpire)
        : undefined,
      channels: rule.channels,
      data,
      acknowledged: false,
      escalated: false,
      retryCount: 0,
    };

    this.alerts.set(alertId, alert);

    // Track user alerts
    if (!this.userAlerts.has(userId)) {
      this.userAlerts.set(userId, new Set());
    }
    this.userAlerts.get(userId)!.add(alertId);

    // Schedule retry if needed
    if (rule.retryAttempts > 0) {
      this.scheduleRetry(alert, rule);
    }

    // Schedule escalation if needed
    if (rule.escalateAfter) {
      this.scheduleEscalation(alert, rule);
    }

    this.logger.warn(
      `Created ${alert.severity} alert ${alertId}: ${title} for user ${userId}`,
    );

    return alert;
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
    const alert = this.alerts.get(alertId);

    if (!alert || alert.acknowledged) {
      return false;
    }

    alert.acknowledged = true;
    alert.acknowledgedAt = new Date();
    alert.acknowledgedBy = acknowledgedBy;

    // Clear retry and escalation timeouts
    this.clearRetryTimeout(alertId);
    this.clearEscalationTimeout(alertId);

    this.logger.log(`Alert ${alertId} acknowledged by ${acknowledgedBy}`);

    return true;
  }

  /**
   * Escalate alert
   */
  escalateAlert(alertId: string, escalateTo: string[]): boolean {
    const alert = this.alerts.get(alertId);

    if (!alert || alert.acknowledged || alert.escalated) {
      return false;
    }

    alert.escalated = true;
    alert.escalatedAt = new Date();
    alert.escalatedTo = escalateTo;

    // Create alerts for escalation recipients
    escalateTo.forEach((userId) => {
      this.createAlert(
        userId,
        alert.type,
        `[ESCALATED] ${alert.title}`,
        `Escalated from user ${alert.userId}: ${alert.message}`,
        { ...alert.data, originalAlertId: alertId },
      );
    });

    this.logger.warn(
      `Alert ${alertId} escalated to ${escalateTo.length} recipients`,
    );

    return true;
  }

  /**
   * Get alert
   */
  getAlert(alertId: string): UrgentAlert | undefined {
    return this.alerts.get(alertId);
  }

  /**
   * Get user alerts
   */
  getUserAlerts(userId: string, includeAcknowledged: boolean = false): UrgentAlert[] {
    const alertIds = this.userAlerts.get(userId) || new Set();

    return Array.from(alertIds)
      .map((id) => this.alerts.get(id))
      .filter((alert): alert is UrgentAlert => {
        if (!alert) return false;
        if (!includeAcknowledged && alert.acknowledged) return false;
        if (alert.expiresAt && alert.expiresAt < new Date()) return false;
        return true;
      })
      .sort((a, b) => {
        // Sort by severity then creation date
        const severityOrder = {
          [AlertSeverity.CRITICAL]: 0,
          [AlertSeverity.HIGH]: 1,
          [AlertSeverity.MEDIUM]: 2,
          [AlertSeverity.LOW]: 3,
        };

        const severityDiff =
          severityOrder[a.severity] - severityOrder[b.severity];

        if (severityDiff !== 0) {
          return severityDiff;
        }

        return b.createdAt.getTime() - a.createdAt.getTime();
      });
  }

  /**
   * Get unacknowledged alert count
   */
  getUnacknowledgedCount(userId: string): number {
    return this.getUserAlerts(userId, false).length;
  }

  /**
   * Get critical alerts count
   */
  getCriticalAlertsCount(userId: string): number {
    return this.getUserAlerts(userId, false).filter(
      (a) => a.severity === AlertSeverity.CRITICAL,
    ).length;
  }

  /**
   * Set alert rule
   */
  setAlertRule(type: AlertType, rule: AlertRule): void {
    this.alertRules.set(type, rule);
    this.logger.log(`Set alert rule for ${type}`);
  }

  /**
   * Get alert rule
   */
  getAlertRule(type: AlertType): AlertRule | undefined {
    return this.alertRules.get(type);
  }

  /**
   * Set escalation chain
   */
  setEscalationChain(chain: EscalationChain): void {
    this.escalationChains.set(chain.alertType, chain);
    this.logger.log(`Set escalation chain for ${chain.alertType}`);
  }

  /**
   * Get escalation chain
   */
  getEscalationChain(type: AlertType): EscalationChain | undefined {
    return this.escalationChains.get(type);
  }

  /**
   * Retry sending alert
   */
  private scheduleRetry(alert: UrgentAlert, rule: AlertRule): void {
    if (alert.retryCount >= rule.retryAttempts) {
      return;
    }

    const timeout = setTimeout(() => {
      if (!alert.acknowledged) {
        alert.retryCount++;
        alert.lastRetryAt = new Date();

        this.logger.log(
          `Retrying alert ${alert.id} (attempt ${alert.retryCount}/${rule.retryAttempts})`,
        );

        // Schedule next retry
        if (alert.retryCount < rule.retryAttempts) {
          this.scheduleRetry(alert, rule);
        }
      }
    }, rule.retryInterval);

    this.retryTimeouts.set(alert.id, timeout);
  }

  /**
   * Schedule escalation
   */
  private scheduleEscalation(alert: UrgentAlert, rule: AlertRule): void {
    if (!rule.escalateAfter || !rule.escalateTo) {
      return;
    }

    const timeout = setTimeout(() => {
      if (!alert.acknowledged && !alert.escalated) {
        this.escalateAlert(alert.id, rule.escalateTo!);
      }
    }, rule.escalateAfter);

    this.escalationTimeouts.set(alert.id, timeout);
  }

  /**
   * Clear retry timeout
   */
  private clearRetryTimeout(alertId: string): void {
    const timeout = this.retryTimeouts.get(alertId);
    if (timeout) {
      clearTimeout(timeout);
      this.retryTimeouts.delete(alertId);
    }
  }

  /**
   * Clear escalation timeout
   */
  private clearEscalationTimeout(alertId: string): void {
    const timeout = this.escalationTimeouts.get(alertId);
    if (timeout) {
      clearTimeout(timeout);
      this.escalationTimeouts.delete(alertId);
    }
  }

  /**
   * Clean up expired alerts
   */
  cleanupExpiredAlerts(): void {
    const now = Date.now();
    const expiredAlerts: string[] = [];

    this.alerts.forEach((alert, alertId) => {
      if (alert.expiresAt && alert.expiresAt.getTime() < now) {
        expiredAlerts.push(alertId);
      }
    });

    expiredAlerts.forEach((alertId) => {
      const alert = this.alerts.get(alertId);
      if (alert) {
        this.userAlerts.get(alert.userId)?.delete(alertId);
      }
      this.alerts.delete(alertId);
      this.clearRetryTimeout(alertId);
      this.clearEscalationTimeout(alertId);
    });

    if (expiredAlerts.length > 0) {
      this.logger.log(`Cleaned up ${expiredAlerts.length} expired alerts`);
    }
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalAlerts: number;
    unacknowledged: number;
    escalated: number;
    bySeverity: Record<AlertSeverity, number>;
    byType: Record<AlertType, number>;
    averageAcknowledgeTime: number;
  } {
    let unacknowledged = 0;
    let escalated = 0;
    const bySeverity: Record<AlertSeverity, number> = {
      [AlertSeverity.CRITICAL]: 0,
      [AlertSeverity.HIGH]: 0,
      [AlertSeverity.MEDIUM]: 0,
      [AlertSeverity.LOW]: 0,
    };
    const byType: Record<AlertType, any> = {} as any;
    let totalAcknowledgeTime = 0;
    let acknowledgedCount = 0;

    this.alerts.forEach((alert) => {
      if (!alert.acknowledged) {
        unacknowledged++;
      } else {
        acknowledgedCount++;
        if (alert.acknowledgedAt) {
          totalAcknowledgeTime +=
            alert.acknowledgedAt.getTime() - alert.createdAt.getTime();
        }
      }

      if (alert.escalated) {
        escalated++;
      }

      bySeverity[alert.severity]++;
      byType[alert.type] = (byType[alert.type] || 0) + 1;
    });

    return {
      totalAlerts: this.alerts.size,
      unacknowledged,
      escalated,
      bySeverity,
      byType,
      averageAcknowledgeTime:
        acknowledgedCount > 0 ? totalAcknowledgeTime / acknowledgedCount : 0,
    };
  }

  /**
   * Get alert summary for user
   */
  getAlertSummary(userId: string): {
    total: number;
    critical: number;
    high: number;
    unacknowledged: number;
    recentAlerts: UrgentAlert[];
  } {
    const alerts = this.getUserAlerts(userId, true);
    const unacknowledged = alerts.filter((a) => !a.acknowledged);

    return {
      total: alerts.length,
      critical: alerts.filter((a) => a.severity === AlertSeverity.CRITICAL)
        .length,
      high: alerts.filter((a) => a.severity === AlertSeverity.HIGH).length,
      unacknowledged: unacknowledged.length,
      recentAlerts: alerts.slice(0, 5),
    };
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Delete alert
   */
  deleteAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);

    if (!alert) {
      return false;
    }

    this.userAlerts.get(alert.userId)?.delete(alertId);
    this.alerts.delete(alertId);
    this.clearRetryTimeout(alertId);
    this.clearEscalationTimeout(alertId);

    return true;
  }

  /**
   * Clear all alerts for user
   */
  clearUserAlerts(userId: string): number {
    const alertIds = this.userAlerts.get(userId) || new Set();
    const count = alertIds.size;

    alertIds.forEach((alertId) => {
      this.deleteAlert(alertId);
    });

    this.userAlerts.delete(userId);

    return count;
  }
}
