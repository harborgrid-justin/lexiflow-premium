import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CommunicationsService } from './communications.service';
import { Communication } from './entities/communication.entity';
import { Template } from './entities/template.entity';

describe('CommunicationsService', () => {
  let service: CommunicationsService;
  let communicationRepository: Repository<Communication>;
  let templateRepository: Repository<Template>;

  const mockCommunication = {
    id: 'comm-001',
    caseId: 'case-001',
    type: 'email',
    subject: 'Case Update',
    body: 'Your case has been updated.',
    sender: 'attorney@firm.com',
    recipients: ['client@example.com'],
    status: 'sent',
    sentAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTemplate = {
    id: 'template-001',
    name: 'Case Update Template',
    type: 'email',
    subject: 'Update on {{caseNumber}}',
    body: 'Dear {{clientName}}, your case {{caseNumber}} has been updated.',
    variables: ['caseNumber', 'clientName'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCommunicationRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockTemplateRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunicationsService,
        { provide: getRepositoryToken(Communication), useValue: mockCommunicationRepository },
        { provide: getRepositoryToken(Template), useValue: mockTemplateRepository },
      ],
    }).compile();

    service = module.get<CommunicationsService>(CommunicationsService);
    communicationRepository = module.get<Repository<Communication>>(getRepositoryToken(Communication));
    templateRepository = module.get<Repository<Template>>(getRepositoryToken(Template));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Communications', () => {
    describe('findAll', () => {
      it('should return all communications', async () => {
        mockCommunicationRepository.find.mockResolvedValue([mockCommunication]);

        const result = await service.findAll();

        expect(result).toEqual([mockCommunication]);
      });
    });

    describe('findByCaseId', () => {
      it('should return communications for a case', async () => {
        mockCommunicationRepository.find.mockResolvedValue([mockCommunication]);

        const result = await service.findByCaseId('case-001');

        expect(result).toEqual([mockCommunication]);
        expect(mockCommunicationRepository.find).toHaveBeenCalledWith({
          where: { caseId: 'case-001' },
          order: { createdAt: 'DESC' },
        });
      });
    });

    describe('findById', () => {
      it('should return a communication by id', async () => {
        mockCommunicationRepository.findOne.mockResolvedValue(mockCommunication);

        const result = await service.findById(mockCommunication.id);

        expect(result).toEqual(mockCommunication);
      });

      it('should throw NotFoundException if communication not found', async () => {
        mockCommunicationRepository.findOne.mockResolvedValue(null);

        await expect(service.findById('non-existent')).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe('create', () => {
      it('should create a new communication', async () => {
        const createDto = {
          caseId: 'case-001',
          type: 'email',
          subject: 'Test Subject',
          body: 'Test body',
          sender: 'attorney@firm.com',
          recipients: ['client@example.com'],
        };

        mockCommunicationRepository.create.mockReturnValue(mockCommunication);
        mockCommunicationRepository.save.mockResolvedValue(mockCommunication);

        const result = await service.create(createDto);

        expect(result).toEqual(mockCommunication);
      });
    });

    describe('send', () => {
      it('should send a communication', async () => {
        mockCommunicationRepository.findOne.mockResolvedValue({ ...mockCommunication, status: 'draft' });
        mockCommunicationRepository.save.mockResolvedValue({ ...mockCommunication, status: 'sent', sentAt: expect.any(Date) });

        const result = await service.send(mockCommunication.id);

        expect(result.status).toBe('sent');
        expect(result.sentAt).toBeDefined();
      });

      it('should throw error if already sent', async () => {
        mockCommunicationRepository.findOne.mockResolvedValue(mockCommunication);

        await expect(service.send(mockCommunication.id)).rejects.toThrow();
      });
    });

    describe('delete', () => {
      it('should delete a communication', async () => {
        mockCommunicationRepository.findOne.mockResolvedValue(mockCommunication);
        mockCommunicationRepository.delete.mockResolvedValue({ affected: 1 });

        await service.delete(mockCommunication.id);

        expect(mockCommunicationRepository.delete).toHaveBeenCalledWith(mockCommunication.id);
      });
    });

    describe('getByType', () => {
      it('should return communications by type', async () => {
        mockCommunicationRepository.find.mockResolvedValue([mockCommunication]);

        const result = await service.getByType('email');

        expect(result).toEqual([mockCommunication]);
        expect(mockCommunicationRepository.find).toHaveBeenCalledWith({
          where: { type: 'email' },
        });
      });
    });

    describe('getSentCommunications', () => {
      it('should return sent communications', async () => {
        mockCommunicationRepository.find.mockResolvedValue([mockCommunication]);

        const result = await service.getSentCommunications('case-001');

        expect(result).toEqual([mockCommunication]);
      });
    });

    describe('getDraftCommunications', () => {
      it('should return draft communications', async () => {
        const draftComm = { ...mockCommunication, status: 'draft' };
        mockCommunicationRepository.find.mockResolvedValue([draftComm]);

        const result = await service.getDraftCommunications('case-001');

        expect(result).toEqual([draftComm]);
      });
    });
  });

  describe('Templates', () => {
    describe('getAllTemplates', () => {
      it('should return all templates', async () => {
        mockTemplateRepository.find.mockResolvedValue([mockTemplate]);

        const result = await service.getAllTemplates();

        expect(result).toEqual([mockTemplate]);
      });
    });

    describe('getTemplateById', () => {
      it('should return a template by id', async () => {
        mockTemplateRepository.findOne.mockResolvedValue(mockTemplate);

        const result = await service.getTemplateById(mockTemplate.id);

        expect(result).toEqual(mockTemplate);
      });

      it('should throw NotFoundException if template not found', async () => {
        mockTemplateRepository.findOne.mockResolvedValue(null);

        await expect(service.getTemplateById('non-existent')).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe('createTemplate', () => {
      it('should create a new template', async () => {
        const createDto = {
          name: 'New Template',
          type: 'email',
          subject: 'Subject',
          body: 'Body content',
        };

        mockTemplateRepository.create.mockReturnValue(mockTemplate);
        mockTemplateRepository.save.mockResolvedValue(mockTemplate);

        const result = await service.createTemplate(createDto);

        expect(result).toEqual(mockTemplate);
      });
    });

    describe('updateTemplate', () => {
      it('should update a template', async () => {
        const updateDto = { name: 'Updated Template' };
        mockTemplateRepository.findOne.mockResolvedValue(mockTemplate);
        mockTemplateRepository.save.mockResolvedValue({ ...mockTemplate, ...updateDto });

        const result = await service.updateTemplate(mockTemplate.id, updateDto);

        expect(result.name).toBe('Updated Template');
      });
    });

    describe('deleteTemplate', () => {
      it('should delete a template', async () => {
        mockTemplateRepository.findOne.mockResolvedValue(mockTemplate);
        mockTemplateRepository.delete.mockResolvedValue({ affected: 1 });

        await service.deleteTemplate(mockTemplate.id);

        expect(mockTemplateRepository.delete).toHaveBeenCalledWith(mockTemplate.id);
      });
    });

    describe('getActiveTemplates', () => {
      it('should return active templates', async () => {
        mockTemplateRepository.find.mockResolvedValue([mockTemplate]);

        const result = await service.getActiveTemplates();

        expect(result).toEqual([mockTemplate]);
        expect(mockTemplateRepository.find).toHaveBeenCalledWith({
          where: { isActive: true },
        });
      });
    });

    describe('getTemplatesByType', () => {
      it('should return templates by type', async () => {
        mockTemplateRepository.find.mockResolvedValue([mockTemplate]);

        const result = await service.getTemplatesByType('email');

        expect(result).toEqual([mockTemplate]);
      });
    });

    describe('renderTemplate', () => {
      it('should render a template with variables', async () => {
        mockTemplateRepository.findOne.mockResolvedValue(mockTemplate);

        const variables = {
          caseNumber: 'CASE-001',
          clientName: 'John Doe',
        };

        const result = await service.renderTemplate(mockTemplate.id, variables);

        expect(result).toHaveProperty('subject');
        expect(result).toHaveProperty('body');
        expect(result.subject).toContain('CASE-001');
        expect(result.body).toContain('John Doe');
      });
    });
  });

  describe('createFromTemplate', () => {
    it('should create communication from template', async () => {
      mockTemplateRepository.findOne.mockResolvedValue(mockTemplate);
      mockCommunicationRepository.create.mockReturnValue(mockCommunication);
      mockCommunicationRepository.save.mockResolvedValue(mockCommunication);

      const result = await service.createFromTemplate({
        templateId: mockTemplate.id,
        caseId: 'case-001',
        recipients: ['client@example.com'],
        variables: { caseNumber: 'CASE-001', clientName: 'John Doe' },
      });

      expect(result).toEqual(mockCommunication);
    });
  });

  describe('Statistics', () => {
    describe('getCommunicationStats', () => {
      it('should return communication statistics', async () => {
        mockCommunicationRepository.find.mockResolvedValue([
          mockCommunication,
          { ...mockCommunication, status: 'draft' },
          { ...mockCommunication, type: 'letter' },
        ]);

        const result = await service.getCommunicationStats('case-001');

        expect(result).toHaveProperty('total');
        expect(result).toHaveProperty('byType');
        expect(result).toHaveProperty('byStatus');
      });
    });
  });
});
