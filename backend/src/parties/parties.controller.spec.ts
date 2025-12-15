import { Test, TestingModule } from '@nestjs/testing';
import { PartiesController } from './parties.controller';
import { PartiesService } from './parties.service';

describe('PartiesController', () => {
  let controller: PartiesController;
  let service: PartiesService;

  const mockParty = {
    id: 'party-001',
    caseId: 'case-001',
    name: 'John Doe',
    type: 'PLAINTIFF',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPartiesService = {
    findAllByCaseId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PartiesController],
      providers: [{ provide: PartiesService, useValue: mockPartiesService }],
    }).compile();

    controller = module.get<PartiesController>(PartiesController);
    service = module.get<PartiesService>(PartiesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAllByCaseId', () => {
    it('should return parties for a case', async () => {
      mockPartiesService.findAllByCaseId.mockResolvedValue([mockParty]);

      const result = await controller.findAllByCaseId('case-001');

      expect(result).toEqual([mockParty]);
      expect(service.findAllByCaseId).toHaveBeenCalledWith('case-001');
    });
  });

  describe('create', () => {
    it('should create a new party', async () => {
      const createDto = {
        caseId: 'case-001',
        name: 'Jane Smith',
        type: 'DEFENDANT',
      };
      mockPartiesService.create.mockResolvedValue({ ...mockParty, ...createDto });

      const result = await controller.create(createDto);

      expect(result).toHaveProperty('name', createDto.name);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update a party', async () => {
      const updateDto = { name: 'John Doe Jr.' };
      mockPartiesService.update.mockResolvedValue({ ...mockParty, ...updateDto });

      const result = await controller.update('party-001', updateDto);

      expect(result.name).toBe('John Doe Jr.');
      expect(service.update).toHaveBeenCalledWith('party-001', updateDto);
    });
  });

  describe('remove', () => {
    it('should delete a party', async () => {
      mockPartiesService.remove.mockResolvedValue(undefined);

      await controller.remove('party-001');

      expect(service.remove).toHaveBeenCalledWith('party-001');
    });
  });
});
