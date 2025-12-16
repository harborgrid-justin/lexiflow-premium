import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { DiscoveryService } from './discovery.service';
import { DiscoveryRequest } from './entities/discovery-request.entity';
import { LegalHold } from './entities/legal-hold.entity';
import { Custodian } from './entities/custodian.entity';
import { describe, expect, it, jest, beforeEach } from '@jest/globals';

describe('DiscoveryService', () => {
  let service: DiscoveryService;
  let discoveryRequestRepository: Repository<DiscoveryRequest>;
  let legalHoldRepository: Repository<LegalHold>;
  let custodianRepository: Repository<Custodian>;

  const mockDiscoveryRequest = {
    id: 'discovery-001',
    caseId: 'case-001',
    type: 'Interrogatories',
    title: 'First Set of Interrogatories',
    description: 'Initial discovery requests',
    status: 'pending',
    dueDate: new Date('2024-02-15'),
    servedDate: new Date('2024-01-15'),
    respondingParty: 'Defendant',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockLegalHold = {
    id: 'hold-001',
    caseId: 'case-001',
    name: 'Project Alpha Hold',
    description: 'Legal hold for Project Alpha litigation',
    status: 'active',
    startDate: new Date('2024-01-01'),
    endDate: null,
    custodians: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCustodian = {
    id: 'custodian-001',
    name: 'John Smith',
    email: 'john.smith@company.com',
    department: 'Engineering',
    title: 'Senior Engineer',
    status: 'active',
    legalHoldId: 'hold-001',
    acknowledgedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDiscoveryRequestRepository = {
    find: jest.fn() as jest.Mock,
    findOne: jest.fn() as jest.Mock,
    create: jest.fn() as jest.Mock,
    save: jest.fn() as jest.Mock,
    update: jest.fn() as jest.Mock,
    delete: jest.fn() as jest.Mock,
    createQueryBuilder: jest.fn() as jest.Mock,
  };

  const mockLegalHoldRepository = {
    find: jest.fn() as jest.Mock,
    findOne: jest.fn() as jest.Mock,
    create: jest.fn() as jest.Mock,
    save: jest.fn() as jest.Mock,
    update: jest.fn() as jest.Mock,
    delete: jest.fn() as jest.Mock,
  };

  const mockCustodianRepository = {
    find: jest.fn() as jest.Mock,
    findOne: jest.fn() as jest.Mock,
    create: jest.fn() as jest.Mock,
    save: jest.fn() as jest.Mock,
    update: jest.fn() as jest.Mock,
    delete: jest.fn() as jest.Mock,
    createQueryBuilder: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]) as jest.Mock,
    }) as jest.Mock,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiscoveryService,
        { provide: getRepositoryToken(DiscoveryRequest), useValue: mockDiscoveryRequestRepository },
        { provide: getRepositoryToken(LegalHold), useValue: mockLegalHoldRepository },
        { provide: getRepositoryToken(Custodian), useValue: mockCustodianRepository },
      ],
    }).compile();

    service = module.get<DiscoveryService>(DiscoveryService);
    discoveryRequestRepository = module.get<Repository<DiscoveryRequest>>(getRepositoryToken(DiscoveryRequest));
    legalHoldRepository = module.get<Repository<LegalHold>>(getRepositoryToken(LegalHold));
    custodianRepository = module.get<Repository<Custodian>>(getRepositoryToken(Custodian));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe.skip('Discovery Requests', () => {
    describe('findAllRequests', () => {
      it('should return all discovery requests', async () => {
        (mockDiscoveryRequestRepository.find as jest.Mock).mockResolvedValue([mockDiscoveryRequest]);

        const result = await service.findAllRequests();

        expect(result).toEqual([mockDiscoveryRequest]);
      });
    });

    describe('findRequestsByCaseId', () => {
      it('should return discovery requests for a case', async () => {
        (mockDiscoveryRequestRepository.find as jest.Mock).mockResolvedValue([mockDiscoveryRequest]);

        const result = await service.findRequestsByCaseId('case-001');

        expect(result).toEqual([mockDiscoveryRequest]);
        expect(mockDiscoveryRequestRepository.find).toHaveBeenCalledWith({
          where: { caseId: 'case-001' },
        });
      });
    });

    describe('findRequestById', () => {
      it('should return a discovery request by id', async () => {
        (mockDiscoveryRequestRepository.findOne as jest.Mock).mockResolvedValue(mockDiscoveryRequest);

        const result = await service.findRequestById(mockDiscoveryRequest.id);

        expect(result).toEqual(mockDiscoveryRequest);
      });

      it('should throw NotFoundException if request not found', async () => {
        (mockDiscoveryRequestRepository.findOne as jest.Mock).mockResolvedValue(null);

        await expect(service.findRequestById('non-existent')).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe('createRequest', () => {
      it('should create a new discovery request', async () => {
        const createDto = {
          caseId: 'case-001',
          type: 'Interrogatories',
          title: 'First Set',
          dueDate: new Date('2024-02-15'),
        };

        mockDiscoveryRequestRepository.create.mockReturnValue(mockDiscoveryRequest);
        (mockDiscoveryRequestRepository.save as jest.Mock).mockResolvedValue(mockDiscoveryRequest);

        const result = await service.createRequest(createDto);

        expect(result).toEqual(mockDiscoveryRequest);
      });
    });

    describe('updateRequest', () => {
      it('should update a discovery request', async () => {
        const updateDto = { status: 'completed' };
        (mockDiscoveryRequestRepository.findOne as jest.Mock).mockResolvedValue(mockDiscoveryRequest);
        (mockDiscoveryRequestRepository.save as jest.Mock).mockResolvedValue({ ...mockDiscoveryRequest, ...updateDto });

        const result = await service.updateRequest(mockDiscoveryRequest.id, updateDto);

        expect(result.status).toBe('completed');
      });
    });

    describe('deleteRequest', () => {
      it('should delete a discovery request', async () => {
        (mockDiscoveryRequestRepository.findOne as jest.Mock).mockResolvedValue(mockDiscoveryRequest);
        (mockDiscoveryRequestRepository.delete as jest.Mock).mockResolvedValue({ affected: 1 });

        await service.deleteRequest(mockDiscoveryRequest.id);

        expect(mockDiscoveryRequestRepository.delete).toHaveBeenCalledWith(mockDiscoveryRequest.id);
      });
    });

    describe('getOverdueRequests', () => {
      it('should return overdue discovery requests', async () => {
        const mockQueryBuilder = {
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getMany: jest.fn().mockResolvedValue([mockDiscoveryRequest]),
        };
        mockDiscoveryRequestRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

        const result = await service.getOverdueRequests();

        expect(result).toEqual([mockDiscoveryRequest]);
      });
    });
  });

  describe('Legal Holds', () => {
    describe('findAllHolds', () => {
      it('should return all legal holds', async () => {
        (mockLegalHoldRepository.find as jest.Mock).mockResolvedValue([mockLegalHold]);

        const result = await service.findAllHolds();

        expect(result).toEqual([mockLegalHold]);
      });
    });

    describe('findHoldsByCaseId', () => {
      it('should return legal holds for a case', async () => {
        (mockLegalHoldRepository.find as jest.Mock).mockResolvedValue([mockLegalHold]);

        const result = await service.findHoldsByCaseId('case-001');

        expect(result).toEqual([mockLegalHold]);
      });
    });

    describe('findHoldById', () => {
      it('should return a legal hold by id', async () => {
        (mockLegalHoldRepository.findOne as jest.Mock).mockResolvedValue(mockLegalHold);

        const result = await service.findHoldById(mockLegalHold.id);

        expect(result).toEqual(mockLegalHold);
      });

      it('should throw NotFoundException if hold not found', async () => {
        (mockLegalHoldRepository.findOne as jest.Mock).mockResolvedValue(null);

        await expect(service.findHoldById('non-existent')).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe('createHold', () => {
      it('should create a new legal hold', async () => {
        const createDto = {
          caseId: 'case-001',
          name: 'New Hold',
          description: 'Description',
        };

        mockLegalHoldRepository.create.mockReturnValue(mockLegalHold);
        (mockLegalHoldRepository.save as jest.Mock).mockResolvedValue(mockLegalHold);

        const result = await service.createHold(createDto);

        expect(result).toEqual(mockLegalHold);
      });
    });

    describe('releaseHold', () => {
      it('should release a legal hold', async () => {
        (mockLegalHoldRepository.findOne as jest.Mock).mockResolvedValue(mockLegalHold);
        (mockLegalHoldRepository.save as jest.Mock).mockResolvedValue({
          ...mockLegalHold,
          status: 'released',
          endDate: expect.any(Date),
        });

        const result = await service.releaseHold(mockLegalHold.id);

        expect(result.status).toBe('released');
      });
    });

    describe('getActiveHolds', () => {
      it('should return active legal holds', async () => {
        (mockLegalHoldRepository.find as jest.Mock).mockResolvedValue([mockLegalHold]);

        const result = await service.getActiveHolds();

        expect(result).toEqual([mockLegalHold]);
        expect(mockLegalHoldRepository.find).toHaveBeenCalled();
      });
    });
  });

  describe('Custodians', () => {
    describe('findCustodiansByHoldId', () => {
      it('should return custodians for a legal hold', async () => {
        (mockCustodianRepository.find as jest.Mock).mockResolvedValue([mockCustodian]);

        const result = await service.findCustodiansByHoldId('hold-001');

        expect(result).toEqual([mockCustodian]);
      });
    });

    describe('createCustodian', () => {
      it('should create a new custodian', async () => {
        const createDto = {
          name: 'Jane Doe',
          email: 'jane@company.com',
          legalHoldId: 'hold-001',
        };

        mockCustodianRepository.create.mockReturnValue(mockCustodian);
        (mockCustodianRepository.save as jest.Mock).mockResolvedValue(mockCustodian);

        const result = await service.createCustodian(createDto);

        expect(result).toEqual(mockCustodian);
      });
    });

    describe('acknowledgeCustodian', () => {
      it('should mark custodian as acknowledged', async () => {
        (mockCustodianRepository.findOne as jest.Mock).mockResolvedValue(mockCustodian);
        (mockCustodianRepository.save as jest.Mock).mockResolvedValue({
          ...mockCustodian,
          acknowledgedAt: expect.any(Date),
        });

        const result = await service.acknowledgeCustodian(mockCustodian.id);

        expect(result.acknowledgedAt).toBeDefined();
      });
    });

    describe('getUnacknowledgedCustodians', () => {
      it('should return custodians who have not acknowledged', async () => {
        const unacknowledgedCustodian = { ...mockCustodian, acknowledgedAt: null };
        (mockCustodianRepository.find as jest.Mock).mockResolvedValue([unacknowledgedCustodian]);

        const result = await service.getUnacknowledgedCustodians('hold-001');

        expect(result).toEqual([unacknowledgedCustodian]);
      });
    });

    describe('deleteCustodian', () => {
      it('should delete a custodian', async () => {
        (mockCustodianRepository.findOne as jest.Mock).mockResolvedValue(mockCustodian);
        (mockCustodianRepository.delete as jest.Mock).mockResolvedValue({ affected: 1 });

        await service.deleteCustodian(mockCustodian.id);

        expect(mockCustodianRepository.delete).toHaveBeenCalledWith(mockCustodian.id);
      });
    });
  });

  describe('Statistics', () => {
    describe('getDiscoveryStats', () => {
      it('should return discovery statistics for a case', async () => {
        (mockDiscoveryRequestRepository.find as jest.Mock).mockResolvedValue([
          mockDiscoveryRequest,
          { ...mockDiscoveryRequest, status: 'completed' },
        ]);
        (mockLegalHoldRepository.find as jest.Mock).mockResolvedValue([mockLegalHold]);
        (mockCustodianRepository.find as jest.Mock).mockResolvedValue([mockCustodian]);

        const result = await service.getDiscoveryStats('case-001');

        expect(result).toHaveProperty('totalRequests');
        expect(result).toHaveProperty('pendingRequests');
        expect(result).toHaveProperty('completedRequests');
        expect(result).toHaveProperty('activeHolds');
        expect(result).toHaveProperty('totalCustodians');
      });
    });
  });

  // Additional Tests - Edge Cases
  describe('Discovery Requests - edge cases', () => {
    it('should return empty array when no discovery requests exist', async () => {
      (mockDiscoveryRequestRepository.find as jest.Mock).mockResolvedValue([]);

      const result = await service.findAllRequests();

      expect(result).toEqual([]);
    });

    it('should return empty array when no requests for case', async () => {
      (mockDiscoveryRequestRepository.find as jest.Mock).mockResolvedValue([]);

      const result = await service.findRequestsByCaseId('non-existent-case');

      expect(result).toEqual([]);
    });
  });

  describe('Legal Holds - edge cases', () => {
    it('should return empty array when no legal holds exist', async () => {
      (mockLegalHoldRepository.find as jest.Mock).mockResolvedValue([]);

      const result = await service.findAllHolds();

      expect(result).toEqual([]);
    });

    it('should return empty array when no holds for case', async () => {
      (mockLegalHoldRepository.find as jest.Mock).mockResolvedValue([]);

      const result = await service.findHoldsByCaseId('non-existent-case');

      expect(result).toEqual([]);
    });

    it('should return empty array when no active holds exist', async () => {
      (mockLegalHoldRepository.find as jest.Mock).mockResolvedValue([]);

      const result = await service.getActiveHolds();

      expect(result).toEqual([]);
    });
  });

  describe('Custodians - edge cases', () => {
    it('should return empty array when no custodians for hold', async () => {
      (mockCustodianRepository.find as jest.Mock).mockResolvedValue([]);

      const result = await service.findCustodiansByHoldId('non-existent-hold');

      expect(result).toEqual([]);
    });

    it('should throw NotFoundException when acknowledging non-existent custodian', async () => {
      (mockCustodianRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.acknowledgeCustodian('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
