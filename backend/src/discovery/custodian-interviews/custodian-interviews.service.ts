import {
  validateSortField,
  validateSortOrder,
} from "@common/utils/query-validation.util";
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Repository } from "typeorm";
import { CreateCustodianInterviewDto } from "./dto/create-custodian-interview.dto";
import { QueryCustodianInterviewDto } from "./dto/query-custodian-interview.dto";
import { UpdateCustodianInterviewDto } from "./dto/update-custodian-interview.dto";
import { CustodianInterview } from "./entities/custodian-interview.entity";

/**
 * ╔=================================================================================================================╗
 * ║CUSTODIANINTERVIEWS                                                                                              ║
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
export class CustodianInterviewsService {
  constructor(
    @InjectRepository(CustodianInterview)
    private readonly interviewRepository: Repository<CustodianInterview>
  ) {}

  async create(
    createDto: CreateCustodianInterviewDto
  ): Promise<CustodianInterview> {
    const interview = this.interviewRepository.create(createDto);
    return await this.interviewRepository.save(interview);
  }

  async findAll(queryDto: QueryCustodianInterviewDto) {
    const {
      caseId,
      custodianId,
      type,
      status,
      conductedBy,
      search,
      page = 1,
      limit = 20,
      sortBy = "scheduledDate",
      sortOrder = "DESC",
    } = queryDto;

    const queryBuilder = this.interviewRepository
      .createQueryBuilder("interview")
      .where("interview.deletedAt IS NULL");

    if (caseId) {
      queryBuilder.andWhere("interview.caseId = :caseId", { caseId });
    }

    if (custodianId) {
      queryBuilder.andWhere("interview.custodianId = :custodianId", {
        custodianId,
      });
    }

    if (type) {
      queryBuilder.andWhere("interview.type = :type", { type });
    }

    if (status) {
      queryBuilder.andWhere("interview.status = :status", { status });
    }

    if (conductedBy) {
      queryBuilder.andWhere("interview.conductedBy = :conductedBy", {
        conductedBy,
      });
    }

    if (search) {
      queryBuilder.andWhere(
        "(interview.custodianName ILIKE :search OR interview.summary ILIKE :search OR interview.keyFindings ILIKE :search)",
        { search: `%${search}%` }
      );
    }

    // SQL injection protection
    const safeSortField = validateSortField("interview", sortBy);
    const safeSortOrder = validateSortOrder(sortOrder);
    queryBuilder.orderBy(`interview.${safeSortField}`, safeSortOrder);

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

  async findOne(id: string): Promise<CustodianInterview> {
    const interview = await this.interviewRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!interview) {
      throw new NotFoundException(
        `Custodian interview with ID ${id} not found`
      );
    }

    return interview;
  }

  async update(
    id: string,
    updateDto: UpdateCustodianInterviewDto
  ): Promise<CustodianInterview> {
    const result = await this.interviewRepository
      .createQueryBuilder()
      .update(CustodianInterview)
      .set({
        ...updateDto,
        updatedAt: new Date(),
      } as unknown as CustodianInterview)
      .where("id = :id", { id })
      .andWhere("deletedAt IS NULL")
      .returning("*")
      .execute();

    if (!result.affected || result.affected === 0) {
      throw new NotFoundException(
        `Custodian interview with ID ${id} not found`
      );
    }

    const rows = result.raw as CustodianInterview[];
    return rows[0] as CustodianInterview;
  }

  async remove(id: string): Promise<void> {
    const result = await this.interviewRepository
      .createQueryBuilder()
      .softDelete()
      .where("id = :id", { id })
      .andWhere("deletedAt IS NULL")
      .execute();

    if (!result.affected || result.affected === 0) {
      throw new NotFoundException(
        `Custodian interview with ID ${id} not found`
      );
    }
  }

  async getByCustodian(custodianId: string): Promise<CustodianInterview[]> {
    return await this.interviewRepository.find({
      where: { custodianId, deletedAt: IsNull() },
      order: { scheduledDate: "DESC" },
    });
  }

  async getStatistics(caseId: string) {
    const interviews = await this.interviewRepository.find({
      where: { caseId, deletedAt: IsNull() },
    });

    const stats = {
      total: interviews.length,
      byType: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      completed: 0,
      scheduled: 0,
      recorded: 0,
      transcribed: 0,
      followUpActionsCount: 0,
    };

    interviews.forEach((interview) => {
      stats.byType[interview.type] = (stats.byType[interview.type] || 0) + 1;
      stats.byStatus[interview.status] =
        (stats.byStatus[interview.status] || 0) + 1;

      if (interview.status === "COMPLETED") {
        stats.completed++;
      } else if (interview.status === "SCHEDULED") {
        stats.scheduled++;
      }

      if (interview.isRecorded) {
        stats.recorded++;
      }

      if (interview.isTranscribed) {
        stats.transcribed++;
      }

      if (interview.followUpActions) {
        stats.followUpActionsCount += interview.followUpActions.length;
      }
    });

    return stats;
  }
}
