import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { CustodianInterview } from './entities/custodian-interview.entity';
import { CreateCustodianInterviewDto } from './dto/create-custodian-interview.dto';
import { UpdateCustodianInterviewDto } from './dto/update-custodian-interview.dto';
import { QueryCustodianInterviewDto } from './dto/query-custodian-interview.dto';
import { validateSortField, validateSortOrder } from '../../common/utils/query-validation.util';

@Injectable()
export class CustodianInterviewsService {
  constructor(
    @InjectRepository(CustodianInterview)
    private readonly interviewRepository: Repository<CustodianInterview>,
  ) {}

  async create(createDto: CreateCustodianInterviewDto): Promise<CustodianInterview> {
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
      sortBy = 'scheduledDate',
      sortOrder = 'DESC',
    } = queryDto;

    const queryBuilder = this.interviewRepository
      .createQueryBuilder('interview')
      .where('interview.deletedAt IS NULL');

    if (caseId) {
      queryBuilder.andWhere('interview.caseId = :caseId', { caseId });
    }

    if (custodianId) {
      queryBuilder.andWhere('interview.custodianId = :custodianId', {
        custodianId,
      });
    }

    if (type) {
      queryBuilder.andWhere('interview.type = :type', { type });
    }

    if (status) {
      queryBuilder.andWhere('interview.status = :status', { status });
    }

    if (conductedBy) {
      queryBuilder.andWhere('interview.conductedBy = :conductedBy', {
        conductedBy,
      });
    }

    if (search) {
      queryBuilder.andWhere(
        '(interview.custodianName ILIKE :search OR interview.summary ILIKE :search OR interview.keyFindings ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // SQL injection protection
    const safeSortField = validateSortField('interview', sortBy);
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
      throw new NotFoundException(`Custodian interview with ID ${id} not found`);
    }

    return interview;
  }

  async update(
    id: string,
    updateDto: UpdateCustodianInterviewDto,
  ): Promise<CustodianInterview> {
    const interview = await this.findOne(id);

    Object.assign(interview, updateDto);
    interview.updatedAt = new Date();

    return await this.interviewRepository.save(interview);
  }

  async remove(id: string): Promise<void> {
    const interview = await this.findOne(id);
    interview.deletedAt = new Date();
    await this.interviewRepository.save(interview);
  }

  async getByCustodian(custodianId: string): Promise<CustodianInterview[]> {
    return await this.interviewRepository.find({
      where: { custodianId, deletedAt: IsNull() },
      order: { scheduledDate: 'DESC' },
    });
  }

  async getStatistics(caseId: string) {
    const interviews = await this.interviewRepository.find({
      where: { caseId, deletedAt: IsNull() },
    });

    const stats = {
      total: interviews.length,
      byType: {},
      byStatus: {},
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

      if (interview.status === 'COMPLETED') {
        stats.completed++;
      } else if (interview.status === 'SCHEDULED') {
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
