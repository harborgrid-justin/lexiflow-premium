import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Case, CaseStatus } from './entities/case.entity';
import { CaseTimelineService } from './case-timeline.service';

/**
 * State machine transition definition
 */
export interface StateTransition {
  from: CaseStatus;
  to: CaseStatus;
  label: string;
  requiresApproval?: boolean;
  validationRules?: ValidationRule[];
  autoTriggers?: AutoTrigger[];
  notifications?: NotificationConfig[];
}

export interface ValidationRule {
  name: string;
  validator: (caseData: Case) => Promise<boolean> | boolean;
  errorMessage: string;
}

export interface AutoTrigger {
  event: string;
  condition?: (caseData: Case) => boolean;
  action: (caseData: Case) => Promise<void>;
}

export interface NotificationConfig {
  recipients: string[];
  template: string;
  channel: 'email' | 'sms' | 'push' | 'in-app';
}

export interface LifecycleEvent {
  caseId: string;
  event: string;
  timestamp: Date;
  userId?: string;
  metadata?: Record<string, any>;
}

/**
 * Case Lifecycle Management Service
 * Implements a comprehensive state machine for case management
 */
@Injectable()
export class CaseLifecycleService {
  private readonly logger = new Logger(CaseLifecycleService.name);

  // Complete state machine definition
  private readonly stateMachine: StateTransition[] = [
    // Initial state transitions
    {
      from: CaseStatus.OPEN,
      to: CaseStatus.ACTIVE,
      label: 'Activate Case',
      validationRules: [
        {
          name: 'hasLeadAttorney',
          validator: (caseData) => !!caseData.leadAttorneyId,
          errorMessage: 'Case must have a lead attorney assigned',
        },
        {
          name: 'hasBasicInfo',
          validator: (caseData) => !!caseData.title && !!caseData.caseNumber,
          errorMessage: 'Case must have title and case number',
        },
      ],
      notifications: [
        {
          recipients: ['leadAttorney', 'teamMembers'],
          template: 'case-activated',
          channel: 'email',
        },
      ],
    },
    {
      from: CaseStatus.OPEN,
      to: CaseStatus.ON_HOLD,
      label: 'Put Case On Hold',
      requiresApproval: true,
    },
    {
      from: CaseStatus.OPEN,
      to: CaseStatus.CLOSED,
      label: 'Close Case',
      requiresApproval: true,
      validationRules: [
        {
          name: 'hasCloseReason',
          validator: (caseData) => !!caseData.metadata?.closeReason,
          errorMessage: 'Must provide a reason for closing',
        },
      ],
    },

    // Active state transitions
    {
      from: CaseStatus.ACTIVE,
      to: CaseStatus.DISCOVERY,
      label: 'Begin Discovery',
      validationRules: [
        {
          name: 'hasFilingDate',
          validator: (caseData) => !!caseData.filingDate,
          errorMessage: 'Case must have a filing date',
        },
      ],
      notifications: [
        {
          recipients: ['leadAttorney', 'teamMembers'],
          template: 'discovery-started',
          channel: 'email',
        },
      ],
    },
    {
      from: CaseStatus.ACTIVE,
      to: CaseStatus.ON_HOLD,
      label: 'Put Case On Hold',
    },
    {
      from: CaseStatus.ACTIVE,
      to: CaseStatus.SETTLED,
      label: 'Mark as Settled',
      requiresApproval: true,
      validationRules: [
        {
          name: 'hasSettlementTerms',
          validator: (caseData) => !!caseData.metadata?.settlementTerms,
          errorMessage: 'Must provide settlement terms',
        },
      ],
    },
    {
      from: CaseStatus.ACTIVE,
      to: CaseStatus.CLOSED,
      label: 'Close Case',
      requiresApproval: true,
    },

    // Discovery state transitions
    {
      from: CaseStatus.DISCOVERY,
      to: CaseStatus.TRIAL,
      label: 'Proceed to Trial',
      validationRules: [
        {
          name: 'hasTrialDate',
          validator: (caseData) => !!caseData.trialDate,
          errorMessage: 'Trial date must be set',
        },
        {
          name: 'discoveryComplete',
          validator: (caseData) => caseData.metadata?.discoveryComplete === true,
          errorMessage: 'Discovery must be marked as complete',
        },
      ],
      notifications: [
        {
          recipients: ['leadAttorney', 'teamMembers', 'client'],
          template: 'trial-scheduled',
          channel: 'email',
        },
      ],
    },
    {
      from: CaseStatus.DISCOVERY,
      to: CaseStatus.ON_HOLD,
      label: 'Put Case On Hold',
    },
    {
      from: CaseStatus.DISCOVERY,
      to: CaseStatus.SETTLED,
      label: 'Mark as Settled',
      requiresApproval: true,
      validationRules: [
        {
          name: 'hasSettlementTerms',
          validator: (caseData) => !!caseData.metadata?.settlementTerms,
          errorMessage: 'Must provide settlement terms',
        },
      ],
    },
    {
      from: CaseStatus.DISCOVERY,
      to: CaseStatus.CLOSED,
      label: 'Close Case',
      requiresApproval: true,
    },

    // Trial state transitions
    {
      from: CaseStatus.TRIAL,
      to: CaseStatus.SETTLED,
      label: 'Mark as Settled',
      requiresApproval: true,
    },
    {
      from: CaseStatus.TRIAL,
      to: CaseStatus.CLOSED,
      label: 'Close Case',
      requiresApproval: true,
      validationRules: [
        {
          name: 'hasOutcome',
          validator: (caseData) => !!caseData.metadata?.trialOutcome,
          errorMessage: 'Must record trial outcome',
        },
      ],
    },
    {
      from: CaseStatus.TRIAL,
      to: CaseStatus.ON_HOLD,
      label: 'Put Case On Hold',
      requiresApproval: true,
    },

    // On-hold recovery transitions
    {
      from: CaseStatus.ON_HOLD,
      to: CaseStatus.OPEN,
      label: 'Reopen Case',
    },
    {
      from: CaseStatus.ON_HOLD,
      to: CaseStatus.ACTIVE,
      label: 'Reactivate Case',
    },
    {
      from: CaseStatus.ON_HOLD,
      to: CaseStatus.DISCOVERY,
      label: 'Resume Discovery',
    },
    {
      from: CaseStatus.ON_HOLD,
      to: CaseStatus.TRIAL,
      label: 'Resume Trial',
    },
    {
      from: CaseStatus.ON_HOLD,
      to: CaseStatus.CLOSED,
      label: 'Close Case',
      requiresApproval: true,
    },

    // Settlement transitions
    {
      from: CaseStatus.SETTLED,
      to: CaseStatus.CLOSED,
      label: 'Close Case',
      validationRules: [
        {
          name: 'settlementExecuted',
          validator: (caseData) => caseData.metadata?.settlementExecuted === true,
          errorMessage: 'Settlement must be executed',
        },
      ],
    },
    {
      from: CaseStatus.SETTLED,
      to: CaseStatus.ARCHIVED,
      label: 'Archive Case',
      validationRules: [
        {
          name: 'isClosed',
          validator: async (caseData) => caseData.closeDate !== null,
          errorMessage: 'Case must be closed before archiving',
        },
      ],
    },

    // Archival transitions
    {
      from: CaseStatus.CLOSED,
      to: CaseStatus.ARCHIVED,
      label: 'Archive Case',
      validationRules: [
        {
          name: 'hasCloseDate',
          validator: (caseData) => !!caseData.closeDate,
          errorMessage: 'Case must have a close date',
        },
        {
          name: 'retentionPeriodMet',
          validator: (caseData) => {
            const daysSinceClosed = caseData.closeDate
              ? Math.floor(
                  (Date.now() - new Date(caseData.closeDate).getTime()) /
                    (1000 * 60 * 60 * 24),
                )
              : 0;
            return daysSinceClosed >= 30; // 30 days minimum
          },
          errorMessage: 'Case must be closed for at least 30 days',
        },
      ],
    },
    {
      from: CaseStatus.ARCHIVED,
      to: CaseStatus.CLOSED,
      label: 'Unarchive Case',
      requiresApproval: true,
    },
  ];

  constructor(
    @InjectRepository(Case)
    private readonly caseRepository: Repository<Case>,
    private readonly timelineService: CaseTimelineService,
  ) {}

  /**
   * Get available transitions for current case state
   */
  async getAvailableTransitions(caseId: string): Promise<StateTransition[]> {
    const caseData = await this.caseRepository.findOne({ where: { id: caseId } });
    if (!caseData) {
      throw new BadRequestException('Case not found');
    }

    return this.stateMachine.filter((t) => t.from === caseData.status);
  }

  /**
   * Validate state transition
   */
  async validateTransition(
    caseId: string,
    newStatus: CaseStatus,
    userId?: string,
  ): Promise<{ valid: boolean; errors: string[] }> {
    const caseData = await this.caseRepository.findOne({ where: { id: caseId } });
    if (!caseData) {
      return { valid: false, errors: ['Case not found'] };
    }

    // Same status is always valid
    if (caseData.status === newStatus) {
      return { valid: true, errors: [] };
    }

    // Find transition
    const transition = this.stateMachine.find(
      (t) => t.from === caseData.status && t.to === newStatus,
    );

    if (!transition) {
      return {
        valid: false,
        errors: [`Invalid transition from ${caseData.status} to ${newStatus}`],
      };
    }

    // Run validation rules
    const errors: string[] = [];
    if (transition.validationRules) {
      for (const rule of transition.validationRules) {
        try {
          const isValid = await rule.validator(caseData);
          if (!isValid) {
            errors.push(rule.errorMessage);
          }
        } catch (error) {
          this.logger.error(`Validation rule ${rule.name} failed:`, error);
          errors.push(`Validation error: ${rule.name}`);
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Execute state transition with full lifecycle management
   */
  async transitionState(
    caseId: string,
    newStatus: CaseStatus,
    userId?: string,
    userName?: string,
    metadata?: Record<string, any>,
  ): Promise<Case> {
    const caseData = await this.caseRepository.findOne({ where: { id: caseId } });
    if (!caseData) {
      throw new BadRequestException('Case not found');
    }

    const oldStatus = caseData.status;

    // Validate transition
    const validation = await this.validateTransition(caseId, newStatus, userId);
    if (!validation.valid) {
      throw new BadRequestException(
        `Cannot transition case: ${validation.errors.join(', ')}`,
      );
    }

    // Find transition definition
    const transition = this.stateMachine.find(
      (t) => t.from === oldStatus && t.to === newStatus,
    );

    // Check if approval is required
    if (transition?.requiresApproval && !metadata?.approvalGranted) {
      throw new BadRequestException(
        'This transition requires approval from a supervisor',
      );
    }

    // Update case status
    caseData.status = newStatus;

    // Update metadata if provided
    if (metadata) {
      caseData.metadata = {
        ...caseData.metadata,
        ...metadata,
      };
    }

    // Set close date if transitioning to closed
    if (newStatus === CaseStatus.CLOSED && !caseData.closeDate) {
      caseData.closeDate = new Date();
    }

    // Save case
    const updatedCase = await this.caseRepository.save(caseData);

    // Log to timeline
    await this.timelineService.logStatusChange(
      caseId,
      oldStatus,
      newStatus,
      userId,
      userName,
    );

    // Execute auto-triggers
    if (transition?.autoTriggers) {
      for (const trigger of transition.autoTriggers) {
        try {
          if (!trigger.condition || trigger.condition(caseData)) {
            await trigger.action(caseData);
          }
        } catch (error) {
          this.logger.error(`Auto-trigger failed:`, error);
        }
      }
    }

    this.logger.log(
      `Case ${caseId} transitioned from ${oldStatus} to ${newStatus} by user ${userId}`,
    );

    return updatedCase;
  }

  /**
   * Get lifecycle statistics for a case
   */
  async getLifecycleStats(caseId: string): Promise<{
    currentStatus: CaseStatus;
    statusHistory: Array<{ status: CaseStatus; timestamp: Date; duration: number }>;
    totalDuration: number;
    averageTimePerStatus: Record<CaseStatus, number>;
  }> {
    const caseData = await this.caseRepository.findOne({ where: { id: caseId } });
    if (!caseData) {
      throw new BadRequestException('Case not found');
    }

    const timeline = await this.timelineService.findByCaseId(caseId);
    const statusChanges = timeline.filter((e) => e.eventType === 'STATUS_CHANGED');

    const statusHistory: Array<{ status: CaseStatus; timestamp: Date; duration: number }> =
      [];
    let previousTimestamp = caseData.createdAt;

    statusChanges.forEach((change, index) => {
      const timestamp = new Date(change.eventDate);
      const duration = timestamp.getTime() - new Date(previousTimestamp).getTime();

      statusHistory.push({
        status: change.metadata?.newStatus as CaseStatus,
        timestamp,
        duration,
      });

      previousTimestamp = timestamp;
    });

    const totalDuration = Date.now() - new Date(caseData.createdAt).getTime();

    // Calculate average time per status
    const averageTimePerStatus: Record<string, number> = {};
    const statusDurations: Record<string, number[]> = {};

    statusHistory.forEach((entry) => {
      if (!statusDurations[entry.status]) {
        statusDurations[entry.status] = [];
      }
      statusDurations[entry.status].push(entry.duration);
    });

    Object.keys(statusDurations).forEach((status) => {
      const durations = statusDurations[status];
      const average = durations.reduce((a, b) => a + b, 0) / durations.length;
      averageTimePerStatus[status] = average;
    });

    return {
      currentStatus: caseData.status,
      statusHistory,
      totalDuration,
      averageTimePerStatus: averageTimePerStatus as Record<CaseStatus, number>,
    };
  }

  /**
   * Bulk transition multiple cases
   */
  async bulkTransition(
    caseIds: string[],
    newStatus: CaseStatus,
    userId?: string,
    userName?: string,
  ): Promise<{ succeeded: string[]; failed: Array<{ caseId: string; reason: string }> }> {
    const succeeded: string[] = [];
    const failed: Array<{ caseId: string; reason: string }> = [];

    for (const caseId of caseIds) {
      try {
        await this.transitionState(caseId, newStatus, userId, userName);
        succeeded.push(caseId);
      } catch (error) {
        failed.push({
          caseId,
          reason: error.message,
        });
      }
    }

    return { succeeded, failed };
  }

  /**
   * Get state machine diagram data for visualization
   */
  getStateMachineDiagram(): {
    nodes: Array<{ id: string; label: string; color: string }>;
    edges: Array<{ from: string; to: string; label: string }>;
  } {
    const nodes = Object.values(CaseStatus).map((status) => ({
      id: status,
      label: status,
      color: this.getStatusColor(status),
    }));

    const edges = this.stateMachine.map((transition) => ({
      from: transition.from,
      to: transition.to,
      label: transition.label,
    }));

    return { nodes, edges };
  }

  private getStatusColor(status: CaseStatus): string {
    const colors = {
      [CaseStatus.OPEN]: '#3b82f6',
      [CaseStatus.ACTIVE]: '#10b981',
      [CaseStatus.DISCOVERY]: '#8b5cf6',
      [CaseStatus.TRIAL]: '#f59e0b',
      [CaseStatus.SETTLED]: '#14b8a6',
      [CaseStatus.CLOSED]: '#6b7280',
      [CaseStatus.ARCHIVED]: '#475569',
      [CaseStatus.ON_HOLD]: '#eab308',
    };
    return colors[status] || '#6b7280';
  }
}
