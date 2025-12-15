import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsEvent } from './entities/analytics-event.entity';
import { Dashboard } from './entities/dashboard.entity';
import { expect, jest } from '@jest/globals';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let analyticsEventRepository: Repository<AnalyticsEvent>;
  let dashboardRepository: Repository<Dashboard>;

  const mockAnalyticsEvent = {
    id: 'event-001',
    eventType: 'case_created',
    entityType: 'Case',
    entityId: 'case-001',
    userId: 'user-001',
    metadata: { status: 'Active' },
    timestamp: new Date(),
    createdAt: new Date(),
  };

  const mockDashboard = {
    id: 'dashboard-001',
    name: 'Case Analytics',
    description: 'Overview of case metrics',
    widgets: [
      { type: 'chart', config: { chartType: 'bar' } },
    ],
    userId: 'user-001',
    isPublic: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAnalyticsEventRepository: any = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockDashboardRepository: any = {
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
        AnalyticsService,
        { provide: getRepositoryToken(AnalyticsEvent), useValue: mockAnalyticsEventRepository },
        { provide: getRepositoryToken(Dashboard), useValue: mockDashboardRepository },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    analyticsEventRepository = module.get<Repository<AnalyticsEvent>>(getRepositoryToken(AnalyticsEvent));
    dashboardRepository = module.get<Repository<Dashboard>>(getRepositoryToken(Dashboard));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Event Tracking', () => {
    describe('trackEvent', () => {
      it('should track an analytics event', async () => {
        const eventData = {
          eventType: 'case_created',
          entityType: 'Case',
          entityId: 'case-001',
          userId: 'user-001',
          metadata: { status: 'Active' },
        };

        mockAnalyticsEventRepository.create.mockReturnValue(mockAnalyticsEvent);
        mockAnalyticsEventRepository.save.mockResolvedValue(mockAnalyticsEvent);

        const result = await service.trackEvent(eventData);

        expect(result).toEqual(mockAnalyticsEvent);
        expect(mockAnalyticsEventRepository.create).toHaveBeenCalled();
        expect(mockAnalyticsEventRepository.save).toHaveBeenCalled();
      });
    });

    describe('getEventsByType', () => {
      it('should return events by type', async () => {
        mockAnalyticsEventRepository.find.mockResolvedValue([mockAnalyticsEvent]);

        const result = await service.getEventsByType('case_created');

        expect(result).toEqual([mockAnalyticsEvent]);
        expect(mockAnalyticsEventRepository.find).toHaveBeenCalledWith({
          where: { eventType: 'case_created' },
          order: { timestamp: 'DESC' },
        });
      });
    });

    describe('getEventsByEntity', () => {
      it('should return events for an entity', async () => {
        mockAnalyticsEventRepository.find.mockResolvedValue([mockAnalyticsEvent]);

        const result = await service.getEventsByEntity('Case', 'case-001');

        expect(result).toEqual([mockAnalyticsEvent]);
      });
    });

    describe('getEventsByUser', () => {
      it('should return events for a user', async () => {
        mockAnalyticsEventRepository.find.mockResolvedValue([mockAnalyticsEvent]);

        const result = await service.getEventsByUser('user-001');

        expect(result).toEqual([mockAnalyticsEvent]);
      });
    });

    describe('getEventsByDateRange', () => {
      it('should return events within date range', async () => {
        const mockQueryBuilder = {
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          getMany: jest.fn().mockResolvedValue([mockAnalyticsEvent]),
        };
        mockAnalyticsEventRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

        const startDate = new Date('2024-01-01');
        const endDate = new Date('2024-12-31');

        const result = await service.getEventsByDateRange(startDate, endDate);

        expect(result).toEqual([mockAnalyticsEvent]);
      });
    });
  });

  describe('Metrics', () => {
    describe('getCaseMetrics', () => {
      it('should return case metrics', async () => {
        const mockQueryBuilder = {
          select: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          groupBy: jest.fn().mockReturnThis(),
          getRawMany: jest.fn().mockResolvedValue([
            { status: 'Active', count: 10 },
            { status: 'Closed', count: 5 },
          ]),
        };
        mockAnalyticsEventRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

        const result = await service.getCaseMetrics();

        expect(result).toHaveProperty('byStatus');
        expect(result.byStatus).toBeInstanceOf(Array);
      });
    });

    describe('getUserActivityMetrics', () => {
      it('should return user activity metrics', async () => {
        const mockQueryBuilder = {
          select: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          groupBy: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          getRawMany: jest.fn().mockResolvedValue([
            { userId: 'user-001', eventCount: 50 },
          ]),
        };
        mockAnalyticsEventRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

        const result = await service.getUserActivityMetrics();

        expect(result).toBeInstanceOf(Array);
      });
    });

    describe('getTimeSeriesData', () => {
      it('should return time series data', async () => {
        const mockQueryBuilder = {
          select: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          groupBy: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          getRawMany: jest.fn().mockResolvedValue([
            { date: '2024-01-01', count: 5 },
            { date: '2024-01-02', count: 8 },
          ]),
        };
        mockAnalyticsEventRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

        const result = await service.getTimeSeriesData('case_created', 'day', new Date('2024-01-01'), new Date('2024-01-31'));

        expect(result).toBeInstanceOf(Array);
      });
    });

    describe('getBillingMetrics', () => {
      it('should return billing metrics', async () => {
        const mockQueryBuilder = {
          select: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          groupBy: jest.fn().mockReturnThis(),
          getRawOne: jest.fn().mockResolvedValue({
            totalBilled: 50000,
            totalHours: 250,
            averageRate: 200,
          }),
        };
        mockAnalyticsEventRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

        const result = await service.getBillingMetrics();

        expect(result).toHaveProperty('totalBilled');
        expect(result).toHaveProperty('totalHours');
      });
    });
  });

  describe('Dashboards', () => {
    describe('getAllDashboards', () => {
      it('should return all dashboards for a user', async () => {
        mockDashboardRepository.find.mockResolvedValue([mockDashboard]);

        const result = await service.getAllDashboards('user-001');

        expect(result).toEqual([mockDashboard]);
      });
    });

    describe('getDashboardById', () => {
      it('should return a dashboard by id', async () => {
        mockDashboardRepository.findOne.mockResolvedValue(mockDashboard);

        const result = await service.getDashboardById(mockDashboard.id);

        expect(result).toEqual(mockDashboard);
      });
    });

    describe('createDashboard', () => {
      it('should create a new dashboard', async () => {
        const createDto = {
          name: 'New Dashboard',
          description: 'Description',
          widgets: [],
          userId: 'user-001',
        };

        mockDashboardRepository.create.mockReturnValue(mockDashboard);
        mockDashboardRepository.save.mockResolvedValue(mockDashboard);

        const result = await service.createDashboard(createDto);

        expect(result).toEqual(mockDashboard);
      });
    });

    describe('updateDashboard', () => {
      it('should update a dashboard', async () => {
        const updateDto = { name: 'Updated Dashboard' };
        mockDashboardRepository.findOne.mockResolvedValue(mockDashboard);
        mockDashboardRepository.save.mockResolvedValue({ ...mockDashboard, ...updateDto });

        const result = await service.updateDashboard(mockDashboard.id, updateDto);

        expect(result.name).toBe('Updated Dashboard');
      });
    });

    describe('deleteDashboard', () => {
      it('should delete a dashboard', async () => {
        mockDashboardRepository.findOne.mockResolvedValue(mockDashboard);
        mockDashboardRepository.delete.mockResolvedValue({ affected: 1 });

        await service.deleteDashboard(mockDashboard.id);

        expect(mockDashboardRepository.delete).toHaveBeenCalledWith(mockDashboard.id);
      });
    });

    describe('getPublicDashboards', () => {
      it('should return public dashboards', async () => {
        mockDashboardRepository.find.mockResolvedValue([{ ...mockDashboard, isPublic: true }]);

        const result = await service.getPublicDashboards();

        expect(result[0].isPublic).toBe(true);
      });
    });

    describe('addWidgetToDashboard', () => {
      it('should add a widget to dashboard', async () => {
        const widget = { type: 'metric', config: { metricType: 'count' } };
        mockDashboardRepository.findOne.mockResolvedValue(mockDashboard);
        mockDashboardRepository.save.mockResolvedValue({
          ...mockDashboard,
          widgets: [...mockDashboard.widgets, widget],
        });

        const result = await service.addWidgetToDashboard(mockDashboard.id, widget);

        expect(result.widgets.length).toBe(2);
      });
    });

    describe('removeWidgetFromDashboard', () => {
      it('should remove a widget from dashboard', async () => {
        mockDashboardRepository.findOne.mockResolvedValue(mockDashboard);
        mockDashboardRepository.save.mockResolvedValue({
          ...mockDashboard,
          widgets: [],
        });

        const result = await service.removeWidgetFromDashboard(mockDashboard.id, 0);

        expect(result.widgets.length).toBe(0);
      });
    });
  });

  describe('Reports', () => {
    describe('generateReport', () => {
      it('should generate an analytics report', async () => {
        mockAnalyticsEventRepository.find.mockResolvedValue([mockAnalyticsEvent]);

        const result = await service.generateReport({
          type: 'activity',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
        });

        expect(result).toHaveProperty('type', 'activity');
        expect(result).toHaveProperty('data');
        expect(result).toHaveProperty('generatedAt');
      });
    });
  });
});
