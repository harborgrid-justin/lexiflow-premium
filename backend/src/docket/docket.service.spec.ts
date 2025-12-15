import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { DocketService } from './docket.service';
import { DocketEntry } from './entities/docket-entry.entity';

describe('DocketService', () => {
  let service: DocketService;
  let repository: Repository<DocketEntry>;

  const mockDocketEntry = {
    id: 'docket-001',
    caseId: 'case-001',
    entryNumber: 1,
    entryDate: new Date('2024-01-15'),
    description: 'Complaint filed',
    filedBy: 'Plaintiff',
    documentId: 'doc-001',
    category: 'Pleading',
    isPublic: true,
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
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocketService,
        { provide: getRepositoryToken(DocketEntry), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<DocketService>(DocketService);
    repository = module.get<Repository<DocketEntry>>(getRepositoryToken(DocketEntry));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all docket entries', async () => {
      mockRepository.find.mockResolvedValue([mockDocketEntry]);

      const result = await service.findAll();

      expect(result).toEqual([mockDocketEntry]);
    });
  });

  describe('findByCaseId', () => {
    it('should return docket entries for a case', async () => {
      mockRepository.find.mockResolvedValue([mockDocketEntry]);

      const result = await service.findByCaseId('case-001');

      expect(result).toEqual([mockDocketEntry]);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { caseId: 'case-001' },
        order: { entryNumber: 'ASC' },
      });
    });
  });

  describe('findById', () => {
    it('should return a docket entry by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockDocketEntry);

      const result = await service.findById(mockDocketEntry.id);

      expect(result).toEqual(mockDocketEntry);
    });

    it('should throw NotFoundException if entry not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new docket entry', async () => {
      const createDto = {
        caseId: 'case-001',
        description: 'Motion filed',
        filedBy: 'Defendant',
        entryDate: new Date('2024-01-20'),
      };

      mockRepository.count.mockResolvedValue(1);
      mockRepository.create.mockReturnValue({ ...mockDocketEntry, ...createDto, entryNumber: 2 });
      mockRepository.save.mockResolvedValue({ ...mockDocketEntry, ...createDto, entryNumber: 2 });

      const result = await service.create(createDto);

      expect(result).toHaveProperty('entryNumber', 2);
    });

    it('should auto-generate entry number', async () => {
      mockRepository.count.mockResolvedValue(5);
      mockRepository.create.mockReturnValue({ ...mockDocketEntry, entryNumber: 6 });
      mockRepository.save.mockResolvedValue({ ...mockDocketEntry, entryNumber: 6 });

      const result = await service.create({
        caseId: 'case-001',
        description: 'New entry',
        filedBy: 'Plaintiff',
        entryDate: new Date(),
      });

      expect(result.entryNumber).toBe(6);
    });
  });

  describe('update', () => {
    it('should update a docket entry', async () => {
      const updateDto = { description: 'Updated description' };
      mockRepository.findOne.mockResolvedValue(mockDocketEntry);
      mockRepository.save.mockResolvedValue({ ...mockDocketEntry, ...updateDto });

      const result = await service.update(mockDocketEntry.id, updateDto);

      expect(result.description).toBe('Updated description');
    });

    it('should throw NotFoundException if entry not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a docket entry', async () => {
      mockRepository.findOne.mockResolvedValue(mockDocketEntry);
      mockRepository.softDelete.mockResolvedValue({ affected: 1 });

      await service.remove(mockDocketEntry.id);

      expect(mockRepository.delete).toHaveBeenCalledWith(mockDocketEntry.id);
    });
  });

  describe('findByCategory', () => {
    it('should return entries by category', async () => {
      mockRepository.find.mockResolvedValue([mockDocketEntry]);

      const result = await service.findByCategory('case-001', 'Pleading');

      expect(result).toEqual([mockDocketEntry]);
    });
  });

  describe('findByDateRange', () => {
    it('should return entries within date range', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockDocketEntry]),
      };
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findByDateRange(
        'case-001',
        new Date('2024-01-01'),
        new Date('2024-12-31'),
      );

      expect(result).toEqual([mockDocketEntry]);
    });
  });

  describe('getPublicEntries', () => {
    it('should return only public entries', async () => {
      mockRepository.find.mockResolvedValue([mockDocketEntry]);

      const result = await service.getPublicEntries('case-001');

      expect(result).toEqual([mockDocketEntry]);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { caseId: 'case-001', isPublic: true },
        order: { entryNumber: 'ASC' },
      });
    });
  });

  // attachDocument method does not exist in service - removed test

  describe('detachDocument', () => {
    it('should detach document from docket entry', async () => {
      mockRepository.findOne.mockResolvedValue(mockDocketEntry);
      mockRepository.save.mockResolvedValue({ ...mockDocketEntry, documentId: null });

      const result = await service.detachDocument(mockDocketEntry.id);

      expect(result.documentId).toBeNull();
    });
  });

  describe('getNextEntryNumber', () => {
    it('should return next entry number for a case', async () => {
      mockRepository.count.mockResolvedValue(10);

      const result = await service.getNextEntryNumber('case-001');

      expect(result).toBe(11);
    });

    it('should return 1 for empty case', async () => {
      mockRepository.count.mockResolvedValue(0);

      const result = await service.getNextEntryNumber('new-case');

      expect(result).toBe(1);
    });
  });

  describe('search', () => {
    it('should search docket entries', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockDocketEntry], 1]),
      };
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.search({
        caseId: 'case-001',
        query: 'Complaint',
        page: 1,
        limit: 10,
      });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total', 1);
    });
  });

  describe('getDocketSummary', () => {
    it('should return docket summary for a case', async () => {
      mockRepository.find.mockResolvedValue([
        mockDocketEntry,
        { ...mockDocketEntry, category: 'Motion' },
      ]);

      const result = await service.getDocketSummary('case-001');

      expect(result).toHaveProperty('totalEntries');
      expect(result).toHaveProperty('byCategory');
      expect(result).toHaveProperty('latestEntry');
    });
  });
});
