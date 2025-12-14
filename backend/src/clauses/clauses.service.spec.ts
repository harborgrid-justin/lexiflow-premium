import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { ClausesService } from './clauses.service';
import { Clause } from './entities/clause.entity';

describe('ClausesService', () => {
  let service: ClausesService;
  let repository: Repository<Clause>;

  const mockClause = {
    id: 'clause-001',
    title: 'Indemnification Clause',
    content: 'The party agrees to indemnify and hold harmless...',
    category: 'Contract',
    tags: ['indemnification', 'liability'],
    usageCount: 10,
    isActive: true,
    metadata: {},
    createdBy: 'user-001',
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
        ClausesService,
        { provide: getRepositoryToken(Clause), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<ClausesService>(ClausesService);
    repository = module.get<Repository<Clause>>(getRepositoryToken(Clause));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all clauses', async () => {
      mockRepository.find.mockResolvedValue([mockClause]);

      const result = await service.findAll();

      expect(result).toEqual([mockClause]);
    });
  });

  describe('findById', () => {
    it('should return a clause by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockClause);

      const result = await service.findById(mockClause.id);

      expect(result).toEqual(mockClause);
    });

    it('should throw NotFoundException if clause not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new clause', async () => {
      const createDto = {
        title: 'New Clause',
        content: 'Clause content...',
        category: 'Contract',
      };

      mockRepository.create.mockReturnValue({ ...mockClause, ...createDto });
      mockRepository.save.mockResolvedValue({ ...mockClause, ...createDto });

      const result = await service.create(createDto, 'user-001');

      expect(result).toHaveProperty('title', createDto.title);
      expect(result).toHaveProperty('createdBy', 'user-001');
    });
  });

  describe('update', () => {
    it('should update a clause', async () => {
      const updateDto = { title: 'Updated Clause Title' };
      mockRepository.findOne.mockResolvedValue(mockClause);
      mockRepository.save.mockResolvedValue({ ...mockClause, ...updateDto });

      const result = await service.update(mockClause.id, updateDto);

      expect(result.title).toBe('Updated Clause Title');
    });

    it('should throw NotFoundException if clause not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a clause', async () => {
      mockRepository.findOne.mockResolvedValue(mockClause);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.delete(mockClause.id);

      expect(mockRepository.delete).toHaveBeenCalledWith(mockClause.id);
    });
  });

  describe('findByCategory', () => {
    it('should return clauses by category', async () => {
      mockRepository.find.mockResolvedValue([mockClause]);

      const result = await service.findByCategory('Contract');

      expect(result).toEqual([mockClause]);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { category: 'Contract', isActive: true },
      });
    });
  });

  describe('findByTag', () => {
    it('should return clauses by tag', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockClause]),
      };
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findByTag('indemnification');

      expect(result).toEqual([mockClause]);
    });
  });

  describe('search', () => {
    it('should search clauses by query', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockClause], 1]),
      };
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.search({
        query: 'indemnification',
        page: 1,
        limit: 10,
      });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total', 1);
    });
  });

  describe('getMostUsed', () => {
    it('should return most used clauses', async () => {
      mockRepository.find.mockResolvedValue([mockClause]);

      const result = await service.getMostUsed(5);

      expect(result).toEqual([mockClause]);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { isActive: true },
        order: { usageCount: 'DESC' },
        take: 5,
      });
    });
  });

  describe('incrementUsage', () => {
    it('should increment usage count', async () => {
      mockRepository.findOne.mockResolvedValue(mockClause);
      mockRepository.save.mockResolvedValue({ ...mockClause, usageCount: 11 });

      const result = await service.incrementUsage(mockClause.id);

      expect(result.usageCount).toBe(11);
    });
  });

  describe('setActive', () => {
    it('should activate a clause', async () => {
      mockRepository.findOne.mockResolvedValue({ ...mockClause, isActive: false });
      mockRepository.save.mockResolvedValue({ ...mockClause, isActive: true });

      const result = await service.setActive(mockClause.id, true);

      expect(result.isActive).toBe(true);
    });

    it('should deactivate a clause', async () => {
      mockRepository.findOne.mockResolvedValue(mockClause);
      mockRepository.save.mockResolvedValue({ ...mockClause, isActive: false });

      const result = await service.setActive(mockClause.id, false);

      expect(result.isActive).toBe(false);
    });
  });

  describe('getCategories', () => {
    it('should return list of categories', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        distinct: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { category: 'Contract' },
          { category: 'Litigation' },
        ]),
      };
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getCategories();

      expect(result).toEqual(['Contract', 'Litigation']);
    });
  });

  describe('duplicate', () => {
    it('should duplicate a clause', async () => {
      mockRepository.findOne.mockResolvedValue(mockClause);
      mockRepository.create.mockReturnValue({
        ...mockClause,
        id: 'clause-002',
        title: 'Indemnification Clause (Copy)',
        usageCount: 0,
      });
      mockRepository.save.mockResolvedValue({
        ...mockClause,
        id: 'clause-002',
        title: 'Indemnification Clause (Copy)',
      });

      const result = await service.duplicate(mockClause.id, 'user-001');

      expect(result.id).not.toBe(mockClause.id);
      expect(result.title).toContain('(Copy)');
    });
  });
});
