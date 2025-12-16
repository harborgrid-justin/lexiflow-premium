import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { Report } from './entities/report.entity';
import { ReportTemplate } from './entities/report-template.entity';

describe('ReportsService', () => {
  let service: ReportsService;
  let reportRepository: Repository<Report>;
  let templateRepository: Repository<ReportTemplate>;

  const mockReport = {
    id: 'report-001',
    name: 'Monthly Case Summary',
    type: 'case_summary',
    templateId: 'template-001',
    status: 'completed',
    format: 'pdf',
    parameters: { month: '2024-01', caseType: 'civil' },
    filePath: '/reports/report-001.pdf',
    fileSize: 512000,
    generatedBy: 'user-001',
    generatedAt: new Date(),
    expiresAt: new Date('2025-01-01'),
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTemplate = {
    id: 'template-001',
    name: 'Case Summary Template',
    type: 'case_summary',
    description: 'Monthly summary of all cases',
    schema: { fields: ['caseId', 'status', 'filedDate'] },
    isActive: true,
    createdBy: 'admin-001',
  };

  const mockReportRepository = {
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
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: getRepositoryToken(Report), useValue: mockReportRepository },
        { provide: getRepositoryToken(ReportTemplate), useValue: mockTemplateRepository },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    reportRepository = module.get<Repository<Report>>(getRepositoryToken(Report));
    templateRepository = module.get<Repository<ReportTemplate>>(getRepositoryToken(ReportTemplate));

    // Seed test data in the service's internal storage
    (service as any).reports.set(mockReport.id, mockReport);
    (service as any).reportTemplates = [mockTemplate];

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all reports', async () => {
      (mockReportRepository.find as jest.Mock).mockResolvedValue([mockReport]);

      const result = await service.findAll();

      expect(result).toEqual([mockReport]);
    });
  });

  describe('findById', () => {
    it('should return a report by id', async () => {
      (mockReportRepository.findOne as jest.Mock).mockResolvedValue(mockReport);

      const result = await service.findById(mockReport.id);

      expect(result).toEqual(mockReport);
    });

    it('should throw NotFoundException if report not found', async () => {
      (mockReportRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('generate', () => {
    it('should generate a new report', async () => {
      const generateDto = {
        templateId: 'template-001',
        name: 'Q1 Summary',
        parameters: { quarter: 'Q1', year: 2024 },
        format: 'pdf',
      };

      (mockTemplateRepository.findOne as jest.Mock).mockResolvedValue(mockTemplate);
      mockReportRepository.create.mockReturnValue({ ...mockReport, ...generateDto });
      (mockReportRepository.save as jest.Mock).mockResolvedValue({ ...mockReport, ...generateDto });

      const result = await service.generate(generateDto, 'user-001');

      expect(result).toHaveProperty('name', generateDto.name);
      expect(result).toHaveProperty('status');
    });

    it('should throw NotFoundException if template not found', async () => {
      (mockTemplateRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        service.generate({ templateId: 'non-existent', name: 'Test', parameters: {} }, 'user-001'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a report', async () => {
      (mockReportRepository.findOne as jest.Mock).mockResolvedValue(mockReport);
      (mockReportRepository.delete as jest.Mock).mockResolvedValue({ affected: 1 });

      await service.delete(mockReport.id);

      expect(mockReportRepository.delete).toHaveBeenCalledWith(mockReport.id);
    });
  });

  describe('download', () => {
    it('should return report file info for download', async () => {
      (mockReportRepository.findOne as jest.Mock).mockResolvedValue(mockReport);

      const result = await service.download(mockReport.id);

      expect(result).toHaveProperty('filePath');
      expect(result).toHaveProperty('filename');
      expect(result).toHaveProperty('mimeType');
    });

    it('should throw NotFoundException if report not completed', async () => {
      (mockReportRepository.findOne as jest.Mock).mockResolvedValue({ ...mockReport, status: 'pending' });

      await expect(service.download(mockReport.id)).rejects.toThrow();
    });
  });

  describe('findByType', () => {
    it('should return reports by type', async () => {
      (mockReportRepository.find as jest.Mock).mockResolvedValue([mockReport]);

      const result = await service.findByType('case_summary');

      expect(result).toEqual([mockReport]);
    });
  });

  describe('findByUser', () => {
    it('should return reports by user', async () => {
      (mockReportRepository.find as jest.Mock).mockResolvedValue([mockReport]);

      const result = await service.findByUser('user-001');

      expect(result).toEqual([mockReport]);
    });
  });

  describe('getTemplates', () => {
    it('should return all report templates', async () => {
      (mockTemplateRepository.find as jest.Mock).mockResolvedValue([mockTemplate]);

      const result = await service.getTemplates();

      expect(result).toEqual([mockTemplate]);
    });
  });

  describe('getTemplateById', () => {
    it('should return a template by id', async () => {
      (mockTemplateRepository.findOne as jest.Mock).mockResolvedValue(mockTemplate);

      const result = await service.getTemplateById('template-001');

      expect(result).toEqual(mockTemplate);
    });

    it('should throw NotFoundException if template not found', async () => {
      (mockTemplateRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.getTemplateById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createTemplate', () => {
    it('should create a new report template', async () => {
      const createDto = {
        name: 'New Template',
        type: 'billing_summary',
        description: 'Monthly billing report',
        schema: { fields: ['invoiceId', 'amount'] },
      };

      mockTemplateRepository.create.mockReturnValue({ ...mockTemplate, ...createDto });
      (mockTemplateRepository.save as jest.Mock).mockResolvedValue({ ...mockTemplate, ...createDto });

      const result = await service.createTemplate(createDto, 'admin-001');

      expect(result).toHaveProperty('name', createDto.name);
    });
  });

  describe('scheduleReport', () => {
    it('should schedule a recurring report', async () => {
      (mockTemplateRepository.findOne as jest.Mock).mockResolvedValue(mockTemplate);

      const result = await service.scheduleReport({
        templateId: 'template-001',
        name: 'Weekly Summary',
        schedule: '0 0 * * 1',
        parameters: {},
        recipients: ['user@example.com'],
      }, 'user-001');

      expect(result).toHaveProperty('scheduleId');
      expect(result).toHaveProperty('nextRun');
    });
  });

  describe('getScheduledReports', () => {
    it('should return scheduled reports', async () => {
      const result = await service.getScheduledReports('user-001');

      expect(result).toBeInstanceOf(Array);
    });
  });

  describe('cancelScheduledReport', () => {
    it('should cancel a scheduled report', async () => {
      const result = await service.cancelScheduledReport('schedule-001', 'user-001');

      expect(result).toHaveProperty('success', true);
    });
  });

  describe('getReportStatus', () => {
    it('should return report generation status', async () => {
      (mockReportRepository.findOne as jest.Mock).mockResolvedValue(mockReport);

      const result = await service.getReportStatus(mockReport.id);

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('progress');
    });
  });

  describe('exportReport', () => {
    it('should export report in different format', async () => {
      (mockReportRepository.findOne as jest.Mock).mockResolvedValue(mockReport);

      const result = await service.exportReport(mockReport.id, 'xlsx');

      expect(result).toHaveProperty('filePath');
      expect(result).toHaveProperty('format', 'xlsx');
    });
  });
});
