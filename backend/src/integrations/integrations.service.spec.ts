import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import { Integration } from './entities/integration.entity';
import { expect, jest } from '@jest/globals';

describe('IntegrationsService', () => {
  let service: IntegrationsService;
  let repository: Repository<Integration>;

  const mockIntegration = {
    id: 'integration-001',
    name: 'Salesforce',
    type: 'crm',
    provider: 'salesforce',
    status: 'active',
    config: {
      clientId: 'client123',
      instanceUrl: 'https://example.salesforce.com',
    },
    credentials: {
      accessToken: 'token123',
      refreshToken: 'refresh123',
    },
    lastSync: new Date(),
    syncEnabled: true,
    syncInterval: 3600,
    createdBy: 'user-001',
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
  } as unknown as Repository<Integration>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IntegrationsService,
        { provide: getRepositoryToken(Integration), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<IntegrationsService>(IntegrationsService);
    repository = module.get<Repository<Integration>>(getRepositoryToken(Integration));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all integrations', async () => {
      service['integrations'].set(mockIntegration.id, mockIntegration);

      const result = await service.findAll();

      expect(result).toEqual([mockIntegration]);
    });
  });

  describe('findById', () => {
    it('should return an integration by id', async () => {
      service['integrations'].set(mockIntegration.id, mockIntegration);

      const result = await service.findById(mockIntegration.id);

      expect(result).toEqual(mockIntegration);
    });

    it('should throw NotFoundException if integration not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(NotFoundException);
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

      mockRepository.create.mockReturnValue({ ...mockIntegration, ...createDto });
      mockRepository.save.mockResolvedValue({ ...mockIntegration, ...createDto });

      const result = await service.create(createDto, 'user-001');

      expect(result).toHaveProperty('name', createDto.name);
    });
  });

  describe('update', () => {
    it('should update an integration', async () => {
      service['integrations'].set(mockIntegration.id, mockIntegration);
      const updateDto = { name: 'Updated Name' };

      const result = await service.update(mockIntegration.id, updateDto);

      expect(result.name).toBe('Updated Integration');
    });

    it('should throw NotFoundException if integration not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete an integration', async () => {
      service['integrations'].set(mockIntegration.id, mockIntegration);

      await service.delete(mockIntegration.id);

      expect(mockRepository.delete).toHaveBeenCalledWith(mockIntegration.id);
    });
  });

  describe('connect', () => {
    it('should connect an integration', async () => {
      const pendingIntegration = { ...mockIntegration, status: 'pending' };
      mockRepository.findOne.mockResolvedValue(pendingIntegration);
      mockRepository.save.mockResolvedValue({ ...pendingIntegration, status: 'active' });

      const result = await service.connect(mockIntegration.id, {
        accessToken: 'newToken',
        refreshToken: 'newRefresh',
      });

      expect(result.status).toBe('active');
    });
  });

  describe('disconnect', () => {
    it('should disconnect an integration', async () => {
      service['integrations'].set(mockIntegration.id, mockIntegration);

      const result = await service.disconnect(mockIntegration.id);

      expect(result.status).toBe('disconnected');
    });
  });

  describe('refreshCredentials', () => {
    it('should refresh integration credentials', async () => {
      const activeIntegration = { ...mockIntegration, status: 'active' };
      service['integrations'].set(activeIntegration.id, activeIntegration);

      const result = await service.refreshCredentials(mockIntegration.id);

      expect(result.credentials).toBeDefined();
    });

    it('should throw BadRequestException if integration not active', async () => {
      const inactiveIntegration = { ...mockIntegration, status: 'disconnected' };
      service['integrations'].set(inactiveIntegration.id, inactiveIntegration);

      await expect(service.refreshCredentials(inactiveIntegration.id)).rejects.toThrow(BadRequestException);
    });
  });

  describe('sync', () => {
    it('should trigger sync for an integration', async () => {
      const enabledIntegration = { ...mockIntegration, syncEnabled: true };
      service['integrations'].set(enabledIntegration.id, enabledIntegration);

      const result = await service.sync(mockIntegration.id);

      expect(result.lastSyncedAt).toBeDefined();
    });

    it('should throw BadRequestException if sync not enabled', async () => {
      const disabledIntegration = { ...mockIntegration, syncEnabled: false };
      service['integrations'].set(disabledIntegration.id, disabledIntegration);

      await expect(service.sync(disabledIntegration.id)).rejects.toThrow(BadRequestException);
    });
  });

  describe('setSyncEnabled', () => {
    it('should enable sync', async () => {
      service['integrations'].set(mockIntegration.id, mockIntegration);

      const result = await service.setSyncEnabled(mockIntegration.id, true);

      expect(result.syncEnabled).toBe(true);
    });
  });

  describe('updateConfig', () => {
    it('should update integration config', async () => {
      service['integrations'].set(mockIntegration.id, mockIntegration);
      const newConfig = { clientId: 'newClient' };

      const result = await service.updateConfig(mockIntegration.id, newConfig);

      expect(result.config).toEqual(newConfig);
    });
  });

  describe('findByType', () => {
    it('should return integrations by type', async () => {
      service['integrations'].set(mockIntegration.id, mockIntegration);

      const result = await service.findByType('crm');

      expect(result).toEqual([mockIntegration]);
    });
  });

  describe('findByProvider', () => {
    it('should return integrations by provider', async () => {
      service['integrations'].set(mockIntegration.id, mockIntegration);

      const result = await service.findByProvider('salesforce');

      expect(result).toEqual([mockIntegration]);
    });
  });

  describe('testConnection', () => {
    it('should test integration connection', async () => {
      mockRepository.findOne.mockResolvedValue(mockIntegration);

      const result = await service.testConnection(mockIntegration.id);

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('latency');
    });
  });

  describe('getSyncHistory', () => {
    it('should return sync history', async () => {
      const result = await service.getSyncHistory(mockIntegration.id);

      expect(result).toBeInstanceOf(Array);
    });
  });
});
