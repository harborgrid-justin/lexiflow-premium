import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';
import { ApiKey } from './entities/api-key.entity';

describe('ApiKeysService', () => {
  let service: ApiKeysService;
  let repository: Repository<ApiKey>;

  const mockApiKey = {
    id: 'apikey-001',
    name: 'Production API Key',
    key: 'sk_live_abc123xyz789',
    keyHash: 'hashedkey123',
    prefix: 'sk_live',
    scopes: ['cases:read', 'documents:read', 'documents:write'],
    userId: 'user-001',
    expiresAt: new Date('2025-12-31'),
    lastUsed: new Date(),
    usageCount: 150,
    rateLimit: 1000,
    isActive: true,
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
        ApiKeysService,
        { provide: getRepositoryToken(ApiKey), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<ApiKeysService>(ApiKeysService);
    repository = module.get<Repository<ApiKey>>(getRepositoryToken(ApiKey));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all API keys for a user', async () => {
      mockRepository.find.mockResolvedValue([mockApiKey]);

      const result = await service.findAll('user-001');

      expect(result).toEqual([mockApiKey]);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { userId: 'user-001' },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findById', () => {
    it('should return an API key by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockApiKey);

      const result = await service.findById(mockApiKey.id, 'user-001');

      expect(result).toEqual(mockApiKey);
    });

    it('should throw NotFoundException if API key not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findById('non-existent', 'user-001')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new API key', async () => {
      const createDto = {
        name: 'New API Key',
        scopes: ['cases:read'],
        expiresAt: new Date('2025-06-30'),
      };

      mockRepository.create.mockReturnValue({ ...mockApiKey, ...createDto });
      mockRepository.save.mockResolvedValue({ ...mockApiKey, ...createDto });

      const result = await service.create(createDto, 'user-001');

      expect(result).toHaveProperty('name', createDto.name);
      expect(result).toHaveProperty('key');
    });

    it('should generate a unique key', async () => {
      const createDto = {
        name: 'New API Key',
        scopes: ['cases:read'],
      };

      mockRepository.create.mockReturnValue({ ...mockApiKey, ...createDto });
      mockRepository.save.mockResolvedValue({ ...mockApiKey, ...createDto });

      const result = await service.create(createDto, 'user-001');

      expect(result.key).toBeDefined();
      expect(result.key.startsWith('sk_')).toBe(true);
    });
  });

  describe('update', () => {
    it('should update an API key', async () => {
      const updateDto = { name: 'Updated API Key' };
      mockRepository.findOne.mockResolvedValue(mockApiKey);
      mockRepository.save.mockResolvedValue({ ...mockApiKey, ...updateDto });

      const result = await service.update(mockApiKey.id, updateDto, 'user-001');

      expect(result.name).toBe('Updated API Key');
    });

    it('should throw NotFoundException if API key not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent', {}, 'user-001')).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete an API key', async () => {
      mockRepository.findOne.mockResolvedValue(mockApiKey);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.delete(mockApiKey.id, 'user-001');

      expect(mockRepository.delete).toHaveBeenCalledWith(mockApiKey.id);
    });
  });

  describe('validateKey', () => {
    it('should validate a valid API key', async () => {
      mockRepository.findOne.mockResolvedValue(mockApiKey);
      mockRepository.save.mockResolvedValue({ ...mockApiKey, usageCount: 151 });

      const result = await service.validateKey('sk_live_abc123xyz789');

      expect(result).toHaveProperty('valid', true);
      expect(result).toHaveProperty('userId', mockApiKey.userId);
      expect(result).toHaveProperty('scopes', mockApiKey.scopes);
    });

    it('should reject invalid API key', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.validateKey('invalid_key')).rejects.toThrow(UnauthorizedException);
    });

    it('should reject expired API key', async () => {
      mockRepository.findOne.mockResolvedValue({
        ...mockApiKey,
        expiresAt: new Date('2020-01-01'),
      });

      await expect(service.validateKey('sk_live_abc123xyz789')).rejects.toThrow(UnauthorizedException);
    });

    it('should reject inactive API key', async () => {
      mockRepository.findOne.mockResolvedValue({
        ...mockApiKey,
        isActive: false,
      });

      await expect(service.validateKey('sk_live_abc123xyz789')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('revoke', () => {
    it('should revoke an API key', async () => {
      mockRepository.findOne.mockResolvedValue(mockApiKey);
      mockRepository.save.mockResolvedValue({ ...mockApiKey, isActive: false });

      const result = await service.revoke(mockApiKey.id, 'user-001');

      expect(result.isActive).toBe(false);
    });
  });

  describe('regenerate', () => {
    it('should regenerate an API key', async () => {
      mockRepository.findOne.mockResolvedValue(mockApiKey);
      mockRepository.save.mockResolvedValue({ ...mockApiKey, key: 'sk_live_newkey123' });

      const result = await service.regenerate(mockApiKey.id, 'user-001');

      expect(result.key).not.toBe(mockApiKey.key);
    });
  });

  describe('updateScopes', () => {
    it('should update API key scopes', async () => {
      const newScopes = ['cases:read', 'cases:write'];
      mockRepository.findOne.mockResolvedValue(mockApiKey);
      mockRepository.save.mockResolvedValue({ ...mockApiKey, scopes: newScopes });

      const result = await service.updateScopes(mockApiKey.id, newScopes, 'user-001');

      expect(result.scopes).toEqual(newScopes);
    });
  });

  describe('hasScope', () => {
    it('should return true if API key has scope', async () => {
      mockRepository.findOne.mockResolvedValue(mockApiKey);

      const result = await service.hasScope(mockApiKey.id, 'cases:read');

      expect(result).toBe(true);
    });

    it('should return false if API key does not have scope', async () => {
      mockRepository.findOne.mockResolvedValue(mockApiKey);

      const result = await service.hasScope(mockApiKey.id, 'admin:all');

      expect(result).toBe(false);
    });
  });

  describe('getUsageStats', () => {
    it('should return usage statistics', async () => {
      mockRepository.findOne.mockResolvedValue(mockApiKey);

      const result = await service.getUsageStats(mockApiKey.id, 'user-001');

      expect(result).toHaveProperty('totalRequests');
      expect(result).toHaveProperty('lastUsed');
      expect(result).toHaveProperty('rateLimit');
    });
  });

  describe('setRateLimit', () => {
    it('should set rate limit for API key', async () => {
      mockRepository.findOne.mockResolvedValue(mockApiKey);
      mockRepository.save.mockResolvedValue({ ...mockApiKey, rateLimit: 5000 });

      const result = await service.setRateLimit(mockApiKey.id, 5000, 'user-001');

      expect(result.rateLimit).toBe(5000);
    });
  });
});
