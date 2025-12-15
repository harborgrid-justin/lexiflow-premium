import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { WebhooksService, Webhook } from './webhooks.service';
import { WebhookEvent, WebhookDelivery } from './dto';

describe('WebhooksService', () => {
  let service: WebhooksService;

  const mockWebhook: Webhook = {
    id: 'webhook-001',
    name: 'Case Updates',
    url: 'https://example.com/webhooks/cases',
    secret: 'secret123',
    events: [WebhookEvent.CASE_CREATED, WebhookEvent.CASE_UPDATED],
    active: true,
    userId: 'user-001',
    headers: { 'X-Custom-Header': 'value' },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDelivery: WebhookDelivery = {
    id: 'delivery-001',
    webhookId: 'webhook-001',
    event: WebhookEvent.CASE_CREATED,
    payload: {
      event: WebhookEvent.CASE_CREATED,
      timestamp: new Date(),
      data: { caseId: 'case-001' },
      webhookId: 'webhook-001',
      deliveryId: 'delivery-001',
    },
    status: 'success',
    attempts: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastAttemptAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WebhooksService],
    }).compile();

    service = module.get<WebhooksService>(WebhooksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all webhooks for user', async () => {
      await service.create({
        name: 'Test Webhook',
        url: 'https://example.com/webhook',
        events: [WebhookEvent.CASE_CREATED],
      }, 'user-001');

      const result = await service.findAll('user-001');

      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('name');
    });
  });

  describe('findOne', () => {
    it('should return a webhook by id', async () => {
      const created = await service.create({
        name: 'Test Webhook',
        url: 'https://example.com/webhook',
        events: [WebhookEvent.CASE_CREATED],
      }, 'user-001');

      const result = await service.findOne(created.id, 'user-001');

      expect(result).toEqual(created);
    });

    it('should throw NotFoundException if webhook not found', async () => {
      await expect(service.findOne('non-existent', 'user-001')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new webhook', async () => {
      const createDto = {
        name: 'New Webhook',
        url: 'https://example.com/webhook',
        events: [WebhookEvent.DOCUMENT_UPLOADED],
      };

      const result = await service.create(createDto, 'user-001');

      expect(result).toHaveProperty('name', createDto.name);
      expect(result).toHaveProperty('id');
      expect(result.active).toBe(true);
    });

    it('should set active flag from DTO', async () => {
      const createDto = {
        name: 'Inactive Webhook',
        url: 'https://example.com/webhook',
        events: [WebhookEvent.DOCUMENT_UPLOADED],
        active: false,
      };

      const result = await service.create(createDto, 'user-001');

      expect(result.active).toBe(false);
    });
  });

  describe('update', () => {
    it('should update a webhook', async () => {
      const created = await service.create({
        name: 'Original Name',
        url: 'https://example.com/webhook',
        events: [WebhookEvent.CASE_CREATED],
      }, 'user-001');

      const updateDto = { name: 'Updated Webhook' };
      const result = await service.update(created.id, updateDto, 'user-001');

      expect(result.name).toBe('Updated Webhook');
    });

    it('should throw NotFoundException if webhook not found', async () => {
      await expect(service.update('non-existent', {}, 'user-001')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a webhook', async () => {
      const created = await service.create({
        name: 'To Delete',
        url: 'https://example.com/webhook',
        events: [WebhookEvent.CASE_CREATED],
      }, 'user-001');

      await service.remove(created.id, 'user-001');

      await expect(service.findOne(created.id, 'user-001')).rejects.toThrow(NotFoundException);
    });
  });

  describe('test', () => {
    it('should send a test payload', async () => {
      const created = await service.create({
        name: 'Test Webhook',
        url: 'https://httpbin.org/post',
        events: [WebhookEvent.CASE_CREATED],
      }, 'user-001');

      const result = await service.test(created.id, 'user-001');

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('webhookId', created.id);
    });
  });

  describe('getDeliveries', () => {
    it('should return webhook deliveries', async () => {
      const created = await service.create({
        name: 'Test Webhook',
        url: 'https://httpbin.org/post',
        events: [WebhookEvent.CASE_CREATED],
      }, 'user-001');

      await service.test(created.id, 'user-001');

      const result = await service.getDeliveries(created.id, 'user-001');

      expect(Array.isArray(result)).toBe(true);
    });
  });
});
