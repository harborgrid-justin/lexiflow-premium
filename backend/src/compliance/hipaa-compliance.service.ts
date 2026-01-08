import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComplianceControl, ComplianceFramework, ControlStatus } from './entities/compliance-control.entity';
import { AuditLog } from './entities/audit-log.entity';
import { SecurityIncident } from './entities/security-incident.entity';

export interface HIPAAComplianceStatus {
  overallCompliance: number;
  safeguards: {
    administrative: HIPAASafeguardStatus;
    physical: HIPAASafeguardStatus;
    technical: HIPAASafeguardStatus;
  };
  breachNotifications: number;
  riskAssessments: {
    lastAssessmentDate: Date | null;
    nextAssessmentDue: Date | null;
    highRisks: number;
  };
  baaTracking: {
    total: number;
    active: number;
    expiringSoon: number;
  };
  auditReadiness: number;
}

export interface HIPAASafeguardStatus {
  name: string;
  totalControls: number;
  compliantControls: number;
  compliancePercentage: number;
  criticalIssues: number;
  requiresAttention: string[];
}

export interface PHIAccessLog {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: string;
  phiType: string;
  patientId?: string;
  purpose: string;
  ipAddress: string;
  authorized: boolean;
}

export interface BreachNotificationReport {
  incidentId: string;
  discoveryDate: Date;
  breachType: string;
  individualsAffected: number;
  phiCompromised: string[];
  notificationStatus: {
    individualNotified: boolean;
    hssNotified: boolean;
    mediaNotified: boolean;
  };
  mitigationActions: string[];
}

@Injectable()
export class HIPAAComplianceService {
  private readonly logger = new Logger(HIPAAComplianceService.name);

  constructor(
    @InjectRepository(ComplianceControl)
    private readonly complianceControlRepository: Repository<ComplianceControl>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    @InjectRepository(SecurityIncident)
    private readonly securityIncidentRepository: Repository<SecurityIncident>,
  ) {}

  /**
   * Get comprehensive HIPAA compliance status
   */
  async getHIPAAComplianceStatus(): Promise<HIPAAComplianceStatus> {
    this.logger.log('Generating HIPAA compliance status report');

    const [administrative, physical, technical] = await Promise.all([
      this.getSafeguardStatus('Administrative Safeguards'),
      this.getSafeguardStatus('Physical Safeguards'),
      this.getSafeguardStatus('Technical Safeguards'),
    ]);

    const allControls = await this.complianceControlRepository.find({
      where: { framework: ComplianceFramework.HIPAA },
    });

    const compliantCount = allControls.filter(c => c.status === ControlStatus.COMPLIANT).length;
    const overallCompliance = allControls.length > 0 ? (compliantCount / allControls.length) * 100 : 0;

    // Count security incidents that could be HIPAA breaches
    const breachIncidents = await this.securityIncidentRepository.count({
      where: {
        category: 'data_breach',
        complianceFrameworks: ['HIPAA'] as any,
      },
    });

    const auditReadiness = this.calculateAuditReadiness(allControls);

    return {
      overallCompliance: Math.round(overallCompliance),
      safeguards: {
        administrative,
        physical,
        technical,
      },
      breachNotifications: breachIncidents,
      riskAssessments: {
        lastAssessmentDate: null, // TODO: Track from actual assessments
        nextAssessmentDue: null,
        highRisks: 0,
      },
      baaTracking: {
        total: 0, // TODO: Implement BAA tracking
        active: 0,
        expiringSoon: 0,
      },
      auditReadiness,
    };
  }

  /**
   * Get status of a specific safeguard category
   */
  private async getSafeguardStatus(category: string): Promise<HIPAASafeguardStatus> {
    const controls = await this.complianceControlRepository.find({
      where: {
        framework: ComplianceFramework.HIPAA,
        category,
      },
    });

    const totalControls = controls.length;
    const compliantControls = controls.filter(c => c.status === ControlStatus.COMPLIANT).length;
    const compliancePercentage = totalControls > 0 ? (compliantControls / totalControls) * 100 : 0;
    const criticalIssues = controls.filter(
      c => c.status !== ControlStatus.COMPLIANT && c.severity === 'critical'
    ).length;

    const requiresAttention = controls
      .filter(
        c =>
          c.status === ControlStatus.NON_COMPLIANT ||
          (c.status === ControlStatus.NEEDS_REVIEW && c.severity === 'critical')
      )
      .map(c => c.name);

    return {
      name: category,
      totalControls,
      compliantControls,
      compliancePercentage: Math.round(compliancePercentage),
      criticalIssues,
      requiresAttention,
    };
  }

  /**
   * Calculate audit readiness score
   */
  private calculateAuditReadiness(controls: ComplianceControl[]): number {
    if (controls.length === 0) return 0;

    let score = 0;
    const weights = {
      compliant: 10,
      in_progress: 5,
      needs_review: 3,
      non_compliant: 0,
      not_applicable: 10,
    };

    controls.forEach(control => {
      const weight = weights[control.status] || 0;
      const severityMultiplier = control.severity === 'critical' ? 2 : 1;
      score += weight * severityMultiplier;
    });

    const maxScore = controls.reduce((sum, control) => {
      const severityMultiplier = control.severity === 'critical' ? 2 : 1;
      return sum + 10 * severityMultiplier;
    }, 0);

    return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  }

  /**
   * Log PHI access for HIPAA compliance
   */
  async logPHIAccess(data: {
    userId: string;
    userName: string;
    action: string;
    phiType: string;
    patientId?: string;
    purpose: string;
    ipAddress: string;
    authorized: boolean;
  }): Promise<void> {
    this.logger.log(`Logging PHI access: ${data.action} by ${data.userName}`);

    await this.auditLogRepository.save(
      this.auditLogRepository.create({
        userId: data.userId,
        userName: data.userName,
        action: data.action,
        entityType: 'phi_record',
        entityId: data.patientId,
        ipAddress: data.ipAddress,
        description: `PHI ${data.action}: ${data.phiType}`,
        result: data.authorized ? 'success' : 'failure',
        metadata: {
          phiType: data.phiType,
          purpose: data.purpose,
          authorized: data.authorized,
        },
        complianceFramework: ['HIPAA'],
        isSensitive: true,
        requiresReview: !data.authorized,
      })
    );

    // Flag unauthorized access
    if (!data.authorized) {
      this.logger.warn(`Unauthorized PHI access attempt by ${data.userName}`);
      // TODO: Trigger security alert
    }
  }

  /**
   * Get PHI access audit trail
   */
  async getPHIAccessLogs(
    startDate: Date,
    endDate: Date,
    userId?: string,
    patientId?: string
  ): Promise<PHIAccessLog[]> {
    const queryBuilder = this.auditLogRepository
      .createQueryBuilder('log')
      .where('log.entityType = :entityType', { entityType: 'phi_record' })
      .andWhere('log.timestamp >= :startDate', { startDate })
      .andWhere('log.timestamp <= :endDate', { endDate })
      .orderBy('log.timestamp', 'DESC');

    if (userId) {
      queryBuilder.andWhere('log.userId = :userId', { userId });
    }

    if (patientId) {
      queryBuilder.andWhere('log.entityId = :patientId', { patientId });
    }

    const logs = await queryBuilder.getMany();

    return logs.map(log => ({
      id: log.id,
      timestamp: log.timestamp,
      userId: log.userId,
      userName: log.userName,
      action: log.action,
      phiType: (log.metadata as any)?.phiType || 'unknown',
      patientId: log.entityId,
      purpose: (log.metadata as any)?.purpose || 'not specified',
      ipAddress: log.ipAddress,
      authorized: log.result === 'success',
    }));
  }

  /**
   * Initialize HIPAA compliance controls
   */
  async initializeHIPAAControls(): Promise<number> {
    this.logger.log('Initializing HIPAA compliance controls');

    const controls = this.getHIPAAControls();
    let created = 0;

    for (const controlData of controls) {
      const exists = await this.complianceControlRepository.findOne({
        where: {
          framework: ComplianceFramework.HIPAA,
          controlId: controlData.controlId,
        },
      });

      if (!exists) {
        await this.complianceControlRepository.save(
          this.complianceControlRepository.create(controlData)
        );
        created++;
      }
    }

    this.logger.log(`Initialized ${created} HIPAA controls`);
    return created;
  }

  /**
   * Get default HIPAA controls
   */
  private getHIPAAControls(): Partial<ComplianceControl>[] {
    return [
      // Administrative Safeguards
      {
        framework: ComplianceFramework.HIPAA,
        controlId: 'ADMIN-1',
        name: 'Security Management Process',
        description: 'Implement policies and procedures to prevent, detect, contain, and correct security violations.',
        category: 'Administrative Safeguards',
        status: ControlStatus.NEEDS_REVIEW,
        severity: 'critical',
        isMandatory: true,
        reviewFrequencyDays: 180,
      },
      {
        framework: ComplianceFramework.HIPAA,
        controlId: 'ADMIN-2',
        name: 'Assigned Security Responsibility',
        description: 'Identify the security official who is responsible for the development and implementation of security policies and procedures.',
        category: 'Administrative Safeguards',
        status: ControlStatus.NEEDS_REVIEW,
        severity: 'critical',
        isMandatory: true,
        reviewFrequencyDays: 180,
      },
      {
        framework: ComplianceFramework.HIPAA,
        controlId: 'ADMIN-3',
        name: 'Workforce Security',
        description: 'Implement policies and procedures to ensure that all workforce members have appropriate access to ePHI.',
        category: 'Administrative Safeguards',
        status: ControlStatus.NEEDS_REVIEW,
        severity: 'high',
        isMandatory: true,
        reviewFrequencyDays: 180,
      },
      {
        framework: ComplianceFramework.HIPAA,
        controlId: 'ADMIN-4',
        name: 'Information Access Management',
        description: 'Implement policies and procedures for authorizing access to ePHI.',
        category: 'Administrative Safeguards',
        status: ControlStatus.NEEDS_REVIEW,
        severity: 'critical',
        isMandatory: true,
        reviewFrequencyDays: 180,
      },
      {
        framework: ComplianceFramework.HIPAA,
        controlId: 'ADMIN-5',
        name: 'Security Awareness and Training',
        description: 'Implement a security awareness and training program for all workforce members.',
        category: 'Administrative Safeguards',
        status: ControlStatus.NEEDS_REVIEW,
        severity: 'high',
        isMandatory: true,
        reviewFrequencyDays: 180,
      },

      // Physical Safeguards
      {
        framework: ComplianceFramework.HIPAA,
        controlId: 'PHYS-1',
        name: 'Facility Access Controls',
        description: 'Implement policies and procedures to limit physical access to electronic information systems and the facilities in which they are housed.',
        category: 'Physical Safeguards',
        status: ControlStatus.NEEDS_REVIEW,
        severity: 'high',
        isMandatory: true,
        reviewFrequencyDays: 180,
      },
      {
        framework: ComplianceFramework.HIPAA,
        controlId: 'PHYS-2',
        name: 'Workstation Use',
        description: 'Implement policies and procedures that specify the proper functions to be performed and the manner in which those functions are to be performed.',
        category: 'Physical Safeguards',
        status: ControlStatus.NEEDS_REVIEW,
        severity: 'medium',
        isMandatory: true,
        reviewFrequencyDays: 180,
      },
      {
        framework: ComplianceFramework.HIPAA,
        controlId: 'PHYS-3',
        name: 'Workstation Security',
        description: 'Implement physical safeguards for all workstations that access ePHI to restrict access to authorized users.',
        category: 'Physical Safeguards',
        status: ControlStatus.NEEDS_REVIEW,
        severity: 'high',
        isMandatory: true,
        reviewFrequencyDays: 180,
      },
      {
        framework: ComplianceFramework.HIPAA,
        controlId: 'PHYS-4',
        name: 'Device and Media Controls',
        description: 'Implement policies and procedures that govern the receipt and removal of hardware and electronic media.',
        category: 'Physical Safeguards',
        status: ControlStatus.NEEDS_REVIEW,
        severity: 'high',
        isMandatory: true,
        reviewFrequencyDays: 180,
      },

      // Technical Safeguards
      {
        framework: ComplianceFramework.HIPAA,
        controlId: 'TECH-1',
        name: 'Access Control',
        description: 'Implement technical policies and procedures for electronic information systems that maintain ePHI to allow access only to authorized persons or software.',
        category: 'Technical Safeguards',
        status: ControlStatus.NEEDS_REVIEW,
        severity: 'critical',
        isMandatory: true,
        reviewFrequencyDays: 180,
      },
      {
        framework: ComplianceFramework.HIPAA,
        controlId: 'TECH-2',
        name: 'Audit Controls',
        description: 'Implement hardware, software, and/or procedural mechanisms that record and examine activity in information systems that contain or use ePHI.',
        category: 'Technical Safeguards',
        status: ControlStatus.NEEDS_REVIEW,
        severity: 'critical',
        isMandatory: true,
        reviewFrequencyDays: 180,
      },
      {
        framework: ComplianceFramework.HIPAA,
        controlId: 'TECH-3',
        name: 'Integrity',
        description: 'Implement policies and procedures to protect ePHI from improper alteration or destruction.',
        category: 'Technical Safeguards',
        status: ControlStatus.NEEDS_REVIEW,
        severity: 'high',
        isMandatory: true,
        reviewFrequencyDays: 180,
      },
      {
        framework: ComplianceFramework.HIPAA,
        controlId: 'TECH-4',
        name: 'Person or Entity Authentication',
        description: 'Implement procedures to verify that a person or entity seeking access to ePHI is the one claimed.',
        category: 'Technical Safeguards',
        status: ControlStatus.NEEDS_REVIEW,
        severity: 'critical',
        isMandatory: true,
        reviewFrequencyDays: 180,
      },
      {
        framework: ComplianceFramework.HIPAA,
        controlId: 'TECH-5',
        name: 'Transmission Security',
        description: 'Implement technical security measures to guard against unauthorized access to ePHI being transmitted over an electronic communications network.',
        category: 'Technical Safeguards',
        status: ControlStatus.NEEDS_REVIEW,
        severity: 'critical',
        isMandatory: true,
        reviewFrequencyDays: 180,
      },
    ];
  }

  /**
   * Generate breach notification report
   */
  async generateBreachNotificationReport(incidentId: string): Promise<BreachNotificationReport> {
    const incident = await this.securityIncidentRepository.findOne({
      where: { id: incidentId },
    });

    if (!incident) {
      throw new Error(`Incident not found: ${incidentId}`);
    }

    // Determine if this requires breach notification under HIPAA
    const requiresNotification = this.determineBreachNotificationRequirement(incident);

    return {
      incidentId: incident.id,
      discoveryDate: incident.detectedAt,
      breachType: incident.category,
      individualsAffected: incident.recordsAffected,
      phiCompromised: incident.dataTypesAffected,
      notificationStatus: {
        individualNotified: incident.affectedPartiesNotified,
        hssNotified: incident.authoritiesNotifiedAt !== null,
        mediaNotified: incident.recordsAffected > 500, // Media notification required if >500 affected
      },
      mitigationActions: incident.preventiveMeasures?.map(m => m.measure || '') || [],
    };
  }

  /**
   * Determine if incident requires HIPAA breach notification
   */
  private determineBreachNotificationRequirement(incident: SecurityIncident): boolean {
    // HIPAA requires notification if:
    // 1. Unsecured PHI is involved
    // 2. Affects 500+ individuals (notify HHS and media)
    // 3. Or any number of individuals (notify individuals and HHS)

    const involvesPHI = incident.dataTypesAffected.some(type =>
      ['phi', 'protected_health_information', 'ephi', 'medical_records'].includes(type.toLowerCase())
    );

    return involvesPHI && incident.recordsAffected > 0;
  }

  /**
   * Get compliance gap analysis
   */
  async getComplianceGapAnalysis(): Promise<{
    gaps: ComplianceControl[];
    priorityActions: string[];
    estimatedRemediationTime: number;
  }> {
    const gaps = await this.complianceControlRepository.find({
      where: {
        framework: ComplianceFramework.HIPAA,
        status: ControlStatus.NON_COMPLIANT,
      },
      order: { severity: 'DESC' },
    });

    const priorityActions = gaps
      .filter(g => g.severity === 'critical' || g.severity === 'high')
      .map(g => `Implement ${g.name}: ${g.description}`);

    // Estimate remediation time (days) based on number and severity of gaps
    const estimatedRemediationTime = gaps.reduce((sum, gap) => {
      const severityDays = {
        critical: 30,
        high: 20,
        medium: 10,
        low: 5,
      };
      return sum + (severityDays[gap.severity] || 10);
    }, 0);

    return {
      gaps,
      priorityActions,
      estimatedRemediationTime,
    };
  }
}
