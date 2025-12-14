import { Test, TestingModule } from '@nestjs/testing';
import { CasePhasesController } from './case-phases.controller';
import { CasePhasesService } from './case-phases.service';

describe('CasePhasesController', () => {
  let controller: CasePhasesController;
  let service: CasePhasesService;

  const mockPhase = {
    id: 'phase-001',
    caseId: 'case-001',
    name: 'Discovery',
    description: 'Discovery phase of litigation',
    order: 2,
    status: 'active',
    startDate: new Date('2024-01-15'),
    endDate: null,
    expectedDuration: 90,
    completedTasks: 5,
    totalTasks: 20,
  };

  const mockCasePhasesService = {
    findAll: jest.fn(),
    findByCaseId: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    startPhase: jest.fn(),
    completePhase: jest.fn(),
    updateProgress: jest.fn(),
    reorderPhases: jest.fn(),
    getCurrentPhase: jest.fn(),
    getPhaseProgress: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CasePhasesController],
      providers: [{ provide: CasePhasesService, useValue: mockCasePhasesService }],
    }).compile();

    controller = module.get<CasePhasesController>(CasePhasesController);
    service = module.get<CasePhasesService>(CasePhasesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all phases', async () => {
      mockCasePhasesService.findAll.mockResolvedValue([mockPhase]);

      const result = await controller.findAll();

      expect(result).toEqual([mockPhase]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findByCaseId', () => {
    it('should return phases for a case', async () => {
      mockCasePhasesService.findByCaseId.mockResolvedValue([mockPhase]);

      const result = await controller.findByCaseId('case-001');

      expect(result).toEqual([mockPhase]);
      expect(service.findByCaseId).toHaveBeenCalledWith('case-001');
    });
  });

  describe('findById', () => {
    it('should return a phase by id', async () => {
      mockCasePhasesService.findById.mockResolvedValue(mockPhase);

      const result = await controller.findById('phase-001');

      expect(result).toEqual(mockPhase);
      expect(service.findById).toHaveBeenCalledWith('phase-001');
    });
  });

  describe('create', () => {
    it('should create a new phase', async () => {
      const createDto = {
        caseId: 'case-001',
        name: 'Trial',
        description: 'Trial phase',
        expectedDuration: 30,
      };
      mockCasePhasesService.create.mockResolvedValue({ ...mockPhase, ...createDto });

      const result = await controller.create(createDto);

      expect(result).toHaveProperty('name', createDto.name);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update a phase', async () => {
      const updateDto = { name: 'Pre-Trial Discovery' };
      mockCasePhasesService.update.mockResolvedValue({ ...mockPhase, ...updateDto });

      const result = await controller.update('phase-001', updateDto);

      expect(result.name).toBe('Pre-Trial Discovery');
      expect(service.update).toHaveBeenCalledWith('phase-001', updateDto);
    });
  });

  describe('delete', () => {
    it('should delete a phase', async () => {
      mockCasePhasesService.delete.mockResolvedValue(undefined);

      await controller.delete('phase-001');

      expect(service.delete).toHaveBeenCalledWith('phase-001');
    });
  });

  describe('startPhase', () => {
    it('should start a phase', async () => {
      mockCasePhasesService.startPhase.mockResolvedValue({
        ...mockPhase,
        status: 'active',
        startDate: new Date(),
      });

      const result = await controller.startPhase('phase-001');

      expect(result.status).toBe('active');
      expect(service.startPhase).toHaveBeenCalledWith('phase-001');
    });
  });

  describe('completePhase', () => {
    it('should complete a phase', async () => {
      mockCasePhasesService.completePhase.mockResolvedValue({
        ...mockPhase,
        status: 'completed',
        endDate: new Date(),
      });

      const result = await controller.completePhase('phase-001');

      expect(result.status).toBe('completed');
      expect(service.completePhase).toHaveBeenCalledWith('phase-001');
    });
  });

  describe('updateProgress', () => {
    it('should update phase progress', async () => {
      mockCasePhasesService.updateProgress.mockResolvedValue({ ...mockPhase, completedTasks: 10 });

      const result = await controller.updateProgress('phase-001', {
        completedTasks: 10,
        totalTasks: 20,
      });

      expect(result.completedTasks).toBe(10);
      expect(service.updateProgress).toHaveBeenCalledWith('phase-001', 10, 20);
    });
  });

  describe('reorderPhases', () => {
    it('should reorder phases', async () => {
      mockCasePhasesService.reorderPhases.mockResolvedValue(undefined);

      await controller.reorderPhases('case-001', {
        phaseIds: ['phase-002', 'phase-001'],
      });

      expect(service.reorderPhases).toHaveBeenCalledWith('case-001', ['phase-002', 'phase-001']);
    });
  });

  describe('getCurrentPhase', () => {
    it('should return the current active phase', async () => {
      mockCasePhasesService.getCurrentPhase.mockResolvedValue(mockPhase);

      const result = await controller.getCurrentPhase('case-001');

      expect(result).toEqual(mockPhase);
      expect(service.getCurrentPhase).toHaveBeenCalledWith('case-001');
    });
  });

  describe('getPhaseProgress', () => {
    it('should return phase progress percentage', async () => {
      mockCasePhasesService.getPhaseProgress.mockResolvedValue({
        percentage: 25,
        completedTasks: 5,
        totalTasks: 20,
      });

      const result = await controller.getPhaseProgress('phase-001');

      expect(result).toHaveProperty('percentage', 25);
      expect(service.getPhaseProgress).toHaveBeenCalledWith('phase-001');
    });
  });
});
