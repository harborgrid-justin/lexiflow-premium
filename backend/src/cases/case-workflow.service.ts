import { Injectable, BadRequestException } from '@nestjs/common';
import { CaseStatus } from './entities/case.entity';

export interface WorkflowTransition {
  from: CaseStatus;
  to: CaseStatus;
  condition?: (caseData: any) => boolean;
  beforeTransition?: (caseData: any) => Promise<void>;
  afterTransition?: (caseData: any) => Promise<void>;
}

@Injectable()
export class CaseWorkflowService {
  private readonly transitions: WorkflowTransition[] = [
    // Initial state transitions
    { from: CaseStatus.OPEN, to: CaseStatus.ACTIVE },
    { from: CaseStatus.OPEN, to: CaseStatus.ON_HOLD },
    { from: CaseStatus.OPEN, to: CaseStatus.CLOSED },

    // Active case transitions
    { from: CaseStatus.ACTIVE, to: CaseStatus.DISCOVERY },
    { from: CaseStatus.ACTIVE, to: CaseStatus.ON_HOLD },
    { from: CaseStatus.ACTIVE, to: CaseStatus.SETTLED },
    { from: CaseStatus.ACTIVE, to: CaseStatus.CLOSED },

    // Discovery transitions
    { from: CaseStatus.DISCOVERY, to: CaseStatus.TRIAL },
    { from: CaseStatus.DISCOVERY, to: CaseStatus.ON_HOLD },
    { from: CaseStatus.DISCOVERY, to: CaseStatus.SETTLED },
    { from: CaseStatus.DISCOVERY, to: CaseStatus.CLOSED },

    // Trial transitions
    { from: CaseStatus.TRIAL, to: CaseStatus.SETTLED },
    { from: CaseStatus.TRIAL, to: CaseStatus.CLOSED },
    { from: CaseStatus.TRIAL, to: CaseStatus.ON_HOLD },

    // On-hold recovery
    { from: CaseStatus.ON_HOLD, to: CaseStatus.OPEN },
    { from: CaseStatus.ON_HOLD, to: CaseStatus.ACTIVE },
    { from: CaseStatus.ON_HOLD, to: CaseStatus.DISCOVERY },
    { from: CaseStatus.ON_HOLD, to: CaseStatus.TRIAL },
    { from: CaseStatus.ON_HOLD, to: CaseStatus.CLOSED },

    // Settlement/Closure
    { from: CaseStatus.SETTLED, to: CaseStatus.CLOSED },
    { from: CaseStatus.SETTLED, to: CaseStatus.ARCHIVED },

    // Archival
    { from: CaseStatus.CLOSED, to: CaseStatus.ARCHIVED },
    { from: CaseStatus.ARCHIVED, to: CaseStatus.CLOSED }, // Unarchive
  ];

  /**
   * Validates if a status transition is allowed
   */
  async validateTransition(
    currentStatus: CaseStatus,
    newStatus: CaseStatus,
    caseData?: any,
  ): Promise<{ valid: boolean; reason?: string }> {
    // Same status is always allowed
    if (currentStatus === newStatus) {
      return { valid: true };
    }

    // Find matching transition
    const transition = this.transitions.find(
      (t) => t.from === currentStatus && t.to === newStatus,
    );

    if (!transition) {
      return {
        valid: false,
        reason: `Invalid transition from ${currentStatus} to ${newStatus}`,
      };
    }

    // Check condition if exists
    if (transition.condition && caseData) {
      const conditionMet = transition.condition(caseData);
      if (!conditionMet) {
        return {
          valid: false,
          reason: `Transition conditions not met for ${currentStatus} to ${newStatus}`,
        };
      }
    }

    return { valid: true };
  }

  /**
   * Execute workflow transition with hooks
   */
  async executeTransition(
    currentStatus: CaseStatus,
    newStatus: CaseStatus,
    caseData?: any,
  ): Promise<void> {
    const validation = await this.validateTransition(currentStatus, newStatus, caseData);

    if (!validation.valid) {
      throw new BadRequestException(validation.reason);
    }

    const transition = this.transitions.find(
      (t) => t.from === currentStatus && t.to === newStatus,
    );

    // Execute before transition hook
    if (transition?.beforeTransition && caseData) {
      await transition.beforeTransition(caseData);
    }

    // Status will be updated in the calling service

    // Execute after transition hook
    if (transition?.afterTransition && caseData) {
      await transition.afterTransition(caseData);
    }
  }

  /**
   * Get available next statuses for current status
   */
  getAvailableTransitions(currentStatus: CaseStatus): CaseStatus[] {
    return this.transitions
      .filter((t) => t.from === currentStatus)
      .map((t) => t.to);
  }

  /**
   * Get workflow state metadata
   */
  getWorkflowMetadata(status: CaseStatus): {
    label: string;
    color: string;
    icon: string;
    description: string;
  } {
    const metadata = {
      [CaseStatus.OPEN]: {
        label: 'Open',
        color: 'blue',
        icon: 'folder-open',
        description: 'Case has been created and is awaiting initial review',
      },
      [CaseStatus.ACTIVE]: {
        label: 'Active',
        color: 'green',
        icon: 'play-circle',
        description: 'Case is actively being worked on',
      },
      [CaseStatus.DISCOVERY]: {
        label: 'Discovery',
        color: 'purple',
        icon: 'search',
        description: 'Case is in discovery phase',
      },
      [CaseStatus.TRIAL]: {
        label: 'Trial',
        color: 'orange',
        icon: 'gavel',
        description: 'Case is in trial proceedings',
      },
      [CaseStatus.SETTLED]: {
        label: 'Settled',
        color: 'teal',
        icon: 'handshake',
        description: 'Case has been settled',
      },
      [CaseStatus.CLOSED]: {
        label: 'Closed',
        color: 'gray',
        icon: 'folder',
        description: 'Case has been closed',
      },
      [CaseStatus.ARCHIVED]: {
        label: 'Archived',
        color: 'slate',
        icon: 'archive',
        description: 'Case has been archived',
      },
      [CaseStatus.ON_HOLD]: {
        label: 'On Hold',
        color: 'yellow',
        icon: 'pause-circle',
        description: 'Case is temporarily on hold',
      },
    };

    return metadata[status];
  }
}
