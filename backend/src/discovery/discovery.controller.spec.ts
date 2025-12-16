import { Test, TestingModule } from '@nestjs/testing';
import { DiscoveryController } from './discovery.controller';
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
    search: jest.fn(),
    findAll: jest.fn() as jest.MockedFunction<any>,
    findOne: jest.fn() as jest.MockedFunction<any>,
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
      (mockDiscoveryService.findAll as jest.Mock).mockResolvedValue([mockDiscoveryRequest]);

      const result = await controller.findAll();

      expect(result).toEqual([mockDiscoveryRequest]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a discovery request by id', async () => {
      (mockDiscoveryService.findOne as jest.Mock).mockResolvedValue(mockDiscoveryRequest);

      const result = await controller.findOne('discovery-001');

      expect(result).toEqual(mockDiscoveryRequest);
      expect(service.findOne).toHaveBeenCalledWith('discovery-001');
    });
  });

  describe('create', () => {
    it('should create a new discovery request', async () => {
      const createDto = {
        caseId: 'case-001',
        type: 'document_request',
        title: 'Document Request',
      };
      (mockDiscoveryService.create as jest.Mock).mockResolvedValue({ ...mockDiscoveryRequest, ...createDto });

      const result = await controller.create(createDto);

      expect(result).toHaveProperty('title', createDto.title);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

});
