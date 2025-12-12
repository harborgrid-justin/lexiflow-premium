import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';

export enum SOXControlType {
  ENTITY_LEVEL = 'ENTITY_LEVEL',
  PROCESS_LEVEL = 'PROCESS_LEVEL',
  IT_GENERAL = 'IT_GENERAL',
  IT_APPLICATION = 'IT_APPLICATION',
}

export enum ControlFrequency {
  CONTINUOUS = 'CONTINUOUS',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  ANNUALLY = 'ANNUALLY',
}

export enum ControlEffectiveness {
  EFFECTIVE = 'EFFECTIVE',
  NEEDS_IMPROVEMENT = 'NEEDS_IMPROVEMENT',
  INEFFECTIVE = 'INEFFECTIVE',
  NOT_TESTED = 'NOT_TESTED',
}

export enum DeficiencyLevel {
  CONTROL_DEFICIENCY = 'CONTROL_DEFICIENCY',
  SIGNIFICANT_DEFICIENCY = 'SIGNIFICANT_DEFICIENCY',
  MATERIAL_WEAKNESS = 'MATERIAL_WEAKNESS',
}

export interface SOXControl {
  id: string;
  controlId: string;
  name: string;
  description: string;
  type: SOXControlType;
  objective: string;
  riskAddressed: string;
  controlOwner: string;
  frequency: ControlFrequency;
  automated: boolean;
  keyControl: boolean;
  effectiveness: ControlEffectiveness;
  lastTested: Date;
  nextTestDue: Date;
  evidence: ControlEvidence[];
  deficiencies: ControlDeficiency[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ControlEvidence {
  id: string;
  evidenceDate: Date;
  evidenceType: string;
  description: string;
  documentId?: string;
  recordedBy: string;
  verified: boolean;
  verifiedBy?: string;
  verificationDate?: Date;
}

export interface ControlDeficiency {
  id: string;
  identifiedDate: Date;
  deficiencyLevel: DeficiencyLevel;
  description: string;
  impact: string;
  rootCause: string;
  remediation: string;
  remediationOwner: string;
  targetDate: Date;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'ACCEPTED';
  resolvedDate?: Date;
}

export interface ControlTest {
  id: string;
  controlId: string;
  testDate: Date;
  testPeriod: { start: Date; end: Date };
  tester: string;
  methodology: string;
  sampleSize?: number;
  exceptions: number;
  effectiveness: ControlEffectiveness;
  findings: string[];
  conclusion: string;
  recommendedActions: string[];
  completedAt: Date;
}

export interface SegregationOfDuties {
  id: string;
  name: string;
  conflictingRole1: string;
  conflictingRole2: string;
  description: string;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  mitigatingControls: string[];
  violations: SODViolation[];
}

export interface SODViolation {
  id: string;
  userId: string;
  userName: string;
  conflictingRoles: string[];
  identifiedDate: Date;
  reviewedBy?: string;
  reviewDate?: Date;
  approved: boolean;
  justification?: string;
  compensatingControls?: string[];
}

export interface ChangeManagement {
  id: string;
  changeId: string;
  changeType: 'EMERGENCY' | 'STANDARD' | 'NORMAL';
  description: string;
  requestedBy: string;
  requestDate: Date;
  affectedSystems: string[];
  businessJustification: string;
  riskAssessment: string;
  approvers: ChangeApprover[];
  implementationDate?: Date;
  rollbackPlan: string;
  postImplementationReview?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'IMPLEMENTED' | 'ROLLED_BACK';
}

export interface ChangeApprover {
  userId: string;
  userName: string;
  role: string;
  approvalDate?: Date;
  approved?: boolean;
  comments?: string;
}

export interface AccessReview {
  id: string;
  reviewPeriod: { start: Date; end: Date };
  system: string;
  reviewer: string;
  usersReviewed: number;
  excessiveAccessFound: number;
  accessRemoved: number;
  accessModified: number;
  completedAt?: Date;
  findings: AccessFinding[];
}

export interface AccessFinding {
  userId: string;
  userName: string;
  issue: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  action: 'REMOVED' | 'MODIFIED' | 'RETAINED' | 'PENDING';
  justification?: string;
}

@Injectable()
export class SoxControlsService {
  private readonly logger = new Logger(SoxControlsService.name);
  private controls: Map<string, SOXControl> = new Map();
  private controlTests: Map<string, ControlTest> = new Map();
  private sodPolicies: Map<string, SegregationOfDuties> = new Map();
  private changes: Map<string, ChangeManagement> = new Map();
  private accessReviews: Map<string, AccessReview> = new Map();

  constructor(
    // @InjectRepository would be used for actual database entities
  ) {
    this.initializeDefaultControls();
  }

  /**
   * Initialize default SOX controls
   */
  private initializeDefaultControls(): void {
    const controls: SOXControl[] = [
      {
        id: 'sox-001',
        controlId: 'ITGC-001',
        name: 'Change Management',
        description: 'All changes to production systems require documented approval',
        type: SOXControlType.IT_GENERAL,
        objective: 'Ensure only authorized changes are implemented to production systems',
        riskAddressed: 'Unauthorized or untested changes causing system failures or data corruption',
        controlOwner: 'IT Manager',
        frequency: ControlFrequency.CONTINUOUS,
        automated: true,
        keyControl: true,
        effectiveness: ControlEffectiveness.EFFECTIVE,
        lastTested: new Date(),
        nextTestDue: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        evidence: [],
        deficiencies: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'sox-002',
        controlId: 'ITGC-002',
        name: 'Logical Access Controls',
        description: 'User access is granted based on job role and approved by management',
        type: SOXControlType.IT_GENERAL,
        objective: 'Prevent unauthorized access to financial systems and data',
        riskAddressed: 'Unauthorized access leading to fraud or data manipulation',
        controlOwner: 'Security Manager',
        frequency: ControlFrequency.CONTINUOUS,
        automated: true,
        keyControl: true,
        effectiveness: ControlEffectiveness.EFFECTIVE,
        lastTested: new Date(),
        nextTestDue: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        evidence: [],
        deficiencies: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'sox-003',
        controlId: 'ITGC-003',
        name: 'Segregation of Duties',
        description: 'Incompatible duties are segregated to prevent fraud',
        type: SOXControlType.IT_GENERAL,
        objective: 'Prevent single individual from controlling critical transactions end-to-end',
        riskAddressed: 'Fraud or error due to lack of segregation of duties',
        controlOwner: 'Compliance Officer',
        frequency: ControlFrequency.QUARTERLY,
        automated: false,
        keyControl: true,
        effectiveness: ControlEffectiveness.EFFECTIVE,
        lastTested: new Date(),
        nextTestDue: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        evidence: [],
        deficiencies: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'sox-004',
        controlId: 'ITGC-004',
        name: 'Access Review',
        description: 'Quarterly review of user access rights to ensure appropriateness',
        type: SOXControlType.IT_GENERAL,
        objective: 'Ensure user access remains appropriate based on current job responsibilities',
        riskAddressed: 'Excessive or inappropriate access rights',
        controlOwner: 'IT Security',
        frequency: ControlFrequency.QUARTERLY,
        automated: false,
        keyControl: true,
        effectiveness: ControlEffectiveness.EFFECTIVE,
        lastTested: new Date(),
        nextTestDue: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        evidence: [],
        deficiencies: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'sox-005',
        controlId: 'ITAC-001',
        name: 'Billing System Calculations',
        description: 'Automated validation of billing calculations and revenue recognition',
        type: SOXControlType.IT_APPLICATION,
        objective: 'Ensure accuracy of billing calculations and revenue recognition',
        riskAddressed: 'Incorrect billing leading to revenue misstatement',
        controlOwner: 'Finance Manager',
        frequency: ControlFrequency.CONTINUOUS,
        automated: true,
        keyControl: true,
        effectiveness: ControlEffectiveness.EFFECTIVE,
        lastTested: new Date(),
        nextTestDue: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        evidence: [],
        deficiencies: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    controls.forEach(control => {
      this.controls.set(control.id, control);
    });

    this.logger.log(`Initialized ${controls.length} SOX controls`);
  }

  /**
   * Create or update SOX control
   */
  async createControl(controlData: Partial<SOXControl>): Promise<SOXControl> {
    const control: SOXControl = {
      id: controlData.id || `sox-${Date.now()}`,
      controlId: controlData.controlId!,
      name: controlData.name!,
      description: controlData.description || '',
      type: controlData.type!,
      objective: controlData.objective || '',
      riskAddressed: controlData.riskAddressed || '',
      controlOwner: controlData.controlOwner!,
      frequency: controlData.frequency!,
      automated: controlData.automated ?? false,
      keyControl: controlData.keyControl ?? false,
      effectiveness: ControlEffectiveness.NOT_TESTED,
      lastTested: new Date(),
      nextTestDue: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      evidence: [],
      deficiencies: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.controls.set(control.id, control);
    this.logger.log(`Created SOX control: ${control.controlId} - ${control.name}`);

    return control;
  }

  /**
   * Document control evidence
   */
  async documentEvidence(
    controlId: string,
    evidenceType: string,
    description: string,
    recordedBy: string,
    documentId?: string,
  ): Promise<void> {
    const control = this.controls.get(controlId);
    if (!control) {
      throw new Error(`Control not found: ${controlId}`);
    }

    const evidence: ControlEvidence = {
      id: `evid-${Date.now()}`,
      evidenceDate: new Date(),
      evidenceType,
      description,
      documentId,
      recordedBy,
      verified: false,
    };

    control.evidence.push(evidence);
    control.updatedAt = new Date();

    this.controls.set(controlId, control);
    this.logger.log(`Documented evidence for control ${control.controlId}`);
  }

  /**
   * Test control effectiveness
   */
  async testControl(
    controlId: string,
    tester: string,
    testPeriod: { start: Date; end: Date },
    methodology: string,
    sampleSize: number,
    exceptions: number,
    findings: string[],
  ): Promise<ControlTest> {
    const control = this.controls.get(controlId);
    if (!control) {
      throw new Error(`Control not found: ${controlId}`);
    }

    // Determine effectiveness based on exceptions
    let effectiveness: ControlEffectiveness;
    const exceptionRate = sampleSize > 0 ? (exceptions / sampleSize) * 100 : 0;

    if (exceptionRate === 0) {
      effectiveness = ControlEffectiveness.EFFECTIVE;
    } else if (exceptionRate < 5) {
      effectiveness = ControlEffectiveness.NEEDS_IMPROVEMENT;
    } else {
      effectiveness = ControlEffectiveness.INEFFECTIVE;
    }

    const test: ControlTest = {
      id: `test-${Date.now()}`,
      controlId,
      testDate: new Date(),
      testPeriod,
      tester,
      methodology,
      sampleSize,
      exceptions,
      effectiveness,
      findings,
      conclusion:
        effectiveness === ControlEffectiveness.EFFECTIVE
          ? 'Control is operating effectively'
          : `Control has ${exceptions} exceptions and needs improvement`,
      recommendedActions:
        effectiveness !== ControlEffectiveness.EFFECTIVE
          ? ['Investigate root cause of exceptions', 'Implement corrective actions']
          : [],
      completedAt: new Date(),
    };

    this.controlTests.set(test.id, test);

    // Update control
    control.effectiveness = effectiveness;
    control.lastTested = new Date();
    control.nextTestDue = this.calculateNextTestDate(control.frequency);
    control.updatedAt = new Date();

    this.controls.set(controlId, control);

    this.logger.log(
      `Tested control ${control.controlId}: ${effectiveness} (${exceptions}/${sampleSize} exceptions)`,
    );

    return test;
  }

  /**
   * Calculate next test date based on frequency
   */
  private calculateNextTestDate(frequency: ControlFrequency): Date {
    const now = new Date();
    const nextDate = new Date(now);

    switch (frequency) {
      case ControlFrequency.DAILY:
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case ControlFrequency.WEEKLY:
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case ControlFrequency.MONTHLY:
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case ControlFrequency.QUARTERLY:
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case ControlFrequency.ANNUALLY:
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
      case ControlFrequency.CONTINUOUS:
        nextDate.setDate(nextDate.getDate() + 30);
        break;
    }

    return nextDate;
  }

  /**
   * Report control deficiency
   */
  async reportDeficiency(
    controlId: string,
    deficiencyLevel: DeficiencyLevel,
    description: string,
    impact: string,
    rootCause: string,
    remediation: string,
    remediationOwner: string,
    targetDate: Date,
  ): Promise<void> {
    const control = this.controls.get(controlId);
    if (!control) {
      throw new Error(`Control not found: ${controlId}`);
    }

    const deficiency: ControlDeficiency = {
      id: `def-${Date.now()}`,
      identifiedDate: new Date(),
      deficiencyLevel,
      description,
      impact,
      rootCause,
      remediation,
      remediationOwner,
      targetDate,
      status: 'OPEN',
    };

    control.deficiencies.push(deficiency);
    control.updatedAt = new Date();

    this.controls.set(controlId, control);

    if (deficiencyLevel === DeficiencyLevel.MATERIAL_WEAKNESS) {
      this.logger.error(
        `MATERIAL WEAKNESS identified in control ${control.controlId}: ${description}`,
      );
    } else {
      this.logger.warn(
        `${deficiencyLevel} identified in control ${control.controlId}: ${description}`,
      );
    }
  }

  /**
   * Submit change request
   */
  async submitChangeRequest(
    changeData: Partial<ChangeManagement>,
  ): Promise<ChangeManagement> {
    const change: ChangeManagement = {
      id: changeData.id || `chg-${Date.now()}`,
      changeId: changeData.changeId || `CHG-${Date.now()}`,
      changeType: changeData.changeType || 'NORMAL',
      description: changeData.description!,
      requestedBy: changeData.requestedBy!,
      requestDate: new Date(),
      affectedSystems: changeData.affectedSystems || [],
      businessJustification: changeData.businessJustification || '',
      riskAssessment: changeData.riskAssessment || '',
      approvers: changeData.approvers || [],
      rollbackPlan: changeData.rollbackPlan || '',
      status: 'PENDING',
    };

    this.changes.set(change.id, change);
    this.logger.log(`Change request submitted: ${change.changeId} by ${change.requestedBy}`);

    return change;
  }

  /**
   * Approve/reject change request
   */
  async reviewChangeRequest(
    changeId: string,
    approverId: string,
    approved: boolean,
    comments?: string,
  ): Promise<void> {
    const change = this.changes.get(changeId);
    if (!change) {
      throw new Error(`Change request not found: ${changeId}`);
    }

    const approver = change.approvers.find(a => a.userId === approverId);
    if (!approver) {
      throw new Error(`Approver ${approverId} not found for change ${changeId}`);
    }

    approver.approvalDate = new Date();
    approver.approved = approved;
    approver.comments = comments;

    // Check if all approvers have responded
    const allApproved = change.approvers.every(a => a.approved === true);
    const anyRejected = change.approvers.some(a => a.approved === false);

    if (anyRejected) {
      change.status = 'REJECTED';
    } else if (allApproved) {
      change.status = 'APPROVED';
    }

    this.changes.set(changeId, change);
    this.logger.log(
      `Change ${change.changeId} reviewed by ${approverId}: ${approved ? 'APPROVED' : 'REJECTED'}`,
    );
  }

  /**
   * Conduct access review
   */
  async conductAccessReview(
    system: string,
    reviewer: string,
    reviewPeriod: { start: Date; end: Date },
  ): Promise<AccessReview> {
    const review: AccessReview = {
      id: `review-${Date.now()}`,
      reviewPeriod,
      system,
      reviewer,
      usersReviewed: 0,
      excessiveAccessFound: 0,
      accessRemoved: 0,
      accessModified: 0,
      findings: [],
    };

    // In production, would query actual user access
    // For now, simulate review
    review.usersReviewed = 50;
    review.excessiveAccessFound = 3;

    this.accessReviews.set(review.id, review);
    this.logger.log(`Started access review for ${system} by ${reviewer}`);

    return review;
  }

  /**
   * Complete access review
   */
  async completeAccessReview(reviewId: string): Promise<void> {
    const review = this.accessReviews.get(reviewId);
    if (!review) {
      throw new Error(`Access review not found: ${reviewId}`);
    }

    review.completedAt = new Date();
    this.accessReviews.set(reviewId, review);

    this.logger.log(
      `Completed access review ${reviewId}: ${review.accessRemoved} removed, ${review.accessModified} modified`,
    );
  }

  /**
   * Get controls requiring testing
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async getControlsDueForTesting(): Promise<SOXControl[]> {
    const now = new Date();
    const controls = Array.from(this.controls.values());

    const dueControls = controls.filter(c => c.nextTestDue <= now);

    if (dueControls.length > 0) {
      this.logger.warn(`${dueControls.length} controls are due for testing`);
    }

    return dueControls;
  }

  /**
   * Get open deficiencies
   */
  async getOpenDeficiencies(): Promise<
    Array<{ control: SOXControl; deficiency: ControlDeficiency }>
  > {
    const controls = Array.from(this.controls.values());
    const results: Array<{ control: SOXControl; deficiency: ControlDeficiency }> = [];

    for (const control of controls) {
      const openDeficiencies = control.deficiencies.filter(d => d.status === 'OPEN');
      openDeficiencies.forEach(deficiency => {
        results.push({ control, deficiency });
      });
    }

    return results;
  }

  /**
   * Get compliance summary
   */
  async getComplianceSummary(): Promise<{
    totalControls: number;
    effectiveControls: number;
    controlsNeedingImprovement: number;
    ineffectiveControls: number;
    controlsDueForTesting: number;
    openDeficiencies: number;
    materialWeaknesses: number;
    pendingChanges: number;
  }> {
    const controls = Array.from(this.controls.values());
    const dueControls = await this.getControlsDueForTesting();
    const deficiencies = await this.getOpenDeficiencies();
    const materialWeaknesses = deficiencies.filter(
      d => d.deficiency.deficiencyLevel === DeficiencyLevel.MATERIAL_WEAKNESS,
    );
    const pendingChanges = Array.from(this.changes.values()).filter(
      c => c.status === 'PENDING',
    );

    return {
      totalControls: controls.length,
      effectiveControls: controls.filter(c => c.effectiveness === ControlEffectiveness.EFFECTIVE)
        .length,
      controlsNeedingImprovement: controls.filter(
        c => c.effectiveness === ControlEffectiveness.NEEDS_IMPROVEMENT,
      ).length,
      ineffectiveControls: controls.filter(
        c => c.effectiveness === ControlEffectiveness.INEFFECTIVE,
      ).length,
      controlsDueForTesting: dueControls.length,
      openDeficiencies: deficiencies.length,
      materialWeaknesses: materialWeaknesses.length,
      pendingChanges: pendingChanges.length,
    };
  }

  /**
   * Get all controls
   */
  async getAllControls(): Promise<SOXControl[]> {
    return Array.from(this.controls.values());
  }
}
