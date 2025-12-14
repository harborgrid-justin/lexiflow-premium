import { Test, TestingModule } from '@nestjs/testing';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsService } from './integrations.service';

describe('IntegrationsController', () => {
  let controller: IntegrationsController;
  let service: IntegrationsService;

  const mockIntegration = {
    id: 'integration-001',
    name: 'Salesforce',
    type: 'crm',
    provider: 'salesforce',
    status: 'active',
    config: { clientId: 'client123' },
    syncEnabled: true,
    lastSync: new Date(),
    createdBy: 'user-001',
  };

  const mockIntegrationsService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    refreshCredentials: jest.fn(),
    sync: jest.fn(),
    setSyncEnabled: jest.fn(),
    updateConfig: jest.fn(),
    findByType: jest.fn(),
    findByProvider: jest.fn(),
    testConnection: jest.fn(),
    getSyncHistory: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IntegrationsController],
      providers: [{ provide: IntegrationsService, useValue: mockIntegrationsService }],
    }).compile();

    controller = module.get<IntegrationsController>(IntegrationsController);
    service = module.get<IntegrationsService>(IntegrationsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all integrations', async () => {
      mockIntegrationsService.findAll.mockResolvedValue([mockIntegration]);

      const result = await controller.findAll();

      expect(result).toEqual([mockIntegration]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return an integration by id', async () => {
      mockIntegrationsService.findById.mockResolvedValue(mockIntegration);

      const result = await controller.findById('integration-001');

      expect(result).toEqual(mockIntegration);
      expect(service.findById).toHaveBeenCalledWith('integration-001');
    });
  });

  describe('create', () => {
    it('should create a new integration', async () => {
      const createDto = {
        name: 'New Integration',
        type: 'storage',
        provider: 'dropbox',
        config: { appKey: 'key123' },
      };
      mockIntegrationsService.create.mockResolvedValue({ ...mockIntegration, ...createDto });

      const result = await controller.create(createDto, 'user-001');

      expect(result).toHaveProperty('name', createDto.name);
      expect(service.create).toHaveBeenCalledWith(createDto, 'user-001');
    });
  });

  describe('update', () => {
    it('should update an integration', async () => {
      const updateDto = { name: 'Updated Integration' };
      mockIntegrationsService.update.mockResolvedValue({ ...mockIntegration, ...updateDto });

      const result = await controller.update('integration-001', updateDto);

      expect(result.name).toBe('Updated Integration');
      expect(service.update).toHaveBeenCalledWith('integration-001', updateDto);
    });
  });

  describe('delete', () => {
    it('should delete an integration', async () => {
      mockIntegrationsService.delete.mockResolvedValue(undefined);

      await controller.delete('integration-001');

      expect(service.delete).toHaveBeenCalledWith('integration-001');
    });
  });

  describe('connect', () => {
    it('should connect an integration', async () => {
      mockIntegrationsService.connect.mockResolvedValue({ ...mockIntegration, status: 'active' });

      const result = await controller.connect('integration-001', {
        accessToken: 'token',
        refreshToken: 'refresh',
      });

      expect(result.status).toBe('active');
      expect(service.connect).toHaveBeenCalled();
    });
  });

  describe('disconnect', () => {
    it('should disconnect an integration', async () => {
      mockIntegrationsService.disconnect.mockResolvedValue({ ...mockIntegration, status: 'disconnected' });

      const result = await controller.disconnect('integration-001');

      expect(result.status).toBe('disconnected');
      expect(service.disconnect).toHaveBeenCalledWith('integration-001');
    });
  });

  describe('sync', () => {
    it('should trigger sync', async () => {
      mockIntegrationsService.sync.mockResolvedValue({ success: true, recordsSynced: 50 });

      const result = await controller.sync('integration-001');

      expect(result).toHaveProperty('success', true);
      expect(service.sync).toHaveBeenCalledWith('integration-001');
    });
  });

  describe('setSyncEnabled', () => {
    it('should enable sync', async () => {
      mockIntegrationsService.setSyncEnabled.mockResolvedValue({ ...mockIntegration, syncEnabled: true });

      const result = await controller.setSyncEnabled('integration-001', { syncEnabled: true });

      expect(result.syncEnabled).toBe(true);
      expect(service.setSyncEnabled).toHaveBeenCalledWith('integration-001', true);
    });
  });

  describe('testConnection', () => {
    it('should test integration connection', async () => {
      mockIntegrationsService.testConnection.mockResolvedValue({ success: true, latency: 150 });

      const result = await controller.testConnection('integration-001');

      expect(result).toHaveProperty('success', true);
      expect(service.testConnection).toHaveBeenCalledWith('integration-001');
    });
  });

  describe('getSyncHistory', () => {
    it('should return sync history', async () => {
      mockIntegrationsService.getSyncHistory.mockResolvedValue([
        { id: 'sync-001', timestamp: new Date(), recordsSynced: 50 },
      ]);

      const result = await controller.getSyncHistory('integration-001');

      expect(result).toBeInstanceOf(Array);
      expect(service.getSyncHistory).toHaveBeenCalledWith('integration-001');
    });
  });
});
