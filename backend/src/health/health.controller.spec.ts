import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  let controller: HealthController;
  let service: HealthService;

  const mockHealthService = {
    check: jest.fn(),
    checkDatabase: jest.fn(),
    checkRedis: jest.fn(),
    checkStorage: jest.fn(),
    getSystemInfo: jest.fn(),
    getMetrics: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: HealthService, useValue: mockHealthService }],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    service = module.get<HealthService>(HealthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should return health status', async () => {
      mockHealthService.check.mockResolvedValue({
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
          database: { status: 'up' },
          redis: { status: 'up' },
          storage: { status: 'up' },
        },
      });

      const result = await controller.check();

      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('services');
      expect(service.check).toHaveBeenCalled();
    });

    it('should return degraded status when a service is down', async () => {
      mockHealthService.check.mockResolvedValue({
        status: 'degraded',
        timestamp: new Date().toISOString(),
        services: {
          database: { status: 'up' },
          redis: { status: 'down', error: 'Connection refused' },
          storage: { status: 'up' },
        },
      });

      const result = await controller.check();

      expect(result.status).toBe('degraded');
      expect(result.services.redis.status).toBe('down');
    });
  });

  describe('checkDatabase', () => {
    it('should return database health', async () => {
      mockHealthService.checkDatabase.mockResolvedValue({
        status: 'up',
        responseTime: 5,
        connections: { active: 10, idle: 5, max: 20 },
      });

      const result = await controller.checkDatabase();

      expect(result).toHaveProperty('status', 'up');
      expect(result).toHaveProperty('responseTime');
      expect(service.checkDatabase).toHaveBeenCalled();
    });

    it('should return down status when database unreachable', async () => {
      mockHealthService.checkDatabase.mockResolvedValue({
        status: 'down',
        error: 'Connection timeout',
      });

      const result = await controller.checkDatabase();

      expect(result.status).toBe('down');
      expect(result).toHaveProperty('error');
    });
  });

  describe('checkRedis', () => {
    it('should return redis health', async () => {
      mockHealthService.checkRedis.mockResolvedValue({
        status: 'up',
        responseTime: 1,
        memory: { used: '50MB', peak: '100MB' },
      });

      const result = await controller.checkRedis();

      expect(result).toHaveProperty('status', 'up');
      expect(service.checkRedis).toHaveBeenCalled();
    });
  });

  describe('checkStorage', () => {
    it('should return storage health', async () => {
      mockHealthService.checkStorage.mockResolvedValue({
        status: 'up',
        totalSpace: '100GB',
        usedSpace: '45GB',
        freeSpace: '55GB',
        percentUsed: 45,
      });

      const result = await controller.checkStorage();

      expect(result).toHaveProperty('status', 'up');
      expect(result).toHaveProperty('freeSpace');
      expect(service.checkStorage).toHaveBeenCalled();
    });

    it('should warn when storage is almost full', async () => {
      mockHealthService.checkStorage.mockResolvedValue({
        status: 'warning',
        totalSpace: '100GB',
        usedSpace: '90GB',
        freeSpace: '10GB',
        percentUsed: 90,
        warning: 'Storage space is running low',
      });

      const result = await controller.checkStorage();

      expect(result.status).toBe('warning');
      expect(result).toHaveProperty('warning');
    });
  });

  describe('getSystemInfo', () => {
    it('should return system information', async () => {
      mockHealthService.getSystemInfo.mockResolvedValue({
        nodeVersion: 'v18.17.0',
        platform: 'linux',
        arch: 'x64',
        uptime: 86400,
        memory: { total: '16GB', used: '8GB', free: '8GB' },
        cpu: { cores: 8, model: 'Intel Xeon', usage: 25 },
      });

      const result = await controller.getSystemInfo();

      expect(result).toHaveProperty('nodeVersion');
      expect(result).toHaveProperty('platform');
      expect(result).toHaveProperty('uptime');
      expect(service.getSystemInfo).toHaveBeenCalled();
    });
  });

  describe('getMetrics', () => {
    it('should return application metrics', async () => {
      mockHealthService.getMetrics.mockResolvedValue({
        requests: { total: 10000, perSecond: 50 },
        responseTime: { avg: 100, p95: 250, p99: 500 },
        errors: { total: 50, rate: 0.005 },
        activeConnections: 25,
      });

      const result = await controller.getMetrics();

      expect(result).toHaveProperty('requests');
      expect(result).toHaveProperty('responseTime');
      expect(result).toHaveProperty('errors');
      expect(service.getMetrics).toHaveBeenCalled();
    });
  });
});
