import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let service: AnalyticsService;

  const mockEvent = {
    id: 'event-001',
    type: 'case.viewed',
    entityType: 'case',
    entityId: 'case-001',
    userId: 'user-001',
    timestamp: new Date(),
    metadata: { duration: 120 },
  };

  const mockDashboard = {
    id: 'dashboard-001',
    name: 'Case Metrics',
    widgets: [],
    createdBy: 'user-001',
  };

  const mockAnalyticsService = {
    trackEvent: jest.fn(),
    getEvents: jest.fn(),
    getMetrics: jest.fn(),
    getCaseMetrics: jest.fn(),
    getDocumentMetrics: jest.fn(),
    getUserActivity: jest.fn(),
    getDashboards: jest.fn(),
    getDashboardById: jest.fn(),
    createDashboard: jest.fn(),
    updateDashboard: jest.fn(),
    deleteDashboard: jest.fn(),
    getWidgetData: jest.fn(),
    exportMetrics: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [{ provide: AnalyticsService, useValue: mockAnalyticsService }],
    }).compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
    service = module.get<AnalyticsService>(AnalyticsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('trackEvent', () => {
    it('should track an analytics event', async () => {
      mockAnalyticsService.trackEvent.mockResolvedValue(mockEvent);

      const result = await controller.trackEvent({
        type: 'case.viewed',
        entityType: 'case',
        entityId: 'case-001',
      });

      expect(result).toEqual(mockEvent);
      expect(service.trackEvent).toHaveBeenCalled();
    });
  });

  describe('getEvents', () => {
    it('should return analytics events', async () => {
      mockAnalyticsService.getEvents.mockResolvedValue({ data: [mockEvent], total: 1 });

      const result = await controller.getEvents({ page: 1, limit: 10 });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total', 1);
    });
  });

  describe('getMetrics', () => {
    it('should return overall metrics', async () => {
      mockAnalyticsService.getMetrics.mockResolvedValue({
        totalCases: 100,
        activeCases: 50,
        documentsProcessed: 500,
      });

      const result = await controller.getMetrics({
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      });

      expect(result).toHaveProperty('totalCases');
      expect(service.getMetrics).toHaveBeenCalled();
    });
  });

  describe('getCaseMetrics', () => {
    it('should return case-specific metrics', async () => {
      mockAnalyticsService.getCaseMetrics.mockResolvedValue({
        byStatus: { active: 50, closed: 30 },
        byType: { civil: 40, criminal: 20 },
      });

      const result = await controller.getCaseMetrics();

      expect(result).toHaveProperty('byStatus');
      expect(result).toHaveProperty('byType');
    });
  });

  describe('getDocumentMetrics', () => {
    it('should return document-specific metrics', async () => {
      mockAnalyticsService.getDocumentMetrics.mockResolvedValue({
        totalDocuments: 1000,
        ocrProcessed: 800,
        avgProcessingTime: 5.2,
      });

      const result = await controller.getDocumentMetrics();

      expect(result).toHaveProperty('totalDocuments');
      expect(result).toHaveProperty('ocrProcessed');
    });
  });

  describe('getUserActivity', () => {
    it('should return user activity data', async () => {
      mockAnalyticsService.getUserActivity.mockResolvedValue({
        activeUsers: 25,
        sessions: 150,
        avgSessionDuration: 45,
      });

      const result = await controller.getUserActivity('user-001');

      expect(result).toHaveProperty('activeUsers');
      expect(service.getUserActivity).toHaveBeenCalledWith('user-001');
    });
  });

  describe('getDashboards', () => {
    it('should return user dashboards', async () => {
      mockAnalyticsService.getDashboards.mockResolvedValue([mockDashboard]);

      const result = await controller.getDashboards('user-001');

      expect(result).toEqual([mockDashboard]);
      expect(service.getDashboards).toHaveBeenCalledWith('user-001');
    });
  });

  describe('getDashboardById', () => {
    it('should return a dashboard by id', async () => {
      mockAnalyticsService.getDashboardById.mockResolvedValue(mockDashboard);

      const result = await controller.getDashboardById('dashboard-001');

      expect(result).toEqual(mockDashboard);
      expect(service.getDashboardById).toHaveBeenCalledWith('dashboard-001');
    });
  });

  describe('createDashboard', () => {
    it('should create a new dashboard', async () => {
      const createDto = { name: 'New Dashboard', widgets: [] };
      mockAnalyticsService.createDashboard.mockResolvedValue({ ...mockDashboard, ...createDto });

      const result = await controller.createDashboard(createDto, 'user-001');

      expect(result).toHaveProperty('name', createDto.name);
      expect(service.createDashboard).toHaveBeenCalled();
    });
  });

  describe('updateDashboard', () => {
    it('should update a dashboard', async () => {
      const updateDto = { name: 'Updated Dashboard' };
      mockAnalyticsService.updateDashboard.mockResolvedValue({ ...mockDashboard, ...updateDto });

      const result = await controller.updateDashboard('dashboard-001', updateDto);

      expect(result.name).toBe('Updated Dashboard');
      expect(service.updateDashboard).toHaveBeenCalledWith('dashboard-001', updateDto);
    });
  });

  describe('deleteDashboard', () => {
    it('should delete a dashboard', async () => {
      mockAnalyticsService.deleteDashboard.mockResolvedValue(undefined);

      await controller.deleteDashboard('dashboard-001');

      expect(service.deleteDashboard).toHaveBeenCalledWith('dashboard-001');
    });
  });

  describe('getWidgetData', () => {
    it('should return widget data', async () => {
      mockAnalyticsService.getWidgetData.mockResolvedValue({
        type: 'chart',
        data: [{ label: 'Jan', value: 10 }],
      });

      const result = await controller.getWidgetData('dashboard-001', 'widget-001');

      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('data');
    });
  });

  describe('exportMetrics', () => {
    it('should export metrics data', async () => {
      mockAnalyticsService.exportMetrics.mockResolvedValue({
        filePath: '/exports/metrics.csv',
        format: 'csv',
      });

      const result = await controller.exportMetrics({
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        format: 'csv',
      });

      expect(result).toHaveProperty('filePath');
      expect(service.exportMetrics).toHaveBeenCalled();
    });
  });
});
