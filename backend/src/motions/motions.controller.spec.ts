import { Test, TestingModule } from '@nestjs/testing';
import { MotionsController } from './motions.controller';
import { MotionsService } from './motions.service';
import { MotionType } from './entities/motion.entity';

describe('MotionsController', () => {
  let controller: MotionsController;
  let service: MotionsService;

  const mockMotion = {
    id: 'motion-001',
    caseId: 'case-001',
    title: 'Motion to Dismiss',
    type: MotionType.MOTION_TO_DISMISS,
    status: 'PENDING',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockMotionsService = {
    findAllByCaseId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MotionsController],
      providers: [{ provide: MotionsService, useValue: mockMotionsService }],
    }).compile();

    controller = module.get<MotionsController>(MotionsController);
    service = module.get<MotionsService>(MotionsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAllByCaseId', () => {
    it('should return motions for a case', async () => {
      (mockMotionsService.findAllByCaseId as jest.Mock).mockResolvedValue([mockMotion]);

      const result = await controller.findAllByCaseId('case-001');

      expect(result).toEqual([mockMotion]);
      expect(service.findAllByCaseId).toHaveBeenCalledWith('case-001');
    });
  });

  describe('create', () => {
    it('should create a new motion', async () => {
      const createDto = {
        caseId: 'case-001',
        title: 'Motion for Summary Judgment',
        type: MotionType.MOTION_FOR_SUMMARY_JUDGMENT,
      };
      (mockMotionsService.create as jest.Mock).mockResolvedValue({ ...mockMotion, ...createDto });

      const result = await controller.create(createDto);

      expect(result).toHaveProperty('title', createDto.title);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update a motion', async () => {
      const updateDto = { title: 'Amended Motion to Dismiss' };
      (mockMotionsService.update as jest.Mock).mockResolvedValue({ ...mockMotion, ...updateDto });

      const result = await controller.update('motion-001', updateDto);

      expect(result.title).toBe('Amended Motion to Dismiss');
      expect(service.update).toHaveBeenCalledWith('motion-001', updateDto);
    });
  });

  describe('remove', () => {
    it('should delete a motion', async () => {
      (mockMotionsService.remove as jest.Mock).mockResolvedValue(undefined);

      await controller.remove('motion-001');

      expect(service.remove).toHaveBeenCalledWith('motion-001');
    });
  });
});
