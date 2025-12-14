import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { PleadingsService } from './pleadings.service';
import { Pleading } from './entities/pleading.entity';

describe('PleadingsService', () => {
  let service: PleadingsService;
  let repository: Repository<Pleading>;

  const mockPleading = {
    id: 'pleading-001',
    caseId: 'case-001',
    title: 'Motion to Dismiss',
    type: 'Motion',
    status: 'draft',
    content: 'Motion content...',
    filedBy: 'Defendant',
    filedDate: null,
    dueDate: new Date('2024-02-15'),
    hearingDate: new Date('2024-03-01'),
    documentId: 'doc-001',
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PleadingsService,
        { provide: getRepositoryToken(Pleading), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<PleadingsService>(PleadingsService);
    repository = module.get<Repository<Pleading>>(getRepositoryToken(Pleading));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all pleadings', async () => {
      mockRepository.find.mockResolvedValue([mockPleading]);

      const result = await service.findAll();

      expect(result).toEqual([mockPleading]);
    });
  });

  describe('findByCaseId', () => {
    it('should return pleadings for a case', async () => {
      mockRepository.find.mockResolvedValue([mockPleading]);

      const result = await service.findByCaseId('case-001');

      expect(result).toEqual([mockPleading]);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { caseId: 'case-001' },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findById', () => {
    it('should return a pleading by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockPleading);

      const result = await service.findById(mockPleading.id);

      expect(result).toEqual(mockPleading);
    });

    it('should throw NotFoundException if pleading not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new pleading', async () => {
      const createDto = {
        caseId: 'case-001',
        title: 'New Motion',
        type: 'Motion',
        content: 'Motion content...',
      };

      mockRepository.create.mockReturnValue({ ...mockPleading, ...createDto });
      mockRepository.save.mockResolvedValue({ ...mockPleading, ...createDto });

      const result = await service.create(createDto);

      expect(result).toHaveProperty('title', createDto.title);
    });
  });

  describe('update', () => {
    it('should update a pleading', async () => {
      const updateDto = { title: 'Updated Motion Title' };
      mockRepository.findOne.mockResolvedValue(mockPleading);
      mockRepository.save.mockResolvedValue({ ...mockPleading, ...updateDto });

      const result = await service.update(mockPleading.id, updateDto);

      expect(result.title).toBe('Updated Motion Title');
    });

    it('should throw NotFoundException if pleading not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a pleading', async () => {
      mockRepository.findOne.mockResolvedValue(mockPleading);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.delete(mockPleading.id);

      expect(mockRepository.delete).toHaveBeenCalledWith(mockPleading.id);
    });
  });

  describe('file', () => {
    it('should mark pleading as filed', async () => {
      mockRepository.findOne.mockResolvedValue(mockPleading);
      mockRepository.save.mockResolvedValue({
        ...mockPleading,
        status: 'filed',
        filedDate: expect.any(Date),
      });

      const result = await service.file(mockPleading.id);

      expect(result.status).toBe('filed');
      expect(result.filedDate).toBeDefined();
    });

    it('should not file an already filed pleading', async () => {
      mockRepository.findOne.mockResolvedValue({ ...mockPleading, status: 'filed' });

      await expect(service.file(mockPleading.id)).rejects.toThrow();
    });
  });

  describe('findByType', () => {
    it('should return pleadings by type', async () => {
      mockRepository.find.mockResolvedValue([mockPleading]);

      const result = await service.findByType('case-001', 'Motion');

      expect(result).toEqual([mockPleading]);
    });
  });

  describe('findByStatus', () => {
    it('should return pleadings by status', async () => {
      mockRepository.find.mockResolvedValue([mockPleading]);

      const result = await service.findByStatus('case-001', 'draft');

      expect(result).toEqual([mockPleading]);
    });
  });

  describe('getUpcomingHearings', () => {
    it('should return pleadings with upcoming hearings', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockPleading]),
      };
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getUpcomingHearings();

      expect(result).toEqual([mockPleading]);
    });
  });

  describe('getOverduePleadings', () => {
    it('should return overdue pleadings', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockPleading]),
      };
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getOverduePleadings();

      expect(result).toEqual([mockPleading]);
    });
  });

  describe('attachDocument', () => {
    it('should attach a document to pleading', async () => {
      mockRepository.findOne.mockResolvedValue(mockPleading);
      mockRepository.save.mockResolvedValue({ ...mockPleading, documentId: 'doc-002' });

      const result = await service.attachDocument(mockPleading.id, 'doc-002');

      expect(result.documentId).toBe('doc-002');
    });
  });

  describe('setHearingDate', () => {
    it('should set hearing date', async () => {
      const hearingDate = new Date('2024-04-01');
      mockRepository.findOne.mockResolvedValue(mockPleading);
      mockRepository.save.mockResolvedValue({ ...mockPleading, hearingDate });

      const result = await service.setHearingDate(mockPleading.id, hearingDate);

      expect(result.hearingDate).toEqual(hearingDate);
    });
  });

  describe('getDueSoon', () => {
    it('should return pleadings due within specified days', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockPleading]),
      };
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getDueSoon(7);

      expect(result).toEqual([mockPleading]);
    });
  });

  describe('search', () => {
    it('should search pleadings', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockPleading], 1]),
      };
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.search({
        query: 'Motion',
        caseId: 'case-001',
        page: 1,
        limit: 10,
      });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total', 1);
    });
  });
});
