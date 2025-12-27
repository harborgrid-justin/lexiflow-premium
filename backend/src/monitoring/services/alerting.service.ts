import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemAlert, AlertSeverity } from '@monitoring/entities/system-alert.entity';
import { StructuredLoggerService } from './structured.logger.service';
import { MetricsCollectorService } from './metrics.collector.service';
import axios from 'axios';

export interface AlertThreshold {
  metric: string;
  operator: 'gt' | 'lt' | 'gte' | 'lte' | 'eq';
  value: number;
  severity: AlertSeverity;
  windowMinutes?: number;
}

export interface AlertChannel {
  type: 'email' | 'webhook' | 'slack';
  enabled: boolean;
  config: any;
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  threshold: AlertThreshold;
  enabled: boolean;
  cooldownMinutes: number;
  channels: AlertChannel[];
}

/**
 * Alerting Service
 * Monitors system metrics and triggers alerts based on configurable thresholds
 * Supports multiple alert channels: email, webhook, Slack
 */
@Injectable()
export class AlertingService {
  private alertRules: Map<string, AlertRule> = new Map();
  private lastAlertTimes: Map<string, Date> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor(
    @InjectRepository(SystemAlert)
    private readonly alertRepository: Repository<SystemAlert>,
    private readonly logger: StructuredLoggerService,
    private readonly metricsCollector: MetricsCollectorService,
  ) {
    this.initializeDefaultRules();
    this.startMonitoring();
  }

  /**
   * Initialize default alert rules
   */
  private initializeDefaultRules(): void {
    // High error rate alert
    this.addRule({
      id: 'high-error-rate',
      name: 'High Error Rate',
      description: 'Alert when error rate exceeds threshold',
      threshold: {
        metric: 'error.rate',
        operator: 'gt',
        value: 0.05, // 5% error rate
        severity: AlertSeverity.ERROR,
        windowMinutes: 5,
      },
      enabled: true,
      cooldownMinutes: 15,
      channels: [
        {
          type: 'webhook',
          enabled: true,
          config: {
            url: process.env.ALERT_WEBHOOK_URL,
          },
        },
      ],
    });

    // Response time degradation
    this.addRule({
      id: 'slow-response-time',
      name: 'Slow Response Time',
      description: 'Alert when average response time exceeds threshold',
      threshold: {
        metric: 'response.time.p95',
        operator: 'gt',
        value: 2000, // 2 seconds
        severity: AlertSeverity.WARNING,
        windowMinutes: 5,
      },
      enabled: true,
      cooldownMinutes: 15,
      channels: [
        {
          type: 'webhook',
          enabled: true,
          config: {
            url: process.env.ALERT_WEBHOOK_URL,
          },
        },
      ],
    });

    // Failed authentication patterns
    this.addRule({
      id: 'failed-auth-spike',
      name: 'Failed Authentication Spike',
      description: 'Alert when failed authentication attempts spike',
      threshold: {
        metric: 'auth.failures',
        operator: 'gt',
        value: 10,
        severity: AlertSeverity.ERROR,
        windowMinutes: 5,
      },
      enabled: true,
      cooldownMinutes: 10,
      channels: [
        {
          type: 'webhook',
          enabled: true,
          config: {
            url: process.env.ALERT_WEBHOOK_URL,
          },
        },
      ],
    });

    // Database connection issues
    this.addRule({
      id: 'database-errors',
      name: 'Database Connection Errors',
      description: 'Alert on database connection failures',
      threshold: {
        metric: 'database.error.rate',
        operator: 'gt',
        value: 0.01, // 1% error rate
        severity: AlertSeverity.CRITICAL,
        windowMinutes: 5,
      },
      enabled: true,
      cooldownMinutes: 5,
      channels: [
        {
          type: 'webhook',
          enabled: true,
          config: {
            url: process.env.ALERT_WEBHOOK_URL,
          },
        },
      ],
    });

    // High CPU usage
    this.addRule({
      id: 'high-cpu-usage',
      name: 'High CPU Usage',
      description: 'Alert when CPU usage is consistently high',
      threshold: {
        metric: 'system.cpu.usage.percent',
        operator: 'gt',
        value: 80,
        severity: AlertSeverity.WARNING,
        windowMinutes: 10,
      },
      enabled: true,
      cooldownMinutes: 30,
      channels: [
        {
          type: 'webhook',
          enabled: true,
          config: {
            url: process.env.ALERT_WEBHOOK_URL,
          },
        },
      ],
    });

    // High memory usage
    this.addRule({
      id: 'high-memory-usage',
      name: 'High Memory Usage',
      description: 'Alert when memory usage is consistently high',
      threshold: {
        metric: 'system.memory.usage.percent',
        operator: 'gt',
        value: 85,
        severity: AlertSeverity.ERROR,
        windowMinutes: 10,
      },
      enabled: true,
      cooldownMinutes: 30,
      channels: [
        {
          type: 'webhook',
          enabled: true,
          config: {
            url: process.env.ALERT_WEBHOOK_URL,
          },
        },
      ],
    });

    // Slow database queries
    this.addRule({
      id: 'slow-database-queries',
      name: 'Slow Database Queries',
      description: 'Alert when database queries are slow',
      threshold: {
        metric: 'database.query.duration.p95',
        operator: 'gt',
        value: 1000, // 1 second
        severity: AlertSeverity.WARNING,
        windowMinutes: 5,
      },
      enabled: true,
      cooldownMinutes: 20,
      channels: [
        {
          type: 'webhook',
          enabled: true,
          config: {
            url: process.env.ALERT_WEBHOOK_URL,
          },
        },
      ],
    });
  }

  /**
   * Add or update an alert rule
   */
  addRule(rule: AlertRule): void {
    this.alertRules.set(rule.id, rule);
    this.logger.log(`Alert rule added: ${rule.name}`, { ruleId: rule.id });
  }

  /**
   * Remove an alert rule
   */
  removeRule(ruleId: string): void {
    this.alertRules.delete(ruleId);
    this.lastAlertTimes.delete(ruleId);
    this.logger.log(`Alert rule removed: ${ruleId}`);
  }

  /**
   * Enable/disable an alert rule
   */
  toggleRule(ruleId: string, enabled: boolean): void {
    const rule = this.alertRules.get(ruleId);
    if (rule) {
      rule.enabled = enabled;
      this.logger.log(`Alert rule ${enabled ? 'enabled' : 'disabled'}: ${ruleId}`);
    }
  }

  /**
   * Get all alert rules
   */
  getRules(): AlertRule[] {
    return Array.from(this.alertRules.values());
  }

  /**
   * Start monitoring metrics against alert rules
   */
  private startMonitoring(): void {
    // Check alerts every minute
    this.monitoringInterval = setInterval(() => {
      this.checkAlertRules();
    }, 60000);

    this.logger.log('Alert monitoring started');
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      this.logger.log('Alert monitoring stopped');
    }
  }

  /**
   * Check all alert rules against current metrics
   */
  private async checkAlertRules(): Promise<void> {
    const snapshot = this.metricsCollector.getMetricsSnapshot();
    const requestStats = this.metricsCollector.getRequestStats();
    const dbStats = this.metricsCollector.getDatabaseStats();

    for (const rule of this.alertRules.values()) {
      if (!rule.enabled) {
        continue;
      }

      // Check cooldown
      const lastAlert = this.lastAlertTimes.get(rule.id);
      if (lastAlert) {
        const cooldownMs = rule.cooldownMinutes * 60 * 1000;
        const timeSinceLastAlert = Date.now() - lastAlert.getTime();
        if (timeSinceLastAlert < cooldownMs) {
          continue;
        }
      }

      // Evaluate threshold
      const metricValue = this.getMetricValue(rule.threshold.metric, snapshot, requestStats, dbStats);
      if (metricValue === null) {
        continue;
      }

      const triggered = this.evaluateThreshold(metricValue, rule.threshold);
      if (triggered) {
        await this.triggerAlert(rule, metricValue);
      }
    }
  }

  /**
   * Get metric value from snapshots
   */
  private getMetricValue(
    metricName: string,
    snapshot: any,
    requestStats: any,
    dbStats: any,
  ): number | null {
    // System metrics
    if (snapshot.gauges[metricName] !== undefined) {
      return snapshot.gauges[metricName];
    }

    // Request metrics
    if (metricName === 'error.rate') {
      const totalRequests = Object.values(requestStats).reduce((sum: number, stat: any) => sum + stat.count, 0);
      const totalErrors = Object.values(requestStats).reduce((sum: number, stat: any) => sum + stat.errors, 0);
      return totalRequests > 0 ? totalErrors / totalRequests : 0;
    }

    if (metricName === 'response.time.p95') {
      const p95Values = Object.values(requestStats).map((stat: any) => stat.p95);
      return p95Values.length > 0 ? Math.max(...p95Values) : 0;
    }

    // Database metrics
    if (metricName === 'database.error.rate') {
      return dbStats.errorRate;
    }

    if (metricName === 'database.query.duration.p95') {
      return dbStats.p95;
    }

    // Check histogram stats
    if (snapshot.histograms[metricName]) {
      return snapshot.histograms[metricName].avg;
    }

    return null;
  }

  /**
   * Evaluate if threshold is breached
   */
  private evaluateThreshold(value: number, threshold: AlertThreshold): boolean {
    switch (threshold.operator) {
      case 'gt':
        return value > threshold.value;
      case 'lt':
        return value < threshold.value;
      case 'gte':
        return value >= threshold.value;
      case 'lte':
        return value <= threshold.value;
      case 'eq':
        return value === threshold.value;
      default:
        return false;
    }
  }

  /**
   * Trigger an alert
   */
  private async triggerAlert(rule: AlertRule, currentValue: number): Promise<void> {
    const alert = await this.createAlert({
      title: rule.name,
      message: `${rule.description}. Current value: ${currentValue}, Threshold: ${rule.threshold.value}`,
      severity: rule.threshold.severity,
      source: 'alerting-service',
      metadata: {
        ruleId: rule.id,
        metric: rule.threshold.metric,
        currentValue,
        threshold: rule.threshold.value,
        operator: rule.threshold.operator,
      },
    });

    // Update last alert time
    this.lastAlertTimes.set(rule.id, new Date());

    // Send through configured channels
    for (const channel of rule.channels) {
      if (channel.enabled) {
        await this.sendAlertToChannel(alert, channel);
      }
    }

    this.logger.warn(`Alert triggered: ${rule.name}`, {
      ruleId: rule.id,
      currentValue,
      threshold: rule.threshold.value,
    });
  }

  /**
   * Create an alert record
   */
  async createAlert(data: {
    title: string;
    message: string;
    severity: AlertSeverity;
    source: string;
    metadata?: any;
  }): Promise<SystemAlert> {
    const alert = this.alertRepository.create({
      ...data,
      resolved: false,
      acknowledged: false,
    });

    return await this.alertRepository.save(alert);
  }

  /**
   * Send alert to configured channel
   */
  private async sendAlertToChannel(alert: SystemAlert, channel: AlertChannel): Promise<void> {
    try {
      switch (channel.type) {
        case 'webhook':
          await this.sendWebhookAlert(alert, channel.config);
          break;
        case 'slack':
          await this.sendSlackAlert(alert, channel.config);
          break;
        case 'email':
          await this.sendEmailAlert(alert, channel.config);
          break;
      }
    } catch (error) {
      this.logger.error(
        `Failed to send alert to ${channel.type}`,
        error instanceof Error ? error.message : String(error),
        {
        alertId: alert.id,
        channel: channel.type,
      });
    }
  }

  /**
   * Send alert via webhook
   */
  private async sendWebhookAlert(alert: SystemAlert, config: any): Promise<void> {
    if (!config.url) {
      return;
    }

    const payload = {
      title: alert.title,
      message: alert.message,
      severity: alert.severity,
      timestamp: alert.createdAt,
      metadata: alert.metadata,
    };

    await axios.post(config.url, payload, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.logger.log('Alert sent via webhook', { alertId: alert.id });
  }

  /**
   * Send alert to Slack
   */
  private async sendSlackAlert(alert: SystemAlert, config: any): Promise<void> {
    if (!config.webhookUrl) {
      return;
    }

    const color = this.getSeverityColor(alert.severity);
    const payload = {
      attachments: [
        {
          color,
          title: alert.title,
          text: alert.message,
          fields: [
            {
              title: 'Severity',
              value: alert.severity,
              short: true,
            },
            {
              title: 'Source',
              value: alert.source,
              short: true,
            },
            {
              title: 'Timestamp',
              value: alert.createdAt.toISOString(),
              short: false,
            },
          ],
          footer: 'LexiFlow Monitoring',
          ts: Math.floor(alert.createdAt.getTime() / 1000),
        },
      ],
    };

    await axios.post(config.webhookUrl, payload, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.logger.log('Alert sent to Slack', { alertId: alert.id });
  }

  /**
   * Send alert via email
   */
  private async sendEmailAlert(alert: SystemAlert, config: any): Promise<void> {
    // Email integration would be implemented here
    // For now, just log that we would send an email
    this.logger.log('Email alert would be sent', {
      alertId: alert.id,
      recipients: config.recipients,
    });
  }

  /**
   * Get Slack color for severity
   */
  private getSeverityColor(severity: AlertSeverity): string {
    switch (severity) {
      case AlertSeverity.CRITICAL:
        return '#ff0000';
      case AlertSeverity.ERROR:
        return '#ff6600';
      case AlertSeverity.WARNING:
        return '#ffcc00';
      case AlertSeverity.INFO:
        return '#00ccff';
      default:
        return '#cccccc';
    }
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: string, userId: string): Promise<SystemAlert | null> {
    const alert = await this.alertRepository.findOne({ where: { id: alertId } });

    if (alert && !alert.acknowledged) {
      alert.acknowledged = true;
      alert.acknowledgedBy = userId;
      alert.acknowledgedAt = new Date();
      await this.alertRepository.save(alert);

      this.logger.log('Alert acknowledged', {
        alertId,
        userId,
      });

      return alert;
    }

    return null;
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(alertId: string): Promise<SystemAlert | null> {
    const alert = await this.alertRepository.findOne({ where: { id: alertId } });

    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.resolvedAt = new Date();
      await this.alertRepository.save(alert);

      this.logger.log('Alert resolved', { alertId });

      return alert;
    }

    return null;
  }

  /**
   * Get active alerts
   */
  async getActiveAlerts(): Promise<SystemAlert[]> {
    return await this.alertRepository.find({
      where: { resolved: false },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get alert statistics
   */
  async getAlertStats(): Promise<any> {
    const totalAlerts = await this.alertRepository.count();
    const activeAlerts = await this.alertRepository.count({ where: { resolved: false } });
    const acknowledgedAlerts = await this.alertRepository.count({ where: { acknowledged: true } });

    const criticalAlerts = await this.alertRepository.count({
      where: { severity: AlertSeverity.CRITICAL, resolved: false },
    });

    const highAlerts = await this.alertRepository.count({
      where: { severity: AlertSeverity.ERROR, resolved: false },
    });

    return {
      total: totalAlerts,
      active: activeAlerts,
      acknowledged: acknowledgedAlerts,
      critical: criticalAlerts,
      high: highAlerts,
      rules: {
        total: this.alertRules.size,
        enabled: Array.from(this.alertRules.values()).filter((r) => r.enabled).length,
      },
    };
  }
}
