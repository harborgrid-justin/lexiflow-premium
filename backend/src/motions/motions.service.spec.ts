import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { MotionsService } from './motions.service';
import { Motion, MotionType } from './entities/motion.entity';

describe('MotionsService', () => {
  let service: MotionsService;
  let repository: Repository<Motion>;

  const mockMotion = {
    id: 'motion-001',
    caseId: 'case-001',
    title: 'Motion to Dismiss',
    type: MotionType.MOTION_TO_DISMISS,
    status: 'pending',
    filedBy: 'defendant',
    filedDate: new Date('2024-01-15'),
    hearingDate: new Date('2024-02-15'),
    responseDeadline: new Date('2024-02-01'),
    rulingDate: null,
    ruling: null,
    documentId: 'doc-001',
    supportingDocs: ['doc-002', 'doc-003'],
    opposingPartyResponse: null,
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
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MotionsService,
        { provide: getRepositoryToken(Motion), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<MotionsService>(MotionsService);
    repository = module.get<Repository<Motion>>(getRepositoryToken(Motion));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all motions', async () => {
      mockRepository.find.mockResolvedValue([mockMotion]);

      const result = await service.findAll();

      expect(result).toEqual([mockMotion]);
    });
  });

  describe('findAllByCaseId', () => {
    it('should return motions for a case', async () => {
      mockRepository.find.mockResolvedValue([mockMotion]);

      const result = await service.findAllByCaseId('case-001');

      expect(result).toEqual([mockMotion]);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { caseId: 'case-001' },
        order: { filingDate: 'DESC', createdAt: 'DESC' },
      });
    });
  });

  describe('findById', () => {
    it('should return a motion by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockMotion);

      const result = await service.findById(mockMotion.id);

      expect(result).toEqual(mockMotion);
    });

    it('should throw NotFoundException if motion not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new motion', async () => {
      const createDto = {
        caseId: 'case-001',
        title: 'Motion for Summary Judgment',
        type: MotionType.MOTION_FOR_SUMMARY_JUDGMENT,
        filedBy: 'plaintiff',
      };

      mockRepository.create.mockReturnValue({ ...mockMotion, ...createDto });
      mockRepository.save.mockResolvedValue({ ...mockMotion, ...createDto });

      const result = await service.create(createDto);

      expect(result).toHaveProperty('title', createDto.title);
    });
  });

  describe('update', () => {
    it('should update a motion', async () => {
      const updateDto = { title: 'Amended Motion to Dismiss' };
      mockRepository.findOne.mockResolvedValue(mockMotion);
      mockRepository.save.mockResolvedValue({ ...mockMotion, ...updateDto });

      const result = await service.update(mockMotion.id, updateDto);

      expect(result.title).toBe('Amended Motion to Dismiss');
    });

    it('should throw NotFoundException if motion not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a motion', async () => {
      mockRepository.findOne.mockResolvedValue(mockMotion);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.delete(mockMotion.id);

      expect(mockRepository.delete).toHaveBeenCalledWith(mockMotion.id);
    });
  });

  describe('file', () => {
    it('should mark motion as filed', async () => {
      const draftMotion = { ...mockMotion, status: 'draft', filedDate: null };
      mockRepository.findOne.mockResolvedValue(draftMotion);
      mockRepository.save.mockResolvedValue({
        ...draftMotion,
        status: 'filed',
        filedDate: expect.any(Date),
      });

      const result = await service.file(mockMotion.id);

      expect(result.status).toBe('filed');
      expect(result.filedDate).toBeDefined();
    });

    it('should throw BadRequestException if already filed', async () => {
      mockRepository.findOne.mockResolvedValue({ ...mockMotion, status: 'filed' });

      await expect(service.file(mockMotion.id)).rejects.toThrow(BadRequestException);
    });
  });

  describe('setHearingDate', () => {
    it('should set hearing date', async () => {
      const hearingDate = new Date('2024-03-01');
      mockRepository.findOne.mockResolvedValue(mockMotion);
      mockRepository.save.mockResolvedValue({ ...mockMotion, hearingDate });

      const result = await service.setHearingDate(mockMotion.id, hearingDate);

      expect(result.hearingDate).toEqual(hearingDate);
    });
  });

  describe('recordRuling', () => {
    it('should record ruling', async () => {
      const ruling = { decision: 'granted', reasoning: 'Court finds merit in argument' };
      mockRepository.findOne.mockResolvedValue(mockMotion);
      mockRepository.save.mockResolvedValue({
        ...mockMotion,
        status: 'decided',
        ruling,
        rulingDate: expect.any(Date),
      });

      const result = await service.recordRuling(mockMotion.id, ruling as any);

      expect(result.status).toBe('decided');
      expect(result.ruling).toEqual(ruling);
    });
  });

  describe('findByType', () => {
    it('should return motions by type', async () => {
      mockRepository.find.mockResolvedValue([mockMotion]);

      const result = await service.findByType('case-001', 'dispositive');

      expect(result).toEqual([mockMotion]);
    });
  });

  describe('findByStatus', () => {
    it('should return motions by status', async () => {
      mockRepository.find.mockResolvedValue([mockMotion]);

      const result = await service.findByStatus('case-001', 'pending');

      expect(result).toEqual([mockMotion]);
    });
  });

  describe('getUpcomingHearings', () => {
    it('should return motions with upcoming hearings', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockMotion]),
      };
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getUpcomingHearings();

      expect(result).toEqual([mockMotion]);
    });
  });

  describe('getPendingResponses', () => {
    it('should return motions with pending responses', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockMotion]),
      };
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getPendingResponses();

      expect(result).toEqual([mockMotion]);
    });
  });

  describe('attachDocument', () => {
    it('should attach document to motion', async () => {
      mockRepository.findOne.mockResolvedValue(mockMotion);
      mockRepository.save.mockResolvedValue({
        ...mockMotion,
        supportingDocs: [...mockMotion.supportingDocs, 'doc-004'],
      });

      const result = await service.attachDocument(mockMotion.id, 'doc-004');

      expect(result.supportingDocs).toContain('doc-004');
    });
  });

  describe('search', () => {
    it('should search motions', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockMotion], 1]),
      };
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.search({
        caseId: 'case-001',
        query: 'dismiss',
        page: 1,
        limit: 10,
      });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total', 1);
    });
  });
});
