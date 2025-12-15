import { Test, TestingModule } from '@nestjs/testing';
import { PleadingsController } from './pleadings.controller';
import { PleadingsService } from './pleadings.service';

describe('PleadingsController', () => {
  let controller: PleadingsController;
  let service: PleadingsService;

  const mockPleading = {
    id: 'pleading-001',
    caseId: 'case-001',
    title: 'Complaint',
    type: 'COMPLAINT',
    status: 'DRAFT',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPleadingsService = {
    findAllByCaseId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PleadingsController],
      providers: [{ provide: PleadingsService, useValue: mockPleadingsService }],
    }).compile();

    controller = module.get<PleadingsController>(PleadingsController);
    service = module.get<PleadingsService>(PleadingsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAllByCaseId', () => {
    it('should return pleadings for a case', async () => {
      mockPleadingsService.findAllByCaseId.mockResolvedValue([mockPleading]);

      const result = await controller.findAllByCaseId('case-001');

      expect(result).toEqual([mockPleading]);
      expect(service.findAllByCaseId).toHaveBeenCalledWith('case-001');
    });
  });

  describe('create', () => {
    it('should create a new pleading', async () => {
      const createDto = {
        caseId: 'case-001',
        title: 'Answer',
        type: 'ANSWER',
      };
      mockPleadingsService.create.mockResolvedValue({ ...mockPleading, ...createDto });

      const result = await controller.create(createDto);

      expect(result).toHaveProperty('title', createDto.title);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update a pleading', async () => {
      const updateDto = { title: 'Amended Complaint' };
      mockPleadingsService.update.mockResolvedValue({ ...mockPleading, ...updateDto });

      const result = await controller.update('pleading-001', updateDto);

      expect(result.title).toBe('Amended Complaint');
      expect(service.update).toHaveBeenCalledWith('pleading-001', updateDto);
    });
  });

  describe('remove', () => {
    it('should delete a pleading', async () => {
      mockPleadingsService.remove.mockResolvedValue(undefined);

      await controller.remove('pleading-001');

      expect(service.remove).toHaveBeenCalledWith('pleading-001');
    });
  });
});
