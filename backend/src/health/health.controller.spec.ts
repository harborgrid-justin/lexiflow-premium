import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import {
  HealthCheckService,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { RedisHealthIndicator } from './redis-health.indicator';

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: HealthCheckService;

  const mockHealthCheckService = {
    check: jest.fn(),
  };

  const mockDb = {
    pingCheck: jest.fn(),
  };

  const mockMemory = {
    checkHeap: jest.fn(),
    checkRSS: jest.fn(),
  };

  const mockDisk = {
    checkStorage: jest.fn(),
  };

  const mockRedis = {
    isHealthy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: HealthCheckService, useValue: mockHealthCheckService },
        { provide: TypeOrmHealthIndicator, useValue: mockDb },
        { provide: MemoryHealthIndicator, useValue: mockMemory },
        { provide: DiskHealthIndicator, useValue: mockDisk },
        { provide: RedisHealthIndicator, useValue: mockRedis },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthCheckService = module.get<HealthCheckService>(HealthCheckService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should perform health check', async () => {
      const healthResult = {
        status: 'ok',
        info: {
          database: { status: 'up' },
          redis: { status: 'up' },
          memory_heap: { status: 'up' },
          memory_rss: { status: 'up' },
          disk: { status: 'up' },
        },
        error: {},
        details: {},
      };

      mockHealthCheckService.check.mockResolvedValue(healthResult);

      const result = await controller.check();

      expect(result).toEqual(healthResult);
      expect(healthCheckService.check).toHaveBeenCalled();
    });
  });
});
