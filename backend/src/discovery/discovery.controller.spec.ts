import { Test, TestingModule } from '@nestjs/testing';
import { DiscoveryController } from './controllers/discovery.controller';
import { DiscoveryService } from './discovery.service';
import { expect, jest } from '@jest/globals';

describe('DiscoveryController', () => {
  let controller: DiscoveryController;
  let service: DiscoveryService;

  const mockDiscoveryRequest = {
    id: 'discovery-001',
    caseId: 'case-001',
    type: 'interrogatories',
    title: 'First Set of Interrogatories',
    status: 'pending',
    requestingParty: 'plaintiff',
    respondingParty: 'defendant',
    servedDate: new Date(),
    dueDate: new Date(),
    documents: [],
  };

  const mockLegalHold = {
    id: 'hold-001',
    caseId: 'case-001',
    name: 'Litigation Hold - Smith v. Jones',
    status: 'active',
    custodians: ['user-001', 'user-002'],
  };

  const mockDiscoveryService = {
    getAll: jest.fn(),
    findByCaseId: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    createRequest: jest.fn(),
    update: jest.fn(),
    updateRequest: jest.fn(),
    delete: jest.fn(),
    deleteRequest: jest.fn(),
    findByType: jest.fn(),
    findByStatus: jest.fn(),
    serve: jest.fn(),
    serveRequest: jest.fn(),
    respond: jest.fn(),
    respondToRequest: jest.fn(),
    getOverdue: jest.fn(),
    getOverdueRequests: jest.fn(),
    createLegalHold: jest.fn(),
    createHold: jest.fn(),
    getLegalHolds: jest.fn(),
    getHolds: jest.fn(),
    releaseLegalHold: jest.fn(),
    releaseHold: jest.fn(),
    addCustodian: jest.fn(),
    removeCustodian: jest.fn(),
    search: jest.fn<any, any>(),
    findAll: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiscoveryController],
      providers: [{ provide: DiscoveryService, useValue: mockDiscoveryService }],
    }).compile();

    controller = module.get<DiscoveryController>(DiscoveryController);
    service = module.get<DiscoveryService>(DiscoveryService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all discovery requests', async () => {
      mockDiscoveryService.findAll.mockResolvedValue([mockDiscoveryRequest]);

      const result = await controller.findAll();

      expect(result).toEqual([mockDiscoveryRequest]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findByCaseId', () => {
    it('should return discovery requests for a case', async () => {
      mockDiscoveryService.findByCaseId.mockResolvedValue([mockDiscoveryRequest]);

      const result = await controller.findByCaseId('case-001');

      expect(result).toEqual([mockDiscoveryRequest]);
      expect(service.findByCaseId).toHaveBeenCalledWith('case-001');
    });
  });

  describe('findById', () => {
    it('should return a discovery request by id', async () => {
      mockDiscoveryService.findById.mockResolvedValue(mockDiscoveryRequest);

      const result = await controller.findById('discovery-001');

      expect(result).toEqual(mockDiscoveryRequest);
      expect(service.findById).toHaveBeenCalledWith('discovery-001');
    });
  });

  describe('create', () => {
    it('should create a new discovery request', async () => {
      const createDto = {
        caseId: 'case-001',
        type: 'document_request',
        title: 'Document Request',
      };
      mockDiscoveryService.create.mockResolvedValue({ ...mockDiscoveryRequest, ...createDto });

      const result = await controller.create(createDto);

      expect(result).toHaveProperty('title', createDto.title);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update a discovery request', async () => {
      const updateDto = { title: 'Updated Title' };
      mockDiscoveryService.update.mockResolvedValue({ ...mockDiscoveryRequest, ...updateDto });

      const result = await controller.update('discovery-001', updateDto);

      expect(result.title).toBe('Updated Title');
      expect(service.update).toHaveBeenCalledWith('discovery-001', updateDto);
    });
  });

  describe('delete', () => {
    it('should delete a discovery request', async () => {
      mockDiscoveryService.delete.mockResolvedValue(undefined);

      await controller.delete('discovery-001');

      expect(service.delete).toHaveBeenCalledWith('discovery-001');
    });
  });

  describe('serve', () => {
    it('should serve a discovery request', async () => {
      mockDiscoveryService.serve.mockResolvedValue({ ...mockDiscoveryRequest, status: 'served' });

      const result = await controller.serve('discovery-001');

      expect(result.status).toBe('served');
      expect(service.serve).toHaveBeenCalledWith('discovery-001');
    });
  });

  describe('respond', () => {
    it('should respond to a discovery request', async () => {
      const responseDto = { response: 'Response content', documents: ['doc-001'] };
      mockDiscoveryService.respond.mockResolvedValue({ ...mockDiscoveryRequest, status: 'responded' });

      const result = await controller.respond('discovery-001', responseDto);

      expect(result.status).toBe('responded');
      expect(service.respond).toHaveBeenCalledWith('discovery-001', responseDto);
    });
  });

  describe('getOverdue', () => {
    it('should return overdue discovery requests', async () => {
      mockDiscoveryService.getOverdue.mockResolvedValue([mockDiscoveryRequest]);

      const result = await controller.getOverdue();

      expect(result).toEqual([mockDiscoveryRequest]);
      expect(service.getOverdue).toHaveBeenCalled();
    });
  });

  describe('createLegalHold', () => {
    it('should create a legal hold', async () => {
      const createDto = {
        caseId: 'case-001',
        name: 'New Hold',
        custodians: ['user-001'],
      };
      mockDiscoveryService.createLegalHold.mockResolvedValue({ ...mockLegalHold, ...createDto });

      const result = await controller.createLegalHold(createDto);

      expect(result).toHaveProperty('name', createDto.name);
      expect(service.createLegalHold).toHaveBeenCalledWith(createDto);
    });
  });

  describe('getLegalHolds', () => {
    it('should return legal holds for a case', async () => {
      mockDiscoveryService.getLegalHolds.mockResolvedValue([mockLegalHold]);

      const result = await controller.getLegalHolds('case-001');

      expect(result).toEqual([mockLegalHold]);
      expect(service.getLegalHolds).toHaveBeenCalledWith('case-001');
    });
  });

  describe('releaseLegalHold', () => {
    it('should release a legal hold', async () => {
      mockDiscoveryService.releaseLegalHold.mockResolvedValue({ ...mockLegalHold, status: 'released' });

      const result = await controller.releaseLegalHold('hold-001');

      expect(result.status).toBe('released');
      expect(service.releaseLegalHold).toHaveBeenCalledWith('hold-001');
    });
  });

  describe('addCustodian', () => {
    it('should add a custodian to legal hold', async () => {
      mockDiscoveryService.addCustodian.mockResolvedValue({
        ...mockLegalHold,
        custodians: [...mockLegalHold.custodians, 'user-003'],
      });

      const result = await controller.addCustodian('hold-001', { userId: 'user-003' });

      expect(result.custodians).toContain('user-003');
      expect(service.addCustodian).toHaveBeenCalledWith('hold-001', 'user-003');
    });
  });

  describe('search', () => {
    it('should search discovery requests', async () => {
      mockDiscoveryService.search.mockResolvedValue({ data: [mockDiscoveryRequest], total: 1 });

      const result = await controller.search({ query: 'interrogatories', page: 1, limit: 10 });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total', 1);
    });
  });
});
