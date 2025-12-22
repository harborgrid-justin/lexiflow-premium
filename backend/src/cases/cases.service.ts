import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository} from 'typeorm';
import { Case } from './entities/case.entity';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';
import { CaseFilterDto } from './dto/case-filter.dto';
import { PaginatedCaseResponseDto, CaseResponseDto } from './dto/case-response.dto';
import { TransactionManagerService } from '../common/services/transaction-manager.service';
import { validateSortField, validateSortOrder } from '../common/utils/query-validation.util';

@Injectable()
export class CasesService {
  constructor(
    @InjectRepository(Case)
    private readonly caseRepository: Repository<Case>,
    private transactionManager: TransactionManagerService,
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
    const caseEntity = await this.findOne(id);

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

    await this.caseRepository.update(id, { ...updateCaseDto });
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const _caseEntity = await this.findOne(id);
    await this.caseRepository.softDelete(id);
  }

  async archive(id: string): Promise<CaseResponseDto> {
    const _caseEntity = await this.findOne(id);
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
