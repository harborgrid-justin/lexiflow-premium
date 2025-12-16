import { ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WsConnectionLimitGuard } from '../ws-connection-limit.guard';
import { Socket } from 'socket.io';

describe('WsConnectionLimitGuard', () => {
  let guard: WsConnectionLimitGuard;
  let configService: ConfigService;
  let mockClient: Partial<Socket>;
  let mockContext: ExecutionContext;

  beforeEach(() => {
    // Mock ConfigService
    configService = {
      get: jest.fn((key: string, defaultValue: any) => {
        const config: Record<string, any> = {
          'resourceLimits.websocket.maxConnectionsPerUser': 3,
          'resourceLimits.websocket.maxGlobalConnections': 10,
        };
        return config[key] !== undefined ? config[key] : defaultValue;
      }),
    } as any;

    guard = new WsConnectionLimitGuard(configService);

    // Mock Socket.io client
    mockClient = {
      id: 'socket-123',
      emit: jest.fn(),
      on: jest.fn(),
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

  describe('canActivate', () => {
    it('should allow connection within user limit', () => {
      (mockClient as any).userId = 'user-1';

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(mockClient.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
    });

    it('should allow multiple connections from same user up to limit', () => {
      (mockClient as any).userId = 'user-1';

      expect(guard.canActivate(mockContext)).toBe(true);
      expect(guard.canActivate(mockContext)).toBe(true);
      expect(guard.canActivate(mockContext)).toBe(true);

      const stats = guard.getStats();
      expect(stats.userConnectionCounts['user-1']).toBe(3);
    });

    it('should reject connection exceeding user limit', () => {
      (mockClient as any).userId = 'user-1';

      // Allow 3 connections (the limit)
      guard.canActivate(mockContext);
      guard.canActivate(mockContext);
      guard.canActivate(mockContext);

      // 4th connection should be rejected
      const result = guard.canActivate(mockContext);

      expect(result).toBe(false);
      expect(mockClient.emit).toHaveBeenCalledWith('error', {
        code: 'USER_CONNECTION_LIMIT_EXCEEDED',
        message: expect.stringContaining('3 concurrent connections'),
      });
    });

    it('should track connections per user correctly', () => {
      (mockClient as any).userId = 'user-1';
      guard.canActivate(mockContext);

      const mockClient2 = { ...mockClient, id: 'socket-456', userId: 'user-2' };
      mockContext.switchToWs = jest.fn().mockReturnValue({
        getClient: jest.fn().mockReturnValue(mockClient2),
      });
      guard.canActivate(mockContext);

      const stats = guard.getStats();
      expect(stats.uniqueUsers).toBe(2);
      expect(stats.userConnectionCounts['user-1']).toBe(1);
      expect(stats.userConnectionCounts['user-2']).toBe(1);
    });

    it('should allow anonymous connections without user tracking', () => {
      // No userId set
      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
      const stats = guard.getStats();
      expect(stats.uniqueUsers).toBe(0);
    });

    it('should reject connection when global limit is reached', () => {
      // Fill up to global limit with different users
      for (let i = 0; i < 10; i++) {
        const client = { ...mockClient, id: `socket-${i}`, userId: `user-${i}` };
        mockContext.switchToWs = jest.fn().mockReturnValue({
          getClient: jest.fn().mockReturnValue(client),
        });
        guard.canActivate(mockContext);
      }

      // Next connection should be rejected
      const result = guard.canActivate(mockContext);

      expect(result).toBe(false);
      expect(mockClient.emit).toHaveBeenCalledWith('error', {
        code: 'CONNECTION_LIMIT_EXCEEDED',
        message: expect.stringContaining('Server connection limit reached'),
      });
    });

    it('should extract userId from handshake query if not on client', () => {
      mockClient.handshake!.query.userId = 'user-from-query';

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
      const stats = guard.getStats();
      expect(stats.userConnectionCounts['user-from-query']).toBe(1);
    });
  });

  describe('handleDisconnect', () => {
    it('should decrement global count on disconnect', () => {
      (mockClient as any).userId = 'user-1';
      guard.canActivate(mockContext);

      const disconnectHandler = (mockClient.on as jest.Mock).mock.calls[0][1];
      disconnectHandler();

      const stats = guard.getStats();
      expect(stats.globalConnections).toBe(0);
    });

    it('should decrement user count on disconnect', () => {
      (mockClient as any).userId = 'user-1';
      guard.canActivate(mockContext);

      const disconnectHandler = (mockClient.on as jest.Mock).mock.calls[0][1];
      disconnectHandler();

      const stats = guard.getStats();
      expect(stats.userConnectionCounts['user-1']).toBeUndefined();
    });

    it('should remove user entry when count reaches zero', () => {
      (mockClient as any).userId = 'user-1';
      guard.canActivate(mockContext);
      guard.canActivate(mockContext);

      let stats = guard.getStats();
      expect(stats.userConnectionCounts['user-1']).toBe(2);

      // Disconnect once
      const disconnectHandler = (mockClient.on as jest.Mock).mock.calls[0][1];
      disconnectHandler();

      stats = guard.getStats();
      expect(stats.userConnectionCounts['user-1']).toBe(1);

      // Disconnect again
      disconnectHandler();

      stats = guard.getStats();
      expect(stats.userConnectionCounts['user-1']).toBeUndefined();
    });

    it('should handle disconnect for anonymous user', () => {
      guard.canActivate(mockContext);

      const disconnectHandler = (mockClient.on as jest.Mock).mock.calls[0][1];
      expect(() => disconnectHandler()).not.toThrow();

      const stats = guard.getStats();
      expect(stats.globalConnections).toBe(0);
    });

    it('should not decrement below zero', () => {
      const disconnectHandler = (mockClient.on as jest.Mock).mock.calls[0]?.[1];
      if (disconnectHandler) {
        disconnectHandler();
        disconnectHandler();
      }

      const stats = guard.getStats();
      expect(stats.globalConnections).toBe(0);
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', () => {
      (mockClient as any).userId = 'user-1';
      guard.canActivate(mockContext);

      const stats = guard.getStats();

      expect(stats).toEqual({
        globalConnections: 1,
        maxGlobalConnections: 10,
        uniqueUsers: 1,
        userConnectionCounts: {
          'user-1': 1,
        },
      });
    });

    it('should return empty stats initially', () => {
      const stats = guard.getStats();

      expect(stats).toEqual({
        globalConnections: 0,
        maxGlobalConnections: 10,
        uniqueUsers: 0,
        userConnectionCounts: {},
      });
    });

    it('should reflect multiple users correctly', () => {
      (mockClient as any).userId = 'user-1';
      guard.canActivate(mockContext);
      guard.canActivate(mockContext);

      const mockClient2 = { ...mockClient, id: 'socket-456', userId: 'user-2' };
      mockContext.switchToWs = jest.fn().mockReturnValue({
        getClient: jest.fn().mockReturnValue(mockClient2),
      });
      guard.canActivate(mockContext);

      const stats = guard.getStats();

      expect(stats.globalConnections).toBe(3);
      expect(stats.uniqueUsers).toBe(2);
      expect(stats.userConnectionCounts).toEqual({
        'user-1': 2,
        'user-2': 1,
      });
    });
  });

  describe('Configuration', () => {
    it('should use config values from ConfigService', () => {
      const customConfig = {
        get: jest.fn((key: string, defaultValue: any) => {
          const config: Record<string, any> = {
            'resourceLimits.websocket.maxConnectionsPerUser': 5,
            'resourceLimits.websocket.maxGlobalConnections': 1000,
          };
          return config[key] !== undefined ? config[key] : defaultValue;
        }),
      } as any;

      const customGuard = new WsConnectionLimitGuard(customConfig);
      const stats = customGuard.getStats();

      expect(stats.maxGlobalConnections).toBe(1000);
    });

    it('should use default values when config returns undefined', () => {
      const emptyConfig = {
        get: jest.fn((key: string, defaultValue: any) => defaultValue),
      } as any;

      const customGuard = new WsConnectionLimitGuard(emptyConfig);
      const stats = customGuard.getStats();

      expect(stats.maxGlobalConnections).toBe(10000); // Default value
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid connection attempts', () => {
      (mockClient as any).userId = 'user-1';

      for (let i = 0; i < 5; i++) {
        guard.canActivate(mockContext);
      }

      const stats = guard.getStats();
      expect(stats.userConnectionCounts['user-1']).toBe(3); // Only 3 allowed
      expect(stats.globalConnections).toBe(3);
    });

    it('should handle concurrent connections from multiple users', () => {
      const users = ['user-1', 'user-2', 'user-3', 'user-4'];

      users.forEach(userId => {
        const client = { ...mockClient, userId, id: `socket-${userId}` };
        mockContext.switchToWs = jest.fn().mockReturnValue({
          getClient: jest.fn().mockReturnValue(client),
        });
        guard.canActivate(mockContext);
      });

      const stats = guard.getStats();
      expect(stats.uniqueUsers).toBe(4);
      expect(stats.globalConnections).toBe(4);
    });

    it('should handle null userId gracefully', () => {
      (mockClient as any).userId = null;

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });
  });
});
