import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CasesService } from './cases.service';
import { Case, CaseStatus, CaseType } from './entities/case.entity';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';
import { CaseFilterDto } from './dto/case-filter.dto';

describe('CasesService', () => {
  let service: CasesService;
  let repository: Repository<Case>;

  const mockCase: Partial<Case> = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Test Case',
    caseNumber: 'CASE-001',
    description: 'Test description',
    type: CaseType.CIVIL,
    status: CaseStatus.ACTIVE,
    practiceArea: 'Litigation',
    jurisdiction: 'Federal',
    court: 'District Court',
    judge: 'Judge Smith',
    filingDate: new Date('2024-01-15'),
    trialDate: new Date('2024-06-15'),
    closeDate: null,
    assignedTeamId: 'team-001',
    leadAttorneyId: 'attorney-001',
    metadata: {},
    isArchived: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockQueryBuilder = {
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[mockCase], 1]),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
  };

  const mockRepository = {
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CasesService,
        {
          provide: getRepositoryToken(Case),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CasesService>(CasesService);
    repository = module.get<Repository<Case>>(getRepositoryToken(Case));

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated cases', async () => {
      const filterDto: CaseFilterDto = { page: 1, limit: 20 };

      const result = await service.findAll(filterDto);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total', 1);
      expect(result).toHaveProperty('page', 1);
      expect(result).toHaveProperty('limit', 20);
      expect(result).toHaveProperty('totalPages', 1);
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('case');
    });

    it('should apply search filter', async () => {
      const filterDto: CaseFilterDto = { search: 'test', page: 1, limit: 20 };

      await service.findAll(filterDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(case.title ILIKE :search OR case.caseNumber ILIKE :search OR case.description ILIKE :search)',
        { search: '%test%' },
      );
    });

    it('should apply status filter', async () => {
      const filterDto: CaseFilterDto = { status: CaseStatus.ACTIVE, page: 1, limit: 20 };

      await service.findAll(filterDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'case.status = :status',
        { status: CaseStatus.ACTIVE },
      );
    });

    it('should apply type filter', async () => {
      const filterDto: CaseFilterDto = { type: CaseType.CIVIL, page: 1, limit: 20 };

      await service.findAll(filterDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'case.type = :type',
        { type: CaseType.CIVIL },
      );
    });

    it('should apply practice area filter', async () => {
      const filterDto: CaseFilterDto = { practiceArea: 'Litigation', page: 1, limit: 20 };

      await service.findAll(filterDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'case.practiceArea = :practiceArea',
        { practiceArea: 'Litigation' },
      );
    });

    it('should apply jurisdiction filter', async () => {
      const filterDto: CaseFilterDto = { jurisdiction: 'Federal', page: 1, limit: 20 };

      await service.findAll(filterDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'case.jurisdiction = :jurisdiction',
        { jurisdiction: 'Federal' },
      );
    });

    it('should apply isArchived filter', async () => {
      const filterDto: CaseFilterDto = { isArchived: false, page: 1, limit: 20 };

      await service.findAll(filterDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'case.isArchived = :isArchived',
        { isArchived: false },
      );
    });

    it('should apply sorting', async () => {
      const filterDto: CaseFilterDto = {
        page: 1,
        limit: 20,
        sortBy: 'title',
        sortOrder: 'ASC',
      };

      await service.findAll(filterDto);

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('case.title', 'ASC');
    });

    it('should apply pagination', async () => {
      const filterDto: CaseFilterDto = { page: 2, limit: 10 };

      await service.findAll(filterDto);

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
    });
  });

  describe('findOne', () => {
    it('should return a case by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockCase);

      const result = await service.findOne(mockCase.id);

      expect(result).toHaveProperty('id', mockCase.id);
      expect(result).toHaveProperty('title', mockCase.title);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockCase.id },
      });
    });

    it('should throw NotFoundException if case not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    const createCaseDto: CreateCaseDto = {
      title: 'New Case',
      caseNumber: 'CASE-002',
      description: 'New case description',
      type: CaseType.CRIMINAL,
      status: CaseStatus.OPEN,
      practiceArea: 'Criminal Defense',
      jurisdiction: 'State',
    };

    it('should create a new case', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue({ ...mockCase, ...createCaseDto });
      mockRepository.save.mockResolvedValue({ ...mockCase, ...createCaseDto });

      const result = await service.create(createCaseDto);

      expect(result).toHaveProperty('title', createCaseDto.title);
      expect(mockRepository.create).toHaveBeenCalledWith(createCaseDto);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if case number already exists', async () => {
      mockRepository.findOne.mockResolvedValue(mockCase);

      await expect(
        service.create({ ...createCaseDto, caseNumber: mockCase.caseNumber }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    const updateCaseDto: UpdateCaseDto = {
      title: 'Updated Title',
      status: CaseStatus.CLOSED,
    };

    it('should update a case', async () => {
      mockRepository.findOne
        .mockResolvedValueOnce(mockCase) // First call for findOne in update
        .mockResolvedValueOnce({ ...mockCase, ...updateCaseDto }); // Second call for return
      mockRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.update(mockCase.id, updateCaseDto);

      expect(mockRepository.update).toHaveBeenCalledWith(mockCase.id, updateCaseDto);
    });

    it('should throw NotFoundException if case not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', updateCaseDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if updating to existing case number', async () => {
      const existingCase = { ...mockCase, caseNumber: 'EXISTING-001' };
      mockRepository.findOne
        .mockResolvedValueOnce(mockCase) // First call - original case
        .mockResolvedValueOnce(existingCase); // Second call - duplicate check

      await expect(
        service.update(mockCase.id, { caseNumber: 'EXISTING-001' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should soft delete a case', async () => {
      mockRepository.findOne.mockResolvedValue(mockCase);
      mockRepository.softDelete.mockResolvedValue({ affected: 1 });

      await service.remove(mockCase.id);

      expect(mockRepository.softDelete).toHaveBeenCalledWith(mockCase.id);
    });

    it('should throw NotFoundException if case not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('archive', () => {
    it('should archive a case', async () => {
      mockRepository.findOne
        .mockResolvedValueOnce(mockCase)
        .mockResolvedValueOnce({ ...mockCase, isArchived: true });
      mockRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.archive(mockCase.id);

      expect(mockRepository.update).toHaveBeenCalledWith(mockCase.id, {
        isArchived: true,
      });
    });

    it('should throw NotFoundException if case not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.archive('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
