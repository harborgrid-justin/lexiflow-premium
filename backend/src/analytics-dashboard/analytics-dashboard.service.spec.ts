import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsDashboardService } from './analytics-dashboard.service';

describe('AnalyticsDashboardService', () => {
  let service: AnalyticsDashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AnalyticsDashboardService],
    }).compile();

    service = module.get<AnalyticsDashboardService>(AnalyticsDashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getKPIs', () => {
    it('should return KPIs for default period', async () => {
      const result = await service.getKPIs({});

      expect(result).toHaveProperty('activeCases');
      expect(result).toHaveProperty('revenue');
      expect(result).toHaveProperty('billableHours');
      expect(result).toHaveProperty('clientSatisfaction');
      expect(result).toHaveProperty('winRate');
      expect(result).toHaveProperty('avgCaseDuration');
      expect(typeof result.activeCases).toBe('number');
    });

    it('should return KPIs for custom period', async () => {
      const query = { period: '7d' };
      const result = await service.getKPIs(query);

      expect(result.period).toBe('7d');
    });
  });

  describe('getCaseMetrics', () => {
    it('should return case metrics', async () => {
      const query = {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      };

      const result = await service.getCaseMetrics(query);

      expect(result).toHaveProperty('totalCases');
      expect(result).toHaveProperty('activeCases');
      expect(result).toHaveProperty('closedCases');
      expect(result).toHaveProperty('winRate');
      expect(result).toHaveProperty('casesByType');
    });
  });

  describe('getFinancialMetrics', () => {
    it('should return financial metrics', async () => {
      const query = {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      };

      const result = await service.getFinancialMetrics(query);

      expect(result).toHaveProperty('totalRevenue');
      expect(result).toHaveProperty('outstandingAR');
      expect(result).toHaveProperty('collectionRate');
    });
  });
});
