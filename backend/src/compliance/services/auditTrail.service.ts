import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, LessThanOrEqual } from "typeorm";
import { AuditLog } from "@compliance/entities/audit-log.entity";
import { createHmac } from "crypto";
import { AuditReportQueryDto } from "@compliance/dto/compliance.dto";

export interface IntegrityCheckResult {
  valid: boolean;
  totalEntries: number;
  checkedEntries: number;
  tamperedEntries: string[];
  brokenChains: number;
  lastVerifiedEntry: string | null;
  verificationDate: Date;
}

export interface AuditSearchResult {
  data: AuditLog[];
  total: number;
  page: number;
  limit: number;
  integrityVerified?: boolean;
}

/**
 * ╔=================================================================================================================╗
 * ║AUDITTRAIL                                                                                                       ║
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
export class AuditTrailService {
  private readonly logger = new Logger(AuditTrailService.name);
  private readonly HMAC_SECRET =
    process.env.AUDIT_HMAC_SECRET || "default-secret-change-in-production";
  private readonly CHAIN_ALGORITHM = "sha256";

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>
  ) {}

  async createAuditEntry(data: Partial<AuditLog>): Promise<AuditLog> {
    const previousEntry = await this.getLastAuditEntry();
    const previousHash = previousEntry
      ? this.calculateEntryHash(previousEntry)
      : "0000000000000000000000000000000000000000000000000000000000000000";

    const entry = this.auditLogRepository.create({
      ...data,
      timestamp: data.timestamp || new Date(),
    });

    const entryHash = this.calculateEntryHash(entry, previousHash);

    const existingChanges =
      (entry.changes as Record<string, unknown> | undefined) || {};

    const metadata = {
      ...existingChanges,
      auditChain: {
        previousHash,
        currentHash: entryHash,
        algorithm: this.CHAIN_ALGORITHM,
      },
    };

    entry.changes = metadata;

    const saved = await this.auditLogRepository.save(entry);

    this.logger.debug(`Created audit entry ${saved.id} with hash chain`);

    return saved;
  }

  async getLastAuditEntry(): Promise<AuditLog | null> {
    const entry = await this.auditLogRepository.findOne({
      order: { timestamp: "DESC", createdAt: "DESC" },
    });
    return entry || null;
  }

  private calculateEntryHash(
    entry: Partial<AuditLog>,
    previousHash?: string
  ): string {
    const dataString = JSON.stringify({
      userId: entry.userId,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      timestamp: entry.timestamp?.toISOString(),
      ipAddress: entry.ipAddress,
      method: entry.method,
      endpoint: entry.endpoint,
      statusCode: entry.statusCode,
      result: entry.result,
      previousHash: previousHash || "",
    });

    const hash = createHmac(this.CHAIN_ALGORITHM, this.HMAC_SECRET)
      .update(dataString)
      .digest("hex");

    return hash;
  }

  async verifyAuditTrailIntegrity(
    startDate?: Date,
    endDate?: Date
  ): Promise<IntegrityCheckResult> {
    this.logger.log("Starting audit trail integrity verification");

    const queryBuilder = this.auditLogRepository
      .createQueryBuilder("audit")
      .orderBy("audit.timestamp", "ASC")
      .addOrderBy("audit.createdAt", "ASC");

    if (startDate) {
      queryBuilder.andWhere("audit.timestamp >= :startDate", { startDate });
    }
    if (endDate) {
      queryBuilder.andWhere("audit.timestamp <= :endDate", { endDate });
    }

    const entries = await queryBuilder.getMany();

    if (entries.length === 0) {
      return {
        valid: true,
        totalEntries: 0,
        checkedEntries: 0,
        tamperedEntries: [],
        brokenChains: 0,
        lastVerifiedEntry: null,
        verificationDate: new Date(),
      };
    }

    const tamperedEntries: string[] = [];
    let brokenChains = 0;
    let lastVerifiedEntry: string | null = null;
    let previousHash =
      "0000000000000000000000000000000000000000000000000000000000000000";

    for (const entry of entries) {
      const expectedHash = this.calculateEntryHash(entry, previousHash);
      const storedChanges = entry.changes as Record<string, unknown>;
      const storedChain = storedChanges?.auditChain as
        | { currentHash: string; previousHash: string }
        | undefined;
      const storedHash = storedChain?.currentHash;
      const storedPrevHash = storedChain?.previousHash;

      if (!storedHash || !storedPrevHash) {
        this.logger.warn(`Entry ${entry.id} missing hash chain data`);
        continue;
      }

      if (storedPrevHash !== previousHash) {
        brokenChains++;
        tamperedEntries.push(entry.id);
        this.logger.error(
          `Chain broken at entry ${entry.id}: expected prev ${previousHash}, got ${storedPrevHash}`
        );
      }

      if (storedHash !== expectedHash) {
        tamperedEntries.push(entry.id);
        this.logger.error(
          `Hash mismatch at entry ${entry.id}: expected ${expectedHash}, got ${storedHash}`
        );
      }

      previousHash = storedHash;
      lastVerifiedEntry = entry.id;
    }

    const result: IntegrityCheckResult = {
      valid: tamperedEntries.length === 0 && brokenChains === 0,
      totalEntries: entries.length,
      checkedEntries: entries.length,
      tamperedEntries,
      brokenChains,
      lastVerifiedEntry,
      verificationDate: new Date(),
    };

    if (!result.valid) {
      this.logger.error(
        `Audit trail integrity check FAILED: ${tamperedEntries.length} tampered entries, ${brokenChains} broken chains`
      );

      await this.createAuditEntry({
        userId: "system",
        action: "other",
        entityType: "audit_trail",
        entityId: "integrity_check",
        description: "Audit trail integrity check FAILED",
        result: "failure",
        details: JSON.stringify(result),
      });
    } else {
      this.logger.log("Audit trail integrity check PASSED");
    }

    return result;
  }

  async searchAuditLogs(
    query: AuditReportQueryDto
  ): Promise<AuditSearchResult> {
    const queryBuilder = this.auditLogRepository
      .createQueryBuilder("audit")
      .orderBy("audit.timestamp", "DESC");

    if (query.startDate) {
      queryBuilder.andWhere("audit.timestamp >= :startDate", {
        startDate: new Date(query.startDate),
      });
    }

    if (query.endDate) {
      queryBuilder.andWhere("audit.timestamp <= :endDate", {
        endDate: new Date(query.endDate),
      });
    }

    if (query.userId) {
      queryBuilder.andWhere("audit.userId = :userId", { userId: query.userId });
    }

    if (query.entityType) {
      queryBuilder.andWhere("audit.entityType = :entityType", {
        entityType: query.entityType,
      });
    }

    if (query.action) {
      queryBuilder.andWhere("audit.action = :action", { action: query.action });
    }

    if (query.onlyFailures) {
      queryBuilder.andWhere("audit.result = :result", { result: "failure" });
    }

    if (query.securityEventsOnly) {
      queryBuilder.andWhere("audit.action IN (:...actions)", {
        actions: ["login", "logout", "delete", "export", "access"],
      });
    }

    const page = query.page || 1;
    const limit = query.limit || 100;
    const skip = (page - 1) * limit;

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const result: AuditSearchResult = {
      data,
      total,
      page,
      limit,
    };

    if (query.verifyIntegrity && data.length > 0) {
      const integrityCheck = await this.verifyAuditTrailIntegrity(
        query.startDate ? new Date(query.startDate) : undefined,
        query.endDate ? new Date(query.endDate) : undefined
      );
      result.integrityVerified = integrityCheck.valid;
    }

    return result;
  }

  async exportAuditLogs(
    query: AuditReportQueryDto,
    format: string = "json"
  ): Promise<{ data: unknown; format: string; filename: string }> {
    const searchResult = await this.searchAuditLogs(query);

    const exportData = {
      exportDate: new Date().toISOString(),
      totalRecords: searchResult.total,
      filters: {
        startDate: query.startDate,
        endDate: query.endDate,
        userId: query.userId,
        entityType: query.entityType,
        action: query.action,
      },
      integrityVerified: searchResult.integrityVerified,
      auditLogs: searchResult.data.map((log) => ({
        id: log.id,
        timestamp: log.timestamp,
        userId: log.userId,
        userName: log.userName,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        ipAddress: log.ipAddress,
        method: log.method,
        endpoint: log.endpoint,
        statusCode: log.statusCode,
        result: log.result,
        description: log.description,
        details: log.details,
        duration: log.duration,
      })),
    };

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `audit-logs-${timestamp}.${format}`;

    if (format === "csv") {
      const csv = this.convertToCSV(searchResult.data);
      return { data: csv, format: "csv", filename };
    }

    return { data: exportData, format: "json", filename };
  }

  private convertToCSV(logs: AuditLog[]): string {
    if (logs.length === 0) {
      return "No data";
    }

    const headers = [
      "ID",
      "Timestamp",
      "User ID",
      "User Name",
      "Action",
      "Entity Type",
      "Entity ID",
      "IP Address",
      "Method",
      "Endpoint",
      "Status Code",
      "Result",
      "Description",
      "Duration (ms)",
    ];

    const rows = logs.map((log) => [
      log.id,
      log.timestamp.toISOString(),
      log.userId || "",
      log.userName || "",
      log.action,
      log.entityType,
      log.entityId || "",
      log.ipAddress || "",
      log.method || "",
      log.endpoint || "",
      log.statusCode?.toString() || "",
      log.result,
      (log.description || "").replace(/"/g, '""'),
      log.duration?.toString() || "",
    ]);

    return [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");
  }

  async getAuditStatistics(
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    totalEntries: number;
    byAction: Record<string, number>;
    byEntityType: Record<string, number>;
    byResult: Record<string, number>;
    byUser: Record<string, number>;
    averageDuration: number;
    failureRate: number;
  }> {
    const queryBuilder = this.auditLogRepository.createQueryBuilder("audit");

    if (startDate) {
      queryBuilder.andWhere("audit.timestamp >= :startDate", { startDate });
    }
    if (endDate) {
      queryBuilder.andWhere("audit.timestamp <= :endDate", { endDate });
    }

    const logs = await queryBuilder.getMany();
    const totalEntries = logs.length;

    if (totalEntries === 0) {
      return {
        totalEntries: 0,
        byAction: {},
        byEntityType: {},
        byResult: {},
        byUser: {},
        averageDuration: 0,
        failureRate: 0,
      };
    }

    const byAction: Record<string, number> = {};
    const byEntityType: Record<string, number> = {};
    const byResult: Record<string, number> = {};
    const byUser: Record<string, number> = {};
    let totalDuration = 0;
    let durationCount = 0;
    let failures = 0;

    for (const log of logs) {
      byAction[log.action] = (byAction[log.action] || 0) + 1;
      byEntityType[log.entityType] = (byEntityType[log.entityType] || 0) + 1;
      byResult[log.result] = (byResult[log.result] || 0) + 1;
      if (log.userId) {
        byUser[log.userId] = (byUser[log.userId] || 0) + 1;
      }
      if (log.duration) {
        totalDuration += log.duration;
        durationCount++;
      }
      if (log.result === "failure") {
        failures++;
      }
    }

    return {
      totalEntries,
      byAction,
      byEntityType,
      byResult,
      byUser,
      averageDuration: durationCount > 0 ? totalDuration / durationCount : 0,
      failureRate: (failures / totalEntries) * 100,
    };
  }

  async archiveOldAuditLogs(olderThanDays: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    this.logger.log(
      `Archiving audit logs older than ${cutoffDate.toISOString()}`
    );

    const logsToArchive = await this.auditLogRepository.find({
      where: {
        timestamp: LessThanOrEqual(cutoffDate),
      },
    });

    this.logger.log(`Found ${logsToArchive.length} audit logs to archive`);

    return logsToArchive.length;
  }
}
