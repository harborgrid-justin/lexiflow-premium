import { Test, TestingModule } from '@nestjs/testing';
import { ApiKeysController } from './api-keys.controller';
import { ApiKeysService } from './api-keys.service';
import { ApiKeyScope } from './dto/create-api-key.dto';

describe('ApiKeysController', () => {
  let controller: ApiKeysController;
  let service: ApiKeysService;

  const mockApiKey = {
    id: 'apikey-001',
    name: 'Test API Key',
    key: 'test-key-hash',
    isActive: true,
    createdAt: new Date(),
    createdBy: 'user-001',
  };

  const mockApiKeysService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    revoke: jest.fn(),
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
    it('should return all API keys', async () => {
      mockApiKeysService.findAll.mockResolvedValue([mockApiKey]);

      const result = await controller.findAll();

      expect(result).toEqual([mockApiKey]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return an API key by id', async () => {
      mockApiKeysService.findOne.mockResolvedValue(mockApiKey);

      const result = await controller.findOne('apikey-001');

      expect(result).toEqual(mockApiKey);
      expect(service.findOne).toHaveBeenCalledWith('apikey-001', 'temp-admin-id');
    });
  });

  describe('create', () => {
    it('should create a new API key', async () => {
      const createDto = {
        name: 'New API Key',
        scopes: [ApiKeyScope.READ, ApiKeyScope.WRITE],
      };
      mockApiKeysService.create.mockResolvedValue({ ...mockApiKey, ...createDto });

      const result = await controller.create(createDto);

      expect(result).toHaveProperty('name', createDto.name);
      expect(service.create).toHaveBeenCalledWith(createDto, 'temp-admin-id');
    });
  });

  describe('revoke', () => {
    it('should revoke an API key', async () => {
      mockApiKeysService.revoke.mockResolvedValue(undefined);

      await controller.revoke('apikey-001');

      expect(service.revoke).toHaveBeenCalledWith('apikey-001', 'temp-admin-id');
    });
  });
});
