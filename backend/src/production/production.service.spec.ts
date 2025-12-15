import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductionService } from './production.service';
import { Production, ProductionStatus } from './entities/production.entity';
import { CreateProductionDto, UpdateProductionDto } from './dto';

describe('ProductionService', () => {
  let service: ProductionService;
  let repository: Repository<Production>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductionService,
        {
          provide: getRepositoryToken(Production),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProductionService>(ProductionService);
    repository = module.get<Repository<Production>>(
      getRepositoryToken(Production),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new production', async () => {
      const createDto: CreateProductionDto = {
        caseId: 'case-123',
        title: 'Production Request 1',
        description: 'Test production',
        requestDate: '2024-01-15',
        dueDate: '2024-02-15',
        status: ProductionStatus.PENDING,
      };

      const mockProduction = {
        id: 'prod-123',
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockReturnValue(mockProduction);
      mockRepository.save.mockResolvedValue(mockProduction);

      const result = await service.create(createDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockProduction);
    });
  });

  describe('findAll', () => {
    it('should return all productions', async () => {
      const mockProductions = [
        { id: 'prod-1', title: 'Production 1' },
        { id: 'prod-2', title: 'Production 2' },
      ];

      mockRepository.find.mockResolvedValue(mockProductions);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(mockProductions);
    });
  });

  describe('findOne', () => {
    it('should return a production if found', async () => {
      const mockProduction = {
        id: 'prod-123',
        title: 'Test Production',
      };

      mockRepository.findOne.mockResolvedValue(mockProduction);

      const result = await service.findOne('prod-123');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'prod-123' },
      });
      expect(result).toEqual(mockProduction);
    });

    it('should throw NotFoundException if production not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow();
    });
  });

  describe('findByCaseId', () => {
    it('should return productions for a case', async () => {
      const mockProductions = [
        { id: 'prod-1', caseId: 'case-123' },
        { id: 'prod-2', caseId: 'case-123' },
      ];

      mockRepository.find.mockResolvedValue(mockProductions);

      const result = await service.findByCaseId('case-123');

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { caseId: 'case-123' },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(mockProductions);
    });
  });

  describe('findByStatus', () => {
    it('should return productions by status', async () => {
      const mockProductions = [
        { id: 'prod-1', status: ProductionStatus.PENDING },
      ];

      mockRepository.find.mockResolvedValue(mockProductions);

      const result = await service.findByStatus(ProductionStatus.PENDING);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { status: ProductionStatus.PENDING },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(mockProductions);
    });
  });
});
