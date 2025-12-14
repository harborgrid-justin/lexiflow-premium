import { Test, TestingModule } from '@nestjs/testing';
import { ApiKeysController } from './api-keys.controller';
import { ApiKeysService } from './api-keys.service';

describe('ApiKeysController', () => {
  let controller: ApiKeysController;
  let service: ApiKeysService;

  const mockApiKey = {
    id: 'apikey-001',
    name: 'Production API Key',
    key: 'sk_live_abc123xyz789',
    prefix: 'sk_live',
    scopes: ['cases:read', 'documents:read'],
    userId: 'user-001',
    expiresAt: new Date('2025-12-31'),
    usageCount: 150,
    rateLimit: 1000,
    isActive: true,
  };

  const mockApiKeysService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    validateKey: jest.fn(),
    revoke: jest.fn(),
    regenerate: jest.fn(),
    updateScopes: jest.fn(),
    hasScope: jest.fn(),
    getUsageStats: jest.fn(),
    setRateLimit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApiKeysController],
      providers: [{ provide: ApiKeysService, useValue: mockApiKeysService }],
    }).compile();

    controller = module.get<ApiKeysController>(ApiKeysController);
    service = module.get<ApiKeysService>(ApiKeysService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all API keys for user', async () => {
      mockApiKeysService.findAll.mockResolvedValue([mockApiKey]);

      const result = await controller.findAll('user-001');

      expect(result).toEqual([mockApiKey]);
      expect(service.findAll).toHaveBeenCalledWith('user-001');
    });
  });

  describe('findById', () => {
    it('should return an API key by id', async () => {
      mockApiKeysService.findById.mockResolvedValue(mockApiKey);

      const result = await controller.findById('apikey-001', 'user-001');

      expect(result).toEqual(mockApiKey);
      expect(service.findById).toHaveBeenCalledWith('apikey-001', 'user-001');
    });
  });

  describe('create', () => {
    it('should create a new API key', async () => {
      const createDto = {
        name: 'New API Key',
        scopes: ['cases:read'],
      };
      mockApiKeysService.create.mockResolvedValue({ ...mockApiKey, ...createDto });

      const result = await controller.create(createDto, 'user-001');

      expect(result).toHaveProperty('name', createDto.name);
      expect(result).toHaveProperty('key');
      expect(service.create).toHaveBeenCalledWith(createDto, 'user-001');
    });
  });

  describe('update', () => {
    it('should update an API key', async () => {
      const updateDto = { name: 'Updated API Key' };
      mockApiKeysService.update.mockResolvedValue({ ...mockApiKey, ...updateDto });

      const result = await controller.update('apikey-001', updateDto, 'user-001');

      expect(result.name).toBe('Updated API Key');
      expect(service.update).toHaveBeenCalledWith('apikey-001', updateDto, 'user-001');
    });
  });

  describe('delete', () => {
    it('should delete an API key', async () => {
      mockApiKeysService.delete.mockResolvedValue(undefined);

      await controller.delete('apikey-001', 'user-001');

      expect(service.delete).toHaveBeenCalledWith('apikey-001', 'user-001');
    });
  });

  describe('revoke', () => {
    it('should revoke an API key', async () => {
      mockApiKeysService.revoke.mockResolvedValue({ ...mockApiKey, isActive: false });

      const result = await controller.revoke('apikey-001', 'user-001');

      expect(result.isActive).toBe(false);
      expect(service.revoke).toHaveBeenCalledWith('apikey-001', 'user-001');
    });
  });

  describe('regenerate', () => {
    it('should regenerate an API key', async () => {
      mockApiKeysService.regenerate.mockResolvedValue({ ...mockApiKey, key: 'sk_live_newkey123' });

      const result = await controller.regenerate('apikey-001', 'user-001');

      expect(result.key).not.toBe(mockApiKey.key);
      expect(service.regenerate).toHaveBeenCalledWith('apikey-001', 'user-001');
    });
  });

  describe('updateScopes', () => {
    it('should update API key scopes', async () => {
      const newScopes = ['cases:read', 'cases:write'];
      mockApiKeysService.updateScopes.mockResolvedValue({ ...mockApiKey, scopes: newScopes });

      const result = await controller.updateScopes('apikey-001', { scopes: newScopes }, 'user-001');

      expect(result.scopes).toEqual(newScopes);
      expect(service.updateScopes).toHaveBeenCalledWith('apikey-001', newScopes, 'user-001');
    });
  });

  describe('getUsageStats', () => {
    it('should return usage statistics', async () => {
      mockApiKeysService.getUsageStats.mockResolvedValue({
        totalRequests: 150,
        lastUsed: new Date(),
        rateLimit: 1000,
      });

      const result = await controller.getUsageStats('apikey-001', 'user-001');

      expect(result).toHaveProperty('totalRequests');
      expect(service.getUsageStats).toHaveBeenCalledWith('apikey-001', 'user-001');
    });
  });

  describe('setRateLimit', () => {
    it('should set rate limit', async () => {
      mockApiKeysService.setRateLimit.mockResolvedValue({ ...mockApiKey, rateLimit: 5000 });

      const result = await controller.setRateLimit('apikey-001', { rateLimit: 5000 }, 'user-001');

      expect(result.rateLimit).toBe(5000);
      expect(service.setRateLimit).toHaveBeenCalledWith('apikey-001', 5000, 'user-001');
    });
  });
});
