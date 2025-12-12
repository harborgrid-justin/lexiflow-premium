import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

export enum BarStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  DISBARRED = 'DISBARRED',
  RETIRED = 'RETIRED',
}

export interface BarAdmission {
  id: string;
  attorneyId: string;
  jurisdiction: string; // State or federal court
  barNumber: string;
  admissionDate: Date;
  status: BarStatus;
  expirationDate?: Date;
  renewalDate?: Date;
  goodStandingSince: Date;
  lastVerified: Date;
  autoVerify: boolean;
  verificationSource?: string;
}

export interface BarRequirement {
  id: string;
  jurisdiction: string;
  requirementType: 'CLE' | 'DUES' | 'CERTIFICATION' | 'ETHICS' | 'PRO_BONO';
  name: string;
  description: string;
  frequency: 'ANNUAL' | 'BIENNIAL' | 'TRIENNIAL';
  requiredHours?: number;
  dueDate?: Date;
  completed: boolean;
  completionDate?: Date;
  documentation?: string[];
}

export interface ComplianceAlert {
  id: string;
  attorneyId: string;
  type: 'RENEWAL_DUE' | 'CLE_DEFICIENCY' | 'DUES_UNPAID' | 'STATUS_CHANGE' | 'VERIFICATION_FAILED';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  message: string;
  dueDate?: Date;
  jurisdiction?: string;
  acknowledged: boolean;
  acknowledgedAt?: Date;
  createdAt: Date;
}

export interface JurisdictionRules {
  jurisdiction: string;
  cleRequirements: {
    hoursPerYear: number;
    ethicsHours: number;
    proBonoHours?: number;
  };
  renewalPeriod: 'ANNUAL' | 'BIENNIAL' | 'TRIENNIAL';
  duesAmount?: number;
  specialRules?: string[];
}

@Injectable()
export class BarComplianceService {
  private readonly logger = new Logger(BarComplianceService.name);
  private barAdmissions: Map<string, BarAdmission[]> = new Map(); // attorneyId -> admissions
  private requirements: Map<string, BarRequirement[]> = new Map(); // attorneyId -> requirements
  private alerts: Map<string, ComplianceAlert[]> = new Map(); // attorneyId -> alerts
  private jurisdictionRules: Map<string, JurisdictionRules> = new Map();

  constructor() {
    this.initializeJurisdictionRules();
  }

  /**
   * Initialize jurisdiction-specific rules
   */
  private initializeJurisdictionRules(): void {
    const rules: JurisdictionRules[] = [
      {
        jurisdiction: 'CA',
        cleRequirements: {
          hoursPerYear: 25,
          ethicsHours: 4,
          proBonoHours: 25,
        },
        renewalPeriod: 'ANNUAL',
        duesAmount: 390,
        specialRules: ['Mandatory fee arbitration participation', 'Client trust account compliance'],
      },
      {
        jurisdiction: 'NY',
        cleRequirements: {
          hoursPerYear: 24,
          ethicsHours: 4,
        },
        renewalPeriod: 'BIENNIAL',
        duesAmount: 375,
        specialRules: ['Pro bono reporting required', 'Diversity training required'],
      },
      {
        jurisdiction: 'TX',
        cleRequirements: {
          hoursPerYear: 15,
          ethicsHours: 3,
        },
        renewalPeriod: 'ANNUAL',
        duesAmount: 235,
        specialRules: ['Minimum CLE hours', 'Ethics examination for new admittees'],
      },
      {
        jurisdiction: 'FL',
        cleRequirements: {
          hoursPerYear: 30,
          ethicsHours: 5,
        },
        renewalPeriod: 'TRIENNIAL',
        duesAmount: 265,
        specialRules: ['Technology training required', 'Mental health awareness'],
      },
      {
        jurisdiction: 'IL',
        cleRequirements: {
          hoursPerYear: 30,
          ethicsHours: 6,
        },
        renewalPeriod: 'ANNUAL',
        duesAmount: 580,
        specialRules: ['Professional responsibility credit required'],
      },
    ];

    rules.forEach(rule => {
      this.jurisdictionRules.set(rule.jurisdiction, rule);
    });

    this.logger.log(`Initialized rules for ${rules.length} jurisdictions`);
  }

  /**
   * Add bar admission for attorney
   */
  async addBarAdmission(
    attorneyId: string,
    jurisdiction: string,
    barNumber: string,
    admissionDate: Date,
  ): Promise<BarAdmission> {
    const admission: BarAdmission = {
      id: `bar-${Date.now()}`,
      attorneyId,
      jurisdiction,
      barNumber,
      admissionDate,
      status: BarStatus.ACTIVE,
      goodStandingSince: admissionDate,
      lastVerified: new Date(),
      autoVerify: true,
    };

    // Calculate renewal date based on jurisdiction rules
    const rules = this.jurisdictionRules.get(jurisdiction);
    if (rules) {
      admission.renewalDate = this.calculateRenewalDate(admissionDate, rules.renewalPeriod);
    }

    const admissions = this.barAdmissions.get(attorneyId) || [];
    admissions.push(admission);
    this.barAdmissions.set(attorneyId, admissions);

    // Generate requirements for this jurisdiction
    await this.generateRequirements(attorneyId, jurisdiction);

    this.logger.log(
      `Added bar admission for attorney ${attorneyId} in ${jurisdiction} (${barNumber})`,
    );

    return admission;
  }

  /**
   * Calculate renewal date based on period
   */
  private calculateRenewalDate(admissionDate: Date, period: string): Date {
    const renewalDate = new Date(admissionDate);

    switch (period) {
      case 'ANNUAL':
        renewalDate.setFullYear(renewalDate.getFullYear() + 1);
        break;
      case 'BIENNIAL':
        renewalDate.setFullYear(renewalDate.getFullYear() + 2);
        break;
      case 'TRIENNIAL':
        renewalDate.setFullYear(renewalDate.getFullYear() + 3);
        break;
    }

    return renewalDate;
  }

  /**
   * Generate requirements for jurisdiction
   */
  private async generateRequirements(
    attorneyId: string,
    jurisdiction: string,
  ): Promise<void> {
    const rules = this.jurisdictionRules.get(jurisdiction);
    if (!rules) return;

    const requirements: BarRequirement[] = [];
    const now = new Date();
    const yearEnd = new Date(now.getFullYear(), 11, 31); // December 31

    // CLE requirement
    requirements.push({
      id: `req-${Date.now()}-cle`,
      jurisdiction,
      requirementType: 'CLE',
      name: 'Continuing Legal Education',
      description: `Complete ${rules.cleRequirements.hoursPerYear} CLE hours including ${rules.cleRequirements.ethicsHours} ethics hours`,
      frequency: rules.renewalPeriod,
      requiredHours: rules.cleRequirements.hoursPerYear,
      dueDate: yearEnd,
      completed: false,
    });

    // Ethics requirement
    requirements.push({
      id: `req-${Date.now()}-ethics`,
      jurisdiction,
      requirementType: 'ETHICS',
      name: 'Ethics Training',
      description: `Complete ${rules.cleRequirements.ethicsHours} ethics hours`,
      frequency: rules.renewalPeriod,
      requiredHours: rules.cleRequirements.ethicsHours,
      dueDate: yearEnd,
      completed: false,
    });

    // Annual dues
    requirements.push({
      id: `req-${Date.now()}-dues`,
      jurisdiction,
      requirementType: 'DUES',
      name: 'Annual Bar Dues',
      description: `Pay annual bar dues: $${rules.duesAmount}`,
      frequency: 'ANNUAL',
      dueDate: yearEnd,
      completed: false,
    });

    // Pro bono (if applicable)
    if (rules.cleRequirements.proBonoHours) {
      requirements.push({
        id: `req-${Date.now()}-probono`,
        jurisdiction,
        requirementType: 'PRO_BONO',
        name: 'Pro Bono Service',
        description: `Complete ${rules.cleRequirements.proBonoHours} pro bono hours or report`,
        frequency: 'ANNUAL',
        requiredHours: rules.cleRequirements.proBonoHours,
        dueDate: yearEnd,
        completed: false,
      });
    }

    const existingReqs = this.requirements.get(attorneyId) || [];
    this.requirements.set(attorneyId, [...existingReqs, ...requirements]);
  }

  /**
   * Verify bar status (would integrate with state bar APIs)
   */
  async verifyBarStatus(admissionId: string): Promise<boolean> {
    // In production, integrate with state bar APIs
    // For now, simulate verification

    for (const [attorneyId, admissions] of this.barAdmissions.entries()) {
      const admission = admissions.find(a => a.id === admissionId);
      if (admission) {
        admission.lastVerified = new Date();
        admission.verificationSource = 'State Bar API (simulated)';
        this.barAdmissions.set(attorneyId, admissions);

        this.logger.log(
          `Verified bar status for ${admission.jurisdiction} bar #${admission.barNumber}`,
        );
        return true;
      }
    }

    return false;
  }

  /**
   * Check compliance status for attorney
   */
  async checkComplianceStatus(attorneyId: string): Promise<{
    compliant: boolean;
    issues: string[];
    upcomingDeadlines: Array<{ requirement: string; dueDate: Date }>;
  }> {
    const admissions = this.barAdmissions.get(attorneyId) || [];
    const requirements = this.requirements.get(attorneyId) || [];

    const issues: string[] = [];
    const upcomingDeadlines: Array<{ requirement: string; dueDate: Date }> = [];

    // Check bar status
    for (const admission of admissions) {
      if (admission.status !== BarStatus.ACTIVE) {
        issues.push(`${admission.jurisdiction} bar status is ${admission.status}`);
      }

      if (admission.renewalDate && admission.renewalDate < new Date()) {
        issues.push(`${admission.jurisdiction} bar license renewal is overdue`);
      }

      // Check verification
      const daysSinceVerification =
        (Date.now() - admission.lastVerified.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceVerification > 90) {
        issues.push(`${admission.jurisdiction} bar status not verified in ${Math.floor(daysSinceVerification)} days`);
      }
    }

    // Check requirements
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    for (const req of requirements) {
      if (!req.completed && req.dueDate) {
        if (req.dueDate < now) {
          issues.push(`${req.name} (${req.jurisdiction}) is overdue`);
        } else if (req.dueDate < thirtyDaysFromNow) {
          upcomingDeadlines.push({
            requirement: `${req.name} (${req.jurisdiction})`,
            dueDate: req.dueDate,
          });
        }
      }
    }

    return {
      compliant: issues.length === 0,
      issues,
      upcomingDeadlines,
    };
  }

  /**
   * Create compliance alert
   */
  async createAlert(
    attorneyId: string,
    type: ComplianceAlert['type'],
    severity: ComplianceAlert['severity'],
    message: string,
    dueDate?: Date,
    jurisdiction?: string,
  ): Promise<ComplianceAlert> {
    const alert: ComplianceAlert = {
      id: `alert-${Date.now()}`,
      attorneyId,
      type,
      severity,
      message,
      dueDate,
      jurisdiction,
      acknowledged: false,
      createdAt: new Date(),
    };

    const alerts = this.alerts.get(attorneyId) || [];
    alerts.push(alert);
    this.alerts.set(attorneyId, alerts);

    this.logger.warn(`Compliance alert created for ${attorneyId}: ${message}`);

    return alert;
  }

  /**
   * Check for compliance issues and create alerts
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkAllCompliance(): Promise<void> {
    this.logger.log('Running daily compliance check...');

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    for (const [attorneyId, admissions] of this.barAdmissions.entries()) {
      // Check renewals
      for (const admission of admissions) {
        if (admission.renewalDate) {
          if (admission.renewalDate < now) {
            await this.createAlert(
              attorneyId,
              'RENEWAL_DUE',
              'CRITICAL',
              `${admission.jurisdiction} bar license renewal is overdue`,
              admission.renewalDate,
              admission.jurisdiction,
            );
          } else if (admission.renewalDate < thirtyDaysFromNow) {
            await this.createAlert(
              attorneyId,
              'RENEWAL_DUE',
              'WARNING',
              `${admission.jurisdiction} bar license renewal due in ${Math.ceil((admission.renewalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} days`,
              admission.renewalDate,
              admission.jurisdiction,
            );
          }
        }

        // Check verification status
        const daysSinceVerification =
          (now.getTime() - admission.lastVerified.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceVerification > 90) {
          await this.createAlert(
            attorneyId,
            'VERIFICATION_FAILED',
            'WARNING',
            `${admission.jurisdiction} bar status not verified in ${Math.floor(daysSinceVerification)} days`,
            undefined,
            admission.jurisdiction,
          );
        }
      }

      // Check requirements
      const requirements = this.requirements.get(attorneyId) || [];
      for (const req of requirements) {
        if (!req.completed && req.dueDate) {
          if (req.dueDate < now) {
            await this.createAlert(
              attorneyId,
              'CLE_DEFICIENCY',
              'CRITICAL',
              `${req.name} (${req.jurisdiction}) is overdue`,
              req.dueDate,
              req.jurisdiction,
            );
          } else if (req.dueDate < thirtyDaysFromNow) {
            await this.createAlert(
              attorneyId,
              'CLE_DEFICIENCY',
              'WARNING',
              `${req.name} (${req.jurisdiction}) due in ${Math.ceil((req.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} days`,
              req.dueDate,
              req.jurisdiction,
            );
          }
        }
      }
    }

    this.logger.log('Daily compliance check completed');
  }

  /**
   * Get admissions for attorney
   */
  async getBarAdmissions(attorneyId: string): Promise<BarAdmission[]> {
    return this.barAdmissions.get(attorneyId) || [];
  }

  /**
   * Get requirements for attorney
   */
  async getRequirements(attorneyId: string, jurisdiction?: string): Promise<BarRequirement[]> {
    const requirements = this.requirements.get(attorneyId) || [];

    if (jurisdiction) {
      return requirements.filter(r => r.jurisdiction === jurisdiction);
    }

    return requirements;
  }

  /**
   * Get alerts for attorney
   */
  async getAlerts(attorneyId: string, acknowledgedOnly: boolean = false): Promise<ComplianceAlert[]> {
    const alerts = this.alerts.get(attorneyId) || [];

    if (acknowledgedOnly) {
      return alerts.filter(a => !a.acknowledged);
    }

    return alerts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(alertId: string): Promise<void> {
    for (const [attorneyId, alerts] of this.alerts.entries()) {
      const alert = alerts.find(a => a.id === alertId);
      if (alert) {
        alert.acknowledged = true;
        alert.acknowledgedAt = new Date();
        this.alerts.set(attorneyId, alerts);
        this.logger.log(`Alert ${alertId} acknowledged`);
        return;
      }
    }
  }

  /**
   * Complete requirement
   */
  async completeRequirement(
    requirementId: string,
    completionDate: Date,
    documentation?: string[],
  ): Promise<void> {
    for (const [attorneyId, requirements] of this.requirements.entries()) {
      const req = requirements.find(r => r.id === requirementId);
      if (req) {
        req.completed = true;
        req.completionDate = completionDate;
        req.documentation = documentation;
        this.requirements.set(attorneyId, requirements);
        this.logger.log(`Requirement ${req.name} completed for attorney ${attorneyId}`);
        return;
      }
    }
  }

  /**
   * Get jurisdiction rules
   */
  async getJurisdictionRules(jurisdiction: string): Promise<JurisdictionRules | null> {
    return this.jurisdictionRules.get(jurisdiction) || null;
  }

  /**
   * Get all supported jurisdictions
   */
  async getSupportedJurisdictions(): Promise<string[]> {
    return Array.from(this.jurisdictionRules.keys());
  }
}
