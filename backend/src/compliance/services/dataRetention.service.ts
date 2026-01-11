import {
  CreateRetentionPolicyDto,
  LegalHoldDto,
  RemoveLegalHoldDto,
  RetentionStatusQueryDto,
} from "@compliance/dto/compliance.dto";
import { AuditLog } from "@compliance/entities/audit-log.entity";
import {
  DataRetentionPolicy,
  DataRetentionRecord,
  RetentionAction,
  RetentionPolicyStatus,
} from "@compliance/entities/dataRetention.entity";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { LessThanOrEqual, Repository } from "typeorm";

export interface RetentionStatusResult {
  data: DataRetentionRecord[];
  total: number;
  page: number;
  limit: number;
  summary: {
    totalRecords: number;
    expiringSoon: number;
    onLegalHold: number;
    readyForProcessing: number;
  };
}

interface RetentionExecutionResult {
  totalProcessed: number;
  archived: number;
  deleted: number;
  anonymized: number;
  errors: number;
  details: Array<{
    recordId: string;
    entityType: string;
    entityId: string;
    action: RetentionAction;
    status: "success" | "error";
    error?: string;
  }>;
}

/**
 * ╔=================================================================================================================╗
 * ║DATARETENTION                                                                                                    ║
 * ╠=================================================================================================================╣
 * ║                                                                                                                 ║
 * ║  External Request                   Controller                            Service                                ║
 * ║       │                                   │                                     │                                ║
 * ║       │  HTTP Endpoints                  │                                     │                                ║
 * ║       └───────────────────────────────────►                                     │                                ║
 * ║                                                                                                                 ║
 * ║                                                                 ┌───────────────┴───────────────┐                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          Repository                    Database                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          PostgreSQL                                          ║
 * ║                                                                                                                 ║
 * ║  DATA IN:  Data input                                                                                         ║

 * ║                                                                                                                 ║
 * ║  DATA OUT: Data output                                                                                        ║

 * ║                                                                                                                 ║

 * ╚=================================================================================================================╝
 */

@Injectable()
export class DataRetentionService {
  private readonly logger = new Logger(DataRetentionService.name);

  constructor(
    @InjectRepository(DataRetentionPolicy)
    private readonly policyRepository: Repository<DataRetentionPolicy>,
    @InjectRepository(DataRetentionRecord)
    private readonly recordRepository: Repository<DataRetentionRecord>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>
  ) {}

  async createPolicy(
    dto: CreateRetentionPolicyDto,
    createdBy: string
  ): Promise<DataRetentionPolicy> {
    this.logger.log(`Creating retention policy: ${dto.name}`);

    const policy = this.policyRepository.create({
      name: dto.name,
      description: dto.description,
      entityType: dto.entityType,
      retentionPeriodDays: dto.retentionPeriodDays,
      retentionAction: dto.retentionAction as RetentionAction,
      status: RetentionPolicyStatus.ACTIVE,
      legalBasis: dto.legalBasis,
      jurisdictions: dto.jurisdictions || [],
      conditions: dto.conditions,
      priority: dto.priority || 0,
      effectiveDate: dto.effectiveDate
        ? new Date(dto.effectiveDate)
        : new Date(),
      tags: dto.tags || [],
      createdBy,
    });

    const saved = await this.policyRepository.save(policy);

    await this.auditLogRepository.save({
      userId: createdBy,
      action: "create",
      entityType: "retention_policy",
      entityId: saved.id,
      timestamp: new Date(),
      description: `Created retention policy: ${saved.name}`,
      result: "success",
    } as AuditLog);

    return saved;
  }

  async getPolicy(id: string): Promise<DataRetentionPolicy> {
    const policy = await this.policyRepository.findOne({ where: { id } });
    if (!policy) {
      throw new NotFoundException(`Retention policy with ID ${id} not found`);
    }
    return policy;
  }

  async getAllPolicies(): Promise<DataRetentionPolicy[]> {
    return this.policyRepository.find({
      order: { priority: "DESC", createdAt: "DESC" },
    });
  }

  async getActivePolicies(): Promise<DataRetentionPolicy[]> {
    return this.policyRepository.find({
      where: {
        status: RetentionPolicyStatus.ACTIVE,
      },
      order: { priority: "DESC" },
    });
  }

  async updatePolicy(
    id: string,
    updates: Partial<DataRetentionPolicy>,
    updatedBy: string
  ): Promise<DataRetentionPolicy> {
    const policy = await this.getPolicy(id);

    Object.assign(policy, {
      ...updates,
      updatedBy,
    });

    const saved = await this.policyRepository.save(policy);

    await this.auditLogRepository.save({
      userId: updatedBy,
      action: "update",
      entityType: "retention_policy",
      entityId: saved.id,
      timestamp: new Date(),
      description: `Updated retention policy: ${saved.name}`,
      result: "success",
      changes: updates as Record<string, unknown>,
    } as AuditLog);

    return saved;
  }

  async deactivatePolicy(
    id: string,
    deactivatedBy: string
  ): Promise<DataRetentionPolicy> {
    return this.updatePolicy(
      id,
      { status: RetentionPolicyStatus.INACTIVE },
      deactivatedBy
    );
  }

  async applyRetentionPolicy(
    entityType: string,
    entityId: string,
    createdDate: Date
  ): Promise<DataRetentionRecord | null> {
    const policies = await this.policyRepository.find({
      where: {
        entityType,
        status: RetentionPolicyStatus.ACTIVE,
      },
      order: { priority: "DESC" },
    });

    if (policies.length === 0) {
      this.logger.warn(
        `No active retention policy found for entity type: ${entityType}`
      );
      return null;
    }

    const applicablePolicy = policies[0];

    const existingRecord = await this.recordRepository.findOne({
      where: { entityType, entityId },
    });

    if (existingRecord) {
      this.logger.debug(
        `Retention record already exists for ${entityType}:${entityId}`
      );
      return existingRecord;
    }

    if (!applicablePolicy) {
      throw new Error(
        `No retention policy found for entity type: ${entityType}`
      );
    }

    const retentionExpiresAt = new Date(createdDate);
    retentionExpiresAt.setDate(
      retentionExpiresAt.getDate() + applicablePolicy.retentionPeriodDays
    );

    const record = this.recordRepository.create({
      policyId: applicablePolicy.id,
      entityType,
      entityId,
      retentionExpiresAt,
      scheduledAction: applicablePolicy.retentionAction,
      status: "active",
      legalHold: false,
    });

    const saved = await this.recordRepository.save(record);

    await this.policyRepository.update(
      { id: applicablePolicy.id },
      { entitiesAffected: () => "entities_affected + 1" }
    );

    this.logger.log(
      `Applied retention policy ${applicablePolicy.name} to ${entityType}:${entityId}, expires: ${retentionExpiresAt.toISOString()}`
    );

    return saved;
  }

  async getRetentionStatus(
    query: RetentionStatusQueryDto
  ): Promise<RetentionStatusResult> {
    const queryBuilder = this.recordRepository
      .createQueryBuilder("record")
      .orderBy("record.retentionExpiresAt", "ASC");

    if (query.entityType) {
      queryBuilder.andWhere("record.entityType = :entityType", {
        entityType: query.entityType,
      });
    }

    if (query.status) {
      queryBuilder.andWhere("record.status = :status", {
        status: query.status,
      });
    }

    if (query.legalHoldOnly) {
      queryBuilder.andWhere("record.legalHold = :legalHold", {
        legalHold: true,
      });
    }

    if (query.expiringWithinDays) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + query.expiringWithinDays);
      queryBuilder.andWhere("record.retentionExpiresAt <= :futureDate", {
        futureDate,
      });
      queryBuilder.andWhere("record.status = :status", { status: "active" });
    }

    const page = query.page || 1;
    const limit = query.limit || 100;
    const skip = (page - 1) * limit;

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalRecords = await this.recordRepository.count();
    const expiringSoon = await this.recordRepository.count({
      where: {
        retentionExpiresAt: LessThanOrEqual(
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        ),
        status: "active",
      },
    });
    const onLegalHold = await this.recordRepository.count({
      where: { legalHold: true },
    });
    const readyForProcessing = await this.recordRepository.count({
      where: {
        retentionExpiresAt: LessThanOrEqual(new Date()),
        status: "active",
        legalHold: false,
      },
    });

    return {
      data,
      total,
      page,
      limit,
      summary: {
        totalRecords,
        expiringSoon,
        onLegalHold,
        readyForProcessing,
      },
    };
  }

  async placeLegalHold(
    dto: LegalHoldDto,
    placedBy: string
  ): Promise<DataRetentionRecord> {
    this.logger.log(`Placing legal hold on ${dto.entityType}:${dto.entityId}`);

    let record = await this.recordRepository.findOne({
      where: { entityType: dto.entityType, entityId: dto.entityId },
    });

    if (!record) {
      const applicablePolicies = await this.policyRepository.find({
        where: {
          entityType: dto.entityType,
          status: RetentionPolicyStatus.ACTIVE,
        },
        order: { priority: "DESC" },
      });

      const policy = applicablePolicies[0];
      if (!policy) {
        throw new NotFoundException(
          `No retention policy found for entity type: ${dto.entityType}`
        );
      }

      record = this.recordRepository.create({
        policyId: policy.id,
        entityType: dto.entityType,
        entityId: dto.entityId,
        retentionExpiresAt: new Date(
          Date.now() + policy.retentionPeriodDays * 24 * 60 * 60 * 1000
        ),
        scheduledAction: policy.retentionAction,
        status: "hold",
        legalHold: true,
        legalHoldReason: dto.reason,
        legalHoldBy: placedBy,
        legalHoldAt: new Date(),
        notes: dto.notes,
        metadata: { relatedCaseId: dto.relatedCaseId },
      });
    } else {
      record.legalHold = true;
      record.legalHoldReason = dto.reason;
      record.legalHoldBy = placedBy;
      record.legalHoldAt = new Date();
      record.status = "hold";
      if (dto.notes) {
        record.notes = dto.notes;
      }
      record.metadata = {
        ...record.metadata,
        relatedCaseId: dto.relatedCaseId,
      };
    }

    const saved = await this.recordRepository.save(record);

    await this.auditLogRepository.save({
      userId: placedBy,
      action: "update",
      entityType: "retention_record",
      entityId: saved.id,
      timestamp: new Date(),
      description: `Legal hold placed on ${dto.entityType}:${dto.entityId}`,
      result: "success",
      details: dto.reason,
    } as AuditLog);

    return saved;
  }

  async removeLegalHold(
    dto: RemoveLegalHoldDto,
    removedBy: string
  ): Promise<DataRetentionRecord> {
    this.logger.log(
      `Removing legal hold from retention record: ${dto.retentionRecordId}`
    );

    const record = await this.recordRepository.findOne({
      where: { id: dto.retentionRecordId },
    });

    if (!record) {
      throw new NotFoundException(
        `Retention record with ID ${dto.retentionRecordId} not found`
      );
    }

    if (!record.legalHold) {
      this.logger.warn(
        `Record ${dto.retentionRecordId} does not have a legal hold`
      );
    }

    record.legalHold = false;
    record.status =
      record.retentionExpiresAt < new Date() ? "expired" : "active";
    record.notes = dto.reason
      ? `Legal hold removed: ${dto.reason}`
      : "Legal hold removed";

    const saved = await this.recordRepository.save(record);

    await this.auditLogRepository.save({
      userId: removedBy,
      action: "update",
      entityType: "retention_record",
      entityId: saved.id,
      timestamp: new Date(),
      description: `Legal hold removed from ${record.entityType}:${record.entityId}`,
      result: "success",
      details: dto.reason,
    } as AuditLog);

    return saved;
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async processExpiredRetentions(): Promise<RetentionExecutionResult> {
    this.logger.log("Starting automated retention processing");

    const expiredRecords = await this.recordRepository.find({
      where: {
        retentionExpiresAt: LessThanOrEqual(new Date()),
        status: "active",
        legalHold: false,
      },
      take: 1000,
    });

    this.logger.log(
      `Found ${expiredRecords.length} expired retention records to process`
    );

    const result: RetentionExecutionResult = {
      totalProcessed: 0,
      archived: 0,
      deleted: 0,
      anonymized: 0,
      errors: 0,
      details: [],
    };

    for (const record of expiredRecords) {
      try {
        await this.executeRetentionAction(record);

        result.totalProcessed++;
        switch (record.scheduledAction) {
          case RetentionAction.ARCHIVE:
            result.archived++;
            break;
          case RetentionAction.DELETE:
            result.deleted++;
            break;
          case RetentionAction.ANONYMIZE:
            result.anonymized++;
            break;
        }

        result.details.push({
          recordId: record.id,
          entityType: record.entityType,
          entityId: record.entityId,
          action: record.scheduledAction,
          status: "success",
        });

        record.status = "processed";
        record.processedAt = new Date();
        record.processedBy = "system";
        await this.recordRepository.save(record);
      } catch (error) {
        this.logger.error(
          `Error processing retention record ${record.id}: ${error}`
        );
        result.errors++;
        result.details.push({
          recordId: record.id,
          entityType: record.entityType,
          entityId: record.entityId,
          action: record.scheduledAction,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    this.logger.log(
      `Retention processing completed: ${result.totalProcessed} processed, ${result.errors} errors`
    );

    await this.auditLogRepository.save({
      userId: "system",
      action: "other",
      entityType: "retention_processing",
      entityId: "automated",
      timestamp: new Date(),
      description: "Automated retention processing completed",
      result: result.errors === 0 ? "success" : "warning",
      details: JSON.stringify(result),
    } as AuditLog);

    return result;
  }

  private async executeRetentionAction(
    record: DataRetentionRecord
  ): Promise<void> {
    this.logger.log(
      `Executing ${record.scheduledAction} for ${record.entityType}:${record.entityId}`
    );

    switch (record.scheduledAction) {
      case RetentionAction.ARCHIVE:
        await this.archiveEntity(record.entityType, record.entityId);
        break;
      case RetentionAction.DELETE:
        await this.deleteEntity(record.entityType, record.entityId);
        break;
      case RetentionAction.ANONYMIZE:
        await this.anonymizeEntity(record.entityType, record.entityId);
        break;
      case RetentionAction.RETAIN:
        this.logger.log(
          `Retain action - no operation for ${record.entityType}:${record.entityId}`
        );
        break;
    }
  }

  private async archiveEntity(
    entityType: string,
    entityId: string
  ): Promise<void> {
    this.logger.log(`Archiving ${entityType}:${entityId}`);
  }

  private async deleteEntity(
    entityType: string,
    entityId: string
  ): Promise<void> {
    this.logger.log(`Deleting ${entityType}:${entityId}`);
  }

  private async anonymizeEntity(
    entityType: string,
    entityId: string
  ): Promise<void> {
    this.logger.log(`Anonymizing ${entityType}:${entityId}`);
  }

  async generateRetentionReport(): Promise<{
    generatedAt: Date;
    policies: number;
    activeRecords: number;
    expiringSoon: number;
    onLegalHold: number;
    byEntityType: Record<string, number>;
    byAction: Record<string, number>;
  }> {
    const policies = await this.policyRepository.count({
      where: { status: RetentionPolicyStatus.ACTIVE },
    });

    const activeRecords = await this.recordRepository.count({
      where: { status: "active" },
    });

    const expiringSoon = await this.recordRepository.count({
      where: {
        retentionExpiresAt: LessThanOrEqual(
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        ),
        status: "active",
      },
    });

    const onLegalHold = await this.recordRepository.count({
      where: { legalHold: true },
    });

    const allRecords = await this.recordRepository.find();

    const byEntityType: Record<string, number> = {};
    const byAction: Record<string, number> = {};

    for (const record of allRecords) {
      byEntityType[record.entityType] =
        (byEntityType[record.entityType] || 0) + 1;
      byAction[record.scheduledAction] =
        (byAction[record.scheduledAction] || 0) + 1;
    }

    return {
      generatedAt: new Date(),
      policies,
      activeRecords,
      expiringSoon,
      onLegalHold,
      byEntityType,
      byAction,
    };
  }
}
