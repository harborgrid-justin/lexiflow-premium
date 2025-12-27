import { Test, TestingModule } from '@nestjs/testing';
import { PartiesService } from './parties.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Party } from './entities/party.entity';

describe('PartiesService', () => {
  let service: PartiesService;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PartiesService,
        {
          provide: getRepositoryToken(Party),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PartiesService>(PartiesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllByCaseId', () => {
    it('should return parties for a case', async () => {
      const mockParties = [{ id: 'party-001', caseId: 'case-001', name: 'John Doe' }];
      (mockRepository.findAndCount as jest.Mock).mockResolvedValue([mockParties, 1]);

      const result = await service.findAllByCaseId('case-001');

      expect(result).toEqual({
        data: mockParties,
        total: 1,
        page: 1,
        limit: 50,
      });
      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: { caseId: 'case-001' },
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 50,
      });
    });
  });
});
