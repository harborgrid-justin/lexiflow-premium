import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull } from "typeorm";
import { PrivilegeLogEntry } from "./entities/privilege-log-entry.entity";
import { CreatePrivilegeLogEntryDto } from "./dto/create-privilege-log-entry.dto";
import { UpdatePrivilegeLogEntryDto } from "./dto/update-privilege-log-entry.dto";
import { QueryPrivilegeLogEntryDto } from "./dto/query-privilege-log-entry.dto";
import {
  validateSortField,
  validateSortOrder,
} from "@common/utils/query-validation.util";

/**
 * ╔=================================================================================================================╗
 * ║PRIVILEGELOG                                                                                                     ║
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
export class PrivilegeLogService {
  constructor(
    @InjectRepository(PrivilegeLogEntry)
    private readonly privilegeLogRepository: Repository<PrivilegeLogEntry>
  ) {}

  async create(
    createDto: CreatePrivilegeLogEntryDto
  ): Promise<PrivilegeLogEntry> {
    const entry = this.privilegeLogRepository.create(createDto);
    return await this.privilegeLogRepository.save(entry);
  }

  async findAll(queryDto: QueryPrivilegeLogEntryDto) {
    const {
      caseId,
      privilegeType,
      status,
      custodianId,
      reviewedBy,
      search,
      page = 1,
      limit = 20,
      sortBy = "documentDate",
      sortOrder = "DESC",
    } = queryDto;

    const queryBuilder = this.privilegeLogRepository
      .createQueryBuilder("privilegeLog")
      .where("privilegeLog.deletedAt IS NULL");

    if (caseId) {
      queryBuilder.andWhere("privilegeLog.caseId = :caseId", { caseId });
    }

    if (privilegeType) {
      queryBuilder.andWhere("privilegeLog.privilegeType = :privilegeType", {
        privilegeType,
      });
    }

    if (status) {
      queryBuilder.andWhere("privilegeLog.status = :status", { status });
    }

    if (custodianId) {
      queryBuilder.andWhere("privilegeLog.custodianId = :custodianId", {
        custodianId,
      });
    }

    if (reviewedBy) {
      queryBuilder.andWhere("privilegeLog.reviewedBy = :reviewedBy", {
        reviewedBy,
      });
    }

    if (search) {
      queryBuilder.andWhere(
        "(privilegeLog.description ILIKE :search OR privilegeLog.author ILIKE :search OR privilegeLog.privilegeLogNumber ILIKE :search OR privilegeLog.batesNumber ILIKE :search)",
        { search: `%${search}%` }
      );
    }

    // SQL injection protection
    const safeSortField = validateSortField("privilegeLog", sortBy);
    const safeSortOrder = validateSortOrder(sortOrder);
    queryBuilder.orderBy(`privilegeLog.${safeSortField}`, safeSortOrder);

    const [items, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<PrivilegeLogEntry> {
    const entry = await this.privilegeLogRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!entry) {
      throw new NotFoundException(
        `Privilege log entry with ID ${id} not found`
      );
    }

    return entry;
  }

  async update(
    id: string,
    updateDto: UpdatePrivilegeLogEntryDto
  ): Promise<PrivilegeLogEntry> {
    const result = await this.privilegeLogRepository
      .createQueryBuilder()
      .update(PrivilegeLogEntry)
      .set({
        ...updateDto,
        updatedAt: new Date(),
      } as unknown as PrivilegeLogEntry)
      .where("id = :id", { id })
      .andWhere("deletedAt IS NULL")
      .returning("*")
      .execute();

    if (!result.affected) {
      throw new NotFoundException(
        `Privilege log entry with ID ${id} not found`
      );
    }
    const rows = result.raw as PrivilegeLogEntry[];
    return rows[0];
  }

  async remove(id: string): Promise<void> {
    const result = await this.privilegeLogRepository
      .createQueryBuilder()
      .softDelete()
      .where("id = :id", { id })
      .andWhere("deletedAt IS NULL")
      .execute();

    if (!result.affected) {
      throw new NotFoundException(
        `Privilege log entry with ID ${id} not found`
      );
    }
  }

  async getStatistics(caseId: string) {
    const entries = await this.privilegeLogRepository.find({
      where: { caseId, deletedAt: IsNull() },
    });

    const stats = {
      total: entries.length,
      byPrivilegeType: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      challenged: 0,
      redacted: 0,
      totalPages: 0,
    };

    entries.forEach((entry) => {
      stats.byPrivilegeType[entry.privilegeType] =
        (stats.byPrivilegeType[entry.privilegeType] || 0) + 1;
      stats.byStatus[entry.status] = (stats.byStatus[entry.status] || 0) + 1;

      if (entry.dateChallenged) {
        stats.challenged++;
      }

      if (entry.isRedacted) {
        stats.redacted++;
      }

      if (entry.pageCount) {
        stats.totalPages += entry.pageCount;
      }
    });

    return stats;
  }

  async exportLog(caseId: string): Promise<PrivilegeLogEntry[]> {
    return await this.privilegeLogRepository.find({
      where: { caseId, deletedAt: IsNull() },
      order: { privilegeLogNumber: "ASC" },
    });
  }
}
