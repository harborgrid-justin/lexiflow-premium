import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export enum HIPAACompliance {
  PRIVACY_RULE = 'PRIVACY_RULE',
  SECURITY_RULE = 'SECURITY_RULE',
  BREACH_NOTIFICATION = 'BREACH_NOTIFICATION',
  ENFORCEMENT = 'ENFORCEMENT',
  OMNIBUS = 'OMNIBUS',
}

export enum PHICategory {
  NAMES = 'NAMES',
  ADDRESSES = 'ADDRESSES',
  DATES = 'DATES',
  TELEPHONE = 'TELEPHONE',
  FAX = 'FAX',
  EMAIL = 'EMAIL',
  SSN = 'SSN',
  MEDICAL_RECORD = 'MEDICAL_RECORD',
  HEALTH_PLAN = 'HEALTH_PLAN',
  ACCOUNT_NUMBER = 'ACCOUNT_NUMBER',
  LICENSE_NUMBER = 'LICENSE_NUMBER',
  VEHICLE_ID = 'VEHICLE_ID',
  DEVICE_ID = 'DEVICE_ID',
  BIOMETRIC = 'BIOMETRIC',
  PHOTO = 'PHOTO',
  OTHER = 'OTHER',
}

export enum AccessType {
  READ = 'READ',
  WRITE = 'WRITE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  EXPORT = 'EXPORT',
  PRINT = 'PRINT',
  SHARE = 'SHARE',
  DECRYPT = 'DECRYPT',
}

export interface HIPAAAuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  userRole: string;
  action: AccessType;
  resourceType: string;
  resourceId: string;
  phiCategories: PHICategory[];
  patientId?: string;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  successful: boolean;
  failureReason?: string;
  emergencyAccess: boolean;
  justification?: string;
  dataModified?: boolean;
  oldValue?: string;
  newValue?: string;
}

export interface HIPAASecurityControl {
  id: string;
  controlId: string; // e.g., "164.308(a)(1)(i)"
  category: 'ADMINISTRATIVE' | 'PHYSICAL' | 'TECHNICAL';
  required: boolean; // Required vs. Addressable
  name: string;
  description: string;
  implementation: string;
  status: 'IMPLEMENTED' | 'PARTIAL' | 'NOT_IMPLEMENTED' | 'NOT_APPLICABLE';
  lastReviewed: Date;
  reviewer: string;
  evidence: string[];
  gaps: string[];
  remediationPlan?: string;
}

export interface HIPAAAssessment {
  id: string;
  assessmentDate: Date;
  assessor: string;
  scope: string[];
  findings: AssessmentFinding[];
  overallRiskScore: number;
  recommendations: string[];
  completedAt?: Date;
  nextAssessmentDue: Date;
}

export interface AssessmentFinding {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  controlId: string;
  description: string;
  impact: string;
  likelihood: number;
  riskScore: number;
  remediation: string;
  assignedTo?: string;
  dueDate?: Date;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'ACCEPTED';
}

export interface PHIAccessReport {
  userId: string;
  userName: string;
  totalAccesses: number;
  phiRecordsAccessed: number;
  emergencyAccesses: number;
  unauthorizedAttempts: number;
  patientBreakGlass: number;
  timeRange: { start: Date; end: Date };
  accessPatterns: Record<AccessType, number>;
  riskScore: number;
}

export interface BreakGlassAccess {
  id: string;
  userId: string;
  patientId: string;
  timestamp: Date;
  justification: string;
  approvedBy?: string;
  approvalTimestamp?: Date;
  reviewed: boolean;
  legitimate: boolean;
}

@Injectable()
export class HipaaAuditService {
  private readonly logger = new Logger(HipaaAuditService.name);
  private auditLogs: Map<string, HIPAAAuditLog> = new Map();
  private securityControls: Map<string, HIPAASecurityControl> = new Map();
  private assessments: Map<string, HIPAAAssessment> = new Map();
  private breakGlassAccesses: Map<string, BreakGlassAccess> = new Map();

  constructor(
    // @InjectRepository would be used for actual database entities
  ) {
    this.initializeSecurityControls();
  }

  /**
   * Initialize HIPAA security controls
   */
  private initializeSecurityControls(): void {
    const controls: HIPAASecurityControl[] = [
      {
        id: 'ctrl-1',
        controlId: '164.308(a)(1)(i)',
        category: 'ADMINISTRATIVE',
        required: true,
        name: 'Security Management Process',
        description: 'Implement policies and procedures to prevent, detect, contain, and correct security violations',
        implementation: 'Comprehensive security policies, risk assessments, sanctions policy',
        status: 'IMPLEMENTED',
        lastReviewed: new Date(),
        reviewer: 'Security Team',
        evidence: ['Security Policy Document v2.1', 'Risk Assessment Report 2024'],
        gaps: [],
      },
      {
        id: 'ctrl-2',
        controlId: '164.308(a)(3)(i)',
        category: 'ADMINISTRATIVE',
        required: true,
        name: 'Workforce Security',
        description: 'Implement policies and procedures to ensure that all workforce members have appropriate access to ePHI',
        implementation: 'Role-based access control, background checks, access reviews',
        status: 'IMPLEMENTED',
        lastReviewed: new Date(),
        reviewer: 'HR & Security',
        evidence: ['Access Control Matrix', 'Quarterly Access Reviews'],
        gaps: [],
      },
      {
        id: 'ctrl-3',
        controlId: '164.308(a)(4)(i)',
        category: 'ADMINISTRATIVE',
        required: true,
        name: 'Information Access Management',
        description: 'Implement policies and procedures for authorizing access to ePHI',
        implementation: 'Formal authorization process, least privilege principle',
        status: 'IMPLEMENTED',
        lastReviewed: new Date(),
        reviewer: 'Access Management Team',
        evidence: ['Access Request Forms', 'Authorization Workflow'],
        gaps: [],
      },
      {
        id: 'ctrl-4',
        controlId: '164.312(a)(1)',
        category: 'TECHNICAL',
        required: true,
        name: 'Access Control',
        description: 'Implement technical policies and procedures for electronic information systems that maintain ePHI',
        implementation: 'Unique user IDs, emergency access, automatic logoff, encryption',
        status: 'IMPLEMENTED',
        lastReviewed: new Date(),
        reviewer: 'IT Security',
        evidence: ['Authentication System', 'Session Management Logs'],
        gaps: [],
      },
      {
        id: 'ctrl-5',
        controlId: '164.312(b)',
        category: 'TECHNICAL',
        required: true,
        name: 'Audit Controls',
        description: 'Implement hardware, software, and/or procedural mechanisms that record and examine activity',
        implementation: 'Comprehensive audit logging, log retention, log monitoring',
        status: 'IMPLEMENTED',
        lastReviewed: new Date(),
        reviewer: 'Security Operations',
        evidence: ['Audit Log System', 'SIEM Configuration'],
        gaps: [],
      },
      {
        id: 'ctrl-6',
        controlId: '164.312(c)(1)',
        category: 'TECHNICAL',
        required: true,
        name: 'Integrity',
        description: 'Implement policies and procedures to protect ePHI from improper alteration or destruction',
        implementation: 'Data integrity checks, change tracking, version control',
        status: 'IMPLEMENTED',
        lastReviewed: new Date(),
        reviewer: 'Data Management',
        evidence: ['Integrity Monitoring', 'Change Logs'],
        gaps: [],
      },
      {
        id: 'ctrl-7',
        controlId: '164.312(d)',
        category: 'TECHNICAL',
        required: false,
        name: 'Person or Entity Authentication',
        description: 'Implement procedures to verify that a person or entity seeking access to ePHI is the one claimed',
        implementation: 'Multi-factor authentication, biometric authentication',
        status: 'IMPLEMENTED',
        lastReviewed: new Date(),
        reviewer: 'Identity Management',
        evidence: ['MFA System', 'Authentication Logs'],
        gaps: [],
      },
      {
        id: 'ctrl-8',
        controlId: '164.312(e)(1)',
        category: 'TECHNICAL',
        required: true,
        name: 'Transmission Security',
        description: 'Implement technical security measures to guard against unauthorized access to ePHI being transmitted',
        implementation: 'TLS 1.3 encryption, VPN, secure messaging',
        status: 'IMPLEMENTED',
        lastReviewed: new Date(),
        reviewer: 'Network Security',
        evidence: ['SSL Certificates', 'Network Encryption Config'],
        gaps: [],
      },
    ];

    controls.forEach(control => {
      this.securityControls.set(control.id, control);
    });

    this.logger.log(`Initialized ${controls.length} HIPAA security controls`);
  }

  /**
   * Log PHI access
   */
  async logPHIAccess(
    userId: string,
    userRole: string,
    action: AccessType,
    resourceType: string,
    resourceId: string,
    phiCategories: PHICategory[],
    patientId: string | undefined,
    ipAddress: string,
    userAgent: string,
    sessionId: string,
    successful: boolean,
    emergencyAccess: boolean = false,
    justification?: string,
  ): Promise<HIPAAAuditLog> {
    const log: HIPAAAuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      timestamp: new Date(),
      userId,
      userRole,
      action,
      resourceType,
      resourceId,
      phiCategories,
      patientId,
      ipAddress,
      userAgent,
      sessionId,
      successful,
      emergencyAccess,
      justification,
      dataModified: [AccessType.WRITE, AccessType.UPDATE, AccessType.DELETE].includes(action),
    };

    this.auditLogs.set(log.id, log);

    // Log warning for emergency access
    if (emergencyAccess) {
      this.logger.warn(
        `Emergency PHI access by ${userId} for patient ${patientId}: ${justification}`,
      );
    }

    // Log error for failed access attempts
    if (!successful) {
      this.logger.error(
        `Unauthorized PHI access attempt by ${userId} for ${resourceType}:${resourceId}`,
      );
    }

    return log;
  }

  /**
   * Record break-glass emergency access
   */
  async recordBreakGlassAccess(
    userId: string,
    patientId: string,
    justification: string,
  ): Promise<BreakGlassAccess> {
    const breakGlass: BreakGlassAccess = {
      id: `bg-${Date.now()}`,
      userId,
      patientId,
      timestamp: new Date(),
      justification,
      reviewed: false,
      legitimate: false, // Must be reviewed
    };

    this.breakGlassAccesses.set(breakGlass.id, breakGlass);

    this.logger.warn(
      `Break-glass access recorded: User ${userId} accessed patient ${patientId} - ${justification}`,
    );

    return breakGlass;
  }

  /**
   * Review break-glass access
   */
  async reviewBreakGlassAccess(
    breakGlassId: string,
    reviewedBy: string,
    isLegitimate: boolean,
  ): Promise<void> {
    const breakGlass = this.breakGlassAccesses.get(breakGlassId);
    if (!breakGlass) {
      throw new Error(`Break-glass access not found: ${breakGlassId}`);
    }

    breakGlass.reviewed = true;
    breakGlass.legitimate = isLegitimate;
    breakGlass.approvedBy = reviewedBy;
    breakGlass.approvalTimestamp = new Date();

    this.breakGlassAccesses.set(breakGlassId, breakGlass);

    if (!isLegitimate) {
      this.logger.error(
        `Illegitimate break-glass access detected: ${breakGlassId} by user ${breakGlass.userId}`,
      );
    }
  }

  /**
   * Get audit logs for date range
   */
  async getAuditLogs(
    startDate: Date,
    endDate: Date,
    filters?: {
      userId?: string;
      patientId?: string;
      action?: AccessType;
      emergencyOnly?: boolean;
    },
  ): Promise<HIPAAAuditLog[]> {
    let logs = Array.from(this.auditLogs.values()).filter(
      log => log.timestamp >= startDate && log.timestamp <= endDate,
    );

    if (filters?.userId) {
      logs = logs.filter(log => log.userId === filters.userId);
    }

    if (filters?.patientId) {
      logs = logs.filter(log => log.patientId === filters.patientId);
    }

    if (filters?.action) {
      logs = logs.filter(log => log.action === filters.action);
    }

    if (filters?.emergencyOnly) {
      logs = logs.filter(log => log.emergencyAccess);
    }

    return logs;
  }

  /**
   * Generate PHI access report for user
   */
  async generateAccessReport(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<PHIAccessReport> {
    const userLogs = await this.getAuditLogs(startDate, endDate, { userId });

    const uniquePatients = new Set(userLogs.filter(l => l.patientId).map(l => l.patientId!));
    const emergencyAccesses = userLogs.filter(l => l.emergencyAccess).length;
    const unauthorizedAttempts = userLogs.filter(l => !l.successful).length;
    const breakGlassAccesses = Array.from(this.breakGlassAccesses.values()).filter(
      bg => bg.userId === userId && bg.timestamp >= startDate && bg.timestamp <= endDate,
    ).length;

    const accessPatterns: Record<AccessType, number> = {} as any;
    Object.values(AccessType).forEach(type => {
      accessPatterns[type] = userLogs.filter(l => l.action === type).length;
    });

    // Calculate risk score based on access patterns
    const riskScore = this.calculateUserRiskScore({
      emergencyAccesses,
      unauthorizedAttempts,
      breakGlassAccesses,
      totalAccesses: userLogs.length,
    });

    return {
      userId,
      userName: `User ${userId}`,
      totalAccesses: userLogs.length,
      phiRecordsAccessed: uniquePatients.size,
      emergencyAccesses,
      unauthorizedAttempts,
      patientBreakGlass: breakGlassAccesses,
      timeRange: { start: startDate, end: endDate },
      accessPatterns,
      riskScore,
    };
  }

  /**
   * Calculate user risk score
   */
  private calculateUserRiskScore(data: {
    emergencyAccesses: number;
    unauthorizedAttempts: number;
    breakGlassAccesses: number;
    totalAccesses: number;
  }): number {
    let score = 0;

    // Unauthorized attempts are high risk
    score += data.unauthorizedAttempts * 10;

    // Emergency accesses need review
    score += data.emergencyAccesses * 5;

    // Break-glass accesses are risky
    score += data.breakGlassAccesses * 8;

    // High volume access might indicate data mining
    if (data.totalAccesses > 1000) {
      score += 20;
    }

    return Math.min(score, 100); // Cap at 100
  }

  /**
   * Conduct HIPAA security assessment
   */
  async conductAssessment(
    assessor: string,
    scope: string[],
  ): Promise<HIPAAAssessment> {
    const assessment: HIPAAAssessment = {
      id: `assess-${Date.now()}`,
      assessmentDate: new Date(),
      assessor,
      scope,
      findings: [],
      overallRiskScore: 0,
      recommendations: [],
      nextAssessmentDue: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    };

    // Review each control
    const controls = Array.from(this.securityControls.values());
    for (const control of controls) {
      if (control.status !== 'IMPLEMENTED') {
        const finding: AssessmentFinding = {
          id: `finding-${Date.now()}`,
          severity: control.required ? 'HIGH' : 'MEDIUM',
          controlId: control.controlId,
          description: `Control ${control.name} is ${control.status}`,
          impact: 'Potential HIPAA compliance violation',
          likelihood: control.required ? 8 : 5,
          riskScore: control.required ? 80 : 50,
          remediation: control.remediationPlan || 'Implement control as specified',
          status: 'OPEN',
        };
        assessment.findings.push(finding);
      }

      if (control.gaps.length > 0) {
        control.gaps.forEach(gap => {
          const finding: AssessmentFinding = {
            id: `finding-${Date.now()}-${Math.random()}`,
            severity: 'MEDIUM',
            controlId: control.controlId,
            description: gap,
            impact: 'Partial compliance with HIPAA requirements',
            likelihood: 6,
            riskScore: 60,
            remediation: 'Address identified gap',
            status: 'OPEN',
          };
          assessment.findings.push(finding);
        });
      }
    }

    // Calculate overall risk score
    if (assessment.findings.length > 0) {
      const avgRisk =
        assessment.findings.reduce((sum, f) => sum + f.riskScore, 0) /
        assessment.findings.length;
      assessment.overallRiskScore = Math.round(avgRisk);
    }

    // Generate recommendations
    if (assessment.overallRiskScore > 70) {
      assessment.recommendations.push('Immediate action required for high-risk findings');
    }
    assessment.recommendations.push('Conduct regular security awareness training');
    assessment.recommendations.push('Review and update security policies annually');

    this.assessments.set(assessment.id, assessment);

    this.logger.log(
      `Completed HIPAA assessment ${assessment.id}: ${assessment.findings.length} findings, risk score ${assessment.overallRiskScore}`,
    );

    return assessment;
  }

  /**
   * Get security controls
   */
  async getSecurityControls(): Promise<HIPAASecurityControl[]> {
    return Array.from(this.securityControls.values());
  }

  /**
   * Get unreviewed break-glass accesses
   */
  async getUnreviewedBreakGlass(): Promise<BreakGlassAccess[]> {
    const accesses = Array.from(this.breakGlassAccesses.values());
    return accesses.filter(bg => !bg.reviewed);
  }

  /**
   * Get compliance summary
   */
  async getComplianceSummary(): Promise<{
    implementedControls: number;
    totalControls: number;
    compliancePercentage: number;
    openFindings: number;
    unreviewedBreakGlass: number;
  }> {
    const controls = Array.from(this.securityControls.values());
    const implemented = controls.filter(c => c.status === 'IMPLEMENTED').length;

    const latestAssessment = Array.from(this.assessments.values()).sort(
      (a, b) => b.assessmentDate.getTime() - a.assessmentDate.getTime(),
    )[0];

    const openFindings = latestAssessment?.findings.filter(f => f.status === 'OPEN').length || 0;

    const unreviewedBreakGlass = await this.getUnreviewedBreakGlass();

    return {
      implementedControls: implemented,
      totalControls: controls.length,
      compliancePercentage: Math.round((implemented / controls.length) * 100),
      openFindings,
      unreviewedBreakGlass: unreviewedBreakGlass.length,
    };
  }
}
