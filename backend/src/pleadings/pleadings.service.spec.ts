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
    remove: jest.fn(),
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
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockPleading]),
      };
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

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
        order: { filedDate: 'DESC', createdAt: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a pleading by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockPleading);

      const result = await service.findOne(mockPleading.id);

      expect(result).toEqual(mockPleading);
    });

    it('should throw NotFoundException if pleading not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new pleading', async () => {
      const createDto = {
        caseId: 'case-001',
        title: 'New Motion',
        type: 'motion' as any,
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

  describe('remove', () => {
    it('should delete a pleading', async () => {
      mockRepository.findOne.mockResolvedValue(mockPleading);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove(mockPleading.id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: mockPleading.id } });
      expect(mockRepository.delete).toHaveBeenCalledWith(mockPleading.id);
    });
  });

  describe('file', () => {
    it('should mark pleading as filed', async () => {
      const filePleadingDto = {
        filedBy: 'Attorney Smith',
        filedDate: '2024-01-15',
        courtName: 'Superior Court',
      };

      mockRepository.findOne.mockResolvedValue(mockPleading);
      mockRepository.save.mockResolvedValue({
        ...mockPleading,
        status: 'filed',
        filedBy: filePleadingDto.filedBy,
        filedDate: filePleadingDto.filedDate,
        courtName: filePleadingDto.courtName,
      });

      const result = await service.file(mockPleading.id, filePleadingDto, 'user-001');

      expect(result.status).toBe('filed');
      expect(result.filedDate).toBeDefined();
      expect(result.filedBy).toBe(filePleadingDto.filedBy);
    });
  });

  describe('findByCaseId', () => {
    it('should return pleadings for a case with proper ordering', async () => {
      mockRepository.find.mockResolvedValue([mockPleading]);

      const result = await service.findByCaseId('case-001');

      expect(result).toEqual([mockPleading]);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { caseId: 'case-001' },
        order: { filedDate: 'DESC', createdAt: 'DESC' },
      });
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

      const result = await service.getUpcomingHearings(30);

      expect(result).toEqual([mockPleading]);
      expect(mockQueryBuilder.where).toHaveBeenCalled();
      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
    });
  });
});
