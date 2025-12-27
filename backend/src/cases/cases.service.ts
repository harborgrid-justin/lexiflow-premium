import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository} from 'typeorm';
import { Case, CaseStatus } from './entities/case.entity';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';
import { CaseFilterDto } from './dto/case-filter.dto';
import { PaginatedCaseResponseDto, CaseResponseDto } from './dto/case-response.dto';
import { CaseStatsDto } from './dto/case-stats.dto';

import { validateSortField, validateSortOrder } from '../common/utils/query-validation.util';

@Injectable()
export class CasesService {
  constructor(
    @InjectRepository(Case)
    private readonly caseRepository: Repository<Case>,
  ) {}

  async getStats(): Promise<CaseStatsDto> {
    const totalActive = await this.caseRepository.count({ 
      where: { status: CaseStatus.ACTIVE },
      cache: 60000 // 1 minute cache
    });
    
    const intakePipeline = await this.caseRepository.count({ 
        where: [
            { status: CaseStatus.OPEN },
            { status: CaseStatus.PENDING }
        ]
    });

    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const now = new Date();

    const upcomingDeadlines = await this.caseRepository
        .createQueryBuilder('case')
        .where('case.trialDate BETWEEN :now AND :sevenDaysFromNow', { now, sevenDaysFromNow })
        .getCount();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const atRisk = await this.caseRepository
        .createQueryBuilder('case')
        .where('case.status = :status', { status: CaseStatus.ACTIVE })
        .andWhere('case.updatedAt < :thirtyDaysAgo', { thirtyDaysAgo })
        .getCount();

    const totalValue = 0; 
    const utilizationRate = 0; 

    const { avgAge } = await this.caseRepository
        .createQueryBuilder('case')
        .select('AVG(EXTRACT(EPOCH FROM (NOW() - case.createdAt)) / 86400)', 'avgAge')
        .where('case.status = :status', { status: CaseStatus.ACTIVE })
        .getRawOne();

    const conversionRate = 0;

    return {
      totalActive,
      intakePipeline,
      upcomingDeadlines,
      atRisk,
      totalValue,
      utilizationRate,
      averageAge: Math.round(parseFloat(avgAge) || 0),
      conversionRate
    };
  }

  /**
   * Get case metrics using efficient database aggregation
   * PERFORMANCE: Uses COUNT and GROUP BY instead of loading all records
   * This is critical for enterprise scale - O(1) memory usage
   */
  async getCaseMetrics(): Promise<{
    totalCases: number;
    activeCases: number;
    closedCases: number;
    pendingCases: number;
    byType: Array<{ type: string; count: number }>;
    byStatus: Array<{ status: string; count: number }>;
  }> {
    // Get total count
    const totalCases = await this.caseRepository.count({
      cache: 30000, // 30 second cache for performance
    });

    // Get counts by status using database aggregation
    const statusCounts = await this.caseRepository
      .createQueryBuilder('case')
      .select('case.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('case.status')
      .cache(30000)
      .getRawMany();

    // Get counts by type using database aggregation
    const typeCounts = await this.caseRepository
      .createQueryBuilder('case')
      .select('case.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('case.type')
      .cache(30000)
      .getRawMany();

    // Calculate specific status counts from aggregated data
    let activeCases = 0;
    let closedCases = 0;
    let pendingCases = 0;

    for (const row of statusCounts) {
      const count = parseInt(row.count, 10);
      switch (row.status) {
        case CaseStatus.ACTIVE:
          activeCases = count;
          break;
        case CaseStatus.CLOSED:
        case CaseStatus.CLOSED_LOWER:
          closedCases += count;
          break;
        case CaseStatus.PENDING:
          pendingCases = count;
          break;
      }
    }

    return {
      totalCases,
      activeCases,
      closedCases,
      pendingCases,
      byType: typeCounts.map((row) => ({
        type: row.type || 'Unknown',
        count: parseInt(row.count, 10),
      })),
      byStatus: statusCounts.map((row) => ({
        status: row.status || 'Unknown',
        count: parseInt(row.count, 10),
      })),
    };
  }

  async findAll(filterDto: CaseFilterDto): Promise<PaginatedCaseResponseDto> {
    const {
      search,
      status,
      type,
      practiceArea,
      assignedTeamId,
      leadAttorneyId,
      jurisdiction,
      isArchived,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      includeParties,
      includeTeam,
      includePhases,
    } = filterDto;

    const queryBuilder = this.caseRepository.createQueryBuilder('case');

    // Full-text search on title, caseNumber, and description
    if (search) {
      queryBuilder.andWhere(
        '(case.title ILIKE :search OR case.caseNumber ILIKE :search OR case.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Filter by status
    if (status) {
      queryBuilder.andWhere('case.status = :status', { status });
    }

    // Filter by type
    if (type) {
      queryBuilder.andWhere('case.type = :type', { type });
    }

    // Filter by practice area
    if (practiceArea) {
      queryBuilder.andWhere('case.practiceArea = :practiceArea', { practiceArea });
    }

    // Filter by assigned team
    if (assignedTeamId) {
      queryBuilder.andWhere('case.assignedTeamId = :assignedTeamId', { assignedTeamId });
    }

    // Filter by lead attorney
    if (leadAttorneyId) {
      queryBuilder.andWhere('case.leadAttorneyId = :leadAttorneyId', { leadAttorneyId });
    }

    // Filter by jurisdiction
    if (jurisdiction) {
      queryBuilder.andWhere('case.jurisdiction = :jurisdiction', { jurisdiction });
    }

    // Filter by archived status
    if (isArchived !== undefined) {
      queryBuilder.andWhere('case.isArchived = :isArchived', { isArchived });
    }

    // Include related entities - eagerly load to prevent N+1 queries
    if (includeParties) {
      queryBuilder.leftJoinAndSelect('case.parties', 'parties');
    }

    if (includeTeam) {
      queryBuilder.leftJoinAndSelect('case.team', 'team');
    }

    if (includePhases) {
      queryBuilder.leftJoinAndSelect('case.phases', 'phases');
    }

    // Sorting - SQL injection protection
    const safeSortField = validateSortField('case', sortBy);
    const safeSortOrder = validateSortOrder(sortOrder);
    queryBuilder.orderBy(`case.${safeSortField}`, safeSortOrder);

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data: data.map((c) => this.toCaseResponse(c)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<CaseResponseDto> {
    const caseEntity = await this.caseRepository.findOne({
      where: { id },
    });

    if (!caseEntity) {
      throw new NotFoundException(`Case with ID ${id} not found`);
    }

    return this.toCaseResponse(caseEntity);
  }

  async create(createCaseDto: CreateCaseDto): Promise<CaseResponseDto> {
    // Check if case number already exists
    const existingCase = await this.caseRepository.findOne({
      where: { caseNumber: createCaseDto.caseNumber },
    });

    if (existingCase) {
      throw new ConflictException(
        `Case with number ${createCaseDto.caseNumber} already exists`,
      );
    }

    const caseEntity = this.caseRepository.create(createCaseDto);
    const savedCase = await this.caseRepository.save(caseEntity);

    return this.toCaseResponse(savedCase);
  }

  async update(id: string, updateCaseDto: UpdateCaseDto): Promise<CaseResponseDto> {
    // If updating case number, check for duplicates
    if (updateCaseDto.caseNumber) {
      const existingCase = await this.caseRepository.findOne({
        where: { caseNumber: updateCaseDto.caseNumber },
      });

      if (existingCase && existingCase.id !== id) {
        throw new ConflictException(
          `Case with number ${updateCaseDto.caseNumber} already exists`,
        );
      }
    }

    const { metadata, ...restDto } = updateCaseDto;
    const result = await this.caseRepository
      .createQueryBuilder()
      .update(Case)
      .set({
        ...restDto,
        ...(metadata ? { metadata: JSON.stringify(metadata) as any } : {})
      } as any)
      .where('id = :id', { id })
      .returning('*')
      .execute();

    if (!result.affected || result.affected === 0) {
      throw new NotFoundException(`Case with ID ${id} not found`);
    }

    return this.toCaseResponse(result.raw[0]);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.caseRepository.softDelete(id);
  }

  async archive(id: string): Promise<CaseResponseDto> {
    await this.findOne(id);
    await this.caseRepository.update(id, { isArchived: true });
    return this.findOne(id);
  }

  async findArchived(filterDto: CaseFilterDto): Promise<PaginatedCaseResponseDto> {
    // Force isArchived filter and add status filters for closed cases
    const archivedFilter = {
      ...filterDto,
      isArchived: true,
    };
    
    // If no status specified, default to closed/settled cases
    if (!archivedFilter.status) {
      const queryBuilder = this.caseRepository.createQueryBuilder('case');
      
      queryBuilder.where('case.isArchived = :isArchived', { isArchived: true });
      queryBuilder.orWhere('case.status IN (:...statuses)', { 
        statuses: ['Closed', 'closed', 'Settled', 'Archived', 'archived'] 
      });

      const { page = 1, limit = 20, sortBy = 'closeDate', sortOrder = 'DESC' } = filterDto;
      const skip = (page - 1) * limit;

      const safeSortField = validateSortField('case', sortBy);
      const safeSortOrder = validateSortOrder(sortOrder);
      queryBuilder.orderBy(`case.${safeSortField}`, safeSortOrder);
      queryBuilder.skip(skip).take(limit);

      const [data, total] = await queryBuilder.getManyAndCount();

      return {
        data: data.map((c) => ({
          ...this.toCaseResponse(c),
          date: c.closeDate || c.filingDate,
          outcome: c.status,
        })),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }

    return this.findAll(archivedFilter);
  }

  private toCaseResponse(caseEntity: Case): CaseResponseDto {
    return {
      id: caseEntity.id,
      title: caseEntity.title,
      caseNumber: caseEntity.caseNumber,
      description: caseEntity.description,
      type: caseEntity.type,
      status: caseEntity.status,
      practiceArea: caseEntity.practiceArea,
      jurisdiction: caseEntity.jurisdiction,
      court: caseEntity.court,
      judge: caseEntity.judge,
      filingDate: caseEntity.filingDate,
      trialDate: caseEntity.trialDate,
      closeDate: caseEntity.closeDate,
      assignedTeamId: caseEntity.assignedTeamId,
      leadAttorneyId: caseEntity.leadAttorneyId,
      metadata: caseEntity.metadata,
      isArchived: caseEntity.isArchived,
      createdAt: caseEntity.createdAt,
      updatedAt: caseEntity.updatedAt,
      deletedAt: caseEntity.deletedAt,
    };
  }
}
