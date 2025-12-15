import { Test, TestingModule } from '@nestjs/testing';
import { CasesController } from './cases.controller';
import { CasesService } from './cases.service';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';
import { CaseFilterDto } from './dto/case-filter.dto';
import { CaseStatus, CaseType } from './entities/case.entity';

describe('CasesController', () => {
  let controller: CasesController;
  let service: CasesService;

  const mockCaseResponse = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Test Case',
    caseNumber: 'CASE-001',
    description: 'Test description',
    type: 'Civil',
    status: 'Active',
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

  const mockPaginatedResponse = {
    data: [mockCaseResponse],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  const mockCasesService = {
    findAll: jest.fn().mockResolvedValue(mockPaginatedResponse),
    findOne: jest.fn().mockResolvedValue(mockCaseResponse),
    create: jest.fn().mockResolvedValue(mockCaseResponse),
    update: jest.fn().mockResolvedValue(mockCaseResponse),
    remove: jest.fn().mockResolvedValue(undefined),
    archive: jest.fn().mockResolvedValue({ ...mockCaseResponse, isArchived: true }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CasesController],
      providers: [
        {
          provide: CasesService,
          useValue: mockCasesService,
        },
      ],
    }).compile();

    controller = module.get<CasesController>(CasesController);
    service = module.get<CasesService>(CasesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated cases', async () => {
      const filterDto: CaseFilterDto = { page: 1, limit: 20 };

      const result = await controller.findAll(filterDto);

      expect(result).toEqual(mockPaginatedResponse);
      expect(service.findAll).toHaveBeenCalledWith(filterDto);
    });

    it('should pass filter parameters to service', async () => {
      const filterDto: CaseFilterDto = {
        search: 'test',
        status: CaseStatus.ACTIVE,
        type: CaseType.CIVIL,
        page: 1,
        limit: 10,
      };

      await controller.findAll(filterDto);

      expect(service.findAll).toHaveBeenCalledWith(filterDto);
    });
  });

  describe('findOne', () => {
    it('should return a case by id', async () => {
      const result = await controller.findOne(mockCaseResponse.id);

      expect(result).toEqual(mockCaseResponse);
      expect(service.findOne).toHaveBeenCalledWith(mockCaseResponse.id);
    });
  });

  describe('create', () => {
    it('should create a new case', async () => {
      const createCaseDto: CreateCaseDto = {
        title: 'New Case',
        caseNumber: 'CASE-002',
        description: 'New case description',
        type: CaseType.CRIMINAL,
        status: CaseStatus.OPEN,
        practiceArea: 'Criminal Defense',
        jurisdiction: 'State',
      };

      const result = await controller.create(createCaseDto);

      expect(result).toEqual(mockCaseResponse);
      expect(service.create).toHaveBeenCalledWith(createCaseDto);
    });
  });

  describe('update', () => {
    it('should update a case', async () => {
      const updateCaseDto: UpdateCaseDto = {
        title: 'Updated Title',
        status: CaseStatus.CLOSED,
      };

      const result = await controller.update(mockCaseResponse.id, updateCaseDto);

      expect(result).toEqual(mockCaseResponse);
      expect(service.update).toHaveBeenCalledWith(mockCaseResponse.id, updateCaseDto);
    });
  });

  describe('remove', () => {
    it('should delete a case', async () => {
      await controller.remove(mockCaseResponse.id);

      expect(service.remove).toHaveBeenCalledWith(mockCaseResponse.id);
    });
  });

  describe('archive', () => {
    it('should archive a case', async () => {
      const result = await controller.archive(mockCaseResponse.id);

      expect(result.isArchived).toBe(true);
      expect(service.archive).toHaveBeenCalledWith(mockCaseResponse.id);
    });
  });
});
