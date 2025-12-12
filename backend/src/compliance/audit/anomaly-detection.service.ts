import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuditTrailService, AuditEntry, AuditAction, AuditCategory, AuditSeverity } from './audit-trail.service';

export enum AnomalyType {
  UNUSUAL_VOLUME = 'UNUSUAL_VOLUME',
  OFF_HOURS_ACCESS = 'OFF_HOURS_ACCESS',
  GEOGRAPHIC_ANOMALY = 'GEOGRAPHIC_ANOMALY',
  RAPID_SUCCESSION = 'RAPID_SUCCESSION',
  PRIVILEGE_ESCALATION = 'PRIVILEGE_ESCALATION',
  DATA_EXFILTRATION = 'DATA_EXFILTRATION',
  FAILED_LOGIN_SPIKE = 'FAILED_LOGIN_SPIKE',
  UNUSUAL_RESOURCE_ACCESS = 'UNUSUAL_RESOURCE_ACCESS',
  PERMISSION_CHANGE_SPIKE = 'PERMISSION_CHANGE_SPIKE',
  SUSPICIOUS_PATTERN = 'SUSPICIOUS_PATTERN',
}

export interface Anomaly {
  id: string;
  type: AnomalyType;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  detectedAt: Date;
  userId?: string;
  userName?: string;
  ipAddress?: string;
  description: string;
  details: Record<string, any>;
  relatedEvents: string[]; // Audit entry IDs
  riskScore: number;
  investigated: boolean;
  investigatedBy?: string;
  investigationNotes?: string;
  falsePositive: boolean;
  resolved: boolean;
  resolvedAt?: Date;
}

export interface UserBehaviorProfile {
  userId: string;
  typicalAccessTimes: number[]; // Hours of day (0-23)
  typicalActions: Map<AuditAction, number>;
  typicalResources: Map<string, number>;
  averageSessionDuration: number;
  typicalIPAddresses: Set<string>;
  lastUpdated: Date;
}

export interface AnomalyDetectionRule {
  id: string;
  name: string;
  type: AnomalyType;
  enabled: boolean;
  threshold: number;
  timeWindowMinutes: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
}

@Injectable()
export class AnomalyDetectionService {
  private readonly logger = new Logger(AnomalyDetectionService.name);
  private anomalies: Map<string, Anomaly> = new Map();
  private userProfiles: Map<string, UserBehaviorProfile> = new Map();
  private detectionRules: Map<string, AnomalyDetectionRule> = new Map();

  // Thresholds
  private readonly UNUSUAL_VOLUME_THRESHOLD = 100; // Actions per hour
  private readonly RAPID_SUCCESSION_THRESHOLD_MS = 1000; // 1 second
  private readonly RAPID_SUCCESSION_COUNT = 10;
  private readonly FAILED_LOGIN_THRESHOLD = 5;
  private readonly OFF_HOURS_START = 22; // 10 PM
  private readonly OFF_HOURS_END = 6; // 6 AM

  constructor(private readonly auditTrailService: AuditTrailService) {
    this.initializeDetectionRules();
  }

  /**
   * Initialize anomaly detection rules
   */
  private initializeDetectionRules(): void {
    const rules: AnomalyDetectionRule[] = [
      {
        id: 'rule-volume',
        name: 'Unusual Activity Volume',
        type: AnomalyType.UNUSUAL_VOLUME,
        enabled: true,
        threshold: 100,
        timeWindowMinutes: 60,
        severity: 'MEDIUM',
        description: 'Detects users performing unusually high volume of actions',
      },
      {
        id: 'rule-off-hours',
        name: 'Off-Hours Access',
        type: AnomalyType.OFF_HOURS_ACCESS,
        enabled: true,
        threshold: 1,
        timeWindowMinutes: 60,
        severity: 'LOW',
        description: 'Detects access during unusual hours (10 PM - 6 AM)',
      },
      {
        id: 'rule-failed-login',
        name: 'Failed Login Spike',
        type: AnomalyType.FAILED_LOGIN_SPIKE,
        enabled: true,
        threshold: 5,
        timeWindowMinutes: 15,
        severity: 'HIGH',
        description: 'Detects multiple failed login attempts',
      },
      {
        id: 'rule-rapid',
        name: 'Rapid Succession Actions',
        type: AnomalyType.RAPID_SUCCESSION,
        enabled: true,
        threshold: 10,
        timeWindowMinutes: 1,
        severity: 'MEDIUM',
        description: 'Detects automated or scripted activity',
      },
      {
        id: 'rule-export',
        name: 'Data Exfiltration',
        type: AnomalyType.DATA_EXFILTRATION,
        enabled: true,
        threshold: 10,
        timeWindowMinutes: 60,
        severity: 'CRITICAL',
        description: 'Detects excessive data export operations',
      },
      {
        id: 'rule-permission',
        name: 'Permission Change Spike',
        type: AnomalyType.PERMISSION_CHANGE_SPIKE,
        enabled: true,
        threshold: 5,
        timeWindowMinutes: 30,
        severity: 'HIGH',
        description: 'Detects unusual number of permission changes',
      },
    ];

    rules.forEach(rule => {
      this.detectionRules.set(rule.id, rule);
    });

    this.logger.log(`Initialized ${rules.length} anomaly detection rules`);
  }

  /**
   * Analyze audit entry for anomalies
   */
  async analyzeEntry(entry: AuditEntry): Promise<Anomaly[]> {
    const detectedAnomalies: Anomaly[] = [];

    // Check each enabled rule
    for (const rule of Array.from(this.detectionRules.values())) {
      if (!rule.enabled) continue;

      let anomaly: Anomaly | null = null;

      switch (rule.type) {
        case AnomalyType.OFF_HOURS_ACCESS:
          anomaly = await this.detectOffHoursAccess(entry);
          break;

        case AnomalyType.FAILED_LOGIN_SPIKE:
          if (entry.action === AuditAction.LOGIN && !entry.successful) {
            anomaly = await this.detectFailedLoginSpike(entry);
          }
          break;

        case AnomalyType.DATA_EXFILTRATION:
          if (entry.action === AuditAction.EXPORT || entry.action === AuditAction.DOWNLOAD) {
            anomaly = await this.detectDataExfiltration(entry);
          }
          break;

        case AnomalyType.PERMISSION_CHANGE_SPIKE:
          if (entry.action === AuditAction.PERMISSION_CHANGE) {
            anomaly = await this.detectPermissionChangeSpike(entry);
          }
          break;
      }

      if (anomaly) {
        this.anomalies.set(anomaly.id, anomaly);
        detectedAnomalies.push(anomaly);
        this.logger.warn(`Anomaly detected: ${anomaly.type} - ${anomaly.description}`);
      }
    }

    return detectedAnomalies;
  }

  /**
   * Detect off-hours access
   */
  private async detectOffHoursAccess(entry: AuditEntry): Promise<Anomaly | null> {
    const hour = entry.timestamp.getHours();

    if (hour >= this.OFF_HOURS_START || hour < this.OFF_HOURS_END) {
      return {
        id: `anom-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        type: AnomalyType.OFF_HOURS_ACCESS,
        severity: 'LOW',
        detectedAt: new Date(),
        userId: entry.userId,
        userName: entry.userName,
        ipAddress: entry.ipAddress,
        description: `Off-hours access detected at ${entry.timestamp.toLocaleTimeString()}`,
        details: {
          hour,
          action: entry.action,
          resourceType: entry.resourceType,
        },
        relatedEvents: [entry.id],
        riskScore: 30,
        investigated: false,
        falsePositive: false,
        resolved: false,
      };
    }

    return null;
  }

  /**
   * Detect failed login spike
   */
  private async detectFailedLoginSpike(entry: AuditEntry): Promise<Anomaly | null> {
    const windowStart = new Date(entry.timestamp.getTime() - 15 * 60 * 1000); // 15 minutes

    const recentFailedLogins = await this.auditTrailService.getAuditEntries({
      userId: entry.userId,
      action: AuditAction.LOGIN,
      successful: false,
      startDate: windowStart,
      endDate: entry.timestamp,
    });

    if (recentFailedLogins.entries.length >= this.FAILED_LOGIN_THRESHOLD) {
      return {
        id: `anom-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        type: AnomalyType.FAILED_LOGIN_SPIKE,
        severity: 'HIGH',
        detectedAt: new Date(),
        userId: entry.userId,
        userName: entry.userName,
        ipAddress: entry.ipAddress,
        description: `${recentFailedLogins.entries.length} failed login attempts in 15 minutes`,
        details: {
          failedAttempts: recentFailedLogins.entries.length,
          timeWindow: '15 minutes',
        },
        relatedEvents: recentFailedLogins.entries.map(e => e.id),
        riskScore: 80,
        investigated: false,
        falsePositive: false,
        resolved: false,
      };
    }

    return null;
  }

  /**
   * Detect data exfiltration
   */
  private async detectDataExfiltration(entry: AuditEntry): Promise<Anomaly | null> {
    const windowStart = new Date(entry.timestamp.getTime() - 60 * 60 * 1000); // 1 hour

    const recentExports = await this.auditTrailService.getAuditEntries({
      userId: entry.userId,
      action: AuditAction.EXPORT,
      startDate: windowStart,
      endDate: entry.timestamp,
    });

    const downloads = await this.auditTrailService.getAuditEntries({
      userId: entry.userId,
      action: AuditAction.DOWNLOAD,
      startDate: windowStart,
      endDate: entry.timestamp,
    });

    const totalDataOperations = recentExports.entries.length + downloads.entries.length;

    if (totalDataOperations >= 10) {
      return {
        id: `anom-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        type: AnomalyType.DATA_EXFILTRATION,
        severity: 'CRITICAL',
        detectedAt: new Date(),
        userId: entry.userId,
        userName: entry.userName,
        ipAddress: entry.ipAddress,
        description: `Potential data exfiltration: ${totalDataOperations} export/download operations in 1 hour`,
        details: {
          exports: recentExports.entries.length,
          downloads: downloads.entries.length,
          total: totalDataOperations,
        },
        relatedEvents: [
          ...recentExports.entries.map(e => e.id),
          ...downloads.entries.map(e => e.id),
        ],
        riskScore: 95,
        investigated: false,
        falsePositive: false,
        resolved: false,
      };
    }

    return null;
  }

  /**
   * Detect permission change spike
   */
  private async detectPermissionChangeSpike(entry: AuditEntry): Promise<Anomaly | null> {
    const windowStart = new Date(entry.timestamp.getTime() - 30 * 60 * 1000); // 30 minutes

    const recentPermissionChanges = await this.auditTrailService.getAuditEntries({
      userId: entry.userId,
      action: AuditAction.PERMISSION_CHANGE,
      startDate: windowStart,
      endDate: entry.timestamp,
    });

    if (recentPermissionChanges.entries.length >= 5) {
      return {
        id: `anom-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        type: AnomalyType.PERMISSION_CHANGE_SPIKE,
        severity: 'HIGH',
        detectedAt: new Date(),
        userId: entry.userId,
        userName: entry.userName,
        ipAddress: entry.ipAddress,
        description: `${recentPermissionChanges.entries.length} permission changes in 30 minutes`,
        details: {
          permissionChanges: recentPermissionChanges.entries.length,
          timeWindow: '30 minutes',
        },
        relatedEvents: recentPermissionChanges.entries.map(e => e.id),
        riskScore: 75,
        investigated: false,
        falsePositive: false,
        resolved: false,
      };
    }

    return null;
  }

  /**
   * Scheduled anomaly detection scan
   */
  @Cron(CronExpression.EVERY_HOUR)
  async scheduledAnomalyDetection(): Promise<void> {
    this.logger.log('Running scheduled anomaly detection...');

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const now = new Date();

    // Detect unusual volume
    await this.detectUnusualVolume(oneHourAgo, now);

    // Detect rapid succession
    await this.detectRapidSuccession(oneHourAgo, now);

    // Update user behavior profiles
    await this.updateUserProfiles(oneHourAgo, now);

    this.logger.log('Scheduled anomaly detection completed');
  }

  /**
   * Detect unusual volume of activity
   */
  private async detectUnusualVolume(startDate: Date, endDate: Date): Promise<void> {
    const { entries } = await this.auditTrailService.getAuditEntries({
      startDate,
      endDate,
      limit: 100000,
    });

    // Group by user
    const userActivity = new Map<string, AuditEntry[]>();
    entries.forEach(entry => {
      const userEntries = userActivity.get(entry.userId) || [];
      userEntries.push(entry);
      userActivity.set(entry.userId, userEntries);
    });

    // Check each user's activity
    for (const [userId, userEntries] of userActivity.entries()) {
      if (userEntries.length > this.UNUSUAL_VOLUME_THRESHOLD) {
        const anomaly: Anomaly = {
          id: `anom-${Date.now()}-${userId}`,
          type: AnomalyType.UNUSUAL_VOLUME,
          severity: 'MEDIUM',
          detectedAt: new Date(),
          userId,
          userName: userEntries[0].userName,
          description: `Unusual activity volume: ${userEntries.length} actions in 1 hour (threshold: ${this.UNUSUAL_VOLUME_THRESHOLD})`,
          details: {
            actionCount: userEntries.length,
            threshold: this.UNUSUAL_VOLUME_THRESHOLD,
          },
          relatedEvents: userEntries.map(e => e.id),
          riskScore: 60,
          investigated: false,
          falsePositive: false,
          resolved: false,
        };

        this.anomalies.set(anomaly.id, anomaly);
        this.logger.warn(`Unusual volume detected for user ${userId}: ${userEntries.length} actions`);
      }
    }
  }

  /**
   * Detect rapid succession of actions
   */
  private async detectRapidSuccession(startDate: Date, endDate: Date): Promise<void> {
    const { entries } = await this.auditTrailService.getAuditEntries({
      startDate,
      endDate,
      limit: 100000,
    });

    // Group by user
    const userActivity = new Map<string, AuditEntry[]>();
    entries.forEach(entry => {
      const userEntries = userActivity.get(entry.userId) || [];
      userEntries.push(entry);
      userActivity.set(entry.userId, userEntries);
    });

    // Check for rapid succession
    for (const [userId, userEntries] of userActivity.entries()) {
      const sorted = userEntries.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      for (let i = 0; i < sorted.length - this.RAPID_SUCCESSION_COUNT; i++) {
        const windowEntries = sorted.slice(i, i + this.RAPID_SUCCESSION_COUNT);
        const timeDiff =
          windowEntries[windowEntries.length - 1].timestamp.getTime() -
          windowEntries[0].timestamp.getTime();

        if (timeDiff < this.RAPID_SUCCESSION_THRESHOLD_MS * this.RAPID_SUCCESSION_COUNT) {
          const anomaly: Anomaly = {
            id: `anom-${Date.now()}-${userId}-rapid`,
            type: AnomalyType.RAPID_SUCCESSION,
            severity: 'MEDIUM',
            detectedAt: new Date(),
            userId,
            userName: windowEntries[0].userName,
            description: `${this.RAPID_SUCCESSION_COUNT} actions in ${timeDiff}ms - possible automated activity`,
            details: {
              actionCount: this.RAPID_SUCCESSION_COUNT,
              timeDiffMs: timeDiff,
            },
            relatedEvents: windowEntries.map(e => e.id),
            riskScore: 65,
            investigated: false,
            falsePositive: false,
            resolved: false,
          };

          this.anomalies.set(anomaly.id, anomaly);
          this.logger.warn(`Rapid succession detected for user ${userId}`);
          break; // Only report once per user
        }
      }
    }
  }

  /**
   * Update user behavior profiles
   */
  private async updateUserProfiles(startDate: Date, endDate: Date): Promise<void> {
    const { entries } = await this.auditTrailService.getAuditEntries({
      startDate,
      endDate,
      limit: 100000,
    });

    // Group by user
    const userActivity = new Map<string, AuditEntry[]>();
    entries.forEach(entry => {
      const userEntries = userActivity.get(entry.userId) || [];
      userEntries.push(entry);
      userActivity.set(entry.userId, userEntries);
    });

    // Update profiles
    for (const [userId, userEntries] of userActivity.entries()) {
      const profile = this.userProfiles.get(userId) || {
        userId,
        typicalAccessTimes: new Array(24).fill(0),
        typicalActions: new Map(),
        typicalResources: new Map(),
        averageSessionDuration: 0,
        typicalIPAddresses: new Set(),
        lastUpdated: new Date(),
      };

      userEntries.forEach(entry => {
        const hour = entry.timestamp.getHours();
        profile.typicalAccessTimes[hour]++;

        profile.typicalActions.set(
          entry.action,
          (profile.typicalActions.get(entry.action) || 0) + 1,
        );

        const resourceKey = `${entry.resourceType}:${entry.resourceId}`;
        profile.typicalResources.set(
          resourceKey,
          (profile.typicalResources.get(resourceKey) || 0) + 1,
        );

        profile.typicalIPAddresses.add(entry.ipAddress);
      });

      profile.lastUpdated = new Date();
      this.userProfiles.set(userId, profile);
    }
  }

  /**
   * Get all anomalies
   */
  async getAnomalies(filters?: {
    type?: AnomalyType;
    severity?: string;
    userId?: string;
    investigated?: boolean;
    resolved?: boolean;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Anomaly[]> {
    let anomalies = Array.from(this.anomalies.values());

    if (filters?.type) {
      anomalies = anomalies.filter(a => a.type === filters.type);
    }

    if (filters?.severity) {
      anomalies = anomalies.filter(a => a.severity === filters.severity);
    }

    if (filters?.userId) {
      anomalies = anomalies.filter(a => a.userId === filters.userId);
    }

    if (filters?.investigated !== undefined) {
      anomalies = anomalies.filter(a => a.investigated === filters.investigated);
    }

    if (filters?.resolved !== undefined) {
      anomalies = anomalies.filter(a => a.resolved === filters.resolved);
    }

    if (filters?.startDate) {
      anomalies = anomalies.filter(a => a.detectedAt >= filters.startDate!);
    }

    if (filters?.endDate) {
      anomalies = anomalies.filter(a => a.detectedAt <= filters.endDate!);
    }

    return anomalies.sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime());
  }

  /**
   * Mark anomaly as investigated
   */
  async investigateAnomaly(
    anomalyId: string,
    investigatedBy: string,
    notes: string,
    falsePositive: boolean = false,
  ): Promise<void> {
    const anomaly = this.anomalies.get(anomalyId);
    if (anomaly) {
      anomaly.investigated = true;
      anomaly.investigatedBy = investigatedBy;
      anomaly.investigationNotes = notes;
      anomaly.falsePositive = falsePositive;

      if (falsePositive) {
        anomaly.resolved = true;
        anomaly.resolvedAt = new Date();
      }

      this.anomalies.set(anomalyId, anomaly);
      this.logger.log(`Anomaly ${anomalyId} investigated by ${investigatedBy}`);
    }
  }

  /**
   * Resolve anomaly
   */
  async resolveAnomaly(anomalyId: string): Promise<void> {
    const anomaly = this.anomalies.get(anomalyId);
    if (anomaly) {
      anomaly.resolved = true;
      anomaly.resolvedAt = new Date();
      this.anomalies.set(anomalyId, anomaly);
      this.logger.log(`Anomaly ${anomalyId} resolved`);
    }
  }

  /**
   * Get anomaly statistics
   */
  async getAnomalyStatistics(startDate: Date, endDate: Date): Promise<{
    total: number;
    byType: Record<AnomalyType, number>;
    bySeverity: Record<string, number>;
    investigated: number;
    resolved: number;
    falsePositives: number;
    averageRiskScore: number;
  }> {
    const anomalies = await this.getAnomalies({ startDate, endDate });

    const byType: Record<AnomalyType, number> = {} as any;
    Object.values(AnomalyType).forEach(type => {
      byType[type] = 0;
    });

    const bySeverity: Record<string, number> = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      CRITICAL: 0,
    };

    anomalies.forEach(anomaly => {
      byType[anomaly.type]++;
      bySeverity[anomaly.severity]++;
    });

    const investigated = anomalies.filter(a => a.investigated).length;
    const resolved = anomalies.filter(a => a.resolved).length;
    const falsePositives = anomalies.filter(a => a.falsePositive).length;

    const averageRiskScore =
      anomalies.length > 0
        ? anomalies.reduce((sum, a) => sum + a.riskScore, 0) / anomalies.length
        : 0;

    return {
      total: anomalies.length,
      byType,
      bySeverity,
      investigated,
      resolved,
      falsePositives,
      averageRiskScore: Math.round(averageRiskScore),
    };
  }

  /**
   * Get user behavior profile
   */
  async getUserProfile(userId: string): Promise<UserBehaviorProfile | null> {
    return this.userProfiles.get(userId) || null;
  }
}
