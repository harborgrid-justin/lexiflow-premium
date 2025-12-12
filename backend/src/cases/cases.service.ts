import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { Case, CaseStatus } from './entities/case.entity';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';
import { CaseFilterDto } from './dto/case-filter.dto';
import { PaginatedCaseResponseDto, CaseResponseDto } from './dto/case-response.dto';
import { CaseWorkflowService } from './case-workflow.service';
import { CaseTimelineService } from './case-timeline.service';
import { TimelineEventType } from './entities/case-timeline.entity';

@Injectable()
export class CasesService {
  constructor(
    @InjectRepository(Case)
    private readonly caseRepository: Repository<Case>,
    private readonly workflowService: CaseWorkflowService,
    private readonly timelineService: CaseTimelineService,
  ) {}

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

    // Include related entities
    if (includeParties) {
      // queryBuilder.leftJoinAndSelect('case.parties', 'parties');
    }

    if (includeTeam) {
      // queryBuilder.leftJoinAndSelect('case.team', 'team');
    }

    if (includePhases) {
      // queryBuilder.leftJoinAndSelect('case.phases', 'phases');
    }

    // Sorting
    queryBuilder.orderBy(`case.${sortBy}`, sortOrder);

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

  async create(createCaseDto: CreateCaseDto, userId?: string, userName?: string): Promise<CaseResponseDto> {
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

    // Log case creation in timeline
    await this.timelineService.create({
      caseId: savedCase.id,
      eventType: TimelineEventType.CASE_CREATED,
      title: 'Case Created',
      description: `Case ${savedCase.caseNumber} - ${savedCase.title} was created`,
      userId,
      userName,
      metadata: {
        caseNumber: savedCase.caseNumber,
        title: savedCase.title,
        type: savedCase.type,
      },
    });

    return this.toCaseResponse(savedCase);
  }

  async update(id: string, updateCaseDto: UpdateCaseDto, userId?: string, userName?: string): Promise<CaseResponseDto> {
    const caseEntity = await this.caseRepository.findOne({ where: { id } });

    if (!caseEntity) {
      throw new NotFoundException(`Case with ID ${id} not found`);
    }

    // If updating case number, check for duplicates
    if (updateCaseDto.caseNumber && updateCaseDto.caseNumber !== caseEntity.caseNumber) {
      const existingCase = await this.caseRepository.findOne({
        where: { caseNumber: updateCaseDto.caseNumber },
      });

      if (existingCase) {
        throw new ConflictException(
          `Case with number ${updateCaseDto.caseNumber} already exists`,
        );
      }
    }

    // Track changes for timeline
    const changes: Array<{ field: string; oldValue: any; newValue: any }> = [];

    if (updateCaseDto.status && updateCaseDto.status !== caseEntity.status) {
      // Validate workflow transition
      await this.workflowService.validateTransition(
        caseEntity.status,
        updateCaseDto.status as CaseStatus,
      );

      changes.push({
        field: 'status',
        oldValue: caseEntity.status,
        newValue: updateCaseDto.status,
      });

      // Log status change
      await this.timelineService.logStatusChange(
        id,
        caseEntity.status,
        updateCaseDto.status,
        userId,
        userName,
      );
    }

    // Track other significant field changes
    const significantFields = ['title', 'leadAttorneyId', 'assignedTeamId', 'trialDate'];
    significantFields.forEach((field) => {
      if (updateCaseDto[field] !== undefined && updateCaseDto[field] !== caseEntity[field]) {
        changes.push({
          field,
          oldValue: caseEntity[field],
          newValue: updateCaseDto[field],
        });
      }
    });

    // Log general update if there are other changes
    if (changes.length > 0 && !changes.some(c => c.field === 'status')) {
      await this.timelineService.create({
        caseId: id,
        eventType: TimelineEventType.CASE_UPDATED,
        title: 'Case Updated',
        description: `Case details were updated`,
        userId,
        userName,
        changes,
      });
    }

    await this.caseRepository.update(id, updateCaseDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const caseEntity = await this.findOne(id);
    await this.caseRepository.softDelete(id);
  }

  async archive(id: string): Promise<CaseResponseDto> {
    const caseEntity = await this.findOne(id);
    await this.caseRepository.update(id, { isArchived: true });
    return this.findOne(id);
  }

  /**
   * Get case timeline events
   */
  async getTimeline(caseId: string, options?: {
    eventType?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }) {
    return this.timelineService.findByCaseId(caseId, options as any);
  }

  /**
   * Get available workflow transitions for a case
   */
  async getAvailableTransitions(id: string): Promise<CaseStatus[]> {
    const caseEntity = await this.findOne(id);
    return this.workflowService.getAvailableTransitions(caseEntity.status as CaseStatus);
  }

  /**
   * Get workflow metadata for a case status
   */
  getWorkflowMetadata(status: CaseStatus) {
    return this.workflowService.getWorkflowMetadata(status);
  }

  /**
   * Get case statistics including timeline activity
   */
  async getStatistics(id: string) {
    await this.findOne(id); // Ensure case exists
    return this.timelineService.getStatistics(id);
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
