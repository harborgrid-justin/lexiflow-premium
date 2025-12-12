import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export enum LegalHoldStatus {
  ACTIVE = 'ACTIVE',
  RELEASED = 'RELEASED',
  PENDING = 'PENDING',
  EXPIRED = 'EXPIRED',
}

export enum LegalHoldType {
  LITIGATION = 'LITIGATION',
  INVESTIGATION = 'INVESTIGATION',
  REGULATORY = 'REGULATORY',
  SUBPOENA = 'SUBPOENA',
  AUDIT = 'AUDIT',
  PRESERVATION_ORDER = 'PRESERVATION_ORDER',
}

export interface LegalHold {
  id: string;
  name: string;
  description: string;
  type: LegalHoldType;
  status: LegalHoldStatus;
  caseNumber?: string;
  jurisdiction: string;
  issuedBy: string;
  issuedDate: Date;
  effectiveDate: Date;
  releaseDate?: Date;
  expirationDate?: Date;
  custodians: string[]; // User IDs of custodians
  scope: LegalHoldScope;
  notifications: LegalHoldNotification[];
  affectedEntities: AffectedEntity[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LegalHoldScope {
  dataTypes: string[]; // Types of data to preserve
  dateRange: {
    start: Date;
    end?: Date;
  };
  keywords: string[]; // Keywords for filtering relevant data
  excludedKeywords?: string[];
  departments?: string[];
  projects?: string[];
  clients?: string[];
  matters?: string[];
}

export interface AffectedEntity {
  entityType: string; // 'document', 'email', 'case', etc.
  entityId: string;
  preservedAt: Date;
  custodian?: string;
  metadata?: Record<string, any>;
}

export interface LegalHoldNotification {
  id: string;
  recipientId: string;
  recipientEmail: string;
  sentAt: Date;
  acknowledgedAt?: Date;
  remindersSent: number;
  lastReminderAt?: Date;
  acknowledgmentToken: string;
}

export interface LegalHoldAcknowledgment {
  holdId: string;
  userId: string;
  acknowledgedAt: Date;
  ipAddress: string;
  userAgent: string;
  attestation: string;
}

export interface LegalHoldReport {
  holdId: string;
  holdName: string;
  status: LegalHoldStatus;
  daysActive: number;
  totalCustodians: number;
  acknowledgedCustodians: number;
  pendingAcknowledgments: number;
  affectedEntitiesCount: number;
  dataPreservedGB: number;
  complianceScore: number;
  issues: string[];
}

@Injectable()
export class LegalHoldService {
  private readonly logger = new Logger(LegalHoldService.name);
  private legalHolds: Map<string, LegalHold> = new Map();
  private acknowledgments: Map<string, LegalHoldAcknowledgment[]> = new Map();

  constructor(
    // @InjectRepository would be used for actual database entities
  ) {}

  /**
   * Create a new legal hold
   */
  async createLegalHold(holdData: Partial<LegalHold>): Promise<LegalHold> {
    const hold: LegalHold = {
      id: holdData.id || `hold-${Date.now()}`,
      name: holdData.name || 'Untitled Legal Hold',
      description: holdData.description || '',
      type: holdData.type || LegalHoldType.LITIGATION,
      status: LegalHoldStatus.PENDING,
      caseNumber: holdData.caseNumber,
      jurisdiction: holdData.jurisdiction || 'US',
      issuedBy: holdData.issuedBy!,
      issuedDate: new Date(),
      effectiveDate: holdData.effectiveDate || new Date(),
      expirationDate: holdData.expirationDate,
      custodians: holdData.custodians || [],
      scope: holdData.scope || {
        dataTypes: [],
        dateRange: { start: new Date() },
        keywords: [],
      },
      notifications: [],
      affectedEntities: [],
      createdBy: holdData.createdBy!,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.legalHolds.set(hold.id, hold);
    this.logger.log(`Created legal hold: ${hold.id} - ${hold.name}`);

    return hold;
  }

  /**
   * Activate a legal hold and send notifications
   */
  async activateLegalHold(holdId: string): Promise<LegalHold> {
    const hold = this.legalHolds.get(holdId);
    if (!hold) {
      throw new Error(`Legal hold not found: ${holdId}`);
    }

    hold.status = LegalHoldStatus.ACTIVE;
    hold.effectiveDate = new Date();
    hold.updatedAt = new Date();

    // Send notifications to all custodians
    for (const custodianId of hold.custodians) {
      await this.sendLegalHoldNotification(hold, custodianId);
    }

    this.legalHolds.set(holdId, hold);
    this.logger.log(`Activated legal hold: ${holdId}`);

    return hold;
  }

  /**
   * Send legal hold notification to custodian
   */
  private async sendLegalHoldNotification(
    hold: LegalHold,
    custodianId: string,
  ): Promise<void> {
    const notification: LegalHoldNotification = {
      id: `notif-${Date.now()}-${custodianId}`,
      recipientId: custodianId,
      recipientEmail: `custodian-${custodianId}@example.com`, // Would lookup from user service
      sentAt: new Date(),
      remindersSent: 0,
      acknowledgmentToken: this.generateAcknowledgmentToken(),
    };

    hold.notifications.push(notification);

    this.logger.log(`Sent legal hold notification to ${custodianId} for hold ${hold.id}`);

    // In production, this would send actual email via email service
  }

  /**
   * Generate secure acknowledgment token
   */
  private generateAcknowledgmentToken(): string {
    return `ack-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Acknowledge legal hold
   */
  async acknowledgeLegalHold(
    holdId: string,
    userId: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<LegalHoldAcknowledgment> {
    const hold = this.legalHolds.get(holdId);
    if (!hold) {
      throw new Error(`Legal hold not found: ${holdId}`);
    }

    // Update notification
    const notification = hold.notifications.find(n => n.recipientId === userId);
    if (notification) {
      notification.acknowledgedAt = new Date();
    }

    // Create acknowledgment record
    const acknowledgment: LegalHoldAcknowledgment = {
      holdId,
      userId,
      acknowledgedAt: new Date(),
      ipAddress,
      userAgent,
      attestation: `I acknowledge receipt of legal hold ${hold.name} and agree to preserve all relevant materials.`,
    };

    const holdAcks = this.acknowledgments.get(holdId) || [];
    holdAcks.push(acknowledgment);
    this.acknowledgments.set(holdId, holdAcks);

    this.logger.log(`Legal hold ${holdId} acknowledged by user ${userId}`);

    return acknowledgment;
  }

  /**
   * Send reminder to custodians who haven't acknowledged
   */
  async sendReminders(holdId: string): Promise<number> {
    const hold = this.legalHolds.get(holdId);
    if (!hold) {
      throw new Error(`Legal hold not found: ${holdId}`);
    }

    let remindersSent = 0;
    const now = new Date();

    for (const notification of hold.notifications) {
      if (!notification.acknowledgedAt) {
        notification.remindersSent++;
        notification.lastReminderAt = now;
        remindersSent++;

        // In production, send actual reminder email
        this.logger.log(
          `Sent reminder ${notification.remindersSent} to ${notification.recipientId} for hold ${holdId}`,
        );
      }
    }

    hold.updatedAt = now;
    this.legalHolds.set(holdId, hold);

    return remindersSent;
  }

  /**
   * Add entity to legal hold preservation
   */
  async preserveEntity(
    holdId: string,
    entityType: string,
    entityId: string,
    custodian?: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    const hold = this.legalHolds.get(holdId);
    if (!hold) {
      throw new Error(`Legal hold not found: ${holdId}`);
    }

    const affectedEntity: AffectedEntity = {
      entityType,
      entityId,
      preservedAt: new Date(),
      custodian,
      metadata,
    };

    hold.affectedEntities.push(affectedEntity);
    hold.updatedAt = new Date();
    this.legalHolds.set(holdId, hold);

    this.logger.log(`Preserved ${entityType}:${entityId} under legal hold ${holdId}`);
  }

  /**
   * Check if entity is under legal hold
   */
  async isEntityUnderHold(entityType: string, entityId: string): Promise<boolean> {
    const activeHolds = Array.from(this.legalHolds.values()).filter(
      h => h.status === LegalHoldStatus.ACTIVE,
    );

    for (const hold of activeHolds) {
      const isPreserved = hold.affectedEntities.some(
        e => e.entityType === entityType && e.entityId === entityId,
      );
      if (isPreserved) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get all legal holds for entity
   */
  async getLegalHoldsForEntity(
    entityType: string,
    entityId: string,
  ): Promise<LegalHold[]> {
    const holds = Array.from(this.legalHolds.values());

    return holds.filter(hold =>
      hold.affectedEntities.some(
        e => e.entityType === entityType && e.entityId === entityId,
      ),
    );
  }

  /**
   * Release legal hold
   */
  async releaseLegalHold(holdId: string, releasedBy: string): Promise<LegalHold> {
    const hold = this.legalHolds.get(holdId);
    if (!hold) {
      throw new Error(`Legal hold not found: ${holdId}`);
    }

    hold.status = LegalHoldStatus.RELEASED;
    hold.releaseDate = new Date();
    hold.updatedAt = new Date();

    this.legalHolds.set(holdId, hold);
    this.logger.log(`Released legal hold ${holdId} by ${releasedBy}`);

    // In production, send release notifications to custodians

    return hold;
  }

  /**
   * Get active legal holds
   */
  async getActiveLegalHolds(): Promise<LegalHold[]> {
    const holds = Array.from(this.legalHolds.values());
    return holds.filter(h => h.status === LegalHoldStatus.ACTIVE);
  }

  /**
   * Get legal holds by custodian
   */
  async getLegalHoldsByCustodian(custodianId: string): Promise<LegalHold[]> {
    const holds = Array.from(this.legalHolds.values());
    return holds.filter(h => h.custodians.includes(custodianId));
  }

  /**
   * Get legal hold by ID
   */
  async getLegalHoldById(holdId: string): Promise<LegalHold | null> {
    return this.legalHolds.get(holdId) || null;
  }

  /**
   * Generate compliance report for legal hold
   */
  async generateLegalHoldReport(holdId: string): Promise<LegalHoldReport> {
    const hold = this.legalHolds.get(holdId);
    if (!hold) {
      throw new Error(`Legal hold not found: ${holdId}`);
    }

    const acknowledgedCustodians = hold.notifications.filter(
      n => n.acknowledgedAt,
    ).length;
    const pendingAcknowledgments = hold.notifications.filter(
      n => !n.acknowledgedAt,
    ).length;

    const daysActive =
      hold.status === LegalHoldStatus.ACTIVE
        ? Math.floor((Date.now() - hold.effectiveDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    // Calculate compliance score
    const acknowledgmentRate =
      hold.custodians.length > 0
        ? (acknowledgedCustodians / hold.custodians.length) * 100
        : 100;

    const issues: string[] = [];
    if (pendingAcknowledgments > 0) {
      issues.push(`${pendingAcknowledgments} custodians have not acknowledged the legal hold`);
    }

    const overdueDays = hold.expirationDate
      ? Math.floor((Date.now() - hold.expirationDate.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    if (overdueDays > 0) {
      issues.push(`Legal hold expired ${overdueDays} days ago`);
    }

    return {
      holdId: hold.id,
      holdName: hold.name,
      status: hold.status,
      daysActive,
      totalCustodians: hold.custodians.length,
      acknowledgedCustodians,
      pendingAcknowledgments,
      affectedEntitiesCount: hold.affectedEntities.length,
      dataPreservedGB: 0, // Would calculate based on entity sizes
      complianceScore: Math.round(acknowledgmentRate),
      issues,
    };
  }

  /**
   * Search legal holds
   */
  async searchLegalHolds(criteria: {
    status?: LegalHoldStatus;
    type?: LegalHoldType;
    custodian?: string;
    caseNumber?: string;
    dateRange?: { start: Date; end: Date };
  }): Promise<LegalHold[]> {
    let holds = Array.from(this.legalHolds.values());

    if (criteria.status) {
      holds = holds.filter(h => h.status === criteria.status);
    }

    if (criteria.type) {
      holds = holds.filter(h => h.type === criteria.type);
    }

    if (criteria.custodian) {
      holds = holds.filter(h => h.custodians.includes(criteria.custodian!));
    }

    if (criteria.caseNumber) {
      holds = holds.filter(h => h.caseNumber === criteria.caseNumber);
    }

    if (criteria.dateRange) {
      holds = holds.filter(
        h =>
          h.effectiveDate >= criteria.dateRange!.start &&
          h.effectiveDate <= criteria.dateRange!.end,
      );
    }

    return holds;
  }

  /**
   * Add custodian to existing legal hold
   */
  async addCustodian(holdId: string, custodianId: string): Promise<void> {
    const hold = this.legalHolds.get(holdId);
    if (!hold) {
      throw new Error(`Legal hold not found: ${holdId}`);
    }

    if (!hold.custodians.includes(custodianId)) {
      hold.custodians.push(custodianId);
      hold.updatedAt = new Date();

      if (hold.status === LegalHoldStatus.ACTIVE) {
        await this.sendLegalHoldNotification(hold, custodianId);
      }

      this.legalHolds.set(holdId, hold);
      this.logger.log(`Added custodian ${custodianId} to legal hold ${holdId}`);
    }
  }

  /**
   * Remove custodian from legal hold
   */
  async removeCustodian(holdId: string, custodianId: string): Promise<void> {
    const hold = this.legalHolds.get(holdId);
    if (!hold) {
      throw new Error(`Legal hold not found: ${holdId}`);
    }

    hold.custodians = hold.custodians.filter(id => id !== custodianId);
    hold.notifications = hold.notifications.filter(n => n.recipientId !== custodianId);
    hold.updatedAt = new Date();

    this.legalHolds.set(holdId, hold);
    this.logger.log(`Removed custodian ${custodianId} from legal hold ${holdId}`);
  }

  /**
   * Update legal hold scope
   */
  async updateScope(holdId: string, scope: Partial<LegalHoldScope>): Promise<LegalHold> {
    const hold = this.legalHolds.get(holdId);
    if (!hold) {
      throw new Error(`Legal hold not found: ${holdId}`);
    }

    hold.scope = {
      ...hold.scope,
      ...scope,
    };
    hold.updatedAt = new Date();

    this.legalHolds.set(holdId, hold);
    this.logger.log(`Updated scope for legal hold ${holdId}`);

    return hold;
  }
}
