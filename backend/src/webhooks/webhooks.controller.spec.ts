import { Test, TestingModule } from '@nestjs/testing';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';

describe('WebhooksController', () => {
  let controller: WebhooksController;
  let service: WebhooksService;

  const mockWebhook = {
    id: 'webhook-001',
    name: 'Case Updates',
    url: 'https://example.com/webhooks/cases',
    secret: 'secret123',
    events: ['case.created', 'case.updated'],
    isActive: true,
    createdBy: 'user-001',
  };

  const mockDelivery = {
    id: 'delivery-001',
    webhookId: 'webhook-001',
    event: 'case.created',
    payload: { caseId: 'case-001' },
    responseStatus: 200,
    success: true,
  };

  const mockWebhooksService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    setActive: jest.fn(),
    regenerateSecret: jest.fn(),
    testWebhook: jest.fn(),
    getDeliveries: jest.fn(),
    retryDelivery: jest.fn(),
    findByEvent: jest.fn(),
    getStats: jest.fn(),
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
    it('should return all webhooks', async () => {
      mockWebhooksService.findAll.mockResolvedValue([mockWebhook]);

      const result = await controller.findAll();

      expect(result).toEqual([mockWebhook]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a webhook by id', async () => {
      mockWebhooksService.findById.mockResolvedValue(mockWebhook);

      const result = await controller.findById('webhook-001');

      expect(result).toEqual(mockWebhook);
      expect(service.findById).toHaveBeenCalledWith('webhook-001');
    });
  });

  describe('create', () => {
    it('should create a new webhook', async () => {
      const createDto = {
        name: 'New Webhook',
        url: 'https://example.com/webhook',
        events: ['document.created'],
      };
      mockWebhooksService.create.mockResolvedValue({ ...mockWebhook, ...createDto });

      const result = await controller.create(createDto, 'user-001');

      expect(result).toHaveProperty('name', createDto.name);
      expect(service.create).toHaveBeenCalledWith(createDto, 'user-001');
    });
  });

  describe('update', () => {
    it('should update a webhook', async () => {
      const updateDto = { name: 'Updated Webhook' };
      mockWebhooksService.update.mockResolvedValue({ ...mockWebhook, ...updateDto });

      const result = await controller.update('webhook-001', updateDto);

      expect(result.name).toBe('Updated Webhook');
      expect(service.update).toHaveBeenCalledWith('webhook-001', updateDto);
    });
  });

  describe('delete', () => {
    it('should delete a webhook', async () => {
      mockWebhooksService.delete.mockResolvedValue(undefined);

      await controller.delete('webhook-001');

      expect(service.delete).toHaveBeenCalledWith('webhook-001');
    });
  });

  describe('setActive', () => {
    it('should activate a webhook', async () => {
      mockWebhooksService.setActive.mockResolvedValue({ ...mockWebhook, isActive: true });

      const result = await controller.setActive('webhook-001', { isActive: true });

      expect(result.isActive).toBe(true);
      expect(service.setActive).toHaveBeenCalledWith('webhook-001', true);
    });
  });

  describe('regenerateSecret', () => {
    it('should regenerate webhook secret', async () => {
      mockWebhooksService.regenerateSecret.mockResolvedValue({ ...mockWebhook, secret: 'newSecret' });

      const result = await controller.regenerateSecret('webhook-001');

      expect(result.secret).toBe('newSecret');
      expect(service.regenerateSecret).toHaveBeenCalledWith('webhook-001');
    });
  });

  describe('testWebhook', () => {
    it('should send a test payload', async () => {
      mockWebhooksService.testWebhook.mockResolvedValue({ success: true, responseStatus: 200 });

      const result = await controller.testWebhook('webhook-001');

      expect(result).toHaveProperty('success', true);
      expect(service.testWebhook).toHaveBeenCalledWith('webhook-001');
    });
  });

  describe('getDeliveries', () => {
    it('should return webhook deliveries', async () => {
      mockWebhooksService.getDeliveries.mockResolvedValue([mockDelivery]);

      const result = await controller.getDeliveries('webhook-001');

      expect(result).toEqual([mockDelivery]);
      expect(service.getDeliveries).toHaveBeenCalledWith('webhook-001');
    });
  });

  describe('retryDelivery', () => {
    it('should retry a failed delivery', async () => {
      mockWebhooksService.retryDelivery.mockResolvedValue({ ...mockDelivery, attempts: 2 });

      const result = await controller.retryDelivery('delivery-001');

      expect(result.attempts).toBe(2);
      expect(service.retryDelivery).toHaveBeenCalledWith('delivery-001');
    });
  });

  describe('getStats', () => {
    it('should return webhook statistics', async () => {
      mockWebhooksService.getStats.mockResolvedValue({
        totalDeliveries: 100,
        successRate: 0.95,
        failedCount: 5,
      });

      const result = await controller.getStats('webhook-001');

      expect(result).toHaveProperty('totalDeliveries');
      expect(result).toHaveProperty('successRate');
      expect(service.getStats).toHaveBeenCalledWith('webhook-001');
    });
  });
});
