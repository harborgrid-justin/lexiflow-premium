import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApprovalChain, ApprovalStatus, ApprovalType, Approver } from './entities/approval-chain.entity';
import { NotificationRulesService } from './notification-rules.service';

export interface CreateApprovalChainDto {
  entityType: string;
  entityId: string;
  tenantId: string;
  name: string;
  description?: string;
  approvalType: ApprovalType;
  approvers: Array<{
    userId: string;
    userName: string;
    role?: string;
    order: number;
    required: boolean;
  }>;
  requestedBy: string;
  requestReason?: string;
  deadline?: Date;
  autoApproveTimeoutHours?: number;
  workflowExecutionId?: string;
}

export interface ApprovalDecisionDto {
  approverId: string;
  approved: boolean;
  comments?: string;
  delegatedTo?: string;
}

/**
 * ApprovalChainService
 * Manages approval workflows and chains
 */
@Injectable()
export class ApprovalChainService {
  private readonly logger = new Logger(ApprovalChainService.name);

  constructor(
    @InjectRepository(ApprovalChain)
    private readonly approvalRepo: Repository<ApprovalChain>,
    private readonly notificationService: NotificationRulesService,
  ) {}

  /**
   * Create a new approval chain
   */
  async createApprovalChain(dto: CreateApprovalChainDto): Promise<ApprovalChain> {
    this.logger.log(`Creating approval chain: ${dto.name}`);

    // Validate approvers
    if (!dto.approvers || dto.approvers.length === 0) {
      throw new BadRequestException('At least one approver is required');
    }

    // Calculate required approvals based on type
    const requiredApprovals = this.calculateRequiredApprovals(dto.approvalType, dto.approvers);

    // Format approvers
    const approvers: Approver[] = dto.approvers.map((a) => ({
      userId: a.userId,
      userName: a.userName,
      role: a.role,
      order: a.order,
      required: a.required,
      status: 'pending',
    }));

    // Sort approvers by order
    approvers.sort((a, b) => a.order - b.order);

    const approvalChain = this.approvalRepo.create({
      entityType: dto.entityType,
      entityId: dto.entityId,
      tenantId: dto.tenantId,
      name: dto.name,
      description: dto.description,
      approvalType: dto.approvalType,
      approvers,
      currentStep: 0,
      status: ApprovalStatus.PENDING,
      requiredApprovals,
      receivedApprovals: 0,
      rejectionCount: 0,
      requestedBy: dto.requestedBy,
      requestReason: dto.requestReason,
      deadline: dto.deadline,
      autoApproveTimeoutHours: dto.autoApproveTimeoutHours,
      workflowExecutionId: dto.workflowExecutionId,
      startedAt: new Date(),
    });

    const saved = await this.approvalRepo.save(approvalChain);

    // Notify approvers
    await this.notifyApprovers(saved);

    return saved;
  }

  /**
   * Submit approval decision
   */
  async submitDecision(chainId: string, decision: ApprovalDecisionDto): Promise<ApprovalChain> {
    const chain = await this.approvalRepo.findOne({ where: { id: chainId } });

    if (!chain) {
      throw new NotFoundException(`Approval chain ${chainId} not found`);
    }

    if (chain.status !== ApprovalStatus.PENDING && chain.status !== ApprovalStatus.IN_REVIEW) {
      throw new BadRequestException(`Approval chain is already ${chain.status}`);
    }

    // Find approver
    const approverIndex = chain.approvers.findIndex((a) => a.userId === decision.approverId);

    if (approverIndex === -1) {
      throw new BadRequestException('User is not an approver in this chain');
    }

    const approver = chain.approvers[approverIndex];

    if (approver.status !== 'pending') {
      throw new BadRequestException(`Approver has already ${approver.status}`);
    }

    // Handle delegation
    if (decision.delegatedTo) {
      approver.delegatedTo = decision.delegatedTo;
      // In a real implementation, you'd add the delegated user to the approvers list
    }

    // Update approver status
    if (decision.approved) {
      approver.status = 'approved';
      approver.approvedAt = new Date();
      chain.receivedApprovals += 1;
    } else {
      approver.status = 'rejected';
      approver.rejectedAt = new Date();
      chain.rejectionCount += 1;
    }

    approver.comments = decision.comments;

    chain.status = ApprovalStatus.IN_REVIEW;

    // Check if approval chain is complete
    await this.checkApprovalCompletion(chain);

    await this.approvalRepo.save(chain);

    // Send notifications
    await this.notificationService.sendNotification({
      tenantId: chain.tenantId,
      userId: chain.requestedBy,
      title: decision.approved ? 'Approval Granted' : 'Approval Rejected',
      message: `${approver.userName} has ${decision.approved ? 'approved' : 'rejected'} ${chain.name}`,
      type: decision.approved ? 'success' : 'warning',
    });

    return chain;
  }

  /**
   * Check if approval chain is complete
   */
  private async checkApprovalCompletion(chain: ApprovalChain): Promise<void> {
    const { approvalType, approvers, requiredApprovals, receivedApprovals, rejectionCount } = chain;

    // Check for rejection
    if (rejectionCount > 0) {
      if (approvalType === ApprovalType.UNANIMOUS) {
        chain.status = ApprovalStatus.REJECTED;
        chain.completedAt = new Date();
        chain.decisionReason = 'Unanimous approval required - at least one rejection received';
        if (chain.notifyOnRejection) {
          await this.notifyRejection(chain);
        }
        return;
      }
    }

    // Check for approval
    switch (approvalType) {
      case ApprovalType.SEQUENTIAL:
        // In sequential, check if current approver approved
        const currentApprover = approvers[chain.currentStep];
        if (currentApprover?.status === 'approved') {
          chain.currentStep += 1;

          // Check if we've reached the end
          if (chain.currentStep >= approvers.length) {
            chain.status = ApprovalStatus.APPROVED;
            chain.completedAt = new Date();
            chain.decisionReason = 'All approvers approved sequentially';
            if (chain.notifyOnApproval) {
              await this.notifyApproval(chain);
            }
          } else {
            // Notify next approver
            await this.notifyNextApprover(chain);
          }
        } else if (currentApprover?.status === 'rejected') {
          chain.status = ApprovalStatus.REJECTED;
          chain.completedAt = new Date();
          chain.decisionReason = 'Sequential approval rejected';
          if (chain.notifyOnRejection) {
            await this.notifyRejection(chain);
          }
        }
        break;

      case ApprovalType.PARALLEL:
      case ApprovalType.UNANIMOUS:
        const allApprovers = approvers.length;
        const completed = approvers.filter((a) => a.status !== 'pending').length;

        if (approvalType === ApprovalType.UNANIMOUS) {
          if (receivedApprovals === allApprovers) {
            chain.status = ApprovalStatus.APPROVED;
            chain.completedAt = new Date();
            chain.decisionReason = 'Unanimous approval received';
            if (chain.notifyOnApproval) {
              await this.notifyApproval(chain);
            }
          } else if (rejectionCount > 0) {
            chain.status = ApprovalStatus.REJECTED;
            chain.completedAt = new Date();
            chain.decisionReason = 'Unanimous approval required - rejection received';
            if (chain.notifyOnRejection) {
              await this.notifyRejection(chain);
            }
          }
        } else {
          // Parallel - check if we've received enough approvals
          if (receivedApprovals >= requiredApprovals) {
            chain.status = ApprovalStatus.APPROVED;
            chain.completedAt = new Date();
            chain.decisionReason = `Received ${receivedApprovals} of ${requiredApprovals} required approvals`;
            if (chain.notifyOnApproval) {
              await this.notifyApproval(chain);
            }
          } else if (completed === allApprovers && receivedApprovals < requiredApprovals) {
            chain.status = ApprovalStatus.REJECTED;
            chain.completedAt = new Date();
            chain.decisionReason = `Insufficient approvals: ${receivedApprovals} of ${requiredApprovals}`;
            if (chain.notifyOnRejection) {
              await this.notifyRejection(chain);
            }
          }
        }
        break;

      case ApprovalType.MAJORITY:
        const total = approvers.length;
        const completed_majority = approvers.filter((a) => a.status !== 'pending').length;

        if (receivedApprovals > total / 2) {
          chain.status = ApprovalStatus.APPROVED;
          chain.completedAt = new Date();
          chain.decisionReason = `Majority approval: ${receivedApprovals} of ${total}`;
          if (chain.notifyOnApproval) {
            await this.notifyApproval(chain);
          }
        } else if (rejectionCount > total / 2) {
          chain.status = ApprovalStatus.REJECTED;
          chain.completedAt = new Date();
          chain.decisionReason = `Majority rejection: ${rejectionCount} of ${total}`;
          if (chain.notifyOnRejection) {
            await this.notifyRejection(chain);
          }
        } else if (completed_majority === total) {
          // All voted but no majority - reject
          chain.status = ApprovalStatus.REJECTED;
          chain.completedAt = new Date();
          chain.decisionReason = 'No majority reached';
          if (chain.notifyOnRejection) {
            await this.notifyRejection(chain);
          }
        }
        break;
    }
  }

  /**
   * Cancel approval chain
   */
  async cancelApprovalChain(chainId: string, reason?: string): Promise<void> {
    const chain = await this.approvalRepo.findOne({ where: { id: chainId } });

    if (!chain) {
      throw new NotFoundException(`Approval chain ${chainId} not found`);
    }

    chain.status = ApprovalStatus.CANCELLED;
    chain.completedAt = new Date();
    chain.decisionReason = reason || 'Cancelled by user';

    await this.approvalRepo.save(chain);
  }

  /**
   * Get approval chain
   */
  async getApprovalChain(chainId: string): Promise<ApprovalChain | null> {
    return this.approvalRepo.findOne({ where: { id: chainId } });
  }

  /**
   * List approval chains for entity
   */
  async listApprovalChains(
    entityType: string,
    entityId: string,
    tenantId: string,
  ): Promise<ApprovalChain[]> {
    return this.approvalRepo.find({
      where: { entityType, entityId, tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get pending approvals for user
   */
  async getPendingApprovalsForUser(userId: string, tenantId: string): Promise<ApprovalChain[]> {
    const chains = await this.approvalRepo
      .createQueryBuilder('chain')
      .where('chain.tenantId = :tenantId', { tenantId })
      .andWhere('chain.status IN (:...statuses)', { statuses: [ApprovalStatus.PENDING, ApprovalStatus.IN_REVIEW] })
      .getMany();

    // Filter chains where user is a pending approver
    return chains.filter((chain) => {
      return chain.approvers.some((a) => a.userId === userId && a.status === 'pending');
    });
  }

  /**
   * Calculate required approvals based on type
   */
  private calculateRequiredApprovals(type: ApprovalType, approvers: any[]): number {
    switch (type) {
      case ApprovalType.SEQUENTIAL:
        return approvers.length;
      case ApprovalType.UNANIMOUS:
        return approvers.length;
      case ApprovalType.MAJORITY:
        return Math.floor(approvers.length / 2) + 1;
      case ApprovalType.PARALLEL:
        return approvers.filter((a) => a.required).length || 1;
      default:
        return 1;
    }
  }

  /**
   * Notify approvers
   */
  private async notifyApprovers(chain: ApprovalChain): Promise<void> {
    if (chain.approvalType === ApprovalType.SEQUENTIAL) {
      // Notify only first approver
      const firstApprover = chain.approvers[0];
      if (firstApprover) {
        await this.notificationService.sendNotification({
          tenantId: chain.tenantId,
          userId: firstApprover.userId,
          title: 'Approval Required',
          message: `You have been requested to approve: ${chain.name}`,
          type: 'info',
        });
      }
    } else {
      // Notify all approvers
      for (const approver of chain.approvers) {
        await this.notificationService.sendNotification({
          tenantId: chain.tenantId,
          userId: approver.userId,
          title: 'Approval Required',
          message: `You have been requested to approve: ${chain.name}`,
          type: 'info',
        });
      }
    }
  }

  /**
   * Notify next approver in sequential chain
   */
  private async notifyNextApprover(chain: ApprovalChain): Promise<void> {
    const nextApprover = chain.approvers[chain.currentStep];
    if (nextApprover) {
      await this.notificationService.sendNotification({
        tenantId: chain.tenantId,
        userId: nextApprover.userId,
        title: 'Approval Required',
        message: `You have been requested to approve: ${chain.name}`,
        type: 'info',
      });
    }
  }

  /**
   * Notify approval completion
   */
  private async notifyApproval(chain: ApprovalChain): Promise<void> {
    await this.notificationService.sendNotification({
      tenantId: chain.tenantId,
      userId: chain.requestedBy,
      title: 'Approval Granted',
      message: `${chain.name} has been approved`,
      type: 'success',
    });
  }

  /**
   * Notify rejection
   */
  private async notifyRejection(chain: ApprovalChain): Promise<void> {
    await this.notificationService.sendNotification({
      tenantId: chain.tenantId,
      userId: chain.requestedBy,
      title: 'Approval Rejected',
      message: `${chain.name} has been rejected`,
      type: 'error',
    });

    // Escalate if configured
    if (chain.escalateTo) {
      await this.notificationService.sendNotification({
        tenantId: chain.tenantId,
        userId: chain.escalateTo,
        title: 'Approval Rejected - Escalation',
        message: `${chain.name} has been rejected and requires your attention`,
        type: 'warning',
      });
    }
  }

  /**
   * Check for deadline violations and auto-approve if configured
   */
  async checkDeadlines(): Promise<void> {
    const chains = await this.approvalRepo
      .createQueryBuilder('chain')
      .where('chain.status IN (:...statuses)', { statuses: [ApprovalStatus.PENDING, ApprovalStatus.IN_REVIEW] })
      .andWhere('chain.deadline < :now', { now: new Date() })
      .getMany();

    for (const chain of chains) {
      if (chain.autoApproveTimeoutHours && chain.startedAt) {
        const hoursSinceStart = (Date.now() - chain.startedAt.getTime()) / (1000 * 60 * 60);

        if (hoursSinceStart >= chain.autoApproveTimeoutHours) {
          // Auto-approve
          chain.status = ApprovalStatus.APPROVED;
          chain.completedAt = new Date();
          chain.decisionReason = `Auto-approved after ${chain.autoApproveTimeoutHours} hours`;
          await this.approvalRepo.save(chain);

          await this.notificationService.sendNotification({
            tenantId: chain.tenantId,
            userId: chain.requestedBy,
            title: 'Approval Auto-Approved',
            message: `${chain.name} was automatically approved due to timeout`,
            type: 'info',
          });
        }
      } else if (chain.escalateTo) {
        // Escalate
        await this.notificationService.sendNotification({
          tenantId: chain.tenantId,
          userId: chain.escalateTo,
          title: 'Approval Deadline Missed',
          message: `${chain.name} has missed its deadline and requires your attention`,
          type: 'warning',
        });
      }
    }
  }
}
