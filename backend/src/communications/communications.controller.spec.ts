import { Test, TestingModule } from '@nestjs/testing';
import { CommunicationsController } from './communications.controller';
import { CommunicationsService } from './communications.service';

describe('CommunicationsController', () => {
  let controller: CommunicationsController;
  let service: CommunicationsService;

  const mockCommunication = {
    id: 'comm-001',
    caseId: 'case-001',
    type: 'email',
    subject: 'Case Update',
    content: 'Your case has been updated...',
    sender: 'attorney@example.com',
    recipients: ['client@example.com'],
    status: 'sent',
    sentAt: new Date(),
  };

  const mockTemplate = {
    id: 'template-001',
    name: 'Case Update Template',
    type: 'email',
    subject: 'Update on Your Case: {{caseNumber}}',
    content: 'Dear {{clientName}}...',
    isActive: true,
  };

  const mockCommunicationsService = {
    findAll: jest.fn(),
    findByCaseId: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    send: jest.fn(),
    delete: jest.fn(),
    getTemplates: jest.fn(),
    getTemplateById: jest.fn(),
    createTemplate: jest.fn(),
    updateTemplate: jest.fn(),
    deleteTemplate: jest.fn(),
    renderTemplate: jest.fn(),
    scheduleMessage: jest.fn(),
    cancelScheduledMessage: jest.fn(),
    getScheduledMessages: jest.fn(),
    getDeliveryStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommunicationsController],
      providers: [{ provide: CommunicationsService, useValue: mockCommunicationsService }],
    }).compile();

    controller = module.get<CommunicationsController>(CommunicationsController);
    service = module.get<CommunicationsService>(CommunicationsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all communications', async () => {
      mockCommunicationsService.findAll.mockResolvedValue([mockCommunication]);

      const result = await controller.findAll();

      expect(result).toEqual([mockCommunication]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findByCaseId', () => {
    it('should return communications for a case', async () => {
      mockCommunicationsService.findByCaseId.mockResolvedValue([mockCommunication]);

      const result = await controller.findByCaseId('case-001');

      expect(result).toEqual([mockCommunication]);
      expect(service.findByCaseId).toHaveBeenCalledWith('case-001');
    });
  });

  describe('findById', () => {
    it('should return a communication by id', async () => {
      mockCommunicationsService.findById.mockResolvedValue(mockCommunication);

      const result = await controller.findById('comm-001');

      expect(result).toEqual(mockCommunication);
      expect(service.findById).toHaveBeenCalledWith('comm-001');
    });
  });

  describe('create', () => {
    it('should create a new communication', async () => {
      const createDto = {
        caseId: 'case-001',
        type: 'email',
        subject: 'New Subject',
        content: 'New content',
        recipients: ['test@example.com'],
      };
      mockCommunicationsService.create.mockResolvedValue({ ...mockCommunication, ...createDto });

      const result = await controller.create(createDto);

      expect(result).toHaveProperty('subject', createDto.subject);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('send', () => {
    it('should send a communication', async () => {
      mockCommunicationsService.send.mockResolvedValue({ ...mockCommunication, status: 'sent' });

      const result = await controller.send('comm-001');

      expect(result.status).toBe('sent');
      expect(service.send).toHaveBeenCalledWith('comm-001');
    });
  });

  describe('delete', () => {
    it('should delete a communication', async () => {
      mockCommunicationsService.delete.mockResolvedValue(undefined);

      await controller.delete('comm-001');

      expect(service.delete).toHaveBeenCalledWith('comm-001');
    });
  });

  describe('getTemplates', () => {
    it('should return communication templates', async () => {
      mockCommunicationsService.getTemplates.mockResolvedValue([mockTemplate]);

      const result = await controller.getTemplates();

      expect(result).toEqual([mockTemplate]);
      expect(service.getTemplates).toHaveBeenCalled();
    });
  });

  describe('getTemplateById', () => {
    it('should return a template by id', async () => {
      mockCommunicationsService.getTemplateById.mockResolvedValue(mockTemplate);

      const result = await controller.getTemplateById('template-001');

      expect(result).toEqual(mockTemplate);
      expect(service.getTemplateById).toHaveBeenCalledWith('template-001');
    });
  });

  describe('createTemplate', () => {
    it('should create a new template', async () => {
      const createDto = {
        name: 'New Template',
        type: 'email',
        subject: 'Subject',
        content: 'Content',
      };
      mockCommunicationsService.createTemplate.mockResolvedValue({ ...mockTemplate, ...createDto });

      const result = await controller.createTemplate(createDto);

      expect(result).toHaveProperty('name', createDto.name);
      expect(service.createTemplate).toHaveBeenCalledWith(createDto);
    });
  });

  describe('updateTemplate', () => {
    it('should update a template', async () => {
      const updateDto = { name: 'Updated Template' };
      mockCommunicationsService.updateTemplate.mockResolvedValue({ ...mockTemplate, ...updateDto });

      const result = await controller.updateTemplate('template-001', updateDto);

      expect(result.name).toBe('Updated Template');
      expect(service.updateTemplate).toHaveBeenCalledWith('template-001', updateDto);
    });
  });

  describe('deleteTemplate', () => {
    it('should delete a template', async () => {
      mockCommunicationsService.deleteTemplate.mockResolvedValue(undefined);

      await controller.deleteTemplate('template-001');

      expect(service.deleteTemplate).toHaveBeenCalledWith('template-001');
    });
  });

  describe('renderTemplate', () => {
    it('should render a template with variables', async () => {
      mockCommunicationsService.renderTemplate.mockResolvedValue({
        subject: 'Update on Your Case: 12345',
        content: 'Dear John Doe...',
      });

      const result = await controller.renderTemplate('template-001', {
        caseNumber: '12345',
        clientName: 'John Doe',
      });

      expect(result).toHaveProperty('subject');
      expect(result).toHaveProperty('content');
    });
  });

  describe('scheduleMessage', () => {
    it('should schedule a message for later delivery', async () => {
      const scheduleDto = {
        communicationId: 'comm-001',
        scheduledAt: new Date('2024-12-31'),
      };
      mockCommunicationsService.scheduleMessage.mockResolvedValue({
        scheduleId: 'schedule-001',
        scheduledAt: scheduleDto.scheduledAt,
      });

      const result = await controller.scheduleMessage(scheduleDto);

      expect(result).toHaveProperty('scheduleId');
      expect(service.scheduleMessage).toHaveBeenCalled();
    });
  });

  describe('getScheduledMessages', () => {
    it('should return scheduled messages', async () => {
      mockCommunicationsService.getScheduledMessages.mockResolvedValue([
        { id: 'schedule-001', scheduledAt: new Date() },
      ]);

      const result = await controller.getScheduledMessages();

      expect(result).toBeInstanceOf(Array);
      expect(service.getScheduledMessages).toHaveBeenCalled();
    });
  });

  describe('getDeliveryStatus', () => {
    it('should return delivery status', async () => {
      mockCommunicationsService.getDeliveryStatus.mockResolvedValue({
        status: 'delivered',
        deliveredAt: new Date(),
        opens: 2,
        clicks: 1,
      });

      const result = await controller.getDeliveryStatus('comm-001');

      expect(result).toHaveProperty('status');
      expect(service.getDeliveryStatus).toHaveBeenCalledWith('comm-001');
    });
  });
});
