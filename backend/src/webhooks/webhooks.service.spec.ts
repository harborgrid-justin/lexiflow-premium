import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { Webhook } from './entities/webhook.entity';
import { WebhookDelivery } from './entities/webhook-delivery.entity';

describe('WebhooksService', () => {
  let service: WebhooksService;
  let webhookRepository: Repository<Webhook>;
  let deliveryRepository: Repository<WebhookDelivery>;

  const mockWebhook = {
    id: 'webhook-001',
    name: 'Case Updates',
    url: 'https://example.com/webhooks/cases',
    secret: 'secret123',
    events: ['case.created', 'case.updated'],
    isActive: true,
    createdBy: 'user-001',
    headers: { 'X-Custom-Header': 'value' },
    retryCount: 3,
    lastDelivery: new Date(),
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDelivery = {
    id: 'delivery-001',
    webhookId: 'webhook-001',
    event: 'case.created',
    payload: { caseId: 'case-001' },
    responseStatus: 200,
    responseBody: '{"success": true}',
    deliveredAt: new Date(),
    attempts: 1,
    success: true,
  };

  const mockWebhookRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockDeliveryRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhooksService,
        { provide: getRepositoryToken(Webhook), useValue: mockWebhookRepository },
        { provide: getRepositoryToken(WebhookDelivery), useValue: mockDeliveryRepository },
      ],
    }).compile();

    service = module.get<WebhooksService>(WebhooksService);
    webhookRepository = module.get<Repository<Webhook>>(getRepositoryToken(Webhook));
    deliveryRepository = module.get<Repository<WebhookDelivery>>(getRepositoryToken(WebhookDelivery));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all webhooks', async () => {
      mockWebhookRepository.find.mockResolvedValue([mockWebhook]);

      const result = await service.findAll();

      expect(result).toEqual([mockWebhook]);
    });
  });

  describe('findById', () => {
    it('should return a webhook by id', async () => {
      mockWebhookRepository.findOne.mockResolvedValue(mockWebhook);

      const result = await service.findById(mockWebhook.id);

      expect(result).toEqual(mockWebhook);
    });

    it('should throw NotFoundException if webhook not found', async () => {
      mockWebhookRepository.findOne.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new webhook', async () => {
      const createDto = {
        name: 'New Webhook',
        url: 'https://example.com/webhook',
        events: ['document.created'],
      };

      mockWebhookRepository.create.mockReturnValue({ ...mockWebhook, ...createDto });
      mockWebhookRepository.save.mockResolvedValue({ ...mockWebhook, ...createDto });

      const result = await service.create(createDto, 'user-001');

      expect(result).toHaveProperty('name', createDto.name);
    });

    it('should generate a secret if not provided', async () => {
      const createDto = {
        name: 'New Webhook',
        url: 'https://example.com/webhook',
        events: ['document.created'],
      };

      mockWebhookRepository.create.mockReturnValue({ ...mockWebhook, ...createDto });
      mockWebhookRepository.save.mockResolvedValue({ ...mockWebhook, ...createDto });

      const result = await service.create(createDto, 'user-001');

      expect(result).toHaveProperty('secret');
    });
  });

  describe('update', () => {
    it('should update a webhook', async () => {
      const updateDto = { name: 'Updated Webhook' };
      mockWebhookRepository.findOne.mockResolvedValue(mockWebhook);
      mockWebhookRepository.save.mockResolvedValue({ ...mockWebhook, ...updateDto });

      const result = await service.update(mockWebhook.id, updateDto);

      expect(result.name).toBe('Updated Webhook');
    });

    it('should throw NotFoundException if webhook not found', async () => {
      mockWebhookRepository.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a webhook', async () => {
      mockWebhookRepository.findOne.mockResolvedValue(mockWebhook);
      mockWebhookRepository.delete.mockResolvedValue({ affected: 1 });

      await service.delete(mockWebhook.id);

      expect(mockWebhookRepository.delete).toHaveBeenCalledWith(mockWebhook.id);
    });
  });

  describe('setActive', () => {
    it('should activate a webhook', async () => {
      mockWebhookRepository.findOne.mockResolvedValue({ ...mockWebhook, isActive: false });
      mockWebhookRepository.save.mockResolvedValue({ ...mockWebhook, isActive: true });

      const result = await service.setActive(mockWebhook.id, true);

      expect(result.isActive).toBe(true);
    });

    it('should deactivate a webhook', async () => {
      mockWebhookRepository.findOne.mockResolvedValue(mockWebhook);
      mockWebhookRepository.save.mockResolvedValue({ ...mockWebhook, isActive: false });

      const result = await service.setActive(mockWebhook.id, false);

      expect(result.isActive).toBe(false);
    });
  });

  describe('regenerateSecret', () => {
    it('should regenerate webhook secret', async () => {
      mockWebhookRepository.findOne.mockResolvedValue(mockWebhook);
      mockWebhookRepository.save.mockResolvedValue({ ...mockWebhook, secret: 'newSecret123' });

      const result = await service.regenerateSecret(mockWebhook.id);

      expect(result.secret).not.toBe(mockWebhook.secret);
    });
  });

  describe('testWebhook', () => {
    it('should send a test payload', async () => {
      mockWebhookRepository.findOne.mockResolvedValue(mockWebhook);

      const result = await service.testWebhook(mockWebhook.id);

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('responseStatus');
    });
  });

  describe('deliver', () => {
    it('should deliver webhook payload', async () => {
      mockWebhookRepository.find.mockResolvedValue([mockWebhook]);
      mockDeliveryRepository.create.mockReturnValue(mockDelivery);
      mockDeliveryRepository.save.mockResolvedValue(mockDelivery);

      await service.deliver('case.created', { caseId: 'case-001' });

      expect(mockDeliveryRepository.save).toHaveBeenCalled();
    });
  });

  describe('getDeliveries', () => {
    it('should return webhook deliveries', async () => {
      mockDeliveryRepository.find.mockResolvedValue([mockDelivery]);

      const result = await service.getDeliveries(mockWebhook.id);

      expect(result).toEqual([mockDelivery]);
    });
  });

  describe('retryDelivery', () => {
    it('should retry a failed delivery', async () => {
      const failedDelivery = { ...mockDelivery, success: false };
      mockDeliveryRepository.findOne.mockResolvedValue(failedDelivery);
      mockWebhookRepository.findOne.mockResolvedValue(mockWebhook);
      mockDeliveryRepository.save.mockResolvedValue({ ...failedDelivery, attempts: 2 });

      const result = await service.retryDelivery(failedDelivery.id);

      expect(result.attempts).toBe(2);
    });

    it('should throw BadRequestException for successful delivery', async () => {
      mockDeliveryRepository.findOne.mockResolvedValue(mockDelivery);

      await expect(service.retryDelivery(mockDelivery.id)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findByEvent', () => {
    it('should return webhooks subscribed to an event', async () => {
      mockWebhookRepository.find.mockResolvedValue([mockWebhook]);

      const result = await service.findByEvent('case.created');

      expect(result).toEqual([mockWebhook]);
    });
  });

  describe('getStats', () => {
    it('should return webhook statistics', async () => {
      mockDeliveryRepository.find.mockResolvedValue([mockDelivery]);

      const result = await service.getStats(mockWebhook.id);

      expect(result).toHaveProperty('totalDeliveries');
      expect(result).toHaveProperty('successRate');
      expect(result).toHaveProperty('failedCount');
    });
  });
});
