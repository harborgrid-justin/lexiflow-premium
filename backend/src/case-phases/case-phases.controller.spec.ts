import { Test, TestingModule } from '@nestjs/testing';
import { CasePhasesController } from './case-phases.controller';
import { CasePhasesService } from './case-phases.service';
import { PhaseType } from './entities/case-phase.entity';

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
    findAllByCaseId: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
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

  describe('findAllByCaseId', () => {
    it('should return phases for a case', async () => {
      (mockCasePhasesService.findAllByCaseId as jest.Mock).mockResolvedValue([mockPhase]);

      const result = await controller.findAllByCaseId('case-001');

      expect(result).toEqual([mockPhase]);
      expect(service.findAllByCaseId).toHaveBeenCalledWith('case-001');
    });
  });

  describe('findOne', () => {
    it('should return a phase by id', async () => {
      (mockCasePhasesService.findOne as jest.Mock).mockResolvedValue(mockPhase);

      const result = await controller.findOne('phase-001');

      expect(result).toEqual(mockPhase);
      expect(service.findOne).toHaveBeenCalledWith('phase-001');
    });
  });

  describe('create', () => {
    it('should create a new phase', async () => {
      const createDto = {
        caseId: 'case-001',
        name: 'Trial',
        type: PhaseType.TRIAL,
        description: 'Trial phase',
        expectedDuration: 30,
      };
      (mockCasePhasesService.create as jest.Mock).mockResolvedValue({ ...mockPhase, ...createDto });

      const result = await controller.create(createDto);

      expect(result).toHaveProperty('name', createDto.name);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update a phase', async () => {
      const updateDto = { name: 'Pre-Trial Discovery' };
      (mockCasePhasesService.update as jest.Mock).mockResolvedValue({ ...mockPhase, ...updateDto });

      const result = await controller.update('phase-001', updateDto);

      expect(result.name).toBe('Pre-Trial Discovery');
      expect(service.update).toHaveBeenCalledWith('phase-001', updateDto);
    });
  });

  describe('remove', () => {
    it('should delete a phase', async () => {
      (mockCasePhasesService.remove as jest.Mock).mockResolvedValue(undefined);

      await controller.remove('phase-001');

      expect(service.remove).toHaveBeenCalledWith('phase-001');
    });
  });
});
