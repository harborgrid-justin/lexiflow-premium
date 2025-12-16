import { Test, TestingModule } from '@nestjs/testing';
import { ClausesController } from './clauses.controller';
import { ClausesService } from './clauses.service';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

describe('ClausesController', () => {
  let controller: ClausesController;
  let service: ClausesService;

  const mockClause = {
    id: 'clause-001',
    title: 'Indemnification Clause',
    content: 'Sample clause content',
    category: 'Contract',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockClausesService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  } as any;

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
      (mockClausesService.findAll as jest.Mock).mockResolvedValue([mockClause]);

      const result = await controller.findAll();

      expect(result).toEqual([mockClause]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a clause by id', async () => {
      (mockClausesService.findOne as jest.Mock).mockResolvedValue(mockClause);

      const result = await controller.findOne('clause-001');

      expect(result).toEqual(mockClause);
      expect(service.findOne).toHaveBeenCalledWith('clause-001');
    });
  });

  describe('create', () => {
    it('should create a new clause', async () => {
      const createDto: any = {
        title: 'New Clause',
        content: 'New clause content',
        category: 'Contract',
      };
      (mockClausesService.create as jest.Mock).mockResolvedValue({ ...mockClause, ...createDto });

      const result = await controller.create(createDto);

      expect(result).toHaveProperty('title', createDto.title);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update a clause', async () => {
      const updateDto = { title: 'Updated Clause' };
      (mockClausesService.update as jest.Mock).mockResolvedValue({ ...mockClause, ...updateDto });

      const result = await controller.update('clause-001', updateDto);

      expect(result.title).toBe('Updated Clause');
      expect(service.update).toHaveBeenCalledWith('clause-001', updateDto);
    });
  });

  describe('remove', () => {
    it('should delete a clause', async () => {
      (mockClausesService.remove as jest.Mock).mockResolvedValue(undefined);

      await controller.remove('clause-001');

      expect(service.remove).toHaveBeenCalledWith('clause-001');
    });
  });
});
