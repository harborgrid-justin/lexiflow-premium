import { Test, TestingModule } from '@nestjs/testing';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { WebhookEvent } from './dto/create-webhook.dto';

describe('WebhooksController', () => {
  let controller: WebhooksController;
  let service: WebhooksService;

  const mockUser = { id: 'user-001', email: 'test@example.com' };
  const mockWebhook = {
    id: 'webhook-001',
    name: 'Test Webhook',
    url: 'https://example.com/webhook',
    events: [WebhookEvent.CASE_CREATED],
    isActive: true,
    createdBy: 'user-001',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockWebhooksService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhooksController],
      providers: [{ provide: WebhooksService, useValue: mockWebhooksService }],
    }).compile();

    controller = module.get<WebhooksController>(WebhooksController);
    service = module.get<WebhooksService>(WebhooksService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all webhooks for a user', async () => {
      mockWebhooksService.findAll.mockResolvedValue([mockWebhook]);

      const result = await controller.findAll(mockUser);

      expect(result).toEqual([mockWebhook]);
      expect(service.findAll).toHaveBeenCalledWith('user-001');
    });
  });

  describe('findOne', () => {
    it('should return a webhook by id', async () => {
      mockWebhooksService.findOne.mockResolvedValue(mockWebhook);

      const result = await controller.findOne('webhook-001', mockUser);

      expect(result).toEqual(mockWebhook);
      expect(service.findOne).toHaveBeenCalledWith('webhook-001', 'user-001');
    });
  });

  describe('create', () => {
    it('should create a new webhook', async () => {
      const createDto = {
        name: 'New Webhook',
        url: 'https://example.com/new',
        events: [WebhookEvent.DOCUMENT_UPLOADED],
      };
      mockWebhooksService.create.mockResolvedValue({ ...mockWebhook, ...createDto });

      const result = await controller.create(createDto, mockUser);

      expect(result).toHaveProperty('name', createDto.name);
      expect(service.create).toHaveBeenCalledWith(createDto, 'user-001');
    });
  });

  describe('update', () => {
    it('should update a webhook', async () => {
      const updateDto = { name: 'Updated Webhook' };
      mockWebhooksService.update.mockResolvedValue({ ...mockWebhook, ...updateDto });

      const result = await controller.update('webhook-001', updateDto, mockUser);

      expect(result.name).toBe('Updated Webhook');
      expect(service.update).toHaveBeenCalledWith('webhook-001', updateDto, 'user-001');
    });
  });

  describe('remove', () => {
    it('should delete a webhook', async () => {
      mockWebhooksService.remove.mockResolvedValue(undefined);

      await controller.remove('webhook-001', mockUser);

      expect(service.remove).toHaveBeenCalledWith('webhook-001', 'user-001');
    });
  });
});
