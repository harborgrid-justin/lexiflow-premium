import { Test, TestingModule } from '@nestjs/testing';
import { ClausesController } from './clauses.controller';
import { ClausesService } from './clauses.service';

describe('ClausesController', () => {
  let controller: ClausesController;
  let service: ClausesService;

  const mockClause = {
    id: 'clause-001',
    title: 'Indemnification Clause',
    content: 'The party agrees to indemnify and hold harmless...',
    category: 'Contract',
    tags: ['indemnification', 'liability'],
    usageCount: 10,
    isActive: true,
    createdBy: 'user-001',
  };

  const mockClausesService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findByCategory: jest.fn(),
    findByTag: jest.fn(),
    search: jest.fn(),
    getMostUsed: jest.fn(),
    incrementUsage: jest.fn(),
    setActive: jest.fn(),
    getCategories: jest.fn(),
    duplicate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClausesController],
      providers: [{ provide: ClausesService, useValue: mockClausesService }],
    }).compile();

    controller = module.get<ClausesController>(ClausesController);
    service = module.get<ClausesService>(ClausesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all clauses', async () => {
      mockClausesService.findAll.mockResolvedValue([mockClause]);

      const result = await controller.findAll();

      expect(result).toEqual([mockClause]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a clause by id', async () => {
      mockClausesService.findById.mockResolvedValue(mockClause);

      const result = await controller.findById('clause-001');

      expect(result).toEqual(mockClause);
      expect(service.findById).toHaveBeenCalledWith('clause-001');
    });
  });

  describe('create', () => {
    it('should create a new clause', async () => {
      const createDto = {
        title: 'New Clause',
        content: 'Clause content...',
        category: 'Contract',
      };
      mockClausesService.create.mockResolvedValue({ ...mockClause, ...createDto });

      const result = await controller.create(createDto, 'user-001');

      expect(result).toHaveProperty('title', createDto.title);
      expect(service.create).toHaveBeenCalledWith(createDto, 'user-001');
    });
  });

  describe('update', () => {
    it('should update a clause', async () => {
      const updateDto = { title: 'Updated Clause Title' };
      mockClausesService.update.mockResolvedValue({ ...mockClause, ...updateDto });

      const result = await controller.update('clause-001', updateDto);

      expect(result.title).toBe('Updated Clause Title');
      expect(service.update).toHaveBeenCalledWith('clause-001', updateDto);
    });
  });

  describe('delete', () => {
    it('should delete a clause', async () => {
      mockClausesService.delete.mockResolvedValue(undefined);

      await controller.delete('clause-001');

      expect(service.delete).toHaveBeenCalledWith('clause-001');
    });
  });

  describe('findByCategory', () => {
    it('should return clauses by category', async () => {
      mockClausesService.findByCategory.mockResolvedValue([mockClause]);

      const result = await controller.findByCategory('Contract');

      expect(result).toEqual([mockClause]);
      expect(service.findByCategory).toHaveBeenCalledWith('Contract');
    });
  });

  describe('findByTag', () => {
    it('should return clauses by tag', async () => {
      mockClausesService.findByTag.mockResolvedValue([mockClause]);

      const result = await controller.findByTag('indemnification');

      expect(result).toEqual([mockClause]);
      expect(service.findByTag).toHaveBeenCalledWith('indemnification');
    });
  });

  describe('search', () => {
    it('should search clauses', async () => {
      mockClausesService.search.mockResolvedValue({ data: [mockClause], total: 1 });

      const result = await controller.search({
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
      mockClausesService.getMostUsed.mockResolvedValue([mockClause]);

      const result = await controller.getMostUsed(5);

      expect(result).toEqual([mockClause]);
      expect(service.getMostUsed).toHaveBeenCalledWith(5);
    });
  });

  describe('incrementUsage', () => {
    it('should increment usage count', async () => {
      mockClausesService.incrementUsage.mockResolvedValue({ ...mockClause, usageCount: 11 });

      const result = await controller.incrementUsage('clause-001');

      expect(result.usageCount).toBe(11);
      expect(service.incrementUsage).toHaveBeenCalledWith('clause-001');
    });
  });

  describe('setActive', () => {
    it('should activate a clause', async () => {
      mockClausesService.setActive.mockResolvedValue({ ...mockClause, isActive: true });

      const result = await controller.setActive('clause-001', { isActive: true });

      expect(result.isActive).toBe(true);
      expect(service.setActive).toHaveBeenCalledWith('clause-001', true);
    });

    it('should deactivate a clause', async () => {
      mockClausesService.setActive.mockResolvedValue({ ...mockClause, isActive: false });

      const result = await controller.setActive('clause-001', { isActive: false });

      expect(result.isActive).toBe(false);
      expect(service.setActive).toHaveBeenCalledWith('clause-001', false);
    });
  });

  describe('getCategories', () => {
    it('should return list of categories', async () => {
      mockClausesService.getCategories.mockResolvedValue(['Contract', 'Litigation', 'Employment']);

      const result = await controller.getCategories();

      expect(result).toEqual(['Contract', 'Litigation', 'Employment']);
      expect(service.getCategories).toHaveBeenCalled();
    });
  });

  describe('duplicate', () => {
    it('should duplicate a clause', async () => {
      mockClausesService.duplicate.mockResolvedValue({
        ...mockClause,
        id: 'clause-002',
        title: 'Indemnification Clause (Copy)',
      });

      const result = await controller.duplicate('clause-001', 'user-001');

      expect(result.id).not.toBe(mockClause.id);
      expect(result.title).toContain('(Copy)');
      expect(service.duplicate).toHaveBeenCalledWith('clause-001', 'user-001');
    });
  });
});
