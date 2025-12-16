import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Examination } from './entities/examination.entity';
import { CreateExaminationDto } from './dto/create-examination.dto';
import { UpdateExaminationDto } from './dto/update-examination.dto';
import { QueryExaminationDto } from './dto/query-examination.dto';
import { validateSortField, validateSortOrder } from '../../../common/utils/query-validation.util';

@Injectable()
export class ExaminationsService {
  constructor(
    @InjectRepository(Examination)
    private readonly examinationRepository: Repository<Examination>,
  ) {}

  async create(createDto: CreateExaminationDto): Promise<Examination> {
    const examination = this.examinationRepository.create(createDto);
    return await this.examinationRepository.save(examination);
  }

  async findAll(queryDto: QueryExaminationDto) {
    const {
      caseId,
      type,
      status,
      assignedAttorney,
      search,
      page = 1,
      limit = 20,
      sortBy = 'scheduledDate',
      sortOrder = 'DESC',
    } = queryDto;

    const queryBuilder = this.examinationRepository
      .createQueryBuilder('examination')
      .where('examination.deletedAt IS NULL');

    if (caseId) {
      queryBuilder.andWhere('examination.caseId = :caseId', { caseId });
    }

    if (type) {
      queryBuilder.andWhere('examination.type = :type', { type });
    }

    if (status) {
      queryBuilder.andWhere('examination.status = :status', { status });
    }

    if (assignedAttorney) {
      queryBuilder.andWhere('examination.assignedAttorney = :assignedAttorney', {
        assignedAttorney,
      });
    }

    if (search) {
      queryBuilder.andWhere(
        '(examination.examinationTitle ILIKE :search OR examination.examinee ILIKE :search OR examination.examiner ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // SQL injection protection
    const safeSortField = validateSortField('examination', sortBy);
    const safeSortOrder = validateSortOrder(sortOrder);
    queryBuilder.orderBy(`examination.${safeSortField}`, safeSortOrder);

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

  async findOne(id: string): Promise<Examination> {
    const examination = await this.examinationRepository.findOne({
      where: { id, deletedAt: null },
    });

    if (!examination) {
      throw new NotFoundException(`Examination with ID ${id} not found`);
    }

    return examination;
  }

  async update(
    id: string,
    updateDto: UpdateExaminationDto,
  ): Promise<Examination> {
    const examination = await this.findOne(id);

    Object.assign(examination, updateDto);
    examination.updatedAt = new Date();

    return await this.examinationRepository.save(examination);
  }

  async remove(id: string): Promise<void> {
    const examination = await this.findOne(id);
    examination.deletedAt = new Date();
    await this.examinationRepository.save(examination);
  }

  async getStatistics(caseId: string) {
    const examinations = await this.examinationRepository.find({
      where: { caseId, deletedAt: null },
    });

    const stats = {
      total: examinations.length,
      byType: {},
      byStatus: {},
      totalCost: 0,
      reportsReceived: 0,
      reportsPending: 0,
      upcoming: 0,
    };

    const now = new Date();

    examinations.forEach((exam) => {
      stats.byType[exam.type] = (stats.byType[exam.type] || 0) + 1;
      stats.byStatus[exam.status] = (stats.byStatus[exam.status] || 0) + 1;

      if (exam.actualCost) {
        stats.totalCost += Number(exam.actualCost);
      }

      if (exam.isReportReceived) {
        stats.reportsReceived++;
      } else if (exam.completedDate) {
        stats.reportsPending++;
      }

      if (exam.scheduledDate && new Date(exam.scheduledDate) > now) {
        stats.upcoming++;
      }
    });

    return stats;
  }
}
