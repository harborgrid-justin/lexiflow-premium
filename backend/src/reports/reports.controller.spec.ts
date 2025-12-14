import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

describe('ReportsController', () => {
  let controller: ReportsController;
  let service: ReportsService;

  const mockReport = {
    id: 'report-001',
    name: 'Monthly Case Summary',
    type: 'case_summary',
    templateId: 'template-001',
    status: 'completed',
    format: 'pdf',
    filePath: '/reports/report-001.pdf',
    generatedBy: 'user-001',
    generatedAt: new Date(),
  };

  const mockTemplate = {
    id: 'template-001',
    name: 'Case Summary Template',
    type: 'case_summary',
    description: 'Monthly summary of all cases',
    isActive: true,
  };

  const mockReportsService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    generate: jest.fn(),
    delete: jest.fn(),
    download: jest.fn(),
    findByType: jest.fn(),
    findByUser: jest.fn(),
    getTemplates: jest.fn(),
    getTemplateById: jest.fn(),
    createTemplate: jest.fn(),
    scheduleReport: jest.fn(),
    getScheduledReports: jest.fn(),
    cancelScheduledReport: jest.fn(),
    getReportStatus: jest.fn(),
    exportReport: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [{ provide: ReportsService, useValue: mockReportsService }],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
    service = module.get<ReportsService>(ReportsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all reports', async () => {
      mockReportsService.findAll.mockResolvedValue([mockReport]);

      const result = await controller.findAll();

      expect(result).toEqual([mockReport]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a report by id', async () => {
      mockReportsService.findById.mockResolvedValue(mockReport);

      const result = await controller.findById('report-001');

      expect(result).toEqual(mockReport);
      expect(service.findById).toHaveBeenCalledWith('report-001');
    });
  });

  describe('generate', () => {
    it('should generate a new report', async () => {
      const generateDto = {
        templateId: 'template-001',
        name: 'Q1 Summary',
        parameters: { quarter: 'Q1' },
        format: 'pdf',
      };
      mockReportsService.generate.mockResolvedValue({ ...mockReport, ...generateDto });

      const result = await controller.generate(generateDto, 'user-001');

      expect(result).toHaveProperty('name', generateDto.name);
      expect(service.generate).toHaveBeenCalledWith(generateDto, 'user-001');
    });
  });

  describe('delete', () => {
    it('should delete a report', async () => {
      mockReportsService.delete.mockResolvedValue(undefined);

      await controller.delete('report-001');

      expect(service.delete).toHaveBeenCalledWith('report-001');
    });
  });

  describe('download', () => {
    it('should return download info', async () => {
      mockReportsService.download.mockResolvedValue({
        filePath: '/reports/report-001.pdf',
        filename: 'Monthly_Case_Summary.pdf',
        mimeType: 'application/pdf',
      });

      const result = await controller.download('report-001');

      expect(result).toHaveProperty('filePath');
      expect(service.download).toHaveBeenCalledWith('report-001');
    });
  });

  describe('findByType', () => {
    it('should return reports by type', async () => {
      mockReportsService.findByType.mockResolvedValue([mockReport]);

      const result = await controller.findByType('case_summary');

      expect(result).toEqual([mockReport]);
      expect(service.findByType).toHaveBeenCalledWith('case_summary');
    });
  });

  describe('getTemplates', () => {
    it('should return all report templates', async () => {
      mockReportsService.getTemplates.mockResolvedValue([mockTemplate]);

      const result = await controller.getTemplates();

      expect(result).toEqual([mockTemplate]);
      expect(service.getTemplates).toHaveBeenCalled();
    });
  });

  describe('getTemplateById', () => {
    it('should return a template by id', async () => {
      mockReportsService.getTemplateById.mockResolvedValue(mockTemplate);

      const result = await controller.getTemplateById('template-001');

      expect(result).toEqual(mockTemplate);
      expect(service.getTemplateById).toHaveBeenCalledWith('template-001');
    });
  });

  describe('createTemplate', () => {
    it('should create a new template', async () => {
      const createDto = {
        name: 'New Template',
        type: 'billing_summary',
        description: 'Monthly billing report',
      };
      mockReportsService.createTemplate.mockResolvedValue({ ...mockTemplate, ...createDto });

      const result = await controller.createTemplate(createDto, 'admin-001');

      expect(result).toHaveProperty('name', createDto.name);
      expect(service.createTemplate).toHaveBeenCalledWith(createDto, 'admin-001');
    });
  });

  describe('scheduleReport', () => {
    it('should schedule a recurring report', async () => {
      const scheduleDto = {
        templateId: 'template-001',
        name: 'Weekly Summary',
        schedule: '0 0 * * 1',
        parameters: {},
        recipients: ['user@example.com'],
      };
      mockReportsService.scheduleReport.mockResolvedValue({
        scheduleId: 'schedule-001',
        nextRun: new Date(),
      });

      const result = await controller.scheduleReport(scheduleDto, 'user-001');

      expect(result).toHaveProperty('scheduleId');
      expect(service.scheduleReport).toHaveBeenCalled();
    });
  });

  describe('getScheduledReports', () => {
    it('should return scheduled reports', async () => {
      mockReportsService.getScheduledReports.mockResolvedValue([
        { id: 'schedule-001', name: 'Weekly Summary', nextRun: new Date() },
      ]);

      const result = await controller.getScheduledReports('user-001');

      expect(result).toBeInstanceOf(Array);
      expect(service.getScheduledReports).toHaveBeenCalledWith('user-001');
    });
  });

  describe('cancelScheduledReport', () => {
    it('should cancel a scheduled report', async () => {
      mockReportsService.cancelScheduledReport.mockResolvedValue({ success: true });

      const result = await controller.cancelScheduledReport('schedule-001', 'user-001');

      expect(result).toHaveProperty('success', true);
      expect(service.cancelScheduledReport).toHaveBeenCalledWith('schedule-001', 'user-001');
    });
  });

  describe('getReportStatus', () => {
    it('should return report generation status', async () => {
      mockReportsService.getReportStatus.mockResolvedValue({
        status: 'processing',
        progress: 50,
      });

      const result = await controller.getReportStatus('report-001');

      expect(result).toHaveProperty('status');
      expect(service.getReportStatus).toHaveBeenCalledWith('report-001');
    });
  });

  describe('exportReport', () => {
    it('should export report in different format', async () => {
      mockReportsService.exportReport.mockResolvedValue({
        filePath: '/exports/report.xlsx',
        format: 'xlsx',
      });

      const result = await controller.exportReport('report-001', { format: 'xlsx' });

      expect(result).toHaveProperty('format', 'xlsx');
      expect(service.exportReport).toHaveBeenCalledWith('report-001', 'xlsx');
    });
  });
});
