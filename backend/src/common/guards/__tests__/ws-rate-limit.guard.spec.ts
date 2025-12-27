import { ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WsRateLimitGuard } from '@common/guards/ws-rate-limit.guard';
import { Socket } from 'socket.io';

describe('WsRateLimitGuard', () => {
  let guard: WsRateLimitGuard;
  let configService: ConfigService;
  let mockClient: Partial<Socket>;
  let mockContext: ExecutionContext;

  beforeEach(() => {
    jest.clearAllTimers();
    jest.useFakeTimers();

    // Mock ConfigService
    configService = {
      get: jest.fn((key: string, defaultValue: any) => {
        const config: Record<string, any> = {
          'resourceLimits.websocket.rateLimit.maxEventsPerMinute': 10,
          'resourceLimits.websocket.rateLimit.windowMs': 60000,
        };
        return config[key] !== undefined ? config[key] : defaultValue;
      }),
    } as any;

    guard = new WsRateLimitGuard(configService);

    // Mock Socket.io client
    mockClient = {
      id: 'socket-123',
      emit: jest.fn(),
      handshake: {
        query: {},
      } as any,
    };

    // Mock ExecutionContext
    mockContext = {
      switchToWs: jest.fn().mockReturnValue({
        getClient: jest.fn().mockReturnValue(mockClient),
      }),
    } as any;
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe('canActivate', () => {
    it('should allow events within rate limit', () => {
      for (let i = 0; i < 10; i++) {
        const result = guard.canActivate(mockContext);
        expect(result).toBe(true);
      }
    });

    it('should reject events exceeding rate limit', () => {
      // Use up the limit
      for (let i = 0; i < 10; i++) {
        guard.canActivate(mockContext);
      }

      // Next event should be rejected
      const result = guard.canActivate(mockContext);

      expect(result).toBe(false);
      expect(mockClient.emit).toHaveBeenCalledWith('error', {
        code: 'RATE_LIMIT_EXCEEDED',
        message: expect.stringContaining('10 events per minute'),
        retryAfter: expect.any(Number),
      });
    });

    it('should track rate limit per client', () => {
      (mockClient as any).userId = 'user-1';

      // User 1 uses up their limit
      for (let i = 0; i < 10; i++) {
        guard.canActivate(mockContext);
      }

      // User 1 should be blocked
      expect(guard.canActivate(mockContext)).toBe(false);

      // User 2 should still be allowed
      const mockClient2 = { ...mockClient, id: 'socket-456', userId: 'user-2' };
      mockContext.switchToWs = jest.fn().mockReturnValue({
        getClient: jest.fn().mockReturnValue(mockClient2),
      });

      expect(guard.canActivate(mockContext)).toBe(true);
    });

    it('should reset rate limit after window expires', () => {
      // Use up the limit
      for (let i = 0; i < 10; i++) {
        guard.canActivate(mockContext);
      }

      expect(guard.canActivate(mockContext)).toBe(false);

      // Advance time past the window
      jest.advanceTimersByTime(60001);

      // Should be allowed again
      const result = guard.canActivate(mockContext);
      expect(result).toBe(true);
    });

    it('should use userId as identifier when available', () => {
      (mockClient as any).userId = 'user-1';

      for (let i = 0; i < 10; i++) {
        guard.canActivate(mockContext);
      }

      const stats = guard.getStats();
      expect(stats.clientStats).toContainEqual(
        expect.objectContaining({
          id: 'user:user-1',
          count: 10,
        })
      );
    });

    it('should use socket id as fallback identifier', () => {
      // No userId set
      guard.canActivate(mockContext);

      const stats = guard.getStats();
      expect(stats.clientStats).toContainEqual(
        expect.objectContaining({
          id: 'socket:socket-123',
        })
      );
    });

    it('should extract userId from handshake query', () => {
      mockClient.handshake!.query.userId = 'user-from-query';

      guard.canActivate(mockContext);

      const stats = guard.getStats();
      expect(stats.clientStats).toContainEqual(
        expect.objectContaining({
          id: 'user:user-from-query',
        })
      );
    });
  });

  describe('cleanup', () => {
    it('should remove expired entries', () => {
      guard.canActivate(mockContext);

      // Advance past expiry
      jest.advanceTimersByTime(61000);

      // Trigger cleanup
      jest.advanceTimersByTime(60000);

      const stats = guard.getStats();
      expect(stats.totalClients).toBe(0);
    });

    it('should keep active entries', () => {
      guard.canActivate(mockContext);

      // Advance but not past expiry (only 30s, window is 60s)
      jest.advanceTimersByTime(30000);

      // Trigger cleanup without going past entry expiry
      // Total time is still only 30s, so entry should still be active
      const stats = guard.getStats();
      expect(stats.totalClients).toBe(1);
    });

    it('should run cleanup periodically', () => {
      guard.canActivate(mockContext);

      // Wait for entry to expire
      jest.advanceTimersByTime(61000);

      // Wait for cleanup interval
      jest.advanceTimersByTime(60000);

      const stats = guard.getStats();
      expect(stats.totalClients).toBe(0);
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', () => {
      guard.canActivate(mockContext);
      guard.canActivate(mockContext);
      guard.canActivate(mockContext);

      const stats = guard.getStats();

      expect(stats.totalClients).toBe(1);
      expect(stats.maxEventsPerMinute).toBe(10);
      expect(stats.clientStats).toHaveLength(1);
      expect(stats.clientStats[0]).toEqual({
        id: 'socket:socket-123',
        count: 3,
        remaining: 7,
      });
    });

    it('should return empty stats initially', () => {
      const stats = guard.getStats();

      expect(stats).toEqual({
        totalClients: 0,
        maxEventsPerMinute: 10,
        clientStats: [],
      });
    });

    it('should exclude expired entries from stats', () => {
      guard.canActivate(mockContext);

      // Advance past expiry
      jest.advanceTimersByTime(61000);

      const stats = guard.getStats();
      expect(stats.clientStats).toHaveLength(0);
    });

    it('should track multiple clients', () => {
      (mockClient as any).userId = 'user-1';
      guard.canActivate(mockContext);

      const mockClient2 = { ...mockClient, id: 'socket-456', userId: 'user-2' };
      mockContext.switchToWs = jest.fn().mockReturnValue({
        getClient: jest.fn().mockReturnValue(mockClient2),
      });
      guard.canActivate(mockContext);

      const stats = guard.getStats();
      expect(stats.totalClients).toBe(2);
      expect(stats.clientStats).toHaveLength(2);
    });
  });

  describe('resetClient', () => {
    it('should reset rate limit for specific client', () => {
      (mockClient as any).userId = 'user-1';

      // Use up limit
      for (let i = 0; i < 10; i++) {
        guard.canActivate(mockContext);
      }

      expect(guard.canActivate(mockContext)).toBe(false);

      // Reset the client
      guard.resetClient('user:user-1');

      // Should be allowed again
      expect(guard.canActivate(mockContext)).toBe(true);
    });

    it('should not affect other clients when resetting one', () => {
      (mockClient as any).userId = 'user-1';
      guard.canActivate(mockContext);

      const mockClient2 = { ...mockClient, id: 'socket-456', userId: 'user-2' };
      mockContext.switchToWs = jest.fn().mockReturnValue({
        getClient: jest.fn().mockReturnValue(mockClient2),
      });
      guard.canActivate(mockContext);

      guard.resetClient('user:user-1');

      const stats = guard.getStats();
      expect(stats.totalClients).toBe(1);
      expect(stats.clientStats[0].id).toBe('user:user-2');
    });
  });

  describe('resetAll', () => {
    it('should reset all rate limits', () => {
      guard.canActivate(mockContext);

      const mockClient2 = { ...mockClient, id: 'socket-456' };
      mockContext.switchToWs = jest.fn().mockReturnValue({
        getClient: jest.fn().mockReturnValue(mockClient2),
      });
      guard.canActivate(mockContext);

      guard.resetAll();

      const stats = guard.getStats();
      expect(stats.totalClients).toBe(0);
      expect(stats.clientStats).toHaveLength(0);
    });
  });

  describe('Warning threshold', () => {
    it('should log warning when approaching limit', () => {
      const logSpy = jest.spyOn((guard as any).logger, 'debug').mockImplementation();

      // Use 80% of limit (8 out of 10)
      for (let i = 0; i < 8; i++) {
        guard.canActivate(mockContext);
      }

      // Should log on 9th call (90% of limit)
      guard.canActivate(mockContext);

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('approaching rate limit')
      );

      logSpy.mockRestore();
    });

    it('should not log warning below threshold', () => {
      const logSpy = jest.spyOn((guard as any).logger, 'debug').mockImplementation();

      // Use 70% of limit
      for (let i = 0; i < 7; i++) {
        guard.canActivate(mockContext);
      }

      expect(logSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('approaching rate limit')
      );

      logSpy.mockRestore();
    });
  });

  describe('Configuration', () => {
    it('should use custom config values', () => {
      const customConfig = {
        get: jest.fn((key: string, defaultValue: any) => {
          const config: Record<string, any> = {
            'resourceLimits.websocket.rateLimit.maxEventsPerMinute': 50,
            'resourceLimits.websocket.rateLimit.windowMs': 30000,
          };
          return config[key] !== undefined ? config[key] : defaultValue;
        }),
      } as any;

      const customGuard = new WsRateLimitGuard(customConfig);
      const stats = customGuard.getStats();

      expect(stats.maxEventsPerMinute).toBe(50);
    });

    it('should use default values when config returns undefined', () => {
      const emptyConfig = {
        get: jest.fn((key: string, defaultValue: any) => defaultValue),
      } as any;

      const customGuard = new WsRateLimitGuard(emptyConfig);
      const stats = customGuard.getStats();

      expect(stats.maxEventsPerMinute).toBe(100); // Default value
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid successive calls', () => {
      for (let i = 0; i < 100; i++) {
        guard.canActivate(mockContext);
      }

      const stats = guard.getStats();
      // Should have counted all attempts
      expect(stats.clientStats[0].count).toBeGreaterThan(10);
    });

    it('should calculate correct retry time', () => {
      for (let i = 0; i < 11; i++) {
        guard.canActivate(mockContext);
      }

      const emitCalls = (mockClient.emit as jest.Mock).mock.calls;
      const errorCall = emitCalls.find(call => call[0] === 'error');
      expect(errorCall[1].retryAfter).toBeGreaterThan(0);
      expect(errorCall[1].retryAfter).toBeLessThanOrEqual(60);
    });

    it('should handle null userId', () => {
      (mockClient as any).userId = null;

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should handle empty handshake query', () => {
      const clientWithEmptyQuery = {
        ...mockClient,
        handshake: {
          query: {},
        } as any,
      };

      mockContext.switchToWs = jest.fn().mockReturnValue({
        getClient: jest.fn().mockReturnValue(clientWithEmptyQuery),
      });

      const result = guard.canActivate(mockContext);
      expect(result).toBe(true);
    });
  });
});
